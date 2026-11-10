'use strict';
// Brainstorm companion server.
//
// A small local web server behind the visual companion. The agent drops HTML files into <session>/content. This
// process serves the newest one, tells every open page to reload when a screen appears or changes, and keeps the
// viewer's clicks in <session>/state/events. It speaks plain HTTP plus a hand-written WebSocket (RFC 6455) and
// never makes an outbound request: the only sockets it opens are its own listener and, on request, the
// viewer's browser.
//
// start-server.sh sets these environment variables:
//   BRAINSTORM_DIR, BRAINSTORM_HOST, BRAINSTORM_URL_HOST, BRAINSTORM_PORT, BRAINSTORM_PORT_FILE,
//   BRAINSTORM_TOKEN, BRAINSTORM_TOKEN_FILE, BRAINSTORM_OWNER_PID, BRAINSTORM_IDLE_TIMEOUT_MS,
//   BRAINSTORM_LIFECYCLE_CHECK_MS, BRAINSTORM_OPEN

const { createHash, randomBytes, randomInt, timingSafeEqual } = require('node:crypto');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const childProcess = require('node:child_process');

const noop = () => {};

// Runs `action`, hands back its result, and turns any throw into `undefined`.
function quietly(action) {
  try {
    return action();
  } catch (err) {
    return undefined;
  }
}

// ## WebSocket codec

const MAX_FRAME_PAYLOAD_BYTES = 10 * 1024 * 1024;
const OPCODES = { TEXT: 1, CLOSE: 8, PING: 9, PONG: 10 };
const FRAME_TOO_BIG = 'frame payload is over the size limit';
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // fixed by RFC 6455

function computeAcceptKey(clientKey) {
  return createHash('sha1').update(String(clientKey) + WS_GUID).digest('base64');
}

// A frame the server sends: final, unmasked.
function encodeFrame(opcode, payload) {
  const size = payload.length;
  const first = 0x80 | opcode;
  if (size <= 125) {
    return Buffer.concat([Buffer.from([first, size]), payload]);
  }
  if (size <= 0xffff) {
    const head = Buffer.from([first, 126, 0, 0]);
    head.writeUInt16BE(size, 2);
    return Buffer.concat([head, payload]);
  }
  const head = Buffer.alloc(10);
  head[0] = first;
  head[1] = 127;
  head.writeBigUInt64BE(BigInt(size), 2);
  return Buffer.concat([head, payload]);
}

// Reads the first client frame in `bytes`. Gives null while the frame is still incomplete, else
// { opcode, payload, bytesConsumed }. Throws for an unmasked frame or one over the size limit.
function decodeFrame(bytes) {
  if (bytes.length < 2) return null;
  const opcode = bytes[0] & 0x0f;
  if ((bytes[1] & 0x80) === 0) throw new Error('client frame is not masked');

  let size = bytes[1] & 0x7f;
  let maskAt = 2;
  if (size === 126) {
    if (bytes.length < 4) return null;
    size = bytes.readUInt16BE(2);
    maskAt = 4;
  } else if (size === 127) {
    if (bytes.length < 10) return null;
    const declared = bytes.readBigUInt64BE(2);
    if (declared > BigInt(MAX_FRAME_PAYLOAD_BYTES)) throw new Error(FRAME_TOO_BIG);
    size = Number(declared);
    maskAt = 10;
  }
  if (size > MAX_FRAME_PAYLOAD_BYTES) throw new Error(FRAME_TOO_BIG);

  const dataAt = maskAt + 4;
  const total = dataAt + size;
  if (bytes.length < total) return null;

  const payload = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    payload[i] = bytes[dataAt + i] ^ bytes[maskAt + (i % 4)];
  }
  return { opcode, payload, bytesConsumed: total };
}

// ## Settings, read once at start

const LOOPBACK = '127.0.0.1';
const FALLBACK_SESSION_DIR = '/tmp/brainstorm';

function positiveOr(raw, fallback) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

// Any port in the dynamic range 49152 to 65534.
const randomHighPort = () => randomInt(49152, 65535);

const restrictToOwner = (file) => quietly(() => fs.chmodSync(file, 0o600));
const readSavedLine = (file) => quietly(() => fs.readFileSync(file, 'utf8').trim());

// Port order: BRAINSTORM_PORT, the port this project used last time (so an open tab finds the restarted server
// again), then any high port.
function pickPort(env, portFile) {
  if (env.BRAINSTORM_PORT) return Number(env.BRAINSTORM_PORT);
  const saved = portFile ? Number(readSavedLine(portFile)) : NaN;
  if (Number.isInteger(saved) && saved > 1023 && saved < 65536) return saved;
  return randomHighPort();
}

const makeKey = () => Array.from(randomBytes(32), (b) => b.toString(16).padStart(2, '0')).join('');
const KEY_SHAPE = /^[\da-f]{32,}$/i;

// Key order: BRAINSTORM_TOKEN, the saved key file, a fresh random key. `source` decides what happens if the
// wanted port turns out to be taken.
function pickKey(env, keyFile) {
  if (env.BRAINSTORM_TOKEN) return { value: env.BRAINSTORM_TOKEN, source: 'env' };
  const saved = keyFile ? readSavedLine(keyFile) : undefined;
  if (saved && KEY_SHAPE.test(saved)) {
    restrictToOwner(keyFile);
    return { value: saved, source: 'file' };
  }
  return { value: makeKey(), source: 'generated' };
}

function readSettings(env) {
  const sessionDir = env.BRAINSTORM_DIR || FALLBACK_SESSION_DIR;
  const bindHost = env.BRAINSTORM_HOST || LOOPBACK;
  const portFile = env.BRAINSTORM_PORT_FILE || null;
  const keyFile = env.BRAINSTORM_TOKEN_FILE || null;
  const key = pickKey(env, keyFile);
  const port = pickPort(env, portFile);
  return {
    bindHost,
    linkHost: env.BRAINSTORM_URL_HOST || (bindHost === LOOPBACK ? 'localhost' : bindHost),
    contentDir: path.join(sessionDir, 'content'),
    stateDir: path.join(sessionDir, 'state'),
    portFile,
    keyFile,
    port,
    key: key.value,
    keySource: key.source,
    cookieName: `brainstorm-key-${port}`, // renamed after binding, once the real port is known
    ownerPid: env.BRAINSTORM_OWNER_PID ? Number(env.BRAINSTORM_OWNER_PID) : null,
    // Stop after this long with no authorized request, event or screen change.
    idleMs: positiveOr(env.BRAINSTORM_IDLE_TIMEOUT_MS, 4 * 60 * 60 * 1000),
    // How often the watchdog looks at the owner process and the idle clock (tests make it short).
    watchdogMs: positiveOr(env.BRAINSTORM_LIFECYCLE_CHECK_MS, 60 * 1000),
    wantsBrowser: Boolean(env.BRAINSTORM_OPEN)
  };
}

const cfg = readSettings(process.env);

// The text in the page header. Plain local text: no image, no link, nothing is fetched for it. The frame
// template's top bar carries the same line.
const BRAND_TEXT = 'Studio brainstorm companion, local only';

const CONTENT_TYPES = new Map([
  ['.html', 'text/html'],
  ['.css', 'text/css'],
  ['.js', 'application/javascript'],
  ['.json', 'application/json'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.svg', 'image/svg+xml']
]);

// One line of JSON on stdout. The agent reads these lines from the log.
const logLine = (record) => process.stdout.write(`${JSON.stringify(record)}\n`);
const emit = (type, fields) => logLine({ type, ...fields });

// ## Pages

const readHere = (name) => fs.readFileSync(path.join(__dirname, name), 'utf8');
const FRAME_HTML = readHere('frame-template.html');
const HELPER_TAG = `<script>\n${readHere('helper.js')}\n</script>`;
const BRAND_HTML = `<div class="brand"><span class="brand-text">${BRAND_TEXT}</span></div>`;

// A minimal standalone page for the notices the server writes itself.
function plainPage(title, css, body) {
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    `<title>${title}</title>`,
    '<meta http-equiv="content-type" content="text/html; charset=utf-8">',
    `<style>${css}</style>`,
    '</head>',
    `<body>${body}</body>`,
    '</html>'
  ].join('\n');
}

const NOTICE_CSS = `
body { margin: 0 auto; padding: 2rem; max-width: 50rem; font: 16px/1.5 system-ui, sans-serif; }
h1 { color: #2b2b2b; }
p { color: #6b6b6b; }
code { padding: 0 0.3em; border-radius: 4px; background: #eee; }
.brand { margin-bottom: 1.5rem; color: #6b6b6b; font-size: 0.9rem; }`;

const EMPTY_PAGE = plainPage(
  'Brainstorm Companion',
  NOTICE_CSS,
  `${BRAND_HTML}<main><h1>Brainstorm companion</h1>\n<p>Nothing to show yet. The agent will put a screen here.</p></main>`
);

const KEY_MISSING_PAGE = plainPage(
  'Session key required',
  NOTICE_CSS,
  '<h1>Session key required</h1>\n<p>Open the whole address your coding agent printed. It ends in ' +
  '<code>?key=&#8230;</code>. Copy all of it and try again.</p>'
);

// The page-side name of the slot that holds the key (helper.js reads the same slot).
const KEY_SLOT = 'brainstorm-session-key';

// First stop after a keyed visit: keep the key where helper.js can find it, then move to the plain address.
function keyHandoffPage(key) {
  return plainPage(
    'Opening Brainstorm Companion',
    '',
    `<script>
(function () {
  var slot = ${JSON.stringify(KEY_SLOT)};
  var key = ${JSON.stringify(String(key))};
  try { window.sessionStorage.setItem(slot, key); } catch (err) {}
  window.location.replace('/');
})();
</script>`
  );
}

function isCompleteDocument(html) {
  const start = html.trimStart().slice(0, 9).toLowerCase();
  return start.startsWith('<!doctype') || start.startsWith('<html');
}

function insertHelper(html) {
  const at = html.indexOf('</body>');
  return at < 0 ? html + HELPER_TAG : `${html.slice(0, at)}${HELPER_TAG}\n${html.slice(at)}`;
}

// ## Files in the content folder

// Serve only ordinary files that really sit in the content folder: no links, no hard-linked copies of something
// elsewhere, nothing that resolves outside it.
function isServable(file) {
  const info = quietly(() => fs.lstatSync(file));
  if (!info || !info.isFile() || info.isSymbolicLink() || info.nlink !== 1) return false;
  const inside = quietly(() => fs.realpathSync(file).startsWith(fs.realpathSync(cfg.contentDir) + path.sep));
  return inside === true;
}

const isScreenFile = (name) => name.endsWith('.html') && !name.startsWith('.');

function newestScreen() {
  const candidates = fs.readdirSync(cfg.contentDir)
    .filter(isScreenFile)
    .map((name) => path.join(cfg.contentDir, name))
    .filter(isServable)
    .map((file) => ({ file, modified: fs.statSync(file).mtimeMs }));
  candidates.sort((x, y) => y.modified - x.modified);
  return candidates.length ? candidates[0].file : null;
}

// ## Who may talk to the server

function sameText(given, expected) {
  const toBytes = (value) => Buffer.from(String(value));
  const left = toBytes(given);
  const right = toBytes(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function cookiesOf(req) {
  const jar = {};
  for (const piece of String(req.headers.cookie || '').split(';')) {
    const [name, ...valueParts] = piece.split('=');
    if (name.trim() && valueParts.length) jar[name.trim()] = valueParts.join('=').trim();
  }
  return jar;
}

function parseTarget(target) {
  const mark = target.indexOf('?');
  if (mark < 0) return { pathname: target, query: new URLSearchParams() };
  return { pathname: target.slice(0, mark), query: new URLSearchParams(target.slice(mark + 1)) };
}

// The key may arrive in the query string or in the session cookie. If a key is in the query, only it counts:
// a wrong one is not rescued by a good cookie.
function isAuthorized(req) {
  const offered = parseTarget(req.url).query.get('key');
  if (offered !== null) return offered !== '' && sameText(offered, cfg.key);
  const cookie = cookiesOf(req)[cfg.cookieName];
  return Boolean(cookie) && sameText(cookie, cfg.key);
}

const SAFETY_HEADERS = [
  ['Referrer-Policy', 'no-referrer'],
  ['Cache-Control', 'no-store'],
  ['X-Frame-Options', 'DENY'],
  ['Content-Security-Policy', "frame-ancestors 'none'"],
  ['Cross-Origin-Resource-Policy', 'same-origin']
];

function headersFor(contentType) {
  const headers = Object.fromEntries(SAFETY_HEADERS);
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

// A browser attaches Origin to a WebSocket handshake. It has to be this very server, or a page from another
// site could reach localhost. A client without an Origin (a script, a test) passes.
function originAllowed(req) {
  const { origin, host } = req.headers;
  if (!origin) return true;
  return host !== undefined && origin === `http://${host}`;
}

// ## Activity clock

let lastTouch = Date.now();
const touch = () => {
  lastTouch = Date.now();
};

// ## HTTP

function reply(res, status, contentType, body) {
  res.writeHead(status, headersFor(contentType));
  res.end(body);
}

const replyHtml = (res, status, html) => reply(res, status, 'text/html; charset=utf-8', html);
const replyMissing = (res) => reply(res, 404, null, 'Not found');

function showCurrentScreen(res) {
  const file = newestScreen();
  let html = EMPTY_PAGE;
  if (file) {
    const source = fs.readFileSync(file, 'utf-8');
    html = isCompleteDocument(source) ? source : FRAME_HTML.split('<!-- CONTENT -->').join(source);
  }
  replyHtml(res, 200, insertHelper(html));
}

const ASSET_PREFIX = '/files/';

function sendAsset(res, pathname) {
  const name = path.basename(pathname.slice(ASSET_PREFIX.length));
  const file = path.join(cfg.contentDir, name);
  // The bare prefix would point at the folder itself, and a dotfile is never an asset.
  if (name === '' || name.startsWith('.') || !isServable(file)) {
    replyMissing(res);
    return;
  }
  const type = CONTENT_TYPES.get(path.extname(file).toLowerCase()) || 'application/octet-stream';
  reply(res, 200, type, fs.readFileSync(file));
}

function serve(req, res) {
  const allowed = isAuthorized(req);
  if (!allowed) {
    replyHtml(res, 403, KEY_MISSING_PAGE);
    return;
  }
  touch();

  // The cookie lets /files/* and later reloads authorize without the key in the address.
  res.setHeader('Set-Cookie', `${cfg.cookieName}=${cfg.key}; HttpOnly; SameSite=Strict; Path=/`);

  const { pathname, query } = parseTarget(req.url);
  if (req.method !== 'GET') {
    replyMissing(res);
    return;
  }
  if (pathname === '/') {
    const offered = query.get('key');
    if (offered && sameText(offered, cfg.key)) replyHtml(res, 200, keyHandoffPage(offered));
    else showCurrentScreen(res);
    return;
  }
  if (pathname.startsWith(ASSET_PREFIX)) sendAsset(res, pathname);
  else replyMissing(res);
}

// ## WebSocket connections

const openPages = new Set();

function parseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

// A message from a page: log it, and keep it in state/events when it names a choice.
function receive(text) {
  const parsed = parseJson(text);
  if (!parsed.ok) {
    console.error('Could not read a message from a page:', parsed.reason);
    return;
  }
  const event = parsed.value;
  touch();
  logLine(Object.assign({ source: 'user-event' }, event));
  const choiceMade = Boolean(event && event.choice);
  if (choiceMade) {
    fs.appendFileSync(path.join(cfg.stateDir, 'events'), `${JSON.stringify(event)}\n`);
  }
}

function closeFrame(statusCode) {
  const body = Buffer.alloc(statusCode ? 2 : 0);
  if (statusCode) body.writeUInt16BE(statusCode);
  return encodeFrame(OPCODES.CLOSE, body);
}

function hangUp(socket, statusCode) {
  socket.end(closeFrame(statusCode));
  openPages.delete(socket);
}

function acceptUpgrade(req, socket) {
  const { 'sec-websocket-key': clientKey } = req.headers;
  const refused = !clientKey || !originAllowed(req) || !isAuthorized(req);
  if (refused) {
    socket.destroy();
    return;
  }
  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${computeAcceptKey(clientKey)}`,
    '',
    ''
  ].join('\r\n'));
  openPages.add(socket);

  let unread = Buffer.alloc(0);
  const onBytes = (bytes) => {
    unread = Buffer.concat([unread, bytes]);
    while (unread.length > 0) {
      let frame;
      try {
        frame = decodeFrame(unread);
      } catch (err) {
        hangUp(socket);
        return;
      }
      if (frame === null) return; // wait for the rest
      unread = unread.subarray(frame.bytesConsumed);

      if (frame.opcode === OPCODES.TEXT) {
        receive(frame.payload.toString());
      } else if (frame.opcode === OPCODES.PING) {
        socket.write(encodeFrame(OPCODES.PONG, frame.payload));
      } else if (frame.opcode === OPCODES.CLOSE) {
        hangUp(socket);
        return;
      } else if (frame.opcode !== OPCODES.PONG) {
        hangUp(socket, 1003); // binary and split frames are not supported
        return;
      }
    }
  };
  socket.on('data', onBytes);
  for (const ending of ['close', 'error']) socket.on(ending, () => openPages.delete(socket));
}

function notifyPages(message) {
  const payload = Buffer.from(JSON.stringify(message));
  const frame = encodeFrame(OPCODES.TEXT, payload);
  for (const socket of [...openPages]) {
    const written = quietly(() => socket.write(frame));
    if (written === undefined) openPages.delete(socket);
  }
}

// ## Opening the viewer's browser

function sessionLink() {
  const host = String(cfg.linkHost);
  const shown = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
  return `http://${shown}:${cfg.port}/?key=${cfg.key}`;
}

// The program that opens a URL on this system, or null when there is no desktop to open it on.
function browserLauncherForPlatform(url, options = {}) {
  const platform = options.platform || process.platform;
  const release = options.osRelease === undefined ? os.release() : options.osRelease;
  const vars = options.env || process.env;
  const launch = (bin, ...leading) => ({ bin, args: [...leading, url] });
  const wsl = /microsoft/i.test(release) && platform === 'linux';

  switch (platform) {
    case 'darwin':
      return launch('open');
    case 'win32':
      return launch('rundll32.exe', 'url.dll,FileProtocolHandler');
    default:
      if (wsl) return launch('rundll32.exe', 'url.dll,FileProtocolHandler');
      return vars.DISPLAY || vars.WAYLAND_DISPLAY ? launch('xdg-open') : null;
  }
}

// Tried once, when the first screen shows up. Needs BRAINSTORM_OPEN, a loopback bind, and no page already
// connected.
let browserTried = false;
function openBrowserOnce() {
  if (browserTried) return;
  browserTried = true;
  if (!cfg.wantsBrowser) return;
  if (cfg.bindHost !== LOOPBACK && cfg.bindHost !== 'localhost') return;
  if (openPages.size > 0) return;

  const url = sessionLink(); // it has to carry the key, or the first request is refused
  quietly(() => {
    const launcher = browserLauncherForPlatform(url);
    // No shell here: the URL is one argument, so an odd host name cannot turn into a command.
    if (launcher) childProcess.execFile(launcher.bin, launcher.args, noop);
  });
}

// ## Running

// Report a problem on stderr; by default it also ends the process with status 1.
function bail(message, exit = true) {
  console.error(message);
  if (exit) process.exit(1);
}

function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM'; // it exists, but it belongs to someone else
  }
}

function run() {
  fs.mkdirSync(cfg.contentDir, { recursive: true });
  fs.mkdirSync(cfg.stateDir, { recursive: true });
  const eventsFile = path.join(cfg.stateDir, 'events');
  const infoFile = path.join(cfg.stateDir, 'server-info');

  // Screens present now count as known, so a later change to one is an update and not a new screen. (Some
  // systems report an overwrite as a rename, so the watcher's event type cannot tell the two apart.)
  const knownScreens = new Set(fs.readdirSync(cfg.contentDir).filter(isScreenFile));
  const pendingChecks = new Map();

  function screenTouched(name) {
    pendingChecks.delete(name);
    const file = path.join(cfg.contentDir, name);
    if (!fs.existsSync(file)) return; // it was deleted
    touch();
    if (knownScreens.has(name)) {
      emit('screen-updated', { file });
    } else {
      knownScreens.add(name);
      fs.rmSync(eventsFile, { force: true }); // a new screen starts without old clicks
      emit('screen-added', { file });
      openBrowserOnce();
    }
    notifyPages({ type: 'reload' });
  }

  const watcher = fs.watch(cfg.contentDir, (kind, name) => {
    if (!name || !isScreenFile(name)) return;
    clearTimeout(pendingChecks.get(name));
    pendingChecks.set(name, setTimeout(() => screenTouched(name), 100)); // let the write settle
  });
  const onWatcherError = (problem) => bail(`File watcher problem: ${problem.message}`, false);
  watcher.on('error', onWatcherError);

  const server = http.createServer(serve);
  server.on('upgrade', acceptUpgrade);

  function shutDown(reason) {
    emit('server-stopped', { reason });
    fs.rmSync(infoFile, { force: true });
    fs.writeFileSync(
      path.join(cfg.stateDir, 'server-stopped'),
      `{"reason":${JSON.stringify(reason)},"timestamp":${Date.now()}}\n`
    );
    watcher.close();
    clearInterval(watchdog);
    // An upgraded socket would keep server.close() waiting, so end them first.
    for (const socket of [...openPages]) socket.destroy();
    server.close(() => {
      process.exit(0);
    });
  }

  // Watchdog: leave when the process that started us is gone, or when nobody has used us for too long.
  function checkVitals() {
    if (cfg.ownerPid && !processExists(cfg.ownerPid)) {
      shutDown('owner process exited');
      return;
    }
    if (Date.now() - lastTouch > cfg.idleMs) shutDown('idle timeout');
  }
  const watchdog = setInterval(checkVitals, cfg.watchdogMs);
  watchdog.unref();

  // An owner that is already dead at start means the launcher named the wrong process (common under WSL or
  // through an SSH jump host). Stop watching it, and let the idle timeout be the only trigger.
  if (cfg.ownerPid && !processExists(cfg.ownerPid)) {
    emit('owner-pid-invalid', { pid: cfg.ownerPid, reason: 'dead at startup' });
    cfg.ownerPid = null;
  }

  let usedFallbackPort = false;

  function announce() {
    cfg.cookieName = `brainstorm-key-${cfg.port}`; // named for the port really bound, so servers never share a cookie
    // Save the port and key for the next start, but only when we got the port we wanted. After a fallback, the
    // saved port belongs to another live session, and overwriting it would strand that session's open tab.
    if (cfg.portFile && !usedFallbackPort) {
      quietly(() => fs.writeFileSync(cfg.portFile, String(cfg.port)));
      if (cfg.keyFile) {
        quietly(() => fs.writeFileSync(cfg.keyFile, cfg.key, { mode: 0o600 }));
        restrictToOwner(cfg.keyFile);
      }
    }
    const started = {
      port: Number(cfg.port),
      host: cfg.bindHost,
      url_host: cfg.linkHost,
      url: sessionLink(),
      screen_dir: cfg.contentDir,
      state_dir: cfg.stateDir,
      idle_timeout_ms: cfg.idleMs
    };
    emit('server-started', started);
    // server-info holds the key, so only its owner may read it.
    const infoText = JSON.stringify(Object.assign({ type: 'server-started' }, started));
    fs.writeFileSync(infoFile, `${infoText}\n`, { mode: 0o600 });
  }

  // A busy port (EADDRINUSE) or one the system refuses (EACCES: Windows reserves ranges inside the random
  // span) moves to another random port, up to MAX_FALLBACKS times.
  const MAX_FALLBACKS = 10;
  let fallbacks = 0;
  function onBindError(err) {
    const retryable = err.code === 'EADDRINUSE' || err.code === 'EACCES';
    if (!retryable || fallbacks >= MAX_FALLBACKS) bail(`Cannot bind the server: ${err.message}`);
    if (cfg.keySource === 'env') bail(`Port ${cfg.port} cannot be used (${err.code}) and BRAINSTORM_TOKEN fixes the key, so no other port is tried.`);
    fallbacks += 1;
    usedFallbackPort = true;
    cfg.port = randomHighPort();
    if (cfg.keySource === 'file') {
      cfg.keySource = 'generated-fallback';
      cfg.key = makeKey(); // the saved key belongs to the session that holds the old port
    }
    server.listen(cfg.port, cfg.bindHost, announce);
  }

  server.on('error', onBindError);
  server.listen(cfg.port, cfg.bindHost, announce);
}

const isEntryPoint = require.main === module;

module.exports = { computeAcceptKey, encodeFrame, decodeFrame, browserLauncherForPlatform, OPCODES, MAX_FRAME_PAYLOAD_BYTES };

if (isEntryPoint) run();
