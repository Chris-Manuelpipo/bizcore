import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bizcore_token");
    const tenantId = localStorage.getItem("bizcore_tenant");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers["X-Tenant-Id"] = tenantId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("bizcore_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);
