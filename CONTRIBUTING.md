# Contributing to easyworkflow

Thanks for your interest in contributing! This document explains how to set up the project, run checks, and submit changes.

## Development setup

Requirements:

- Node.js 20+ (Node 22/24 recommended)
- npm (the repo ships an `package-lock.json`; do not commit yarn/pnpm lockfiles)

```bash
git clone https://github.com/mohsenakbari79/easyworkflow.git
cd easyflow
npm install
```

## Project layout

```
src/
  api/           # Adapter implementations (emptyAdapter)
  components/    # React UI (WorkflowEditor, FlowNode, Toolbar, …)
  hooks/         # useWorkflow, useTranslation
  i18n/          # Provider, locales, translations
  registry/      # nodeEditorRegistry, nodeShapeRegistry
  styles/        # Global CSS variables
  types/         # Shared TypeScript types
  utils/         # Pure helpers (ids, categories, localization)
examples/basic/  # Runnable demo app
```

## Scripts

| Command                 | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `npm run build`         | Build the library (ESM + CJS + d.ts)      |
| `npm run dev`           | Watch-mode library build                  |
| `npm run typecheck`     | TypeScript type checking (`tsc --noEmit`) |
| `npm test`              | Run unit/component tests (Vitest)         |
| `npm run test:watch`    | Watch mode for tests                      |
| `npm run test:coverage` | Coverage report with thresholds           |
| `npm run lint`          | ESLint + Prettier check                   |
| `npm run lint:fix`      | Auto-fix lint/format issues               |

## Coding standards

- TypeScript strict mode is enabled — keep public APIs fully typed
- Prefer small, focused modules; pure utils belong in `src/utils`
- Add JSDoc to all public exports, types, and component props
- Follow existing naming conventions (`EasyFlow*` types, CSS modules)
- No comments unless they clarify non-obvious behavior
- Do not commit secrets, `dist/`, or editor junk files

## Testing

- Unit tests for pure utilities go next to the feature or under `src/**/__tests__`
- Component tests wrap React Flow consumers in `ReactFlowProvider`
- Integration tests use the mock adapter in `src/test/mocks`
- E2E tests live under `e2e/` and run with Playwright

Run the full gate before opening a PR:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Pull requests

1. Open an issue first for large changes or API additions
2. Fork the repo and create a feature branch (`feat/…`, `fix/…`, `docs/…`)
3. Make focused commits using [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `perf:`
4. Ensure all checks pass (typecheck, lint, tests, build)
5. Update docs/CHANGELOG if behavior or public API changes
6. Open a PR with a clear description and screenshots for UI changes

## Reporting bugs

Please include:

- easyworkflow version and React / @xyflow/react versions
- Minimal reproduction steps or a sandbox link
- Expected vs actual behavior
- Browser/OS if UI-related

## License

By contributing, you agree that your contributions will be licensed under the MIT License of this project.
