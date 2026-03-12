// src/lib/axios.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "./tokenStorage";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let queue: QueueItem[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? "";


    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/email/verification")
    ) {
      return Promise.reject(error);
    }


    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await api.post("/auth/refresh");
      const newToken = (refreshRes.data as any)?.data?.accessToken as
        | string
        | undefined;

      if (!newToken) {
        throw new Error("Refresh token missing in response");
      }

      tokenStorage.set(newToken);

      queue.forEach((q) => q.resolve(newToken));
      queue = [];

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      queue.forEach((q) => q.reject(err));
      queue = [];
      tokenStorage.clear();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
