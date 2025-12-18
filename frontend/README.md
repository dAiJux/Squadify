# ⚛️ Squadify - Frontend

Ce répertoire contient l'interface utilisateur de l'application Squadify, développée avec React et optimisée pour l'architecture full-stack du projet.

## 🛠️ Technologies Clés

* **Framework :** [React 18](https://reactjs.org/)
* **Build Tool :** [Vite](https://vitejs.dev/)
* **Routage :** [React Router](https://reactrouter.com/en/main)
* **Styling :** [Tailwind CSS](https://tailwindcss.com/)
* **Langage :** TypeScript

## 🚀 Démarrage du Frontend (Contexte Full-Stack)

Pour lancer le frontend en conjonction avec le backend (Spring Boot, MongoDB, Kafka), veuillez utiliser la procédure de lancement globale du projet :

1.  **Assurez-vous d'être à la racine du projet** (`/squadify`).
2.  **Lancez l'intégralité de l'application via Docker Compose :**
    ```bash
    docker-compose up -d
    ```
3.  Le frontend sera accessible sur **`http://localhost:8080`** (ou le port configuré pour le backend/proxy).

*Consultez le `README.md` principal pour les instructions complètes.*

## ⚙️ Démarrage Local Indépendant (Développement Frontend seul)

Si vous souhaitez développer uniquement le frontend et utiliser un mock de l'API ou un backend en cours d'exécution séparément :

### Prérequis

* Node.js (version 18+)
* npm ou yarn

### Étapes

1.  **Installation des dépendances :**
    ```bash
    npm install
    # ou yarn install
    ```

2.  **Lancement du serveur de développement (Vite) :**
    ```bash
    npm run dev
    # ou yarn dev
    ```

## 💡 Remarques sur le Style

Ce projet utilise [Tailwind CSS](https://tailwindcss.com/). Le fichier de configuration principal est `tailwind.config.ts`.