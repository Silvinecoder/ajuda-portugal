import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import './styles/index.css';
import './styles/Map.css';
import './styles/FilterBar.css';
import './styles/InfoPanel.css';
import './styles/Forms.css';
import './styles/Modals.css';
import './styles/Cards.css';
import './styles/ManagePage.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);