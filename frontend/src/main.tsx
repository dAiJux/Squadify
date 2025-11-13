import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import './index.css';
import Home from './pages/home/home.tsx';
import Dashboard from './pages/dashboard/dashboard.tsx';

const rootElement = document.getElementById('app');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error("L'élément racine avec l'ID 'app' n'a pas été trouvé dans le DOM.");
}