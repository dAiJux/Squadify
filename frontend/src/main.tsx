import { useEffect, useState, StrictMode, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from '~/store/store';
import { setUserData } from '~/store/user';
import { setProfileData } from '~/store/profile';
import '~/index.css';
import Home from '~/pages/home/home';
import ProfileSetup from '~/pages/profile-setup/profileSetup';
import Matchmaking from '~/pages/matchmaking/matchmaking';
import Profile from '~/pages/profile/profile';
import NotFound from '~/pages/not-found/notFound';
import Legal from '~/pages/legal/legal';
import AuthGuard from '~/guards/authGuard';
import Header from '~/components/header/header';
import Footer from '~/components/footer/footer';
import ChatLobby from '~/pages/chat/lobby/lobby';
import Conversation from '~/pages/chat/conversation/conversation';

const AppInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
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
        }
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
            <Route path="/mentions-legales" element={<Legal />} />
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
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("L'élément racine avec l'ID 'app' n'a pas été trouvé dans le DOM.");
}