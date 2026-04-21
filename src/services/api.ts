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

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const userData = localStorage.getItem('@planco:user');
        const parsed = userData ? JSON.parse(userData) : null;
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${parsed?.access_token}` } }
        );
        const newToken = data.access_token;
        localStorage.setItem('@planco:user', JSON.stringify(data));
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        refreshQueue = [];
        apiErrorEmitter.emit('__unauthorized__');
      } finally {
        isRefreshing = false;
      }
    }

    const message = Array.isArray(error.response?.data?.message)
      ? error.response.data.message.join(', ')
      : error.response?.data?.message || error.message || 'Erro inesperado';

    const backendError = new Error(message);
    (backendError as any).status = status;
    (backendError as any).response = error.response;
    (backendError as any)._emitted = false;
    throw backendError;
  }
);

export { api };
