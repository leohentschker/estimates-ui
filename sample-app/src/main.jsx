import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import 'async-mutex';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);