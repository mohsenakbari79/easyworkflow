import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { EasyFlowNode, EasyFlowNodeData, ParameterSchema } from '../../types/node';
import { pickLocalized } from '../../utils/localization';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './BaseNodeEditor.module.css';

export interface BaseNodeEditorProps {
  node: EasyFlowNode;
  onUpdate: (node: EasyFlowNode) => void;
  onDelete: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  variableSuggestions?: string[];
  parameterBuilder?: (draft: Record<string, unknown>, node: EasyFlowNode) => Record<string, unknown>;
}

export function BaseNodeEditor({
  node,
  onUpdate,
  onDelete,
  onCancel,
  children,
  variableSuggestions = [],
  parameterBuilder,
}: BaseNodeEditorProps) {
  const { t, locale } = useTranslation();

  const buildDraft = useCallback(() => {
    const data = node?.data;
    const labelMap = (data?.label_i18n as Record<string, string>) || {
      ...(data?.label_en ? { en: data.label_en } : {}),
      ...(data?.label_fa ? { fa: data.label_fa } : {}),
      ...(data?.label ? { default: data.label } : {}),
    };
    const descMap = (data?.description_i18n as Record<string, string>) || {
      ...(data?.description_en ? { en: data.description_en } : {}),
      ...(data?.description_fa ? { fa: data.description_fa } : {}),
      ...(data?.description ? { default: data.description } : {}),
    };
    return {
      label: pickLocalized(locale, labelMap, data?.label || ''),
      description: pickLocalized(locale, descMap, data?.description || ''),
      label_i18n: labelMap,
      description_i18n: descMap,
      ...(data?.parameters || {}),
    };
  }, [node, locale]);

  const [draft, setDraft] = useState<Record<string, unknown>>(buildDraft);

  useEffect(() => {
    setDraft(buildDraft());
  }, [buildDraft]);

  const schemaProperties = useMemo(() => {
    return node?.data?.parametersSchema?.properties || node?.data?.parameters_schema?.properties || {};
  }, [node?.data?.parametersSchema, node?.data?.parameters_schema]);

  const handleChange = useCallback((field: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!node) return;

    let parameters: Record<string, unknown> = {};
    const schemaKeys = Object.keys(schemaProperties);

    if (typeof parameterBuilder === 'function') {
      parameters = parameterBuilder(draft, node) || {};
    } else if (schemaKeys.length > 0) {
      schemaKeys.forEach((key) => {
        if (key in draft) {
          parameters[key] = draft[key];
        }
      });
    } else {
      Object.keys(draft).forEach((key) => {
        if (!['label', 'description', 'label_i18n', 'description_i18n'].includes(key)) {
          parameters[key] = draft[key];
        }
      });
    }

    const updatedNode: EasyFlowNode = {
      ...node,
      data: {
        ...node.data,
        label: (draft.label as string) || node.data.label,
        label_i18n: (draft.label_i18n as Record<string, string>) || node.data.label_i18n,
        description: (draft.description as string) || node.data.description,
        description_i18n: (draft.description_i18n as Record<string, string>) || node.data.description_i18n,
        parameters,
      },
    };

    onUpdate(updatedNode);
  }, [node, draft, schemaProperties, parameterBuilder, onUpdate]);

  const displayLabel = pickLocalized(
    locale,
    (draft.label_i18n as Record<string, string>) || {},
    draft.label as string
  );
  const displayDescription = pickLocalized(
    locale,
    (draft.description_i18n as Record<string, string>) || {},
    draft.description as string
  );

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('editor.title', 'Edit Node')}</h3>
        <span className={styles.hint}>{t('editor.nodeId', 'ID')}: {node?.id}</span>
      </div>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('editor.nodeName', 'Node name')}</label>
          <input
            className={styles.input}
            type="text"
            value={displayLabel}
            onChange={(e) => {
              const val = e.target.value;
              const map = (draft.label_i18n as Record<string, string>) || {};
              handleChange('label_i18n', { ...map, [locale]: val });
              handleChange('label', val);
            }}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>{t('editor.description', 'Description')}</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            rows={2}
            value={displayDescription}
            onChange={(e) => {
              const val = e.target.value;
              const map = (draft.description_i18n as Record<string, string>) || {};
              handleChange('description_i18n', { ...map, [locale]: val });
              handleChange('description', val);
            }}
          />
        </div>

        <div className={styles.divider} />

        {children}
      </div>

      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={onDelete}>
          {t('editor.delete', 'Delete node')}
        </button>
        <div className={styles.spacer} />
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCancel}>
          {t('editor.cancel', 'Cancel')}
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleConfirm}>
          {t('editor.confirm', 'Confirm')}
        </button>
      </div>
    </div>
  );
}
