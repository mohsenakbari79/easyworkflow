/**
 * Edge feature: default edge options and a thin React Flow edge wrapper.
 *
 * The library historically configured edges inline in `Canvas`. Those
 * defaults now live here so consumers can reuse or override them.
 */

import React from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

/**
 * Default visual options applied to every new edge created by the editor
 * (smoothstep routing, animation, primary stroke color).
 */
export const defaultEdgeOptions = {
  type: 'smoothstep' as const,
  animated: true,
  style: { stroke: 'var(--ef-primary, #6366f1)' },
};

/**
 * Line style used while the user drags a new connection.
 */
export const connectionLineStyle = {
  stroke: 'var(--ef-primary, #6366f1)',
  strokeWidth: 2,
};

/**
 * Thin edge wrapper around React Flow's `BaseEdge`.
 *
 * Applies the library's default stroke color and supports the standard
 * smoothstep visual contract. Register via `edgeTypes` when you need a
 * custom edge renderer while keeping the same data shape.
 *
 * @example
 * ```tsx
 * import { EasyFlowEdge, defaultEdgeOptions } from '@malevin/easyworkflow';
 *
 * <ReactFlow
 *   edges={edges}
 *   defaultEdgeOptions={defaultEdgeOptions}
 *   edgeTypes={{ easyFlowEdge: EasyFlowEdge }}
 * />
 * ```
 */
export function EasyFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: 'var(--ef-primary, #6366f1)',
          strokeWidth: 2,
          ...style,
        }}
        label={label}
        labelX={labelX}
        labelY={labelY}
      />
    </>
  );
}

export type { EdgeProps };
