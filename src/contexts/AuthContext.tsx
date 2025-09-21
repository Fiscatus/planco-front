import { createContext } from 'react';
import type { AuthResponse, LoginDto, RegisterDto, User } from '@/globals/types';

type AuthContextType = {
  user: User | undefined;
  signUp(user: RegisterDto): Promise<AuthResponse>;
  signIn(credentials: LoginDto): Promise<AuthResponse>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export { AuthContext };
