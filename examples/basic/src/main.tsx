import React from 'react';
import { createRoot } from 'react-dom/client';
// Explicit library stylesheet — must load design tokens (.ef-root, .ef-btn, --ef-*).
// The barrel import alone is not enough for the demo Vite build.
import '../../../src/styles/easyflow.css';
import App from './App';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
