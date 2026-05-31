'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { InfoCard } from '@/components/Cards';
import { EmptyState } from '@/components/Badges';
import { api } from '@/lib/api';
import { Business } from '@/lib/types';
import { Plus, GraduationCap, Award, Building2 } from 'lucide-react';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const data = await api.getBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header 
        onMenuClick={() => {}} 
        title="Métiers" 
        subtitle="Gestion des Business (protocoles métier)"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[var(--text-muted)]">
            Chaque métier définit son protocole d&apos;échange (BusinessRules) et ses services.
          </p>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau métier
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
        ) : businesses.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Aucun métier"
            description="Créez un métier pour commencer à configurer votre instance"
            action={
              <button className="btn-primary">Créer un métier</button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div key={business.id} className="card hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium bg-[var(--surface-2)] text-[var(--text-muted)] rounded-full">
                      {business.domain}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{business.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{business.description}</p>
                  
                  <div className="space-y-3">
                    {business.neededEducation && (
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Formation requise</p>
                          <p className="text-sm text-[var(--text)]">{business.neededEducation}</p>
                        </div>
                      </div>
                    )}
                    {business.neededTraining && (
                      <div className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Entraînement</p>
                          <p className="text-sm text-[var(--text)]">{business.neededTraining}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-3 bg-[var(--surface-2)] border-t border-[var(--border)] flex justify-end gap-2">
                  <button className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">Modifier</button>
                  <button className="text-sm text-indigo-400 hover:text-indigo-400">Services</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Protocol Explanation */}
        <InfoCard title="L'analogie réseau appliquée" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[var(--surface-2)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Concept Réseau</p>
              <p className="font-medium text-[var(--text)]">Protocole</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--surface-2)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">→</p>
              <p className="font-medium text-indigo-400">BusinessRule</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--surface-2)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Dans BizCore</p>
              <p className="font-medium text-[var(--text)]">Règles métier</p>
            </div>
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <p className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Exemple</p>
              <p className="text-sm font-medium text-indigo-300">"PRICE_MAX": "50000"</p>
            </div>
          </div>
        </InfoCard>
      </main>
    </>
  );
}
