/**
 * Smoke test: renders the public WorkflowEditor entry point with an empty
 * adapter and asserts the shell (header + palette empty state) appears.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkflowEditor, EasyFlowI18nProvider, emptyAdapter } from '../index';

describe('smoke: WorkflowEditor', () => {
  it('renders the editor shell with an empty adapter', async () => {
    render(
      <EasyFlowI18nProvider locale="en">
        <div style={{ height: 400 }}>
          <WorkflowEditor adapter={emptyAdapter} />
        </div>
      </EasyFlowI18nProvider>
    );

    expect(await screen.findByText(/Edit Workflow/i)).toBeInTheDocument();
    expect(await screen.findByText(/No cards available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

  it('renders default cards from initialCards when adapter has no getCards', async () => {
    render(
      <EasyFlowI18nProvider locale="en">
        <div style={{ height: 400 }}>
          <WorkflowEditor
            initialCards={[
              {
                id: 1,
                card_key: 'control.start',
                node_type: 'control.start',
                display_name: 'Start',
                icon: '🟢',
                category: 'control',
              },
            ]}
          />
        </div>
      </EasyFlowI18nProvider>
    );

    expect(await screen.findByText(/Start/i)).toBeInTheDocument();
    expect(screen.getByText(/cards available/i)).toBeInTheDocument();
  });
});
