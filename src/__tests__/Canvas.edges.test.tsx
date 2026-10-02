/**
 * Component tests for Canvas / edges.
 *
 * There is no standalone Edge component; edges are rendered by React Flow
 * via Canvas defaults. These tests wrap Canvas in ReactFlowProvider. Edge
 * SVG rendering depends on async node measurement, so we use waitFor and
 * assert edges appear in the React Flow edges layer.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '../components/Canvas';

const nodes = [
  {
    id: 'n1',
    type: 'easyFlowNode' as const,
    position: { x: 0, y: 0 },
    data: { label: 'Start', nodeType: 'control.start' },
  },
  {
    id: 'n2',
    type: 'easyFlowNode' as const,
    position: { x: 200, y: 0 },
    data: { label: 'Filter', nodeType: 'filter.age' },
  },
];

const edges = [
  {
    id: 'e1',
    source: 'n1',
    target: 'n2',
    type: 'smoothstep' as const,
  },
];

function renderCanvas(edgeList = edges, nodeList = nodes) {
  return render(
    <ReactFlowProvider>
      <div style={{ width: 800, height: 600 }}>
        <Canvas
          nodes={nodeList}
          edges={edgeList}
          onNodesChange={vi.fn()}
          onEdgesChange={vi.fn()}
          onConnect={vi.fn()}
        />
      </div>
    </ReactFlowProvider>
  );
}

describe('Canvas edges', () => {
  it('renders nodes inside the React Flow viewport', async () => {
    renderCanvas();
    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
  });

  it('renders edge elements after React Flow measures nodes', async () => {
    const { container } = renderCanvas();
    // Measurement is async (ResizeObserver + rAF). Poll the edges layer.
    await waitFor(
      () => {
        const edgesLayer = container.querySelector('.react-flow__edges');
        expect(edgesLayer).toBeTruthy();
        const edgeEls = container.querySelectorAll(
          '.react-flow__edge, .react-flow__edge-path, g.react-flow__edge'
        );
        expect(edgeEls.length).toBeGreaterThan(0);
      },
      { timeout: 8000, interval: 50 }
    );
  });

  it('keeps both nodes mounted when an edge is present', async () => {
    renderCanvas();
    await waitFor(() => {
      expect(screen.getByTestId('rf__node-n1')).toBeInTheDocument();
      expect(screen.getByTestId('rf__node-n2')).toBeInTheDocument();
    });
  });

  it('renders minimap and controls chrome', async () => {
    const { container } = renderCanvas();
    await waitFor(() => {
      expect(container.querySelector('.react-flow__minimap')).toBeTruthy();
      expect(container.querySelector('.react-flow__controls')).toBeTruthy();
    });
  });

  it('renders without edge elements when the edge list is empty', async () => {
    const { container } = renderCanvas([], nodes);
    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
    // Give measurement a tick, then assert no edges were produced.
    await new Promise((r) => setTimeout(r, 200));
    expect(container.querySelectorAll('.react-flow__edge')).toHaveLength(0);
  });

  it('renders an edge between the two known nodes once measured', async () => {
    const { container } = renderCanvas();
    await waitFor(
      () => {
        const all = Array.from(container.querySelectorAll('*'));
        const hasEdgeId = all.some(
          (el) =>
            el.getAttribute('data-id') === 'e1' ||
            ((el.getAttribute('class') || '').includes('edge') &&
              (el.getAttribute('data-id') || '').includes('e1'))
        );
        const edgeCount = container.querySelectorAll('.react-flow__edge').length;
        expect(hasEdgeId || edgeCount > 0).toBe(true);
      },
      { timeout: 8000, interval: 50 }
    );
  });
});
