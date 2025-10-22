import api from './api';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
  };
  error?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    return {
      success: true,
      token: response.data.token,
      user: response.data.user
    };
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle different error types
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return {
        success: false,
        error: '❌ Cannot connect to server. Make sure backend is running on port 5000'
      };
    }
    
    if (error.response?.data?.error) {
      return {
        success: false,
        error: error.response.data.error
      };
    }
    
    return {
      success: false,
      error: 'Login failed. Please try again.'
    };
  }
};

export const signup = async (
  name: string, 
  email: string, 
  password: string, 
  phone?: string
): Promise<LoginResponse> => {
  try {
    const payload: any = { name, email, password };
    if (phone) {
      payload.phone = phone;
    }

    const response = await api.post('/auth/register', payload);
    
    return {
      success: true,
      token: response.data.token,
      user: response.data.user
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        error: '❌ Cannot connect to server. Make sure backend is running on port 5000'
      };
    }
    
    if (error.response?.data?.error) {
      return {
        success: false,
        error: error.response.data.error
      };
    }
    
    return {
      success: false,
      error: 'Signup failed. Please try again.'
    };
  }
};

export const register = async (
  name: string, 
  email: string, 
  password: string, 
  phone?: string
): Promise<LoginResponse> => {
  return signup(name, email, password, phone); // Alias for signup
};

export const logout = () => {
  localStorage.clear();
};