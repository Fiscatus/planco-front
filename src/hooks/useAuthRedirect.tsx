import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.org) {
        navigate('/organization-home');
      } else {
        navigate('/invites');
      }
    }
  }, [user, navigate]);

  return { user };
};
