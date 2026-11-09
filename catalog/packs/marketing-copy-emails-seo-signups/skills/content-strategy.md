---
id: content-strategy
title: Content strategy
description: Content strategy, content planning, content roadmap, editorial calendar, content marketing, content ideas, content pillars, topic clusters, blog strategy, blog topics, what should I write about, what content should I create, I don't know what to write. Not writing (copywriting, seo-audit, social).
---

# Content strategy

## When to use

Typical wordings: "plan our blog", "what should we publish this quarter", "I have a product and no idea what to write about", "build topic clusters", "turn these call notes into content ideas". The job is choosing what to make and in what order, not writing it.

Neighbouring skills take over here:
- Writing one page or post: copywriting.
- Auditing existing pages for search problems: seo-audit.
- Getting cited by AI answer engines: ai-seo.
- Thousands of templated pages: programmatic-seo.
- Page hierarchy, navigation, URLs: site-architecture.
- Email programmes: emails.
- Social posts: social.

## How it works

You act as a content strategist. Every piece should earn traffic, authority or leads by being findable, passed around, or both.

1. **Collect context.** Look for a product marketing context file first: `.agents/product-marketing.md`, then `.claude/product-marketing.md`, then the older single file `product-marketing-context.md`. If one exists, read it before asking anything, and ask only for what it does not cover or what is specific to this task. Whatever is missing, ask the user for it. The four areas:
   - Business: what the company sells, who buys, what content is for (traffic, leads, awareness, authority), which problems the product solves.
   - Customers: questions asked before buying, objections heard in sales, themes in support tickets, the words customers use for their problem.
   - Current state: existing content and what performs, available writers, budget and time, formats you can produce (text, video, audio).
   - Market: main competitors and visible content gaps.
   Then ask the sharp questions: what patterns show up across your latest batch of customer conversations; which questions repeat on sales calls; where competitors' content is weak; which insights from your customers nobody has published; which existing page converts best and why.

2. **Tag every idea as findable, passed around, or both.** Rank findable first, because search is the steady base. Findable content meets demand that already exists. Passed-around content creates demand.
   Findable checklist:
   - One target keyword or question per piece, with the intent matched exactly.
   - A title that reads like the query, and headings that echo how people search.
   - The keyword in the title, the headings, the opening paragraph and the URL.
   - Complete coverage, so no obvious follow-up question goes unanswered.
   - Data, examples and links to authoritative sources.
   - Clear positioning, structured pages and the same brand description everywhere on the web, so AI systems can pick it up.
   Passed-around checklist:
   - Open with a new insight, original data or a counterintuitive claim.
   - Argue against received wisdom, with reasons.
   - Tell stories that produce a feeling.
   - Give readers something that makes them look sharp or lets them help a friend.
   - Tie it to a current trend or an emerging problem.
   - Share honest, even uncomfortable, experience others can learn from.

3. **Choose formats.**
   Findable formats:
   - Use-case pages: persona plus situation, aimed at long-tail searches. Invented examples: "invoicing for wedding photographers", "route planning for courier riders", "stock counts for market stall owners".
   - Hub and spoke: one broad overview (the hub) plus narrower pages (spokes) that link back and forth. Write the hub first, then the spokes, and interlink on purpose.
     ```
     /hub-topic
     ├── /hub-topic/spoke-a
     ├── /hub-topic/spoke-b
     └── /hub-topic/spoke-c
     ```
     Most sites do fine with every post under the blog path. Reserve dedicated hub URL trees for large subjects with several layers of depth.
   - Template libraries: they capture high-intent searches such as "weekly meal plan template". Each template must be useful alone and should show how the product makes it better.
   Passed-around formats:
   - Thought leadership: put a name to something everyone feels but nobody has said, challenge a habit with evidence, share a candid experience.
   - Data pieces: anonymized product data, analysis of public datasets, or original experiments with published results.
   - Expert roundups: a panel of experts each answers one narrow question, and every panelist helps distribute the result.
   - Case studies: challenge, solution, results, lessons.
   - Behind-the-scenes posts, for instance a candid account of how the first 100 paying users were won.
   Large-scale templated generation belongs to programmatic-seo.

4. **Pick 3 to 5 pillars.** A pillar is a core subject the brand wants to own. Each one gets a cluster of related pieces. Find candidates four ways: from the product (problems it solves), from the audience (what the ideal customer must learn), from search (topics with volume), from competitors (what they rank for).
   ```
   Pillar
   ├── Cluster 1: article, article, article
   ├── Cluster 2: article, article, article
   └── Cluster 3: article, article, article
   ```
   A pillar passes when it fits the product, matches what the audience cares about, has search or social interest, and is wide enough to feed many subtopics. Internal links between related posts are usually enough structure.

5. **Map keywords to the buyer stage.**
   - Awareness: "what is", "how to", "guide to", "introduction to". Example: "what is a sourdough starter", "how to feed a starter".
   - Consideration: "best", "top", "vs", "alternatives", "comparison". Example: "best stand mixers for bread", "Brand X vs Brand Y".
   - Decision: "pricing", "reviews", "demo", "trial", "buy". Example: "bakery software pricing", "how to pick a plan".
   - Implementation: "templates", "examples", "tutorial", "how to use", "setup". Example: "recipe costing template", "set up ingredient tracking".
   Pick the stage that matches the evidence you have. Sales talk about price means decision content. Support tickets about setup mean implementation content.

6. **Mine ideas from the evidence the user has.** Use whichever sources exist.
   a. Keyword exports (Ahrefs, SEMrush, Google Search Console): group into clusters, tag buyer stage and intent (informational, commercial, transactional), flag quick wins (low competition, decent volume, high relevance) and gaps (competitors rank, you do not). Return a table: keyword, volume, difficulty, buyer stage, content type, priority.
   b. Call transcripts: pull out questions (FAQ or post material), pains in the customer's words, objections to answer early, exact phrases worth reusing, and competitors they compared you to. Give each idea with its supporting quote.
   c. Survey answers: read the open text for topics and wording, treat any theme mentioned by 30 percent or more of respondents as high priority, note requested resources and preferred formats.
   d. Forums via web search: Reddit and Quora with site-restricted queries (`site:reddit.com topic`, `site:quora.com topic`), plus Indie Hackers, Hacker News, Product Hunt and industry Slack or Discord groups. Look at top posts, frustrations in comments, and the answers people upvote. Extract FAQs, misconceptions, open debates, problems being solved and the vocabulary used.
   e. Competitors via a site-restricted query on their blog (`site:competitor.com/blog`): which posts get comments and shares, which topics recur, what is missing, what their case studies reveal, how they organize pillars, categories and formats. Then list where you can do better, which angles they miss, and which of their pages are stale.
   f. Sales and support staff: objections, repeated questions, ticket patterns, success stories, and the real problem behind each feature request.

7. **Score and rank.** Weights: customer impact 40 percent, content-market fit 30 percent, search potential 20 percent, resource cost 10 percent. Score each factor from 1 to 10 and compute the weighted total.
   - Customer impact: how often it came up in research, how many customers share the problem, how painful it is, how valuable those customers are over time.
   - Content-market fit: matches problems the product solves, lets you add insight from your own customers, has stories to back it, leads naturally toward the product.
   - Search potential: monthly volume, competition, long-tail spin-offs, rising or falling interest.
   - Resource cost: whether you have the expertise, how much extra research is needed, which graphics, data or examples must be made.
   Format the result as a table with one row per idea and a total column. Example row: "Costing a recipe", impact 9, fit 8, search 6, resources 7, total 7.9 (9 x 0.4 + 8 x 0.3 + 6 x 0.2 + 7 x 0.1).

8. **Deliver the strategy.** Three parts:
   - Pillars: 3 to 5, each with its rationale, its subtopic clusters and how it connects to the product.
   - Priority topics: for each piece give the title, findable / passed-around / both, content type, target keyword with buyer stage, and the research that justifies it.
   - A topic cluster map showing how the pieces link.

If the user plans to run a headless CMS for this content, use the references:
- [Choosing between headless and traditional](content-strategy/references/cms-selection.md)
- [Content models and a rollout checklist](content-strategy/references/cms-content-models.md)
- [Editorial workflow, roles and platform comparison](content-strategy/references/cms-workflow-and-platforms.md)

## Checks before done

- Every recommended piece is tagged findable, passed-around or both, and traces to a named piece of evidence (a call, a survey line, a forum thread, a keyword row), not a hunch.
- There are 3 to 5 pillars, each passing the four pillar tests.
- Scores add up using the stated weights.
- The output has all three parts: pillars, priority topics, cluster map.
- Competitor and forum findings came from searches you actually ran, and anything unverified is labelled as such.
- No sending, posting or paid tool use happened without the user agreeing first, with the cost stated.
