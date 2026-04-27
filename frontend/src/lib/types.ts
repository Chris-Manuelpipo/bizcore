export interface Tenant {
  id: string;
  name: string;
  domain: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  createdAt: string;
}

export interface Actor {
  id: string;
  person: Person;
  role: 'CONSUMER' | 'PROVIDER';
  bio?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  domain: string;
  description?: string;
  neededEducation?: string;
  neededTraining?: string;
  createdAt: string;
}

export interface ServiceCatalogue {
  id: string;
  business: Business;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  actor: Actor;
  title: string;
  description?: string;
  businesses: Business[];
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  consumer: Actor;
  provider: Actor;
  business: Business;
  serviceName: string;
  description?: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED';
  requestedAt: string;
  fulfilledAt?: string;
}

export interface Invoice {
  id: string;
  serviceRequest: ServiceRequest;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  issuedAt: string;
  paidAt?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface ApiResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type StatusColor = {
  bg: string;
  text: string;
  dot: string;
};

export const statusColors: Record<string, StatusColor> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  ACCEPTED: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  FULFILLED: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  PAID: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
};
