'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { CurrencyDisplay, EmptyState } from '@/components/Badges';
import { api } from '@/lib/api';
import { ServiceCatalogue } from '@/lib/types';
import { Plus, Briefcase, CheckCircle, XCircle } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceCatalogue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header 
        onMenuClick={() => {}} 
        title="Catalogue de Services" 
        subtitle="Services proposés par les providers"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[var(--text-muted)]">
            Chaque provider peut proposer des services via son catalogue.
          </p>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau service
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Aucun service"
            description="Ajoutez des services au catalogue pour permettre aux consumers de faire des demandes"
            action={<button className="btn-primary">Ajouter un service</button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="card hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    {service.isAvailable ? (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Disponible
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Indisponible
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-1">{service.name}</h3>
                  <p className="text-sm text-emerald-600 font-medium mb-3">{service.business.name}</p>
                  <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{service.description}</p>
                  
                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Prix de base</span>
                      <CurrencyDisplay amount={service.basePrice} currency={service.currency} size="lg" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-[var(--surface-2)] border-t border-[var(--border)] flex justify-end gap-2">
                  <button className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">Modifier</button>
                  <button className="text-sm text-indigo-400 hover:text-indigo-400 font-medium">
                    Commander
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Flow */}
        <div className="card mt-8 p-6">
          <h3 className="font-semibold text-[var(--text)] mb-4">Flux d&apos;un service</h3>
          <div className="flex items-center justify-between overflow-x-auto">
            {[
              { step: 1, label: 'Consumer', desc: 'Recherche un service' },
              { step: 2, label: 'ServiceCatalogue', desc: 'Liste des services disponibles' },
              { step: 3, label: 'ServiceRequest', desc: 'Demande créée (CdS)' },
              { step: 4, label: 'Provider', desc: 'Exécute le service' },
              { step: 5, label: 'Invoice', desc: 'Facture générée (ACK)' },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="text-center min-w-32">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                    <span className="font-bold">{item.step}</span>
                  </div>
                  <p className="font-medium text-[var(--text)] text-sm">{item.label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                </div>
                {index < 4 && (
                  <div className="w-8 h-0.5 bg-[var(--surface-2)] mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
