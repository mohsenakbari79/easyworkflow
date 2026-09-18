# easyworkflow

> A fully configurable, i18n-ready visual workflow editor for React.
> Drag-and-drop nodes, custom editors, adapter-based backend, MIT licensed.
[![npm version](https://img.shields.io/npm/v/@malevin/easyworkflow.svg)](https://www.npmjs.com/package/@malevin/easyworkflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## Why easyworkflow?

- Full editor in 15 minutes - not 5 days of building from scratch
- Built-in i18n with automatic RTL for fa / ar / he / ur
- Backend-agnostic - plug any API via the adapter pattern
- Themable with CSS variables and dark mode out of the box
- Extensible - register custom node editors and shapes
- MIT licensed - no vendor lock-in, forever free

---

## Installation

    npm install @malevin/easyworkflow @xyflow/react

`@xyflow/react` is a peer dependency and must be installed separately.

---

## Quick Start (under 15 minutes)

### Step 1 - Import the library

    import { WorkflowEditor, EasyFlowI18nProvider, noopAdapter } from 'easyworkflow';
    import 'easyworkflow/styles';

### Step 2 - Define your cards

    import type { CardDefinition } from 'easyworkflow';

    const cards: CardDefinition[] = [
      {
        id: 1,
        card_key: 'start',
        node_type: 'control.start',
        display_name: 'Start',
        display_name_i18n: {
          en: 'Start',
          fa: 'شروع',
          ar: 'بدء',
          tr: 'Başlat',
        },
        icon: '🟢',
        category: 'control',
        ui_config: { shape: 'ellipse', color: '#10b981', size: 'small' },
      },
      {
        id: 2,
        card_key: 'filter.age',
        node_type: 'filter.age',
        display_name: 'Age Filter',
        display_name_i18n: {
          en: 'Age Filter',
          fa: 'فیلتر سن',
          ar: 'فلتر العمر',
          tr: 'Yaş Filtresi',
        },
        icon: '🔢',
        category: 'filters',
        ui_config: { shape: 'rectangle', color: '#6366f1', size: 'medium' },
        parameters_schema: {
          properties: {
            min_age: { type: 'integer', title: 'Min Age' },
            max_age: { type: 'integer', title: 'Max Age' },
          },
        },
      },
    ];

### Step 3 - Render the editor

    export default function App() {
      return (
        <EasyFlowI18nProvider locale="fa">
          <div style={{ height: '100vh' }}>
            <WorkflowEditor
              adapter={noopAdapter}
              initialCards={cards}
              onSave={(workflow) => console.log('Saved:', workflow)}
              onExecute={(id) => console.log('Execute:', id)}
            />
          </div>
        </EasyFlowI18nProvider>
      );
    }

### Step 4 - Run

Run `npm run dev`. You now have a working workflow editor with:
- Drag-and-drop canvas
- Hierarchical card palette with search
- Built-in node editor
- Save / Execute / Validate toolbar
- Automatic RTL when locale is set to fa, ar, he, or ur

---

## Features

| Feature | Description |
|---|---|
| Visual editor | React Flow canvas with snap-to-grid, minimap, controls |
| Palette | Searchable hierarchical categories from card `category` |
| Custom editors | Register per-node-type editors via `nodeEditorRegistry` |
| Schema forms | Auto-generated forms from JSON Schema `parameters_schema` |
| i18n | `_i18n` maps on cards; any number of locales |
| RTL | Auto-detected for ar, fa, he, ur, yi, dv, ps, sd |
| Adapter pattern | Plug your own backend via `APIAdapter` |
| Dark mode | Via `[data-theme="dark"]` on any ancestor |
| Keyboard | Copy (Ctrl+C), Paste (Ctrl+V), Duplicate (Ctrl+D), Delete |

---

## Backend Integration

Implement `APIAdapter` to connect your backend:

    import type { APIAdapter } from 'easyworkflow';

    const myAdapter: APIAdapter = {
      getCards: () => fetch('/api/cards').then((r) => r.json()),
      syncCards: () =>
        fetch('/api/cards/sync', { method: 'POST' }).then((r) => r.json()),
      loadWorkflow: (id) =>
        fetch(`/api/workflows/${id}`).then((r) => r.json()),
      saveWorkflow: (wf) =>
        fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wf),
        }).then((r) => r.json()),
      validateWorkflow: (id) =>
        fetch(`/api/workflows/${id}/validate`, { method: 'POST' }).then((r) =>
          r.json()
        ),
      executeWorkflow: (id) =>
        fetch(`/api/workflows/${id}/execute`, { method: 'POST' }).then(
          () => undefined
        ),
    };

    <WorkflowEditor adapter={myAdapter} />;

If you do not need a backend, use the bundled `noopAdapter`.

---

## Custom Node Editors

Register a component for a specific node type or pattern:

    import { nodeEditorRegistry } from 'easyworkflow';
    import { MyFilterEditor } from './MyFilterEditor';

    nodeEditorRegistry.register(
      'my-filter-editor',
      (nodeType) => nodeType.startsWith('filter.'),
      MyFilterEditor
    );

The editor receives `{ node, onUpdate, onDelete, onCancel, variableSuggestions }`.

---

## Internationalization

Add any number of locales per card:

    display_name_i18n: {
      en: 'Gender Filter',
      fa: 'فیلتر جنسیت',
      ar: 'فلتر الجنس',
      tr: 'Cinsiyet Filtresi',
      de: 'Geschlechtsfilter',
    },

Change locale:

    <EasyFlowI18nProvider locale="ar">

RTL is applied automatically for Arabic, Persian, Hebrew, Urdu, and others.

---

## Theming

Override CSS variables to match your brand:

    :root {
      --ef-primary: #6366f1;
      --ef-bg: #ffffff;
      --ef-bg-subtle: #f8fafc;
      --ef-text-color: #0f172a;
      --ef-border-color: #e2e8f0;
      --ef-radius-md: 8px;
    }

Dark mode:

    [data-theme="dark"] {
      --ef-bg: #0b1120;
      --ef-card-bg: #111827;
      --ef-text-color: #f1f5f9;
    }

Full variable reference: `src/styles/easyflow.css`.

---

## API Reference

### Components

| Export | Description |
|---|---|
| `WorkflowEditor` | Main editor (canvas + palette + node editor) |
| `Canvas` | React Flow wrapper |
| `FlowNode` | Node component (rect / ellipse / diamond / downtriangle) |
| `Palette` | Hierarchical card palette |
| `NodeEditorPanel` | Side panel (palette / node editor / edge info) |
| `BaseNodeEditor` | Default form-based node editor |
| `SchemaDrivenEditor` | Auto-forms from JSON Schema |
| `Toolbar` | Standalone toolbar |
| `EasyFlowI18nProvider` | i18n context provider |

### Hooks

| Export | Description |
|---|---|
| `useWorkflow` | State management for nodes, edges, metadata |
| `useTranslation` | i18n hook returning `{ t, locale, isRTL }` |

### Registries

| Export | Description |
|---|---|
| `nodeEditorRegistry` | Register custom editors by node type |
| `nodeShapeRegistry` | Register custom node shapes |

### Utilities

| Export | Description |
|---|---|
| `generateNodeId` / `generateEdgeId` | Unique ID generators |
| `buildCategoryTree` | Build hierarchy from cards |
| `normalizeCategoryKey` | Lowercase + trim category keys |
| `humanizeCategoryLabel` | Title-case a category key |
| `pickLocalized` | Pick value from an `_i18n` map |
| `isRTLLocale` | RTL detection for any locale |

### Adapters

| Export | Description |
|---|---|
| `noopAdapter` | No-op adapter for demos and tests |

---

## Credits

Built on top of:
- [@xyflow/react](https://github.com/xyflow/xyflow) - MIT License
- [React](https://react.dev) - MIT License

All dependencies are MIT licensed. This package is compatible with commercial use.

---

## License

MIT (c) mohsen akbari
See [LICENSE](./LICENSE) for details.

---

## Contributing

Contributions are welcome. Please open an issue first to discuss changes.
