import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store.ts';
import { setUserData } from './store/user.ts';
import { setProfileData } from './store/profile.ts';
import './index.css';
import Home from './pages/home/home.tsx';
import ProfileSetup from './pages/profile-setup/profileSetup.tsx';
import Matchmaking from './pages/matchmaking/matchmaking.tsx';
import Profile from './pages/profile/profile.tsx';
import NotFound from './pages/not-found/notFound.tsx';
import AuthGuard from './guards/authGuard.tsx';
import Header from './components/header/header.tsx';
import Footer from './components/footer/footer.tsx';
import ChatLobby from './pages/chat/lobby/lobby.tsx';
import Conversation from './pages/chat/conversation/conversation.tsx';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          dispatch(setUserData(data));
          if (data.setupCompleted && data.userId) {
            const profileRes = await fetch('/api/profiles/me', {
              credentials: 'include'
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              dispatch(setProfileData(profileData));
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    initAuth();
  }, [dispatch]);
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Chargement...</div>
      </div>
    );
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer>
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
              path="/chat"
              element={
                <AuthGuard requireSetup={true}>
                  <ChatLobby />
                </AuthGuard>
              }
            />
            <Route
              path="/chat/:matchId"
              element={
                <AuthGuard requireSetup={true}>
                  <Conversation />
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
          <Footer />
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  );
};

const rootElement = document.getElementById('app');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("L'élément racine avec l'ID 'app' n'a pas été trouvé dans le DOM.");
}