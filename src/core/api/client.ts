import axios, { create } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { config } from '@/core/config';

export const apiClient = create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (requestConfig) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${config.apiBaseUrl}/auth/refresh`, {
            refreshToken,
          });
          await SecureStore.setItemAsync('accessToken', data.accessToken);
          if (data.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', data.refreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
        }
      }
    }
    return Promise.reject(error);
  }
);
