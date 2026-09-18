export type NodeShape = 'rectangle' | 'ellipse' | 'diamond' | 'downtriangle';
export type NodeSize = 'small' | 'medium' | 'large';
export type NodeStatus = 'notstarted' | 'running' | 'completed' | 'failed' | 'waiting' | 'queued';

export interface UIConfig {
  shape?: NodeShape;
  size?: NodeSize;
  color?: string;
  icon?: string;
  output_schema?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ParameterSchema {
  type?: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  properties?: Record<string, ParameterSchema>;
  items?: ParameterSchema;
  required?: string[];
  [key: string]: unknown;
}

export interface EasyFlowNodeData {
  label: string;
  /** Locale-keyed labels (preferred over legacy suffixed fields). */
  label_i18n?: Record<string, string>;
  /** @deprecated Use label_i18n instead. Legacy Farsi label. */
  label_fa?: string;
  /** @deprecated Use label_i18n instead. Legacy English label. */
  label_en?: string;

  description?: string;
  /** Locale-keyed descriptions. */
  description_i18n?: Record<string, string>;
  /** @deprecated Use description_i18n instead. Legacy Farsi description. */
  description_fa?: string;
  /** @deprecated Use description_i18n instead. Legacy English description. */
  description_en?: string;

  icon?: string;
  cardKey?: string;
  category?: string;
  categoryKey?: string;
  nodeType: string;
  uiConfig?: UIConfig;
  parametersSchema?: ParameterSchema;
  parameters_schema?: ParameterSchema;
  parameters?: Record<string, unknown>;
  parents?: string[];
  relationText?: string;
  status?: NodeStatus;
  [key: string]: unknown;
}

export interface EasyFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: EasyFlowNodeData;
}

export interface EasyFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  markerEnd?: { type: string };
  style?: Record<string, unknown>;
  label?: string;
  [key: string]: unknown;
}

export interface WorkflowMetadata {
  id?: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  execution_id?: string;
  [key: string]: unknown;
}
