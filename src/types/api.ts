import type { EasyFlowNode, EasyFlowEdge, WorkflowMetadata } from './node';
import type { CardDefinition } from './card';

/**
 * Backend integration contract for the workflow editor.
 *
 * Only `getCards` is required for the palette to render; every other method
 * is optional and used by the corresponding toolbar action when present.
 */
export interface APIAdapter {
  /** Load the list of available palette cards. */
  getCards?: () => Promise<CardDefinition[]>;
  /** Synchronize cards with the backend; returns a summary. */
  syncCards?: () => Promise<{ created: number; updated: number; total: number }>;
  /** Load a saved workflow by id (used when `workflowId` is set). */
  loadWorkflow?: (id: string) => Promise<Workflow>;
  /** Persist a workflow; called by the default Save action / `onSave`. */
  saveWorkflow?: (workflow: WorkflowPayload) => Promise<Workflow>;
  /** Validate a saved workflow and return errors/warnings. */
  validateWorkflow?: (id: string) => Promise<ValidationResult>;
  /** Trigger backend execution of a saved workflow. */
  executeWorkflow?: (id: string) => Promise<void>;
  /** Poll execution status for a workflow. */
  getWorkflowStatus?: (id: string) => Promise<WorkflowStatus>;
}

/**
 * A persisted workflow record as returned by the backend.
 */
export interface Workflow {
  /** Workflow identifier. */
  id: string;
  /** Human-readable workflow name. */
  name: string;
  /** Optional description. */
  description?: string;
  /** Workflow type/category. */
  type?: string;
  /** Lifecycle status string. */
  status?: string;
  /** Canvas nodes. */
  nodes: EasyFlowNode[];
  /** Canvas edges. */
  edges: EasyFlowEdge[];
  /** Identifier of the latest execution run. */
  execution_id?: string;
  /** Additional backend-specific keys are preserved. */
  [key: string]: unknown;
}

/**
 * Payload sent to `APIAdapter.saveWorkflow` (and `onSave`).
 */
export interface WorkflowPayload {
  /** Optional existing workflow id (absent for new workflows). */
  id?: string;
  /** Human-readable workflow name. */
  name: string;
  /** Optional description. */
  description?: string;
  /** Workflow type/category. */
  type?: string;
  /** Canvas nodes. */
  nodes: EasyFlowNode[];
  /** Canvas edges. */
  edges: EasyFlowEdge[];
}

/**
 * Result of a workflow validation call.
 */
export interface ValidationResult {
  /** Whether the workflow passed validation. */
  is_valid: boolean;
  /** Blocking errors, if any. */
  errors?: string[];
  /** Non-blocking warnings, if any. */
  warnings?: string[];
}

/**
 * Execution status returned by `APIAdapter.getWorkflowStatus`.
 */
export interface WorkflowStatus {
  /** Current execution state. */
  status: 'queued' | 'running' | 'completed' | 'failed';
  /** Total items processed by the run. */
  total_items?: number;
  /** Wall-clock execution time in milliseconds. */
  execution_time_ms?: number;
  /** Error message when `status` is `failed`. */
  error_message?: string;
}

/**
 * Re-exported for convenience so consumers can type adapter callbacks
 * without importing from `types/api` directly.
 */
export type { WorkflowMetadata };
