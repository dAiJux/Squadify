import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './legal.css';

const Legal = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <Link to="/" className="legal-back">
                    <ArrowLeft size={18} />
                    <span>Retour à l'accueil</span>
                </Link>
                <h1 className="legal-title">Mentions Légales</h1>
                <p className="legal-updated">Dernière mise à jour : 26 décembre 2025</p>
                <section className="legal-section">
                    <h2>1. Présentation du projet</h2>
                    <p>
                        <strong>Squadify</strong> est un projet personnel à but non commercial, développé dans le cadre
                        d'un apprentissage et d'une démonstration de compétences en développement web.
                    </p>
                    <p>
                        Ce site n'a pas vocation à générer des revenus et ne propose aucun service payant.
                    </p>
                </section>
                <section className="legal-section">
                    <h2>2. Éditeur du site</h2>
                    <p>
                        Ce projet est développé et maintenu par un développeur indépendant dans un cadre personnel et éducatif.
                    </p>
                    <p>
                        Pour toute question relative au projet, vous pouvez utiliser les liens de contact disponibles sur le site
                        (GitHub, LinkedIn).
                    </p>
                </section>
                <section className="legal-section">
                    <h2>3. Hébergement</h2>
                    <p>
                        Ce projet est un projet personnel qui peut être hébergé sur différentes plateformes selon les besoins
                        de démonstration. Aucune garantie de disponibilité permanente n'est fournie.
                    </p>
                </section>
                <section className="legal-section">
                    <h2>4. Propriété intellectuelle</h2>
                    <p>
                        Le code source de Squadify est disponible publiquement sur GitHub sous licence open source.
                    </p>
                    <p>
                        Les icônes utilisées proviennent de la bibliothèque <strong>Lucide Icons</strong> (licence ISC).
                    </p>
                    <p>
                        Les noms de jeux vidéo mentionnés dans l'application appartiennent à leurs éditeurs respectifs
                        et sont utilisés uniquement à titre informatif.
                    </p>
                </section>
                <section className="legal-section">
                    <h2>5. Protection des données personnelles</h2>
                    <p>
                        Dans le cadre de l'utilisation de Squadify, les données suivantes peuvent être collectées :
                    </p>
                    <ul>
                        <li>Nom d'utilisateur (pseudonyme)</li>
                        <li>Adresse email</li>
                        <li>Préférences de jeu (jeux, horaires, style de jeu)</li>
                        <li>Messages échangés avec d'autres utilisateurs</li>
                    </ul>
                    <p>
                        Ces données sont utilisées uniquement pour le fonctionnement du service et ne sont
                        en aucun cas vendues ou partagées avec des tiers.
                    </p>
                    <p>
                        Les mots de passe sont stockés de manière sécurisée (hashage) et ne sont jamais accessibles en clair.
                    </p>
                </section>
                <section className="legal-section">
                    <h2>6. Vos droits</h2>
                    <p>
                        Conformément à la réglementation applicable, vous disposez des droits suivants sur vos données :
                    </p>
                    <ul>
                        <li><strong>Droit d'accès :</strong> consulter vos données via votre profil</li>
                        <li><strong>Droit de rectification :</strong> modifier vos informations à tout moment</li>
                        <li><strong>Droit de suppression :</strong> supprimer votre compte et toutes les données associées</li>
                    </ul>
                    <p>
                        La suppression du compte peut être effectuée directement depuis la page de profil.
                    </p>
                </section>
                <section className="legal-section">
                    <h2>7. Cookies</h2>
                    <p>
                        Squadify utilise uniquement des cookies techniques essentiels au fonctionnement du service :
                    </p>
                    <ul>
                        <li><strong>Cookie d'authentification :</strong> permet de maintenir votre session connectée</li>
                    </ul>
                    <p>
                        Aucun cookie publicitaire ou de tracking n'est utilisé.
                    </p>
                </section>
                <section className="legal-section">
                    <h2>8. Limitation de responsabilité</h2>
                    <p>
                        Squadify étant un projet personnel à but démonstratif :
                    </p>
                    <ul>
                        <li>Aucune garantie de disponibilité ou de pérennité du service n'est fournie</li>
                        <li>Les données peuvent être réinitialisées à tout moment</li>
                        <li>L'éditeur ne peut être tenu responsable des échanges entre utilisateurs</li>
                    </ul>
                </section>
                <section className="legal-section">
                    <h2>9. Comportement des utilisateurs</h2>
                    <p>
                        En utilisant Squadify, vous vous engagez à :
                    </p>
                    <ul>
                        <li>Respecter les autres utilisateurs</li>
                        <li>Ne pas publier de contenu illicite, offensant ou inapproprié</li>
                        <li>Ne pas usurper l'identité d'autrui</li>
                        <li>Ne pas tenter de compromettre la sécurité du service</li>
                    </ul>
                </section>
                <section className="legal-section">
                    <h2>10. Contact</h2>
                    <p>
                        Pour toute question concernant ces mentions légales ou le projet Squadify,
                        vous pouvez me contacter via les liens disponibles en bas de page (GitHub, LinkedIn).
                    </p>
                </section>
                <div className="legal-footer">
                    <p>© {new Date().getFullYear()} Squadify</p>
                </div>
            </div>
        </div>
    );
};

export default Legal;
