import React, { useCallback, useEffect, useState } from 'react';
import type {
  EasyFlowNode,
  NodeEditorProps,
  ParameterSchema,
} from '../../../src';
import { SchemaDrivenEditor, nodeEditorRegistry } from '../../../src';

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: 12,
  fontSize: 13,
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  color: 'var(--ef-text-color, #0f172a)',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid var(--ef-border-color, #cbd5e1)',
  font: 'inherit',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  marginTop: 16,
};

const btnPrimary: React.CSSProperties = {
  ...inputStyle,
  background: 'var(--ef-primary, #2563eb)',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  ...inputStyle,
  background: 'transparent',
  cursor: 'pointer',
};

const btnDanger: React.CSSProperties = {
  ...btnSecondary,
  color: '#dc2626',
};

function readParam(node: EasyFlowNode, key: string, fallback = ''): string {
  const value = node.data.parameters?.[key];
  return typeof value === 'string' ? value : fallback;
}

function readNumberParam(node: EasyFlowNode, key: string, fallback: number): number {
  const value = node.data.parameters?.[key];
  return typeof value === 'number' ? value : fallback;
}

/**
 * Custom editor for `actions.email` — to / subject / body form.
 */
export function EmailNodeEditor({ node, onUpdate, onDelete, onCancel }: NodeEditorProps) {
  const [to, setTo] = useState(() => readParam(node, 'to'));
  const [subject, setSubject] = useState(() => readParam(node, 'subject'));
  const [body, setBody] = useState(() => readParam(node, 'body'));

  useEffect(() => {
    setTo(readParam(node, 'to'));
    setSubject(readParam(node, 'subject'));
    setBody(readParam(node, 'body'));
  }, [node]);

  const handleConfirm = useCallback(() => {
    const updated: EasyFlowNode = {
      ...node,
      data: {
        ...node.data,
        parameters: { ...node.data.parameters, to, subject, body },
      },
    };
    onUpdate(updated);
  }, [node, onUpdate, to, subject, body]);

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Edit Email node</h3>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="ef-demo-email-to">
          To
        </label>
        <input
          id="ef-demo-email-to"
          style={inputStyle}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="recipient@example.com"
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="ef-demo-email-subject">
          Subject
        </label>
        <input
          id="ef-demo-email-subject"
          style={inputStyle}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="ef-demo-email-body">
          Body
        </label>
        <textarea
          id="ef-demo-email-body"
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div style={actionsStyle}>
        <button type="button" style={btnDanger} onClick={onDelete}>
          Delete
        </button>
        <div style={{ flex: 1 }} />
        <button type="button" style={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" style={btnPrimary} onClick={handleConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}

/**
 * Custom editor for `integrations.ai` — prompt / model / temperature.
 */
export function AiNodeEditor({ node, onUpdate, onDelete, onCancel }: NodeEditorProps) {
  const [prompt, setPrompt] = useState(() => readParam(node, 'prompt'));
  const [model, setModel] = useState(() => readParam(node, 'model', 'gpt-4'));
  const [temperature, setTemperature] = useState(() =>
    readNumberParam(node, 'temperature', 0.7)
  );

  useEffect(() => {
    setPrompt(readParam(node, 'prompt'));
    setModel(readParam(node, 'model', 'gpt-4'));
    setTemperature(readNumberParam(node, 'temperature', 0.7));
  }, [node]);

  const handleConfirm = useCallback(() => {
    const updated: EasyFlowNode = {
      ...node,
      data: {
        ...node.data,
        parameters: { ...node.data.parameters, prompt, model, temperature },
      },
    };
    onUpdate(updated);
  }, [node, onUpdate, prompt, model, temperature]);

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Edit AI node</h3>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="ef-demo-ai-prompt">
          Prompt
        </label>
        <textarea
          id="ef-demo-ai-prompt"
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="ef-demo-ai-model">
          Model
        </label>
        <select
          id="ef-demo-ai-model"
          style={inputStyle}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gpt-4">gpt-4</option>
          <option value="claude">claude</option>
          <option value="local">local</option>
        </select>
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="ef-demo-ai-temperature">
          Temperature
        </label>
        <input
          id="ef-demo-ai-temperature"
          type="number"
          min={0}
          max={1}
          step={0.1}
          style={inputStyle}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
        />
      </div>
      <div style={actionsStyle}>
        <button type="button" style={btnDanger} onClick={onDelete}>
          Delete
        </button>
        <div style={{ flex: 1 }} />
        <button type="button" style={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" style={btnPrimary} onClick={handleConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}

/**
 * Fallback editor for any node that carries a `parameters_schema` but has
 * no dedicated custom editor (e.g. control.delay). Renders SchemaDrivenEditor.
 */
export function SchemaDrivenDemoEditor({ node, onUpdate, onDelete, onCancel }: NodeEditorProps) {
  const schema: ParameterSchema =
    node.data.parametersSchema || node.data.parameters_schema || {};
  const handles = node.data.uiConfig?.handles;
  const [values, setValues] = useState<Record<string, unknown>>(
    () => ({ ...node.data.parameters })
  );

  useEffect(() => {
    setValues({ ...node.data.parameters });
  }, [node]);

  const handleChange = useCallback((field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleConfirm = useCallback(() => {
    const updated: EasyFlowNode = {
      ...node,
      data: {
        ...node.data,
        parameters: values,
      },
    };
    onUpdate(updated);
  }, [node, onUpdate, values]);

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>
        Schema parameters — {node.data.nodeType}
      </h3>
      {handles ? (
        <div
          style={{
            margin: '0 0 12px',
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: 12,
            color: '#334155',
          }}
        >
          <strong>Handles:</strong> {handles.inputs ?? 1} input(s) ·{' '}
          {handles.outputs ?? 1} output(s)
          {handles.mode === 'condition' ? ' · condition (yes/no)' : ''}
          {handles.outputColors?.length
            ? ` · outputs ${handles.outputColors.join(', ')}`
            : ''}
        </div>
      ) : null}
      <SchemaDrivenEditor schema={schema} values={values} onChange={handleChange} />
      <div style={actionsStyle}>
        <button type="button" style={btnDanger} onClick={onDelete}>
          Delete
        </button>
        <div style={{ flex: 1 }} />
        <button type="button" style={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" style={btnPrimary} onClick={handleConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}

/**
 * Guide shown when a NOT EXIT node is opened.
 * Explains the “not exist” / negated-intersection meaning.
 */
const notExitGuideStyle: React.CSSProperties = {
  margin: '0 0 12px',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #fecaca',
  background: '#fef2f2',
  color: '#7f1d1d',
  fontSize: 13,
  lineHeight: 1.5,
};

const notExitGuideTitle: React.CSSProperties = {
  margin: '0 0 6px',
  fontSize: 13,
  fontWeight: 700,
  color: '#b91c1c',
};

/**
 * Custom editor for `operators.not_exit` — shows a “not exist” guide.
 */
export function NotExitNodeEditor({ node, onUpdate, onDelete, onCancel }: NodeEditorProps) {
  const [label, setLabel] = useState(() => readParam(node, 'label', node.data.label || ''));
  const [note, setNote] = useState(() => readParam(node, 'note'));

  useEffect(() => {
    setLabel(readParam(node, 'label', node.data.label || ''));
    setNote(readParam(node, 'note'));
  }, [node]);

  const handleConfirm = useCallback(() => {
    const updated: EasyFlowNode = {
      ...node,
      data: {
        ...node.data,
        label: label || node.data.label,
        parameters: { ...node.data.parameters, note },
      },
    };
    onUpdate(updated);
  }, [node, onUpdate, label, note]);

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Edit NOT EXIT node</h3>

      <div style={notExitGuideStyle} role="note">
        <p style={notExitGuideTitle}>Guide · not exist</p>
        <p style={{ margin: 0 }}>
          <strong>NOT EXIT</strong> means <strong>not exist</strong> — the negated
          intersection of two inputs.
        </p>
        <ul style={{ margin: '8px 0 0', paddingInlineStart: 18 }}>
          <li>Flow continues only when the EXIT condition does <em>not</em> exist.</li>
          <li>
            Two inputs: <span style={{ color: '#16a34a', fontWeight: 700 }}>yes</span> (green)
            and <span style={{ color: '#dc2626', fontWeight: 700 }}>no</span> (red).
          </li>
          <li>
            Backend can route by handle: <code>targetHandle</code> ={' '}
            <code>input-0</code> (yes) or <code>input-1</code> /{' '}
            <code>second-input</code> (no).
          </li>
          <li>Handle colors are configurable via <code>uiConfig.handles.inputColors</code>.</li>
        </ul>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="ef-demo-notexit-label">
          Label
        </label>
        <input
          id="ef-demo-notexit-label"
          style={inputStyle}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="ef-demo-notexit-note">
          Note (optional)
        </label>
        <input
          id="ef-demo-notexit-note"
          style={inputStyle}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. skip when user does not exist"
        />
      </div>

      <div style={actionsStyle}>
        <button type="button" style={btnDanger} onClick={onDelete}>
          Delete
        </button>
        <div style={{ flex: 1 }} />
        <button type="button" style={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" style={btnPrimary} onClick={handleConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}

function hasSchema(nodeType: string): boolean {
  // Custom editors are registered first for actions.email / integrations.ai
  // and operators.not_exit. This predicate claims remaining schema-bearing types.
  return (
    nodeType === 'control.delay' ||
    nodeType === 'filters.age' ||
    nodeType === 'filters.gender' ||
    nodeType === 'actions.sms' ||
    nodeType === 'data.transform' ||
    nodeType === 'data.router'
  );
}

let registered = false;

/**
 * Register demo custom node editors on the library registry.
 * Safe to call multiple times (idempotent).
 */
export function registerDemoNodeEditors(): void {
  if (registered) return;
  nodeEditorRegistry.register('demo-email-editor', 'actions.email', EmailNodeEditor);
  nodeEditorRegistry.register('demo-ai-editor', 'integrations.ai', AiNodeEditor);
  nodeEditorRegistry.register('demo-not-exit-editor', 'operators.not_exit', NotExitNodeEditor);
  nodeEditorRegistry.register('demo-schema-editor', hasSchema, SchemaDrivenDemoEditor);
  registered = true;
}

/** Exposed for tests / debugging. */
export function demoEditorsReady(): boolean {
  return registered;
}
