import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkflowEditor, EasyFlowI18nProvider } from '../../src';
import type { CardDefinition, APIAdapter } from '../../src';

const sampleCards: CardDefinition[] = [
  {
    id: 1,
    card_key: 'control.start',
    node_type: 'control.start',
    display_name: 'Start',
    display_name_en: 'Start',
    display_name_fa: 'شروع',
    icon: '🟢',
    category: 'control',
    ui_config: { shape: 'ellipse', color: '#22c55e', size: 'small' },
    parameters_schema: {
      properties: {
        name: { type: 'string', title: 'Campaign Name' },
      },
    },
  },
  {
    id: 2,
    card_key: 'control.end',
    node_type: 'control.end',
    display_name: 'End',
    display_name_en: 'End',
    display_name_fa: 'پایان',
    icon: '🔴',
    category: 'control',
    ui_config: { shape: 'ellipse', color: '#ef4444', size: 'small' },
  },
  {
    id: 3,
    card_key: 'filter.age',
    node_type: 'filter.age',
    display_name: 'Age Filter',
    display_name_en: 'Age Filter',
    display_name_fa: 'فیلتر سن',
    icon: '🔢',
    category: 'filters',
    ui_config: { shape: 'rectangle', color: '#3b82f6', size: 'medium' },
    parameters_schema: {
      properties: {
        min_age: { type: 'integer', title: 'Min Age' },
        max_age: { type: 'integer', title: 'Max Age' },
      },
    },
  },
  {
    id: 4,
    card_key: 'filter.gender',
    node_type: 'filter.gender',
    display_name: 'Gender Filter',
    display_name_en: 'Gender Filter',
    display_name_fa: 'فیلتر جنسیت',
    icon: '👥',
    category: 'filters',
    ui_config: { shape: 'rectangle', color: '#8b5cf6', size: 'medium' },
    parameters_schema: {
      properties: {
        gender: { type: 'string', title: 'Gender', enum: ['male', 'female', 'other'] },
      },
    },
  },
  {
    id: 5,
    card_key: 'operator.exit',
    node_type: 'operator.exit',
    display_name: 'EXIT',
    display_name_en: 'EXIT',
    display_name_fa: 'خروج',
    icon: '⚡',
    category: 'operators',
    ui_config: { shape: 'downtriangle', color: '#16a34a', size: 'small' },
  },
  {
    id: 6,
    card_key: 'action.email',
    node_type: 'action.email',
    display_name: 'Send Email',
    display_name_en: 'Send Email',
    display_name_fa: 'ارسال ایمیل',
    icon: '📧',
    category: 'actions',
    ui_config: { shape: 'rectangle', color: '#f59e0b', size: 'medium' },
    parameters_schema: {
      properties: {
        subject: { type: 'string', title: 'Subject' },
        body: { type: 'string', title: 'Body' },
        to: { type: 'string', title: 'To (email)' },
      },
    },
  },
  {
    id: 7,
    card_key: 'action.sms',
    node_type: 'action.sms',
    display_name: 'Send SMS',
    display_name_en: 'Send SMS',
    display_name_fa: 'ارسال پیامک',
    icon: '💬',
    category: 'actions',
    ui_config: { shape: 'rectangle', color: '#06b6d4', size: 'medium' },
    parameters_schema: {
      properties: {
        message: { type: 'string', title: 'Message' },
        phone: { type: 'string', title: 'Phone Number' },
      },
    },
  },
  {
    id: 8,
    card_key: 'data.segment',
    node_type: 'data.segment',
    display_name: 'Customer Segment',
    display_name_en: 'Customer Segment',
    display_name_fa: 'segment مشتری',
    icon: '📊',
    category: 'data',
    ui_config: { shape: 'rectangle', color: '#ec4899', size: 'medium' },
    parameters_schema: {
      properties: {
        segment_name: { type: 'string', title: 'Segment Name' },
      },
    },
  },
];

const noopAdapter: APIAdapter = {
  async getCards() { return sampleCards; },
  async syncCards() { return { created: 0, updated: 0, total: sampleCards.length }; },
};

function App() {
  return (
    <EasyFlowI18nProvider locale="fa">
      <WorkflowEditor
        adapter={noopAdapter}
        onBack={() => alert('Back clicked')}
        onSave={(wf) => console.log('Save:', wf)}
        onExecute={(id) => console.log('Execute:', id)}
        onValidate={(id) => console.log('Validate:', id)}
      />
    </EasyFlowI18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
