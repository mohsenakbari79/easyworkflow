/**
 * easyworkflow
 * A fully configurable, i18n-ready visual workflow editor for React.
 *
 * @packageDocumentation
 * @license MIT
 * @see https://github.com/mohsenakbari79/easyworkflow
 */

// Global styles
import './styles/easyflow.css';

// Re-export everything publicly needed
export * from './hooks';
export * from './types';
export { nodeEditorRegistry, nodeShapeRegistry } from './registry';
export * from './utils';

// Features — workflow editor
export { WorkflowEditor } from './features/workflow-editor';
export type { ToolbarAction, WorkflowActionItem } from './features/workflow-editor';

// Features — nodes
export { FlowNode } from './features/nodes';

// Features — edges (new exports; existing names unchanged)
export { EasyFlowEdge, defaultEdgeOptions, connectionLineStyle } from './features/edges';

// Components (presentational shells)
export { Canvas } from './components/Canvas';
export { Palette } from './components/Palette';
export { BaseNodeEditor } from './components/BaseNodeEditor';
export { SchemaDrivenEditor } from './components/BaseNodeEditor/SchemaDrivenEditor';
export { NodeEditorPanel } from './components/NodeEditorPanel';
export { Toolbar } from './components/Toolbar';

// i18n
export { EasyFlowI18nProvider } from './i18n/context';
export type { Locale, EasyFlowI18nProviderProps } from './i18n/context';
export { en, fa, RTL_LOCALES } from './i18n';
export { isRTLLocale } from './i18n/locales';

// Adapters
export { emptyAdapter, noopAdapter } from './adapters';
export type { APIAdapter as APIAdapterType } from './adapters';
