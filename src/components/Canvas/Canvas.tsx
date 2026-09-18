import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowNode } from '../FlowNode';
import type { EasyFlowNodeData } from '../../types/node';
import styles from './Canvas.module.css';

const nodeTypes = {
  easyFlowNode: FlowNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: 'var(--ef-primary, #6366f1)' },
};

const connectionLineStyle = {
  stroke: 'var(--ef-primary, #6366f1)',
  strokeWidth: 2,
};

export interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick?: () => void;
  nodeStatuses?: Record<string, string>;
}

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
