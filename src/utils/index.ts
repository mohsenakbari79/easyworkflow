/**
 * Pure utility helpers for easyworkflow.
 * Safe to use outside React components.
 */

export { generateNodeId, generateEdgeId } from './nodeId';
export { buildCategoryTree, normalizeCategoryKey, humanizeCategoryLabel } from './category';
export { pickLocalized, extractLocalizedMap, localizeNodeData } from './localization';
export {
  resolveNodeHandles,
  inferHandleConfig,
  distributeHandlePercents,
  findHandle,
  getHandleColor,
  DEFAULT_INPUT_COLOR,
  DEFAULT_OUTPUT_COLOR,
  CONDITION_YES_COLOR,
  CONDITION_NO_COLOR,
} from './handles';
