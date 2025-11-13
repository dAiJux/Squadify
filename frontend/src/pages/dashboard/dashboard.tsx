import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { clearUserData } from '../../store/user';
import './dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const userData = useSelector((state: RootState) => state.user.data);
  const token = useSelector((state: RootState) => state.user.token);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(clearUserData());
    localStorage.removeItem('squadify_token');
    localStorage.removeItem('squadify_user_data');
    navigate('/');
  };

  if (!isAuthenticated || !userData) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Bienvenue sur votre Espace Squadify, {userData.username}!</h1>
        <button
          onClick={handleLogout}
          className="btn-logout"
        >
          Déconnexion
        </button>
      </header>

      <main className="dashboard-content">
        <h2 className="dashboard-section-title">Vos Informations de Session</h2>
        <div className="info-card">
          <p><strong>Nom d'utilisateur:</strong> <span>{userData.username}</span></p>
          <p><strong>Email:</strong> <span>{userData.email}</span></p>
          <p><strong>ID Utilisateur (MongoDB):</strong> <span>{userData.userId}</span></p>
        </div>

        <h2 className="dashboard-section-title">Token JWT (Sécurité)</h2>
        <div className="token-display">
            <p className="token-label">Le token est stocké pour les futures requêtes API.</p>
            <textarea
              readOnly
              value={token || ''}
              className="token-area"
              rows={5}
            />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;