import React, { useCallback, useMemo, useState } from 'react';
import {
  EasyFlowI18nProvider,
  WorkflowEditor,
  en,
  fa,
  isRTLLocale,
} from '../../../src';
import type { EasyFlowNode } from '../../../src';
// EasyFlowEdge is also a component value on the barrel; import the type from types.
import type { EasyFlowEdge } from '../../../src/types';
import { demoAdapter } from './adapter';
import { registerDemoNodeEditors } from './nodeEditors';
import './styles.css';

registerDemoNodeEditors();

type DemoWorkflowSnapshot = {
  id?: string;
  name: string;
  type: string;
  nodes: EasyFlowNode[];
  edges: EasyFlowEdge[];
};

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Live demo app aligned with the README docs preview:
 * editor chrome, sample workflow, palette categories, and i18n toggle.
 */
export function App() {
  const [locale, setLocale] = useState<'en' | 'fa'>('en');
  const [editorKey, setEditorKey] = useState(0);
  const [workflowId, setWorkflowId] = useState<string | undefined>('sample');
  const [lastWorkflow, setLastWorkflow] = useState<DemoWorkflowSnapshot | null>(
    null
  );

  const isRTL = isRTLLocale(locale);

  /** Docs preview uses “Workflow Editor” as the panel title. */
  const dictionaries = useMemo(
    () => ({
      en: {
        ...en,
        workflow: {
          ...en.workflow,
          titleEdit: 'Workflow Editor',
          titleCreate: 'Workflow Editor',
        },
        palette: {
          ...en.palette,
          title: 'Add Card',
        },
      },
      fa: {
        ...fa,
        workflow: {
          ...fa.workflow,
          titleEdit: 'ویرایش ورک‌فلو',
        },
      },
    }),
    []
  );

  const handleSave = useCallback((workflow: DemoWorkflowSnapshot) => {
    setLastWorkflow(workflow);
  }, []);

  const handleLoadSample = useCallback(() => {
    setWorkflowId('sample');
    setEditorKey((k) => k + 1);
  }, []);

  const handleValidate = useCallback((id: string) => {
    void demoAdapter.validateWorkflow?.(id).then((result) => {
      if (result.is_valid) {
        alert('Workflow is valid');
      } else {
        alert(result.warnings?.join('\n') || 'Validation failed');
      }
    });
  }, []);

  const handleExecute = useCallback((id: string) => {
    void demoAdapter.executeWorkflow?.(id).then(() => {
      alert('Execution finished (see console for id)');
    });
  }, []);

  return (
    <div className={`demo-shell${isRTL ? ' demo-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="demo-topbar">
        <h1>easyworkflow Live Demo</h1>
        <p className="demo-locale-note">
          locale: <strong>{locale}</strong>
          {isRTL ? ' · RTL' : ' · LTR'}
        </p>
        <div className="demo-spacer" />
        <label>
          Language
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value === 'fa' ? 'fa' : 'en')}
            aria-label="Language"
          >
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </select>
        </label>
        <button type="button" onClick={handleLoadSample}>
          Load sample
        </button>
        <button
          type="button"
          onClick={() => {
            const payload =
              lastWorkflow ??
              (() => {
                try {
                  const raw = window.localStorage.getItem('easyflow:lastWorkflow');
                  return raw ? (JSON.parse(raw) as DemoWorkflowSnapshot) : null;
                } catch {
                  return null;
                }
              })();
            if (!payload) {
              alert('Nothing to export yet. Save the workflow first.');
              return;
            }
            downloadJson(payload, 'easyworkflow-demo.json');
          }}
        >
          Export JSON
        </button>
      </header>

      <div className="demo-editor">
        <EasyFlowI18nProvider
          key={locale}
          locale={locale}
          translationsByLocale={dictionaries}
        >
          {/* Default toolbar: Sync (adapter), Reset, Save, Validate, Execute — matches docs preview. */}
          <WorkflowEditor
            key={editorKey}
            adapter={demoAdapter}
            workflowId={workflowId}
            onSave={handleSave}
            onValidate={handleValidate}
            onExecute={handleExecute}
          />
        </EasyFlowI18nProvider>
      </div>
    </div>
  );
}

export default App;
