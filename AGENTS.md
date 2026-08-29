





## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.

## Inductions Platform
The SG-Inductions Platform is documented in `docs/INDUCTIONS_PLATFORM.md`. 
If you are working on features related to student applications, organization recruitment, or admin induction tracking across `/admin`, `/organisations`, or `/platform`, **you MUST read `docs/INDUCTIONS_PLATFORM.md` first**.
