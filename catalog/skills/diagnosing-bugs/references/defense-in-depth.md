# Checks at every layer

## The idea

After you fix a bug caused by bad data, one new check at one spot feels like enough. It is not. Another caller can skip that spot, a refactor can move it, and a test double can hide it.

Principle: check the value at every layer it passes through. Then the bug cannot return by a side door.

One check says "this case is fixed". Several checks say "this case cannot happen".

## Why layers

Each layer catches what the others miss:
- The entry check stops most bad input.
- The logic check catches combinations that look valid at the edge.
- An environment guard blocks actions that are only dangerous in some contexts, such as tests.
- Diagnostic logging helps when everything else was bypassed.

## The four layers

### 1. Entry check

Purpose: turn away plainly invalid input at the boundary.

```typescript
function openImporter(label: string, targetDir: string) {
  if (!targetDir || targetDir.trim() === '') {
    throw new Error('targetDir must not be blank');
  }
  if (!existsSync(targetDir)) {
    throw new Error(`targetDir is missing: ${targetDir}`);
  }
  if (!statSync(targetDir).isDirectory()) {
    throw new Error(`targetDir is a file, not a folder: ${targetDir}`);
  }
  // carry on
}
```

### 2. Logic check

Purpose: confirm the value makes sense for this specific operation.

```typescript
function prepareScratch(baseDir: string, runId: string) {
  if (!baseDir) {
    throw new Error('prepareScratch needs a baseDir');
  }
  // carry on
}
```

### 3. Environment guard

Purpose: block risky actions in a particular context.

```typescript
async function unpackArchive(archive: string, dir: string) {
  // Under test, only ever extract inside the OS temp folder.
  if (process.env.NODE_ENV === 'test') {
    const target = normalize(resolve(dir));
    const allowed = normalize(resolve(tmpdir()));
    if (!target.startsWith(allowed)) {
      throw new Error(`Test run tried to unpack outside temp: ${dir}`);
    }
  }
  // carry on
}
```

### 4. Forensic logging

Purpose: leave evidence for the next investigation.

```typescript
async function unpackArchive(archive: string, dir: string) {
  logger.debug('about to unpack', {
    archive,
    dir,
    cwd: process.cwd(),
    trace: new Error().stack,
  });
  // carry on
}
```

## Using it

After finding a root cause:

1. Follow the data: where does the bad value start, and where is it used?
2. List every point it crosses.
3. Add a check at each of the four layers.
4. Test each one on its own: slip past layer 1 and confirm layer 2 stops it.

## Worked case

Bug: a blank `unpackDir` made `execFile('tar', ['-xf', archive], { cwd: '' })` run in the current directory (an empty `cwd` is ignored), so a stray `manifest.json` landed in `services/api/`.

Path of the value:
1. A test fixture handed over an empty string.
2. `Importer.open(label, '')` accepted it.
3. `ScratchManager.prepare('')` accepted it.
4. The extraction ran in `process.cwd()`.

Layers added:
- Layer 1: `Importer.open()` rejects blank, missing and non-folder paths.
- Layer 2: `ScratchManager` rejects an empty base path.
- Layer 3: the extraction refuses to run outside the temp folder when `NODE_ENV` is `test`.
- Layer 4: the call logs its arguments and a stack trace first.

Outcome: the whole suite stayed green and no stray file ever appeared again.

## Why all four

In practice each one earned its place. Some callers skipped the entry check. Test doubles skipped the logic check. Odd platforms needed the environment guard. The logging exposed a misuse nobody had predicted.

Do not stop at one check.
