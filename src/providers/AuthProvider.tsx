import { usePostHog } from 'posthog-js/react';
import { api } from '@/services';
import { useState } from 'react';
import { AuthContext } from '@/contexts';
import type { Credentials, User } from '@/globals/types';

const authApiPath = '/auth';
const usersApiPath = '/users';
const localStorageUserKey = '@fiscatus:user';

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const posthog = usePostHog();

  const [user, setUser] = useState<User | undefined>();

  const signUp = async (user: User) => {
    posthog?.capture('sign_up', { user });
    await api.post(usersApiPath, user);
    return signIn({ email: user.email, password: user.password });
  };

  const signIn = async (credentials: Credentials): Promise<User> => {
    const { data } = await api.post(authApiPath, credentials);
    if (data.access_token) {
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
      localStorage.setItem(localStorageUserKey, JSON.stringify(data));
      setUser(data.user);
      posthog?.identify(String(data.user._id), { ...data.user, password: undefined });
      posthog?.capture('sign_in', { email: data.user.email });
    }
    return data;
  };

  const signOut = async () => {
    try {
      await api.post(`${authApiPath}/logout`);
    } catch (error) {
      console.error(error);
    }
    api.defaults.headers.common.Authorization = undefined;
    localStorage.removeItem(localStorageUserKey);
    posthog?.capture('sign_out');
    setUser(undefined);
  };

  const editUser = async (user: Partial<User>) => {
    const { data } = await api.patch(`${usersApiPath}/${user._id}`, user);
    setUser(data);
    localStorage.setItem(
      localStorageUserKey,
      JSON.stringify({ ...data, access_token: api.defaults.headers.common.Authorization })
    );
  };

  const checkIfUserExists = async (email: string) => {
    const { data } = await api.get(`${usersApiPath}/check-if-exists/${email}`);
    return !!data;
  };

  const loadUserFromLocalStorage = () => {
    if (localStorage.getItem(localStorageUserKey)) {
      const localStorageUser = JSON.parse(String(localStorage.getItem(localStorageUserKey)));
      verifyAuth(localStorageUser.access_token);
      if (!user) {
        setUser(localStorageUser.user);
        api.defaults.headers.common.Authorization = `Bearer ${localStorageUser.access_token}`;
        posthog?.identify(String(localStorageUser.user._id), { ...localStorageUser.user, password: undefined });
      }
    }
  };

  const verifyAuth = (accessToken: string) => {
    const decodedJwt = parseJwt(accessToken);
    if (decodedJwt.exp * 1000 < Date.now()) {
      signOut();
    }
  };

  const parseJwt = (accessToken: string) => {
    try {
      return JSON.parse(window.atob(accessToken.split('.')[1]));
    } catch (e) {
      console.error('Error parsing JWT', e);
      return null;
    }
  };

  loadUserFromLocalStorage();

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, editUser, checkIfUserExists }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
