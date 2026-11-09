# Building a media list

A short, current list of reporters who really cover your beat. A good starting size is 20 to 40 names (a starting point, not a measured value), never a few hundred pulled from a database. This is a practice you keep up over weeks, not a one-off task.

## Check each candidate

- Read their last 5 pieces. Are they writing about your area right now?
- Note the outlet. Does its audience include your buyers or users?
- Read the author bio for the topics they own.
- Look at what they post publicly this week.
- Find an email address from the author page, a media database profile, or the outlet's about page.
- If a media database profile exists, read the recent topics and any stated pitch preferences.

## Where candidates come from

- Work backwards: pick 5 articles about rivals or your category and note the bylines.
- Topic search in a media database (a free tier is enough to start).
- Public lists of reporters on social platforms for your niche.
- Professional network search for "journalist" plus your category, filtered by recent activity.
- Newsletter author pages on the common publishing platforms; their writers can be pitched.
- Podcast hosts. Listen to one episode before any pitch, no exceptions.

## Skip these

- Big paid media databases at an early stage: costly and more than you need.
- Anyone silent for a long stretch (a starting point is 6 months); they may have left.
- Generic editor-in-chief addresses; those pitches get ignored or passed to juniors.
- Anyone whose bio says they take no PR pitches. Respect it.

## Score each reporter

Give each 1 to 10 on four dimensions, apply the weight, add up, divide by 8 to return to a 1 to 10 scale, and rank. Work the top 20. The weights and tier cut-offs are the skill's own starting points; tune them.

| Dimension | Question | Weight |
|---|---|---|
| Beat match | Do they cover your exact category? | 3x |
| Reach | Size of the outlet audience and how far their pieces travel | 2x |
| Engagement | Do they answer pitches or replies in public? | 2x |
| Recency | Did they write on a related topic in the last 30 days? | 1x |

Tiers by scaled score: 8 to 10 is tier 1, a personal pitch with an original angle written fresh each time. 5 to 7 is tier 2, a standard pitch with light customisation. Below 5 is tier 3: skip, unless the story is exceptional.

## Research with a browser

If a browser-driven tool such as dev-browser is available, open the reporter's author page and read the last 5 headlines and dates, then their public social profile for current topics, then their professional profile to confirm the present role. If no such tool exists, do the same by hand and ask the user to confirm anything you could not verify. Record the result as a card:

```
REPORTER CARD: <name>
Outlet: <outlet>
Beat: <topics from the last 5 pieces>
Recent angle: <pattern you noticed>
Recent public activity: <what they post about>
Score: <scaled points>/10
Best pitch shape: <one of the six in pitch-writing.md>
Email: <confirmed or unconfirmed>
```

## Finding an email

Most outlets follow a naming pattern such as first name only, first.last, or first initial plus last name at the outlet domain. A lookup service can suggest the pattern. Treat any guessed address as unconfirmed and say so. Do not send a test message to check it; ask the owner first.

## Keep the list alive

Store it in `.agents/media-list.md` (or a CSV). Refresh monthly, because reporters change jobs often. Suggested columns:

```markdown
## Tier 1
| Name | Outlet | Beat | Last contact | Last coverage | Email | Score |
|------|--------|------|--------------|---------------|-------|-------|
| (name) | (outlet) | (beat) | (date) | none yet | (address) | (points) |
```

Never put made-up names in the real list; fill rows only with people the user or research actually confirmed.
