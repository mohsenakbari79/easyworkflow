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

    import { WorkflowEditor, EasyFlowI18nProvider, emptyAdapter } from 'easyworkflow';
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

    import { WorkflowEditor, EasyFlowI18nProvider, emptyAdapter } from 'easyworkflow';
    import 'easyworkflow/styles';
    import type { APIAdapter, CardDefinition } from 'easyworkflow';

    const myCards: CardDefinition[] = [
      {
        id: 1,
        card_key: 'start',
        node_type: 'control.start',
        display_name: 'Start',
        display_name_i18n: { en: 'Start', fa: 'شروع' },
        icon: '🟢',
        category: 'control',
        ui_config: { shape: 'ellipse', color: '#10b981', size: 'small' },
      },
    ];

    const myAdapter: APIAdapter = {
      getCards: () => Promise.resolve(myCards),
      saveWorkflow: (wf) => {
        console.log('Saved:', wf);
        return Promise.resolve({ id: 'local', ...wf });
      },
    };

    export default function App() {
      return (
        <EasyFlowI18nProvider locale="fa">
          <div style={{ height: '100vh' }}>
            <WorkflowEditor adapter={myAdapter} />
          </div>
        </EasyFlowI18nProvider>
      );
    }

### Step 4 - Run

Run `npm run dev`. You now have a working workflow editor with:
- Drag-and-drop canvas
- Hierarchical card palette with search
- Built-in node editor
- Save / Reset toolbar
- Automatic RTL when locale is set to fa, ar, he, or ur

---

## Cards and Adapters

The adapter is the single source of truth for cards. Define your cards inside
`getCards`, and put save/execute logic right next to it.

### Build your own adapter

Create an adapter that supplies your cards and talks to your backend:

    import type { APIAdapter, CardDefinition } from 'easyworkflow';

    const myCards: CardDefinition[] = [
      {
        id: 1,
        card_key: 'control.start',
        node_type: 'control.start',
        display_name: 'Start',
        display_name_i18n: { en: 'Start', fa: 'شروع', ar: 'بدء' },
        icon: '🟢',
        category: 'control',
        ui_config: { shape: 'ellipse', color: '#10b981', size: 'small' },
      },
      // ... more cards
    ];

    const cardsAdapter: APIAdapter = {
      // REQUIRED for cards to appear:
      getCards: () => Promise.resolve(myCards),

      // Optional:
      syncCards: () =>
        Promise.resolve({ created: 0, updated: 0, total: myCards.length }),

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

      getWorkflowStatus: (id) =>
        fetch(`/api/workflows/${id}/status`).then((r) => r.json()),
    };

Then pass it to the editor:

    <WorkflowEditor adapter={cardsAdapter} onSave={(wf) => console.log(wf)} />

### Static-only usage (no backend)

If you only want to show cards and don't need backend calls, use a minimal
adapter:

    const staticAdapter: APIAdapter = {
      getCards: () => Promise.resolve(myCards),
      saveWorkflow: (wf) => {
        console.log('Saved:', wf);
        return Promise.resolve({ id: 'local', ...wf });
      },
    };

    <WorkflowEditor adapter={staticAdapter} />

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

If you do not need a backend, use the bundled `emptyAdapter`.

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

## Toolbar Actions

By default, only a **Save** button is shown. To fully control the toolbar,
pass an `actions` array. Each action defines its own label, icon, variant,
and onClick handler — just like `cards`.

    import { WorkflowEditor } from 'easyworkflow';

    <WorkflowEditor
      adapter={cardsAdapter}
      actions={[
        {
          key: 'save',
          label: 'Save Draft',
          icon: '💾',
          variant: 'primary',
          onClick: async (ctx) => {
            await api.saveDraft(ctx);
          },
        },
        {
          key: 'publish',
          label: 'Publish',
          icon: '🚀',
          variant: 'success',
          onClick: async (ctx) => {
            await api.publish(ctx);
          },
        },
        {
          key: 'discard',
          label: 'Discard',
          icon: '🗑️',
          variant: 'danger',
          onClick: () => {
            if (confirm('Discard changes?')) location.reload();
          },
        },
      ]}
    />

The `onClick` callback receives:

    {
      workflowId: string | undefined;
      name: string;             // current workflow name
      type: string;             // current workflow type
      nodes: EasyFlowNode[];    // current nodes
      edges: EasyFlowEdge[];    // current edges
      adapter: APIAdapter | undefined;
    }

### Disable or hide a single action

    {
      key: 'publish',
      label: 'Publish',
      onClick: publish,
      disabled: !isValid,     // grey out
      visible: hasPermission, // remove entirely when false
    }

### Add extra buttons without replacing defaults

Use `toolbarActions` to append buttons after `actions`:

    <WorkflowEditor
      toolbarActions={[
        {
          key: 'export',
          label: 'Export JSON',
          icon: '📤',
          variant: 'secondary',
          onClick: () => downloadJSON(),
        },
      ]}
    />

### Default behavior

If you don't pass `actions`, the editor renders a single Save button that
uses the built-in save handler.

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
| `emptyAdapter` | Empty adapter for demos and tests |

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
