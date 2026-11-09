// tools/upload-bundle.mjs
// Build a claude.ai upload for one domain: node tools/upload-bundle.mjs <pack-id> --out <folder>
// The zip holds the pack's entry (SKILL.md) and its skills, under a folder named after the pack.
// Agents and stubs are left out: claude.ai has no agents folder, and a stub only points at a
// Claude Code install. It runs on the adopter's machine from the kit folder, reads only
// catalog/packs/<id>/ and writes only the zip.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

export function bundleEntries(packDir, id) {
  const entry = path.join(packDir, 'SKILL.md');
  if (!fs.existsSync(entry)) throw new Error(`${packDir}: no SKILL.md (is "${id}" a domain this kit ships? see catalog/FEATURES.md)`);
  const entries = [{ name: `${id}/SKILL.md`, data: fs.readFileSync(entry) }];
  const skills = path.join(packDir, 'skills');
  for (const f of walk(skills).sort()) {
    const rel = path.relative(skills, f).split(path.sep).join('/');
    entries.push({ name: `${id}/skills/${rel}`, data: fs.readFileSync(f) });
  }
  return entries;
}

// A stored (uncompressed) ZIP with a fixed timestamp, so the same input gives the same bytes.
const DOS_TIME = 0;
const DOS_DATE = 0x0021; // 1980-01-01
const UTF8_FLAG = 0x0800;

export function writeZip(entries, outFile) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const crc = zlib.crc32(e.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(UTF8_FLAG, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(e.data.length, 18);
    local.writeUInt32LE(e.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(UTF8_FLAG, 8);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(e.data.length, 20);
    central.writeUInt32LE(e.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, e.data);
    centrals.push(central, name);
    offset += local.length + name.length + e.data.length;
  }
  const centralBytes = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.concat([...locals, centralBytes, end]));
}

export function main(argv) {
  let packs = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'catalog', 'packs');
  let out = null;
  let id = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out' && argv[i + 1]) out = path.resolve(argv[++i]);
    else if (argv[i] === '--packs' && argv[i + 1]) packs = path.resolve(argv[++i]);
    else if (!argv[i].startsWith('--') && !id) id = argv[i];
    else { id = null; break; }
  }
  if (!id || !out || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    console.error('usage: node tools/upload-bundle.mjs <pack-id> --out <folder>');
    return 2;
  }
  try {
    const entries = bundleEntries(path.join(packs, id), id);
    const file = path.join(out, `${id}.zip`);
    writeZip(entries, file);
    console.log(`wrote ${file} (${entries.length} files)`);
    return 0;
  } catch (e) {
    console.error(e.message);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
