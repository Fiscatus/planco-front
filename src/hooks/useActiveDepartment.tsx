import { useActiveDepartment as useActiveDepartmentContext } from '@/contexts';

export const useActiveDepartment = () => {
  return useActiveDepartmentContext();
};
