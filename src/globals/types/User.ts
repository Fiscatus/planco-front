export type User = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  cpf?: string;
  phone?: string;
  isPlatformAdmin?: boolean;
  isActive?: boolean;
  org?: {
    _id: string;
    name: string;
  } | null;
  role?: {
    _id: string;
    name: string;
    permissions: string[];
  } | null;
  departments?: Array<{
    _id: string;
    department_name: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  access_token: string;
};

export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type FilterUsersDto = {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  isActive?: boolean;
  departments?: string[];
  role?: string;
};

export type PaginatedUsersDto = {
  users: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type ToggleUserStatusResponse = {
  message: string;
  isActive: boolean;
};
