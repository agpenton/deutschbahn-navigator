**Build an MCP Claude Desktop extension `.dxt` named `deutschbahn` (author: agpenton) with features:**

1. Station Search, 2) Station Info, 3) Real-time Departures, 4) Real-time Arrivals, 5) Facility Status, 6) Journey Planning.

**Follow the style of** https://github.com/openbnb-org/mcp-server-airbnb (TypeScript MCP server, zod, tests, CI).  
**Repo URLs:** profile https://github.com/agpenton • repo https://github.com/agpenton/deutschbahn-navigator
**Use as reference** https://www.desktopextensions.com/#documentation

**Implement exactly:**

- Node 20+, TypeScript, `@modelcontextprotocol/sdk`, `zod`, `axios` (+retry), `vitest` + `nock`, `eslint`/`prettier`, `tsup`.
- Service methods: `searchStations`, `getStationInfo`, `getDepartures`, `getArrivals`, `getFacilities`, `planJourney` (typed DTOs, ISO times). Wrap DB transport REST; mock in tests.
- MCP tools: `deutschbahn.searchStations|stationInfo|departures|arrivals|facilityStatus|planJourney` with strict zod schemas and helpful descriptions.
- `manifest.json` as specified (name/version/author/homepage/mcp).
- Layout, scripts, `scripts/package-dxt.mjs`, and workflows (`ci.yml`, `release.yml`) exactly as in the spec above.
- Tests covering all features + schema validation; no live HTTP; coverage ≥95% on `src/services` and `src/mcp`.

**Versioning & Changelog:**

- Use Changesets; initial changeset `feat: initial deutschbahn extension`.
- The version should change according to semantic versioning rules (MAJOR.MINOR.PATCH). If you make incompatible API changes, increment the MAJOR version. For new features, increment the MINOR version. For bug fixes, increment the PATCH version.

**Branch & PR:**

- Work on `feat/deutschbahn-mcp`, commit in steps, open PR titled `feat(deutschbahn): MCP extension (.dxt) with tests` with label `IT`.

**Acceptance:**

- CI green; `.dxt` artifact produced; Release created on merge with asset + changelog.

Now scaffold and implement everything accordingly.
