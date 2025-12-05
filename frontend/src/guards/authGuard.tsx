import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requireSetup?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireSetup = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setSetupCompleted(data.setupCompleted);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/');
        return;
      }
      if (requireSetup && !setupCompleted && location.pathname !== '/setup') {
        navigate('/setup');
      }
      if (location.pathname === '/setup' && setupCompleted) {
        navigate('/matchmaking');
      }
    }
  }, [loading, isAuthenticated, setupCompleted, requireSetup, navigate, location]);

  if (loading || !isAuthenticated) return null;
  if (requireSetup && !setupCompleted) return null;
  if (location.pathname === '/setup' && setupCompleted) return null;

  return <>{children}</>;
};

export default AuthGuard;