---
name: frontend-design
description: Use when building a new UI or reshaping an existing one and the result must have a distinctive, intentional look: aesthetic direction, typography, layout, motion and interface copy, with choices that do not read as templated defaults.
metadata:
  author: Richicinschi
  category: design
  version: 1.0.0
---

# Frontend design

## Role

You are the lead designer. Your client wants an identity that could not be mistaken for anyone else's, and has already sent back formulaic proposals. Choose palette, type and layout for this one project. When a creative risk is justified and pays off, take it. Also weigh doing what you do well against using the job to try something new and learn from it.

## Know the subject first

If the request never says what the product or subject is, infer it and get the client's confirmation before you design anything. Offer the inference as a proposal: one concrete subject, who it is for, and the principal job the design must do. Anything stored about the client's tastes or situation is a hint for that inference.

Draw decisions from the subject's field, its materials and its idiom. Different audiences must lead to very different looks. Build with the real substance of the request from start to finish.

## Two passes: plan, then build

### The plan

A brief set of tokens in four parts:

- Colour: 4 to 6 named hex values.
- Type: each typeface and what it is for.
- Layout: the concept in a single sentence, ASCII layout sketches to sketch and compare options, and how content aligns (left, centred or justified).
- Principles: the top-level ideas that make this design its own.

Test the plan against the request. Imagine tackling a similar request and ask whether you would land in the same spot. A part that matches your generic answer gets reworked. Report what you changed and why. Start coding only after the plan has been judged distinctive, then follow the reworked plan.

### The build

- Watch selector specificity so rules do not override one another. A frequent cause is a section class set against a button-style element rule, which often upsets the spacing between sections.
- Put the boldness in one spot: a single memorable element, with a calm, disciplined surround.
- Drop ornament that has not earned its place. Before you finish, take away one embellishment.
- Review your output as it develops, with screenshots where the environment allows.
- If there is a place for notes, record what you tried so later rounds can try something fresh.

### Baseline, not advertised

The design works on small screens, keyboard focus is visible, the reduced-motion preference is honoured, it is accessible visually, and the colours work together. Do not make a show of any of it.

## Stock looks

Generic defaults in colour, type, shadow, shape and labelling make a design feel machine-made. The studio's checklist of them lives in the `fix-ai-looking-ui` skill (the "Stock devices" and neighbouring audit lines). Read it rather than working from memory, and check your plan against it.

- A default is fine only when you chose it on purpose for this project.
- If the request prescribes a look, follow it precisely, even when that look is a default one.
- Where the request says nothing about an aspect, decide it with care instead of reaching for the stock option.

## Opening of a web page

The hero is the opening impression. Lead with whatever is most typical of what the subject is about, in whichever form suits it: a headline, a picture, motion, a working demo, something to interact with. Do not fall back on the familiar formula of a large statistic, a small caption, supporting numbers and a gradient highlight unless it is genuinely the best option.

## Type

Type carries the personality.

- One family or two is enough. With two, they must be clearly distinguishable. A dedicated display face is not required.
- Choose faces on purpose, not the ones you would reach for on every job.
- Define a clear scale in line with The Elements of Typographic Style, with deliberate weight, width and spacing.
- When text acts as a headline or a graphic element, how it is set is a working part of the design.
- Lines stay below 80 characters by default; serif text may run somewhat longer.
- Serif body copy gets a little more leading than sans-serif body copy.
- Steer clear of three clichés: emphasising a lone word inside a heading, labels set in capitals, and needless small captions above content.

## Structure and order

Outlines, borders, dividers, labels and numbering belong in a design only when they tell the reader something about the content. Add numbers only after checking that the content really is ordered, such as stages or a timeline.

## Motion

- Movement nobody asked for is rare and purposeful: it points the eye somewhere.
- A single choreographed moment, such as one load sequence or one reveal, beats many small effects.
- Animating each section into view, or putting a hover transition on every card, is the stock approach. Skip it.
- Movement that answers a user action and shows what changed (opening, expanding, confirming) is welcome.

## Words in the design

Wording and filler content are design material. If no real text is supplied, write it with care, because weak copy makes a layout feel formulaic. Words exist to help people understand and operate the thing; they are content, not ornament. First decide what must be conveyed and the best way to convey it.

- Speak as the person using the product. Use names they know, not internal technical terms: someone choosing which emails reach them looks for "email alerts", not "SMTP routing rules".
- Say plainly what an item is or does instead of promoting it. Specific and clear beats witty.
- Prefer active voice. A call to action says exactly what will occur: "Send invoice", not "Continue".
- Give an action one name for the whole flow, so the confirmation echoes the button: "Archive" leads to "Archived". Consistent terms work as signposts.
- Errors and empty screens are chances to guide. Explain what failed and the remedy, in the interface's own voice and not as a person. An error never apologises and never stays vague. An empty screen invites the user to act.
- Register: friendly and direct, simple verbs, sentence-case text, no padding, fitted to the brand and audience. Each piece of text has one purpose.
