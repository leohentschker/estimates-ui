import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import 'async-mutex';

const rootElement = document.getElementById('app');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}