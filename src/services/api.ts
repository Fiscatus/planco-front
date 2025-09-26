import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.response.use(
  (response) => {
    return response
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
