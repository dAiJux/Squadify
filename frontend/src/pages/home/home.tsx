import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Gamepad2, Headphones, Trophy, Swords, Target, Zap, Users, Shield } from 'lucide-react';
import './home.css';
import Auth from '../../components/auth/auth.tsx';

const Home = () => {
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const setupCompleted = useSelector((state: RootState) => state.user.data?.setupCompleted);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalTab, setModalTab] = React.useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isAuthenticated) {
      if (setupCompleted) {
        navigate('/matchmaking');
      } else {
        navigate('/setup');
      }
    }
  }, [isAuthenticated, setupCompleted, navigate]);

  const handleLogin = () => {
    setModalTab('login');
    setIsModalOpen(true);
  };

  const handleRegister = () => {
    setModalTab('register');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="home">
      <div className="home__bg-gradient" />
      <div className="home__glow-1" />
      <div className="home__glow-2" />
      <div className="home__floating-icons">
        <Gamepad2 className="home__float-icon home__float-icon--1" />
        <Headphones className="home__float-icon home__float-icon--2" />
        <Trophy className="home__float-icon home__float-icon--3" />
        <Swords className="home__float-icon home__float-icon--4" />
        <Target className="home__float-icon home__float-icon--5" />
        <Zap className="home__float-icon home__float-icon--6" />
        <Users className="home__float-icon home__float-icon--7" />
        <Shield className="home__float-icon home__float-icon--8" />
      </div>
      <div className="home__content">
        <div className="home__hero">
          <img src="/icons/squadify.png" alt="Squadify" className="home__logo" />
          <p className="home__subtitle">Trouvez vos coéquipiers parfaits</p>
        </div>
        <div className="home__card">
          <p className="home__description">
            La plateforme dédiée aux gamers qui veulent former l'équipe idéale.
            Parcourez des profils, trouvez des joueurs compatibles avec votre style,
            et lancez votre prochaine partie ensemble.
          </p>
          <div className="home__actions">
            <button className="home__btn home__btn--primary" onClick={handleLogin}>
              Connexion
            </button>
            <span className="home__divider">ou</span>
            <button className="home__btn home__btn--secondary" onClick={handleRegister}>
              Créer un compte
            </button>
          </div>
        </div>
      </div>
      <Auth isOpen={isModalOpen} onClose={handleCloseModal} initialTab={modalTab} />
    </div>
  );
};

export default Home;