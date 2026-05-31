'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { StatusBadge, Avatar, CurrencyDisplay, EmptyState } from '@/components/Badges';
import { api } from '@/lib/api';
import { ServiceRequest } from '@/lib/types';
import { Plus, Filter, MoreHorizontal, Check, X, Play, FileText } from 'lucide-react';

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.getServiceRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, action: string) => {
    try {
      await api.updateServiceRequestStatus(id, action);
      await loadRequests();
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusActions = (status: string, id: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleStatusUpdate(id, 'accept')}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Accepter"
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleStatusUpdate(id, 'cancel')}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Annuler"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      case 'ACCEPTED':
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleStatusUpdate(id, 'start')}
              className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              title="Démarrer"
            >
              <Play className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleStatusUpdate(id, 'cancel')}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Annuler"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleStatusUpdate(id, 'fulfill')}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title="Accomplir"
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleStatusUpdate(id, 'cancel')}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Annuler"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      case 'FULFILLED':
        return (
          <button className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Voir facture">
            <FileText className="w-4 h-4" />
          </button>
        );
      default:
        return null;
    }
  };

  const statusFilters = [
    { value: 'all', label: 'Toutes' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'ACCEPTED', label: 'Acceptées' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'FULFILLED', label: 'Accomplies' },
    { value: 'CANCELLED', label: 'Annulées' },
  ];

  return (
    <>
      <Header 
        onMenuClick={() => {}} 
        title="Demandes de Services" 
        subtitle="Gérez les demandes CdS → FdS"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusFilters.map((sf) => (
              <button
                key={sf.value}
                onClick={() => setFilter(sf.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === sf.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Chargement...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FileText}
                title="Aucune demande"
                description="Créez une nouvelle demande pour commencer"
                action={
                  <button onClick={() => setShowNewModal(true)} className="btn-primary">
                    Créer une demande
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Consommateur</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Prestataire</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--text)]">{request.serviceName}</p>
                          <p className="text-sm text-[var(--text-muted)] mt-0.5 line-clamp-1">{request.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${request.consumer.person.firstName} ${request.consumer.person.lastName}`} size="sm" />
                          <div>
                            <p className="font-medium text-[var(--text)]">
                              {request.consumer.person.firstName} {request.consumer.person.lastName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">Consommateur</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${request.provider.person.firstName} ${request.provider.person.lastName}`} size="sm" />
                          <div>
                            <p className="font-medium text-[var(--text)]">
                              {request.provider.person.firstName} {request.provider.person.lastName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">Prestataire</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-muted)]">{formatDate(request.requestedAt)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {getStatusActions(request.status, request.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New Request Modal */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewModal(false)} />
            <div className="relative bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-lg">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--text)]">Nouvelle demande de service</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">CdS → FdS</p>
              </div>
              <form className="p-6 space-y-4">
                <div>
                  <label className="label">Nom du service</label>
                  <select className="input">
                    <option value="">Sélectionner un service</option>
                    <option value="consultation">Consultation Pharma - 5,000 XAF</option>
                    <option value="ordonnance">Préparation Ordonnance - 2,000 XAF</option>
                    <option value="vaccination">Vaccination - 8,000 XAF</option>
                  </select>
                </div>
                <div>
                  <label className="label">Prestataire</label>
                  <select className="input">
                    <option value="">Sélectionner un prestataire</option>
                    <option value="marie">Marie Nkoulou - Pharmacien</option>
                    <option value="anne">Anne Biwole - Assistant Pharma</option>
                  </select>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea 
                    className="input min-h-24" 
                    placeholder="Décrivez votre demande..."
                  />
                </div>
              </form>
              <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3">
                <button onClick={() => setShowNewModal(false)} className="btn-secondary">
                  Annuler
                </button>
                <button className="btn-primary">Créer la demande</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
