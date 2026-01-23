import axios from "axios";

// For client-side usage (React Query, client components)
export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  withCredentials: true,
});

// For server-side usage (Server Components, Server Actions)
export const axiosServer = axios.create({
  baseURL: process.env.BACKEND_API_URL,
});
