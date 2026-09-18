import { useReducer, useCallback, useMemo, useRef } from 'react';
import type { EasyFlowNode, EasyFlowEdge, EasyFlowNodeData, WorkflowMetadata, NodeStatus } from '../types/node';
import type { WorkflowState, WorkflowAction } from '../types/workflow';
import type { CardDefinition } from '../types/card';
import type { APIAdapter } from '../types/api';
import { generateNodeId } from '../utils/nodeId';
import { pickLocalized, extractLocalizedMap } from '../utils/localization';
import { normalizeCategoryKey } from '../utils/category';

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.nodes, isDirty: true };
    case 'SET_EDGES':
      return { ...state, edges: action.edges, isDirty: true };
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.node], isDirty: true };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map((n) => (n.id === action.node.id ? action.node : n)),
        isDirty: true,
      };
    case 'REMOVE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter((n) => n.id !== action.nodeId),
        edges: state.edges.filter((e) => e.source !== action.nodeId && e.target !== action.nodeId),
        isDirty: true,
      };
    case 'ADD_EDGE':
      return { ...state, edges: [...state.edges, action.edge], isDirty: true };
    case 'REMOVE_EDGE':
      return { ...state, edges: state.edges.filter((e) => e.id !== action.edgeId), isDirty: true };
    case 'SET_METADATA':
      return { ...state, metadata: { ...state.metadata, ...action.metadata }, isDirty: true };
    case 'SET_NODE_STATUS':
      return {
        ...state,
        nodeStatuses: { ...state.nodeStatuses, [action.nodeId]: action.status },
      };
    case 'SET_NODE_STATUSES':
      return { ...state, nodeStatuses: { ...state.nodeStatuses, ...action.statuses } };
    case 'RESET':
      return {
        nodes: [],
        edges: [],
        metadata: { name: '' },
        nodeStatuses: {},
        isDirty: false,
      };
    case 'LOAD':
      return {
        nodes: action.nodes,
        edges: action.edges,
        metadata: action.metadata,
        nodeStatuses: {},
        isDirty: false,
      };
    default:
      return state;
  }
}

const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  metadata: { name: '' },
  nodeStatuses: {},
  isDirty: false,
};

export interface UseWorkflowOptions {
  adapter?: APIAdapter;
  locale?: string;
}

/**
 * Build a locale map from a CardDefinition field, merging i18n map with legacy
 * `_fa` / `_en` suffixed fields and the base field.
 */
function buildCardLocaleMap(
  card: CardDefinition,
  i18nField: string | undefined,
  legacyFa: string | undefined,
  legacyEn: string | undefined,
  baseField: string | undefined
): Record<string, string> {
  if (i18nField && typeof i18nField === 'object') return i18nField;
  const map: Record<string, string> = {};
  if (legacyEn) map.en = legacyEn;
  if (legacyFa) map.fa = legacyFa;
  if (baseField) map.default = baseField;
  return map;
}

export function useWorkflow(options: UseWorkflowOptions = {}) {
  const { adapter, locale = 'en' } = options;
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const nodesRef = useRef(state.nodes);
  const edgesRef = useRef(state.edges);
  nodesRef.current = state.nodes;
  edgesRef.current = state.edges;

  const addNode = useCallback(
    (card: CardDefinition) => {
      const nodeId = generateNodeId();
      const categoryKey = normalizeCategoryKey(card.category);

      // Build locale maps from card (supports i18n maps and legacy _fa/_en fields)
      const labelMap = buildCardLocaleMap(
        card,
        card.display_name_i18n as unknown as string,
        card.display_name_fa,
        card.display_name_en,
        card.display_name
      ) || {};
      const descMap = buildCardLocaleMap(
        card,
        card.description_i18n as unknown as string,
        card.description_fa,
        card.description_en,
        card.description
      ) || {};

      const label = pickLocalized(locale, labelMap, card.card_key);
      const description = pickLocalized(locale, descMap, '');

      const newNode: EasyFlowNode = {
        id: nodeId,
        type: 'easyFlowNode',
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        },
        data: {
          label,
          label_i18n: Object.keys(labelMap).length > 0 ? labelMap : undefined,
          description,
          description_i18n: Object.keys(descMap).length > 0 ? descMap : undefined,
          // Legacy fields preserved only if present on card
          label_fa: card.display_name_fa,
          label_en: card.display_name_en,
          description_fa: card.description_fa,
          description_en: card.description_en,
          icon: card.icon || '📋',
          cardKey: card.card_key,
          category: card.category || 'other',
          categoryKey,
          nodeType: card.node_type,
          uiConfig: card.ui_config || {},
          parametersSchema: card.parameters_schema || card.parametersSchema || {},
          parameters: {},
        },
      };

      dispatch({ type: 'ADD_NODE', node: newNode });
      return nodeId;
    },
    [locale]
  );

  const updateNode = useCallback((node: EasyFlowNode) => {
    dispatch({ type: 'UPDATE_NODE', node });
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    dispatch({ type: 'REMOVE_NODE', nodeId });
  }, []);

  const setNodes = useCallback((nodes: EasyFlowNode[] | ((prev: EasyFlowNode[]) => EasyFlowNode[])) => {
    const next = typeof nodes === 'function' ? nodes(nodesRef.current) : nodes;
    dispatch({ type: 'SET_NODES', nodes: next });
  }, []);

  const setEdges = useCallback((edges: EasyFlowEdge[] | ((prev: EasyFlowEdge[]) => EasyFlowEdge[])) => {
    const next = typeof edges === 'function' ? edges(edgesRef.current) : edges;
    dispatch({ type: 'SET_EDGES', edges: next });
  }, []);

  const setMetadata = useCallback((metadata: Partial<WorkflowMetadata>) => {
    dispatch({ type: 'SET_METADATA', metadata });
  }, []);

  const setNodeStatus = useCallback((nodeId: string, status: NodeStatus) => {
    dispatch({ type: 'SET_NODE_STATUS', nodeId, status });
  }, []);

  const setNodeStatuses = useCallback((statuses: Record<string, NodeStatus>) => {
    dispatch({ type: 'SET_NODE_STATUSES', statuses });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const load = useCallback(
    (nodes: EasyFlowNode[], edges: EasyFlowEdge[], metadata: WorkflowMetadata) => {
      dispatch({ type: 'LOAD', nodes, edges, metadata });
    },
    []
  );

  const selectedNode = useMemo(() => state.nodes.find((n) => n.id === state.metadata.selectedNodeId) || null, [state]);

  const variableSuggestions = useMemo(() => {
    const triggerNode = state.nodes.find((n) =>
      (n?.data?.nodeType || '').toLowerCase().startsWith('trigger')
    );
    const outputSchema = triggerNode?.data?.uiConfig?.output_schema;
    if (!outputSchema || typeof outputSchema !== 'object') return [];
    const flattenPaths = (obj: Record<string, unknown>, prefix = ''): string[] => {
      if (!obj || typeof obj !== 'object') return [];
      return Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return [path, ...flattenPaths(value as Record<string, unknown>, path)];
        }
        return [path];
      });
    };
    const paths = flattenPaths(outputSchema as Record<string, unknown>);
    const tokens = paths.flatMap((path) => [
      `{{ payload.${path} }}`,
      `{{ trigger.payload.${path} }}`,
    ]);
    return Array.from(new Set(tokens));
  }, [state.nodes]);

  return {
    state,
    addNode,
    updateNode,
    removeNode,
    setNodes,
    setEdges,
    setMetadata,
    setNodeStatus,
    setNodeStatuses,
    reset,
    load,
    selectedNode,
    variableSuggestions,
    dispatch,
  };
}
