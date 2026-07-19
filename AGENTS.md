- Never try to access .env
- Ensure typesafety in writing your code. We use typescript, and we need to ensure there are no cascading type issues. Always run typechecks when making changes. 
- Don't always do build tests. Only do build tests if you make a change of more than 50 lines of code. 
- Use the caveman skill in your chat responses unless mentioned otherwise. 
- To make context and user intent very clear, ask questions whenever needed for clarifications. 
- Before creating new components, always check `src/components` to see if a component already exists that can be used. Additionally, always check the /shadcn-ui skill and the shadcn MCP if a similar component exists. 
    - For components, instead of writing code yourself (incase CLI doesn't work), try asking the user to source the code, or enter a particular command. Only write the code yourself if explicitly asked to. 
- For any frontend related tasks, follow the instructions in `.agents/instructions/FRONTEND.md`. 
- If given a PRD, clarify whether a wireframe needs to be made. If yes, then first refer to the wireframing section in `.agents/instructions/FRONTEND.md`. Then, draft an implementation plan and confirm with the user before starting implementation. 
- Always handle nulls properly.
- Always use `platform.log()` instead of `console.log()`
- When creating a new tool from scratch (after wireframe creation is done/bypassed), refer to `.agents/instructions/PAGE.md` for instructions.
- `.agents/ARCHITECTURE.md` tells you overall about the high level structure of the repo. It is also completely indexed using graphify, so refer to the `graphify` section to understand it. 
- Always use the `/nextjs-best-practices` skill and `/nextjs-app-router-patterns` to understand the best practices while working in this repo, since it is next based. 




## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
