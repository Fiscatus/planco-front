import { type ReactNode, useEffect, useRef, useState } from 'react';

import { AuthContext } from '@/contexts';
import type { AuthResponse, LoginDto, RegisterDto, User } from '@/globals/types';
import { api } from '@/services';
import parseJwtToJson from '@/utils/parseJwtToJson';
import { registerUserUpdatedHandler, unregisterUserUpdatedHandler, reconnectSSE } from '@/hooks/useNotificationSSE';

const authApiPath = '/auth';
const localStorageUserKey = '@planco:user';

type Props = {
  children: ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | undefined>();
  const [hasOrganization, setHasOrganization] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    setHasOrganization(user && user.org !== null);
    setIsOrgAdmin(user?.role?.permissions?.includes('admin'));
    setIsPlatformAdmin(user?.isPlatformAdmin);
  }, [user]);

  const signUp = async (registerData: RegisterDto): Promise<AuthResponse> => {
    const { data } = await api.post(`${authApiPath}/register`, registerData);
    return data;
  };

  const signIn = async (credentials: LoginDto): Promise<AuthResponse> => {
    const { data } = await api.post(`${authApiPath}/login`, credentials);
    if (data.access_token) {
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
      localStorage.setItem(localStorageUserKey, JSON.stringify(data));

      const decodedJwt = parseJwtToJson(data.access_token);
      if (decodedJwt) {
        const baseUser = {
          _id: decodedJwt.sub,
          firstName: decodedJwt.firstName,
          lastName: decodedJwt.lastName,
          email: decodedJwt.email,
          isPlatformAdmin: decodedJwt.isPlatformAdmin,
          org: decodedJwt.org,
          role: decodedJwt.role,
          departments: decodedJwt.departments
        };
        setUser(baseUser);
        setHasOrganization(decodedJwt.org !== null);
        // Buscar perfil completo para obter avatarUrl
        api.get('/users/me').then(res => setUser({ ...baseUser, ...res.data })).catch(() => {});
        // Reconectar SSE com o novo token
        reconnectSSE();
      }
    }
    return data;
  };

  const signOut = async () => {
    api.defaults.headers.common.Authorization = undefined;
    localStorage.removeItem(localStorageUserKey);
    setUser(undefined);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...partial } : prev);
  };

  const refreshToken = async (): Promise<AuthResponse> => {
    const { data } = await api.post(`${authApiPath}/refresh`);
    if (data.access_token) {
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
      localStorage.setItem(localStorageUserKey, JSON.stringify(data));

      const decodedJwt = parseJwtToJson(data.access_token);
      if (decodedJwt) {
        const baseUser = {
          _id: decodedJwt.sub,
          firstName: decodedJwt.firstName,
          lastName: decodedJwt.lastName,
          email: decodedJwt.email,
          isPlatformAdmin: decodedJwt.isPlatformAdmin,
          org: decodedJwt.org,
          role: decodedJwt.role,
          departments: decodedJwt.departments
        };
        setUser(baseUser);
        setHasOrganization(decodedJwt.org !== null);
        api.get('/users/me').then(res => setUser({ ...baseUser, ...res.data })).catch(() => {});
      }
    }
    return data;
  };

  // Registrar handler para USER_UPDATED via SSE
  // Usa ref para garantir que sempre chama a versão mais recente de refreshToken
  const refreshTokenRef = useRef(refreshToken);
  refreshTokenRef.current = refreshToken;

  useEffect(() => {
    registerUserUpdatedHandler(() => refreshTokenRef.current().catch(() => {}));
    return () => unregisterUserUpdatedHandler();
  }, []);

  const loadUserFromLocalStorage = () => {
    if (localStorage.getItem(localStorageUserKey)) {
      const localStorageUser = JSON.parse(String(localStorage.getItem(localStorageUserKey)));
      verifyAuth(localStorageUser.access_token);
      if (!user && localStorageUser.access_token) {
        const decodedJwt = parseJwtToJson(localStorageUser.access_token);
        if (decodedJwt) {
          const baseUser = {
            _id: decodedJwt.sub,
            firstName: decodedJwt.firstName,
            lastName: decodedJwt.lastName,
            email: decodedJwt.email,
            isPlatformAdmin: decodedJwt.isPlatformAdmin,
            org: decodedJwt.org,
            role: decodedJwt.role,
            departments: decodedJwt.departments
          };
          setUser(baseUser);
          setHasOrganization(decodedJwt.org !== null);
          api.defaults.headers.common.Authorization = `Bearer ${localStorageUser.access_token}`;
          // Buscar perfil completo para obter avatarUrl
          api.get('/users/me').then(res => setUser({ ...baseUser, ...res.data })).catch(() => {});
        }
      }
    }
  };

  const verifyAuth = (accessToken: string) => {
    const decodedJwt = parseJwtToJson(accessToken);
    if (decodedJwt.exp * 1000 < Date.now()) {
      signOut();
      localStorage.removeItem(localStorageUserKey);
    }
  };

  loadUserFromLocalStorage();

  return (
    <AuthContext.Provider
      value={{ user, signUp, signIn, signOut, refreshToken, updateUser, hasOrganization, isOrgAdmin, isPlatformAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
