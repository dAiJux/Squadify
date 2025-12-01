import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, X, Gamepad2, Clock, Swords, User } from 'lucide-react';
import './profileCard.css';
import { GAMES_LIST, SCHEDULES_LIST, PLAYSTYLES_LIST } from '../../data/gameOptions';

interface ProfileResponse {
  userId: string;
  username: string;
  games: string[];
  schedules: string[];
  playStyle: string;
}

type SwipeType = 'LIKE' | 'PASS';

interface ProfileCardProps {
  candidate: ProfileResponse;
  onSwipe: (type: SwipeType) => void;
  isSwiping: boolean;
}

const mapToLabel = (id: string | null | undefined, list: { id: string; label: string }[]) => {
  if (!id) return null;
  const found = list.find(item => item.id === id);
  return found ? found.label : id;
};

const mapIdsToLabels = (ids: string[] = [], list: { id: string; label: string }[]) =>
  ids.map(id => (list.find(item => item.id === id)?.label ?? id));

const ProfileCard: React.FC<ProfileCardProps> = ({ candidate, onSwipe, isSwiping }) => {
  const [expanded, setExpanded] = useState(false);
  const [enableScroll, setEnableScroll] = useState(false);
  const expandTimeoutRef = useRef<number | null>(null);

  const { username, games, schedules, playStyle } = candidate;

  const gamesLabels = mapIdsToLabels(games, GAMES_LIST);
  const schedulesLabels = mapIdsToLabels(schedules, SCHEDULES_LIST);
  const playStyleLabel = mapToLabel(playStyle, PLAYSTYLES_LIST) ?? 'Non défini';

  const toggleExpand = () => {
    const willExpand = !expanded;
    setExpanded(willExpand);
    setEnableScroll(false);
    if (expandTimeoutRef.current) window.clearTimeout(expandTimeoutRef.current);
    expandTimeoutRef.current = window.setTimeout(() => {
      setEnableScroll(willExpand);
      expandTimeoutRef.current = null;
    }, 320);
  };

  useEffect(() => {
    return () => { if (expandTimeoutRef.current) window.clearTimeout(expandTimeoutRef.current); };
  }, []);

  return (
    <div
      className={`profile-card-root ${expanded ? 'expanded' : ''}`}
      onClick={toggleExpand}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(); } }}
    >
      <div className="profile-card-inner">
        <div className="card-header">
          <h2 className="username">{username}</h2>
          <div className="avatar">
            <User size={56} strokeWidth={1.5} />
          </div>
        </div>

        <div className="card-section">
          <h3 className="section-title"><Gamepad2 size={18} /> Jeux en commun :</h3>
          <div className="chips">
            {gamesLabels.map((g, i) => <span key={i} className="chip">{g}</span>)}
          </div>
        </div>

        <div className="card-divider" />

        <div className={`card-details ${enableScroll ? 'enable-scroll' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div>
            <h4 className="detail-title"><Clock size={16} /> Disponibilités :</h4>
            <ul className="detail-list">{schedulesLabels.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>

          <div>
            <h4 className="detail-title"><Swords size={16} /> Style de jeu :</h4>
            <p className="detail-text">{playStyleLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
