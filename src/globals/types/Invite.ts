export type InviteStatus = 'pendente' | 'aceito' | 'recusado' | 'expirado';

export type InviteRole = {
  _id: string;
  name: string;
};

export type InviteDepartment = {
  _id: string;
  department_name: string;
};

export type InviteUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type Invite = {
  _id: string;
  email: string;
  status: InviteStatus;
  role: InviteRole;
  departments?: InviteDepartment[];
  invitedBy: InviteUser;
  acceptedBy?: InviteUser;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
};

export type CreateInviteDto = {
  email: string;
  roleId: string;
  departmentIds?: string[];
};

export type FilterInvitesDto = {
  page?: string;
  limit?: string;
  status?: InviteStatus;
  email?: string;
  role?: string;
};

export type PaginatedInvitesDto = {
  invites: Invite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type InviteResponseDto = {
  _id: string;
  email: string;
  status: InviteStatus;
  role: InviteRole;
  departments?: InviteDepartment[];
  invitedBy: InviteUser;
  acceptedBy?: InviteUser;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
};

export type AcceptInviteResponse = {
  message: string;
};

export type DeclineInviteResponse = {
  message: string;
};

export type DeleteInviteResponse = {
  message: string;
};
