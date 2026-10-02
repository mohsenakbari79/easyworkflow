import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { WorkflowEditor } from './WorkflowEditor';
import { EasyFlowI18nProvider } from '../../i18n/context';
import type { APIAdapter, CardDefinition } from '../../types';

const cards: CardDefinition[] = [
  {
    id: 1,
    card_key: 'control.start',
    node_type: 'control.start',
    display_name: 'Start',
    display_name_i18n: { en: 'Start', fa: 'شروع' },
    icon: '🟢',
    category: 'control',
    ui_config: { shape: 'ellipse', color: '#10b981', size: 'small' },
  },
  {
    id: 2,
    card_key: 'filter.age',
    node_type: 'filter.age',
    display_name: 'Age Filter',
    display_name_i18n: { en: 'Age Filter', fa: 'فیلتر سن' },
    icon: '🔢',
    category: 'filters',
    ui_config: { shape: 'rectangle', color: '#6366f1', size: 'medium' },
    parameters_schema: {
      properties: {
        min_age: { type: 'integer', title: 'Min Age' },
        max_age: { type: 'integer', title: 'Max Age' },
      },
    },
  },
  {
    id: 3,
    card_key: 'action.email',
    node_type: 'action.email',
    display_name: 'Send Email',
    icon: '📧',
    category: 'actions',
    ui_config: { shape: 'rectangle', color: '#f59e0b', size: 'medium' },
  },
];

const demoAdapter: APIAdapter = {
  getCards: () => Promise.resolve(cards),
  saveWorkflow: (wf) => Promise.resolve({ id: 'story', ...wf }),
};

const meta: Meta<typeof WorkflowEditor> = {
  title: 'Components/WorkflowEditor',
  component: WorkflowEditor,
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const locale = (context.args as { locale?: string }).locale ?? 'en';
      return (
        <EasyFlowI18nProvider locale={locale}>
          <div style={{ height: '100vh' }}>
            <Story />
          </div>
        </EasyFlowI18nProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full workflow editor shell: header actions, React Flow canvas, palette, and node editor side panel. Self-wraps in ReactFlowProvider.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowEditor>;

export const Default: Story = {
  args: {
    adapter: demoAdapter,
    onSave: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Drop cards from the palette onto the canvas, then click Save.',
      },
    },
  },
};

export const WithCustomActions: Story = {
  args: {
    adapter: demoAdapter,
    actions: [
      {
        key: 'save',
        label: 'Save Draft',
        icon: '💾',
        variant: 'primary',
        onClick: fn(),
      },
      {
        key: 'publish',
        label: 'Publish',
        icon: '🚀',
        variant: 'success',
        onClick: fn(),
      },
      {
        key: 'discard',
        label: 'Discard',
        icon: '🗑️',
        variant: 'danger',
        onClick: fn(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom `actions` replace the default toolbar buttons entirely.',
      },
    },
  },
};

export const WithInitialCards: Story = {
  args: {
    initialCards: cards,
    onSave: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses `initialCards` when no adapter `getCards` is supplied.',
      },
    },
  },
};

export const PersianLocale: Story = {
  args: {
    locale: 'fa',
    adapter: demoAdapter,
    onSave: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Persian locale with automatic RTL layout.',
      },
    },
  },
};

export const WithToolbarActions: Story = {
  args: {
    adapter: demoAdapter,
    onSave: fn(),
    toolbarActions: [
      {
        key: 'export',
        label: 'Export JSON',
        icon: '📤',
        variant: 'secondary',
        onClick: fn(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Legacy `toolbarActions` append extra buttons after the default actions.',
      },
    },
  },
};
