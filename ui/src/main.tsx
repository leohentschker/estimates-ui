import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import 'async-mutex';
import { Provider } from 'react-redux';
import { store } from './store';

const rootElement = document.getElementById('app');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}