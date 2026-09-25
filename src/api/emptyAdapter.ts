import type { APIAdapter } from '../types/api';

/**
 * Empty adapter with no cards and no backend calls.
 * Use for render tests or as a default when no adapter is provided.
 * For real usage, supply your own adapter with a working `getCards`.
 */
export const emptyAdapter: APIAdapter = {
  getCards: () => Promise.resolve([]),
  saveWorkflow: (wf) => Promise.resolve({ id: wf.id || 'new', ...wf }),
};

/** @deprecated Use `emptyAdapter` instead. */
export const noopAdapter = emptyAdapter;
