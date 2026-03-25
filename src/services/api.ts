import axios from 'axios';
import { apiErrorEmitter } from './apiErrorEmitter';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se disponível
    const userData = localStorage.getItem('@planco:user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.access_token) {
          config.headers.Authorization = `Bearer ${parsedUser.access_token}`;
        }
      } catch (error) {
        console.warn('Erro ao parsear dados do usuário:', error);
      }
    }

    const activeDepartment = localStorage.getItem('@planco:activeDepartment');
    if (activeDepartment) {
      try {
        const parsed = JSON.parse(activeDepartment);
        if (parsed._id) {
          const url = config.url || '';
          
          const shouldAddHeader = 
            url.includes('/departments/check-access') ||
            url.includes('/departments/') && url.includes('/info');
          
          if (shouldAddHeader) {
            config.headers['X-Active-Department'] = parsed._id;
          }

          if (config.method === 'get' && url.includes('/departments/')) {
            if (!config.params) {
              config.params = { activeDepartmentId: parsed._id };
            } else {
              config.params.activeDepartmentId = parsed._id;
            }
          }
        }
      } catch (error) {
        console.warn('Erro ao parsear gerência ativa:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = Array.isArray(error.response?.data?.message)
      ? error.response.data.message.join(', ')
      : error.response?.data?.message || error.message || 'Erro inesperado';

    const backendError = new Error(message);
    (backendError as any).status = status;
    (backendError as any).response = error.response;
    (backendError as any)._emitted = false; // flag para emissão controlada
    throw backendError;
  }
);

export { api };
