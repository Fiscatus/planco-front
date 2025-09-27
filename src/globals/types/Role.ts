export type CreateRoleDto = {
  name: string;
  permissions: string[];
  orgId: string;
};

export type UpdateRoleDto = {
  name?: string;
  permissions?: string[];
};

export type Role = {
  _id: string;
  name: string;
  permissions: string[];
  org: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RoleDeleteImpact = {
  canDelete: boolean;
  affectedUsers: number;
  roleName: string;
  message: string;
};

export type RoleDeleteResponse = {
  message: string;
  affectedUsers: number;
};

export type PermissionDto = {
  key: string;
  label: string;
  category: string;
  action: string;
};

export type PermissionsResponseDto = {
  permissions: PermissionDto[];
  total: number;
};
