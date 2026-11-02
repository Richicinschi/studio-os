// tools/docs/adoption-sequence.mjs
// Emit the adoption-sequence diagram as .drawio and a matching hand-built .svg from one list.
//   node tools/docs/adoption-sequence.mjs docs
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const out = process.argv[2];
const YOU = { fill: '#fff2cc', stroke: '#d6b656' };
const CLAUDE = { fill: '#dae8fc', stroke: '#6c8ebf' };
const LATER = { fill: '#f5f5f5', stroke: '#666666' };
const FILE = { fill: '#d5e8d4', stroke: '#82b366' };

const phases = [
  { title: 'BEFORE · PREPARE', who: 'you · about 10 minutes (estimate)', c: YOU, out: 'nothing written yet', lines: [
    '• Install Claude Code and Git', '• Clone the kit and open', '  its folder in Claude Code,', '  your setup folder added', '• Say "start the adoption"', '',
    'Nothing in your own setup', 'is read or touched yet.', '',
    'claude.ai only: paste the', 'kit\'s Project instructions', 'instead, and follow the', 'same phases by hand.'] },
  { title: '1 · AUDIT', who: 'Claude · read-only · about 5 min', c: CLAUDE, out: 'adoption/inventory.md', lines: [
    '• Asks first: may I look?', '• Reads your setup the way', '  /init reads a project:', '  stack, instruction files,', '  skills, hooks, MCP servers,',
    '  git remotes', '• Never opens secrets or', '  data files', '• Estimates what loads into', '  every session today (tokens)',
    '• Lists what the kit covers,', '  partly covers, or misses'] },
  { title: '2 · DECIDE', who: 'you answer · one question at a time', c: YOU, out: 'adoption/features.md', lines: [
    '• Confirm your profile and', '  your data rules, before', '  anything that stores', '• The feature menu: tick', '  modules, then the items',
    '  inside; take single skills', '  from any other module', '• Each item is flagged:', '  importance + context cost', '• Total: "your choice adds',
    '  ~N tokens per session"', '• Tailoring, ticked items only', '• Each gap: vet one, write', '  one, or skip', '• "Not sure" takes the', '  recommended option'] },
  { title: '3 · SPEC AND PLAN', who: 'Claude writes · you approve', c: CLAUDE, out: 'adoption/spec.md + plan.md', lines: [
    '• spec.md: what you chose,', '  how it is tailored, what', '  was ruled out and why', '• Nothing goes on without', '  your yes',
    '• plan.md: one row per item,', '  in waves; wave 1 is the', '  first sitting, at most', '  about 8 rows, the scanner', '  first; the rest wait'] },
  { title: '4 · INSTALL', who: 'wave 1, row by row · on your yes', c: CLAUDE, out: 'adoption/decisions.md', lines: [
    '• Row 1 is always the', '  scanner: SkillSpector and', '  the scan-first rule', '• Empty folder: row 2 builds', '  it (setup-workspace)',
    '• Each item: scan, triage,', '  then skip, fold, adapt or', '  adopt; you decide', '• Steps only you can do:',
    '  ! lines; sign-ins in a', '  separate terminal'] },
  { title: '5 · VERIFY', who: 'end of wave 1 · same sitting', c: CLAUDE, out: 'adoption/handover.md', lines: [
    '• Every adopted item shown', '  working: hooks canary,', '  a memory written + found', '• Resume test in a fresh', '  session in your setup',
    '• Context estimated again', '  against the first total', '• One page: what you have', '  now, how to resume', '  tomorrow'] },
  { title: 'LATER · UPDATE RUNS', who: 'once per kit version', c: LATER, out: 'decisions.md (appended)', lines: [
    '• Reads CHANGELOG.md and', '  your decisions.md', '• Asks only about new or', '  changed items', '• Nothing decided is',
    '  asked again'] },
];

const X0 = 40, COLW = 220, GAP = 40, TOP = 110, HEAD = 54, LINE = 17, BODY = 290, OUTH = 46;
const colH = HEAD + 10 + BODY + 16 + OUTH + 14;
const W = X0 * 2 + phases.length * COLW + (phases.length - 1) * GAP;
const H = TOP + colH + 110;
const colX = (i) => X0 + i * (COLW + GAP);
const outY = TOP + HEAD + 10 + BODY + 16;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TITLE = 'Adopting Studio OS v2: Prepare, then five phases, then update runs; nothing installed before you decide';
const SUB = 'Yellow: you act. Blue: Claude acts. Grey: later. Every phase writes its result into adoption/ in your own setup, so a run can stop and resume at any phase.';

// ---- drawio
let id = 2;
const cells = [];
const v = (value, style, x, y, w, h, parent = 1) => {
  const i = id++;
  cells.push(`<mxCell id="${i}" value="${esc(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" /></mxCell>`);
  return i;
};
v(TITLE, 'text;html=1;fontSize=20;fontStyle=1;align=left;verticalAlign=middle;', X0, 20, W - 2 * X0, 30);
v(SUB, 'text;html=1;fontSize=13;fontColor=#555555;align=left;verticalAlign=middle;', X0, 52, W - 2 * X0, 26);
const lanes = phases.map((p, i) => {
  const lane = v(`${p.title}<br><span style="font-weight:normal;font-size:11px">${esc(p.who)}</span>`,
    `swimlane;html=1;startSize=${HEAD};rounded=1;arcSize=4;fillColor=${p.c.fill};strokeColor=${p.c.stroke};fontSize=14;swimlaneFillColor=#ffffff;pointerEvents=0;`,
    colX(i), TOP, COLW, colH);
  v(p.lines.map(esc).join('<br>').replace(/ {2}/g, '&nbsp;&nbsp;'), 'text;html=1;fontSize=12;align=left;verticalAlign=top;whiteSpace=nowrap;spacingLeft=10;', 0, HEAD + 10, COLW, BODY, lane);
  v(p.out, `shape=note;html=1;size=12;whiteSpace=wrap;fontSize=12;fontStyle=1;fillColor=${FILE.fill};strokeColor=${FILE.stroke};`, 14, outY - TOP, COLW - 28, OUTH, lane);
  return lane;
});
const e = (s, t, style, value = '', pts = []) => {
  const p = pts.length ? `<Array as="points">${pts.map(([x, y]) => `<mxPoint x="${x}" y="${y}" />`).join('')}</Array>` : '';
  cells.push(`<mxCell id="${id++}" value="${esc(value)}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;${style}" edge="1" parent="1" source="${s}" target="${t}"><mxGeometry relative="1" as="geometry">${p}</mxGeometry></mxCell>`);
};
for (let i = 0; i < lanes.length - 1; i++) e(lanes[i], lanes[i + 1], 'exitX=1;exitY=0.06;entryX=0;entryY=0.06;strokeColor=#444444;strokeWidth=2;');
const loopY = TOP + colH + 50;
e(lanes[6], lanes[2], 'exitX=0.5;exitY=1;entryX=0.5;entryY=1;dashed=1;strokeColor=#666666;strokeWidth=1.5;fontSize=12;', 'update mode: new or changed items only',
  [[colX(6) + COLW / 2, loopY], [colX(2) + COLW / 2, loopY]]);
const drawio = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="drawio" version="26.0.0">
  <diagram name="Adoption sequence">
    <mxGraphModel dx="${W}" dy="${H}" grid="1" gridSize="10" page="1" pageWidth="${W}" pageHeight="${H}">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;

// ---- svg
const s = [];
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Helvetica, Arial, sans-serif">`);
s.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`);
s.push('<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#444444"/></marker></defs>');
s.push(`<text x="${X0}" y="40" font-size="20" font-weight="700" fill="#222222">${esc(TITLE)}</text>`);
s.push(`<text x="${X0}" y="69" font-size="13" fill="#555555">${esc(SUB)}</text>`);
phases.forEach((p, i) => {
  const x = colX(i);
  s.push(`<rect x="${x}" y="${TOP}" width="${COLW}" height="${colH}" rx="8" fill="#ffffff" stroke="${p.c.stroke}" stroke-width="1.5"/>`);
  s.push(`<path d="M${x + 8},${TOP} H${x + COLW - 8} Q${x + COLW},${TOP} ${x + COLW},${TOP + 8} V${TOP + HEAD} H${x} V${TOP + 8} Q${x},${TOP} ${x + 8},${TOP} Z" fill="${p.c.fill}" stroke="${p.c.stroke}" stroke-width="1.5"/>`);
  s.push(`<text x="${x + COLW / 2}" y="${TOP + 23}" font-size="14" font-weight="700" text-anchor="middle" fill="#1a1a1a">${esc(p.title)}</text>`);
  s.push(`<text x="${x + COLW / 2}" y="${TOP + 42}" font-size="11" text-anchor="middle" fill="#333333">${esc(p.who)}</text>`);
  p.lines.forEach((l, k) => {
    if (l) s.push(`<text x="${x + 12}" y="${TOP + HEAD + 26 + k * LINE}" font-size="12" fill="#222222" xml:space="preserve">${esc(l)}</text>`);
  });
  const ox = x + 14, ow = COLW - 28;
  s.push(`<path d="M${ox},${outY} H${ox + ow - 12} L${ox + ow},${outY + 12} V${outY + OUTH} H${ox} Z" fill="${FILE.fill}" stroke="${FILE.stroke}" stroke-width="1.5"/>`);
  s.push(`<text x="${ox + ow / 2}" y="${outY + OUTH / 2 + 4}" font-size="12" font-weight="700" text-anchor="middle" fill="#1a1a1a">${esc(p.out)}</text>`);
  if (i < phases.length - 1) {
    const ay = TOP + HEAD / 2 + 2;
    s.push(`<line x1="${x + COLW}" y1="${ay}" x2="${x + COLW + GAP - 2}" y2="${ay}" stroke="#444444" stroke-width="2" marker-end="url(#arr)"/>`);
  }
});
const lx6 = colX(6) + COLW / 2, lx2 = colX(2) + COLW / 2, by = TOP + colH;
s.push(`<path d="M${lx6},${by} V${loopY} H${lx2} V${by + 2}" fill="none" stroke="#666666" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#arr)"/>`);
s.push(`<text x="${(lx6 + lx2) / 2}" y="${loopY - 8}" font-size="12" text-anchor="middle" fill="#444444">update mode: new or changed items only</text>`);
s.push('</svg>');

writeFileSync(path.join(out, 'adoption-sequence.drawio'), drawio);
writeFileSync(path.join(out, 'adoption-sequence.svg'), s.join('\n') + '\n');
console.log(`wrote ${W}x${H} to ${out}`);
