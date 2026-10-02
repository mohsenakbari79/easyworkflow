import type {
  APIAdapter,
  EasyFlowNode,
  ValidationResult,
  Workflow,
  WorkflowPayload,
  WorkflowStatus,
} from '../../../src';
// EasyFlowEdge is also a component value on the barrel; import the type from types.
import type { EasyFlowEdge } from '../../../src/types';
import { demoCards } from './cards';

const STORAGE_KEY = 'easyflow:lastWorkflow';

function readStoredWorkflow(): Workflow | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Workflow;
  } catch {
    return null;
  }
}

function writeStoredWorkflow(workflow: Workflow): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
  } catch {
    // localStorage may be unavailable (private mode); ignore.
  }
}

function cardSchema(key: string) {
  return demoCards.find((c) => c.card_key === key)?.parameters_schema;
}

/**
 * Sample graph matching the README / docs preview:
 * Start → Age Filter + Gender Filter → NOT EXIT → End
 * (5 nodes, 5 edges, dashed smoothstep).
 */
function buildSampleWorkflow(): Workflow {
  const nodes: EasyFlowNode[] = [
    {
      id: 'sample-start',
      type: 'easyFlowNode',
      position: { x: 360, y: 40 },
      data: {
        label: 'Start',
        label_i18n: { en: 'Start', fa: 'شروع' },
        nodeType: 'control.start',
        icon: '🟢',
        cardKey: 'control.start',
        category: 'control',
        uiConfig: { shape: 'ellipse', color: '#22c55e', size: 'small' },
        parameters: {},
      },
    },
    {
      id: 'sample-age',
      type: 'easyFlowNode',
      position: { x: 120, y: 200 },
      data: {
        label: 'Age Filter',
        label_i18n: { en: 'Age Filter', fa: 'فیلتر سن' },
        nodeType: 'filters.age',
        icon: '🔢',
        cardKey: 'filters.age',
        category: 'filters',
        uiConfig: {
          shape: 'rectangle',
          color: '#3b82f6',
          size: 'medium',
          handles: {
            inputs: 1,
            outputs: 2,
            outputColors: ['#22c55e', '#ef4444'],
            outputLabels: ['yes', 'no'],
          },
        },
        parametersSchema: cardSchema('filters.age'),
        parameters: { min_age: 18, max_age: 65 },
      },
    },
    {
      id: 'sample-gender',
      type: 'easyFlowNode',
      position: { x: 520, y: 200 },
      data: {
        label: 'Gender Filter',
        label_i18n: { en: 'Gender Filter', fa: 'فیلتر جنسیت' },
        nodeType: 'filters.gender',
        icon: '👥',
        cardKey: 'filters.gender',
        category: 'filters',
        uiConfig: {
          shape: 'rectangle',
          color: '#8b5cf6',
          size: 'medium',
          handles: {
            inputs: 1,
            outputs: 2,
            outputColors: ['#22c55e', '#ef4444'],
            outputLabels: ['yes', 'no'],
          },
        },
        parametersSchema: cardSchema('filters.gender'),
        parameters: { gender: 'other' },
      },
    },
    {
      id: 'sample-not-exit',
      type: 'easyFlowNode',
      position: { x: 320, y: 360 },
      data: {
        label: 'NOT EXIT',
        label_i18n: { en: 'NOT EXIT', fa: 'عدم خروج' },
        nodeType: 'operators.not_exit',
        icon: '🚫',
        cardKey: 'operators.not_exit',
        category: 'operators',
        uiConfig: {
          shape: 'downtriangle',
          color: '#ef4444',
          size: 'small',
          handles: {
            mode: 'condition',
            inputs: 2,
            outputs: 1,
            inputColors: ['#22c55e', '#ef4444'],
            inputLabels: ['yes', 'no'],
          },
        },
        parameters: {},
      },
    },
    {
      id: 'sample-end',
      type: 'easyFlowNode',
      position: { x: 330, y: 520 },
      data: {
        label: 'End',
        label_i18n: { en: 'End', fa: 'پایان' },
        nodeType: 'control.end',
        icon: '🔴',
        cardKey: 'control.end',
        category: 'control',
        uiConfig: { shape: 'ellipse', color: '#ef4444', size: 'small' },
        parameters: {},
      },
    },
  ];

  const edges: EasyFlowEdge[] = [
    {
      id: 'sample-e1',
      source: 'sample-start',
      target: 'sample-age',
      sourceHandle: 'output-0',
      targetHandle: 'input-0',
      type: 'smoothstep',
      animated: true,
    },
    {
      id: 'sample-e2',
      source: 'sample-start',
      target: 'sample-gender',
      sourceHandle: 'output-0',
      targetHandle: 'input-0',
      type: 'smoothstep',
      animated: true,
    },
    {
      // Age Filter “yes” (green output-0) → NOT EXIT primary input
      id: 'sample-e3',
      source: 'sample-age',
      target: 'sample-not-exit',
      sourceHandle: 'output-0',
      targetHandle: 'input-0',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#22c55e' },
    },
    {
      // Gender Filter “no” (red output-1) → NOT EXIT second input
      id: 'sample-e4',
      source: 'sample-gender',
      target: 'sample-not-exit',
      sourceHandle: 'output-1',
      targetHandle: 'input-1',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#ef4444' },
    },
    {
      id: 'sample-e5',
      source: 'sample-not-exit',
      target: 'sample-end',
      sourceHandle: 'output-0',
      targetHandle: 'input-0',
      type: 'smoothstep',
      animated: true,
    },
  ];

  return {
    id: 'sample',
    name: 'Untitled Workflow',
    type: 'general',
    nodes,
    edges,
  };
}

/**
 * In-memory / localStorage demo adapter used by the live GitHub Pages demo.
 */
export const demoAdapter: APIAdapter = {
  getCards: () => Promise.resolve(demoCards),

  syncCards: () =>
    Promise.resolve({ created: 0, updated: 0, total: demoCards.length }),

  saveWorkflow: (workflow: WorkflowPayload) => {
    console.log('[demo] saveWorkflow payload:', workflow);
    const saved: Workflow = {
      id: `demo-${Date.now()}`,
      name: workflow.name,
      description: workflow.description,
      type: workflow.type,
      nodes: workflow.nodes,
      edges: workflow.edges,
    };
    writeStoredWorkflow(saved);
    return Promise.resolve(saved);
  },

  loadWorkflow: (id: string) => {
    console.log('[demo] loadWorkflow id:', id);
    // "sample" always returns the docs-aligned sample graph.
    // Other ids restore the last saved workflow when present.
    if (id === 'sample') {
      return Promise.resolve(buildSampleWorkflow());
    }
    const stored = readStoredWorkflow();
    if (stored && stored.id === id) {
      return Promise.resolve(stored);
    }
    return Promise.resolve(buildSampleWorkflow());
  },

  validateWorkflow: (id: string): Promise<ValidationResult> => {
    const stored = readStoredWorkflow();
    const nodeCount = stored?.nodes.length ?? 0;
    if (nodeCount < 2) {
      const result: ValidationResult = {
        is_valid: false,
        warnings: [
          `Workflow "${id}" has ${nodeCount} node(s). Add at least 2 nodes before running.`,
        ],
      };
      return Promise.resolve(result);
    }
    const result: ValidationResult = {
      is_valid: true,
      warnings: [],
    };
    return Promise.resolve(result);
  },

  executeWorkflow: (id: string): Promise<void> => {
    console.log('[demo] executeWorkflow id:', id);
    return Promise.resolve();
  },

  getWorkflowStatus: (): Promise<WorkflowStatus> =>
    Promise.resolve({ status: 'completed', total_items: 0, execution_time_ms: 1 }),
};

export { buildSampleWorkflow, STORAGE_KEY, readStoredWorkflow };
