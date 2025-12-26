import { useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface AuthGuardProps {
  children: ReactNode;
  requireSetup?: boolean;
}

const AuthGuard = ({ children, requireSetup = true }: AuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const setupCompleted = useSelector((state: RootState) => state.user.data?.setupCompleted ?? false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (requireSetup && !setupCompleted && location.pathname !== '/setup') {
      navigate('/setup');
      return;
    }

    if (location.pathname === '/setup' && setupCompleted) {
      navigate('/matchmaking');
    }
  }, [isAuthenticated, setupCompleted, requireSetup, navigate, location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  if (requireSetup && !setupCompleted) {
    return null;
  }

  if (location.pathname === '/setup' && setupCompleted) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;