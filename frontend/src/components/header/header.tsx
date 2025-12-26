import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { User, Gamepad2, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import './header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s: RootState) => s.user.data);

  const isHome = location.pathname === '/';
  const isSetup = location.pathname === '/setup';
  const isMatchmaking = location.pathname === '/matchmaking';
  const isChat = location.pathname.startsWith('/chat');
  const isProfile = location.pathname === '/profile';

  const routePatterns = ['/', '/setup', '/matchmaking/*', '/chat', '/chat/*', '/profile'];
  const isKnownRoute = routePatterns.some((pattern) => !!matchPath(pattern, location.pathname));
  const isNotFound = !isKnownRoute;

  const showNav = !isHome && !isSetup && !isNotFound && user?.setupCompleted;

  if (isHome) return null;

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <div className="header__brand" onClick={() => navigate(user?.setupCompleted ? '/matchmaking' : '/')}>
            <img src="/SVGs/squadify_ico.svg" alt="Squadify" className="header__logo" />
            <span className="header__title">Squadify</span>
          </div>
        </div>
        {showNav && (
          <nav className="header__nav">
            <button
              onClick={() => navigate('/matchmaking')}
              className={`header__nav-link ${isMatchmaking ? 'header__nav-link--active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Matchmaking
              </span>
            </button>
            <button
              onClick={() => navigate('/chat')}
              className={`header__nav-link ${isChat ? 'header__nav-link--active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </span>
            </button>
          </nav>
        )}
        {showNav && (
          <div className="header__center">
            <button
              onClick={() => navigate('/matchmaking')}
              className={`header__icon-button ${isMatchmaking ? 'header__icon-button--active' : ''}`}
              aria-label="Matchmaking"
            >
              <Gamepad2 className="header__icon" />
            </button>
            <button
              onClick={() => navigate('/chat')}
              className={`header__icon-button ${isChat ? 'header__icon-button--active' : ''}`}
              aria-label="Messages"
            >
              <MessageSquare className="header__icon" />
            </button>
          </div>
        )}
        <div className="header__right">
          {showNav && (
            <button
              onClick={() => navigate('/profile')}
              className={`header__icon-button ${isProfile ? 'header__icon-button--active' : ''}`}
              aria-label="Profil"
            >
              {user?.username ? (
                <div className="header__avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="header__icon" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;