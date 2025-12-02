import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Gamepad2, Clock, Swords, User } from 'lucide-react';
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
  onSwipe?: (type: SwipeType) => void;
  isSwiping?: boolean;
}

const mapToLabel = (id: string | null | undefined, list: { id: string; label: string }[]) => {
  if (!id) return null;
  const found = list.find(item => item.id === id);
  return found ? found.label : id;
};

const mapIdsToLabels = (ids: string[] = [], list: { id: string; label: string }[]) =>
  ids.map(id => (list.find(item => item.id === id)?.label ?? id));

const ProfileCard: React.FC<ProfileCardProps> = ({ candidate }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { username, games, schedules, playStyle } = candidate;
  const gamesLabels = mapIdsToLabels(games, GAMES_LIST);
  const schedulesLabels = mapIdsToLabels(schedules, SCHEDULES_LIST);
  const playStyleLabel = mapToLabel(playStyle, PLAYSTYLES_LIST) ?? 'Non défini';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useLayoutEffect(() => {
      if (isOpen && contentRef.current && cardRef.current) {
        const mobileRect = cardRef.current.getBoundingClientRect();
        const targetRect = contentRef.current.getBoundingClientRect();
        const scaleX = mobileRect.width / targetRect.width;
        const scaleY = mobileRect.height / targetRect.height;
        const translateX = mobileRect.left - targetRect.left;
        const translateY = mobileRect.top - targetRect.top;

        contentRef.current.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        contentRef.current.style.transformOrigin = 'top left';

        requestAnimationFrame(() => {
          setIsAnimating(true);
          setShowDetails(true);

          if (contentRef.current) {
            contentRef.current.style.transform = '';
            contentRef.current.style.transformOrigin = '';
          }
        });
      }
    }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    if (!contentRef.current || !cardRef.current) {
      finishClose();
      return;
    }

    setShowDetails(false);
    setIsAnimating(false);

    const mobileRect = cardRef.current.getBoundingClientRect();
    const targetRect = contentRef.current.getBoundingClientRect();

    const scaleX = mobileRect.width / targetRect.width;
    const scaleY = mobileRect.height / targetRect.height;
    const translateX = mobileRect.left - targetRect.left;
    const translateY = mobileRect.top - targetRect.top;

    contentRef.current.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
    contentRef.current.style.transformOrigin = 'top left';
    contentRef.current.style.opacity = '0';

    setTimeout(() => {
      finishClose();
    }, 300);
  };

  const finishClose = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  const Preview = (
    <div
      ref={cardRef}
      className={`profile-card-root preview ${isOpen ? 'invisible' : ''}`}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
    >
      <div className="profile-card-inner">
        <div className="card-header">
          <h2 className="username">{username}</h2>
          <div className="avatar"><User size={56} strokeWidth={1.5} /></div>
        </div>
        <div className="card-section">
          <h3 className="section-title"><Gamepad2 size={18} /> Jeux en commun :</h3>
          <div className="chips">{gamesLabels.map((g, i) => <span key={i} className="chip">{g}</span>)}</div>
        </div>
      </div>
    </div>
  );

  const Overlay = isOpen ? ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className={`zoom-overlay ${isAnimating ? 'active' : ''}`}
      onMouseDown={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div
        ref={contentRef}
        className="zoom-clone"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="profile-close-btn" onClick={handleClose}><X size={20} /></button>

        <div className="profile-card-inner expanded-content">
          <div className="card-header">
            <h2 className="username">{username}</h2>
            <div className="avatar large"><User size={72} strokeWidth={1.5} /></div>
          </div>

          <div className="card-section">
            <h3 className="section-title"><Gamepad2 size={18} /> Jeux en commun :</h3>
            <div className="chips">{gamesLabels.map((g, i) => <span key={i} className="chip">{g}</span>)}</div>
          </div>

          <div className={`card-divider ${showDetails ? 'visible' : ''}`} />

          <div className={`card-details ${showDetails ? 'show' : ''}`}>
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
    </div>,
    document.body
  ) : null;

  return (
    <>
      {Preview}
      {Overlay}
    </>
  );
};

export default ProfileCard;