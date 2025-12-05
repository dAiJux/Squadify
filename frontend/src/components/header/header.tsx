import React from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { MessageSquare, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import './header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s: RootState) => s.user.data);

  const isHome = location.pathname === '/';
  const isSetup = location.pathname === '/setup';

  const routePatterns = ['/', '/setup', '/matchmaking/*', '/chat', '/profile/*', '/profile'];
  const isKnownRoute = routePatterns.some((pattern) => !!matchPath(pattern, location.pathname));
  const isNotFound = !isKnownRoute;
  const logoSrc = isHome ? '/icons/squadify.png' : '/SVGs/squadify_ico.svg';

  return (
    <header className="header">
      <div className={`header__container ${isHome ? 'header__container--home' : ''}`}>
        <div className="header__left">
          <a
            href="https://github.com/dAiJux/Squadify"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Voir le code sur GitHub"
            className="header__icon-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" className="header__icon" fill="currentColor" aria-hidden="true">
              <title>GitHub</title>
              <path d="M12 0.297C5.37 0.297 0 5.667 0 12.297c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.774.418-1.305.76-1.605-2.665-.303-5.466-1.333-5.466-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.536-1.524.116-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.046.138 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.241 2.874.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.804 5.624-5.476 5.92.43.372.814 1.103.814 2.222 0 1.604-.015 2.897-.015 3.293 0 .32.217.694.825.576C20.565 22.092 24 17.597 24 12.297 24 5.667 18.627.297 12 .297z" />
            </svg>
          </a>
        </div>
        <div className="header__center" onClick={() => navigate('/')}>
          <img src={logoSrc} alt="Squadify" className={`header__logo ${isHome ? 'header__logo--home' : ''}`} />
        </div>
        {!isHome && !isSetup && !isNotFound && (
          <div className="header__right">
            <button
              type="button"
              aria-label="Discussions"
              onClick={() => navigate('/chat')}
              className="header__icon-button"
            >
              <MessageSquare className="header__icon" />
            </button>
            <button
              type="button"
              aria-label="Profil"
              onClick={() => navigate('/profile')}
              className="header__icon-button header__profile-btn"
            >
              <User className="header__icon" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
