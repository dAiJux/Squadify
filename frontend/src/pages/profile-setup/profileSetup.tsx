import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { completeSetup } from '../../store/user';
import { setProfileData } from '../../store/profile';
import { GAMES_LIST, SCHEDULES_LIST, PLAYSTYLES_LIST } from '../../data/gameOptions';
import './profileSetup.css';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.user.data?.userId);

  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSelection = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleFinish = async () => {
    if (!userId) {
      console.error("Utilisateur non identifié");
      return;
    }

    setIsSaving(true);

    const profileData = {
      games: selectedGames,
      schedules: selectedSchedules,
      playStyle: selectedStyle
    };

    try {
      const response = await fetch('/api/profiles/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        dispatch(completeSetup());
        dispatch(setProfileData(profileData));
        navigate('/matchmaking');
      } else {
        console.error("Erreur lors de la sauvegarde du profil");
      }
    } catch (error) {
      console.error("Erreur de connexion au serveur", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1 className="setup-title">Initialisation du Profil</h1>
        <p className="setup-subtitle">Configure ton profil de joueur pour trouver ta Squad.</p>
        <div className="setup-section">
          <h2 className="section-title">Tes jeux principaux</h2>
          <div className="options-grid">
            {GAMES_LIST.map(game => (
              <div
                key={game.id}
                className={`option-card ${selectedGames.includes(game.id) ? 'selected' : ''}`}
                onClick={() => toggleSelection(game.id, selectedGames, setSelectedGames)}
              >
                {game.label}
              </div>
            ))}
          </div>
        </div>
        <div className="setup-section">
          <h2 className="section-title">Tes disponibilités</h2>
          <div className="options-grid">
            {SCHEDULES_LIST.map(schedule => (
              <div
                key={schedule.id}
                className={`option-card ${selectedSchedules.includes(schedule.id) ? 'selected' : ''}`}
                onClick={() => toggleSelection(schedule.id, selectedSchedules, setSelectedSchedules)}
              >
                {schedule.label}
              </div>
            ))}
          </div>
        </div>
        <div className="setup-section">
          <h2 className="section-title">Ton style de jeu</h2>
          <div className="options-grid">
            {PLAYSTYLES_LIST.map(style => (
              <div
                key={style.id}
                className={`option-card ${selectedStyle === style.id ? 'selected' : ''}`}
                onClick={() => setSelectedStyle(style.id)}
              >
                {style.label}
              </div>
            ))}
          </div>
        </div>
        <div className="setup-footer">
          <button
            className="finish-btn"
            onClick={handleFinish}
            disabled={isSaving}
          >
            {isSaving ? 'Sauvegarde...' : 'Valider mon profil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;