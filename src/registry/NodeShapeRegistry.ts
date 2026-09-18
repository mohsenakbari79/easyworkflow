import type { NodeShapeComponent, ShapeRegistryEntry } from '../types/editor';

/**
 * Registry for custom node shape components. Allows consumers to register
 * visual shape renderers for different node types.
 */
class NodeShapeRegistryClass {
  private entries: Map<string, NodeShapeComponent> = new Map();

  /**
   * Register a custom shape component.
   * @param shape - Shape identifier (e.g. 'star', 'hexagon').
   * @param component - React component to render the shape.
   */
  register(shape: string, component: NodeShapeComponent) {
    this.entries.set(shape, component);
  }

  /** Remove a previously registered shape by key. */
  unregister(shape: string) {
    this.entries.delete(shape);
  }

  /**
   * Resolve the shape component for a given shape name.
   * @returns The matching component, or null if none registered.
   */
  resolve(shape: string): NodeShapeComponent | null {
    return this.entries.get(shape) || null;
  }

  /** Return all registered shape entries. */
  getAll(): ShapeRegistryEntry[] {
    return Array.from(this.entries.entries()).map(([shape, component]) => ({
      shape,
      component,
    }));
  }

  /** Remove all registrations. */
  clear() {
    this.entries.clear();
  }
}

/** Singleton registry instance for node shapes. */
export const nodeShapeRegistry = new NodeShapeRegistryClass();
