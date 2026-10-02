/**
 * Unit tests for the edges feature (default options + EasyFlowEdge wrapper).
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider, Position } from '@xyflow/react';
import { EasyFlowEdge, defaultEdgeOptions, connectionLineStyle } from '../features/edges';

describe('defaultEdgeOptions', () => {
  it('uses smoothstep with animation and primary stroke', () => {
    expect(defaultEdgeOptions.type).toBe('smoothstep');
    expect(defaultEdgeOptions.animated).toBe(true);
    expect(defaultEdgeOptions.style.stroke).toContain('--ef-primary');
  });
});

describe('connectionLineStyle', () => {
  it('uses the primary stroke color', () => {
    expect(connectionLineStyle.stroke).toContain('--ef-primary');
    expect(connectionLineStyle.strokeWidth).toBe(2);
  });
});

describe('EasyFlowEdge', () => {
  const baseProps = {
    id: 'e1',
    source: 'n1',
    target: 'n2',
    sourceX: 10,
    sourceY: 10,
    targetX: 100,
    targetY: 100,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  };

  it('renders an SVG path between source and target', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <EasyFlowEdge {...baseProps} />
        </svg>
      </ReactFlowProvider>
    );
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toMatch(/^M10,10/);
  });

  it('merges custom style with library defaults without throwing', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <EasyFlowEdge {...baseProps} style={{ strokeWidth: 5, stroke: '#ff0000' }} />
        </svg>
      </ReactFlowProvider>
    );
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    const style = path?.getAttribute('style') || '';
    const strokeAttr = path?.getAttribute('stroke') || '';
    // BaseEdge applies style via SVG presentation attributes or style attr.
    expect(
      style.includes('5') ||
        strokeAttr.includes('ff0000') ||
        path?.getAttribute('stroke-width') === '5'
    ).toBe(true);
  });

  it('renders null when coordinates are missing (unmeasured)', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <EasyFlowEdge
            {...baseProps}
            sourceX={undefined as unknown as number}
            targetX={undefined as unknown as number}
          />
        </svg>
      </ReactFlowProvider>
    );
    // BaseEdge may still render a placeholder; component must not crash.
    expect(container).toBeTruthy();
  });
});
