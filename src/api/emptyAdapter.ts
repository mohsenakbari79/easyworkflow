import type { APIAdapter } from '../types/api';

/**
 * Empty adapter with no cards and no backend calls.
 *
 * Useful for render tests, Storybook stories, or as a default when no
 * adapter is provided. For real usage, supply your own adapter with a
 * working `getCards` (and ideally `saveWorkflow` / `loadWorkflow`).
 */
export const emptyAdapter: APIAdapter = {
  getCards: () => Promise.resolve([]),
  saveWorkflow: (wf) => Promise.resolve({ id: wf.id || 'new', ...wf }),
};

/**
 * @deprecated Use {@link emptyAdapter} instead. Kept as an alias for
 * backward compatibility with pre-0.1.2 consumers.
 */
export const noopAdapter = emptyAdapter;
