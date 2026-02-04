import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect, useRef } from "react";

const API_URL = "https://2b05-102-88-111-41.ngrok-free.app";

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const useAxiosApi = () => {
  const { getToken } = useAuth();
  const interceptorIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Remove existing interceptor if it exists
    if (interceptorIdRef.current !== null) {
      axiosClient.interceptors.request.eject(interceptorIdRef.current);
    }

    // Add new interceptor
    interceptorIdRef.current = axiosClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.warn("⚠️ Axios: No Clerk token available");
          }
        } catch (error) {
          console.error("Axios: Failed to get token:", error);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Cleanup: remove interceptor when component unmounts
    return () => {
      if (interceptorIdRef.current !== null) {
        axiosClient.interceptors.request.eject(interceptorIdRef.current);
        interceptorIdRef.current = null;
      }
    };
  }, [getToken]);

  return axiosClient;
};
