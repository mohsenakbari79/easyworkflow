import type { EasyFlowNode, EasyFlowEdge, WorkflowMetadata } from './node';
import type { NodeStatus } from './node';

/**
 * Snapshot of workflow state managed by `useWorkflow`.
 */
export interface WorkflowState {
  /** Current canvas nodes. */
  nodes: EasyFlowNode[];
  /** Current canvas edges. */
  edges: EasyFlowEdge[];
  /** Workflow-level metadata (name, type, id, …). */
  metadata: WorkflowMetadata;
  /** Per-node execution status map. */
  nodeStatuses: Record<string, NodeStatus>;
  /** Whether the state has unsaved mutations. */
  isDirty: boolean;
}

/**
 * Reducer actions consumed by the workflow state machine.
 */
export type WorkflowAction =
  | { type: 'SET_NODES'; nodes: EasyFlowNode[] }
  | { type: 'SET_EDGES'; edges: EasyFlowEdge[] }
  | { type: 'ADD_NODE'; node: EasyFlowNode }
  | { type: 'UPDATE_NODE'; node: EasyFlowNode }
  | { type: 'REMOVE_NODE'; nodeId: string }
  | { type: 'ADD_EDGE'; edge: EasyFlowEdge }
  | { type: 'REMOVE_EDGE'; edgeId: string }
  | { type: 'SET_METADATA'; metadata: Partial<WorkflowMetadata> }
  | { type: 'SET_NODE_STATUS'; nodeId: string; status: NodeStatus }
  | { type: 'SET_NODE_STATUSES'; statuses: Record<string, NodeStatus> }
  | { type: 'RESET' }
  | { type: 'LOAD'; nodes: EasyFlowNode[]; edges: EasyFlowEdge[]; metadata: WorkflowMetadata };
