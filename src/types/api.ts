import type { EasyFlowNode, EasyFlowEdge, WorkflowMetadata } from './node';
import type { CardDefinition } from './card';

export interface APIAdapter {
  getCards?: () => Promise<CardDefinition[]>;
  syncCards?: () => Promise<{ created: number; updated: number; total: number }>;
  loadWorkflow?: (id: string) => Promise<Workflow>;
  saveWorkflow?: (workflow: WorkflowPayload) => Promise<Workflow>;
  validateWorkflow?: (id: string) => Promise<ValidationResult>;
  executeWorkflow?: (id: string) => Promise<void>;
  getWorkflowStatus?: (id: string) => Promise<WorkflowStatus>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  nodes: EasyFlowNode[];
  edges: EasyFlowEdge[];
  execution_id?: string;
  [key: string]: unknown;
}

export interface WorkflowPayload {
  id?: string;
  name: string;
  description?: string;
  type?: string;
  nodes: EasyFlowNode[];
  edges: EasyFlowEdge[];
}

export interface ValidationResult {
  is_valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface WorkflowStatus {
  status: 'queued' | 'running' | 'completed' | 'failed';
  total_items?: number;
  execution_time_ms?: number;
  error_message?: string;
}
