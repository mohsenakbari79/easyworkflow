import type { ParameterSchema } from './node';
import type { UIConfig } from './node';

/**
 * Definition of a palette card — the catalog entry that can be dropped
 * onto the canvas as a node.
 */
export interface CardDefinition {
  /** Unique card identifier (backend id or local number). */
  id: string | number;
  /** Stable machine key for the card (e.g. `control.start`). */
  card_key: string;
  /** Node type used for editor/shape resolution. */
  node_type: string;

  /** Base display name (used as fallback when no locale matches). */
  display_name?: string;
  /** Locale-keyed display names (preferred over legacy suffixed fields). */
  display_name_i18n?: Record<string, string>;
  /** @deprecated Use `display_name_i18n` instead. Legacy Farsi display name. */
  display_name_fa?: string;
  /** @deprecated Use `display_name_i18n` instead. Legacy English display name. */
  display_name_en?: string;

  /** Base description (used as fallback when no locale matches). */
  description?: string;
  /** Locale-keyed descriptions. */
  description_i18n?: Record<string, string>;
  /** @deprecated Use `description_i18n` instead. Legacy Farsi description. */
  description_fa?: string;
  /** @deprecated Use `description_i18n` instead. Legacy English description. */
  description_en?: string;

  /** Emoji or short text used as the palette/node icon. */
  icon?: string;
  /** Category path; dots create nested palette groups (e.g. `filters.age`). */
  category?: string;
  /** Preferred parameter schema field. */
  parameters_schema?: ParameterSchema;
  /** @deprecated Use `parameters_schema`. Alternate key kept for compatibility. */
  parametersSchema?: ParameterSchema;
  /** Visual configuration applied when the card becomes a node. */
  ui_config?: UIConfig;
  /** Additional keys are preserved and forwarded to the node data. */
  [key: string]: unknown;
}

/**
 * A node in the hierarchical category tree used by the palette.
 */
export interface CardCategoryNode {
  /** Discriminator — always `'category'` for tree nodes. */
  type: 'category';
  /** Full dotted path key (e.g. `filters.age`). */
  key: string;
  /** Single segment of the path shown as the group label. */
  segment: string;
  /** Nested child category nodes. */
  children: CardCategoryNode[];
  /** Card definitions that belong directly to this category. */
  cards: CardDefinition[];
}
