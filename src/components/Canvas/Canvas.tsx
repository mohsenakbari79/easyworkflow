/**
 * React Flow canvas wrapper used by {@link WorkflowEditor}.
 *
 * Configures default edge options (smoothstep + animation + stroke color),
 * snap-to-grid, minimap, controls, and background. Enriches nodes with a
 * `status` field from the `nodeStatuses` map.
 */

import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowNode } from '../../features/nodes';
import { defaultEdgeOptions, connectionLineStyle } from '../../features/edges';
import type { EasyFlowNodeData } from '../../types/node';
import styles from './Canvas.module.css';

const nodeTypes = {
  easyFlowNode: FlowNode,
};

/**
 * Props for {@link Canvas}.
 */
export interface CanvasProps {
  /** Current React Flow nodes. */
  nodes: Node[];
  /** Current React Flow edges. */
  edges: Edge[];
  /** Node change handler (drag, select, remove). */
  onNodesChange: OnNodesChange;
  /** Edge change handler (select, remove). */
  onEdgesChange: OnEdgesChange;
  /** Called when a new connection is established. */
  onConnect: (connection: Connection) => void;
  /** Optional node click handler. */
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  /** Optional edge click handler. */
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  /** Optional pane (background) click handler. */
  onPaneClick?: () => void;
  /** Optional map of node id → execution status used for glow styling. */
  nodeStatuses?: Record<string, string>;
}

/**
 * Workflow canvas with minimap, controls, and default edge styling.
 *
 * Must be rendered inside a `ReactFlowProvider` (or `WorkflowEditor`).
 *
 * @example
 * ```tsx
 * <ReactFlowProvider>
 *   <Canvas
 *     nodes={nodes}
 *     edges={edges}
 *     onNodesChange={onNodesChange}
 *     onEdgesChange={onEdgesChange}
 *     onConnect={onConnect}
 *   />
 * </ReactFlowProvider>
 * ```
 */
export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  nodeStatuses = {},
}: CanvasProps) {
  const enrichedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      status: nodeStatuses[node.id] || 'notstarted',
    },
  }));

  return (
    <div className={styles.canvas}>
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        panOnScroll
        selectionOnDrag
        deleteKeyCode={['Delete', 'Backspace']}
      >
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as unknown as EasyFlowNodeData;
            return data?.uiConfig?.color || 'var(--ef-primary, #6366f1)';
          }}
          maskColor="rgba(0,0,0,0.05)"
          zoomable
          pannable
        />
        <Controls showInteractive={false} position="top-left" />
        <Background color="var(--ef-border-color, #e0e0e0)" gap={16} />
      </ReactFlow>
    </div>
  );
}
