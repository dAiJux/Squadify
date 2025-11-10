import React, { useState, useEffect } from 'react';
import './auth.css';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onLoginSuccess: (token: string, userId: string, username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ isOpen, onClose, initialTab = 'login', onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setRegisterMessage(null);
    setLoginMessage(null);
  }, [initialTab]);

  if (!isOpen) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const attemptLogin = async (identifier: string, password: string) => {
    setLoginMessage(null);

    const loginData = {
      identifier: identifier,
      password: password,
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('squadify_token', data.token);
        localStorage.setItem('squadify_user_id', data.userId);
        localStorage.setItem('squadify_username', data.username);
        onLoginSuccess(data.token, data.userId, data.username);
        onClose();
        return { success: true };
      } else if (response.status === 401) {
        setLoginMessage('Identifiant ou mot de passe incorrect.');
        return { success: false, message: 'Identifiant ou mot de passe incorrect.' };
      } else {
        setLoginMessage('Une erreur inattendue est survenue lors de la connexion. Veuillez réessayer.');
        return { success: false, message: 'Erreur inattendue.' };
      }
    } catch (error) {
      setLoginMessage('Connexion au serveur impossible. Vérifiez que le backend est lancé.');
      return { success: false, message: 'Erreur de connexion serveur.' };
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegisterMessage(null);

    const registrationData = {
      username: registerUsername,
      email: registerEmail,
      password: registerPassword,
    };

    const tempPassword = registerPassword;
    const tempIdentifier = registerUsername;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.status === 202) {
        setRegisterMessage('Inscription réussie. Connexion en cours...');

        const loginResult = await attemptLogin(tempIdentifier, tempPassword);

        if (!loginResult.success) {
            setRegisterMessage('Inscription réussie, mais échec de la connexion automatique. Veuillez vous connecter manuellement.');
            setActiveTab('login');
        }

      } else if (response.status === 409) {
        const errorData = await response.json();
        if (errorData.error === 'email_exists') {
            setRegisterMessage('Erreur: Cet email est déjà associé à un compte.');
        } else if (errorData.error === 'username_exists') {
            setRegisterMessage('Erreur: Ce nom d\'utilisateur est déjà pris.');
        } else {
            setRegisterMessage('Une erreur de conflit est survenue.');
        }
      } else {
        setRegisterMessage('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      setRegisterMessage('Connexion au serveur impossible. Vérifiez que le backend est lancé.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await attemptLogin(loginIdentifier, loginPassword);

    setIsSubmitting(false);
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
            <form className="modal-form" onSubmit={handleLoginSubmit}>
              <h2 className="modal-title">Vos coéquipiers vous attendent !</h2>

              {loginMessage && (
                  <p className={`text-center font-medium text-red-400`}>
                      {loginMessage}
                  </p>
              )}

              <div>
                <label htmlFor="login-identifier" className="modal-label">Email ou Nom d'utilisateur</label>
                <input
                  type="text"
                  id="login-identifier"
                  placeholder="votre.email@exemple.com ou Pseudo"
                  className="modal-input"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="modal-label">Mot de passe</label>
                <input
                  type="password"
                  id="login-password"
                  placeholder="••••••••"
                  className="modal-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <a href="#" className="modal-link">
                Mot de passe oublié ?
              </a>
              <button
                type="submit"
                className="modal-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form className="modal-form" onSubmit={handleRegisterSubmit}>
              <h2 className="modal-title">Envie de rejoindre une équipe ?</h2>

              {registerMessage && (
                  <p className={`text-center font-medium ${registerMessage.includes('réussie') ? 'text-green-400' : 'text-red-400'}`}>
                      {registerMessage}
                  </p>
              )}

              <div>
                <label htmlFor="register-username" className="modal-label">Nom d'utilisateur</label>
                <input
                  type="text"
                  id="register-username"
                  placeholder="Pseudo"
                  className="modal-input"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="register-email" className="modal-label">Email</label>
                <input
                  type="email"
                  id="register-email"
                  placeholder="votre.email@exemple.com"
                  className="modal-input"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="register-password" className="modal-label">Mot de passe</label>
                <input
                  type="password"
                  id="register-password"
                  placeholder="••••••••"
                  className="modal-input"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="modal-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création...' : 'Créer un compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;