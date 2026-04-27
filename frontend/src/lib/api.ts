import { mockTenant, mockPersons, mockActors, mockBusinesses, mockServices, mockServiceRequests, mockInvoices, mockStats } from './mock-data';
import { Tenant, Person, Actor, Business, ServiceCatalogue, ServiceRequest, Invoice } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (mockTenant.id) {
      headers['X-Tenant-Id'] = mockTenant.id;
    }
    return headers;
  }

  // Simulated API calls with mock data
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    await this.delay(800);
    if (email && password) {
      return {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { email, fullName: 'Jean Dupont', roles: ['ADMIN'] },
      };
    }
    throw new Error('Invalid credentials');
  }

  async getTenant(): Promise<Tenant> {
    await this.delay(300);
    return mockTenant;
  }

  async getPersons(): Promise<Person[]> {
    await this.delay(400);
    return mockPersons;
  }

  async getActors(): Promise<Actor[]> {
    await this.delay(400);
    return mockActors;
  }

  async getBusinesses(): Promise<Business[]> {
    await this.delay(400);
    return mockBusinesses;
  }

  async getServices(): Promise<ServiceCatalogue[]> {
    await this.delay(400);
    return mockServices;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    await this.delay(500);
    return mockServiceRequests;
  }

  async getInvoices(): Promise<Invoice[]> {
    await this.delay(400);
    return mockInvoices;
  }

  async getStats() {
    await this.delay(300);
    return mockStats;
  }

  async createServiceRequest(data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    await this.delay(600);
    const newRequest: ServiceRequest = {
      id: `sr-${Date.now()}`,
      consumer: mockActors[0],
      provider: mockActors[1],
      business: mockBusinesses[0],
      serviceName: data.serviceName || '',
      description: data.description,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };
    mockServiceRequests.unshift(newRequest);
    return newRequest;
  }

  async updateServiceRequestStatus(id: string, action: string): Promise<ServiceRequest> {
    await this.delay(500);
    const request = mockServiceRequests.find(r => r.id === id);
    if (!request) throw new Error('Service request not found');
    
    const statusTransitions: Record<string, string> = {
      accept: 'ACCEPTED',
      start: 'IN_PROGRESS',
      fulfill: 'FULFILLED',
      cancel: 'CANCELLED',
    };
    
    request.status = statusTransitions[action] as ServiceRequest['status'];
    if (action === 'fulfill') {
      request.fulfilledAt = new Date().toISOString();
    }
    return request;
  }

  async payInvoice(id: string): Promise<Invoice> {
    await this.delay(500);
    const invoice = mockInvoices.find(i => i.id === id);
    if (!invoice) throw new Error('Invoice not found');
    invoice.status = 'PAID';
    invoice.paidAt = new Date().toISOString();
    return invoice;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const api = new ApiService();
