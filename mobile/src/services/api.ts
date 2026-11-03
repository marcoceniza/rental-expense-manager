import { api, clearAccessToken, setAccessToken } from './axios';
import type { LoginResponse, LogoutResponse, MeResponse } from './types';

interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/api/v1/login', input);
  await setAccessToken(response.data.token);
  return response.data;
}

export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await api.post<LogoutResponse>('/api/v1/logout');
    return response.data;
  } finally {
    await clearAccessToken();
  }
}

export async function me(): Promise<MeResponse> {
  return (await api.get<MeResponse>('/api/v1/me')).data;
}
