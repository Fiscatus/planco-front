export type Department = {
  _id: string;
  department_name: string;
  department_acronym?: string;
  deparment_email?: string;
  department_phone?: string;
  email_owner?: string;
  description?: string;
  responsavelUserId?: string;
  responsavelUserId_details?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  org: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedDepartments = {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateDepartmentDto = {
  department_name: string;
  department_acronym?: string;
  deparment_email: string;
  department_phone?: string;
  email_owner: string;
  description?: string;
  responsavelUserId?: string;
};

export type UpdateDepartmentDto = {
  department_name?: string;
  department_acronym?: string;
  deparment_email?: string;
  department_phone?: string;
  email_owner?: string;
  description?: string;
  responsavelUserId?: string;
};
