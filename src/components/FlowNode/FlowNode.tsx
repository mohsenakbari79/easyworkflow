import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import styles from './FlowNode.module.css';
import type { EasyFlowNodeData, NodeStatus } from '../../types/node';

const statusColors: Record<string, string> = {
  completed: '#28a745',
  executed: '#28a745',
  started: '#007bff',
  running: '#007bff',
  failed: '#dc3545',
  waiting: '#ffc107',
  notstarted: '#6c757d',
};

function getStatusColor(status?: NodeStatus): string {
  return statusColors[status || 'notstarted'] || '#6c757d';
}

function FlowNodeComponent({ data, selected }: NodeProps) {
  try {
    const nodeData = (data || {}) as Partial<EasyFlowNodeData>;
    const { label = '', icon, category, uiConfig, status, nodeType = '' } = nodeData;

    const nodeColor = uiConfig?.color || '#2563eb';
    const nodeShape = uiConfig?.shape || 'rectangle';
    const nodeSize = uiConfig?.size || 'medium';
    const statusColor = getStatusColor(status);
    const hasStatus = status && status !== 'notstarted';

    const isExit = nodeType.startsWith('operator.exit');
    const isNotExit = nodeType.startsWith('operator.not_exit');
    const isBinaryOperator = isExit || isNotExit;
    const isDownTriangle = nodeShape === 'downtriangle';

    const shapeKey = `shape${nodeShape.charAt(0).toUpperCase() + nodeShape.slice(1)}`;
    const sizeKey = `size${nodeSize.charAt(0).toUpperCase() + nodeSize.slice(1)}`;
    const shapeClass = styles[shapeKey] || styles.shapeRectangle;
    const sizeClass = styles[sizeKey] || styles.sizeMedium;

    return (
      <div
        className={`${styles.node} ${shapeClass} ${sizeClass} ${selected ? styles.selected : ''}`}
        style={{
          borderColor: nodeColor,
          boxShadow: hasStatus ? `0 0 12px 4px ${statusColor}` : undefined,
          borderWidth: hasStatus ? '3px' : '1px',
          borderStyle: 'solid',
          '--node-color': nodeColor,
          '--node-status-shadow': hasStatus ? `drop-shadow(0 0 10px ${statusColor})` : 'none',
        } as React.CSSProperties}
      >
        {isDownTriangle && (
          <svg
            viewBox="0 0 100 90"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
          >
            <path d="M50 90 Q12 60 8 8 Q50 0 92 8 Q88 60 50 90 Z" fill={nodeColor} />
          </svg>
        )}

        {isBinaryOperator && isDownTriangle ? (
          <>
            <Handle
              type="target"
              position={Position.Top}
              className={`${styles.handle} ${styles.handleBinary} ${styles.handle1} ${styles.handleCornerLeft}`}
              style={{ background: nodeColor, left: '22%', top: '-6px' }}
            />
            <Handle
              type="target"
              position={Position.Top}
              className={`${styles.handle} ${styles.handleBinary} ${styles.handle2} ${styles.handleCornerRight}`}
              style={{ background: nodeColor, left: '78%', top: '-6px' }}
              id="second-input"
            />
          </>
        ) : (
          <>
            <Handle
              type="target"
              position={Position.Top}
              className={`${styles.handle} ${isBinaryOperator ? `${styles.handleBinary} ${styles.handle1}` : ''}`}
              style={{ background: nodeColor }}
            />
            {isBinaryOperator && (
              <Handle
                type="target"
                position={Position.Left}
                className={`${styles.handle} ${styles.handleBinary} ${styles.handle2}`}
                style={{ background: nodeColor, top: '70%' }}
                id="second-input"
              />
            )}
          </>
        )}

        <div className={styles.header} style={{ backgroundColor: nodeColor }}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.title}>{label}</span>
        </div>

        {nodeShape === 'rectangle' && (
          <div className={styles.body}>
            <span className={styles.category}>{category || 'Other'}</span>
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className={styles.handle}
          style={{ background: nodeColor }}
        />
      </div>
    );
  } catch (err) {
    console.error('[EasyFlow] FlowNode render error:', err);
    return (
      <div style={{ padding: 8, background: '#fee', border: '1px solid #fcc', borderRadius: 4, fontSize: 12 }}>
        Error rendering node
      </div>
    );
  }
}

export const FlowNode = React.memo(FlowNodeComponent);
