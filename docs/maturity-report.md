# easyworkflow maturity report

**Package:** `@malevin/easyworkflow` **Version:** 0.1.2 (not bumped)  
**Date:** 2026-10-02  
**Scope:** Documentation, testing, project structure, Storybook, E2E

---

## What changed per step

### Step 1 — Reconnaissance and baseline
- Verified git initialized, working tree clean (no baseline commit required).
- Baseline: `npm run build` ✅, `npm run typecheck` ✅. No test or lint scripts existed.
- Package manager: **npm** (`package-lock.json`). Node v26.1.0 / npm 12.0.2.

### Step 2 — Documentation overhaul (`9eee908`)
- Rewrote `README.md` with required sections: hook, demo/screenshot, key features, quick start, advanced examples (custom adapter + events/actions), API reference, contributing, license.
- Fixed `LICENSE` to standard MIT format.
- Added `CONTRIBUTING.md` and `CHANGELOG.md` (0.1.2 + Unreleased; version not bumped).
- Added/ completed JSDoc on public types, utils, hooks, registries, adapters, and component prop interfaces.

### Step 3 — Test + lint infrastructure (`a785103`)
- Installed **vitest 3.2.7** (3.x pinned for Vite 5 peer compatibility; vitest 5 requires Vite 6+), jsdom, Testing Library, `@vitest/coverage-v8`.
- Added `vitest.config.ts` (jsdom, setup file, 60% coverage thresholds) and `src/test/setup.ts` (React Flow jsdom mocks).
- **Lint tooling was missing** and was added here because the plan required `npm run lint` to exist and pass: ESLint 9 flat config + typescript-eslint + react-hooks + Prettier 3.
- Code fixes to satisfy lint: unused imports/vars, render-time ref writes → state/effects, removed JSX-in-try/catch in FlowNode, locale re-resolution → `useMemo`, wired previously-dead sync/validate/execute/back handlers into default toolbar actions when props/adapter support them.
- Smoke tests: `WorkflowEditor` with `emptyAdapter` and `initialCards`.

### Step 4 — Unit and component tests (`dad42c1`)
- Unit: utils (ids, categories, localization, RTL), registries, `useWorkflow` hook.
- Component: `FlowNode`, `Toolbar`, `Canvas`/edges (React Flow + `waitFor` for measurement). No standalone Edge component exists — edges are React Flow defaults configured via Canvas/`features/edges`.
- Improved jsdom mocks so React Flow measurement completes.

### Step 5 — Adapter mock + integration tests (`dd31edd`, cleanup `dd47d0b`)
- `src/test/mocks/mockAdapter.ts`: in-memory `APIAdapter` with save/load spies and failure injection.
- Integration: save payload (nodes/edges/nodeTypes), load population, toast on failure, save→load round-trip.
- Removed accidentally committed `coverage/` artifacts; gitignored.

### Step 6 — Storybook (`51a31c3`)
- **Storybook 8.6.18** (`storybook@8.6.18` and matching `@storybook/*` packages).
- `.storybook/main.ts` + `preview.ts`; stories for FlowNode, Canvas (edges), Toolbar, WorkflowEditor with autodocs and controls.
- Scripts: `storybook`, `build-storybook`.

### Step 7 — Feature restructure (`f95fa0e`)
```
src/
  adapters/                 # was api/
  features/workflow-editor/ # was components/WorkflowEditor
  features/nodes/           # was components/FlowNode
  features/edges/           # NEW: EasyFlowEdge, defaultEdgeOptions, connectionLineStyle
  components/               # Canvas, Palette, BaseNodeEditor, NodeEditorPanel, Toolbar, common
  hooks/ types/ utils/ registry/ i18n/ styles/
```
- **100% of previous public export names preserved** in `src/index.ts`.
- New exports only: `EasyFlowEdge`, `defaultEdgeOptions`, `connectionLineStyle`, plus prop types (`WorkflowEditorProps`, `CanvasProps`, `ToolbarProps`, `PaletteProps`, `BaseNodeEditorProps`, `NodeEditorPanelProps`, `PanelMode`).
- Canvas imports FlowNode from `features/nodes` and edge defaults from `features/edges`.

### Step 8 — Playwright E2E (`dcb6c88`)
- `@playwright/test` 1.63.0 + `playwright.config.ts` + Vite harness under `e2e/`.
- Tests: add nodes from palette → drag-connect handles → Save → assert adapter payload (2 nodes, 1 edge, correct `nodeType`s, edge endpoints); load via `?workflowId=` populates editor and records `loadWorkflow` id.
- **Product fix:** default Save now calls `adapter.saveWorkflow` when available (previously only `onSave` was invoked).
- **Blocker:** `npx playwright install chromium` failed with CDN **403 AccessDenied** (`service is not available in your location`). Suite is **not skipped** — configured to use system `/usr/bin/chromium` via `executablePath` (`PLAYWRIGHT_CHROMIUM_EXECUTABLE` overrides). Both E2E tests pass against the real browser.

### Step 9 — Final polish + this report
- Exported remaining public prop types from `src/index.ts`.
- README: added development scripts table and testing overview.
- Coverage config excludes story files, type-only modules, and `components/common` re-exports.
- Added tests for `EasyFlowEdge` and `SchemaDrivenEditor`.
- Final gate: typecheck + lint + test + build all green.

---

## Test coverage

| Metric | Value | Threshold |
|---|---|---|
| Statements | **77.74%** | 60% |
| Branches | **73.44%** | 60% |
| Functions | **70.51%** | 60% |
| Lines | **77.74%** | 60% |

- Unit/component/integration: **73 tests / 10 files** (Vitest)
- E2E: **2 tests** (Playwright, system Chromium)
- Storybook: build succeeds (`npm run build-storybook`)

### Lowest-coverage runtime areas (still above global threshold)
- `BaseNodeEditor.tsx` (~66%) — confirm/cancel/delete paths only partially exercised
- `NodeEditorPanel.tsx` (~44%) — edge-info panel and custom-editor branch
- `WorkflowEditor.tsx` (~66%) — keyboard shortcuts, clipboard, sync/validate/execute edge cases
- `i18n/context.tsx` (~56%) — translationsByLocale merge branches

---

## Remaining known gaps

1. **Playwright browser CDN** — official Playwright Chromium download is blocked in this environment (403). CI should run `npx playwright install chromium` where the CDN is reachable, or continue using system Chrome/Chromium with `PLAYWRIGHT_CHROME_PATH`.
2. **No standalone Edge component in product UI** — edges are React Flow defaults; `EasyFlowEdge` is an exported wrapper for custom `edgeTypes` but Canvas still uses built-in smoothstep rendering.
3. **Legacy `toolbarActions` / `noopAdapter`** — retained for compatibility; marked deprecated. Consider removal in 1.0.
4. **Storybook static build** — works but produces large chunks; consider code-splitting if publishing Storybook to GitHub Pages.
5. **Coverage of deep editor interactions** — keyboard copy/paste/duplicate and binary-operator parent labels are implemented but only lightly tested.
6. **`examples/basic`** — still uses local `noopAdapter` name; works but could import from the package after publish.
7. **npm audit** — some transitive moderate/high advisories from Storybook/Vite tooling; not runtime library deps (React/@xyflow are peer deps).

---

## Recommended next steps

1. **CI pipeline** — GitHub Actions running `typecheck && lint && test && build && e2e` on Node 20/22; cache npm; install Playwright browsers on a runner that can reach the CDN.
2. **Raise coverage on WorkflowEditor + NodeEditorPanel** — keyboard shortcuts, edge panel, custom editor registration lifecycle.
3. **Version 0.2.0** — ship feature-folder structure + Edge exports + default `adapter.saveWorkflow` behavior; update CHANGELOG from Unreleased.
4. **Deprecation timeline** — plan removal of `noopAdapter`, `toolbarActions`, and legacy `_fa`/`_en` fields for 1.0.
5. **Storybook deploy** — publish `storybook-static` to GitHub Pages or Chromatic for visual review.
6. **Visual regression** — Playwright screenshots of canvas states (empty, with edges, RTL) once CI browsers are stable.
7. **API docs site** — TypeDoc or API Extractor from the generated `dist/index.d.ts` for a browsable API reference.

---

## Command gate (final)

```
npm run typecheck   ✅
npm run lint        ✅
npm test            ✅  73 passed
npm run build       ✅
npm run e2e         ✅  2 passed (system Chromium)
npm run test:coverage ✅  77.74% lines / 70.51% functions (≥60%)
npm run build-storybook ✅  Storybook 8.6.18
```
