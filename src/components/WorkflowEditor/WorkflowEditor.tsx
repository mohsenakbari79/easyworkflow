import React, { useCallback, useEffect, useMemo, useState, useRef, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import { ReactFlowProvider, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import type { EasyFlowNode, EasyFlowEdge, WorkflowMetadata } from '../../types/node';
import type { CardDefinition } from '../../types/card';
import type { APIAdapter } from '../../types/api';
import type { NodeEditorComponent } from '../../types/editor';
import { nodeEditorRegistry } from '../../registry/NodeEditorRegistry';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useTranslation } from '../../hooks/useTranslation';
import { generateNodeId } from '../../utils/nodeId';
import { pickLocalized } from '../../utils/localization';
import { Canvas } from '../Canvas';
import { NodeEditorPanel, type PanelMode } from '../NodeEditorPanel';
import styles from './WorkflowEditor.module.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[EasyFlow ErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, background: '#fee', border: '2px solid #fcc', borderRadius: 8, margin: 20, fontFamily: 'monospace' }}>
          <h3 style={{ color: '#c00' }}>EasyFlow Error</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface ToolbarAction {
  key: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

/**
 * A fully customizable toolbar action.
 * When `actions` is provided on the editor, these replace all default buttons.
 */
export interface WorkflowActionItem {
  /** Unique key for React reconciliation. */
  key: string;
  /** Button label (already localized by the caller). */
  label: string;
  /** Optional emoji or short text shown before the label. */
  icon?: string;
  /** Visual style. Default: 'secondary'. */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  /**
   * Click handler. Receives the current workflow context so the caller
   * can read/write nodes, edges, name, type, and the adapter.
   */
  onClick: (ctx: {
    workflowId?: string;
    name: string;
    type: string;
    nodes: EasyFlowNode[];
    edges: EasyFlowEdge[];
    adapter?: APIAdapter;
  }) => void | Promise<void>;
  /** Optional disable flag. */
  disabled?: boolean;
  /** Optional visibility flag (default: true). Set to false to hide. */
  visible?: boolean;
}

export interface WorkflowEditorProps {
  workflowId?: string;
  adapter?: APIAdapter;
  initialCards?: CardDefinition[];
  locale?: string;
  customEditors?: { match: string | ((nodeType: string) => boolean); component: NodeEditorComponent; key: string }[];
  /**
   * Define the toolbar actions. If omitted, only a default Save button renders.
   * When provided, renders exactly these actions — no built-in buttons are injected.
   */
  actions?: WorkflowActionItem[];
  /** @deprecated Prefer `actions`. Legacy extra buttons appended after `actions`. */
  toolbarActions?: ToolbarAction[];
  onSave?: (workflow: { id?: string; name: string; type: string; nodes: EasyFlowNode[]; edges: EasyFlowEdge[] }) => void;
  onExecute?: (workflowId: string) => void;
  onValidate?: (workflowId: string) => void;
  onBack?: () => void;
  showToast?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

function WorkflowEditorInner({
  workflowId,
  adapter,
  initialCards = [],
  customEditors = [],
  actions,
  toolbarActions = [],
  onSave,
  onExecute,
  onValidate,
  onBack,
  showToast,
}: WorkflowEditorProps) {
  const { t, locale, isRTL } = useTranslation();
  const isEditMode = !!workflowId && workflowId !== 'new';

  const {
    updateNode,
    removeNode,
    setMetadata,
    reset,
    variableSuggestions,
  } = useWorkflow({ adapter, locale });

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [availableCards, setAvailableCards] = useState<CardDefinition[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowType, setWorkflowType] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('palette');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [nodeStatuses] = useState<Record<string, string>>({});

  const [clipboard, setClipboard] = useState<EasyFlowNode | null>(null);
  const selectedNodeIdRef = useRef(selectedNodeId);
  selectedNodeIdRef.current = selectedNodeId;
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  useEffect(() => {
    customEditors.forEach(({ key, match, component }) => {
      nodeEditorRegistry.register(key, match, component);
    });
    return () => {
      customEditors.forEach(({ key }) => {
        nodeEditorRegistry.unregister(key);
      });
    };
  }, [customEditors]);

  useEffect(() => {
    if (adapter?.getCards) {
      adapter.getCards().then(setAvailableCards).catch(() => setAvailableCards([]));
    } else {
      setAvailableCards(initialCards);
    }
  }, [adapter, initialCards]);

  useEffect(() => {
    if (isEditMode && workflowId && adapter?.loadWorkflow) {
      setIsLoading(true);
      adapter
        .loadWorkflow(workflowId)
        .then((wf) => {
          setNodes(wf.nodes as Node[]);
          setEdges(wf.edges as Edge[]);
          setWorkflowName(wf.name || '');
          setWorkflowType(wf.type || 'general');
          setMetadata({ id: wf.id, name: wf.name, type: wf.type });
        })
        .catch(() => {
          showToast?.('error', t('toasts.workflowLoadError', 'Failed to load workflow'));
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, workflowId, adapter, setMetadata, showToast, t]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => {
        const data = node.data as Record<string, unknown>;
        const labelMap = (data.label_i18n as Record<string, string>) || {
          ...(data.label_en ? { en: data.label_en as string } : {}),
          ...(data.label_fa ? { fa: data.label_fa as string } : {}),
          ...(data.label ? { default: data.label as string } : {}),
        };
        const descMap = (data.description_i18n as Record<string, string>) || {
          ...(data.description_en ? { en: data.description_en as string } : {}),
          ...(data.description_fa ? { fa: data.description_fa as string } : {}),
          ...(data.description ? { default: data.description as string } : {}),
        };
        const newLabel = pickLocalized(locale, labelMap, data.label as string);
        const newDesc = pickLocalized(locale, descMap, data.description as string);
        if (newLabel === data.label && newDesc === data.description) return node;
        return { ...node, data: { ...data, label: newLabel, description: newDesc } };
      })
    );
  }, [locale]);

  const selectedNode = useMemo(() => {
    const base = nodes.find((n) => n.id === selectedNodeId) || null;
    if (!base) return null;
    const data = base.data as Record<string, unknown>;
    const nodeType = (data.nodeType as string) || '';
    const isBinaryOp = nodeType.startsWith('operator.exit') || nodeType.startsWith('operator.not_exit');
    if (!isBinaryOp) return base;
    const incoming = edges.filter((e) => e.target === base.id);
    let parent1: string | null = null;
    let parent2: string | null = null;
    incoming.forEach((edge) => {
      const srcNode = nodes.find((n) => n.id === edge.source);
      const label = (srcNode?.data as Record<string, unknown>)?.label as string || edge.source;
      if (edge.targetHandle === 'second-input') {
        parent2 = label;
      } else if (!parent1) {
        parent1 = label;
      }
    });
    if (!parent1 && parent2) { parent1 = parent2; parent2 = null; }
    return { ...base, data: { ...data, parents: [parent1, parent2].filter(Boolean) } };
  }, [nodes, edges, selectedNodeId]);

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  );

  const handleAddNode = useCallback(
    (card: CardDefinition) => {
      const nodeId = generateNodeId();

      const labelMap: Record<string, string> = {
        ...(card.display_name_i18n || {}),
        ...(card.display_name_en ? { en: card.display_name_en } : {}),
        ...(card.display_name_fa ? { fa: card.display_name_fa } : {}),
        ...(card.display_name ? { default: card.display_name } : {}),
      };
      const descMap: Record<string, string> = {
        ...(card.description_i18n || {}),
        ...(card.description_en ? { en: card.description_en } : {}),
        ...(card.description_fa ? { fa: card.description_fa } : {}),
        ...(card.description ? { default: card.description } : {}),
      };
      const label = pickLocalized(locale, labelMap, card.card_key);
      const description = pickLocalized(locale, descMap, '');

      const newNode: Node = {
        id: nodeId,
        type: 'easyFlowNode',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          label,
          label_i18n: Object.keys(labelMap).length > 0 ? labelMap : undefined,
          description,
          description_i18n: Object.keys(descMap).length > 0 ? descMap : undefined,
          label_fa: card.display_name_fa,
          label_en: card.display_name_en,
          description_fa: card.description_fa,
          description_en: card.description_en,
          icon: card.icon || '📋',
          cardKey: card.card_key,
          category: card.category || 'other',
          categoryKey: card.category || 'other',
          nodeType: card.node_type,
          uiConfig: card.ui_config || {},
          parametersSchema: card.parameters_schema || card.parametersSchema || {},
          parameters: {},
        },
      };

      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(nodeId);
      setPanelMode('node');
    },
    [locale]
  );

  const handleUpdateNode = useCallback(
    (updatedNode: EasyFlowNode) => {
      updateNode(updatedNode);
      setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? (updatedNode as Node) : n)));
      setSelectedNodeId(null);
      setPanelMode('palette');
      showToast?.('success', t('toasts.nodeUpdated', 'Node updated'));
    },
    [updateNode, showToast, t]
  );

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;
    removeNode(selectedNodeId);
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
    setPanelMode('palette');
    showToast?.('info', t('toasts.nodeDeleted', 'Node deleted'));
  }, [selectedNodeId, removeNode, showToast, t]);

  const handleCancelEdit = useCallback(() => {
    setSelectedNodeId(null);
    setPanelMode('palette');
  }, []);

  const handleCopyNode = useCallback(() => {
    const nodeId = selectedNodeIdRef.current;
    if (!nodeId) return;
    setNodes((prev) => {
      const node = prev.find((n) => n.id === nodeId);
      if (node) setClipboard({ ...node, data: { ...node.data } } as EasyFlowNode);
      return prev;
    });
    showToast?.('info', 'Node copied');
  }, [showToast]);

  const handlePasteNode = useCallback(() => {
    if (!clipboard) return;
    const newId = generateNodeId();
    const newNode: Node = {
      ...clipboard,
      id: newId,
      position: { x: clipboard.position.x + 40, y: clipboard.position.y + 40 },
      data: { ...clipboard.data, label: `${clipboard.data.label} (copy)` },
    } as Node;
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
    setPanelMode('node');
    showToast?.('success', 'Node pasted');
  }, [clipboard, showToast]);

  const handleDuplicateNode = useCallback(() => {
    const nodeId = selectedNodeIdRef.current;
    if (!nodeId) return;
    setNodes((prev) => {
      const node = prev.find((n) => n.id === nodeId);
      if (!node) return prev;
      const newId = generateNodeId();
      const duplicate: Node = {
        ...node,
        id: newId,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        data: { ...node.data, label: `${(node.data as Record<string, unknown>).label} (copy)` },
      };
      setSelectedNodeId(newId);
      setPanelMode('node');
      return [...prev, duplicate];
    });
    showToast?.('success', 'Node duplicated');
  }, [showToast]);

  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    setPanelMode('palette');
    showToast?.('info', t('toasts.edgeDeleted', 'Edge deleted'));
  }, [selectedEdgeId, showToast, t]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge({ ...connection, type: 'smoothstep', animated: true, style: { stroke: 'var(--ef-primary, #2563eb)' } }, eds)
      );
    },
    []
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setPanelMode('node');
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setPanelMode('edge');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setPanelMode('palette');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); handleCopyNode(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); handlePasteNode(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); handleDuplicateNode(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIdRef.current) { e.preventDefault(); handleDeleteNode(); }
      }
      if (e.key === 'Escape') { setSelectedNodeId(null); setSelectedEdgeId(null); setPanelMode('palette'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopyNode, handlePasteNode, handleDuplicateNode, handleDeleteNode]);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      onSave({
        id: workflowId,
        name: workflowName || t('workflow.untitled', 'Untitled Workflow'),
        type: workflowType,
        nodes: nodesRef.current as EasyFlowNode[],
        edges: edgesRef.current as EasyFlowEdge[],
      });
      showToast?.('success', t('toasts.saveSuccess', 'Workflow saved'));
    } finally {
      setIsSaving(false);
    }
  }, [onSave, workflowId, workflowName, workflowType, showToast, t]);

  const handleSync = useCallback(async () => {
    if (!adapter?.syncCards) return;
    setIsSyncing(true);
    try {
      await adapter.syncCards();
      const cards = await adapter.getCards?.() || [];
      setAvailableCards(cards);
      showToast?.('success', t('toasts.syncSuccess', 'Sync completed'));
    } catch {
      showToast?.('error', t('toasts.syncError', 'Failed to sync cards'));
    } finally {
      setIsSyncing(false);
    }
  }, [adapter, showToast, t]);

  const handleReset = useCallback(() => {
    if (nodes.length > 0 && !window.confirm(t('buttons.confirmReset', 'Are you sure you want to reset everything?'))) return;
    setNodes([]);
    setEdges([]);
    reset();
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setPanelMode('palette');
    showToast?.('info', t('toasts.reset', 'Workflow reset'));
  }, [nodes.length, reset, showToast, t]);

  const handleValidate = useCallback(() => {
    if (onValidate && workflowId) onValidate(workflowId);
  }, [onValidate, workflowId]);

  const handleExecute = useCallback(() => {
    if (onExecute && workflowId) { setIsExecuting(true); onExecute(workflowId); }
  }, [onExecute, workflowId]);

  const resolvedEditor = useMemo(() => {
    if (!selectedNode) return null;
    const nodeType = (selectedNode.data as Record<string, unknown>)?.nodeType as string;
    return nodeEditorRegistry.resolve(nodeType);
  }, [selectedNode]);

  // Build the effective actions list
  const effectiveActions: WorkflowActionItem[] = useMemo(() => {
    if (actions && actions.length > 0) return actions;
    // Default: only Save, using the built-in handler
    return [
      {
        key: 'save',
        label: isSaving
          ? t('buttons.saving', 'Saving...')
          : t('buttons.save', 'Save'),
        icon: '💾',
        variant: 'primary',
        onClick: async () => { await handleSave(); },
        disabled: isSaving,
      },
    ];
  }, [actions, isSaving, t, handleSave]);

  if (isLoading) {
    return (
    <div className={`ef-root ${styles.container}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>{t('workflow.loading', 'Loading workflow...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ef-root ${styles.container}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className={styles.header}>
        <div className={styles.headerTexts}>
          <h1 className={styles.title}>
            {t('workflow.titleEdit', 'Edit Workflow')}
            <span className={styles.metaText}>
              ({nodes.length} {t('workflow.nodes', 'nodes')} • {edges.length} {t('workflow.edges', 'edges')})
            </span>
          </h1>
          <div className={styles.subtitle}>
            <input type="text" className={styles.titleInput} placeholder={t('workflow.untitled', 'Untitled Workflow')} value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
            <select className={styles.typeSelect} value={workflowType} onChange={(e) => setWorkflowType(e.target.value)}>
              <option value="general">General</option>
              <option value="campaign">Campaign</option>
              <option value="automation">Automation</option>
              <option value="event-listener">Event Listener</option>
            </select>
          </div>
        </div>
        <div className={styles.headerActions}>
          {effectiveActions
            .filter((a) => a.visible !== false)
            .map((a) => (
              <button
                key={a.key}
                className={`ef-btn ef-btn-${a.variant || 'secondary'}`}
                disabled={a.disabled}
                onClick={() =>
                  a.onClick({
                    workflowId,
                    name: workflowName || t('workflow.untitled', 'Untitled Workflow'),
                    type: workflowType,
                    nodes: nodesRef.current as EasyFlowNode[],
                    edges: edgesRef.current as EasyFlowEdge[],
                    adapter,
                  })
                }
              >
                {a.icon && `${a.icon} `}
                {a.label}
              </button>
            ))}

          {toolbarActions.filter((a) => !a.hidden).map((action) => (
            <button key={action.key} className={`ef-btn ef-btn-${action.variant || 'secondary'}`} onClick={action.onClick} disabled={action.disabled}>
              {action.icon && `${action.icon} `}{action.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.editor}>
        <section className={styles.canvas}>
          <Canvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} onPaneClick={onPaneClick} nodeStatuses={nodeStatuses} />
        </section>
        <aside className={`${styles.panel} ${panelMode === 'palette' ? styles.panelPalette : styles.panelEditor}`}>
          <NodeEditorPanel mode={panelMode} cards={availableCards} selectedNode={selectedNode as unknown as EasyFlowNode | null} selectedEdge={selectedEdge as unknown as EasyFlowEdge | null} onAddNode={handleAddNode} onUpdateNode={handleUpdateNode} onDeleteNode={handleDeleteNode} onCancelEdit={handleCancelEdit} onDeleteEdge={handleDeleteEdge} onSetMode={setPanelMode} customEditor={resolvedEditor} variableSuggestions={variableSuggestions} />
        </aside>
      </div>
    </div>
  );
}

export function WorkflowEditor(props: WorkflowEditorProps) {
  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <WorkflowEditorInner {...props} />
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}
