import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const BASE_URL = 'https://abdurrazzaq.pythonanywhere.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,

});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = await AsyncStorage.getItem('refresh_token');
        if (!refresh) throw new Error('لا يوجد refresh token');

        const { data } = await axios.post(
          `${BASE_URL}/token/refresh/`,
          { refresh }
        );

        await AsyncStorage.setItem('access_token', data.access);

        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove([
          'access_token',
          'refresh_token',
          'currentUser',
        ]);

        DeviceEventEmitter.emit('auth:logout');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;