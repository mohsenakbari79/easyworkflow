export type { APIAdapter, Workflow, WorkflowPayload, ValidationResult, WorkflowStatus } from '../types/api';
/** Empty adapter with no cards and no backend calls. */
export { emptyAdapter } from './emptyAdapter';
/** @deprecated Use `emptyAdapter` instead. */
export { noopAdapter } from './emptyAdapter';
