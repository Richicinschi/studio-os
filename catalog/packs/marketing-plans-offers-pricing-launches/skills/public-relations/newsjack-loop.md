# Reacting to the news

Adding your view to a story that is already moving can give free reach. Done badly it is awkward at best and damaging at worst. Speed matters more than anything else here, but judgment matters more than speed.

## When it fits

- New law or platform launch in your category, a rival pivots, a big acquisition.
- A major report appears and you hold sharper or opposing data.
- A public debate where you are truly an expert.
- Regular moments: earnings season, year-end reviews, conference weeks.

## When to stay out

- Tragedies, accidents and deaths. No exceptions.
- Political stories, unless the brand openly takes positions.
- Fields where you have no real expertise.
- A closed window: the story has been covered widely and you were not first (as a starting point, treat 48 hours old as closed).
- An angle that is only "we sell something for this". That is marketing, not news.

## The loop

1. Detect trending stories in your category.
2. Score each one with the rubric below and drop anything under the threshold.
3. Write 2 or 3 angles per story from the angle list.
4. Validate: do you really hold the data or experience to back the angle?
5. Draft a tight pitch for 3 to 5 reporters who cover the beat, each one tailored, never one text sent to all (pitch-writing.md, building-a-media-list.md).
6. Publish your take on your own channels too (see the public trail below). Posting needs the owner's word.

Present each candidate like this:

```
NEWSJACK CANDIDATE: <date>
Story, source, age: <headline, outlet, hours old>
Score: <weighted total>/80
Angles: 1. <angle>  2. <angle>
Recommended: <which and why>
Targets: <reporters, a reason each>
```

## Scoring

Rate each dimension 1 to 10 and multiply by the weight. The most you can reach is 80. Weights and the pass mark are the skill's own starting points; tune them.

| Dimension | Question | Weight |
|---|---|---|
| Timeliness | Under 24 hours old, window open? | 2x |
| Relevance | Squarely in your field? | 2x |
| Angle uniqueness | Can you say something nobody else is? | 2x |
| Authority | Do you have data, customers or experience? | 1x |
| Reach potential | Still growing, or already peaked? | 1x |

Pass mark: 50 of 80. Disqualify at once if the story is tragic, if your angle is just "I disagree" with nothing behind it, or if you have no opinion and only want a mention.

## Angle list

1. **Data take.** Your own numbers on the event.
2. **Contrarian.** The popular view is wrong; needs specifics, not contrarianism for attention.
3. **We called it.** You wrote about this earlier. Only if true; otherwise it wrecks trust.
4. **Customer impact.** Someone affected, ready to talk. Strong for B2B.
5. **Insider explainer.** Clears up a muddled story. Educate, do not argue.
6. **Trend connector.** One sign of a bigger shift; needs several examples.
7. **Founder view.** Fits op-eds, weak as a soundbite.

## Windows

How long a window stays open depends on the story type: breaking news closes fastest, a conference announcement closes the same day, regulation and data releases stay open longer. Judge it by how many outlets have already covered it, and log how long your own past newsjacks stayed open. If you cannot get from detection to a ready draft inside the window, skip it; aim for a short turnaround (under 2 hours is a starting point).

## Finding stories

Read-only lookups. Hosts are shown without a scheme; put the secure web scheme in front when you run them. jq is needed for the JSON ones.

```bash
# News search feed (use + for spaces in QUERY)
curl -s "news.google.com/rss/search?q=QUERY&hl=en-US&gl=US&ceid=US:en" \
  | xmllint --xpath "//item[position()<11]" - 2>/dev/null

# Tech discussion site, last 24 hours
SINCE=$(( $(date +%s) - 86400 ))
curl -s "hn.algolia.com/api/v1/search_by_date?query=QUERY&tags=story&numericFilters=created_at_i>${SINCE}" \
  | jq '.hits[] | {title, url, points, num_comments, created_at}'

# A topic community, top posts of the day
curl -s -A "newsjack-check/1.0" "www.reddit.com/r/COMMUNITY/top.json?t=day&limit=15" \
  | jq '.data.children[].data | {title, url, score, num_comments}'
```

To see who is on the story now, search it in a news feed with a browser tool, note the bylines, then check each reporter's profile.

For regular monitoring keep a "Newsjacking topics" section in `.agents/listening-sources.md`: category queries, rivals by name, and publishers of reports whose data drops you watch.

## What goes wrong

- Tragedy-jacking.
- The forced fit: a "take" that turns out to be about your product.
- The empty take: "we are watching closely" gives nothing to quote.
- Speed without judgment: a bad take first is worse than a good one late. Run a short brand check (30 minutes is a starting point).
- One angle sent to many reporters. They talk.
- Slow follow-through: a reply in 20 minutes, an answer 6 hours later.

## The public trail

Publish a short post with your take first and link it in the pitch, so the reporter sees you have been thinking about it. No time to publish means not ready to pitch. Publishing waits for the owner's word.
