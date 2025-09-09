import axios from 'axios';
import { http } from './http';

const API_BASE_URL = 'http://localhost:3000'; 

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user?: any;
  success?: boolean;
  token?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    isVerified: boolean;
    phone?: string;
    roles: string[];
  };
}

export const authAPI = {
  // Đăng ký user thường
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      console.log(data);
      
      const response = await axios.post(`${API_BASE_URL}/auth/register/user`, data);
      // after account created, init blank user profile
      const account = response.data?.user || response.data?.account;
      const accountId = account?._id || account?.id;
      if (accountId) {
        try {
          await axios.post(`${API_BASE_URL}/users/init`, { accountId, fullName: data.fullName });
        } catch (e) {
          console.warn('Init blank user failed (non-blocking):', e);
        }
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Đăng ký thất bại');
    }
  },

  // Đăng nhập
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await http.post(`/auth/login`, data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Đăng nhập thất bại');
      }
      throw new Error('Đăng nhập thất bại');
    }
  },

  // Đăng ký nhà tuyển dụng (có thể cần thêm thông tin)
  registerRecruiter: async (data: RegisterData & { companyName?: string }): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register-recruiter`, data);
      const account = response.data?.user || response.data?.account;
      const accountId = account?._id || account?.id;
      if (accountId) {
        try {
          await axios.post(`${API_BASE_URL}/users/init`, { accountId, fullName: data.fullName });
        } catch (e) {
          console.warn('Init blank user failed (non-blocking):', e);
        }
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Đăng ký nhà tuyển dụng thất bại');
    }
  },

  // Gửi lại email xác thực
  resendVerification: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Gửi email xác thực thất bại');
    }
  }
};
