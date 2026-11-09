# Where the shape index comes from

The compressed file `shape-index.json.gz` next to this notice is not the studio's work. It is the
shape search index published in the jgraph/drawio-mcp repository
(<https://github.com/jgraph/drawio-mcp>, path `shape-search/search-index.json`), which that project
builds from the shape libraries shipped with the official draw.io (diagrams.net) client. Both the
repository and the client are released under the Apache License 2.0, and that licence applies to this
data.

What it holds:

- One record per palette shape, with the fields `style`, `w`, `h`, `title`, `tags` and `type`.
- 10,446 shapes in all. The general shape sets come first; the families include network, flowchart,
  electrical, P&ID, BPMN, UML, Kubernetes, Cisco and the three big clouds (GCP, Azure, AWS).

How the skill uses it: `scripts/shapesearch.py` reads the file and never writes it, so a diagram gets
the exact official style string for a shape instead of a guessed one.

To bring the index up to date with a newer draw.io release, run `shape-search/generate-index.js` in the
drawio-mcp repository and compress the result:

```bash
gzip -9 -c search-index.json > data/shape-index.json.gz
```
