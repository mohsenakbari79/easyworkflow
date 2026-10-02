/**
 * Default EasyFlow node renderer.
 *
 * Renders colored headers, shape containers (rectangle, ellipse, diamond,
 * downtriangle), status glow, and **dynamic** React Flow handles driven by
 * `uiConfig.handles` (counts, condition mode, per-handle colors/labels).
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import styles from './FlowNode.module.css';
import type { EasyFlowNodeData, NodeStatus, ResolvedNodeHandle } from '../../types/node';
import { resolveNodeHandles } from '../../utils/handles';

/** Status → glow color map used by {@link FlowNode}. */
const statusColors: Record<string, string> = {
  completed: '#28a745',
  executed: '#28a745',
  started: '#007bff',
  running: '#007bff',
  failed: '#dc3545',
  waiting: '#ffc107',
  notstarted: '#6c757d',
};

/**
 * Resolve the glow color for a node status.
 * @param status - Node execution status; defaults to `notstarted`.
 */
function getStatusColor(status?: NodeStatus): string {
  return statusColors[status || 'notstarted'] || '#6c757d';
}

function positionToRF(position: ResolvedNodeHandle['position']) {
  switch (position) {
    case 'bottom':
      return Position.Bottom;
    case 'left':
      return Position.Left;
    case 'right':
      return Position.Right;
    case 'top':
    default:
      return Position.Top;
  }
}

function handleStyle(handle: ResolvedNodeHandle, isDownTriangle: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    background: handle.color,
    borderColor: 'var(--ef-card-bg, #fff)',
  };
  if (handle.position === 'top') {
    if (isDownTriangle || handle.percent !== 50) {
      base.left = `${handle.percent}%`;
      base.top = '-6px';
    }
  }
  if (handle.position === 'bottom' && handle.percent !== 50) {
    base.left = `${handle.percent}%`;
  }
  return base;
}

/**
 * Default node visual component (memoized).
 *
 * Handles are resolved from `uiConfig.handles` via {@link resolveNodeHandles}.
 * Condition mode draws two colored inputs (yes/no) on inverted triangles or
 * rectangles so backends can branch by handle id/color.
 */
function FlowNodeComponent({ data, selected }: NodeProps) {
  const nodeData = (data || {}) as Partial<EasyFlowNodeData>;
  const { label = '', icon, category, uiConfig, status, nodeType = '' } = nodeData;

  const nodeColor = uiConfig?.color || '#2563eb';
  const nodeShape = uiConfig?.shape || 'rectangle';
  const nodeSize = uiConfig?.size || 'medium';
  const statusColor = getStatusColor(status);
  const hasStatus = status !== undefined && status !== 'notstarted';

  const isDownTriangle = nodeShape === 'downtriangle';
  const handles = resolveNodeHandles(nodeData);
  const inputs = handles.filter((h) => h.type === 'target');
  const outputs = handles.filter((h) => h.type === 'source');

  const shapeKey = `shape${nodeShape.charAt(0).toUpperCase() + nodeShape.slice(1)}`;
  const sizeKey = `size${nodeSize.charAt(0).toUpperCase() + nodeSize.slice(1)}`;
  const shapeClass = styles[shapeKey] || styles.shapeRectangle;
  const sizeClass = styles[sizeKey] || styles.sizeMedium;

  return (
    <div
      className={`${styles.node} ${shapeClass} ${sizeClass} ${selected ? styles.selected : ''}`}
      data-node-type={nodeType}
      data-handle-inputs={inputs.length}
      data-handle-outputs={outputs.length}
      style={
        {
          borderColor: nodeColor,
          boxShadow: hasStatus ? `0 0 12px 4px ${statusColor}` : undefined,
          borderWidth: hasStatus ? '3px' : '1px',
          borderStyle: 'solid',
          '--node-color': nodeColor,
          '--node-status-shadow': hasStatus ? `drop-shadow(0 0 10px ${statusColor})` : 'none',
        } as React.CSSProperties
      }
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

      {inputs.map((handle) => (
        // DOM id must match edge targetHandle (`input-0`, `input-1`, …).
        // Legacy `second-input` is normalized by findHandle / WorkflowEditor.
        <Handle
          key={handle.id}
          id={handle.id}
          type="target"
          position={positionToRF(handle.position)}
          className={`${styles.handle} ${handle.label ? styles.handleLabeled : ''}`}
          style={handleStyle(handle, isDownTriangle)}
          data-handle-id={handle.id}
          data-handle-label={handle.label || ''}
          title={handle.label ? `${handle.id} · ${handle.label}` : handle.id}
        />
      ))}

      <div className={styles.header} style={{ backgroundColor: nodeColor }}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.title}>{label}</span>
      </div>

      {nodeShape === 'rectangle' && (
        <div className={styles.body}>
          <span className={styles.category}>{category || 'Other'}</span>
        </div>
      )}

      {outputs.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={positionToRF(handle.position)}
          className={`${styles.handle} ${handle.label ? styles.handleLabeled : ''}`}
          style={handleStyle(handle, isDownTriangle)}
          data-handle-id={handle.id}
          data-handle-label={handle.label || ''}
          title={handle.label ? `${handle.id} · ${handle.label}` : handle.id}
        />
      ))}

      {/* Custom handle labels (match/skip, hit/miss, path-a, … — not fixed yes/no) */}
      {inputs
        .filter((h) => h.label)
        .map((h) => (
          <span
            key={`${h.id}-label`}
            className={styles.handleLabel}
            style={{
              left: h.percent <= 50 ? `${Math.max(h.percent - 8, 0)}%` : undefined,
              right: h.percent > 50 ? `${Math.max(100 - h.percent - 8, 0)}%` : undefined,
              top: isDownTriangle ? -22 : -18,
              color: h.color,
            }}
            aria-hidden="true"
          >
            {h.label}
          </span>
        ))}
      {outputs
        .filter((h) => h.label)
        .map((h) => (
          <span
            key={`${h.id}-label`}
            className={styles.handleLabel}
            style={{
              left: `${h.percent}%`,
              transform: 'translateX(-50%)',
              bottom: -18,
              color: h.color,
            }}
            aria-hidden="true"
          >
            {h.label}
          </span>
        ))}
    </div>
  );
}

/**
 * Memoized EasyFlow node component suitable for `nodeTypes` registration.
 */
export const FlowNode = React.memo(FlowNodeComponent);
