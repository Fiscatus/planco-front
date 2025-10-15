import { type ReactNode, useEffect, useState } from 'react';

import { AuthContext } from '@/contexts';
import type { AuthResponse, LoginDto, RegisterDto, User } from '@/globals/types';
import { api } from '@/services';
import parseJwtToJson from '@/utils/parseJwtToJson';

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
        setUser({
          _id: decodedJwt.sub,
          firstName: decodedJwt.firstName,
          lastName: decodedJwt.lastName,
          email: decodedJwt.email,
          isPlatformAdmin: decodedJwt.isPlatformAdmin,
          org: decodedJwt.org,
          role: decodedJwt.role
        });
        setHasOrganization(decodedJwt.org !== null);
      }
    }
    return data;
  };

  const signOut = async () => {
    api.defaults.headers.common.Authorization = undefined;
    localStorage.removeItem(localStorageUserKey);
    setUser(undefined);
  };

  const refreshToken = async (): Promise<AuthResponse> => {
    const { data } = await api.post(`${authApiPath}/refresh`);
    if (data.access_token) {
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
      localStorage.setItem(localStorageUserKey, JSON.stringify(data));

      const decodedJwt = parseJwtToJson(data.access_token);
      if (decodedJwt) {
        setUser({
          _id: decodedJwt.sub,
          firstName: decodedJwt.firstName,
          lastName: decodedJwt.lastName,
          email: decodedJwt.email,
          isPlatformAdmin: decodedJwt.isPlatformAdmin,
          org: decodedJwt.org,
          role: decodedJwt.role,
          departments: decodedJwt.departments
        });
        setHasOrganization(decodedJwt.org !== null);
      }
    }
    return data;
  };

  const loadUserFromLocalStorage = () => {
    if (localStorage.getItem(localStorageUserKey)) {
      const localStorageUser = JSON.parse(String(localStorage.getItem(localStorageUserKey)));
      verifyAuth(localStorageUser.access_token);
      if (!user && localStorageUser.access_token) {
        const decodedJwt = parseJwtToJson(localStorageUser.access_token);
        if (decodedJwt) {
          setUser({
            _id: decodedJwt.sub,
            firstName: decodedJwt.firstName,
            lastName: decodedJwt.lastName,
            email: decodedJwt.email,
            isPlatformAdmin: decodedJwt.isPlatformAdmin,
            org: decodedJwt.org,
            role: decodedJwt.role
          });
          setHasOrganization(decodedJwt.org !== null);
        }
        api.defaults.headers.common.Authorization = `Bearer ${localStorageUser.access_token}`;
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
      value={{ user, signUp, signIn, signOut, refreshToken, hasOrganization, isOrgAdmin, isPlatformAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
