import type { CardDefinition } from '../../../src';

/**
 * Demo card catalog aligned with the README / docs preview.
 * Categories: Control, Filters, Operators (plus schema-bearing cards).
 */
export const demoCards: CardDefinition[] = [
  // —— Control ——
  {
    id: 1,
    card_key: 'control.start',
    node_type: 'control.start',
    display_name: 'Start',
    display_name_i18n: { en: 'Start', fa: 'شروع' },
    description: 'Workflow start point',
    description_i18n: {
      en: 'Workflow start point',
      fa: 'نقطه شروع ورک‌فلو',
    },
    icon: '🟢',
    category: 'control',
    ui_config: { shape: 'ellipse', color: '#22c55e', size: 'small' },
  },
  {
    id: 2,
    card_key: 'control.end',
    node_type: 'control.end',
    display_name: 'End',
    display_name_i18n: { en: 'End', fa: 'پایان' },
    description: 'Workflow end point',
    description_i18n: {
      en: 'Workflow end point',
      fa: 'نقطه پایان ورک‌فلو',
    },
    icon: '🔴',
    category: 'control',
    ui_config: { shape: 'ellipse', color: '#ef4444', size: 'small' },
  },
  {
    id: 3,
    card_key: 'control.delay',
    node_type: 'control.delay',
    display_name: 'Delay',
    display_name_i18n: { en: 'Delay', fa: 'تأخیر' },
    description: 'Wait before continuing',
    description_i18n: {
      en: 'Wait before continuing',
      fa: 'پیش از ادامه صبر کن',
    },
    icon: '⏳',
    category: 'control',
    ui_config: { shape: 'rectangle', color: '#3b82f6', size: 'medium' },
    parameters_schema: {
      type: 'object',
      title: 'Delay settings',
      properties: {
        duration: { type: 'number', title: 'Duration' },
        unit: {
          type: 'string',
          title: 'Unit',
          enum: ['seconds', 'minutes', 'hours'],
        },
        reason: { type: 'string', title: 'Reason' },
      },
      required: ['duration', 'unit'],
    },
  },

  // —— Filters ——
  {
    id: 4,
    card_key: 'filters.age',
    node_type: 'filters.age',
    display_name: 'Age Filter',
    display_name_i18n: { en: 'Age Filter', fa: 'فیلتر سن' },
    description: 'Filter by age range',
    description_i18n: {
      en: 'Filter by age range',
      fa: 'فیلتر بر اساس بازه سنی',
    },
    icon: '🔢',
    category: 'filters',
    ui_config: { shape: 'rectangle', color: '#3b82f6', size: 'medium' },
    parameters_schema: {
      type: 'object',
      title: 'Age range',
      properties: {
        min_age: { type: 'integer', title: 'Min Age' },
        max_age: { type: 'integer', title: 'Max Age' },
      },
      required: ['min_age', 'max_age'],
    },
  },
  {
    id: 5,
    card_key: 'filters.gender',
    node_type: 'filters.gender',
    display_name: 'Gender Filter',
    display_name_i18n: { en: 'Gender Filter', fa: 'فیلتر جنسیت' },
    description: 'Filter by gender',
    description_i18n: {
      en: 'Filter by gender',
      fa: 'فیلتر بر اساس جنسیت',
    },
    icon: '👥',
    category: 'filters',
    ui_config: { shape: 'rectangle', color: '#8b5cf6', size: 'medium' },
    parameters_schema: {
      type: 'object',
      title: 'Gender',
      properties: {
        gender: {
          type: 'string',
          title: 'Gender',
          enum: ['male', 'female', 'other'],
        },
      },
      required: ['gender'],
    },
  },

  // —— Operators ——
  {
    id: 6,
    card_key: 'operators.exit',
    node_type: 'operators.exit',
    display_name: 'EXIT',
    display_name_i18n: { en: 'EXIT', fa: 'خروج' },
    description: 'Branch · hit / miss (custom labels)',
    description_i18n: {
      en: 'Branch operator — labels are configurable (hit/miss here)',
      fa: 'اپراتور شاخه — برچسب‌ها قابل تنظیم‌اند',
    },
    icon: '⚡',
    category: 'operators',
    ui_config: {
      shape: 'downtriangle',
      color: '#eab308',
      size: 'small',
      handles: {
        mode: 'condition',
        inputs: 2,
        outputs: 1,
        inputColors: ['#22c55e', '#f97316'],
        inputLabels: ['hit', 'miss'],
      },
    },
  },
  {
    id: 7,
    card_key: 'operators.not_exit',
    node_type: 'operators.not_exit',
    display_name: 'NOT EXIT',
    display_name_i18n: { en: 'NOT EXIT', fa: 'عدم خروج' },
    description: 'Negated branch · exists / not-exist',
    description_i18n: {
      en: 'Negated branch — custom labels (exists/not-exist)',
      fa: 'شرط منفی — برچسب دلخواه',
    },
    icon: '🚫',
    category: 'operators',
    ui_config: {
      shape: 'downtriangle',
      color: '#ef4444',
      size: 'small',
      handles: {
        mode: 'condition',
        inputs: 2,
        outputs: 1,
        inputColors: ['#22c55e', '#f97316'],
        inputLabels: ['exists', 'not-exist'],
      },
    },
  },

  // —— Dynamic multi-handle router ——
  {
    id: 9,
    card_key: 'data.router',
    node_type: 'data.router',
    display_name: 'Router',
    display_name_i18n: { en: 'Router', fa: 'مسیریاب' },
    description: '3 inputs · 2 outputs (path-a / path-b)',
    description_i18n: {
      en: 'Route by handle — 3 inputs, 2 colored outputs (custom labels)',
      fa: 'مسیریابی — ۳ ورودی، ۲ خروجی با برچسب دلخواه',
    },
    icon: '🔀',
    category: 'data',
    ui_config: {
      shape: 'rectangle',
      color: '#0ea5e9',
      size: 'medium',
      handles: {
        inputs: 3,
        outputs: 2,
        inputColors: ['#64748b', '#64748b', '#64748b'],
        outputColors: ['#22c55e', '#f97316'],
        outputLabels: ['path-a', 'path-b'],
      },
    },
  },

  // —— Actions (schema + custom editor showcase) ——
  {
    id: 8,
    card_key: 'actions.email',
    node_type: 'actions.email',
    display_name: 'Send Email',
    display_name_i18n: { en: 'Send Email', fa: 'ارسال ایمیل' },
    description: 'Send an email notification',
    description_i18n: {
      en: 'Send an email notification',
      fa: 'ارسال اعلان ایمیلی',
    },
    icon: '📧',
    category: 'actions',
    ui_config: {
      shape: 'rectangle',
      color: '#f59e0b',
      size: 'medium',
      handles: { inputs: 1, outputs: 1 },
    },
    parameters_schema: {
      type: 'object',
      title: 'Email settings',
      properties: {
        to: { type: 'string', title: 'To', description: 'Recipient email address' },
        subject: { type: 'string', title: 'Subject' },
        body: { type: 'string', title: 'Body' },
      },
      required: ['to', 'subject'],
    },
  },
];

/** Category keys used by the palette tree (docs preview order). */
export const demoCategories = ['control', 'filters', 'operators', 'data', 'actions'] as const;
