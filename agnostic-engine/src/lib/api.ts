import axios from 'axios';
import { env } from '@/src/env';

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) console.warn('401: Redirect logic here.');
    return Promise.reject(err);
  }
);

export default apiClient;
