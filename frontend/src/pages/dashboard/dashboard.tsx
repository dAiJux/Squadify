import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { clearUserData } from '../../store/user';
import { setProfileData, clearProfileData } from '../../store/profile';
import { GAMES_LIST, SCHEDULES_LIST, PLAYSTYLES_LIST } from '../../data/gameOptions';
import './dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const userData = useSelector((state: RootState) => state.user.data);
  const token = useSelector((state: RootState) => state.user.token);
  const profileData = useSelector((state: RootState) => state.profile.data);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (isAuthenticated && userData?.setupCompleted && !profileData && token) {
        fetch(`/api/profiles/${userData.userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Erreur fetch profil");
        })
        .then(data => {
            dispatch(setProfileData(data));
        })
        .catch(err => console.error(err));
    }

  }, [isAuthenticated, userData, profileData, token, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(clearUserData());
    dispatch(clearProfileData());
    localStorage.removeItem('squadify_token');
    localStorage.removeItem('squadify_user_data');
    navigate('/');
  };

  if (!isAuthenticated || !userData) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  const getGameLabel = (id: string) => GAMES_LIST.find(g => g.id === id)?.label || id;
  const getScheduleLabel = (id: string) => SCHEDULES_LIST.find(s => s.id === id)?.label || id;
  const getStyleLabel = (id: string | null) => PLAYSTYLES_LIST.find(s => s.id === id)?.label || 'Non défini';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Bienvenue sur votre Espace Squadify, {userData.username} !</h1>
        <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
      </header>
      <main className="dashboard-content">
        <h2 className="dashboard-section-title">Vos Informations</h2>
        <div className="info-card">
          <p><strong>Pseudo:</strong> <span>{userData.username}</span></p>
          <p><strong>Email:</strong> <span>{userData.email}</span></p>
        </div>
        {profileData && (
            <>
                <h2 className="dashboard-section-title">Votre Profil Joueur</h2>
                <div className="info-card">
                    <div className="mb-4">
                        <strong>Jeux favoris:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {profileData.games.map(gameId => (
                                <span key={gameId} className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                                    {getGameLabel(gameId)}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <strong>Disponibilités:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {profileData.schedules.map(scheduleId => (
                                <span key={scheduleId} className="px-3 py-1 bg-green-600 rounded-full text-sm">
                                    {getScheduleLabel(scheduleId)}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <strong>Style de jeu:</strong>
                        <span className="ml-2 px-3 py-1 bg-purple-600 rounded-full text-sm">
                            {getStyleLabel(profileData.playStyle)}
                        </span>
                    </div>
                </div>
            </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;