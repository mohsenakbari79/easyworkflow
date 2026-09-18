import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './Toolbar.module.css';

export interface ToolbarProps {
  workflowName: string;
  workflowType: string;
  nodeCount: number;
  edgeCount: number;
  isSaving?: boolean;
  isExecuting?: boolean;
  isSyncing?: boolean;
  onNameChange: (name: string) => void;
  onTypeChange: (type: string) => void;
  onBack?: () => void;
  onSync?: () => void;
  onReset?: () => void;
  onSave?: () => void;
  onValidate?: () => void;
  onExecute?: () => void;
}

export function Toolbar({
  workflowName,
  workflowType,
  nodeCount,
  edgeCount,
  isSaving,
  isExecuting,
  isSyncing,
  onNameChange,
  onTypeChange,
  onBack,
  onSync,
  onReset,
  onSave,
  onValidate,
  onExecute,
}: ToolbarProps) {
  const { t, isRTL } = useTranslation();

  return (
    <div className={`ef-root ${styles.toolbar}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>
          {t('workflow.titleEdit', 'Edit Workflow')}
          <span className={styles.metaText}>
            {' '}({nodeCount} {t('workflow.nodes', 'nodes')} • {edgeCount} {t('workflow.edges', 'edges')})
          </span>
        </h1>
        <div className={styles.subtitle}>
          <input
            type="text"
            className={styles.titleInput}
            placeholder={t('workflow.untitled', 'Untitled Workflow')}
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
          />
          <select
            className={styles.typeSelect}
            value={workflowType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="general">General</option>
            <option value="campaign">Campaign</option>
            <option value="automation">Automation</option>
            <option value="event-listener">Event Listener</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        {onBack && (
          <button className="ef-btn ef-btn-secondary" onClick={onBack}>
            ← {t('buttons.back', 'Back')}
          </button>
        )}
        {onSync && (
          <button className="ef-btn ef-btn-warning" onClick={onSync} disabled={isSyncing}>
            {isSyncing ? t('buttons.syncing', 'Syncing...') : t('buttons.sync', 'Update cards')}
          </button>
        )}
        {onReset && (
          <button className="ef-btn ef-btn-secondary" onClick={onReset}>
            {t('buttons.reset', 'Reset')}
          </button>
        )}
        {onSave && (
          <button className="ef-btn ef-btn-primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? t('buttons.saving', 'Saving...') : t('buttons.save', 'Save')}
          </button>
        )}
        {onValidate && (
          <button className="ef-btn ef-btn-info" onClick={onValidate}>
            {t('buttons.validate', 'Validate')}
          </button>
        )}
        {onExecute && (
          <button className="ef-btn ef-btn-success" onClick={onExecute} disabled={isExecuting}>
            {isExecuting ? t('buttons.executing', 'Executing...') : t('buttons.execute', 'Execute')}
          </button>
        )}
      </div>
    </div>
  );
}
