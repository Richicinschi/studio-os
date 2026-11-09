# Listening and daily comment triage

Purpose: replace aimless scrolling with a short ranked list of conversations worth joining. Listening is for commenting and relationships. When the job is to write posts, use the main skill; listening only feeds it with angles, wording and objections.

## Sample asks
- "Top 10 posts to comment on today."
- "Who is unhappy with [competitor] right now?"
- "Find people asking for a tool like mine."
- "What did my 25 target accounts post in the last day?"
- "What is the talk around [topic] this week?"

## The daily loop (about 20 minutes)
1. Pull new items from the saved sources: accounts, keywords, communities, tags.
2. Filter out anything older than 24 hours, thin, or off-topic.
3. Score with the rubric below and keep the best 10.
4. Draft one comment per item, sized to its tier.
5. The user reads, edits and posts by hand, and notes which went live. Nothing is posted for them, and nothing goes out without the owner's word.
6. Log what was commented and what drew replies; that log is your learning data.

Output shape:
```
TOP 10, [date]

1. [Score 62/80] @name, LinkedIn, 3h old
   Excerpt: "Our team just moved off spreadsheets and..."
   Why it ranks: matches the buyer profile (ops lead, 20 to 80 staff); asking for options
   Draft comment: [text]
   Link: [post address]
```

## Scoring
This rubric and its weights are the skill's own starting point; adjust them to your results.
Rate each post 1 to 10 on five dimensions, multiply by the weight, add up (maximum 80), rank.

| Dimension | Question | Weight |
|---|---|---|
| Buyer fit | Is the author your customer or someone who influences them? | x2 |
| Intent | Do they voice a problem, a question or a shopping need? | x2 |
| Traction | Are likes and comments climbing? | x1 |
| Room to help | Can you add something concrete and useful? | x2 |
| Freshness | Posted in the last 1 to 4 hours (early replies win, notably on LinkedIn) | x1 |

Strong intent sounds like: "Anyone know a tool that does X?", "Why is [category] such a slog?", "We left [competitor] because...", "Is [competitor] worth the price?", or a public complaint about a competitor.

Skip the post when: the author is neither a buyer nor an influencer; it is over 24 hours old with 50 or more comments; it is empty motivation or machine-sounding filler; it is a promo thread where replies get no reach; or all you could say is "nice post".

## Comment tiers
Match effort to the opportunity.
- Tier 1, relationship (target account, strong fit, clear intent): a specific insight or counter-example, a real experience with concrete detail, a follow-up question that invites an answer. 2 to 4 sentences, no link.
- Tier 2, visibility (busy post, nearby topic): one sharp point in one or two sentences, for example "Yes, and the piece people skip is [X]".
- Tier 3, upkeep: a precise reaction that quotes a line. One sentence.
Never: "great post", emoji alone, "+1", or hype phrases.

## Free tooling
Needs `curl` and `jq`; `xmllint` only for feeds. The host variables stand for: REDDIT_HOST www.reddit.com, HN_SEARCH_HOST hn.algolia.com, BSKY_PUBLIC_HOST public.api.bsky.app, VIDEO_HOST www.youtube.com, each reached over https. Confirm each service's current endpoint, access rules and terms first. Reddit's unauthenticated JSON pages and Bluesky's public search endpoint have been reported to answer 403 or demand sign-in, so a recipe below may fail; if it does, use the service's authenticated API under its terms or read the pages by hand, and never look for a way around a block. keep the request rate low, and send a descriptive user agent. If a service asks you to stop, stop.

Reddit, newest posts in a community:
```bash
curl -s -A "triage-notes/0.1" "$REDDIT_HOST/r/COMMUNITY/new.json?limit=25" \
  | jq '.data.children[].data | {title, author, permalink, score, num_comments, created_utc, text: (.selftext | .[0:300])}'
```
Reddit, keyword search over the last day:
```bash
curl -s -A "triage-notes/0.1" "$REDDIT_HOST/search.json?q=PHRASE&sort=new&t=day&limit=25" \
  | jq '.data.children[].data | {subreddit, title, permalink, author, score, created_utc}'
```
Phrases worth trying: "alternative to [tool]", "which [category] should I pick", competitor names, your own brand name.

Hacker News through its search API (stories, then comments, last 24 hours):
```bash
SINCE=$(( $(date +%s) - 86400 ))
curl -s "$HN_SEARCH_HOST/api/v1/search_by_date?query=PHRASE&tags=story&numericFilters=created_at_i>${SINCE}" \
  | jq '.hits[] | {title, url, author, points, num_comments, created_at, id: .objectID}'
curl -s "$HN_SEARCH_HOST/api/v1/search_by_date?query=PHRASE&tags=comment&numericFilters=created_at_i>${SINCE}" \
  | jq '.hits[] | {author, comment_text, story_title, id: .objectID}'
```

Bluesky public search:
```bash
curl -s "$BSKY_PUBLIC_HOST/xrpc/app.bsky.feed.searchPosts?q=PHRASE&limit=25&sort=latest" \
  | jq '.posts[] | {author: .author.handle, text: .record.text, likes: .likeCount, replies: .replyCount, uri}'
```

Feeds (blogs, video channels, podcasts):
```bash
curl -s "$VIDEO_HOST/feeds/videos.xml?channel_id=CHANNEL_ID"
curl -s "$BLOG_HOST/feed/" | xmllint --xpath "//item[position()<6]" - 2>/dev/null
```

## LinkedIn and X
They have no useful open API. A browser-driving tool with a saved login session works: the user signs in once, you open the target page, read the text, score, draft. Do not like, follow, comment or post through automation; it risks the account and breaks the manual-posting rule. Check each site's terms on automated reading before you begin, and stop if it is not allowed.

Pages worth opening:
| Page | Shows |
|---|---|
| a person's recent-activity page on LinkedIn | their latest posts without the algorithm |
| a LinkedIn hashtag page | posts on a topic |
| the LinkedIn home feed | algorithmic, weak for triage |
| a profile on X | one account |
| X search sorted by latest | chronological keyword stream |
| a private X list | the cleanest view of target accounts |

Tips: put target accounts into a private list on X and open the list; scroll a few times so more posts load before reading.

Paid options if you prefer not to drive a browser: LinkedIn's sales search with saved searches, engagement tools for LinkedIn and X, saved columns in X's pro viewer. Costs money, so ask first.

Instagram and TikTok: no workable open route, and automation gets detected. Use the apps' own saved searches and tag follows by hand.

## Platform manners
Rules of thumb from the skill, not measured values; check them against your own results.
- LinkedIn: the first hour matters; aim at posts under 2 hours old from target accounts; comments with substance travel further than bare reactions; replying to other commenters shows you to their network; tag the author only when it adds context.
- X: answer big accounts within about 30 minutes; a quote post is better when you add real substance; a multi-post reply shows effort; skip dogpiles, relationships beat attention.
- Reddit: read the community rules (some ban promotion); build standing before linking anything of yours; long specific answers win; answer the question before mentioning your product, if at all.
- Hacker News: the bar is high and thin comments sink; founders may join threads about their product if open about it; old threads about your category are worth reading.
- Bluesky: smaller; tech and indie circles are active; custom feeds replace keyword search for browsing.

## Common requests
Top 10 today: pull from account feeds, saved searches, relevant communities and the last 24 hours of Hacker News; score; list with drafts.
Unhappy with a competitor: search communities for the name excluding its own site, search Hacker News comments, search Bluesky; treat switching language ("moving from", "alternatives to", "fed up with") as high intent.
Brand mentions this week: search each source for the brand name and handle; report for each whether a reply is needed, the tone (positive, negative, neutral) and a suggested response.
Missed posts from target accounts: for each account keep its feed address or handle, fetch the last day, sort by score.

## Source list
Keep a persistent list at `.agents/listening-sources.md` and read it at the start of each loop. Start from [listening-sources-template.md](listening-sources-template.md).
