import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

console.log('API Base URL:', BASE_URL);

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.data) {
      throw new Error(error.response.data.message);
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Erro de conexão. Verifique se o backend está rodando.');
    }
    throw error;
  }
);

export { api };
