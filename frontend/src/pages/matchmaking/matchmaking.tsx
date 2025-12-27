import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '~/components/profileCard/profileCard';
import { Loader2, ZapOff, Heart, X as XIcon, MessageCircle, PartyPopper } from 'lucide-react';
import './matchmaking.css';

type SwipeType = 'LIKE' | 'PASS';

interface Candidate {
  profileId: string;
  userId: string;
  username: string;
  games: string[];
  schedules: string[];
  playStyle: string;
}

interface SwipeResponse {
  match: boolean;
  matchId?: string;
}

const Matchmaking = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeType | null>(null);
  const [matchPopup, setMatchPopup] = useState<{ show: boolean, username: string, matchId: string | null }>({ show: false, username: '', matchId: null });
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const currentCandidate = candidates[currentIndex];

  const fetchCandidates = useCallback(async (append = false, afterId?: string) => {
    if (!append) setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('limit', '20');
      if (afterId) params.append('afterId', afterId);

      const response = await fetch(`/api/matchmaking/candidates?${params.toString()}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data: Candidate[] = await response.json();

        if (data.length === 0) {
          setHasMore(false);
          if (!append) {
            setCandidates([]);
          }
        } else {
          if (append) {
            setCandidates(prev => [...prev, ...data]);
          } else {
            setCandidates(data);
            setCurrentIndex(0);
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        setError('Non autorisé. Veuillez vous reconnecter.');
      } else {
        setError('Impossible de charger les coéquipiers. Statut : ' + response.status);
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates(false);
  }, [fetchCandidates]);

  useEffect(() => {
    if (candidates.length > 0 && currentIndex === candidates.length - 5 && hasMore) {
      const last = candidates[candidates.length - 1];
      fetchCandidates(true, last?.profileId);
    }
  }, [currentIndex, candidates, hasMore, fetchCandidates]);

  const handleNextCandidate = useCallback(() => {
    setSwipeDirection(null);
    setIsSwiping(false);
    setCurrentIndex(prev => prev + 1);
  }, []);

  const doSwipe = useCallback(async (type: SwipeType) => {
    if (!currentCandidate || isSwiping) return;

    setIsSwiping(true);
    setSwipeDirection(type);

    const targetUserId = currentCandidate.userId;
    const targetUsername = currentCandidate.username;

    try {
      const res = await fetch('/api/matchmaking/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetUserId, type })
      });

      await new Promise(resolve => setTimeout(resolve, 400));

      if (res.ok) {
        const data: SwipeResponse = await res.json();

        if (data.match) {
          setMatchPopup({ show: true, username: targetUsername, matchId: data.matchId || null });
        } else {
          handleNextCandidate();
        }

      } else {
        console.error('Erreur lors de l\'envoi du swipe');
        handleNextCandidate();
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      handleNextCandidate();
    }
  }, [currentCandidate, isSwiping, handleNextCandidate]);

  const closeMatchPopup = () => {
    setMatchPopup({ show: false, username: '', matchId: null });
    handleNextCandidate();
  };

  const goToChat = () => {
    if (matchPopup.matchId) {
      navigate(`/chat/${matchPopup.matchId}`);
    } else {
      closeMatchPopup();
    }
  };

  if (isLoading && candidates.length === 0) {
    return (
      <div className="home-container matchmaking-empty-state">
        <div className="home-card">
          <Loader2 className="home-card-loader" size={36} />
          <p className="home-card-text">Recherche de coéquipiers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container matchmaking-empty-state">
        <div className="home-card">
          <ZapOff className="home-card-error-icon" size={36} />
          <h2 className="home-card-title-error">Erreur de Connexion</h2>
          <p className="home-card-text">{error}</p>
          <button className="btn btnPrimary mt-4" onClick={() => fetchCandidates(false)}>
            Tenter de recharger
          </button>
        </div>
      </div>
    );
  }

  if (!currentCandidate && isLoading) {
    return (
      <div className="home-container matchmaking-empty-state">
        <div className="home-card">
          <Loader2 className="home-card-loader" size={36} />
        </div>
      </div>
    );
  }

  if (!currentCandidate) {
    return (
      <div className="home-container matchmaking-empty-state">
        <div className="home-card anim-fade-in">
          <h2 className="home-card-title-teal">👋 C'est tout pour l'instant !</h2>
          <p className="home-card-text">Vous avez swipé tous les coéquipiers potentiels.</p>
          <button className="btn btnPrimary mt-4" onClick={() => fetchCandidates(false)}>
            Rechercher de nouveaux profils
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="matchmaking-main">
      {matchPopup.show && (
        <div className="match-popup-overlay">
          <div className="match-popup-content">
            <PartyPopper className="match-popup-icon" />
            <h2 className="match-popup-title">IT'S A MATCH !</h2>
            <p className="match-popup-text">
              Tu vas pouvoir jouer avec <span className="match-popup-username">{matchPopup.username}</span>.
            </p>
            <div className="match-popup-actions">
              <button className="match-popup-chat-btn" onClick={goToChat}>
                <MessageCircle size={20} />
                Envoyer un message
              </button>
              <button className="match-popup-continue-btn" onClick={closeMatchPopup}>
                Continuer à swiper
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="matchmaking-content">
        <div className="match-wrapper">
          {currentCandidate && (
            <div className={
              swipeDirection === 'PASS' ? 'swipe-exit-left' :
                swipeDirection === 'LIKE' ? 'swipe-exit-right' : ''
            }>
              <ProfileCard
                candidate={currentCandidate}
              />
            </div>
          )}
        </div>
        {currentCandidate && !matchPopup.show && (
          <div className="action-bar" role="toolbar" aria-label="Actions de swipe">
            <button
              className="action-btn action-pass"
              onClick={(e) => {
                e.stopPropagation();
                doSwipe('PASS');
              }}
              disabled={isSwiping}
              aria-label="Pass"
            >
              <XIcon size={18} />
            </button>
            <button
              className="action-btn action-like"
              onClick={(e) => {
                e.stopPropagation();
                doSwipe('LIKE');
              }}
              disabled={isSwiping}
              aria-label="Like"
            >
              <Heart size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matchmaking;