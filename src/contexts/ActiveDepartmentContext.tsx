import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { Department } from '@/globals/types';
import { useAuth, useDepartments } from '@/hooks';

type ApiDepartment = {
  _id: string;
  name: string;
  acronym: string;
  description: string;
  email?: string;
  phone?: string;
  responsavel: {
    _id: string;
    name: string;
    email: string;
  } | null;
};

const mapApiDepartmentToDepartment = (apiDept: ApiDepartment): Department => {
  const responsavel = apiDept.responsavel || {
    _id: '',
    name: '',
    email: ''
  };

  return {
    _id: apiDept._id,
    department_name: apiDept.name,
    department_acronym: apiDept.acronym,
    description: apiDept.description,
    deparment_email: apiDept.email || '',
    department_phone: apiDept.phone || '',
    email_owner: responsavel.email,
    responsavelUserId: responsavel._id,
    responsavelUserId_details: {
      _id: responsavel._id,
      firstName: responsavel.name.split(' ')[0] || '',
      lastName: responsavel.name.split(' ').slice(1).join(' ') || '',
      email: responsavel.email
    },
    org: '',
    isActive: true
  };
};

const createSafeDepartmentForStorage = (dept: Department) => {
  return {
    _id: dept._id,
    department_name: dept.department_name,
    department_acronym: dept.department_acronym
  };
};

const findDepartmentFromSafeData = (safeData: any, availableDepartments: Department[]) => {
  return availableDepartments.find((dept) => dept._id === safeData._id);
};

type ActiveDepartmentContextType = {
  activeDepartment: Department | null;
  setActiveDepartment: (department: Department | null) => void;
  availableDepartments: Department[];
  setAvailableDepartments: (departments: Department[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const ActiveDepartmentContext = createContext<ActiveDepartmentContextType>({} as ActiveDepartmentContextType);

const ACTIVE_DEPARTMENT_KEY = '@planco:activeDepartment';

type Props = {
  children: ReactNode;
};

export const ActiveDepartmentProvider = ({ children }: Props) => {
  const { user } = useAuth();
  const { getUserDepartments } = useDepartments();
  const [activeDepartment, setActiveDepartmentState] = useState<Department | null>(null);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserDepartments = useCallback(async () => {
    if (!user?._id) {
      setAvailableDepartments([]);
      setActiveDepartmentState(null);
      localStorage.removeItem(ACTIVE_DEPARTMENT_KEY);
      return;
    }

    try {
      setIsLoading(true);

      const apiDepartments = await getUserDepartments(user._id);

      const userDepartments = apiDepartments.map((apiDept: ApiDepartment) => {
        const mappedDept = mapApiDepartmentToDepartment(apiDept);
        mappedDept.org = user.org?._id || '';
        return mappedDept;
      });

      setAvailableDepartments(userDepartments);

      if (userDepartments.length === 0) {
        setActiveDepartmentState(null);
        localStorage.removeItem(ACTIVE_DEPARTMENT_KEY);
        return;
      }

      const savedActiveDepartment = localStorage.getItem(ACTIVE_DEPARTMENT_KEY);

      if (savedActiveDepartment) {
        try {
          const parsed = JSON.parse(savedActiveDepartment);

          const fullDepartment = findDepartmentFromSafeData(parsed, userDepartments);

          if (fullDepartment) {
            setActiveDepartmentState(fullDepartment);
          } else {
            const firstDepartment = userDepartments[0];
            setActiveDepartmentState(firstDepartment);
            localStorage.setItem(
              ACTIVE_DEPARTMENT_KEY,
              JSON.stringify(createSafeDepartmentForStorage(firstDepartment))
            );
          }
        } catch (error) {
          console.error('Erro ao carregar gerência ativa do localStorage:', error);
          localStorage.removeItem(ACTIVE_DEPARTMENT_KEY);

          const firstDepartment = userDepartments[0];
          setActiveDepartmentState(firstDepartment);
          localStorage.setItem(ACTIVE_DEPARTMENT_KEY, JSON.stringify(createSafeDepartmentForStorage(firstDepartment)));
        }
      } else {
        const firstDepartment = userDepartments[0];
        setActiveDepartmentState(firstDepartment);
        localStorage.setItem(ACTIVE_DEPARTMENT_KEY, JSON.stringify(createSafeDepartmentForStorage(firstDepartment)));
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos do usuário:', error);
      setAvailableDepartments([]);
      setActiveDepartmentState(null);
      localStorage.removeItem(ACTIVE_DEPARTMENT_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [user, getUserDepartments]);

  const setActiveDepartment = (department: Department | null) => {
    setActiveDepartmentState(department);
    if (department) {
      const safeData = createSafeDepartmentForStorage(department);
      localStorage.setItem(ACTIVE_DEPARTMENT_KEY, JSON.stringify(safeData));
    } else {
      localStorage.removeItem(ACTIVE_DEPARTMENT_KEY);
    }
  };

  useEffect(() => {
    loadUserDepartments();
  }, [loadUserDepartments]);

  return (
    <ActiveDepartmentContext.Provider
      value={{
        activeDepartment,
        setActiveDepartment,
        availableDepartments,
        setAvailableDepartments,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </ActiveDepartmentContext.Provider>
  );
};

export const useActiveDepartment = () => {
  const context = useContext(ActiveDepartmentContext);
  if (!context) {
    throw new Error('useActiveDepartment deve ser usado dentro de um ActiveDepartmentProvider');
  }
  return context;
};
