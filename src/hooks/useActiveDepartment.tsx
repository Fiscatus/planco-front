import { useActiveDepartment as useActiveDepartmentContext } from '@/contexts';
import { useContext } from 'react';

export const useActiveDepartment = () => {
  return useActiveDepartmentContext();
};
