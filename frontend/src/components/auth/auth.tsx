import React, { useState, useEffect } from 'react';
import './auth.css';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

const Auth: React.FC<AuthProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalContentClick}>

        <div className="modal-header-flow">
          <div className="modal-tabs">
            <button
              onClick={() => setActiveTab('login')}
              className={`modal-tab ${activeTab === 'login' ? 'modal-tab-active' : 'modal-tab-inactive'}`}
            >
              Connexion
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`modal-tab ${activeTab === 'register' ? 'modal-tab-active' : 'modal-tab-inactive'}`}
            >
              Inscription
            </button>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn-flow"
            aria-label="Fermer le modal"
          >
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-form-container">
          {activeTab === 'login' ? (
            <form className="modal-form">
              <h2 className="modal-title">Vos coéquipiers vous attendent !</h2>
              <div>
                <label htmlFor="login-email" className="modal-label">Email</label>
                <input
                  type="email"
                  id="login-email"
                  placeholder="votre.email@exemple.com"
                  className="modal-input"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="modal-label">Mot de passe</label>
                <input
                  type="password"
                  id="login-password"
                  placeholder="••••••••"
                  className="modal-input"
                />
              </div>
              <a href="#" className="modal-link">
                Mot de passe oublié ?
              </a>
              <button type="submit" className="modal-btn">
                Se connecter
              </button>
            </form>
          ) : (
            <form className="modal-form">
              <h2 className="modal-title">Envie de rejoindre une équipe ?</h2>
              <div>
                <label htmlFor="register-username" className="modal-label">Nom d'utilisateur</label>
                <input
                  type="text"
                  id="register-username"
                  placeholder="Pseudo"
                  className="modal-input"
                />
              </div>
              <div>
                <label htmlFor="register-email" className="modal-label">Email</label>
                <input
                  type="email"
                  id="register-email"
                  placeholder="votre.email@exemple.com"
                  className="modal-input"
                />
              </div>
              <div>
                <label htmlFor="register-password" className="modal-label">Mot de passe</label>
                <input
                  type="password"
                  id="register-password"
                  placeholder="••••••••"
                  className="modal-input"
                />
              </div>
              <button type="submit" className="modal-btn">
                Créer un compte
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;