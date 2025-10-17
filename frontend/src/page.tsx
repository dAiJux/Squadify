import { useState, useEffect } from 'react';

export default function Page() {
  const [message, setMessage] = useState('Chargement...');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hello');
        const textData = await res.text();
        setMessage(textData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setMessage("Impossible de charger le message.");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>{message}</h1>
      </main>
    </div>
  );
}