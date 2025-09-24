import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
} from "@/globals/types";

import { AuthContext } from "@/contexts";
import { api } from "@/services";
import { useState, useEffect } from "react";

const authApiPath = "/auth";
const localStorageUserKey = "@fiscatus:user";

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | undefined>();
  const [hasOrganization, setHasOrganization] = useState(false);

  useEffect(() => {
    setHasOrganization(user && user.org !== null);
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

      const decodedJwt = parseJwt(data.access_token);
      if (decodedJwt) {
        setUser({
          _id: decodedJwt.sub,
          firstName: decodedJwt.firstName,
          lastName: decodedJwt.lastName,
          email: decodedJwt.email,
          isPlatformAdmin: decodedJwt.isPlatformAdmin,
          org: decodedJwt.org,
          role: decodedJwt.role,
        });
      }
    }
    return data;
  };

  const signOut = async () => {
    api.defaults.headers.common.Authorization = undefined;
    localStorage.removeItem(localStorageUserKey);
    setUser(undefined);
  };

  const loadUserFromLocalStorage = () => {
    if (localStorage.getItem(localStorageUserKey)) {
      const localStorageUser = JSON.parse(
        String(localStorage.getItem(localStorageUserKey))
      );
      verifyAuth(localStorageUser.access_token);
      if (!user && localStorageUser.access_token) {
        const decodedJwt = parseJwt(localStorageUser.access_token);
        if (decodedJwt) {
          setUser({
            _id: decodedJwt.sub,
            firstName: decodedJwt.firstName,
            lastName: decodedJwt.lastName,
            email: decodedJwt.email,
            isPlatformAdmin: decodedJwt.isPlatformAdmin,
            org: decodedJwt.org,
            role: decodedJwt.role,
          });
        }
        api.defaults.headers.common.Authorization = `Bearer ${localStorageUser.access_token}`;
      }
    }
  };

  const verifyAuth = (accessToken: string) => {
    const decodedJwt = parseJwt(accessToken);
    if (decodedJwt.exp * 1000 < Date.now()) {
      signOut()
      localStorage.removeItem(localStorageUserKey);
    }
  };

  const parseJwt = (accessToken: string) => {
    try {
      return JSON.parse(window.atob(accessToken.split(".")[1]));
    } catch (e) {
      console.error("Error parsing JWT", e);
      return null;
    }
  };

  loadUserFromLocalStorage();

  return (
    <AuthContext.Provider
      value={{ user, signUp, signIn, signOut, hasOrganization }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
