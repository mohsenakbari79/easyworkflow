import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Toolbar } from './Toolbar';
import { EasyFlowI18nProvider } from '../../i18n/context';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <EasyFlowI18nProvider locale="en">
        <div style={{ padding: 16, background: '#f8fafc' }}>
          <Story />
        </div>
      </EasyFlowI18nProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Standalone workflow toolbar. Only callbacks that are provided render their corresponding buttons.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  args: {
    workflowName: 'Campaign Flow',
    workflowType: 'campaign',
    nodeCount: 4,
    edgeCount: 3,
    onNameChange: fn(),
    onTypeChange: fn(),
  },
};

export const WithAllActions: Story = {
  args: {
    workflowName: 'Automation',
    workflowType: 'automation',
    nodeCount: 6,
    edgeCount: 5,
    onNameChange: fn(),
    onTypeChange: fn(),
    onBack: fn(),
    onSync: fn(),
    onReset: fn(),
    onSave: fn(),
    onValidate: fn(),
    onExecute: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'All optional action buttons render when their handlers are provided.',
      },
    },
  },
};

export const SavingState: Story = {
  args: {
    workflowName: 'Saving Flow',
    workflowType: 'general',
    nodeCount: 2,
    edgeCount: 1,
    isSaving: true,
    onNameChange: fn(),
    onTypeChange: fn(),
    onSave: fn(),
  },
};

export const ExecutingState: Story = {
  args: {
    workflowName: 'Run Flow',
    workflowType: 'event-listener',
    nodeCount: 3,
    edgeCount: 2,
    isExecuting: true,
    onNameChange: fn(),
    onTypeChange: fn(),
    onSave: fn(),
    onExecute: fn(),
  },
};

export const PersianRTL: Story = {
  args: {
    workflowName: 'جریان کمپین',
    workflowType: 'campaign',
    nodeCount: 4,
    edgeCount: 3,
    onNameChange: fn(),
    onTypeChange: fn(),
    onSave: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Persian locale renders the toolbar in RTL with translated labels.',
      },
    },
  },
  decorators: [
    (Story) => (
      <EasyFlowI18nProvider locale="fa">
        <div style={{ padding: 16, background: '#f8fafc' }}>
          <Story />
        </div>
      </EasyFlowI18nProvider>
    ),
  ],
};
