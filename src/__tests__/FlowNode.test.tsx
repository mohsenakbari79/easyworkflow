/**
 * Component tests for FlowNode (the "Node" component).
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowNode } from '../components/FlowNode';
import type { EasyFlowNodeData } from '../types';

/** Minimal valid NodeProps for the memoized FlowNode component. */
function makeProps(data: Partial<EasyFlowNodeData>, selected = false) {
  return {
    id: 'test-node',
    data,
    selected,
    type: 'easyFlowNode',
    position: { x: 0, y: 0 },
    zIndex: 0,
    isConnectable: false,
    dragging: false,
  } as unknown as React.ComponentProps<typeof FlowNode>;
}

describe('FlowNode', () => {
  it('renders the node label and icon', () => {
    render(
      <ReactFlowProvider>
        <FlowNode
          {...makeProps({
            label: 'Age Filter',
            icon: '🔢',
            category: 'filters',
            nodeType: 'filter.age',
          })}
        />
      </ReactFlowProvider>
    );
    expect(screen.getByText('Age Filter')).toBeInTheDocument();
    expect(screen.getByText('🔢')).toBeInTheDocument();
    expect(screen.getByText('filters')).toBeInTheDocument();
  });

  it('renders without icon and category when missing', () => {
    render(
      <ReactFlowProvider>
        <FlowNode {...makeProps({ label: 'Bare', nodeType: 'generic' })} />
      </ReactFlowProvider>
    );
    expect(screen.getByText('Bare')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('renders the node container element', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FlowNode {...makeProps({ label: 'Sel', nodeType: 'generic' }, true)} />
      </ReactFlowProvider>
    );
    expect(container.querySelector('[class*="node"]')).toBeTruthy();
  });

  it('renders binary operator second-input handle for operator.exit', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FlowNode
          {...makeProps({
            label: 'EXIT',
            nodeType: 'operator.exit',
            uiConfig: { shape: 'downtriangle' },
          })}
        />
      </ReactFlowProvider>
    );
    const handles = container.querySelectorAll('.react-flow__handle');
    expect(handles.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a source and target handle for normal nodes', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FlowNode {...makeProps({ label: 'Normal', nodeType: 'filter.age' })} />
      </ReactFlowProvider>
    );
    const handles = container.querySelectorAll('.react-flow__handle');
    // target (top) + source (bottom)
    expect(handles.length).toBeGreaterThanOrEqual(2);
  });

  it('applies status glow styling for running nodes', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FlowNode
          {...makeProps({
            label: 'Running',
            nodeType: 'filter.age',
            status: 'running',
          })}
        />
      </ReactFlowProvider>
    );
    const node = container.querySelector('[class*="node"]');
    const style = node?.getAttribute('style') || '';
    expect(style).toContain('box-shadow');
  });
});
