---
id: long-jobs-in-containers
module: 04-delegation
checked: 2026-11-02
---

# Long jobs in named containers

## Why

- **The problem:** a long job run in the foreground holds the thread, and nobody plans the next step while it grinds ([module 04, The problem](../modules/04-delegation/README.md#the-problem)). Moved to a background shell, it lives inside the session: when the session ends or stops the shell, the job can stop with it without a word, and its output goes too. A job with no ceiling on memory or processors can also starve everything else the machine runs.
- **The reason:** a container is a program packed with what it needs and run by Docker apart from the rest of your machine. One with a name runs outside the session: you can find it by that name days later, read its log, see why it stopped, and give it a ceiling on memory and processors. Heavy work that would still crowd the machine goes to a second machine, when you have one.
- **The cost of skipping it:** the kit has no full story of it. What skipping means: an hour-long run that stopped halfway, found only when you look for its result, with no log to say why.
- **The principle:** [delegate the mechanical, keep the decisions](../PRINCIPLES.md#delegate-the-mechanical-keep-the-decisions). The long job runs on its own, where it can be watched, while the main thread keeps the plan.

## Detect

Read-only. Versions, counts, and running or not; no network. The Docker commands on this card are in [docs/facts.md](../docs/facts.md), "Docker: a long job in a named container". The field names used with `--format` here (`.NCPU`, `.MemTotal`, `.ServerVersion`, `.State.ExitCode`) are not in Docker's own examples, so Claude first finds each in your Docker's full output, one field at a time, for example `docker info --format '{{json .}}' | grep -o '"NCPU":[0-9]*'`, and uses the name it finds there.

- Docker: `docker --version` (it may not be installed).
- Whether its engine is running: `docker info >/dev/null 2>&1 && echo running || echo "not running"`. What `docker info` does when the engine is down is not in Docker's docs ([docs/facts.md](../docs/facts.md)); if the answer looks wrong, Claude reads the command's error with you.
- What Docker may use: `docker info --format '{{.NCPU}} processors, {{.MemTotal}} bytes of memory'`.
- Containers, counted, never listed: `docker ps -q | wc -l` (running) and `docker ps -aq | wc -l` (all).
- For each repository in `adoption/inventory.md`: a `Dockerfile`, and a `compose.yaml` or `docker-compose.yml`, present or not. Their contents are not read, since a compose file can hold environment values.
- Whether your instruction files carry a rule, a count per file: `grep -ciE 'container|docker' CLAUDE.md AGENTS.md 2>/dev/null`.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when an instruction file carries the rule and Docker is running; **partly** when Docker is installed but no rule says when to use it, or the rule is there but Docker is missing or stopped; and **not yet** otherwise.

## Ask

1. **"Where do long jobs run?"**
   - In a named container with its log kept, whenever a job is expected to run longer than a few minutes. Recommended when Detect finds Docker running, and for the `ml` profile, whose training runs and large data pulls are the jobs this is for.
   - In the foreground, where you can watch them, and never in a background shell. Recommended when Docker is not installed and you would rather not install it; a long job then holds the session until it ends.
   - Keep what you have. Recommended when Detect says **have**.
   - No rule.
   - Not sure: the option recommended above for what Detect found: keep what you have when Detect says **have**, a named container when Docker is running, otherwise the foreground rule, which needs no install.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.

   The threshold is yours to set; the studio uses three to five minutes. The item is optional for the other profiles.
2. **"Is there a second machine for heavy work?"** (only when you have one you can reach)
   - Yes: heavy work (a large model, GPU work, anything that needs most of the memory) goes there while this machine is busy with work that must keep running. Recommended when your main machine runs always-on work.
   - No: everything runs here, each container with a ceiling on memory and processors. Recommended when you have one machine, or the second one is not yours to load.
   - Not sure: the option recommended above: yes when your main machine runs always-on work, otherwise no, with ceilings only.
   - Default when skipped: no second machine.

## Needs

- Docker, with its command line and a running engine. Its install commands, its minimum version and its licence terms for use at a company are not checked in [docs/facts.md](../docs/facts.md) as of 2026-11-02. Follow Docker's own install guide for your system, which may need administrator rights; then `! docker --version`.
- For the second-machine route: a way to run commands on it from this one, such as a remote shell (SSH). Setting that up is not covered by the kit.
- Nothing else beyond Claude Code.

## Steps

1. **Claude:** runs `vet-and-adopt`'s comparison step. A practice with no files has nothing to scan; it compares the rule with anything your front door already says about long jobs, and recommends FOLD or ADAPT.
2. **you:** install Docker if Detect found none (Needs). Then `! docker info` prints the engine's system-wide information once it is running.
3. **Claude:** writes the rule into your front door, in your words, with your threshold, and shows it before saving. A starting point: "A job I expect to run longer than <N> minutes runs in a named container with its log kept, never in a background shell. Before you start it, tell me its name, how to follow its log and how to stop it. The image holds code only; data stays on this machine's disk, mounted in, and secrets are mounted read-only." On the second-machine route, one more line: "Heavy work goes to <your name for that machine> while this machine runs work that must keep running. Measure before you decide, and ask me before you move work there."
4. **Claude:** before the first long job, checks the commands it will use against your Docker: `docker build --help`, `docker run --help`, `docker logs --help`, `docker inspect --help`. It tells you about any difference from this card before going on.
5. **Claude:** for each long job, on your yes, shows and then runs:
   - an image with the code and the tools it needs, built from a `Dockerfile` in the repository: `docker build -t <image> .`;
   - one named run, with a ceiling, the data folder mounted from your disk and the secrets folder read-only:
     ```bash
     docker run -d --name <job-name> --memory <limit> --cpus <count> \
       -v "<data folder>:/data" -v "<secrets folder>:/secrets:ro" <image> <command>
     ```
   - then how to follow it, `docker logs -f <job-name>`, and how to stop it, `docker stop <job-name>`.

   `-d` runs it in the background, `--name` names it, `--memory` and `--cpus` set its ceiling, and `:ro` mounts a folder read-only ([docs/facts.md](../docs/facts.md), "Docker: a long job in a named container"). A mounted folder (`-v`) is a folder on your disk that the container sees as one of its own, so what the job writes there stays on your disk. The job prints one progress line every so many units (how many done, of how many, the time left), never a bar that redraws itself, and its output is not buffered, so each line reaches the log when it happens. A restart policy (a setting that starts a container again after it stops) is for a service that must keep running; a one-off job gets none, and Docker's default is `no`, so it is not started again once it ends ([docs/facts.md](../docs/facts.md)).
6. **Claude:** on the second-machine route, measures this machine before it chooses where heavy work runs: whether Docker is running, how many containers run, how much memory is free. It proposes the second machine only when this one is busy, and runs work there only on your yes. That machine's name and address never go into a committed file.
7. **Claude:** records the decision, the threshold, the second-machine choice and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -ci container <your front door>`. Expected: `1` or more.
2. **you:** in a new session, ask for a job you expect to run longer than your threshold, such as your full test suite or a large data pull. Expected: before it starts, Claude names the container, the command to follow its log and the command to stop it, and waits for your yes; it starts no background shell.
3. **you:** close that session. In a terminal, `docker ps -a --filter name=<job-name>` lists the container, and `docker logs <job-name>` prints its lines. Once it has finished, `docker inspect --format '{{.State.ExitCode}}' <job-name>` prints `0`, once Claude has found that field name in the full `docker inspect <job-name>` output, as in Detect.

If Claude starts a background shell in step 2, or in step 3 the container is missing or its log is empty, the item is not done: the plan row stays unticked, and the wording of the rule, or the job's output buffering, is the next thing to look at.

## Undo

- **Claude:** removes the rule, and the second-machine line, from your front door.
- **Claude:** on your yes, removes each finished container, `docker rm <job-name>`, and each image it built, `docker image rm <image>`. The data stays in its folder on your disk. Without `-v`, `docker rm` leaves the container's anonymous volumes; Claude adds `-v` only when you have checked nothing in them is needed ([docs/facts.md](../docs/facts.md)).
- **Claude:** marks the row in `adoption/decisions.md` as undone.
- **you:** Docker stays installed; removing it is your decision, and its uninstall steps are not documented in docs/facts.md as of 2026-11-02.

## Watch out

- **A background shell can be stopped under you.** It lives inside the session, and when Claude Code stops one is not documented in docs/facts.md as of 2026-11-02; a named container runs outside the session and keeps its log.
- **A container must not own data you cannot rebuild.** Removing a container together with its volumes (storage that Docker keeps for it, which `docker rm -v` removes) deletes whatever was stored only inside them ([docs/facts.md](../docs/facts.md)). Keep the data in a folder on your disk, mounted in, and only the code in the image.
- **A log is a stream.** A progress bar that redraws itself turns into thousands of fragments in `docker logs`; print one progress line every so many units instead. Buffered output shows nothing until the buffer fills, so turn buffering off in the job.
- **The image is not your machine.** A tool installed on your machine is not in the container, so a job that starts it fails inside; find each tool inside the image when the job starts.
- **Measure before you blame.** `docker info` and the memory figures come before any decision about where work runs, not a guess about what is using the memory.
- **Check after a restart.** A restart policy can bring a container back only once Docker itself is running again; after a reboot, check `docker info` before you assume your containers are up.
- **Ceilings matter.** Without `--memory` and `--cpus`, a job competes with everything else the machine runs.
- **Keep network details out of commits.** A second machine's name or address in a committed file stays in history ([a real address in history](../examples/real-address-in-history.md)).
- **A company machine:** Docker's licence terms for company use are not documented in docs/facts.md; ask before you install it there.
- **Token cost:** the rule costs about 77 tokens in every session, and the second-machine line about 42 more, estimates (bytes divided by 4, measured on the two starting lines in step 3). Nothing else loads.
