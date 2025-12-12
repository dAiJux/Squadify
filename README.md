# 🏆 Squadify

<div style="text-align: center;">
    <img src="frontend/public/icons/squadify.png" alt="Logo de l'application Squadify" width="250"/>
</div>

> Application full-stack pour trouver ses futurs coéquipiers pour des jeux vidéos, développée avec React, Spring Boot et architecture événementielle.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)

## 📋 À propos

Squadify est une application de démonstration développée en solo pour illustrer mes compétences en développement full-stack moderne. Le concept s'inspire des applications de rencontre, mais appliqué à la recherche de coéquipiers pour les jeux vidéos.

## ✨ Fonctionnalités

- 🔐 **Authentification complète** : inscription, connexion avec JWT
- 👤 **Gestion de profil** : création et modification de profils utilisateurs
- 👥 **Matchmaking** : système de swipe pour matcher avec des équipes ou projets
- 💬 **Messagerie temps réel** : communication entre membres d'équipe
- 🔔 **Notifications** : système d'événements asynchrone avec Kafka

## 🛠️ Technologies utilisées

### Backend
- **Java 21** avec **Spring Boot 3.x**
- **Spring Security** + **JWT** pour l'authentification
- **Spring Data MongoDB** pour la persistance
- **Apache Kafka** pour la messagerie événementielle
- **Maven** pour la gestion des dépendances

### Frontend
- **React 18** avec hooks modernes
- **Vite** pour un build rapide
- **React Router** pour la navigation
- **Tailwind** pour l'interface responsive et moderne

### Infrastructure
- **MongoDB** : base de données NoSQL
- **Apache Kafka** : message broker pour l'architecture événementielle
- **Docker & Docker Compose** : containerisation complète
- **Multi-stage build** : images Docker optimisées

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   React + Vite  │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐     ┌──────────────┐
│   Backend       │────▶│   MongoDB    │
│   Spring Boot   │     │              │
│   + JWT Auth    │     └──────────────┘
└────────┬────────┘
         │ Events
         ▼
    ┌─────────┐
    │  Kafka  │
    └─────────┘
```

L'application suit une architecture événementielle pour le chat en temps réel et les notifications : les événements pertinents sont publiés dans Kafka et traités de manière asynchrone par des consumers dédiés.

## 🚀 Installation et lancement

### Prérequis

- [Docker](https://www.docker.com/get-started) et Docker Compose installés
- Aucune autre installation nécessaire !

### Étapes

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/squadify.git
   cd squadify
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```

3. **Générer une clé JWT sécurisée**

   **Linux/Mac :**
   ```bash
   openssl rand -base64 64
   ```

   **Windows (PowerShell) :**
   ```powershell
   [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

   Copiez le résultat et remplacez `<your-secret-key-here-min-256-bits>` dans le fichier `.env`

4. **Lancer l'application**
   ```bash
   docker-compose up -d
   ```

5. **Vérifier que tout fonctionne**
   ```bash
   docker-compose logs -f squadify-app
   ```

🎉 **L'application est accessible sur http://localhost:8080**

### Commandes utiles

```bash
# Voir l'état des conteneurs
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Arrêter et supprimer les données
docker-compose down -v
```

## 📝 Variables d'environnement

Le fichier `.env` contient toutes les configurations nécessaires :

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `MONGO_USERNAME` | Utilisateur MongoDB | `admin` |
| `MONGO_PASSWORD` | Mot de passe MongoDB | `<changeme123>` |
| `MONGO_DB_NAME` | Nom de la base de données | `squadify-db` |
| `MONGO_HOST` | Hôte MongoDB | `mongodb` |
| `MONGO_PORT` | Port MongoDB | `27017` |
| `JWT_SECRET` | Clé de signature JWT | À générer |

> ⚠️ Note : N'oubliez pas de générer votre propre JWT_SECRET et de modifier le mot de passe par défaut de MongoDB (MONGO_PASSWORD) !

## 🎯 Objectifs du projet

Ce projet a été développé pour démontrer :

- ✅ Maîtrise du **développement full-stack** (frontend + backend)
- ✅ Compétences en **architecture microservices** et événementielle
- ✅ Bonnes pratiques de **sécurité** (JWT, variables d'environnement)
- ✅ Utilisation de **Docker** pour la containerisation
- ✅ Gestion de **bases de données NoSQL** (MongoDB)
- ✅ Implémentation de **systèmes de messagerie** asynchrones (Kafka)
- ✅ Développement d'**interfaces modernes** avec React

## 📄 Licence

Ce projet est distribué sous la licence **Creative Commons Attribution - Pas d’Utilisation Commerciale - Pas de Modification $4.0$ International (CC BY-NC-ND 4.0)**.

Cela signifie que :
- Vous êtes libre de cloner et partager le code tel quel.
- Vous devez créditer l'auteur (Arthur Joye).
- L'utilisation commerciale de ce code sans permission explicite est interdite.
- La modification ou l'adaptation du code est interdite.

Si vous souhaitez suggérer des modifications, veuillez passer par un Pull Request sur GitHub afin qu'elles puissent être examinées et validées par l'auteur pour une intégration dans le dépôt officiel.

Pour plus d'informations et les termes légaux complets, veuillez consulter le fichier LICENSE à la racine du projet.

## 👤 Contact

- 💼 LinkedIn : [Arthur Joye](https://www.linkedin.com/in/arthur-joye-545910225)
- 🐙 GitHub : [dAiJux](https://github.com/dAiJux)

---

💡 **Développé en solo pour démontrer mes compétences en développement full-stack**

⭐ N'hésitez pas à me contacter pour toute question !