/**
 * Unit tests for pure utility helpers.
 */

import { describe, expect, it } from 'vitest';
import {
  generateNodeId,
  generateEdgeId,
  normalizeCategoryKey,
  humanizeCategoryLabel,
  buildCategoryTree,
  pickLocalized,
  extractLocalizedMap,
  localizeNodeData,
  isRTLLocale,
} from '../index';
import type { CardDefinition } from '../types';

describe('generateNodeId / generateEdgeId', () => {
  it('generates unique node ids with the ef-node prefix', () => {
    const a = generateNodeId();
    const b = generateNodeId();
    expect(a).toMatch(/^ef-node-/);
    expect(b).toMatch(/^ef-node-/);
    expect(a).not.toBe(b);
  });

  it('generates unique edge ids with the ef-edge prefix', () => {
    const a = generateEdgeId();
    const b = generateEdgeId();
    expect(a).toMatch(/^ef-edge-/);
    expect(b).toMatch(/^ef-edge-/);
    expect(a).not.toBe(b);
  });
});

describe('normalizeCategoryKey', () => {
  it('lowercases and trims input', () => {
    expect(normalizeCategoryKey('  Filters.AGE ')).toBe('filters.age');
  });

  it('returns "other" for empty or invalid input', () => {
    expect(normalizeCategoryKey(undefined)).toBe('other');
    expect(normalizeCategoryKey(null)).toBe('other');
    expect(normalizeCategoryKey('')).toBe('other');
    expect(normalizeCategoryKey('   ')).toBe('other');
  });
});

describe('humanizeCategoryLabel', () => {
  it('title-cases underscore and dash separated keys', () => {
    expect(humanizeCategoryLabel('my_category')).toBe('My Category');
    expect(humanizeCategoryLabel('my-category')).toBe('My Category');
  });

  it('returns "Other" for empty input', () => {
    expect(humanizeCategoryLabel('')).toBe('Other');
  });
});

describe('buildCategoryTree', () => {
  const cards: CardDefinition[] = [
    {
      id: 1,
      card_key: 'control.start',
      node_type: 'control.start',
      display_name: 'Start',
      category: 'control',
    },
    {
      id: 2,
      card_key: 'filter.age',
      node_type: 'filter.age',
      display_name: 'Age Filter',
      category: 'filters.age',
    },
    {
      id: 3,
      card_key: 'filter.gender',
      node_type: 'filter.gender',
      display_name: 'Gender Filter',
      category: 'filters.gender',
    },
    {
      id: 4,
      card_key: 'action.email',
      node_type: 'action.email',
      display_name: 'Send Email',
      category: 'actions',
    },
  ];

  it('builds a hierarchical tree from dotted categories', () => {
    const tree = buildCategoryTree(cards);
    const keys = tree.map((n) => n.key);
    expect(keys).toContain('control');
    expect(keys).toContain('filters');
    expect(keys).toContain('actions');

    const filters = tree.find((n) => n.key === 'filters');
    expect(filters?.children.map((c) => c.key)).toEqual(['filters.age', 'filters.gender']);
    expect(filters?.cards).toHaveLength(0);
  });

  it('places cards without a category under "other"', () => {
    const tree = buildCategoryTree([
      {
        id: 9,
        card_key: 'misc',
        node_type: 'misc',
        display_name: 'Misc',
      },
    ]);
    expect(tree.find((n) => n.key === 'other')?.cards).toHaveLength(1);
  });

  it('sorts categories alphabetically', () => {
    const tree = buildCategoryTree(cards);
    const segments = tree.map((n) => n.segment);
    expect(segments).toEqual([...segments].sort((a, b) => a.localeCompare(b)));
  });
});

describe('pickLocalized', () => {
  const map = { en: 'Hello', fa: 'سلام', 'fa-IR': 'درود' };

  it('prefers exact locale match', () => {
    expect(pickLocalized('fa-IR', map)).toBe('درود');
  });

  it('falls back to base locale', () => {
    expect(pickLocalized('fa-AF', map)).toBe('سلام');
  });

  it('falls back to en then fa then any value', () => {
    expect(pickLocalized('de', { fa: 'سلام', tr: 'Merhaba' })).toBe('سلام');
    expect(pickLocalized('de', { tr: 'Merhaba' })).toBe('Merhaba');
  });

  it('returns fallback when map is missing or empty', () => {
    expect(pickLocalized('en', undefined, 'fallback')).toBe('fallback');
    expect(pickLocalized('en', {}, 'fallback')).toBe('fallback');
  });

  it('returns plain string values as-is', () => {
    expect(pickLocalized('en', 'Direct', 'fb')).toBe('Direct');
    expect(pickLocalized('en', '', 'fb')).toBe('fb');
  });
});

describe('extractLocalizedMap', () => {
  it('extracts base and _locale suffixed fields', () => {
    const map = extractLocalizedMap({ name: 'Default', name_en: 'Hello', name_fa: 'سلام' }, 'name');
    expect(map).toEqual({ default: 'Default', en: 'Hello', fa: 'سلام' });
  });

  it('ignores non-string values', () => {
    const map = extractLocalizedMap({ name: 'A', name_en: 123 as unknown as string }, 'name');
    expect(map).toEqual({ default: 'A' });
  });
});

describe('localizeNodeData', () => {
  it('overwrites label/description with localized values', () => {
    const result = localizeNodeData('fa', {
      label: 'Start',
      label_i18n: { en: 'Start', fa: 'شروع' },
      description: 'Begin',
      description_i18n: { en: 'Begin', fa: 'شروع' },
      other: 1,
    });
    expect(result.label).toBe('شروع');
    expect(result.description).toBe('شروع');
    expect(result.other).toBe(1);
  });
});

describe('isRTLLocale', () => {
  it('detects known RTL locales including regional variants', () => {
    expect(isRTLLocale('ar')).toBe(true);
    expect(isRTLLocale('fa')).toBe(true);
    expect(isRTLLocale('fa-IR')).toBe(true);
    expect(isRTLLocale('he')).toBe(true);
    expect(isRTLLocale('ur')).toBe(true);
  });

  it('returns false for LTR locales and empty input', () => {
    expect(isRTLLocale('en')).toBe(false);
    expect(isRTLLocale('de-DE')).toBe(false);
    expect(isRTLLocale(undefined)).toBe(false);
    expect(isRTLLocale(null)).toBe(false);
  });
});
