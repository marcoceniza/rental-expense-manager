export interface ApiUser {
  id: number;
  name: string;
  email: string;
  user_type: 'admin' | 'user';
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface LogoutResponse {
  message: string;
}

export interface MeResponse {
  user: ApiUser;
}

export interface ApiFieldErrors {
  [field: string]: string | string[];
}
