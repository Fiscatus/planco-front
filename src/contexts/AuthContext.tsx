import { createContext } from 'react';
import type { Credentials, User } from '@/globals/types';

type AuthContextType = {
  user: User | undefined;
  signUp(user: User): Promise<User>;
  signIn(credentials: Credentials): Promise<User>;
  signOut(): Promise<void>;
  editUser(user: Partial<User>): Promise<void>;
  checkIfUserExists(email: string): Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export { AuthContext };
