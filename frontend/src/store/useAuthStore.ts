import { create } from "zustand";
import { UserResponse, AuthResponse } from "../types";
import { publicApi, authApi } from "../api/axios";

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: any) => Promise<void>;
  register: (userDetails: any) => Promise<void>;
  logout: () => void;
  setUser: (user: UserResponse | null) => void;
  setTokens: (access: string | null, refresh: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  isAdmin: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAdmin: user?.role === "ADMIN" }),

  setTokens: (access, refresh) => {
    if (access) localStorage.setItem("accessToken", access);
    else localStorage.removeItem("accessToken");
    
    if (refresh) localStorage.setItem("refreshToken", refresh);
    else localStorage.removeItem("refreshToken");
    
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: !!access });
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await publicApi.post<any>("/auth/login", credentials);
      const payload = response.data.data ? response.data.data : response.data;
      
      set({ 
        user: payload.user, 
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        isAuthenticated: true,
        isAdmin: payload.user?.role === "ADMIN",
        isLoading: false
      });
      localStorage.setItem("accessToken", payload.accessToken);
      localStorage.setItem("refreshToken", payload.refreshToken);
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Login failed", 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userDetails) => {
    set({ isLoading: true, error: null });
    try {
      const payload = { ...userDetails };
      if (payload.dob) {
        payload.dateOfBirth = payload.dob;
        delete payload.dob;
      }
      await publicApi.post("/auth/register", payload);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Registration failed", 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ 
      user: null, 
      accessToken: null, 
      refreshToken: null, 
      isAuthenticated: false, 
      isAdmin: false 
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await authApi.get<any>("/users/me");
      const payload = response.data.data ? response.data.data : response.data;
      set({ 
        user: payload, 
        isAdmin: payload.role === "ADMIN",
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ 
        user: null, 
        isAuthenticated: false, 
        isAdmin: false,
        isLoading: false 
      });
    }
  },
}));
