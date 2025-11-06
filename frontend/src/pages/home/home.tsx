import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Auth from '../../components/auth/auth.tsx';

interface UserData {
  userId: string;
  username: string;
}

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('squadify_token');
    const userId = localStorage.getItem('squadify_user_id');
    const username = localStorage.getItem('squadify_username');

    if (token && userId && username) {
      setIsAuthenticated(true);
      setCurrentUser({ userId, username });
    }
  }, []);


  const handleLogin = () => {
    setModalTab('login');
    setIsModalOpen(true);
  };

  const handleRegister = () => {
    setModalTab('register');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLoginSuccess = (token: string, userId: string, username: string) => {
    setIsAuthenticated(true);
    setCurrentUser({ userId, username });
    setIsModalOpen(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('squadify_token');
    localStorage.removeItem('squadify_user_id');
    localStorage.removeItem('squadify_username');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };


  return (
    <div className="home-container">
      <div className="decor-pulse-blue animate-pulse-slow"></div>
      <div className="decor-pulse-violet animate-pulse-slow delay-200"></div>
      <div className="decor-left-joystick"></div>
      <div className="decor-right-target-ring"></div>
      <div className="decor-right-target-dot"></div>
      <img
        src="/icons/squadify.png"
        alt="Logo Squadify"
        className="logo-squadify"
      />
      <main className="home-card">
        {isAuthenticated ? (
            <>
                <h1 className="home-card-title">Bienvenue, {currentUser?.username} !</h1>
                <p className="home-card-text">
                    Vous êtes connecté. Prêt à former votre équipe ?
                </p>
                <div className="home-card-actions">
                    <button
                        className="btn btnPrimary home-card-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        Accéder au Dashboard
                    </button>
                    <button
                        className="btn btnSecondary home-card-button"
                        onClick={handleLogout}
                    >
                        Déconnexion
                    </button>
                </div>
            </>
        ) : (
            <>
                <p className="home-card-text">
                    Squadify est la plateforme dédiée aux joueurs cherchant à former l'équipe parfaite.
                    Ne laissez plus le hasard décider de vos coéquipiers. Parcourez des profils détaillés,
                    découvrez des joueurs compatibles avec votre style et vos ambitions, et connectez-vous
                    pour lancer votre prochaine partie.
                </p>
                <div className="home-card-actions">
                    <div className="home-card-action-group">
                        <p className="home-card-action-text">Déjà un compte ?</p>
                        <button
                          className="btn btnPrimary home-card-button"
                          onClick={handleLogin}
                        >
                          Connexion
                        </button>
                    </div>
                    <div className="separator"></div>
                    <div className="home-card-action-group">
                        <p className="home-card-action-text">Nouveau sur Squadify ?</p>
                        <button
                          className="btn btnSecondary home-card-button"
                          onClick={handleRegister}
                        >
                          Inscription
                        </button>
                    </div>
                </div>
            </>
        )}
      </main>
      <Auth
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialTab={modalTab}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Home;