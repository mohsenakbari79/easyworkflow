let counter = 0;

/**
 * Generate a unique node identifier.
 * Uses `crypto.randomUUID()` when available, falls back to timestamp + counter.
 */
export function generateNodeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ef-node-${crypto.randomUUID()}`;
  }
  return `ef-node-${Date.now()}-${++counter}`;
}

/**
 * Generate a unique edge identifier.
 * Uses `crypto.randomUUID()` when available, falls back to timestamp + counter.
 */
export function generateEdgeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ef-edge-${crypto.randomUUID()}`;
  }
  return `ef-edge-${Date.now()}-${++counter}`;
}
