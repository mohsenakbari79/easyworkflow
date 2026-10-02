import React, { useCallback, useEffect, useState } from 'react';
import type {
  EasyFlowNode,
  NodeEditorProps,
  NodeHandleConfig,
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

const handleRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 90px 28px',
  gap: 8,
  alignItems: 'center',
  marginBottom: 6,
};

const colorInputStyle: React.CSSProperties = {
  ...inputStyle,
  padding: 2,
  height: 32,
  width: '100%',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '12px 0 8px',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--ef-text-muted, #64748b)',
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
 * Editable handle settings — labels/colors/counts are fully dynamic.
 * The backend can ship defaults via `uiConfig.handles`; the user can change
 * them per node (match/skip, hit/miss, path-a/path-b, or anything else).
 */
export function HandleSettingsFields({
  handles,
  onChange,
}: {
  handles: NodeHandleConfig | undefined;
  onChange: (next: NodeHandleConfig) => void;
}) {
  const cfg: NodeHandleConfig = handles || { inputs: 1, outputs: 1 };
  const inputs = Math.min(Math.max(cfg.inputs ?? 1, 0), 6);
  const outputs = Math.min(Math.max(cfg.outputs ?? 1, 0), 6);

  const update = (patch: Partial<NodeHandleConfig>) => onChange({ ...cfg, ...patch });

  const updateInput = (index: number, patch: Partial<{ label: string; color: string }>) => {
    const inputLabels = [...(cfg.inputLabels || [])];
    const inputColors = [...(cfg.inputColors || [])];
    while (inputLabels.length < inputs) inputLabels.push('');
    while (inputColors.length < inputs) inputColors.push('#64748b');
    if (patch.label !== undefined) inputLabels[index] = patch.label;
    if (patch.color !== undefined) inputColors[index] = patch.color;
    update({ inputLabels, inputColors });
  };

  const updateOutput = (index: number, patch: Partial<{ label: string; color: string }>) => {
    const outputLabels = [...(cfg.outputLabels || [])];
    const outputColors = [...(cfg.outputColors || [])];
    while (outputLabels.length < outputs) outputLabels.push('');
    while (outputColors.length < outputs) outputColors.push('#2563eb');
    if (patch.label !== undefined) outputLabels[index] = patch.label;
    if (patch.color !== undefined) outputColors[index] = patch.color;
    update({ outputLabels, outputColors });
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={sectionTitleStyle}>Handles (dynamic)</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <label style={{ fontSize: 12 }}>
          Inputs
          <input
            type="number"
            min={0}
            max={6}
            style={{ ...inputStyle, width: 64, marginLeft: 6 }}
            value={inputs}
            onChange={(e) => update({ inputs: Number(e.target.value) })}
          />
        </label>
        <label style={{ fontSize: 12 }}>
          Outputs
          <input
            type="number"
            min={0}
            max={6}
            style={{ ...inputStyle, width: 64, marginLeft: 6 }}
            value={outputs}
            onChange={(e) => update({ outputs: Number(e.target.value) })}
          />
        </label>
      </div>

      <div style={sectionTitleStyle}>Input labels</div>
      {Array.from({ length: inputs }, (_, i) => (
        <div key={`in-${i}`} style={handleRowStyle}>
          <input
            aria-label={`Input ${i} label`}
            style={inputStyle}
            placeholder={`input-${i} label (e.g. match, hit, path-a)`}
            value={cfg.inputLabels?.[i] || ''}
            onChange={(e) => updateInput(i, { label: e.target.value })}
          />
          <input
            aria-label={`Input ${i} color`}
            type="color"
            style={colorInputStyle}
            value={cfg.inputColors?.[i] || '#64748b'}
            onChange={(e) => updateInput(i, { color: e.target.value })}
          />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>in-{i}</span>
        </div>
      ))}

      <div style={sectionTitleStyle}>Output labels</div>
      {Array.from({ length: outputs }, (_, i) => (
        <div key={`out-${i}`} style={handleRowStyle}>
          <input
            aria-label={`Output ${i} label`}
            style={inputStyle}
            placeholder={`output-${i} label (e.g. skip, miss, path-b)`}
            value={cfg.outputLabels?.[i] || ''}
            onChange={(e) => updateOutput(i, { label: e.target.value })}
          />
          <input
            aria-label={`Output ${i} color`}
            type="color"
            style={colorInputStyle}
            value={cfg.outputColors?.[i] || '#2563eb'}
            onChange={(e) => updateOutput(i, { color: e.target.value })}
          />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>out-{i}</span>
        </div>
      ))}
    </div>
  );
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
  const [values, setValues] = useState<Record<string, unknown>>(
    () => ({ ...node.data.parameters })
  );
  const [handles, setHandles] = useState<NodeHandleConfig | undefined>(
    () => ({ ...node.data.uiConfig?.handles })
  );

  useEffect(() => {
    setValues({ ...node.data.parameters });
    setHandles({ ...node.data.uiConfig?.handles });
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
        uiConfig: {
          ...node.data.uiConfig,
          handles,
        },
      },
    };
    onUpdate(updated);
  }, [node, onUpdate, values, handles]);

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>
        Settings — {node.data.nodeType}
      </h3>
      <HandleSettingsFields handles={handles} onChange={setHandles} />
      {Object.keys(schema.properties || {}).length > 0 ? (
        <>
          <div style={sectionTitleStyle}>Parameters</div>
          <SchemaDrivenEditor schema={schema} values={values} onChange={handleChange} />
        </>
      ) : null}
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
  const [handles, setHandles] = useState<NodeHandleConfig | undefined>(
    () => ({ ...node.data.uiConfig?.handles })
  );

  useEffect(() => {
    setLabel(readParam(node, 'label', node.data.label || ''));
    setNote(readParam(node, 'note'));
    setHandles({ ...node.data.uiConfig?.handles });
  }, [node]);

  const handleConfirm = useCallback(() => {
    const updated: EasyFlowNode = {
      ...node,
      data: {
        ...node.data,
        label: label || node.data.label,
        parameters: { ...node.data.parameters, note },
        uiConfig: { ...node.data.uiConfig, handles },
      },
    };
    onUpdate(updated);
  }, [node, onUpdate, label, note, handles]);

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Edit NOT EXIT node</h3>

      <div style={notExitGuideStyle} role="note">
        <p style={notExitGuideTitle}>Guide · not exist</p>
        <p style={{ margin: 0 }}>
          <strong>NOT EXIT</strong> means <strong>not exist</strong> — the negated
          branch of two inputs.
        </p>
        <ul style={{ margin: '8px 0 0', paddingInlineStart: 18 }}>
          <li>Handle labels are <strong>custom</strong> (not always yes/no).</li>
          <li>
            Current sample uses <em>exists</em> / <em>not-exist</em> — change them
            below for your backend.
          </li>
          <li>
            Route by <code>targetHandle</code>: <code>input-0</code>,{' '}
            <code>input-1</code>, …
          </li>
          <li>Colors come from <code>uiConfig.handles.inputColors</code>.</li>
        </ul>
      </div>

      <HandleSettingsFields handles={handles} onChange={setHandles} />

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
  // and operators.not_exit. This predicate claims remaining schema/handle types.
  return (
    nodeType === 'control.delay' ||
    nodeType === 'filters.age' ||
    nodeType === 'filters.gender' ||
    nodeType === 'actions.sms' ||
    nodeType === 'data.transform' ||
    nodeType === 'data.router' ||
    nodeType === 'operators.exit'
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
