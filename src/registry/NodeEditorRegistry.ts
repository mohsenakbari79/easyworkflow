import type { NodeEditorComponent, EditorRegistryEntry } from '../types/editor';

/**
 * Registry for custom node editors. Allows consumers to register
 * editor components that render when a specific node type is selected.
 */
class NodeEditorRegistryClass {
  private entries: EditorRegistryEntry[] = [];

  /**
   * Register a custom editor for a node type.
   * @param key - Unique identifier for this registration.
   * @param match - Node type string or predicate function.
   * @param component - React component to render as the editor.
   */
  register(key: string, match: string | ((nodeType: string) => boolean), component: NodeEditorComponent) {
    this.entries.push({ match, component, key });
  }

  /** Remove a previously registered editor by key. */
  unregister(key: string) {
    this.entries = this.entries.filter((e) => e.key !== key);
  }

  /**
   * Resolve the editor component for a given node type.
   * @returns The matching component, or null if none registered.
   */
  resolve(nodeType: string): NodeEditorComponent | null {
    for (const entry of this.entries) {
      if (typeof entry.match === 'function') {
        if (entry.match(nodeType)) return entry.component;
      } else {
        if (entry.match === nodeType) return entry.component;
      }
    }
    return null;
  }

  /** Return all registered entries. */
  getAll(): EditorRegistryEntry[] {
    return [...this.entries];
  }

  /** Remove all registrations. */
  clear() {
    this.entries = [];
  }
}

/** Singleton registry instance for node editors. */
export const nodeEditorRegistry = new NodeEditorRegistryClass();
