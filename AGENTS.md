# Repository Guidelines

- Keep sizing business logic in `src/domain` or `src/services`, not in React components.
- Preserve local-first behavior. Body measurements and recommendation history must stay local by default.
- Do not present sample guides or ontology rules as official standards.
- Prefer additive migrations. Avoid renaming existing tables or files unless there is a documented integration reason.
- When adding a feature, connect it through navigation, state or persistence, tests, and docs; do not leave orphan files.
- Run `pnpm lint`, `pnpm test`, and `pnpm build` before handing off when the local toolchain permits it.
