import type { CardDefinition, CardCategoryNode } from '../types/card';

/**
 * Normalize a category key to lowercase trimmed form.
 * Returns 'other' for empty or invalid input.
 */
export function normalizeCategoryKey(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return 'other';
  return value.trim().toLowerCase() || 'other';
}

/** Convert a category key like 'my_category' to 'My Category'. */
export function humanizeCategoryLabel(value: string): string {
  if (!value) return 'Other';
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Build a hierarchical category tree from a flat list of cards.
 * Cards with dot-separated categories (e.g. 'filters.age') produce nested trees.
 */
export function buildCategoryTree(cards: CardDefinition[]): CardCategoryNode[] {
  const root: CardCategoryNode[] = [];

  cards.forEach((card) => {
    const fullCategory = normalizeCategoryKey(card.category);
    const parts = fullCategory.split('.').filter(Boolean);
    if (parts.length === 0) {
      parts.push('other');
    }

    let currentLevel = root;
    let fullPath = '';

    parts.forEach((part, index) => {
      fullPath = fullPath ? `${fullPath}.${part}` : part;

      let existingNode = currentLevel.find(
        (item) => item.type === 'category' && item.key === fullPath
      );

      if (!existingNode) {
        existingNode = {
          type: 'category',
          key: fullPath,
          segment: part,
          children: [],
          cards: [],
        };
        currentLevel.push(existingNode);
      }

      if (index === parts.length - 1) {
        existingNode.cards.push(card);
      }

      currentLevel = existingNode.children;
    });
  });

  sortTree(root);
  return root;
}

/** Sort category tree alphabetically by segment, and cards by display name. */
function sortTree(items: CardCategoryNode[]) {
  items.sort((a, b) => (a.segment || '').localeCompare(b.segment || ''));
  items.forEach((item) => {
    item.cards.sort((a, b) => {
      const aName = a.display_name_en || a.display_name_fa || a.display_name || a.card_key || '';
      const bName = b.display_name_en || b.display_name_fa || b.display_name || b.card_key || '';
      return aName.localeCompare(bName);
    });
    if (item.children?.length) {
      sortTree(item.children);
    }
  });
}
