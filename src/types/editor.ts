import type { ComponentType } from 'react';
import type { EasyFlowNode } from './node';

/**
 * Props passed to a custom node editor component registered via
 * `nodeEditorRegistry` (or `customEditors` on `WorkflowEditor`).
 */
export interface NodeEditorProps {
  /** The node currently being edited. */
  node: EasyFlowNode;
  /** Called with the updated node when the user confirms changes. */
  onUpdate: (node: EasyFlowNode) => void;
  /** Called when the user requests node deletion. */
  onDelete: () => void;
  /** Called when the user cancels editing. */
  onCancel: () => void;
  /** Optional `{{ payload.* }}` suggestion tokens derived from trigger schemas. */
  variableSuggestions?: string[];
  /** Additional props are forwarded for custom editors. */
  [key: string]: unknown;
}

/**
 * React component type for a node editor.
 */
export type NodeEditorComponent = ComponentType<NodeEditorProps>;

/**
 * A single registration entry in the node editor registry.
 */
export interface EditorRegistryEntry {
  /** Exact node type string or predicate over `nodeType`. */
  match: string | ((nodeType: string) => boolean);
  /** Component rendered when the entry matches. */
  component: NodeEditorComponent;
  /** Unique registration key (used for unregister/cleanup). */
  key: string;
}

/**
 * Props passed to a custom node shape component registered via
 * `nodeShapeRegistry`.
 */
export interface NodeShapeProps {
  /** Node data payload (same shape as `EasyFlowNodeData`). */
  data: EasyFlowNode['data'];
  /** Whether the node is currently selected on the canvas. */
  selected?: boolean;
  /** Additional props are forwarded for custom shapes. */
  [key: string]: unknown;
}

/**
 * React component type for a custom node shape.
 */
export type NodeShapeComponent = ComponentType<NodeShapeProps>;

/**
 * A single registration entry in the node shape registry.
 */
export interface ShapeRegistryEntry {
  /** Shape identifier (e.g. `star`, `hexagon`). */
  shape: string;
  /** Component rendered for nodes whose `uiConfig.shape` matches. */
  component: NodeShapeComponent;
}
