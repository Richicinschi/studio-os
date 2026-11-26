// Writes a person's contact.vcf (vCard 3.0, UTF-8, CRLF) and the QR code (qr.svg) that saves it to a phone.
// Usage: node vcard-qr.mjs <contact.json> --out <dir> [--ec L|M|Q|H] [--mask 0-7]
// Exit codes: 0 written, 1 the contact is invalid, not UTF-8 or too large for a card, 2 a usage, file or parse error.
// Offline: reads only the contact file, writes only <dir>/contact.vcf and <dir>/qr.svg.
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { encodeQR, qrSvg, QRTooLargeError } from './qr.mjs';

export class ContactError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContactError';
    this.code = 'INVALID';
  }
}

const FIELDS = ['given', 'family', 'org', 'title', 'phones', 'email', 'url', 'address'];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^[0-9+()\-. ]+$/;
const NOT_UTF8 = 'contact.json is not UTF-8: save it as UTF-8';

// The text of contact.json. A file saved as UTF-16 (byte-order mark FF FE or FE FF) or in a Windows code page
// (bytes that decode to U+FFFD) is refused: decoded anyway, its letters would reach the QR as replacement marks.
export function contactText(bytes) {
  if (bytes.length >= 2 && ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff))) {
    throw new ContactError(NOT_UTF8);
  }
  const text = Buffer.from(bytes).toString('utf8');
  if (text.includes('�')) throw new ContactError(NOT_UTF8);
  return text;
}

// Parses and checks contact.json text. A leading byte-order mark (Windows Notepad) is dropped.
export function readContact(text) {
  const raw = JSON.parse(text.replace(/^\uFEFF/, ''));
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ContactError('contact: the file must hold one JSON object');
  }
  for (const key of Object.keys(raw)) {
    if (!FIELDS.includes(key)) throw new ContactError(`${key}: unknown field; use ${FIELDS.join(', ')}`);
  }
  const contact = {};
  for (const key of FIELDS) {
    if (raw[key] === undefined) continue;
    if (key === 'phones') continue;
    if (typeof raw[key] !== 'string') throw new ContactError(`${key}: must be text`);
    contact[key] = raw[key];
  }
  if (!contact.given || !contact.given.trim()) throw new ContactError('given: missing or empty');
  if (raw.phones !== undefined) {
    const phones = typeof raw.phones === 'string' ? [raw.phones] : raw.phones;
    if (!Array.isArray(phones)) throw new ContactError('phones: must be text or a list of text');
    for (const phone of phones) {
      if (typeof phone !== 'string' || !PHONE.test(phone)) {
        throw new ContactError(`phones: ${JSON.stringify(phone)} may hold only digits, spaces and + ( ) - .`);
      }
      if (!/\d/.test(phone)) throw new ContactError(`phones: ${JSON.stringify(phone)} has no digit`);
    }
    contact.phones = phones;
  }
  if (contact.email !== undefined && !EMAIL.test(contact.email)) {
    throw new ContactError(`email: ${JSON.stringify(contact.email)} is not an email address`);
  }
  if (contact.url !== undefined && !/^https?:\/\//.test(contact.url)) {
    throw new ContactError(`url: ${JSON.stringify(contact.url)} must start with http:// or https://`);
  }
  return contact;
}

export function escapeValue(s) {
  return s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r\n|\r|\n/g, '\\n');
}

// A URL keeps its commas and semicolons: some phones would keep a "\," inside the link.
export function escapeUrl(s) {
  return s.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n');
}

// vCard 3.0 text: one line per given field, CRLF line ends, every value escaped (the URL by escapeUrl).
export function buildVCard(c) {
  const e = escapeValue;
  const family = c.family ?? '';
  const out = ['BEGIN:VCARD', 'VERSION:3.0', `N:${e(family)};${e(c.given)};;;`, `FN:${e(family ? `${c.given} ${family}` : c.given)}`];
  if (c.org) out.push(`ORG:${e(c.org)}`);
  if (c.title) out.push(`TITLE:${e(c.title)}`);
  for (const phone of c.phones ?? []) out.push(`TEL;TYPE=VOICE:${e(phone)}`);
  if (c.email) out.push(`EMAIL;TYPE=INTERNET:${e(c.email)}`);
  if (c.url) out.push(`URL:${escapeUrl(c.url)}`);
  if (c.address) out.push(`ADR;TYPE=WORK:;;${e(c.address)};;;;`);
  out.push('END:VCARD');
  return `${out.join('\r\n')}\r\n`;
}

const USAGE = 'usage: node vcard-qr.mjs <contact.json> --out <dir> [--ec L|M|Q|H] [--mask 0-7]';

class UsageError extends Error {}

function parse(argv) {
  let values, positionals;
  try {
    ({ values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: { out: { type: 'string' }, ec: { type: 'string' }, mask: { type: 'string' } },
    }));
  } catch (err) {
    throw new UsageError(err.message);
  }
  if (positionals.length !== 1) throw new UsageError('give exactly one contact.json');
  if (!values.out) throw new UsageError('--out <dir> is required');
  const ec = values.ec ?? 'M';
  if (!/^[LMQH]$/.test(ec)) throw new UsageError('--ec must be L, M, Q or H');
  if (values.mask !== undefined && !/^[0-7]$/.test(values.mask)) throw new UsageError('--mask must be 0 to 7');
  return { file: positionals[0], out: values.out, ec, mask: values.mask === undefined ? undefined : Number(values.mask) };
}

export function main(argv) {
  let args;
  try {
    args = parse(argv);
  } catch (err) {
    process.stderr.write(`${err.message}\n${USAGE}\n`);
    return 2;
  }

  let bytes;
  try {
    bytes = readFileSync(args.file);
  } catch (err) {
    process.stderr.write(`cannot read ${args.file}: ${err.code ?? err.message}\n`);
    return 2;
  }

  let vcf, qr;
  try {
    vcf = buildVCard(readContact(contactText(bytes)));
    // The QR holds the vCard's UTF-8 bytes in byte mode, with no ECI segment.
    qr = encodeQR(new TextEncoder().encode(vcf), { ec: args.ec, mask: args.mask });
  } catch (err) {
    if (err instanceof ContactError || err instanceof QRTooLargeError) {
      process.stderr.write(`${err.message}\n`);
      return 1;
    }
    if (err instanceof SyntaxError) {
      process.stderr.write(`cannot parse ${args.file}: ${err.message}\n`);
      return 2;
    }
    throw err;
  }

  try {
    mkdirSync(args.out, { recursive: true });
    writeFileSync(path.join(args.out, 'contact.vcf'), vcf, 'utf8');
    writeFileSync(path.join(args.out, 'qr.svg'), qrSvg(qr), 'utf8');
  } catch (err) {
    process.stderr.write(`cannot write to ${args.out}: ${err.code ?? err.message}\n`);
    return 2;
  }

  // Smallest width at 0.4 mm a module, quiet zone included: (size + 8) x 0.4 mm. (size + 8) * 4 is that width
  // in tenths of a millimetre, a whole number, so dividing it by 10 is exact where multiplying by 0.4 is not.
  const width = ((qr.size + 8) * 4) / 10;
  process.stdout.write([
    `version: ${qr.version}`,
    `modules: ${qr.size} plus a 4-module quiet zone`,
    `error correction: ${qr.ec}`,
    `smallest printed width: ${width} mm`,
  ].join('\n') + '\n');
  return 0;
}

const realPath = (p) => { try { return realpathSync(p); } catch { return null; } };
if (process.argv[1] && realPath(process.argv[1]) === realPath(fileURLToPath(import.meta.url))) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    // Anything unforeseen is reported in one line, without a stack trace, as exit 2.
    process.stderr.write(`vcard-qr: ${String(err?.message ?? err).split('\n')[0]}\n`);
    process.exitCode = 2;
  }
}
