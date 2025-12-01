import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ProfileCard from '../../components/profileCard/profileCard';
import { Loader2, ZapOff } from 'lucide-react';
import { Heart, X as XIcon } from 'lucide-react';
import './matchmaking.css';

type SwipeType = 'LIKE' | 'PASS';

const Matchmaking: React.FC = () => {
  const userId = useSelector((state: RootState) => state.user.data?.userId);
  const token = useSelector((state: RootState) => state.user.token);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCandidate = candidates[currentIndex];

  const fetchCandidates = useCallback(async () => {
    if (!userId || !token) { setError('Utilisateur non authentifié.'); setIsLoading(false); return; }
    setIsLoading(true); setError(null);
    try {
      const response = await fetch(`/api/matchmaking/candidates/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setCurrentIndex(0);
      } else { setError('Impossible de charger les coéquipiers. Statut : ' + response.status); }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally { setIsLoading(false); }
  }, [userId, token]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const doSwipe = useCallback(async (type: SwipeType) => {
    if (!currentCandidate || isSwiping) return;
    setIsSwiping(true);
    const swipeData = { swiperId: userId, targetId: currentCandidate.userId, type };
    try {
      await fetch('/api/matchmaking/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(swipeData)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCurrentIndex(i => i + 1);
      setIsSwiping(false);
    }
  }, [currentCandidate, isSwiping, userId, token]);

  if (isLoading) return (
    <div className="home-container">
      <div className="home-card">
        <Loader2 className="animate-spin text-blue-500 mx-auto" size={36} />
        <p className="text-lg mt-4 text-gray-300">Recherche de coéquipiers...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="home-container">
      <div className="home-card">
        <ZapOff className="text-red-500 mx-auto" size={36} />
        <h2 className="text-2xl font-bold text-red-400 mt-4">Erreur de Connexion</h2>
        <p className="home-card-text">{error}</p>
        <button className="btn btnPrimary mt-4" onClick={fetchCandidates}>Tenter de recharger</button>
      </div>
    </div>
  );

  if (!currentCandidate) return (
    <div className="home-container">
      <div className="home-card">
        <h2 className="text-2xl font-bold text-teal-400">👋 C'est tout pour l'instant !</h2>
        <p className="home-card-text">Vous avez swipé tous les coéquipiers potentiels.</p>
        <button className="btn btnPrimary mt-4" onClick={fetchCandidates}>Rechercher de nouveaux profils</button>
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <div className="match-wrapper">
        <ProfileCard candidate={currentCandidate} onSwipe={() => {}} isSwiping={isSwiping} />
      </div>
      <div className="action-bar" role="toolbar" aria-label="Actions de swipe">
        <button
          className="action-btn action-pass"
          onClick={(e) => { e.stopPropagation(); doSwipe('PASS'); }}
          disabled={isSwiping}
          aria-label="Pass"
        >
          <XIcon size={18} />
        </button>
        <button
          className="action-btn action-like"
          onClick={(e) => { e.stopPropagation(); doSwipe('LIKE'); }}
          disabled={isSwiping}
          aria-label="Like"
        >
          <Heart size={18} />
        </button>
      </div>
    </div>
  );
};

export default Matchmaking;
