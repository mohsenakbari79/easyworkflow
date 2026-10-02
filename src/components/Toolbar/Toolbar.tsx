/**
 * Standalone workflow toolbar.
 *
 * Renders workflow name/type inputs plus a set of optional action buttons
 * (Back, Sync, Reset, Save, Validate, Execute). Only callbacks that are
 * provided render their corresponding buttons.
 */

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './Toolbar.module.css';

/**
 * Props for {@link Toolbar}.
 */
export interface ToolbarProps {
  /** Current workflow display name (controlled input). */
  workflowName: string;
  /** Current workflow type/category (controlled select). */
  workflowType: string;
  /** Number of nodes shown in the title metadata. */
  nodeCount: number;
  /** Number of edges shown in the title metadata. */
  edgeCount: number;
  /** When true, the Save button shows "Saving..." and is disabled. */
  isSaving?: boolean;
  /** When true, the Execute button shows "Executing..." and is disabled. */
  isExecuting?: boolean;
  /** When true, the Sync button shows "Syncing..." and is disabled. */
  isSyncing?: boolean;
  /** Called when the user edits the workflow name. */
  onNameChange: (name: string) => void;
  /** Called when the user changes the workflow type. */
  onTypeChange: (type: string) => void;
  /** Optional Back button handler. */
  onBack?: () => void;
  /** Optional Sync/Update-cards button handler. */
  onSync?: () => void;
  /** Optional Reset button handler. */
  onReset?: () => void;
  /** Optional Save button handler. */
  onSave?: () => void;
  /** Optional Validate button handler. */
  onValidate?: () => void;
  /** Optional Execute button handler. */
  onExecute?: () => void;
}

/**
 * Workflow toolbar with name/type inputs and configurable action buttons.
 *
 * @example
 * ```tsx
 * <Toolbar
 *   workflowName="My flow"
 *   workflowType="general"
 *   nodeCount={3}
 *   edgeCount={2}
 *   onNameChange={setName}
 *   onTypeChange={setType}
 *   onSave={handleSave}
 * />
 * ```
 */
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
            {' '}
            ({nodeCount} {t('workflow.nodes', 'nodes')} • {edgeCount} {t('workflow.edges', 'edges')}
            )
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
