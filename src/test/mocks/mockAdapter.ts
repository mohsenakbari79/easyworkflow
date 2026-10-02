/**
 * In-memory mock API adapter for integration tests.
 *
 * Simulates a backend with:
 * - a fixed catalog of palette cards
 * - a workflow store that supports save/load
 * - call spies for asserting editor ↔ adapter contracts
 */

import type {
  APIAdapter,
  CardDefinition,
  EasyFlowEdge,
  EasyFlowNode,
  Workflow,
  WorkflowPayload,
} from '../../types';

export interface MockAdapterOptions {
  /** Cards returned by getCards. */
  cards?: CardDefinition[];
  /** Pre-seeded workflows addressable by id. */
  workflows?: Workflow[];
  /** Simulate getCards failure. */
  failGetCards?: boolean;
  /** Simulate saveWorkflow failure. */
  failSave?: boolean;
  /** Simulate loadWorkflow failure. */
  failLoad?: boolean;
}

export interface MockAdapter extends APIAdapter {
  /** Recorded saveWorkflow payloads. */
  saveCalls: WorkflowPayload[];
  /** Recorded loadWorkflow ids. */
  loadCalls: string[];
  /** Current in-memory workflow store. */
  store: Map<string, Workflow>;
  /** Current card catalog. */
  cards: CardDefinition[];
  /** Reset recorded calls and restore initial store. */
  reset(): void;
  /** Write a workflow directly into the store (for load tests). */
  seed(workflow: Workflow): void;
}

const defaultCards: CardDefinition[] = [
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
    parameters_schema: {
      properties: {
        min_age: { type: 'integer', title: 'Min Age' },
        max_age: { type: 'integer', title: 'Max Age' },
      },
    },
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

/**
 * Create a mock {@link APIAdapter} backed by an in-memory store.
 *
 * @example
 * ```ts
 * const adapter = createMockAdapter();
 * render(<WorkflowEditor adapter={adapter} onSave={vi.fn()} />);
 * await user.click(screen.getByRole('button', { name: /Save/i }));
 * expect(adapter.saveCalls[0].nodes).toHaveLength(1);
 * ```
 */
export function createMockAdapter(options: MockAdapterOptions = {}): MockAdapter {
  const cards = options.cards ?? defaultCards;
  const store = new Map<string, Workflow>();
  for (const wf of options.workflows ?? []) {
    store.set(wf.id, wf);
  }

  const saveCalls: WorkflowPayload[] = [];
  const loadCalls: string[] = [];

  const adapter: MockAdapter = {
    cards,
    store,
    saveCalls,
    loadCalls,

    getCards: () => {
      if (options.failGetCards) {
        return Promise.reject(new Error('getCards failed'));
      }
      return Promise.resolve([...cards]);
    },

    syncCards: () => Promise.resolve({ created: 0, updated: 0, total: cards.length }),

    loadWorkflow: (id: string) => {
      loadCalls.push(id);
      if (options.failLoad) {
        return Promise.reject(new Error('loadWorkflow failed'));
      }
      const found = store.get(id);
      if (!found) {
        return Promise.reject(new Error(`Workflow not found: ${id}`));
      }
      return Promise.resolve(structuredClone(found));
    },

    saveWorkflow: (workflow: WorkflowPayload) => {
      saveCalls.push(structuredClone(workflow));
      if (options.failSave) {
        return Promise.reject(new Error('saveWorkflow failed'));
      }
      const id = workflow.id || `wf-${saveCalls.length}`;
      const saved: Workflow = {
        id,
        name: workflow.name,
        description: workflow.description,
        type: workflow.type,
        nodes: structuredClone(workflow.nodes),
        edges: structuredClone(workflow.edges),
      };
      store.set(id, saved);
      return Promise.resolve(structuredClone(saved));
    },

    validateWorkflow: (id: string) => {
      const found = store.get(id);
      if (!found) {
        return Promise.resolve({ is_valid: false, errors: ['Not found'] });
      }
      return Promise.resolve({ is_valid: true });
    },

    executeWorkflow: () => Promise.resolve(),

    getWorkflowStatus: () =>
      Promise.resolve({ status: 'completed', total_items: 0, execution_time_ms: 1 }),

    reset() {
      saveCalls.length = 0;
      loadCalls.length = 0;
      store.clear();
      for (const wf of options.workflows ?? []) {
        store.set(wf.id, structuredClone(wf));
      }
    },

    seed(workflow: Workflow) {
      store.set(workflow.id, structuredClone(workflow));
    },
  };

  return adapter;
}

/** Build a simple two-node workflow fixture for load tests. */
export function buildSampleWorkflow(id = 'wf-sample'): Workflow {
  const nodes: EasyFlowNode[] = [
    {
      id: 'n-start',
      type: 'easyFlowNode',
      position: { x: 80, y: 120 },
      data: {
        label: 'Start',
        nodeType: 'control.start',
        icon: '🟢',
        cardKey: 'control.start',
        category: 'control',
        parameters: {},
      },
    },
    {
      id: 'n-filter',
      type: 'easyFlowNode',
      position: { x: 280, y: 120 },
      data: {
        label: 'Age Filter',
        nodeType: 'filter.age',
        icon: '🔢',
        cardKey: 'filter.age',
        category: 'filters',
        parameters: { min_age: 18, max_age: 65 },
      },
    },
  ];
  const edges: EasyFlowEdge[] = [
    {
      id: 'e-1',
      source: 'n-start',
      target: 'n-filter',
      type: 'smoothstep',
    },
  ];
  return {
    id,
    name: 'Sample Workflow',
    type: 'automation',
    nodes,
    edges,
  };
}
