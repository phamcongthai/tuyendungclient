import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios'

// Singleton HTTP client with interceptors
let httpInstance: AxiosInstance | null = null;

const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<any>) => {
      const status = error.response?.status;
      if (status === 401) {
        try {
          // Best-effort logout (may fail if token expired)
          await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          }).catch(() => {});
        } catch {}
        try {
          localStorage.setItem('authExpired', '1');
        } catch {}
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.assign('/login');
        }
      }
      return Promise.reject(error);
    }
  );
};

export const http = (() => {
  if (!httpInstance) {
    httpInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
    });
    setupInterceptors(httpInstance);
  }
  return httpInstance;
})();

export const createHttp = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
  });
  setupInterceptors(instance);
  return instance;
};


