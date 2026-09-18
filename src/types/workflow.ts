import type { EasyFlowNode, EasyFlowEdge, WorkflowMetadata } from './node';
import type { NodeStatus } from './node';

export interface WorkflowState {
  nodes: EasyFlowNode[];
  edges: EasyFlowEdge[];
  metadata: WorkflowMetadata;
  nodeStatuses: Record<string, NodeStatus>;
  isDirty: boolean;
}

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
