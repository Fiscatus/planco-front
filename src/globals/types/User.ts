export type User = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  isPlatformAdmin?: boolean;
  org?: {
    _id: string;
    name: string;
  } | null;
  role?: {
    _id: string;
    name: string;
    permissions: string[];
  } | null;
};

export type AuthResponse = {
  access_token: string;
};

export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginDto = {
  email: string;
  password: string;
};