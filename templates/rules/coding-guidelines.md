# Coding guidelines

Rules for every change to code. They exist to stop three habits: guessing what was meant,
building more than was asked, and tidying code nobody mentioned.

## 1. Ask before you build

- State what you think the task is in one or two sentences before you start. If two readings are
  plausible, name both and ask which; do not pick one in silence.
- Say what you are assuming (a file format, a user, a limit). An assumption you did not say out loud
  is a bug you have not found yet.
- If the task is bigger than it looks, say so and propose the smaller first step.

## 2. The smallest change that does the job

- Write what was asked and nothing beyond it: no extra options, no settings for a case that does not
  exist, no abstraction for a thing used once.
- If a plain version is 20 lines and a clever one is 80, write the 20. Add structure when a second
  real use appears, not before.
- Handle the errors that can happen here. Do not guard against ones that cannot.

## 3. Touch only what the task touches

- Every changed line should trace to the request. If a line does not, put it back.
- Leave the neighbouring code alone, including its style, even where you would write it differently.
  Mention a problem you noticed; do not fix it in the same change.
- Remove what your own change made unused (an import, a variable, a helper). Leave what was already
  unused; say it is there.

## 4. Define done, then prove it

- Turn the task into a check before you write the code: a test that fails now and passes when the
  work is right, or a command whose output you can compare.
- For a bug, reproduce it first; the fix is done when the reproduction passes and nothing else broke.
- Report what you ran and what it showed. "Should work" is not a result.
