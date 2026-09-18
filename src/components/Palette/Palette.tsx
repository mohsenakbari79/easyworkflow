import React, { useCallback, useState, useMemo } from 'react';
import type { CardDefinition, CardCategoryNode } from '../../types/card';
import { buildCategoryTree, humanizeCategoryLabel } from '../../utils/category';
import { pickLocalized } from '../../utils/localization';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './Palette.module.css';

interface CategoryTreeProps {
  items: CardCategoryNode[];
  level?: number;
  expandedCategories: Record<string, boolean>;
  onToggleCategory: (key: string) => void;
  onAddNode: (card: CardDefinition) => void;
  locale: string;
  searchQuery: string;
}

function matchesSearch(card: CardDefinition, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [
    card.display_name,
    card.display_name_en,
    card.display_name_fa,
    card.card_key,
    card.description,
    card.description_en,
    card.description_fa,
    card.category,
  ].filter(Boolean);
  return fields.some((f) => f!.toLowerCase().includes(q));
}

function filterTree(
  items: CardCategoryNode[],
  query: string
): CardCategoryNode[] {
  if (!query) return items;
  return items
    .map((cat) => {
      const filteredCards = cat.cards.filter((c) => matchesSearch(c, query));
      const filteredChildren = filterTree(cat.children, query);
      if (filteredCards.length === 0 && filteredChildren.length === 0) return null;
      return {
        ...cat,
        cards: filteredCards,
        children: filteredChildren,
      };
    })
    .filter(Boolean) as CardCategoryNode[];
}

function getDisplayName(locale: string, card: CardDefinition): string {
  const map: Record<string, string> = {
    ...(card.display_name_i18n || {}),
    ...(card.display_name_en ? { en: card.display_name_en } : {}),
    ...(card.display_name_fa ? { fa: card.display_name_fa } : {}),
    ...(card.display_name ? { default: card.display_name } : {}),
  };
  return pickLocalized(locale, map, card.card_key);
}

function getDescription(locale: string, card: CardDefinition): string {
  const map: Record<string, string> = {
    ...(card.description_i18n || {}),
    ...(card.description_en ? { en: card.description_en } : {}),
    ...(card.description_fa ? { fa: card.description_fa } : {}),
    ...(card.description ? { default: card.description } : {}),
  };
  return pickLocalized(locale, map, '');
}

function CategoryTree({
  items,
  level = 0,
  expandedCategories,
  onToggleCategory,
  onAddNode,
  locale,
  searchQuery,
}: CategoryTreeProps) {
  const { t } = useTranslation();
  const categories = (t('categories') || {}) as Record<string, string>;

  const getCategoryLabel = useCallback(
    (node: CardCategoryNode) => {
      return categories[node.segment] || humanizeCategoryLabel(node.segment);
    },
    [categories]
  );

  return (
    <div className={`${styles.tree} ${styles[`treeLevel${level}`] || ''}`}>
      {items.map((categoryNode) => {
        const isExpanded = expandedCategories[categoryNode.key] ?? true;
        const hasChildren = categoryNode.children?.length > 0;
        const hasCards = categoryNode.cards?.length > 0;
        const totalItems = (categoryNode.cards?.length || 0) + (categoryNode.children?.length || 0);
        const levelClass = styles[`categoryLevel${level}`] || '';

        return (
          <div key={categoryNode.key} className={`${styles.category} ${levelClass}`}>
            <button
              type="button"
              className={styles.categoryToggle}
              onClick={() => onToggleCategory(categoryNode.key)}
            >
              <span className={styles.toggleIcon}>{isExpanded ? '▾' : '▸'}</span>
              <span className={styles.categoryTitle}>{getCategoryLabel(categoryNode)}</span>
              <span className={styles.categoryBadge}>{totalItems}</span>
            </button>

            {isExpanded && (
              <div className={styles.categoryChildren}>
                {hasChildren && (
                  <CategoryTree
                    items={categoryNode.children}
                    level={level + 1}
                    expandedCategories={expandedCategories}
                    onToggleCategory={onToggleCategory}
                    onAddNode={onAddNode}
                    locale={locale}
                    searchQuery={searchQuery}
                  />
                )}
                {hasCards && (
                  <div className={styles.items}>
                    {categoryNode.cards.map((card) => (
                      <button
                        key={card.id}
                        className={styles.item}
                        onClick={(e) => { e.stopPropagation(); onAddNode(card); }}
                        title={getDescription(locale, card)}
                      >
                        <span className={styles.itemIcon}>{card.icon || '📋'}</span>
                        <div className={styles.texts}>
                          <div className={styles.itemTitle}>
                            {getDisplayName(locale, card)}
                          </div>
                          <div className={styles.itemDesc}>
                            {getDescription(locale, card)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface PaletteProps {
  cards: CardDefinition[];
  onAddNode: (card: CardDefinition) => void;
}

export function Palette({ cards, onAddNode }: PaletteProps) {
  const { t, locale } = useTranslation();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const categoryTree = useMemo(() => {
    const tree = buildCategoryTree(cards);
    return searchQuery ? filterTree(tree, searchQuery) : tree;
  }, [cards, searchQuery]);

  const filteredCount = useMemo(() => {
    if (!searchQuery) return cards.length;
    return cards.filter((c) => matchesSearch(c, searchQuery)).length;
  }, [cards, searchQuery]);

  const handleToggleCategory = useCallback((key: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  }, []);

  return (
    <div className={styles.palette}>
      <div className={styles.paletteHeader}>
        <h3 className={styles.paletteTitle}>{t('palette.title', 'Add card')}</h3>
        <span className={styles.paletteHint}>
          {filteredCount} {t('palette.availableCards', 'cards available')}
        </span>
      </div>

      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('palette.searchPlaceholder', 'Search cards...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {cards.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('palette.noCards', 'No cards available')}</p>
            <small>{t('palette.clickSync', 'Click "Update cards" to fetch')}</small>
          </div>
        ) : categoryTree.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('palette.noResults', 'No results found')}</p>
          </div>
        ) : (
          <CategoryTree
            items={categoryTree}
            expandedCategories={expandedCategories}
            onToggleCategory={handleToggleCategory}
            onAddNode={onAddNode}
            locale={locale}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
}
