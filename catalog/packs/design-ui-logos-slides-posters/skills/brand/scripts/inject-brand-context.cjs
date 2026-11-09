#!/usr/bin/env node
'use strict';
/*
 * Brand context for prompts.
 *
 * Reads a markdown brand-guidelines file and prints what an AI model needs to stay on
 * brand: a short prompt block, or the same data as JSON.
 *
 * Arguments: an optional guidelines path, and --json for data instead of a prompt block.
 * With no path it reads the default guidelines file under the current folder.
 */

const fs = require('node:fs');
const nodePath = require('node:path');

const DEFAULT_FILE = ['docs', 'brand-guidelines.md'].join('/');

const STAR = '\\*';
const BOLD = STAR.repeat(2) + '([^*]+)' + STAR.repeat(2); // **text**, one capture
const HEX_COLOR = new RegExp('#[0-9a-f]{6}\\b', 'gi');
const hexesIn = (text) => [...new Set(text.match(HEX_COLOR) ?? [])];

// Text from a "### <title>" heading up to the next heading (or the end), or null.
const section = (md, title, needsTable = false) => {
  const body = needsTable ? '[\\s\\S]*?\\|[\\s\\S]*?' : '[\\s\\S]*?';
  const stop = '(?=' + (needsTable ? ['###'] : ['###', '##']).concat('$').join('|') + ')';
  const m = new RegExp('### ' + title + body + stop, 'i').exec(md);
  return m ? m[0] : null;
};

function readColors(md) {
  const pick = (title) => {
    const s = section(md, title, true);
    return s ? hexesIn(s) : [];
  };
  return {
    primary: pick('Primary Colors'),
    secondary: pick('Secondary Colors'),
    neutral: pick('Neutral'),
    semantic: pick('Semantic'),
  };
}

function readTypography(md) {
  const out = Object.fromEntries(['heading', 'body', 'mono'].map((k) => [k, null]));
  const stack = section(md, 'Font Stack');
  if (stack) {
    for (const key of ['heading', 'body']) {
      const loose = new RegExp(key + `[^']*(?:'|")([^'"]+)(?:'|")`, 'i').exec(stack);
      out[key] = loose ? loose[1] : null;
    }
  }
  // explicit CSS variables win over the loose match above
  for (const key of ['heading', 'body', 'mono']) {
    const v = new RegExp('--font-' + key + ':\\s*[\'"]([^\'"]+)[\'"]').exec(md);
    if (v) out[key] = v[1];
  }
  return out;
}

function readVoice(md) {
  const voice = { personality: '', traits: [], prohibited: [] };

  const personality = section(md, 'Brand Personality', true);
  if (personality) {
    // a trait is the bold text in the first cell of a table row
    for (const line of personality.split('\n')) {
      const firstCell = line.split('|')[1];
      const bold = firstCell && new RegExp(BOLD).exec(firstCell);
      if (bold && line.split('|').length > 2) voice.traits.push(bold[1].trim());
    }
  }

  const banned = section(md, 'Prohibited');
  if (banned) {
    // the banned term is the first cell of each table row; the header and divider rows are skipped
    voice.prohibited = banned
      .split('\n')
      .filter((line) => line.trim().startsWith('|'))
      .map((line) => (line.split('|')[1] || '').trim())
      .filter((cell) => cell && !cell.includes('Avoid') && !cell.includes('---'));
  }

  if (!voice.prohibited.length) {
    const forbidden = section(md, 'Forbidden Phrases');
    if (forbidden) {
      // bullet lines; the phrase ends at a quote or an opening bracket
      voice.prohibited = forbidden
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('-'))
        .map((line) => line.slice(1).trim().replace(/^[\x22\x27]/, '').split(/[\x22\x27(]/)[0].trim())
        .filter((phrase) => phrase.length > 0);
    }
  }

  return { traits: voice.traits, prohibited: voice.prohibited, personality: voice.traits.join(', ') };
}

function readAttributes(md) {
  const block = section(md, 'Core Attributes', true);
  if (!block) return [];
  const attrs = [];
  for (const line of block.split('\n')) {
    const cells = line.split('|');
    const name = cells.length > 3 && new RegExp(BOLD).exec(cells[1]);
    if (name) attrs.push({ name: name[1].trim(), description: cells[2].trim() });
  }
  return attrs;
}

function readImageStyle(md) {
  const style = { basePrompt: '', mood: [], keywords: [], examplePrompts: [], donts: [] };

  const fence = '`'.repeat(3);
  const base = new RegExp('### Base Prompt Template[\\s\\S]*?' + fence + '\\n?([\\s\\S]*?)' + fence, 'i').exec(md);
  const oneLine = (s) => s.trim().split('\n').join(' ');
  if (base) style.basePrompt = oneLine(base[1]);

  const keywords = section(md, 'Style Keywords', true);
  if (keywords) {
    for (const line of keywords.split('\n')) {
      const cells = line.split('|');
      if (cells.length > 3 && new RegExp(BOLD).test(cells[1])) {
        style.keywords.push(...cells[2].split(',').map((word) => word.trim()).filter((word) => word !== ''));
      }
    }
  }

  const mood = section(md, 'Visual Mood Descriptors');
  if (mood) {
    style.mood = mood
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().slice(1).trim());
  }

  const donts = section(md, "Visual Don'ts", true);
  if (donts) {
    for (const line of donts.split('\n')) {
      const cells = line.split('|');
      const first = cells.length > 3 ? cells[1].trim() : '';
      if (first && !first.includes('Avoid') && !first.includes('---')) style.donts.push(first);
    }
  }

  const examples = section(md, 'Example Prompts');
  if (examples) {
    const pattern = new RegExp(BOLD + ':\\s*' + fence + '\\n?([\\s\\S]*?)' + fence, 'g');
    for (const m of examples.matchAll(pattern)) {
      style.examplePrompts.push({ type: m[1].trim(), prompt: oneLine(m[2]) });
    }
  }

  const { basePrompt, keywords: words, mood: feel, donts: avoid, examplePrompts: samples } = style;
  return { basePrompt, keywords: words, mood: feel, donts: avoid, examplePrompts: samples };
}

function renderPrompt({ colors, typography, voice, attributes, imageStyle }) {
  const list = (items, empty) => (items.length ? items.join(', ') : empty);
  const parts = [
    [
      'BRAND CONTEXT:',
      '='.repeat(14),
      '',
      'VISUAL IDENTITY:',
      `- Primary Colors: ${list(colors.primary, 'Not specified')}`,
      `- Secondary Colors: ${list(colors.secondary, 'Not specified')}`,
      '- Typography: ' + (typography.heading || typography.body || 'System fonts'),
      '',
      'BRAND VOICE:',
      `- Personality: ${voice.personality || 'Professional'}`,
      `- Core Attributes: ${list(attributes.map((attr) => attr.name), 'Not specified')}`,
      '',
      'CONTENT RULES:',
      `- Prohibited Terms: ${list(voice.prohibited, 'None specified')}`,
    ],
  ];

  if (imageStyle && imageStyle.basePrompt) {
    parts.push([
      '',
      'IMAGE GENERATION:',
      `- Base Prompt: ${imageStyle.basePrompt}`,
      `- Style Keywords: ${list(imageStyle.keywords.slice(0, 10), 'Not specified')}`,
      '- Visual Mood: ' + (imageStyle.mood.filter((_, i) => i < 5).join('; ') || 'Not specified'),
      `- Avoid: ${list(imageStyle.donts, 'None specified')}`,
    ]);
  }

  parts.push([
    '',
    'Apply these brand guidelines to all generated content.',
    'Maintain consistent voice, colors, and messaging.',
  ]);

  return parts.flat().join('\n').trim();
}

function run() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  const given = argv.filter((arg) => arg.slice(0, 2) !== '--')[0] || DEFAULT_FILE;
  const file = nodePath.isAbsolute(given) ? given : nodePath.join(process.cwd(), given);

  if (!fs.existsSync(file)) {
    console.error('Error: Brand guidelines not found at ' + file);
    console.error('Create brand guidelines at ' + DEFAULT_FILE + ' or specify a path.');
    process.exit(1);
  }

  const md = fs.readFileSync(file, 'utf-8');
  const context = {
    colors: readColors(md),
    typography: readTypography(md),
    voice: readVoice(md),
    attributes: readAttributes(md),
    imageStyle: readImageStyle(md),
    source: file,
    extractedAt: new Date(Date.now()).toISOString(),
  };

  console.log(asJson ? JSON.stringify(context, null, 2) : renderPrompt(context));
}

run();
