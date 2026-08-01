---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-08-01T10:33:26.684Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 260801-peq | unrun-verify | apps/frontend/package.json | 8 | npm run lint unrunnable: eslint/eslint-config-next not installed anywhere in repo and 'next lint' was removed in Next.js 16 (pre-existing, blocks all plan lint gates) | open |  | 2026-08-01T10:33:26.684Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "260801-peq",
    "file": "apps/frontend/package.json",
    "line": 8,
    "description": "npm run lint unrunnable: eslint/eslint-config-next not installed anywhere in repo and 'next lint' was removed in Next.js 16 (pre-existing, blocks all plan lint gates)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T10:33:26.684Z",
    "resolved_at": null
  }
]
````
