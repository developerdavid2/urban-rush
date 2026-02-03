// lib/axios.ts
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// Add Clerk token to every request
axiosClient.interceptors.request.use(
  async (config) => {
    // Get token from Clerk (client-side only)
    if (typeof window !== "undefined" && window.Clerk) {
      try {
        const token = await window.Clerk.session?.getToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn("Axios: No Clerk token available");
        }
      } catch (error) {
        console.error("Axios: Failed to get token:", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response logging
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
