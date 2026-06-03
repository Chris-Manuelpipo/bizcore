import axios from "axios";
import type { Actor, Business, Invoice, ServiceCatalogue, ServiceRequest } from "./types";
import { API_BASE } from "./config";

export { API_BASE };

// Réponse paginée Spring Data (Page<T>)
interface Page<T> {
  content: T[];
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bizcore_token");
    // Le tenant est porté par le JWT (claim "tenantId") : aucun en-tête à envoyer.
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("bizcore_token");
    }
    return Promise.reject(err);
  }
);

// Façade typée de l'API BizCore consommée par le dashboard.
// Les endpoints de liste paginés (Page<T>) renvoient leur tableau `content`.
export const api = {
  async getActors(): Promise<Actor[]> {
    const { data } = await apiClient.get<Page<Actor>>("/api/actors");
    return data.content;
  },
  async getBusinesses(): Promise<Business[]> {
    const { data } = await apiClient.get<Page<Business>>("/api/businesses");
    return data.content;
  },
  async getServiceRequests(): Promise<ServiceRequest[]> {
    const { data } = await apiClient.get<Page<ServiceRequest>>("/api/service-requests");
    return data.content;
  },
  async getInvoices(): Promise<Invoice[]> {
    const { data } = await apiClient.get<Invoice[]>("/api/invoices");
    return data;
  },
  async getServices(): Promise<ServiceCatalogue[]> {
    const { data } = await apiClient.get<ServiceCatalogue[]>("/api/service-catalogues");
    return data;
  },
  // Transitions d'état : action ∈ { accept, start, fulfill, cancel }
  async updateServiceRequestStatus(id: string, action: string): Promise<void> {
    await apiClient.patch(`/api/service-requests/${id}/${action}`);
  },
  async payInvoice(id: string): Promise<void> {
    await apiClient.patch(`/api/invoices/${id}/pay`);
  },
};
