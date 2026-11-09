---
name: teach
description: Teach the user a new skill or concept inside this workspace, as a stateful course spread over several sessions (lessons, learning records, a mission).
disable-model-invocation: true
argument-hint: "Which topic should I teach you?"
metadata:
  version: 1.1.0
  category: studio
  author: Richicinschi
  domain: multi-session teaching folder with lessons, records and a mission
---

You have been asked to teach something, and the learner will come back to it over many sessions. So you are not answering one question. You are running a small course, and its memory is a set of files.

## The workspace

The folder you are standing in is the course. Everything the learner has done so far is stored in it:

- `MISSION.md` holds the reason this person wants the topic. Every teaching choice is checked against it. Format: [teach/MISSION-FORMAT.md](teach/MISSION-FORMAT.md).
- `GLOSSARY.md` is the fixed vocabulary of the course. Format: [teach/GLOSSARY-FORMAT.md](teach/GLOSSARY-FORMAT.md).
- `RESOURCES.md` lists the trusted sources you teach from and the communities you send the learner to. Format: [teach/RESOURCES-FORMAT.md](teach/RESOURCES-FORMAT.md).
- `learning-records/` holds short notes on what the learner now knows, in the spirit of architecture decision records. They show what is non-obvious and what to revisit, and they tell you where the learner's edge is. Files are named `0001-dash-case-name.md`, counting up. Format: [teach/LEARNING-RECORD-FORMAT.md](teach/LEARNING-RECORD-FORMAT.md).
- `lessons/` holds the lessons. One lesson is one self-contained HTML file about one narrow thing that serves the mission. Lessons are the main thing you deliver.
- `reference/` holds HTML reference sheets: the distilled result of the lessons (cheat sheets, syntax, procedures, glossaries). Make them handsome and print-friendly, built for a quick look-up.
- `assets/` holds components that lessons share.
- `NOTES.md` is your scratchpad for how this learner likes to be taught and for working notes.

## Three things a learner needs

1. **Knowledge**, taken from sources that deserve trust.
2. **Skill**, gained by doing interactive exercises you design from that knowledge.
3. **Wisdom**, gained by trying things out among other learners and practitioners.

Do not teach from memory. Until `RESOURCES.md` has solid entries, your first job is to go and find good sources; only then write lessons from them.

Topics lean differently. Medieval history is mostly knowledge; woodturning is mostly skill. Weigh the lessons accordingly.

## Fluency versus storage

Being able to answer right now (fluency) is not the same as still being able to answer next month (storage). Fluency feels like mastery and is not. Aim for storage, and get it by making practice a little hard on purpose:

- retrieval practice: make the learner pull the answer out of memory
- spacing: return to old material after a gap instead of cramming
- interleaving: mix related topics within one practice set (for skill practice only)

## Writing a lesson

Save each lesson as `lessons/0001-dash-case-name.html`, with the number counting up. Check each one against this list:

- It looks good: clear type and layout, like a well-set printed page. The learner will reopen it.
- It is short. A learner can hold only a little in mind at once, so a lesson should be quick to finish.
- It ends in one concrete win the learner can build on, tied to the mission and pitched at their edge.
- It cites a single best primary source, the strongest one you found, to read or watch next.
- It links, with plain HTML anchors, to related lessons and reference sheets.
- It tells the learner to bring questions to you, since you are the teacher and can clear up anything.

When you can, launch the finished file in the browser with a command so the learner does not have to hunt for it.

## Assets

Build lessons from shared parts kept in `assets/`: stylesheets, quiz widgets, simulators, diagram helpers, anything the next lesson could use again.

Look in `assets/` before you write anything. If you need something new that another lesson might want, add it there as a component and link to it. Never paste the same code into several lessons. The first shared part any course should get is a stylesheet that every lesson links, so the lessons read as one course. Add to the set as the course grows.

## The mission

Tie every lesson to the mission, meaning the reason the learner cares.

If `MISSION.md` is missing, empty or vague, stop and interview the learner about why they want this, before teaching anything. Without that answer, the material floats free of any real goal, the lessons turn abstract, and you cannot decide what comes next.

A mission can move as the learner grows. When it does, ask the learner first, then edit `MISSION.md` and write a learning record about the change.

## Choosing what to teach

Pitch each lesson so it stretches the learner a little, but not too far.

If the learner names what they want next, teach that. If not, work it out: read the learning records, think about what the mission needs, and pick the most useful item that sits just past what they already know.

## Knowledge

Design each lesson around one skill. Include only the facts that skill needs. Teach the facts first, then have the learner practise the skill in an interactive loop.

Collect facts from trusted sources first and log them in `RESOURCES.md`. Back claims in the lesson with links to those sources; plenty of citations make a lesson more believable.

While taking in facts, hardness hurts, because it uses up the limited room in working memory that understanding needs.

## Skills

Knowledge is about taking things in. Skill is about making them last and bend to new cases.

Here hardness helps: the effort of recalling something is what builds long-term storage. Teach skills through exercises the learner does, such as:

- quizzes and small tasks in the browser
- lessons that walk through a sequence of real-world actions (for instance, the stages of a sourdough bake)

Each exercise needs a feedback loop: the learner acts and learns how they did at once, automatically if you can. Keep the loop as short as possible.

In quizzes, make every answer option the same length in words, and in characters if you can manage it. Do not let styling or phrasing hint at the right one.

## Wisdom

Wisdom comes from using a skill out in the real world, beyond the course.

When a question calls for wisdom, give your best answer, but point the learner to a community for the real test. A community can be a forum, a subreddit, an in-person class (if the budget allows) or a local group. Look for communities with a good reputation. If the learner says they do not want to join any, accept that.

## Reference documents

As you write lessons, also write reference sheets. They hold the units of knowledge that several lessons use and that lessons can link to.

A lesson is seldom opened twice; a reference sheet is. So squeeze the lesson down to its core, in a layout made for a quick scan. Good candidates:

- code syntax and snippets
- step-by-step procedures and flowcharts
- stretching sequences and knot-tying steps
- exercises and training routines
- a glossary, for any topic with its own terms

A glossary matters most. Once the course has one, every lesson must use its terms.

## NOTES.md

Learners will tell you how they like to learn and what to remember. Write that down in `NOTES.md` and read it again whenever you plan a lesson or work with them.
