import type { ParameterSchema } from './node';
import type { UIConfig } from './node';

export interface CardDefinition {
  id: string | number;
  card_key: string;
  node_type: string;

  /** Base display name (used as fallback when no locale matches). */
  display_name?: string;
  /** Locale-keyed display names (preferred over legacy suffixed fields). */
  display_name_i18n?: Record<string, string>;
  /** @deprecated Use display_name_i18n instead. Legacy Farsi display name. */
  display_name_fa?: string;
  /** @deprecated Use display_name_i18n instead. Legacy English display name. */
  display_name_en?: string;

  /** Base description (used as fallback when no locale matches). */
  description?: string;
  /** Locale-keyed descriptions. */
  description_i18n?: Record<string, string>;
  /** @deprecated Use description_i18n instead. Legacy Farsi description. */
  description_fa?: string;
  /** @deprecated Use description_i18n instead. Legacy English description. */
  description_en?: string;

  icon?: string;
  category?: string;
  parameters_schema?: ParameterSchema;
  parametersSchema?: ParameterSchema;
  ui_config?: UIConfig;
  [key: string]: unknown;
}

export interface CardCategoryNode {
  type: 'category';
  key: string;
  segment: string;
  children: CardCategoryNode[];
  cards: CardDefinition[];
}
