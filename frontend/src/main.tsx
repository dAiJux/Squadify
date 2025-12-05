import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import './index.css';
import Home from './pages/home/home.tsx';
import ProfileSetup from './pages/profile-setup/profileSetup.tsx';
import Matchmaking from './pages/matchmaking/matchmaking.tsx';
import Profile from './pages/profile/profile.tsx';
import NotFound from './pages/not-found/notFound.tsx';
import AuthGuard from './guards/authGuard.tsx';
import Header from './components/header/header.tsx';

const rootElement = document.getElementById('app');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/setup"
              element={
                <AuthGuard requireSetup={false}>
                  <ProfileSetup />
                </AuthGuard>
              }
            />
            <Route
              path="/matchmaking"
              element={
                <AuthGuard requireSetup={true}>
                  <Matchmaking />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard requireSetup={true}>
                  <Profile />
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error("L'élément racine avec l'ID 'app' n'a pas été trouvé dans le DOM.");
}
