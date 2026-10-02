/**
 * Component tests for SchemaDrivenEditor (auto-forms from JSON Schema).
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SchemaDrivenEditor } from '../components/BaseNodeEditor/SchemaDrivenEditor';
import type { ParameterSchema } from '../types';

const schema: ParameterSchema = {
  properties: {
    min_age: { type: 'integer', title: 'Min Age' },
    max_age: { type: 'integer', title: 'Max Age' },
    gender: { type: 'string', title: 'Gender', enum: ['male', 'female', 'other'] },
    active: { type: 'boolean', title: 'Active' },
    notes: { type: 'string', title: 'Notes', description: 'Extra notes' },
  },
};

describe('SchemaDrivenEditor', () => {
  it('renders a field for each schema property', () => {
    const { container } = render(
      <SchemaDrivenEditor schema={schema} values={{}} onChange={vi.fn()} />
    );
    expect(screen.getByText('Min Age')).toBeInTheDocument();
    expect(screen.getByText('Max Age')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Extra notes')).toBeInTheDocument();
    // number + text inputs + select + checkbox
    expect(container.querySelectorAll('input, select, textarea').length).toBeGreaterThanOrEqual(4);
  });

  it('renders enum fields as a select control', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <SchemaDrivenEditor schema={schema} values={{}} onChange={onChange} />
    );
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
    await userEvent.selectOptions(select!, 'female');
    expect(onChange).toHaveBeenCalledWith('gender', 'female');
  });

  it('renders boolean fields as checkboxes', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <SchemaDrivenEditor
        schema={{ properties: { active: { type: 'boolean', title: 'Active' } } }}
        values={{}}
        onChange={onChange}
      />
    );
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
    await userEvent.click(checkbox!);
    expect(onChange).toHaveBeenCalledWith('active', true);
  });

  it('returns null when the schema has no properties', () => {
    const { container } = render(<SchemaDrivenEditor schema={{}} values={{}} onChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
