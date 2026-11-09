---
name: brainstorming
description: "You MUST use this before any creative work, such as creating a feature, building a component, adding functionality, modifying behavior, or planning anything new, in software or beyond it (a talk, a business, a renovation). It settles what they want, and why, first."
metadata:
  category: planning
  author: Richicinschi
  version: 1.0.0
  domain: design conversation before a spec and a plan
---
# Brainstorming

Goal: turn a loose wish into a design your human partner has agreed to,
before anything is built.

Your reflex is to start making things. At that moment your picture of
their wish is only a sketch, and it tends to be fainter than it seems.
Asking costs a minute; rebuilding costs far more. Many people have not
fully decided yet, and a well-aimed question lets them decide. Once you
hold the reason behind a request, you can settle the countless small
points they will never raise, and settle them the way they would.

## Triage

Start by checking how much is known: the wish itself, and the reason for it.

- **Complete.** Every detail that matters is already in the request, for
  instance "make the footer links grey instead of blue". Do the job and
  report what changed. No conversation.
- **A real gap.** Something that affects the result is missing. Run the
  process below.
- **They waived the questions.** This skill is over, and its gate goes
  with it. Name any major choice about the making (the platform, the
  language, the medium) in a single plain line. Then carry on with the job
  in the ordinary way.

Before you implement anything, you must do these four steps, in order.
Nothing is built until all four are done:

1. Show the possible approaches on their own, in a separate message. They
   choose one.
2. Draft the design document, sized as described under Size the work.
3. They approve the document.
4. Invoke writing-plans. It is the final step of this skill.

Two kinds of building are exempt: a spike they agreed to (see Spike), and
carrying out what they asked once they waived the questions.

## Look before you ask

Do your homework before you write to them whenever the work lives in an
existing project, or they supplied material: a specification, a plan, a
handover note, named files, earlier chat. Open what they named, then
follow its links into the code or documents behind it. Stop only when you
could teach a newcomer how the affected area works now and which parts
this change would touch. If the project or the supplied material answers a
question, do not put that question to them.

## The opening message

Every opening message moves the work forward. Which kind you write depends
on what you were given.

**A detailed request or a spec.** Keep the whole message near 200 words.
It holds, in this order:

1. Your reading of the request: the wish, the audience, the reason, as far
   as they stated them. This lets them see whether you grasped its shape.
2. What your homework turned up: how the relevant parts behave now, and
   which of them the change would reach.
3. Anything they may not have weighed that alters the request or how it
   must be built: a constraint, a conflict, a cheaper route. Say it
   straight.
4. A line asking them to correct you.
5. One question, about the wish and not about construction: the open point
   whose answer would shift the result most. A spec rarely covers
   everything, so check it with them before you build on it.

Leave the question of how to build it until you grasp the wish.

**A thin request.** One open question, in their words, about the largest
unsettled matter. Add why you ask: what the answer would alter in what you
make. Say a client writes "a landing page for my dog-grooming shop". You
might answer: "If most visitors only want to know whether you can fit
their dog in this week, I would put the booking calendar above everything
and the price list second; a photo gallery would be a different page. What
should a visitor do in the first ten seconds?"

**Closing the message.**

- If they asked for brainstorming (by name, by invoking this skill, or because
  they want to discuss the design), finish on the question. They came for
  the conversation.
- If they did not ask, they may not want one. Under your question, add a
  light one-line offer of a shortcut, such as "Or say the word and I will
  simply start." When they take it, follow the "They waived the questions" bullet
  of Triage from there.

Nothing else goes in that message.

## Running the conversation

**Format of each message.** It ends with exactly one question, written as
one sentence. Do not hang sample answers on it. Write plainly, aimed a
notch above their own level, in their own vocabulary, and never use
process jargon. Never quote this skill to them. Be
brief, and put the point first. Of what you found, report the top items
and offer to share the rest.

**Let them talk first.** Open questions beat menus, because the person's
own wording carries intent your options would flatten. Hand over a short
menu only to someone who is stuck. If they answer "just guess" or "what
would you do?", give a concrete proposal.

**Who decides how it is made.** Any project rests on decisions about
format, tooling, supplies and means: for an app, the platform, language
and libraries; for a picture, the medium. Learn up front which of them
they want to own, which they leave to you, and what is already in their
hands. People with firm opinions or skills want to discuss it. People who
rely on you need sensible defaults, spoken aloud in plain words. If work
already exists, use what it uses. In the design, label every decision you
made as yours; never present one as agreed.

**Ground to cover.** Think of it as terrain to walk, not a script, and do
not recite the list as questions.

- what sort of thing it is, and what sets it apart
- the reason for doing it now, and their picture of success
- what it must achieve, what it deliberately will not do, and what would
  make it a failure even when it technically works
- prior art: things they met elsewhere and loved or hated
- the present state: what exists, what was already tried
- the details that matter most to them

**Tailor every question.** Draw on their project and their answers. Probe
the way a sharp colleague does: build on their latest reply or on one of
your findings, so the question makes them trace a consequence or notice a
case they skipped. For example: "Tickets go on sale at noon and the hall
holds 120. A group of six wants to sit together and only four adjacent
seats remain. Should the system offer them split seats?" If the point of
asking is not obvious, say what you hope to find out or what hinges on the
answer. A proposal they can fix, plus your reason for it, frequently
works better than a question.

**Offer recon.** When you have enough footing and more digging would pay
off, propose a search: further into their codebase or project, through
their own files and data, or out on the web. Name what you would hunt for.
Whether you go is their call.

## Lay out the approaches

You may do this only after you grasp the wish, and it must come before any
write-up. Give it a message to itself.

1. Brainstorm several real ways to build it.
2. Cut the weak ones, including every option that undermines their reason
   for wanting it and every option the existing work excludes.
3. Show the two or three left. Tie each to what the project really does,
   and say what it gives up.
4. Recommend one with your reason, and ask which route they prefer.

If only one way makes sense, state that, with the reasons the alternatives
fail. This step settles how to build it. What they want is settled
earlier, by letting them describe it.

## Show, don't tell

Offer the visual companion (last section) whenever looking beats reading.
The cases:

- the person will be viewing the result: a screen, a page, a printed
  sheet, a sign
- the question is about placement: how things sit on a screen, in a room,
  across a timetable
- the subject is a flow, or steps in order
- the options differ mostly in how they look
- the structure is clearer drawn than described, such as a diagram, a
  timeline or a map

After they accept, use it for mockups to react to, options side by side,
and throwaway prototypes they can click.

## Spike

With agents the old waterfall still applies, only much faster. Often the
quickest way to learn what they want, or whether an idea works, is a cheap
build you will throw away. Propose one when that would help. If they only
want a spike, step aside and let them have it. A spike carries few tests
or none, is not hardened, and bypasses the plan, implementation and review
process. Carry its lessons back into the conversation.

## Play it back

Reflect your understanding back in pieces while you go. As soon as one
part is clear enough to describe (its purpose and audience, or the
behaviour of a single piece), write that part up in roughly 200 to 300
words, then return to questions about the following part. Reflections and
questions alternate until the end, and the last reflection covers whatever
remains.

Credit them only with what they actually said. What you supplied is your
proposal, with your reason. Close each piece by asking what is wrong or
missing.

Before sending a piece, test it: will they be looking at what it
describes, like a page, a screen, a timetable or a printout? If so, and
you have not yet made the visual companion offer, send that offer alone
first and keep the piece for the message after. Once they have accepted,
add a mockup beside the description.

## Size the work

After you grasp the wish and they have chosen an approach, tell them in
plain words how large the job is. They may overrule your size.

| Size | Design doc |
|------|------------|
| Small change | Short: what the two of you already covered, recorded |
| Project | The full design, described in the next section |

Both sizes carry an **Approaches** section: the options weighed (two or
three), what each gives up, the one they picked, and the reason. The
choice is made in conversation, before the doc exists.

When the job turns out bigger than you sized it, stop, say so, and move up
a size.

When it is really a bundle of independent projects, say that, agree their
order, and brainstorm each in turn.

## The written design

Write a plain document for a capable builder in the field who must plan from the page alone,
with no way back to your human partner. The doc covers:

- the intent and the reason behind it
- goals, non-goals and anti-goals
- constraints
- the approaches section (see above)
- the how-decisions they made, recorded as they made them
- what you leave to the builder

A small change gets the short form: the same points, a line or two each,
handed straight over with no builder check.

**Location.** For software, save the file as
`docs/specs/YYYY-MM-DD-<topic>-design.md` and commit it. For anything else, ask. If your human partner states a preference, it
beats both.

### Builder check

Projects only. Send a new subagent to do the check, using `builder-check-prompt.md`
from this folder. When you announce the write-up, tell your human partner
that a reviewer reads the doc first and that you may return with a few
questions, once. Do not hand the doc over until the check returns. Sort the
builder's questions into three piles:

| Pile | What goes in it | What you do |
|------|-----------------|-------------|
| Already answered | The conversation or the project settles it | Put the answer in the doc |
| Minor | A sensible builder could decide it, and the product would not change | Decide it, and mark the line in the doc as your call |
| Theirs | Only your human partner can answer, and the answer changes the product | Ask, as below |

Ask the "theirs" pile in a single message, the most important question
first. Fold their answers into the doc. Then hand it over together with a
short list of your own calls, so they can verify them as they read. That
single round is all the questions the check may cause. With no subagent
tool, read the doc yourself as that builder would.

<HARD-GATE>
No building until your human partner approves the design doc: the short
form for a small change, the full form for a project. "Building" covers
product code, scaffolding, dependency installs, new projects, and calling
an implementation skill. Looking around and reading are fine.

Two exceptions. When they waived the questions, the skill ends and the
gate goes with it. A spike they agreed to may be built, and it stays
labelled throwaway; to keep what it produced, they must make a new
request, and that request comes back to this gate.

After approval the plan comes next. Call writing-plans and nothing else.
</HARD-GATE>

## Red Flags

These six thoughts are the usual ways this skill gets skipped.

| What you think | What is true |
|---------|---------|
| "I'll offer a menu of what they might want" | A menu steers. Let them describe it in their own words first. |
| "I'll fill in sensible defaults" | Do, and announce each one. A default nobody heard cannot be turned down. |
| "I've answered their questions, so I'll write the doc" | The approaches come first, alone in a message. |
| "I should explain the process first" | Put your question. The process becomes visible by itself. |
| "They said 'sounds good' to the idea" | That approval covers only what you showed. A doc nobody has seen is unapproved. |
| "The spike works, I'll keep building on it" | Keeping a spike is a new request, and it goes back through the gate. |

## Visual companion

A local browser page for mockups, diagrams and prototypes. It is one tool
among others. Accepting it does not move every question into the browser.

**Offer it at the right moment.** Wait for the first time one of the cases
under Show, don't tell arises. Never open with it. The offer is a message
by itself:

> "A picture could say this faster than I can. Shall I open a browser tab and show you some mockups?"

If they say no, stay in text, and offer again only if they bring it up.

**Judge each question separately.** Would they grasp the answer faster by
looking? Anything shown as a picture (mockups, layouts, diagrams, designs set
side by side) goes to the browser. Scope, requirements, tradeoffs and
abstract choices stay in text. Mentioning a UI does not make a question
visual.

After they accept, read `visual-companion.md` in this folder before you
start the server.
