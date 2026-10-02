/**
 * Dynamic node handle resolution.
 *
 * Turns `uiConfig.handles` (counts, mode, colors, labels) into a concrete
 * list of input/output handles with stable ids for edges and backend routing.
 */

import type {
  EasyFlowNodeData,
  NodeHandleConfig,
  ResolvedNodeHandle,
  UIConfig,
} from '../types/node';

/** Default handle colors when the consumer does not configure any. */
export const DEFAULT_INPUT_COLOR = '#64748b';
export const DEFAULT_OUTPUT_COLOR = '#2563eb';
/** Condition-mode default colors (yes / no). */
export const CONDITION_YES_COLOR = '#22c55e';
export const CONDITION_NO_COLOR = '#ef4444';

function clampCount(value: unknown, fallback: number, max = 8): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : fallback;
  return Math.min(Math.max(n, 0), max);
}

function colorAt(list: string[] | undefined, index: number, fallback: string): string {
  const c = list?.[index];
  return typeof c === 'string' && c.trim() ? c.trim() : fallback;
}

function labelAt(list: string[] | undefined, index: number): string | undefined {
  const l = list?.[index];
  return typeof l === 'string' && l.trim() ? l.trim() : undefined;
}

/**
 * Distribute `count` handles along one edge of the node.
 * 1 → center; 2 → corners; 3 → corners + middle; N → even spacing.
 */
export function distributeHandlePercents(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [50];
  if (count === 2) return [22, 78];
  if (count === 3) return [18, 50, 82];
  const percents: number[] = [];
  const span = 80;
  const start = 10;
  for (let i = 0; i < count; i += 1) {
    percents.push(Math.round(start + (span * i) / (count - 1)));
  }
  return percents;
}

/**
 * Infer handle configuration from node type when `uiConfig.handles` is absent.
 * Binary operators default to condition mode (two inputs).
 */
export function inferHandleConfig(data: Partial<EasyFlowNodeData>): NodeHandleConfig {
  const ui = (data.uiConfig || {}) as UIConfig;
  if (ui.handles) return ui.handles;

  const nodeType = (data.nodeType || '').toLowerCase();
  const isBinaryOp =
    /operator(s)?\.(not_)?exit/.test(nodeType) ||
    nodeType.includes('not_exit') ||
    nodeType.includes('condition') ||
    nodeType.includes('branch');

  if (isBinaryOp) {
    return {
      mode: 'condition',
      inputs: 2,
      outputs: 1,
      inputColors: [CONDITION_YES_COLOR, CONDITION_NO_COLOR],
      inputLabels: ['yes', 'no'],
    };
  }

  return { mode: 'default', inputs: 1, outputs: 1 };
}

/**
 * Resolve concrete input/output handles for a node.
 *
 * @example
 * ```ts
 * resolveNodeHandles({
 *   nodeType: 'operators.not_exit',
 *   uiConfig: {
 *     shape: 'downtriangle',
 *     handles: {
 *       mode: 'condition',
 *       inputs: 2,
 *       outputs: 1,
 *       inputColors: ['#22c55e', '#ef4444'],
 *       inputLabels: ['yes', 'no'],
 *     },
 *   },
 * });
 * // → input-0 (yes, green), input-1 (no, red), output-0
 * ```
 */
export function resolveNodeHandles(data: Partial<EasyFlowNodeData>): ResolvedNodeHandle[] {
  const config = inferHandleConfig(data);
  const nodeType = (data.nodeType || '').toLowerCase();
  const shape = data.uiConfig?.shape || 'rectangle';
  const isDownTriangle = shape === 'downtriangle';
  const isCondition = config.mode === 'condition';
  const nodeColor = data.uiConfig?.color || DEFAULT_OUTPUT_COLOR;

  let inputCount = clampCount(config.inputs, isCondition ? 2 : 1);
  let outputCount = clampCount(config.outputs, 1);
  if (config.mode === 'single') {
    inputCount = 1;
    outputCount = 1;
  }
  // Backward-compat: binary operators always expose ≥2 inputs unless overridden.
  if (isCondition && config.inputs === undefined) {
    inputCount = 2;
  }

  const handles: ResolvedNodeHandle[] = [];

  const inputPercents = distributeHandlePercents(inputCount);
  inputPercents.forEach((percent, index) => {
    const id = `input-${index}`;
    // Legacy id for the second input so old workflows keep working.
    const legacyId = index === 1 ? 'second-input' : undefined;
    const color = isCondition
      ? colorAt(config.inputColors, index, index === 0 ? CONDITION_YES_COLOR : CONDITION_NO_COLOR)
      : colorAt(config.inputColors, index, DEFAULT_INPUT_COLOR);
    const label =
      labelAt(config.inputLabels, index) ??
      (isCondition ? (index === 0 ? 'yes' : index === 1 ? 'no' : undefined) : undefined);

    // Downtriangle / condition operators: inputs on the top edge (corners when 2).
    // Rectangles with multi inputs: also top edge (corners → middle).
    handles.push({
      id,
      type: 'target',
      position: 'top',
      percent,
      color,
      label,
    });
    if (legacyId) {
      // Keep a second id alias via data attribute in FlowNode; store primary id only.
      // Edges created with `second-input` are normalized in WorkflowEditor.
      void legacyId;
    }
  });

  const outputPercents = distributeHandlePercents(outputCount);
  outputPercents.forEach((percent, index) => {
    const id = `output-${index}`;
    const color = isCondition
      ? colorAt(config.outputColors, index, index === 0 ? CONDITION_YES_COLOR : CONDITION_NO_COLOR)
      : colorAt(config.outputColors, index, DEFAULT_OUTPUT_COLOR || nodeColor);
    const label =
      labelAt(config.outputLabels, index) ??
      (isCondition && outputCount >= 2
        ? index === 0
          ? 'yes'
          : index === 1
            ? 'no'
            : undefined
        : undefined);

    handles.push({
      id,
      type: 'source',
      position: 'bottom',
      percent,
      color: outputCount === 1 && !config.outputColors?.length ? nodeColor : color,
      label,
    });
  });

  // Single default output keeps historical bottom-center placement.
  if (handles.filter((h) => h.type === 'source').length === 1) {
    const only = handles.find((h) => h.type === 'source');
    if (only) only.percent = 50;
  }
  if (handles.filter((h) => h.type === 'target').length === 1) {
    const only = handles.find((h) => h.type === 'target');
    if (only) only.percent = 50;
  }

  // Document shape usage for downtriangle consumers (no-op placeholder).
  void isDownTriangle;
  void nodeType;

  return handles;
}

/**
 * Find a resolved handle by React Flow handle id.
 */
export function findHandle(
  handles: ResolvedNodeHandle[],
  handleId: string | null | undefined
): ResolvedNodeHandle | null {
  if (!handleId) return null;
  if (handleId === 'second-input') {
    return handles.find((h) => h.id === 'input-1') || null;
  }
  return handles.find((h) => h.id === handleId) || null;
}

/**
 * Color for an edge stroke based on the target (or source) handle.
 */
export function getHandleColor(
  handles: ResolvedNodeHandle[],
  handleId: string | null | undefined,
  fallback = 'var(--ef-primary, #2563eb)'
): string {
  const handle = findHandle(handles, handleId);
  return handle?.color || fallback;
}
