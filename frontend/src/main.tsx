import React from 'react';
import ReactDOM from 'react-dom/client';
import Page from './page.tsx';

const rootElement = document.getElementById('app');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Page />
    </React.StrictMode>
  );
} else {
  console.error("L'élément racine avec l'ID 'app' n'a pas été trouvé dans le DOM.");
}