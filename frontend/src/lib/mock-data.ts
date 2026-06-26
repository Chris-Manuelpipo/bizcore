import { Tenant, Person, Actor, Business, ServiceCatalogue, ServiceRequest, Invoice } from './types';

export const mockTenant: Tenant = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Pharmacie Centrale Yaoundé',
  domain: 'pharmacie',
  description: 'Officine de quartier spécialisée en medications génériques',
  isActive: true,
  createdAt: '2026-01-15T08:00:00Z',
};

export const mockPersons: Person[] = [
  { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@email.com', phone: '+237612345678', country: 'CM', createdAt: '2026-01-16T09:00:00Z' },
  { id: '2', firstName: 'Marie', lastName: 'Nkoulou', email: 'marie.nkoulou@email.com', phone: '+237698765432', country: 'CM', createdAt: '2026-01-17T10:00:00Z' },
  { id: '3', firstName: 'Pierre', lastName: 'Manga', email: 'pierre.manga@email.com', phone: '+237674321098', country: 'CM', createdAt: '2026-01-18T11:00:00Z' },
  { id: '4', firstName: 'Anne', lastName: 'Biwole', email: 'anne.biwole@email.com', phone: '+237655123456', country: 'CM', createdAt: '2026-01-19T12:00:00Z' },
];

export const mockActors: Actor[] = [
  { id: '101', person: mockPersons[0], role: 'CONSUMER', bio: 'Patient régulier', isActive: true, createdAt: '2026-01-16T09:30:00Z' },
  { id: '102', person: mockPersons[1], role: 'PROVIDER', bio: 'Pharmacien diplôré avec 10 ans d\'expérience', isActive: true, createdAt: '2026-01-17T10:30:00Z' },
  { id: '103', person: mockPersons[2], role: 'CONSUMER', bio: 'Nouveau patient', isActive: true, createdAt: '2026-01-18T11:30:00Z' },
  { id: '104', person: mockPersons[3], role: 'PROVIDER', bio: 'Assistant pharmacy', isActive: true, createdAt: '2026-01-19T12:30:00Z' },
];

export const mockBusinesses: Business[] = [
  { id: 'b1', name: 'Pharmacien', domain: 'Santé', description: 'Professionnel de santé en officine', neededEducation: 'Diplôme de Pharmacie', neededTraining: 'Formation continue', createdAt: '2026-01-15T08:30:00Z' },
  { id: 'b2', name: 'Médecin', domain: 'Santé', description: 'Docteur en médecine générale', neededEducation: 'Doctorat en Médecine', neededTraining: 'Internat', createdAt: '2026-01-15T09:00:00Z' },
  { id: 'b3', name: 'Infirmier', domain: 'Santé', description: 'Professionnel de soins infirmiers', neededEducation: 'Diplôme d\'Infirmier', neededTraining: 'ASSS', createdAt: '2026-01-15T09:30:00Z' },
];

export const mockServices: ServiceCatalogue[] = [
  { id: 's1', business: mockBusinesses[0], name: 'Consultation Pharma', description: 'Conseil pharmaceutique personnalisé', basePrice: 5000, currency: 'XAF', isAvailable: true, createdAt: '2026-01-20T08:00:00Z' },
  { id: 's2', business: mockBusinesses[0], name: 'Préparation Ordonnance', description: 'Préparation de médicaments sur ordonnance', basePrice: 2000, currency: 'XAF', isAvailable: true, createdAt: '2026-01-20T08:30:00Z' },
  { id: 's3', business: mockBusinesses[0], name: 'Vaccination', description: 'Administration de vaccins', basePrice: 8000, currency: 'XAF', isAvailable: true, createdAt: '2026-01-20T09:00:00Z' },
];

export const mockServiceRequests: ServiceRequest[] = [
  { id: 'sr1', consumerId: '101', consumerName: 'Jean Dupont', providerId: '102', providerName: 'Marie Nkoulou', businessId: 'b1', businessName: 'Pharmacien', serviceName: 'Consultation Pharma', description: 'Conseil pour traitement hypertension', status: 'PENDING', requestedAt: '2026-04-05T09:00:00Z' },
  { id: 'sr2', consumerId: '103', consumerName: 'Pierre Manga', providerId: '102', providerName: 'Marie Nkoulou', businessId: 'b1', businessName: 'Pharmacien', serviceName: 'Préparation Ordonnance', description: 'Ordonnance pour antibiotiques', status: 'ACCEPTED', requestedAt: '2026-04-04T14:00:00Z' },
  { id: 'sr3', consumerId: '101', consumerName: 'Jean Dupont', providerId: '104', providerName: 'Anne Biwole', businessId: 'b1', businessName: 'Pharmacien', serviceName: 'Vaccination', description: 'Vaccin grippe annuelle', status: 'IN_PROGRESS', requestedAt: '2026-04-03T10:00:00Z' },
  { id: 'sr4', consumerId: '103', consumerName: 'Pierre Manga', providerId: '102', providerName: 'Marie Nkoulou', businessId: 'b1', businessName: 'Pharmacien', serviceName: 'Consultation Pharma', description: 'Suivi traitement diabète', status: 'FULFILLED', requestedAt: '2026-04-02T11:00:00Z', fulfilledAt: '2026-04-02T12:30:00Z' },
];

export const mockInvoices: Invoice[] = [
  { id: 'inv1', serviceRequest: mockServiceRequests[3], amount: 5000, currency: 'XAF', status: 'PENDING', issuedAt: '2026-04-02T12:30:00Z' },
];

export const mockStats = {
  totalRequests: 47,
  pendingRequests: 12,
  fulfilledToday: 5,
  monthlyRevenue: 2450000,
  activeProviders: 8,
  activeConsumers: 34,
};
