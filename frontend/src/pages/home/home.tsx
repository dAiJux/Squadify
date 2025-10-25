import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth/login');
  };

  const handleRegister = () => {
    navigate('/auth/register');
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
      </main>
    </div>
  );
};

export default Home;