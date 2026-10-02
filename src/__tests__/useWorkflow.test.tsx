/**
 * Unit tests for the useWorkflow hook.
 */

import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkflow } from '../hooks/useWorkflow';
import type { CardDefinition } from '../types';

const startCard: CardDefinition = {
  id: 1,
  card_key: 'control.start',
  node_type: 'control.start',
  display_name: 'Start',
  display_name_i18n: { en: 'Start', fa: 'شروع' },
  icon: '🟢',
  category: 'control',
};

const filterCard: CardDefinition = {
  id: 2,
  card_key: 'filter.age',
  node_type: 'filter.age',
  display_name: 'Age Filter',
  category: 'filters.age',
};

describe('useWorkflow', () => {
  it('adds a node from a card definition', () => {
    const { result } = renderHook(() => useWorkflow({ locale: 'en' }));
    act(() => {
      result.current.addNode(startCard);
    });
    expect(result.current.state.nodes).toHaveLength(1);
    const node = result.current.state.nodes[0];
    expect(node.type).toBe('easyFlowNode');
    expect(node.data.nodeType).toBe('control.start');
    expect(node.data.label).toBe('Start');
    expect(node.data.cardKey).toBe('control.start');
    expect(result.current.state.isDirty).toBe(true);
  });

  it('resolves localized labels from display_name_i18n', () => {
    const { result } = renderHook(() => useWorkflow({ locale: 'fa' }));
    act(() => {
      result.current.addNode(startCard);
    });
    expect(result.current.state.nodes[0].data.label).toBe('شروع');
  });

  it('updates and removes nodes, cleaning up related edges', () => {
    const { result } = renderHook(() => useWorkflow({ locale: 'en' }));
    let idA = '';
    let idB = '';
    act(() => {
      idA = result.current.addNode(startCard);
      idB = result.current.addNode(filterCard);
    });

    act(() => {
      result.current.setEdges([{ id: 'e1', source: idA, target: idB, type: 'smoothstep' }]);
    });
    expect(result.current.state.edges).toHaveLength(1);

    act(() => {
      const updated = {
        ...result.current.state.nodes[0],
        data: { ...result.current.state.nodes[0].data, label: 'Renamed' },
      };
      result.current.updateNode(updated);
    });
    expect(result.current.state.nodes[0].data.label).toBe('Renamed');

    act(() => {
      result.current.removeNode(idA);
    });
    expect(result.current.state.nodes).toHaveLength(1);
    expect(result.current.state.edges).toHaveLength(0);
  });

  it('resets state to empty', () => {
    const { result } = renderHook(() => useWorkflow({ locale: 'en' }));
    act(() => {
      result.current.addNode(startCard);
      result.current.setMetadata({ name: 'X' });
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.nodes).toHaveLength(0);
    expect(result.current.state.metadata.name).toBe('');
    expect(result.current.state.isDirty).toBe(false);
  });

  it('loads a workflow snapshot', () => {
    const { result } = renderHook(() => useWorkflow({ locale: 'en' }));
    act(() => {
      result.current.load(
        [
          {
            id: 'n1',
            type: 'easyFlowNode',
            position: { x: 0, y: 0 },
            data: { label: 'Loaded', nodeType: 'control.start' },
          },
        ],
        [{ id: 'e1', source: 'n1', target: 'n1' }],
        { name: 'Loaded Flow', type: 'automation' }
      );
    });
    expect(result.current.state.nodes).toHaveLength(1);
    expect(result.current.state.nodes[0].data.label).toBe('Loaded');
    expect(result.current.state.metadata.name).toBe('Loaded Flow');
    expect(result.current.state.isDirty).toBe(false);
  });

  it('computes variable suggestions from trigger output schemas', () => {
    const { result } = renderHook(() => useWorkflow({ locale: 'en' }));
    act(() => {
      result.current.addNode({
        id: 10,
        card_key: 'trigger.webhook',
        node_type: 'trigger.webhook',
        display_name: 'Webhook',
        ui_config: {
          output_schema: {
            user: { id: 'string', email: 'string' },
            event: 'string',
          },
        },
      });
    });
    const suggestions = result.current.variableSuggestions;
    expect(suggestions).toContain('{{ payload.user.id }}');
    expect(suggestions).toContain('{{ trigger.payload.event }}');
  });

  it('supports functional setNodes/setEdges updaters', () => {
    const { result } = renderHook(() => useWorkflow({ locale: 'en' }));
    act(() => {
      result.current.addNode(startCard);
    });
    act(() => {
      result.current.setNodes((prev) => [
        ...prev,
        {
          id: 'extra',
          type: 'easyFlowNode',
          position: { x: 1, y: 1 },
          data: { label: 'Extra', nodeType: 'x' },
        },
      ]);
    });
    expect(result.current.state.nodes).toHaveLength(2);
  });
});
