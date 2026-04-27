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
          <p className="text-slate-600">
            Chaque métier définit son protocole d&apos;échange (BusinessRules) et ses services.
          </p>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau métier
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Chargement...</div>
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                      {business.domain}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{business.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{business.description}</p>
                  
                  <div className="space-y-3">
                    {business.neededEducation && (
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Formation requise</p>
                          <p className="text-sm text-slate-700">{business.neededEducation}</p>
                        </div>
                      </div>
                    )}
                    {business.neededTraining && (
                      <div className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Entraînement</p>
                          <p className="text-sm text-slate-700">{business.neededTraining}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button className="text-sm text-slate-600 hover:text-slate-900">Modifier</button>
                  <button className="text-sm text-primary-600 hover:text-primary-700">Services</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Protocol Explanation */}
        <InfoCard title="L'analogie réseau appliquée" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Concept Réseau</p>
              <p className="font-medium text-slate-900">Protocole</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">→</p>
              <p className="font-medium text-primary-600">BusinessRule</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dans BizCore</p>
              <p className="font-medium text-slate-900">Règles métier</p>
            </div>
            <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
              <p className="text-xs text-primary-500 uppercase tracking-wider mb-1">Exemple</p>
              <p className="text-sm font-medium text-primary-800">"PRICE_MAX": "50000"</p>
            </div>
          </div>
        </InfoCard>
      </main>
    </>
  );
}
