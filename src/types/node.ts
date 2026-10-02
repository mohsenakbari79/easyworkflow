/**
 * Visual shape identifiers supported by the default node renderer.
 */
export type NodeShape = 'rectangle' | 'ellipse' | 'diamond' | 'downtriangle';

/**
 * Size preset applied to a node's visual container.
 */
export type NodeSize = 'small' | 'medium' | 'large';

/**
 * Execution / lifecycle status rendered as a colored glow on nodes.
 */
export type NodeStatus = 'notstarted' | 'running' | 'completed' | 'failed' | 'waiting' | 'queued';

/**
 * Visual configuration for a node (shape, size, color, output schema).
 */
export interface UIConfig {
  /** Visual shape. Defaults to `rectangle`. */
  shape?: NodeShape;
  /** Size preset. Defaults to `medium`. */
  size?: NodeSize;
  /** Hex/rgb color used for the node header and border. */
  color?: string;
  /** Optional icon (emoji or text) shown in the node header. */
  icon?: string;
  /** Optional JSON-schema-like output definition used for variable suggestions. */
  output_schema?: Record<string, unknown>;
  /** Additional custom keys are preserved and passed through. */
  [key: string]: unknown;
}

/**
 * JSON-schema-like description of a node parameter.
 * Used by `SchemaDrivenEditor` / `BaseNodeEditor` to auto-generate forms.
 */
export interface ParameterSchema {
  /** Type hint: `string`, `integer`, `number`, `boolean`, `array`, etc. */
  type?: string;
  /** Human-readable field label. */
  title?: string;
  /** Help text shown under the label. */
  description?: string;
  /** Default value applied when the parameter is untouched. */
  default?: unknown;
  /** Allowed values; renders a select control when present. */
  enum?: unknown[];
  /** Nested property schemas (for object parameters). */
  properties?: Record<string, ParameterSchema>;
  /** Item schema for array parameters. */
  items?: ParameterSchema;
  /** Names of required property keys. */
  required?: string[];
  /** Additional keys are preserved. */
  [key: string]: unknown;
}

/**
 * Data payload attached to every EasyFlow node.
 *
 * Locale-keyed maps (`label_i18n`, `description_i18n`) are preferred over
 * legacy `_fa` / `_en` suffixed fields.
 */
export interface EasyFlowNodeData {
  /** Fallback / default label. */
  label: string;
  /** Locale-keyed labels (preferred over legacy suffixed fields). */
  label_i18n?: Record<string, string>;
  /** @deprecated Use `label_i18n` instead. Legacy Farsi label. */
  label_fa?: string;
  /** @deprecated Use `label_i18n` instead. Legacy English label. */
  label_en?: string;

  /** Fallback / default description. */
  description?: string;
  /** Locale-keyed descriptions. */
  description_i18n?: Record<string, string>;
  /** @deprecated Use `description_i18n` instead. Legacy Farsi description. */
  description_fa?: string;
  /** @deprecated Use `description_i18n` instead. Legacy English description. */
  description_en?: string;

  /** Emoji or short text shown in the node header. */
  icon?: string;
  /** Key of the originating card definition. */
  cardKey?: string;
  /** Raw category string from the card (may contain dots for nesting). */
  category?: string;
  /** Normalized (lowercase) category key. */
  categoryKey?: string;
  /** Machine type used for editor/shape resolution (e.g. `filter.age`). */
  nodeType: string;
  /** Visual configuration (shape, size, color). */
  uiConfig?: UIConfig;
  /** Preferred parameter schema field. */
  parametersSchema?: ParameterSchema;
  /** @deprecated Use `parametersSchema`. Kept for backward compatibility. */
  parameters_schema?: ParameterSchema;
  /** Current parameter values for the node. */
  parameters?: Record<string, unknown>;
  /** Display labels of parent nodes (used by binary operators). */
  parents?: string[];
  /** Optional relation text shown on the node. */
  relationText?: string;
  /** Execution status used for glow styling. */
  status?: NodeStatus;
  /** Additional keys are preserved on save. */
  [key: string]: unknown;
}

/**
 * A node instance on the workflow canvas.
 * Compatible with `@xyflow/react` `Node` shapes.
 */
export interface EasyFlowNode {
  /** Unique node identifier. */
  id: string;
  /** React Flow node type (always `easyFlowNode` in the default renderer). */
  type: string;
  /** Canvas position in pixels. */
  position: { x: number; y: number };
  /** Node payload (labels, parameters, UI config). */
  data: EasyFlowNodeData;
}

/**
 * A directed edge connecting two nodes on the workflow canvas.
 * Compatible with `@xyflow/react` `Edge` shapes.
 */
export interface EasyFlowEdge {
  /** Unique edge identifier. */
  id: string;
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Optional source handle id (e.g. `second-input` for binary operators). */
  sourceHandle?: string;
  /** Optional target handle id. */
  targetHandle?: string;
  /** Edge renderer type (e.g. `smoothstep`, `default`, `straight`). */
  type?: string;
  /** Whether the edge animation is enabled. */
  animated?: boolean;
  /** Optional arrow marker configuration. */
  markerEnd?: { type: string };
  /** Inline style overrides (stroke, strokeWidth, …). */
  style?: Record<string, unknown>;
  /** Optional edge label. */
  label?: string;
  /** Additional keys are preserved on save. */
  [key: string]: unknown;
}

/**
 * Workflow-level metadata stored alongside nodes and edges.
 */
export interface WorkflowMetadata {
  /** Optional workflow identifier (empty for new workflows). */
  id?: string;
  /** Human-readable workflow name. */
  name: string;
  /** Optional description. */
  description?: string;
  /** Workflow category/type (e.g. `general`, `campaign`). */
  type?: string;
  /** Lifecycle status string from the backend. */
  status?: string;
  /** ISO timestamp when the workflow was created. */
  created_at?: string;
  /** ISO timestamp when the workflow was last updated. */
  updated_at?: string;
  /** Identifier of the most recent execution run. */
  execution_id?: string;
  /** Additional keys are preserved. */
  [key: string]: unknown;
}
