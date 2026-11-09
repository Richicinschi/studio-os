# Platform notes: how each AI engine picks sources

Three conditions hold everywhere: you are in that engine's index, its bot may crawl you, and your passages can be lifted on their own. Past that, each engine weighs different things. This file holds no published statistics; if you quote a number, cite a public study or the vendor's documentation by name and date, and otherwise measure your own results (see the monitoring step in the main skill).

## Google AI Overviews

Built on Google's own index and its quality signals. Cited sources do not always match the normal top results, so a page outside the top results can still be cited when it has clear, extractable answers. Sourced claims in the copy and a sober, non-salesy tone are widely advised.

Google says structured data is not required for generative AI search; keep it only for rich results that exist and as machine-readable facts for other consumers.

Do: build topic clusters with internal links; name and link sources; show real author credentials; aim for Knowledge Graph presence (an accurate Wikipedia entry helps); cover "how to" and "what is" queries, which are the ones most likely to trigger overviews.

Google also published a markdown format for agent-readable bundles in June 2026. There is no sign overviews use it. See the okf file.

## ChatGPT

Search is widely reported to use Bing results plus OpenAI's own crawler (OAI-SearchBot), together with the model's own knowledge; OpenAI does not spell out the mix. Authority (backlinks and referring domains), content quality and platform trust all seem to matter. Fresh pages are likely to be favoured, and so are pages whose style matches the direct, conversational way the assistant itself answers. Third parties count: Wikipedia, Reddit and large publishers appear among cited sources.

Do: earn backlinks; refresh competitive pages monthly; write conversationally and directly; give verifiable numbers with named sources; keep a clean H1 > H2 > H3 outline.

## Perplexity

Always shows clickable sources. Its ranking mechanism (own index mixed with Google's, multi-pass reranking, trusted-domain lists, time decay) is reported, unverified: no vendor source was fetched.

Reported, unverified, to favour: FAQ markup in JSON-LD, public PDFs (whitepapers, reports; consider un-gating one version), frequent publishing, short self-contained paragraphs.

Do: allow PerplexityBot; host PDFs publicly; add Article schema with published and modified times; build depth in a niche.

## Microsoft Copilot

Uses Bing's index only: not in Bing, not cited. Reported, unverified: mentions and content on LinkedIn and GitHub help. Fast pages help readers anyway (measure yours with the Core Web Vitals tools).

Do: register in Bing Webmaster Tools (many teams only do Google), use IndexNow for quick re-indexing, state entity definitions plainly, publish on LinkedIn (and GitHub if relevant), let Bingbot crawl everything.

## Claude

With web search on, Claude is reported to query Brave Search, a separate index (Anthropic's subprocessor list names Brave Search for web search). Check your brand and key terms at Brave first. Reported, unverified: it cites rarely and favours precise, well-sourced, number-rich pages.

Do: confirm Brave visibility; allow Claude-SearchBot and Claude-User; pack in dated, attributed figures; use descriptive headings; cite authorities; be the most accurate page on the topic.

## Robots.txt for AI bots

One group allowing the bots that power search and citation. Training bots are separate and are not listed here, so a site that wants citations without training can keep blocking them:

```
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: Bingbot
Allow: /
```

Googlebot already serves Google Search and AI Overviews; Google-Extended is a separate token for Gemini training and grounding and does not touch Search. OpenAI and Anthropic say each of their bots is set on its own, so blocking GPTBot or ClaudeBot (training) does not by itself remove you from their search features. CCBot (Common Crawl) is training-only. User-initiated fetchers such as ChatGPT-User and Perplexity-User may ignore robots.txt. Check each vendor's current documentation before relying on any of this.

## Where to spend effort first

1. Google AI Overviews: most reach, and SEO groundwork usually exists. Sourced claims and people-first content; schema is optional.
2. ChatGPT: freshness, authority, matching its answer shape.
3. Perplexity: public PDFs, self-contained paragraphs.
4. Copilot (Microsoft-heavy audiences) and Claude (developer or analyst audiences) next.

Moves that help every engine: allow the bots, sourced statistics, monthly refreshes for competitive topics, clean heading outline, fast load, author bios with credentials.
