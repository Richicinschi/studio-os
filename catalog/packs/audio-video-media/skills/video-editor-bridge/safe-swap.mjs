// Replaces a project file with new content safely: numbered backup of the original, write to a temp file, then swap.
// Usage: node safe-swap.mjs <project-file> <new-content-file> [--apply]
// Without --apply it only reports what it would do. Reads only the two files given; writes only beside the project file.
import { readFileSync, writeFileSync, copyFileSync, renameSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, basename, join, resolve } from 'node:path';

function nextBackupPath(targetPath) {
  let n = 1;
  while (existsSync(`${targetPath}.bak.${n}`)) n += 1;
  return `${targetPath}.bak.${n}`;
}

function checkNewContentIsValid(targetPath, text) {
  if (text.length === 0) throw new Error('new content is empty, refusing to replace the project file');
  if (targetPath.toLowerCase().endsWith('.json')) JSON.parse(text);
}

function swapWithBackup(targetPath, newText) {
  const backup = nextBackupPath(targetPath);
  const temp = join(dirname(targetPath), `.${basename(targetPath)}.tmp-${process.pid}`);
  copyFileSync(targetPath, backup);
  try {
    writeFileSync(temp, newText);
    renameSync(temp, targetPath);
  } catch (err) {
    if (existsSync(temp)) unlinkSync(temp);
    throw err;
  }
  return backup;
}

function main(argv) {
  const args = argv.filter((a) => a !== '--apply');
  const apply = argv.includes('--apply');
  if (args.length !== 2) {
    console.error('usage: node safe-swap.mjs <project-file> <new-content-file> [--apply]');
    return 2;
  }
  const target = resolve(args[0]);
  const newText = readFileSync(resolve(args[1]), 'utf8');
  if (!existsSync(target)) {
    console.error(`project file not found: ${target}`);
    return 1;
  }
  try {
    checkNewContentIsValid(target, newText);
  } catch (err) {
    console.error(`not written: ${err.message}`);
    return 1;
  }
  if (!apply) {
    console.log(`dry run: would back up to ${nextBackupPath(target)} and replace ${target} (${newText.length} characters)`);
    return 0;
  }
  const backup = swapWithBackup(target, newText);
  console.log(`replaced ${target}; original kept at ${backup}`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
