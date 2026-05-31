'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Avatar, EmptyState } from '@/components/Badges';
import { api } from '@/lib/api';
import { Actor } from '@/lib/types';
import { Plus, Users, User, Shield } from 'lucide-react';

export default function ActorsPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PROVIDER' | 'CONSUMER'>('all');

  useEffect(() => {
    loadActors();
  }, []);

  const loadActors = async () => {
    try {
      const data = await api.getActors();
      setActors(data);
    } catch (error) {
      console.error('Failed to load actors');
    } finally {
      setLoading(false);
    }
  };

  const filteredActors = filter === 'all' 
    ? actors 
    : actors.filter(a => a.role === filter);

  const providers = actors.filter(a => a.role === 'PROVIDER');
  const consumers = actors.filter(a => a.role === 'CONSUMER');

  return (
    <>
      <Header 
        onMenuClick={() => {}} 
        title="Acteurs" 
        subtitle="Consumers et Providers (Émetteurs et Récepteurs)"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Total</p>
              <p className="text-2xl font-bold text-[var(--text)]">{actors.length}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Prestataires</p>
              <p className="text-2xl font-bold text-[var(--text)]">{providers.length}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Consommateurs</p>
              <p className="text-2xl font-bold text-[var(--text)]">{consumers.length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {[
              { value: 'all', label: 'Tous' },
              { value: 'PROVIDER', label: 'Prestataires', color: 'green' },
              { value: 'CONSUMER', label: 'Consommateurs', color: 'purple' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvel acteur
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Chargement...</div>
          ) : filteredActors.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="Aucun acteur"
                description="Créez des acteurs (Consumers ou Providers) pour commencer"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Acteur</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Bio</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredActors.map((actor) => (
                    <tr key={actor.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            name={`${actor.person.firstName} ${actor.person.lastName}`} 
                            size="md" 
                          />
                          <div>
                            <p className="font-medium text-[var(--text)]">
                              {actor.person.firstName} {actor.person.lastName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {actor.person.country} • {actor.isActive ? 'Actif' : 'Inactif'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-muted)]">{actor.person.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-muted)]">{actor.person.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          actor.role === 'PROVIDER' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {actor.role === 'PROVIDER' ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <User className="w-3 h-3 mr-1" />
                          )}
                          {actor.role === 'PROVIDER' ? 'Prestataire' : 'Consommateur'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-muted)] line-clamp-1 max-w-xs">{actor.bio || '-'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm text-indigo-400 hover:text-indigo-400 font-medium">
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Network Analogy */}
        <div className="card mt-8 p-6 border-indigo-500/30 bg-indigo-500/10/50">
          <h3 className="font-semibold text-indigo-300 mb-4">L'analogie réseau</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-lg border border-indigo-500/30">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">Consumer (Consommateur)</p>
                <p className="text-sm text-[var(--text-muted)]">= Émetteur dans le réseau</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Initiateur de la demande de service</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-lg border border-indigo-500/30">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">Provider (Prestataire)</p>
                <p className="text-sm text-[var(--text-muted)]">= Récepteur dans le réseau</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Exécuteur du service demandé</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
