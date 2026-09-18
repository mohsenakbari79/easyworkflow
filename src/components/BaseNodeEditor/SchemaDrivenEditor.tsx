import React, { useMemo } from 'react';
import type { ParameterSchema } from '../../types/node';
import styles from './BaseNodeEditor.module.css';

interface SchemaDrivenEditorProps {
  schema: ParameterSchema;
  values: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}

function getOperatorLabel(op: string): string {
  const map: Record<string, string> = {
    eq: '=', neq: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤',
    between: '↔', in: '∈', not_in: '∉', contains: '⊃', not_contains: '⊅',
    starts_with: '⌕', ends_with: '⌔',
  };
  return map[op] || op;
}

function SchemaField({
  name,
  schema,
  value,
  onChange,
}: {
  name: string;
  schema: ParameterSchema;
  value: unknown;
  onChange: (field: string, value: unknown) => void;
}) {
  const label = schema.title || name.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  if (schema.enum) {
    return (
      <div className={styles.schemaField}>
        <label className={styles.schemaFieldLabel}>{label}</label>
        {schema.description && <div className={styles.schemaFieldDesc}>{schema.description}</div>}
        <select
          className={`${styles.input} ${styles.select}`}
          value={(value as string) || ''}
          onChange={(e) => onChange(name, e.target.value)}
        >
          <option value="">Select...</option>
          {schema.enum.map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {String(opt)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'boolean') {
    return (
      <div className={styles.schemaField}>
        <label className={styles.schemaFieldLabel}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(name, e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          {label}
        </label>
        {schema.description && <div className={styles.schemaFieldDesc}>{schema.description}</div>}
      </div>
    );
  }

  if (type === 'integer' || type === 'number') {
    return (
      <div className={styles.schemaField}>
        <label className={styles.schemaFieldLabel}>{label}</label>
        {schema.description && <div className={styles.schemaFieldDesc}>{schema.description}</div>}
        <input
          className={styles.input}
          type="number"
          value={(value as number) ?? ''}
          onChange={(e) => onChange(name, e.target.value === '' ? undefined : Number(e.target.value))}
        />
      </div>
    );
  }

  if (type === 'array') {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div className={styles.schemaField}>
        <label className={styles.schemaFieldLabel}>{label}</label>
        {schema.description && <div className={styles.schemaFieldDesc}>{schema.description}</div>}
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          value={arr.join('\n')}
          onChange={(e) => onChange(name, e.target.value.split('\n').filter(Boolean))}
          placeholder="One item per line"
        />
      </div>
    );
  }

  // Default: string input
  return (
    <div className={styles.schemaField}>
      <label className={styles.schemaFieldLabel}>{label}</label>
      {schema.description && <div className={styles.schemaFieldDesc}>{schema.description}</div>}
      <input
        className={styles.input}
        type="text"
        value={(value as string) || ''}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  );
}

export function SchemaDrivenEditor({ schema, values, onChange }: SchemaDrivenEditorProps) {
  const properties = useMemo(() => schema.properties || {}, [schema.properties]);

  if (Object.keys(properties).length === 0) {
    return null;
  }

  return (
    <div>
      {Object.entries(properties).map(([key, propSchema]) => (
        <SchemaField
          key={key}
          name={key}
          schema={propSchema}
          value={values[key]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
