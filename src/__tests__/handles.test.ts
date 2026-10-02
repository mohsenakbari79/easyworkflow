/**
 * Unit tests for dynamic node handle resolution.
 */

import { describe, expect, it } from 'vitest';
import {
  CONDITION_NO_COLOR,
  CONDITION_YES_COLOR,
  DEFAULT_INPUT_COLOR,
  distributeHandlePercents,
  findHandle,
  getHandleColor,
  inferHandleConfig,
  resolveNodeHandles,
} from '../utils/handles';
import type { EasyFlowNodeData } from '../types';

function node(partial: Partial<EasyFlowNodeData>): Partial<EasyFlowNodeData> {
  return { nodeType: 'generic', label: 'N', ...partial };
}

describe('distributeHandlePercents', () => {
  it('centers a single handle', () => {
    expect(distributeHandlePercents(1)).toEqual([50]);
  });

  it('places two handles on the corners', () => {
    expect(distributeHandlePercents(2)).toEqual([22, 78]);
  });

  it('places three handles with a middle one', () => {
    expect(distributeHandlePercents(3)).toEqual([18, 50, 82]);
  });

  it('spreads four+ handles evenly', () => {
    expect(distributeHandlePercents(4)).toEqual([10, 37, 63, 90]);
    expect(distributeHandlePercents(0)).toEqual([]);
  });
});

describe('inferHandleConfig', () => {
  it('defaults to 1 input + 1 output', () => {
    const cfg = inferHandleConfig(node({ nodeType: 'action.email' }));
    expect(cfg.inputs).toBe(1);
    expect(cfg.outputs).toBe(1);
  });

  it('infers condition mode for binary operators', () => {
    const cfg = inferHandleConfig(node({ nodeType: 'operators.not_exit' }));
    expect(cfg.mode).toBe('condition');
    expect(cfg.inputs).toBe(2);
    expect(cfg.inputColors).toEqual([CONDITION_YES_COLOR, CONDITION_NO_COLOR]);
    expect(cfg.inputLabels).toEqual(['yes', 'no']);
  });

  it('prefers explicit uiConfig.handles', () => {
    const cfg = inferHandleConfig(
      node({
        nodeType: 'operators.not_exit',
        uiConfig: { handles: { inputs: 3, outputs: 2, inputColors: ['#111', '#222', '#333'] } },
      })
    );
    expect(cfg.inputs).toBe(3);
    expect(cfg.outputs).toBe(2);
  });
});

describe('resolveNodeHandles', () => {
  it('renders default single input and output', () => {
    const handles = resolveNodeHandles(node({ nodeType: 'action.email' }));
    expect(handles.map((h) => h.id)).toEqual(['input-0', 'output-0']);
    expect(handles[0].type).toBe('target');
    expect(handles[1].type).toBe('source');
    expect(handles[0].percent).toBe(50);
    expect(handles[1].percent).toBe(50);
    expect(handles[0].color).toBe(DEFAULT_INPUT_COLOR);
  });

  it('condition mode: two colored inputs with yes/no labels', () => {
    const handles = resolveNodeHandles(
      node({
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
      })
    );
    const inputs = handles.filter((h) => h.type === 'target');
    const outputs = handles.filter((h) => h.type === 'source');
    expect(inputs).toHaveLength(2);
    expect(outputs).toHaveLength(1);
    expect(inputs[0].id).toBe('input-0');
    expect(inputs[0].label).toBe('yes');
    expect(inputs[0].color).toBe('#22c55e');
    expect(inputs[0].percent).toBe(22);
    expect(inputs[1].id).toBe('input-1');
    expect(inputs[1].label).toBe('no');
    expect(inputs[1].color).toBe('#ef4444');
    expect(inputs[1].percent).toBe(78);
  });

  it('rectangle with 2 inputs and 2 outputs uses corners', () => {
    const handles = resolveNodeHandles(
      node({
        nodeType: 'data.router',
        uiConfig: {
          shape: 'rectangle',
          handles: {
            inputs: 2,
            outputs: 2,
            outputColors: ['#22c55e', '#ef4444'],
            outputLabels: ['yes', 'no'],
          },
        },
      })
    );
    const outputs = handles.filter((h) => h.type === 'source');
    expect(outputs.map((o) => o.percent)).toEqual([22, 78]);
    expect(outputs[0].color).toBe('#22c55e');
    expect(outputs[1].color).toBe('#ef4444');
  });

  it('rectangle with 3 inputs puts the third in the middle', () => {
    const handles = resolveNodeHandles(
      node({
        nodeType: 'data.merge',
        uiConfig: { handles: { inputs: 3, outputs: 1 } },
      })
    );
    const inputs = handles.filter((h) => h.type === 'target');
    expect(inputs.map((i) => i.percent)).toEqual([18, 50, 82]);
    expect(inputs.map((i) => i.id)).toEqual(['input-0', 'input-1', 'input-2']);
  });

  it('mode single forces one pair', () => {
    const handles = resolveNodeHandles(
      node({
        nodeType: 'operators.exit',
        uiConfig: { handles: { mode: 'single', inputs: 3, outputs: 3 } },
      })
    );
    expect(handles.filter((h) => h.type === 'target')).toHaveLength(1);
    expect(handles.filter((h) => h.type === 'source')).toHaveLength(1);
  });
});

describe('findHandle / getHandleColor', () => {
  const handles = resolveNodeHandles(
    node({
      nodeType: 'operators.not_exit',
      uiConfig: {
        handles: {
          mode: 'condition',
          inputColors: ['#22c55e', '#ef4444'],
        },
      },
    })
  );

  it('resolves by id and maps legacy second-input to input-1', () => {
    expect(findHandle(handles, 'input-0')?.color).toBe(CONDITION_YES_COLOR);
    expect(findHandle(handles, 'input-1')?.color).toBe(CONDITION_NO_COLOR);
    expect(findHandle(handles, 'second-input')?.id).toBe('input-1');
    expect(findHandle(handles, 'missing')).toBeNull();
  });

  it('returns handle colors for edge strokes', () => {
    expect(getHandleColor(handles, 'input-0')).toBe(CONDITION_YES_COLOR);
    expect(getHandleColor(handles, 'input-1')).toBe(CONDITION_NO_COLOR);
    expect(getHandleColor(handles, null)).toBe('var(--ef-primary, #2563eb)');
  });
});
