import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosInstance = axios.create({
  baseURL: "https://api.grinduino.com",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (refreshToken) {
          const response = await axios.post('https://api.grinduino.com/auth/refresh', {
            refreshToken,
          });

          const { token } = response.data;
          await SecureStore.setItemAsync('token', token);
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('token', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const clearAuthToken = async () => {
  try {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

export const login = async (username: string, password: string) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    });
    
    const { accessToken, refreshToken } = response.data;
    
    await SecureStore.setItemAsync('token', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default axiosInstance;
