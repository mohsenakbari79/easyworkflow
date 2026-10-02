/**
 * Unit tests for node editor and shape registries.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { nodeEditorRegistry, nodeShapeRegistry } from '../registry';
import type { NodeEditorComponent } from '../types';

const DummyEditor: NodeEditorComponent = () => null;
const OtherEditor: NodeEditorComponent = () => null;
const DummyShape = () => null;

describe('nodeEditorRegistry', () => {
  beforeEach(() => {
    nodeEditorRegistry.clear();
  });

  it('registers and resolves by exact node type', () => {
    nodeEditorRegistry.register('exact', 'filter.age', DummyEditor);
    expect(nodeEditorRegistry.resolve('filter.age')).toBe(DummyEditor);
  });

  it('registers and resolves by predicate', () => {
    nodeEditorRegistry.register('prefix', (t) => t.startsWith('action.'), OtherEditor);
    expect(nodeEditorRegistry.resolve('action.email')).toBe(OtherEditor);
    expect(nodeEditorRegistry.resolve('filter.age')).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(nodeEditorRegistry.resolve('unknown.type')).toBeNull();
  });

  it('unregisters by key', () => {
    nodeEditorRegistry.register('k1', 'a.b', DummyEditor);
    nodeEditorRegistry.unregister('k1');
    expect(nodeEditorRegistry.resolve('a.b')).toBeNull();
  });

  it('clear removes all entries', () => {
    nodeEditorRegistry.register('k1', 'a.b', DummyEditor);
    nodeEditorRegistry.register('k2', 'c.d', OtherEditor);
    expect(nodeEditorRegistry.getAll()).toHaveLength(2);
    nodeEditorRegistry.clear();
    expect(nodeEditorRegistry.getAll()).toHaveLength(0);
  });
});

describe('nodeShapeRegistry', () => {
  beforeEach(() => {
    nodeShapeRegistry.clear();
  });

  it('registers and resolves shape components', () => {
    nodeShapeRegistry.register('star', DummyShape);
    expect(nodeShapeRegistry.resolve('star')).toBe(DummyShape);
    expect(nodeShapeRegistry.resolve('missing')).toBeNull();
  });

  it('unregister removes a shape', () => {
    nodeShapeRegistry.register('star', DummyShape);
    nodeShapeRegistry.unregister('star');
    expect(nodeShapeRegistry.resolve('star')).toBeNull();
  });

  it('getAll returns registered entries', () => {
    nodeShapeRegistry.register('star', DummyShape);
    const all = nodeShapeRegistry.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].shape).toBe('star');
    expect(all[0].component).toBe(DummyShape);
  });
});
