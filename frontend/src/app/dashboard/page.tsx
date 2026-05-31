'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/Cards';
import { StatusBadge, Avatar, CurrencyDisplay, EmptyState } from '@/components/Badges';
import { api } from '@/lib/api';
import { mockServiceRequests, mockStats } from '@/lib/mock-data';
import { ServiceRequest } from '@/lib/types';

export default function DashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getServiceRequests();
        setRequests(data);
      } catch (error) {
        setRequests(mockServiceRequests);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const recentRequests = requests.slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <Header 
        onMenuClick={() => {}} 
        title="Tableau de bord" 
        subtitle="Vue d'ensemble de votre plateforme BizCore"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Demandes totales"
            value={mockStats.totalRequests}
            icon={ShoppingCart}
            trend={{ value: 12, label: 'ce mois' }}
            variant="primary"
          />
          <StatCard
            title="En attente"
            value={pendingRequests.length}
            icon={Clock}
            subtitle="à traiter"
            variant="warning"
          />
          <StatCard
            title="Accomplies aujourd'hui"
            value={mockStats.fulfilledToday}
            icon={CheckCircle}
            trend={{ value: 8, label: 'vs hier' }}
            variant="success"
          />
          <StatCard
            title="Revenus du mois"
            value={`${(mockStats.monthlyRevenue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            subtitle="XAF"
            trend={{ value: 23, label: 'croissance' }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <h2 className="font-semibold text-[var(--text)]">Demandes récentes</h2>
                <Link href="/dashboard/requests" className="text-sm text-indigo-400 hover:text-indigo-400 font-medium flex items-center gap-1">
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {loading ? (
                <div className="p-6 text-center text-[var(--text-muted)]">Chargement...</div>
              ) : recentRequests.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title="Aucune demande"
                  description="Les demandes de services apparaîtront ici"
                />
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="px-6 py-4 hover:bg-[var(--surface-2)] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar name={`${request.consumer.person.firstName} ${request.consumer.person.lastName}`} size="sm" />
                          <div>
                            <p className="font-medium text-[var(--text)]">{request.serviceName}</p>
                            <p className="text-sm text-[var(--text-muted)] mt-0.5">
                              {request.consumer.person.firstName} {request.consumer.person.lastName} → {request.provider.person.firstName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(request.requestedAt)}</p>
                          </div>
                        </div>
                        <StatusBadge status={request.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Link href="/dashboard/requests?action=new" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvelle demande
                </Link>
                <Link href="/dashboard/businesses?action=new" className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter un métier
                </Link>
              </div>
            </div>

            {/* Providers Stats */}
            <div className="card p-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Acteurs actifs</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">Prestataires</p>
                      <p className="text-sm text-[var(--text-muted)]">actifs</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-[var(--text)]">{mockStats.activeProviders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">Consommateurs</p>
                      <p className="text-sm text-[var(--text-muted)]">actifs</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-[var(--text)]">{mockStats.activeConsumers}</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="card p-6 border-warning-200 bg-warning-50/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning-800">3 demandes en retard</p>
                  <p className="text-sm text-warning-600 mt-1">
                    Des demandes ACCEPTED n&apos;ont pas été démarrées depuis plus de 24h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
