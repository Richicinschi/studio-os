# Learning record format

Learning records go in `./learning-records/`, numbered in order: `0001-slug.md`, `0002-slug.md`, and so on. Do not make the folder until the first record exists.

Think of them as decision records for teaching. Each notes something that will change what you do next: a non-obvious insight, or knowledge the learner already had. Together they show where the learner's edge is.

## Template

```md
# {Short title: what was learned or what is already known}

{One to three sentences: what the learner now knows (or arrived knowing), and how that changes what to teach next.}
```

That is all that is required, and one paragraph is fine. What counts is noting that this is now known and why it matters for the next lesson, not filling in headings.

## Optional parts

Add one only when it earns its place. Most records need none.

- A **Status** line in the frontmatter, `active` or `superseded by LR-NNNN`, for when a newer record replaces an older understanding.
- **Evidence**: how the learner showed it (an answer, a finished exercise, past experience they described). Handy if the claim may be questioned later.
- **Implications**: what this opens up or closes off. Include it when that is not obvious.

## Numbering

Find the highest number in `./learning-records/` and add one.

## When to write one

Write a record when at least one of these happened:

1. **The learner showed real understanding of something hard.** Not exposure: proof they can use it correctly. It raises the floor for what you teach next.
2. **The learner said they already know something.** Record it, along with how deep they say it goes, so you never re-teach it.
3. **A wrong belief was fixed.** These are valuable, because they warn you where related topics will trip the learner.
4. **The mission changed because of what they learned.** Link to [[MISSION.md]] and update that file as well.

### What does not qualify

- Topics that were only covered. Having covered a thing is not evidence of learning; wait for proof.
- Anything that already fits in one line as a term in [[GLOSSARY.md]]. Do not say it twice.
- Logs of what happened in a session. These are not a diary; each record should be an insight you will act on.

## Superseding

When a later record contradicts an earlier one because understanding improved or was corrected, do not delete the old one. Set its status to `superseded by LR-NNNN`. Seeing how understanding changed is useful in itself.
