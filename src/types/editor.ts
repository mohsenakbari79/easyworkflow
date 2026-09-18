import type { ComponentType } from 'react';
import type { EasyFlowNode } from './node';

export interface NodeEditorProps {
  node: EasyFlowNode;
  onUpdate: (node: EasyFlowNode) => void;
  onDelete: () => void;
  onCancel: () => void;
  variableSuggestions?: string[];
  [key: string]: unknown;
}

export type NodeEditorComponent = ComponentType<NodeEditorProps>;

export interface EditorRegistryEntry {
  match: string | ((nodeType: string) => boolean);
  component: NodeEditorComponent;
  key: string;
}

export interface NodeShapeProps {
  data: EasyFlowNode['data'];
  selected?: boolean;
  [key: string]: unknown;
}

export type NodeShapeComponent = ComponentType<NodeShapeProps>;

export interface ShapeRegistryEntry {
  shape: string;
  component: NodeShapeComponent;
}
