import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth/login');
  };

  const handleRegister = () => {
    navigate('/auth/register');
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-primaryBlue-500">Bienvenue sur Squadify</h1>
        <p className="text-lg text-gray-700 max-w-prose">
          Squadify : votre plateforme pour trouver des coéquipiers, former des groupes, et faire grandir vos projets ensemble.
        </p>
        <div className="flex gap-4">
          <button className="btn btnPrimary" onClick={handleLogin}>
            Connexion
          </button>
          <button className="btn btnSecondary" onClick={handleRegister}>
            Inscription
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
