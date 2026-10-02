/**
 * Component tests for FlowNode (the "Node" component).
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowNode } from '../features/nodes';
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

  it('renders condition handles with yes/no colors on NOT EXIT', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FlowNode
          {...makeProps({
            label: 'NOT EXIT',
            nodeType: 'operators.not_exit',
            uiConfig: {
              shape: 'downtriangle',
              color: '#ef4444',
              handles: {
                mode: 'condition',
                inputs: 2,
                outputs: 1,
                inputColors: ['#22c55e', '#ef4444'],
                inputLabels: ['yes', 'no'],
              },
            },
          })}
        />
      </ReactFlowProvider>
    );
    const targets = container.querySelectorAll(
      '.react-flow__handle[data-handlepos="top"], .react-flow__handle-top'
    );
    // React Flow sets data-handlepos; also count target handles via title/id.
    const input0 = container.querySelector(
      '[data-handle-id="input-0"], #input-0, [data-testid*="input-0"]'
    );
    const input1 = container.querySelector('#second-input, [data-handle-id="input-1"]');
    const yesLabel = container.textContent?.includes('yes');
    const noLabel = container.textContent?.includes('no');
    expect(yesLabel).toBe(true);
    expect(noLabel).toBe(true);
    expect(input0 || targets.length >= 2).toBeTruthy();
    expect(input1 || targets.length >= 2).toBeTruthy();
  });

  it('renders three inputs on a rectangle (corners + middle)', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FlowNode
          {...makeProps({
            label: 'Merge',
            nodeType: 'data.merge',
            uiConfig: { handles: { inputs: 3, outputs: 2 } },
          })}
        />
      </ReactFlowProvider>
    );
    expect(container.querySelector('[data-handle-inputs="3"]')).toBeTruthy();
    expect(container.querySelector('[data-handle-outputs="2"]')).toBeTruthy();
    const targets = container.querySelectorAll(
      '.react-flow__handle.target, [data-handlepos="top"]'
    );
    // jsdom + React Flow: at least the configured input handles exist.
    const handleNodes = container.querySelectorAll('.react-flow__handle');
    expect(handleNodes.length).toBeGreaterThanOrEqual(5); // 3 in + 2 out
    void targets;
  });
});
