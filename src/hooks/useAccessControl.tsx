import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";

export const useAccessControl = () => {
  const { user } = useAuth();

  const userPermissions = useMemo(() => user?.role?.permissions || [], [user]);

  const hasPermission = useCallback(
    (permissionKey: string) => {
      return userPermissions.includes(permissionKey);
    },
    [userPermissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]) => {
      return requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );
    },
    [userPermissions]
  );

  const canAccessUsers = useMemo(() => {
    return (
      hasPermission("admin") ||
      hasPermission("users.create") ||
      hasPermission("users.update") ||
      hasPermission("users.delete") ||
      hasPermission("users.manage")
    );
  }, [hasPermission]);

  const canAccessDepartments = useMemo(() => {
    return (
      hasPermission("admin") ||
      hasPermission("departments.create") ||
      hasPermission("departments.update") ||
      hasPermission("departments.delete") ||
      hasPermission("departments.manage")
    );
  }, [hasPermission]);

  const canAccessInvites = useMemo(() => {
    return (
      hasPermission("admin") ||
      hasPermission("invites.create") ||
      hasPermission("invites.update") ||
      hasPermission("invites.delete") ||
      hasPermission("invites.manage")
    );
  }, [hasPermission]);

  const canAccessRoles = useMemo(() => {
    return (
      hasPermission("admin") ||
      hasPermission("roles.create") ||
      hasPermission("roles.update") ||
      hasPermission("roles.delete") ||
      hasPermission("roles.manage")
    );
  }, [hasPermission]);

  const canAccessAdmin = useMemo(() => {
    if (hasPermission("admin")) {
      return true;
    }

    return (
      canAccessUsers ||
      canAccessDepartments ||
      canAccessInvites ||
      canAccessRoles
    );
  }, [canAccessUsers, canAccessDepartments, canAccessInvites, canAccessRoles, hasPermission]);

  return {
    canAccessUsers,
    canAccessDepartments,
    canAccessInvites,
    canAccessRoles,
    canAccessAdmin,
    hasPermission,
    userPermissions,
  };
};
