import React from 'react';
import { useNavigate } from 'react-router-dom';
import './notFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const goHub = () => navigate('/matchmaking');

  return (
    <main className="nf-container">
      <div className="nf-decor-blue animate-pulse-slow delay-200" aria-hidden />
      <div className="nf-decor-violet animate-pulse-slow delay-400" aria-hidden />
      <section className="nf-card" role="region" aria-labelledby="nf-title">
        <h1 id="nf-title" className="nf-title">404</h1>
        <p className="nf-text">Zone introuvable — page non débloquée.</p>
        <div className="nf-actions">
          <button
            className="btn btnPrimary nf-button"
            onClick={goHub}
            aria-label="Retourner à l'accueil"
          >
            Retourner à l'accueil
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
