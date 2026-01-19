import { useCallback } from "react";
import { api } from "@/services";
import { useAuth } from "@/hooks";

export type RoleOption = {
  _id: string;
  name?: string;
};

export type DepartmentOption = {
  _id: string;
  department_name?: string; // pelo seu controller/dto parece ser esse padrão no create
  name?: string;
};

export const useRolesAndDepartments = () => {
  const { user } = useAuth();

  const fetchRolesByOrg = useCallback(async (): Promise<RoleOption[]> => {
    const orgId = (user as any)?.org?._id || (user as any)?.org; // tolera org como string
    if (!orgId) return [];

    const res = await api.get<RoleOption[]>(`/roles/org/${orgId}`);
    return Array.isArray(res.data) ? res.data : [];
  }, [user]);

  const fetchDepartments = useCallback(async (): Promise<DepartmentOption[]> => {
    const res = await api.get<{
      departments: DepartmentOption[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>("/departments", {
      params: {
        page: 1,
        limit: 200,
        // se o FilterDepartmentsDto suportar: search/term/etc, pode manter vazio
        search: "",
      },
    });

    const payload = res.data;
    return Array.isArray(payload?.departments) ? payload.departments : [];
  }, []);

  return {
    fetchRolesByOrg,
    fetchDepartments,
  };
};
