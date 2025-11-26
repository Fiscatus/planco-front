import axios from 'axios';

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
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.data?.message) {
      const backendError = new Error(error.response.data.message);
      // biome-ignore lint/suspicious/noExplicitAny: <type any in the backendError>
      (backendError as any).status = error.response.status;
      // biome-ignore lint/suspicious/noExplicitAny: <type any in the backendError>
      (backendError as any).response = error.response;
      throw backendError;
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
    }
    throw error;
  }
);

export { api };
