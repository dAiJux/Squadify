import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireSetup?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireSetup = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const setupCompleted = useSelector((state: RootState) => state.user.data?.setupCompleted);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (requireSetup && !setupCompleted) {
      if (location.pathname !== '/setup') {
        navigate('/setup');
      }
    }

    if (location.pathname === '/setup' && setupCompleted) {
        navigate('/dashboard');
    }

  }, [isAuthenticated, setupCompleted, requireSetup, navigate, location]);

  if (!isAuthenticated) return null;
  if (requireSetup && !setupCompleted) return null;
  if (location.pathname === '/setup' && setupCompleted) return null;

  return <>{children}</>;
};

export default AuthGuard;