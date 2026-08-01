# Deferred Items — 260801-peq

Out-of-scope discoveries logged during execution (per scope boundary: not caused by this plan's changes).

| Item | Description | Status |
|------|-------------|--------|
| Pre-existing: `npm run lint` unrunnable | The frontend `lint` script is `next lint`, a command **removed in Next.js 16** (repo runs Next 16.2.10). Additionally, no ESLint toolchain is installed anywhere in the repo (`eslint` and `eslint-config-next` are absent from `apps/frontend/package.json` and `node_modules`, root and workspace). `npx tsc --noEmit` and `npm run build` both pass, but the lint gate in this plan's `<verify>` cannot run. Fixing requires adding the ESLint toolchain (package install + script update) — a toolchain change outside a "min" quick-fix scope; left for a future tooling task. | open |
