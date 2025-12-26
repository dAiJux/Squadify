import { useState, useEffect, MouseEvent, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../store/user';
import { setProfileData } from '../../store/profile';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import './auth.css';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

const Auth = ({ isOpen, onClose, initialTab = 'login' }: AuthProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password requirements validation
  const hasMinLength = registerPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(registerPassword);
  const hasLowercase = /[a-z]/.test(registerPassword);
  const hasNumber = /\d/.test(registerPassword);
  const passwordsMatch = registerPassword === registerConfirmPassword && registerConfirmPassword !== '';
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  useEffect(() => {
    setActiveTab(initialTab);
    setRegisterMessage(null);
    setLoginMessage(null);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleModalContentClick = (e: MouseEvent) => e.stopPropagation();

  const attemptLogin = async (identifier: string, password: string) => {
    setLoginMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!meRes.ok) throw new Error("Impossible de récupérer l'utilisateur");
        const data = await meRes.json();
        dispatch(setUserData(data));

        onClose();
        if (data.setupCompleted) {
          const profileRes = await fetch('/api/profiles/me', { credentials: 'include' });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            dispatch(setProfileData(profileData));
          }
          navigate('/matchmaking');
        } else {
          navigate('/setup');
        }

        return { success: true };
      } else if (response.status === 401) {
        setLoginMessage('Identifiant ou mot de passe incorrect.');
        return { success: false };
      } else {
        setLoginMessage('Une erreur inattendue est survenue.');
        return { success: false };
      }
    } catch {
      setLoginMessage('Erreur de connexion serveur.');
      return { success: false };
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setRegisterMessage('Veuillez remplir toutes les conditions du mot de passe.');
      return;
    }

    setIsSubmitting(true);
    setRegisterMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerUsername, email: registerEmail, password: registerPassword }),
        credentials: 'include'
      });

      if (response.ok) {
        setRegisterMessage('Inscription réussie. Connexion en cours...');
        const loginResult = await attemptLogin(registerUsername, registerPassword);
        if (!loginResult.success) setActiveTab('login');
      } else {
        const errorData = await response.json();
        setRegisterMessage(errorData.message || 'Erreur inattendue.');
      }
    } catch {
      setRegisterMessage('Erreur de connexion serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
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
            <button onClick={() => setActiveTab('login')} className={`modal-tab ${activeTab === 'login' ? 'modal-tab-active' : 'modal-tab-inactive'}`}>Connexion</button>
            <button onClick={() => setActiveTab('register')} className={`modal-tab ${activeTab === 'register' ? 'modal-tab-active' : 'modal-tab-inactive'}`}>Inscription</button>
          </div>
          <button onClick={onClose} className="modal-close-btn-flow" aria-label="Fermer le modal">
            <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="modal-form-container">
          {activeTab === 'login' ? (
            <form className="modal-form" onSubmit={handleLoginSubmit}>
              <h2 className="modal-title">Vos coéquipiers vous attendent !</h2>
              {loginMessage && <p className="text-center font-medium text-red-400">{loginMessage}</p>}
              <input type="text" placeholder="Email ou Pseudo" className="modal-input" value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} required />
              <div className="password-input-wrapper">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="modal-input"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" className="modal-btn" disabled={isSubmitting}>{isSubmitting ? 'Connexion...' : 'Se connecter'}</button>
            </form>
          ) : (
            <form className="modal-form" onSubmit={handleRegisterSubmit}>
              <h2 className="modal-title">Envie de rejoindre une équipe ?</h2>
              {registerMessage && <p className={`text-center font-medium ${registerMessage.includes('réussie') ? 'text-green-400' : 'text-red-400'}`}>{registerMessage}</p>}
              <input type="text" placeholder="Pseudo" className="modal-input" value={registerUsername} onChange={e => setRegisterUsername(e.target.value)} required />
              <input type="email" placeholder="Email" className="modal-input" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
              <div className="password-field-container">
                <div className="password-input-wrapper">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    className="modal-input"
                    value={registerPassword}
                    onChange={e => setRegisterPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    aria-label={showRegisterPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {isPasswordFocused && !isPasswordValid && (
                  <div className="password-tooltip">
                    <div className="password-tooltip-arrow" />
                    <div className="password-requirements">
                      <div className={`requirement ${hasMinLength ? 'requirement-valid' : 'requirement-invalid'}`}>
                        {hasMinLength ? <Check size={12} /> : <X size={12} />}
                        <span>8+ caractères</span>
                      </div>
                      <div className={`requirement ${hasUppercase ? 'requirement-valid' : 'requirement-invalid'}`}>
                        {hasUppercase ? <Check size={12} /> : <X size={12} />}
                        <span>Majuscule</span>
                      </div>
                      <div className={`requirement ${hasLowercase ? 'requirement-valid' : 'requirement-invalid'}`}>
                        {hasLowercase ? <Check size={12} /> : <X size={12} />}
                        <span>Minuscule</span>
                      </div>
                      <div className={`requirement ${hasNumber ? 'requirement-valid' : 'requirement-invalid'}`}>
                        {hasNumber ? <Check size={12} /> : <X size={12} />}
                        <span>Chiffre</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  className={`modal-input ${registerConfirmPassword && (passwordsMatch ? 'input-valid' : 'input-invalid')}`}
                  value={registerConfirmPassword}
                  onChange={e => setRegisterConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                  aria-label={showRegisterConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showRegisterConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {registerConfirmPassword && (
                  <span className={`password-match-indicator ${passwordsMatch ? 'match-valid' : 'match-invalid'}`}>
                    {passwordsMatch ? <Check size={16} /> : <X size={16} />}
                  </span>
                )}
              </div>
              <button type="submit" className="modal-btn" disabled={isSubmitting || !isPasswordValid}>
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