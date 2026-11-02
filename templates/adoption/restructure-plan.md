# Restructure plan

**Starting point:** <existing work / existing Claude setup> · **Date:** <YYYY-MM-DD> · **Kit version:** v<X.Y.Z>
**Asked in round 1:** reorganize: <yes / no> · folders you named: <each, and move / point to / leave>
**Repositories:** <list> · **All clean before starting:** <yes / no, and which are not>

Each step runs only on a yes, and its check must pass before the next step starts. A folder you named moves only where you said move. A removal is always a step of its own, and the last one. A ticked step is done: `setup-workspace` resumes from the first unticked one.

The six things a move can break (module 11): (1) the `.gitignore` line above the folder · (2) its project-registry row · (3) a tool's own list of projects · (4) absolute paths in the code · (5) editable installs in virtual environments · (6) old paths in live config and prose. Cached bytecode can keep the old path too, and some breaks are silent: compare the test counts with those from before.

| # | Change | From | To | Why | Touches (of the six) | Check after | Undo | Done |
|---|---|---|---|---|---|---|---|---|
