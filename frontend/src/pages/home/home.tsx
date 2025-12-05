import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setUserData } from '../../store/user';
import './home.css';
import Auth from '../../components/auth/auth.tsx';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const setupCompleted = useSelector((state: RootState) => state.user.data?.setupCompleted);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isAuthenticated) {
      if (setupCompleted) navigate('/matchmaking');
      else navigate('/setup');
      return;
    }

    const checkAuth = async () => {
      const token = localStorage.getItem('squadify_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          dispatch(setUserData({ token, ...data }));
          if (data.setupCompleted) navigate('/matchmaking');
          else navigate('/setup');
        }
      } catch {}
      finally { setIsLoading(false); }
    };

    checkAuth();
  }, [isAuthenticated, setupCompleted, navigate, dispatch]);

  const handleLogin = () => { setModalTab('login'); setIsModalOpen(true); };
  const handleRegister = () => { setModalTab('register'); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); };

  if (isLoading) {
    return (
      <div className="home-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="decor-pulse-blue animate-pulse-slow"></div>
      <div className="decor-pulse-violet animate-pulse-slow delay-200"></div>
      <div className="decor-left-joystick"></div>
      <div className="decor-right-target-ring"></div>
      <div className="decor-right-target-dot"></div>
      <main className="home-card">
        <p className="home-card-text">
          Squadify est la plateforme dédiée aux joueurs cherchant à former l'équipe parfaite.
          Ne laissez plus le hasard décider de vos coéquipiers. Parcourez des profils détaillés,
          découvrez des joueurs compatibles avec votre style et vos ambitions, et connectez-vous
          pour lancer votre prochaine partie.
        </p>
        <div className="home-card-actions">
          <div className="home-card-action-group">
            <p className="home-card-action-text">Déjà un compte ?</p>
            <button className="btn btnPrimary home-card-button" onClick={handleLogin}>Connexion</button>
          </div>
          <div className="separator"></div>
          <div className="home-card-action-group">
            <p className="home-card-action-text">Nouveau sur Squadify ?</p>
            <button className="btn btnSecondary home-card-button" onClick={handleRegister}>Inscription</button>
          </div>
        </div>
      </main>
      <Auth isOpen={isModalOpen} onClose={handleCloseModal} initialTab={modalTab} />
    </div>
  );
};

export default Home;