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
 * Sample graph — clean grid, every multi-input handle is connected.
 * Handle labels are custom (not always yes/no).
 *
 * ```
 *              Start
 *     /    /    |    \       \
 *  Age  Gender Delay NOT EXIT Router
 *  / \   / \           |        |
 * m s  m s            in0     in0←Gender skip
 * |  \  |  \          in1     in1←Delay
 * |   \ |   \                   in2←Start
 * EXIT  NOT EXIT
 * hit/miss exists/not-exist
 *   \      |      /
 *    Email → End
 * ```
 *
 * NOT EXIT: in-0 exists ← Start · in-1 not-exist ← Age skip
 * EXIT:     in-0 hit ← Age match · in-1 miss ← Gender match
 * Router:   in-0 ← Gender skip · in-1 ← Delay · in-2 ← Start
 */
function buildSampleWorkflow(): Workflow {
  const nodes: EasyFlowNode[] = [
    {
      id: 'sample-start',
      type: 'easyFlowNode',
      position: { x: 480, y: 30 },
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
      position: { x: 60, y: 180 },
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
            outputColors: ['#22c55e', '#f97316'],
            outputLabels: ['match', 'skip'],
          },
        },
        parametersSchema: cardSchema('filters.age'),
        parameters: { min_age: 18, max_age: 65 },
      },
    },
    {
      id: 'sample-gender',
      type: 'easyFlowNode',
      position: { x: 300, y: 180 },
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
            outputColors: ['#22c55e', '#f97316'],
            outputLabels: ['match', 'skip'],
          },
        },
        parametersSchema: cardSchema('filters.gender'),
        parameters: { gender: 'other' },
      },
    },
    {
      id: 'sample-delay',
      type: 'easyFlowNode',
      position: { x: 560, y: 180 },
      data: {
        label: 'Delay',
        label_i18n: { en: 'Delay', fa: 'تأخیر' },
        nodeType: 'control.delay',
        icon: '⏳',
        cardKey: 'control.delay',
        category: 'control',
        uiConfig: {
          shape: 'rectangle',
          color: '#64748b',
          size: 'medium',
          handles: { inputs: 1, outputs: 1 },
        },
        parametersSchema: cardSchema('control.delay'),
        parameters: { duration: 5, unit: 'seconds' },
      },
    },
    {
      id: 'sample-exit',
      type: 'easyFlowNode',
      position: { x: 40, y: 380 },
      data: {
        label: 'EXIT',
        label_i18n: { en: 'EXIT', fa: 'خروج' },
        nodeType: 'operators.exit',
        icon: '⚡',
        cardKey: 'operators.exit',
        category: 'operators',
        uiConfig: {
          shape: 'downtriangle',
          color: '#eab308',
          size: 'small',
          handles: {
            mode: 'condition',
            inputs: 2,
            outputs: 1,
            inputColors: ['#22c55e', '#f97316'],
            inputLabels: ['hit', 'miss'],
          },
        },
        parameters: {},
      },
    },
    {
      id: 'sample-not-exit',
      type: 'easyFlowNode',
      position: { x: 260, y: 380 },
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
            inputColors: ['#22c55e', '#f97316'],
            inputLabels: ['exists', 'not-exist'],
          },
        },
        parameters: {},
      },
    },
    {
      id: 'sample-router',
      type: 'easyFlowNode',
      position: { x: 480, y: 380 },
      data: {
        label: 'Router',
        label_i18n: { en: 'Router', fa: 'مسیریاب' },
        nodeType: 'data.router',
        icon: '🔀',
        cardKey: 'data.router',
        category: 'data',
        uiConfig: {
          shape: 'rectangle',
          color: '#0ea5e9',
          size: 'medium',
          handles: {
            inputs: 3,
            outputs: 2,
            inputColors: ['#64748b', '#64748b', '#64748b'],
            outputColors: ['#22c55e', '#f97316'],
            outputLabels: ['path-a', 'path-b'],
          },
        },
        parameters: {},
      },
    },
    {
      id: 'sample-email',
      type: 'easyFlowNode',
      position: { x: 340, y: 560 },
      data: {
        label: 'Send Email',
        label_i18n: { en: 'Send Email', fa: 'ارسال ایمیل' },
        nodeType: 'actions.email',
        icon: '📧',
        cardKey: 'actions.email',
        category: 'actions',
        uiConfig: {
          shape: 'rectangle',
          color: '#f59e0b',
          size: 'medium',
          handles: { inputs: 1, outputs: 1 },
        },
        parametersSchema: cardSchema('actions.email'),
        parameters: {
          to: 'team@example.com',
          subject: 'Workflow update',
          body: 'A node in your flow was updated.',
        },
      },
    },
    {
      id: 'sample-end',
      type: 'easyFlowNode',
      position: { x: 400, y: 740 },
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

  const edge = (
    id: string,
    source: string,
    target: string,
    sourceHandle: string,
    targetHandle: string,
    stroke?: string
  ): EasyFlowEdge => ({
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: 'smoothstep',
    animated: true,
    ...(stroke ? { style: { stroke } } : {}),
  });

  const edges: EasyFlowEdge[] = [
    // ── Start fan-out (every downstream input below is filled) ──
    edge('e-start-age', 'sample-start', 'sample-age', 'output-0', 'input-0'),
    edge('e-start-gender', 'sample-start', 'sample-gender', 'output-0', 'input-0'),
    edge('e-start-delay', 'sample-start', 'sample-delay', 'output-0', 'input-0'),
    // NOT EXIT input-0 (exists) ← Start
    edge('e-start-notexit', 'sample-start', 'sample-not-exit', 'output-0', 'input-0', '#22c55e'),
    // Router input-2 (third input, middle handle) ← Start
    edge('e-start-router', 'sample-start', 'sample-router', 'output-0', 'input-2'),

    // ── Age Filter: match → EXIT hit; skip → NOT EXIT not-exist ──
    edge('e-age-exit', 'sample-age', 'sample-exit', 'output-0', 'input-0', '#22c55e'),
    edge('e-age-notexit', 'sample-age', 'sample-not-exit', 'output-1', 'input-1', '#f97316'),

    // ── Gender Filter: match → EXIT miss; skip → Router input-0 ──
    edge('e-gender-exit', 'sample-gender', 'sample-exit', 'output-0', 'input-1', '#22c55e'),
    edge('e-gender-router', 'sample-gender', 'sample-router', 'output-1', 'input-0', '#f97316'),

    // ── Delay → Router input-1 (middle-left of the three inputs) ──
    edge('e-delay-router', 'sample-delay', 'sample-router', 'output-0', 'input-1'),

    // ── Router outputs → Email ──
    edge('e-router-a', 'sample-router', 'sample-email', 'output-0', 'input-0', '#22c55e'),
    edge('e-router-b', 'sample-router', 'sample-email', 'output-1', 'input-0', '#f97316'),

    // ── Operator + action terminals ──
    edge('e-exit-email', 'sample-exit', 'sample-email', 'output-0', 'input-0'),
    edge('e-notexit-end', 'sample-not-exit', 'sample-end', 'output-0', 'input-0'),
    edge('e-email-end', 'sample-email', 'sample-end', 'output-0', 'input-0'),
  ];

  // Every multi-input handle must appear at least once:
  // NOT EXIT: input-0 (exists) ← Start, input-1 (not-exist) ← Age skip
  // EXIT:     input-0 (hit) ← Age match, input-1 (miss) ← Gender match
  // Router:   input-0 ← Gender skip, input-1 ← Delay, input-2 ← Start

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
