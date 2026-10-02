/**
 * Component tests for Toolbar.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from '../components/Toolbar';
import { EasyFlowI18nProvider } from '../i18n/context';

function renderToolbar(props: Partial<React.ComponentProps<typeof Toolbar>> = {}) {
  const defaultProps = {
    workflowName: 'My Flow',
    workflowType: 'general',
    nodeCount: 3,
    edgeCount: 2,
    onNameChange: vi.fn(),
    onTypeChange: vi.fn(),
  };
  return render(
    <EasyFlowI18nProvider locale="en">
      <Toolbar {...defaultProps} {...props} />
    </EasyFlowI18nProvider>
  );
}

describe('Toolbar', () => {
  it('renders workflow name, type, and node/edge counts', () => {
    renderToolbar();
    expect(screen.getByDisplayValue('My Flow')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('general');
    expect(screen.getByText(/3 nodes/i)).toBeInTheDocument();
    expect(screen.getByText(/2 edges/i)).toBeInTheDocument();
  });

  it('calls onNameChange when the name input changes', () => {
    const onNameChange = vi.fn();
    renderToolbar({ onNameChange });
    const input = screen.getByDisplayValue('My Flow');
    fireEvent.change(input, { target: { value: 'Renamed' } });
    expect(onNameChange).toHaveBeenCalledWith('Renamed');
  });

  it('calls onTypeChange when the type select changes', async () => {
    const onTypeChange = vi.fn();
    renderToolbar({ onTypeChange });
    await userEvent.selectOptions(screen.getByRole('combobox'), 'campaign');
    expect(onTypeChange).toHaveBeenCalledWith('campaign');
  });

  it('renders Save when onSave is provided', () => {
    renderToolbar({ onSave: vi.fn() });
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

  it('hides Save when onSave is not provided', () => {
    renderToolbar({ onSave: undefined });
    expect(screen.queryByRole('button', { name: /Save/i })).not.toBeInTheDocument();
  });

  it('renders optional action buttons when handlers are provided', () => {
    renderToolbar({
      onBack: vi.fn(),
      onSync: vi.fn(),
      onReset: vi.fn(),
      onSave: vi.fn(),
      onValidate: vi.fn(),
      onExecute: vi.fn(),
    });
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update cards/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Execute/i })).toBeInTheDocument();
  });

  it('disables Save while saving and shows Saving label', () => {
    renderToolbar({ onSave: vi.fn(), isSaving: true });
    const save = screen.getByRole('button', { name: /Saving/i });
    expect(save).toBeDisabled();
  });

  it('invokes onSave when clicked', async () => {
    const onSave = vi.fn();
    renderToolbar({ onSave });
    await userEvent.click(screen.getByRole('button', { name: /Save/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('renders RTL layout for Persian locale', () => {
    render(
      <EasyFlowI18nProvider locale="fa">
        <Toolbar
          workflowName="جریان"
          workflowType="general"
          nodeCount={1}
          edgeCount={0}
          onNameChange={vi.fn()}
          onTypeChange={vi.fn()}
          onSave={vi.fn()}
        />
      </EasyFlowI18nProvider>
    );
    const toolbar = screen.getByRole('heading', { level: 1 }).closest('[dir]');
    expect(toolbar).toHaveAttribute('dir', 'rtl');
  });
});
