import React from 'react';
import type { EasyFlowNode, EasyFlowEdge } from '../../types/node';
import type { NodeEditorComponent } from '../../types/editor';
import { Palette } from '../Palette';
import { BaseNodeEditor } from '../BaseNodeEditor';
import type { CardDefinition } from '../../types/card';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './NodeEditorPanel.module.css';

export type PanelMode = 'palette' | 'node' | 'edge';

export interface NodeEditorPanelProps {
  mode: PanelMode;
  cards: CardDefinition[];
  selectedNode: EasyFlowNode | null;
  selectedEdge: EasyFlowEdge | null;
  onAddNode: (card: CardDefinition) => void;
  onUpdateNode: (node: EasyFlowNode) => void;
  onDeleteNode: () => void;
  onCancelEdit: () => void;
  onDeleteEdge: () => void;
  onSetMode: (mode: PanelMode) => void;
  customEditor?: NodeEditorComponent | null;
  variableSuggestions?: string[];
}

export function NodeEditorPanel({
  mode,
  cards,
  selectedNode,
  selectedEdge,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onCancelEdit,
  onDeleteEdge,
  onSetMode,
  customEditor,
  variableSuggestions = [],
}: NodeEditorPanelProps) {
  const { t } = useTranslation();

  if (mode === 'palette') {
    return (
      <div className={`${styles.panel} ${styles.panelPalette}`}>
        <Palette cards={cards} onAddNode={onAddNode} />
      </div>
    );
  }

  if (mode === 'node' && selectedNode) {
    const EditorComponent = customEditor || null;

    if (EditorComponent) {
      return (
        <div className={`${styles.panel} ${styles.panelEditor}`}>
          <EditorComponent
            node={selectedNode}
            onUpdate={onUpdateNode}
            onDelete={onDeleteNode}
            onCancel={onCancelEdit}
            variableSuggestions={variableSuggestions}
          />
        </div>
      );
    }

    return (
      <div className={`${styles.panel} ${styles.panelEditor}`}>
        <BaseNodeEditor
          node={selectedNode}
          onUpdate={onUpdateNode}
          onDelete={onDeleteNode}
          onCancel={onCancelEdit}
          variableSuggestions={variableSuggestions}
        />
      </div>
    );
  }

  if (mode === 'edge' && selectedEdge) {
    return (
      <div className={`${styles.panel} ${styles.panelEditor}`}>
        <div className={styles.edgeInfo}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--ef-border-color)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
              {t('edgeInfo.title', 'Edge info')}
            </h3>
          </div>
          <div className={styles.edgeInfoContent}>
            <div className={styles.edgeInfoRow}>
              <span className={styles.edgeLabel}>{t('edgeInfo.source', 'Source')}:</span>
              <span className={styles.edgeValue}>{selectedEdge.source}</span>
            </div>
            <div className={styles.edgeInfoRow}>
              <span className={styles.edgeLabel}>{t('edgeInfo.target', 'Target')}:</span>
              <span className={styles.edgeValue}>{selectedEdge.target}</span>
            </div>
            <div className={styles.edgeInfoRow}>
              <span className={styles.edgeLabel}>{t('edgeInfo.type', 'Type')}:</span>
              <span className={styles.edgeValue}>{selectedEdge.type || 'smoothstep'}</span>
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              className="ef-btn ef-btn-secondary"
              onClick={() => onSetMode('palette')}
            >
              {t('edgeInfo.close', 'Close')}
            </button>
            <div style={{ flex: 1 }} />
            <button
              className="ef-btn ef-btn-danger"
              onClick={onDeleteEdge}
            >
              {t('edgeInfo.delete', 'Delete edge')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
