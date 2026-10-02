/**
 * Integration tests: save and load a workflow through WorkflowEditor
 * using the in-memory mock adapter.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowEditor, EasyFlowI18nProvider } from '../index';
import { createMockAdapter, buildSampleWorkflow } from '../test/mocks/mockAdapter';

function renderEditor(ui: React.ReactElement) {
  return render(
    <EasyFlowI18nProvider locale="en">
      <div style={{ height: 600 }}>{ui}</div>
    </EasyFlowI18nProvider>
  );
}

/**
 * Add a card from the palette, then return to the palette panel so more
 * cards can be added (the editor switches to the node panel after each add).
 */
async function addNodeFromPalette(label: RegExp) {
  const card = await screen.findByRole('button', { name: label });
  await userEvent.click(card);
  // Cancel returns the side panel to the palette.
  const cancel = screen.getByRole('button', { name: /Cancel/i });
  await userEvent.click(cancel);
}

describe('integration: save workflow', () => {
  it('calls adapter.saveWorkflow with nodes added from the palette', async () => {
    const adapter = createMockAdapter();
    const onSave = vi.fn();

    renderEditor(<WorkflowEditor adapter={adapter} onSave={onSave} />);

    await addNodeFromPalette(/Start/i);
    await addNodeFromPalette(/Age Filter/i);

    const saveBtn = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    const payload = onSave.mock.calls[0][0];
    expect(payload.nodes).toHaveLength(2);
    expect(payload.edges).toHaveLength(0);
    expect(payload.name).toBe('Untitled Workflow');
    expect(payload.type).toBe('general');

    const nodeTypes = payload.nodes.map((n: { data: { nodeType: string } }) => n.data.nodeType);
    expect(nodeTypes).toContain('control.start');
    expect(nodeTypes).toContain('filter.age');
  });

  it('forwards the same payload to adapter.saveWorkflow via custom action', async () => {
    const adapter = createMockAdapter();

    renderEditor(
      <WorkflowEditor
        adapter={adapter}
        actions={[
          {
            key: 'save',
            label: 'Save',
            variant: 'primary',
            onClick: async (ctx) => {
              if (adapter.saveWorkflow) {
                await adapter.saveWorkflow({
                  id: ctx.workflowId,
                  name: ctx.name,
                  type: ctx.type,
                  nodes: ctx.nodes,
                  edges: ctx.edges,
                });
              }
            },
          },
        ]}
      />
    );

    await addNodeFromPalette(/Start/i);

    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(adapter.saveCalls.length).toBeGreaterThan(0);
    });

    const saved = adapter.saveCalls[0];
    expect(saved.nodes).toHaveLength(1);
    expect(saved.nodes[0].data.nodeType).toBe('control.start');
    expect(saved.edges).toEqual([]);
  });

  it('persists the saved workflow into the mock store', async () => {
    const adapter = createMockAdapter();

    function SaveViaAdapter() {
      const [last, setLast] = React.useState<string | null>(null);
      return (
        <>
          <WorkflowEditor
            adapter={adapter}
            actions={[
              {
                key: 'persist',
                label: 'Persist',
                onClick: async (ctx) => {
                  const result = adapter.saveWorkflow
                    ? await adapter.saveWorkflow({
                        name: ctx.name,
                        type: ctx.type,
                        nodes: ctx.nodes,
                        edges: ctx.edges,
                      })
                    : null;
                  setLast(result?.id ?? null);
                },
              },
            ]}
          />
          <output data-testid="last-id">{last}</output>
        </>
      );
    }

    renderEditor(<SaveViaAdapter />);
    await addNodeFromPalette(/Send Email/i);
    await userEvent.click(screen.getByRole('button', { name: /Persist/i }));

    await waitFor(() => {
      expect(screen.getByTestId('last-id').textContent).toMatch(/^wf-/);
    });
    expect(adapter.store.size).toBe(1);
  });
});

describe('integration: load workflow', () => {
  it('populates the editor from adapter.loadWorkflow', async () => {
    const workflow = buildSampleWorkflow('wf-load-1');
    const adapter = createMockAdapter({ workflows: [workflow] });
    const loadSpy = vi.spyOn(adapter, 'loadWorkflow');

    const { container } = renderEditor(<WorkflowEditor adapter={adapter} workflowId="wf-load-1" />);

    await waitFor(() => {
      expect(loadSpy).toHaveBeenCalledWith('wf-load-1');
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Sample Workflow')).toBeInTheDocument();
    });

    // Node labels appear on the canvas (scoped to the React Flow viewport).
    await waitFor(() => {
      const canvas = container.querySelector('.react-flow') as HTMLElement;
      expect(canvas).toBeTruthy();
      const labels = within(canvas).getAllByText(/^(Start|Age Filter)$/);
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    // Node/edge counts appear in the header metadata.
    await waitFor(() => {
      expect(screen.getByText(/2 nodes/i)).toBeInTheDocument();
      expect(screen.getByText(/1 edges/i)).toBeInTheDocument();
    });
  });

  it('shows a toast when loadWorkflow fails', async () => {
    const adapter = createMockAdapter({ failLoad: true });
    const showToast = vi.fn();

    renderEditor(<WorkflowEditor adapter={adapter} workflowId="missing" showToast={showToast} />);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'error',
        expect.stringMatching(/failed to load workflow/i)
      );
    });
  });

  it('does not call loadWorkflow for new workflows', async () => {
    const adapter = createMockAdapter();
    const loadSpy = vi.spyOn(adapter, 'loadWorkflow');

    renderEditor(<WorkflowEditor adapter={adapter} workflowId="new" />);

    await waitFor(() => {
      expect(screen.getByText(/Edit Workflow/i)).toBeInTheDocument();
    });
    expect(loadSpy).not.toHaveBeenCalled();
  });
});

describe('integration: save then load round-trip', () => {
  it('round-trips nodes through the mock store', async () => {
    const adapter = createMockAdapter();

    function RoundTrip() {
      const [savedId, setSavedId] = React.useState<string | null>(null);
      return (
        <WorkflowEditor
          adapter={adapter}
          workflowId={savedId ?? undefined}
          actions={[
            {
              key: 'save',
              label: 'Save',
              onClick: async (ctx) => {
                const result = adapter.saveWorkflow
                  ? await adapter.saveWorkflow({
                      name: 'Round Trip',
                      type: 'automation',
                      nodes: ctx.nodes,
                      edges: ctx.edges,
                    })
                  : null;
                if (result?.id) setSavedId(result.id);
              },
            },
          ]}
        />
      );
    }

    const { unmount } = renderEditor(<RoundTrip />);
    await addNodeFromPalette(/Start/i);
    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(adapter.saveCalls).toHaveLength(1);
    });
    const savedPayload = adapter.saveCalls[0];
    expect(savedPayload.nodes).toHaveLength(1);
    expect(savedPayload.nodes[0].data.nodeType).toBe('control.start');

    unmount();

    const saved = adapter.store.get('wf-1');
    expect(saved).toBeTruthy();
    expect(saved!.nodes).toHaveLength(1);

    const second = renderEditor(<WorkflowEditor adapter={adapter} workflowId="wf-1" />);

    await waitFor(() => {
      expect(second.container.ownerDocument.body).toBeTruthy();
      expect(screen.getByDisplayValue('Round Trip')).toBeInTheDocument();
    });

    await waitFor(() => {
      const canvas = second.container.querySelector('.react-flow') as HTMLElement;
      expect(within(canvas).getByText('Start')).toBeInTheDocument();
    });
  });
});
