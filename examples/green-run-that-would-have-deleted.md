---
title: The green run that would have deleted 190 pages
sources:
  - .studio/memory/project_wiki_chronicle.md
  - .studio/memory/feedback_green_can_be_a_lie.md
---

# The green run that would have deleted 190 pages

## What happened

The studio generates its wiki from the files of every project: a map page per project with its file list, a card per plan, day notes and ledgers. One session ran the generator in a separate working copy, a git worktree, where each project folder was a link to the real one (studio-specific: one kind of folder link).

The run exited 0. Its drift check said clean. Every canary passed. The change it produced touched 530 files and removed 7,532 lines: every project map had lost its file list, and about 190 plan cards were gone.

The cause was one behaviour of Node. Listing a folder with file types, it reports that kind of folder link as a symbolic link, not as a directory. So the generator's scanner never walked into a linked project folder. To the generator those projects had no files, and it wrote pages to match.

None of the run's own checks showed the damage. The change itself did. The output was discarded, and nothing was committed.

## What it cost, or would have

Committed, the run would have deleted about 190 generated plan cards and every project's file tree, under a result that said everything was fine. It cost nothing because the output was discarded before anything was committed.

## The rule it produced

- The recipe was marked broken in the studio's memory: never commit a worktree run made with those folder links. Regenerate in the real, synced checkout, or first fix the scanner (follow a link when the file system says it points at a directory), as its own change. The old recipe moved to the memory vault, kept for its history.
- The general rule, which the studio's memory states for every check: a pass means little until you compare it with a baseline. A count that drops is then caught rather than discovered. Treat a drop as a failure until it is explained, and never record a baseline you have not seen printed.

## How to apply it

- Before you trust a run that writes many files, know roughly what a correct run changes. Then look at the size of the real change: how many files, how many lines added and removed. A run that should refresh a few pages and instead removes thousands of lines has failed, whatever its checks say.
- Ask of every check: what would have to break for this to go red? A check that cannot fail is decoration. Prove it fails once: break the input, run it, see red. The kit's hook canary does exactly that for the git hooks ([templates/git-hooks](../templates/git-hooks/README.md)).
- When you find a recipe that looks right and is broken, write it down as a memory with its reason, so the next session does not run it again ([templates/memory](../templates/memory/README.md)).
- In claude.ai: when Claude rewrites a long document, ask what it removed before you accept the result.
