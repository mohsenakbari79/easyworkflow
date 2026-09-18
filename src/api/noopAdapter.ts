import type { APIAdapter } from '../types/api';

/** No-op adapter for demos and testing. All methods return safe defaults. */
export const noopAdapter: APIAdapter = {
  async getCards() {
    return [];
  },
  async syncCards() {
    return { created: 0, updated: 0, total: 0 };
  },
  async loadWorkflow() {
    return { id: '', name: '', nodes: [], edges: [] };
  },
  async saveWorkflow(wf) {
    return { id: wf.id || 'new', ...wf, nodes: wf.nodes, edges: wf.edges };
  },
  async validateWorkflow() {
    return { is_valid: true, errors: [], warnings: [] };
  },
  async executeWorkflow() {},
  async getWorkflowStatus() {
    return { status: 'completed' };
  },
};
