/**
 * Public type surface for easyworkflow.
 *
 * Import types from the package root (`@malevin/easyworkflow`) rather than
 * deep paths so refactors stay non-breaking.
 */

export type {
  NodeShape,
  NodeSize,
  NodeStatus,
  UIConfig,
  ParameterSchema,
  EasyFlowNodeData,
  EasyFlowNode,
  EasyFlowEdge,
  WorkflowMetadata,
} from './node';

export type { CardDefinition, CardCategoryNode } from './card';

export type {
  APIAdapter,
  Workflow,
  WorkflowPayload,
  ValidationResult,
  WorkflowStatus,
} from './api';

export type { WorkflowState, WorkflowAction } from './workflow';

export type {
  NodeEditorProps,
  NodeEditorComponent,
  EditorRegistryEntry,
  NodeShapeProps,
  NodeShapeComponent,
  ShapeRegistryEntry,
} from './editor';
