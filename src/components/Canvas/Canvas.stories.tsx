import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '../Canvas';
import type { Edge, Node } from '@xyflow/react';

const meta: Meta<typeof Canvas> = {
  title: 'Components/Canvas',
  component: Canvas,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '100%', height: 480 }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'React Flow canvas wrapper with default smoothstep edges, minimap, controls, and snap-to-grid. Edges are rendered by React Flow from the `edges` prop.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Canvas>;

const sampleNodes: Node[] = [
  {
    id: 'n1',
    type: 'easyFlowNode',
    position: { x: 40, y: 80 },
    data: {
      label: 'Start',
      icon: '🟢',
      category: 'control',
      nodeType: 'control.start',
      uiConfig: { shape: 'ellipse', color: '#10b981', size: 'small' },
    },
  },
  {
    id: 'n2',
    type: 'easyFlowNode',
    position: { x: 280, y: 80 },
    data: {
      label: 'Age Filter',
      icon: '🔢',
      category: 'filters',
      nodeType: 'filter.age',
      uiConfig: { shape: 'rectangle', color: '#6366f1', size: 'medium' },
    },
  },
  {
    id: 'n3',
    type: 'easyFlowNode',
    position: { x: 520, y: 80 },
    data: {
      label: 'Send Email',
      icon: '📧',
      category: 'actions',
      nodeType: 'action.email',
      uiConfig: { shape: 'rectangle', color: '#f59e0b', size: 'medium' },
    },
  },
];

const sampleEdges: Edge[] = [
  { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep', animated: true },
  { id: 'e2', source: 'n2', target: 'n3', type: 'smoothstep', animated: true },
];

const noop = () => {};

export const WithEdges: Story = {
  args: {
    nodes: sampleNodes,
    edges: sampleEdges,
    onNodesChange: noop,
    onEdgesChange: noop,
    onConnect: noop,
  },
  parameters: {
    docs: {
      description: {
        story: 'Two smoothstep edges connecting Start → Age Filter → Send Email.',
      },
    },
  },
};

export const SingleEdge: Story = {
  args: {
    nodes: sampleNodes.slice(0, 2),
    edges: sampleEdges.slice(0, 1),
    onNodesChange: noop,
    onEdgesChange: noop,
    onConnect: noop,
  },
};

export const NoEdges: Story = {
  args: {
    nodes: sampleNodes.slice(0, 2),
    edges: [],
    onNodesChange: noop,
    onEdgesChange: noop,
    onConnect: noop,
  },
};

export const WithNodeStatuses: Story = {
  args: {
    nodes: sampleNodes,
    edges: sampleEdges,
    onNodesChange: noop,
    onEdgesChange: noop,
    onConnect: noop,
    nodeStatuses: {
      n1: 'completed',
      n2: 'running',
      n3: 'notstarted',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Node statuses drive glow styling on the canvas nodes.',
      },
    },
  },
};
