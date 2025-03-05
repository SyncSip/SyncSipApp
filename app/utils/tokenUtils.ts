import {jwtDecode} from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';

interface DecodedToken {
  sub: number;
  username: string;
  iat: number;
  exp: number;
}

export const getDecodedToken = async (): Promise<DecodedToken | null> => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (!token) return null;
    
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserId = async (): Promise<number | null> => {
  const decodedToken = await getDecodedToken();
  return decodedToken?.sub || null;
};

export const getUsername = async (): Promise<string | null> => {
  const decodedToken = await getDecodedToken();
  return decodedToken?.username || null;
};

export const isTokenExpired = async (): Promise<boolean> => {
  const decodedToken = await getDecodedToken();
  if (!decodedToken) return true;
  
  // Get current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};
