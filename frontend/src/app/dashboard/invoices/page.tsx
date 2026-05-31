'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { StatusBadge, CurrencyDisplay, EmptyState } from '@/components/Badges';
import { api } from '@/lib/api';
import { Invoice } from '@/lib/types';
import { Plus, Download, Filter } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await api.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await api.payInvoice(id);
      await loadInvoices();
    } catch (error) {
      console.error('Failed to pay invoice');
    }
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(i => i.status === filter);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getServiceName = (invoice: Invoice) => {
    return invoice.serviceRequest?.serviceName || 'Service';
  };

  return (
    <>
      <Header 
        onMenuClick={() => {}} 
        title="Factures" 
        subtitle="Gestion des factures (ACK)"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-sm text-[var(--text-muted)]">Total émises</p>
            <p className="text-2xl font-bold text-[var(--text)] mt-1">{invoices.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-[var(--text-muted)]">En attente</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {invoices.filter(i => i.status === 'PENDING').length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-[var(--text-muted)]">Payées</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {invoices.filter(i => i.status === 'PAID').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {['all', 'PENDING', 'PAID', 'CANCELLED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {f === 'all' ? 'Toutes' : f === 'PENDING' ? 'En attente' : f === 'PAID' ? 'Payées' : 'Annulées'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Chargement...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Download}
                title="Aucune facture"
                description="Les factures seront générées automatiquement après accomplissement d'un service"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">N° Facture</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Émise le</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={invoice.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[var(--text)]">INV-{String(index + 1).padStart(5, '0')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[var(--text)]">{getServiceName(invoice)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-muted)]">{formatDate(invoice.issuedAt)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-lg transition-colors" title="Télécharger">
                            <Download className="w-4 h-4" />
                          </button>
                          {invoice.status === 'PENDING' && (
                            <button 
                              onClick={() => handlePay(invoice.id)}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            >
                              Marquer payée
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
