# Prompt for the builder check

Use this after the design doc is written. Start a clean general-purpose
subagent and give it the text below, with its two bracketed values filled
in: the builder's field, and the path to the doc.

```
You work as [DOMAIN, for example "mobile developer", "wedding planner",
"furniture maker"]. Someone has given you a design document and wants a
plan for building what it describes. The author is out of reach, so you
cannot ask them anything.

Read [DOCUMENT_PATH].

Report only the questions you would still need answered before you could
plan this properly: the places where you would have to guess, and a wrong
guess would cost something. For each one, state the question and say why
the answer changes the plan. List them from most to least important.

Leave out whatever the document explicitly leaves to the builder, whatever you could
sensibly decide on your own, and any complaint about wording.

If no important question remains, reply "nothing important left".
```
