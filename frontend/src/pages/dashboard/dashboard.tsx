import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

interface UserData {
  token: string | null;
  userId: string | null;
  username: string | null;
}

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({ token: null, userId: null, username: null });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('squadify_token');
    const userId = localStorage.getItem('squadify_user_id');
    const username = localStorage.getItem('squadify_username');

    if (token && userId && username) {
      setUserData({ token, userId, username });
    } else {
      navigate('/');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('squadify_token');
    localStorage.removeItem('squadify_user_id');
    localStorage.removeItem('squadify_username');
    navigate('/');
  };

  if (loading) {
    return <div className="dashboard-loading">Chargement du profil...</div>;
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
          <p><strong>ID Utilisateur (MongoDB):</strong> <span>{userData.userId}</span></p>
        </div>

        <h2 className="dashboard-section-title">Token JWT (Sécurité)</h2>
        <div className="token-display">
            <p className="token-label">Le token est stocké pour les futures requêtes API.</p>
            <textarea
              readOnly
              value={userData.token || ''}
              className="token-area"
              rows={5}
            />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;