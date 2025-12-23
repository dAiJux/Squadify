import React from 'react';
import { useLocation } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';
import './footer.css';

const Footer: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isMatchmaking = location.pathname === '/matchmaking';

    if (!isHome && !isMatchmaking) return null;

    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__links">
                    <a
                        href="https://github.com/dAiJux/Squadify"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer__icon-link"
                        aria-label="GitHub"
                    >
                        <Github className="footer__icon" />
                    </a>
                    <a
                        href="https://linkedin.com/in/arthur-joye-545910225"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer__icon-link footer__linkedin"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="footer__icon" />
                    </a>
                </div>
                <a href="/mentions-legales" className="footer__legal">
                    Mentions légales
                </a>
                <div className="footer__spacer" />
            </div>
        </footer>
    );
};

export default Footer;
