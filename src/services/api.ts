import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
);

export { api };
