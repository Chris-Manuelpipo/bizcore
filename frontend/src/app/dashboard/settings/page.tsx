'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Settings as SettingsIcon, Building, Key, Bell, Globe, Shield } from 'lucide-react';
import { mockTenant } from '@/lib/mock-data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('tenant');

  const tabs = [
    { id: 'tenant', label: 'Tenant', icon: Building },
    { id: 'api', label: 'Clés API', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ];

  return (
    <>
      <Header 
        onMenuClick={() => {}} 
        title="Paramètres" 
        subtitle="Configuration de votre instance BizCore"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs */}
          <div className="lg:w-64 shrink-0">
            <div className="card p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'tenant' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900">Configuration du Tenant</h2>
                  <p className="text-sm text-slate-500 mt-1">Informations de votre instance BizCore</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="label">Nom du tenant</label>
                    <input type="text" defaultValue={mockTenant.name} className="input max-w-md" />
                  </div>
                  <div>
                    <label className="label">Domaine</label>
                    <div className="flex max-w-md">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                        bizcore.io/
                      </span>
                      <input type="text" defaultValue={mockTenant.domain} className="input rounded-l-none flex-1" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea defaultValue={mockTenant.description} className="input max-w-md min-h-24" />
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button className="btn-primary">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900">Clés API</h2>
                  <p className="text-sm text-slate-500 mt-1">Gérez les clés pour accéder à votre API</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Clé API principale</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Active</span>
                    </div>
                    <code className="text-sm text-slate-600 font-mono break-all">
                      bcs_live_550e8400e29b41d4a716446655440000...
                    </code>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button className="btn-secondary">Régénérer la clé</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900">Notifications</h2>
                  <p className="text-sm text-slate-500 mt-1">Configurez vos préférences de notification</p>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Nouvelle demande de service', desc: 'Recevoir une notification quand un consumer crée une demande' },
                    { label: 'Statut modifié', desc: 'Notifications de changement de statut (accept, start, fulfill)' },
                    { label: 'Facture créée', desc: 'Alerte lors de la génération d\'une nouvelle facture' },
                    { label: 'Paiement reçu', desc: 'Confirmation de paiement d\'une facture' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900">Sécurité</h2>
                  <p className="text-sm text-slate-500 mt-1">Paramètres de sécurité pour votre tenant</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">Authentification JWT</p>
                      <p className="text-sm text-slate-500">Tokens signés avec HMAC-SHA256</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Activé</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">Multi-Factor Authentication</p>
                      <p className="text-sm text-slate-500">2FA pour les administrateurs</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded">Optionnel</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button className="btn-secondary">Configurer 2FA</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
