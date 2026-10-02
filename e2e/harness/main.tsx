/**
 * E2E harness app.
 *
 * Mounts WorkflowEditor with a mock adapter that records save/load calls on
 * `window.__easyflowE2E__` so Playwright can assert the exact payload sent
 * to the backend.
 */

import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  WorkflowEditor,
  EasyFlowI18nProvider,
} from '../../src';
import type { APIAdapter, CardDefinition, WorkflowPayload } from '../../src';

declare global {
  interface Window {
    __easyflowE2E__?: {
      saves: WorkflowPayload[];
      loads: string[];
      lastSave: WorkflowPayload | null;
    };
  }
}

window.__easyflowE2E__ = {
  saves: [],
  loads: [],
  lastSave: null,
};

const cards: CardDefinition[] = [
  {
    id: 1,
    card_key: 'control.start',
    node_type: 'control.start',
    display_name: 'Start',
    display_name_i18n: { en: 'Start', fa: 'شروع' },
    icon: '🟢',
    category: 'control',
    ui_config: { shape: 'ellipse', color: '#10b981', size: 'small' },
  },
  {
    id: 2,
    card_key: 'filter.age',
    node_type: 'filter.age',
    display_name: 'Age Filter',
    display_name_i18n: { en: 'Age Filter', fa: 'فیلتر سن' },
    icon: '🔢',
    category: 'filters',
    ui_config: { shape: 'rectangle', color: '#6366f1', size: 'medium' },
  },
  {
    id: 3,
    card_key: 'action.email',
    node_type: 'action.email',
    display_name: 'Send Email',
    icon: '📧',
    category: 'actions',
    ui_config: { shape: 'rectangle', color: '#f59e0b', size: 'medium' },
  },
];

const adapter: APIAdapter = {
  getCards: () => Promise.resolve(cards),
  saveWorkflow: (wf) => {
    const store = window.__easyflowE2E__;
    if (store) {
      store.saves.push(structuredClone(wf));
      store.lastSave = structuredClone(wf);
    }
    return Promise.resolve({ id: 'e2e-wf', ...wf });
  },
  loadWorkflow: (id) => {
    const store = window.__easyflowE2E__;
    if (store) store.loads.push(id);
    return Promise.resolve({
      id,
      name: 'Loaded E2E',
      type: 'automation',
      nodes: [
        {
          id: 'seed-1',
          type: 'easyFlowNode',
          position: { x: 80, y: 120 },
          data: {
            label: 'Start',
            nodeType: 'control.start',
            icon: '🟢',
            category: 'control',
          },
        },
        {
          id: 'seed-2',
          type: 'easyFlowNode',
          position: { x: 280, y: 120 },
          data: {
            label: 'Age Filter',
            nodeType: 'filter.age',
            icon: '🔢',
            category: 'filters',
          },
        },
      ],
      edges: [
        { id: 'seed-e1', source: 'seed-1', target: 'seed-2', type: 'smoothstep' },
      ],
    });
  },
};

function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const workflowId = params.get('workflowId') || undefined;

  return (
    <EasyFlowI18nProvider locale="en">
      <WorkflowEditor adapter={adapter} workflowId={workflowId} />
    </EasyFlowI18nProvider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
