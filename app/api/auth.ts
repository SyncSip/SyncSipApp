import axios from './axios';
import { ReadGrinderDto, CreateGrinderDto, LoginDto } from './generated';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post<{accessToken:string, refreshToken:string}>(`/auth/login`, {
        email: email,
        password: password
    });
    return response.data;
  },
};
