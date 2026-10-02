import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowNode } from './FlowNode';
import type { EasyFlowNodeData } from '../../types';

/** Loose args shape — FlowNode only consumes `data` and `selected`. */
type FlowNodeStoryArgs = {
  id?: string;
  data: Partial<EasyFlowNodeData>;
  selected?: boolean;
};

const meta: Meta<typeof FlowNode> = {
  title: 'Components/FlowNode',
  component: FlowNode,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ padding: 40, width: 280, background: '#f8fafc' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Default EasyFlow node renderer. Supports rectangle, ellipse, diamond, and downtriangle shapes with status glow.',
      },
    },
  },
  render: (args: FlowNodeStoryArgs) => (
    <FlowNode
      {...({
        id: args.id ?? 'story-node',
        data: args.data,
        selected: args.selected ?? false,
        type: 'easyFlowNode',
        position: { x: 0, y: 0 },
        zIndex: 0,
        isConnectable: false,
        dragging: false,
      } as unknown as React.ComponentProps<typeof FlowNode>)}
    />
  ),
};

export default meta;
type Story = StoryObj<FlowNodeStoryArgs>;

const baseData: Partial<EasyFlowNodeData> = {
  label: 'Age Filter',
  icon: '🔢',
  category: 'filters',
  nodeType: 'filter.age',
};

export const Rectangle: Story = {
  args: {
    id: 'n1',
    data: {
      ...baseData,
      uiConfig: { shape: 'rectangle', color: '#6366f1', size: 'medium' },
    },
  },
};

export const Ellipse: Story = {
  args: {
    id: 'n2',
    data: {
      label: 'Start',
      icon: '🟢',
      category: 'control',
      nodeType: 'control.start',
      uiConfig: { shape: 'ellipse', color: '#10b981', size: 'small' },
    },
  },
};

export const DownTriangle: Story = {
  args: {
    id: 'n3',
    data: {
      label: 'EXIT',
      icon: '⚡',
      category: 'operators',
      nodeType: 'operator.exit',
      uiConfig: { shape: 'downtriangle', color: '#16a34a', size: 'small' },
    },
  },
};

export const WithStatus: Story = {
  args: {
    id: 'n4',
    data: {
      ...baseData,
      status: 'running',
      uiConfig: { shape: 'rectangle', color: '#f59e0b', size: 'medium' },
    },
  },
};

export const Selected: Story = {
  args: {
    id: 'n5',
    selected: true,
    data: {
      ...baseData,
      uiConfig: { shape: 'rectangle', color: '#6366f1', size: 'medium' },
    },
  },
};

export const Interactive: Story = {
  args: {
    id: 'n6',
    data: {
      ...baseData,
      uiConfig: { shape: 'rectangle', color: '#8b5cf6', size: 'medium' },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the Controls panel to change label, icon, shape, size, color, and status.',
      },
    },
  },
};
