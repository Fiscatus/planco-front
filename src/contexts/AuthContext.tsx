import type { AuthResponse, LoginDto, RegisterDto, User } from '@/globals/types';

import { createContext } from 'react';

type AuthContextType = {
  user: User | undefined;
  hasOrganization: boolean;
  isOrgAdmin: boolean;
  isPlatformAdmin: boolean;
  signOut(): Promise<void>;
  signUp(user: RegisterDto): Promise<AuthResponse>;
  signIn(credentials: LoginDto): Promise<AuthResponse>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export { AuthContext };
