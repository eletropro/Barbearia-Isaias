/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Gift,
  Award,
  TrendingUp,
  Percent,
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  UserCheck,
  Smartphone
} from 'lucide-react';
import { Client, LoyaltyConfig, User, UserRole } from '../types';
import { BarberStateEngine } from '../barberState';

interface CRMAndLoyaltyViewProps {
  currentUser: User | null;
  clients: Client[];
  loyaltyConfig: LoyaltyConfig;
  onUpdateLoyaltyConfig: (config: LoyaltyConfig) => void;
  onSendCRMBlast: (title: string, template: string, audience: 'todos' | 'inativos' | 'aniversariantes') => void;
}

export default function CRMAndLoyaltyView({
  currentUser,
  clients,
  loyaltyConfig,
  onUpdateLoyaltyConfig,
  onSendCRMBlast
}: CRMAndLoyaltyViewProps) {
  const [activeTab, setActiveTab] = useState<'cartoes' | 'campanhas' | 'parametros'>('cartoes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Campaign Template States
  const [campaignAudience, setCampaignAudience] = useState<'todos' | 'inativos' | 'aniversariantes'>('todos');
  const [campaignTitle, setCampaignTitle] = useState('Promoção de Inverno ❄️');
  const [campaignTemplate, setCampaignTemplate] = useState('Olá {CLIENT_NAME}! Que tal dar um trato no visual hoje? Agende pelo nosso WhatsApp e ganhe 10% de desconto no combo Corte + Barba!');

  // Loyalty Config editing states
  const [pointsRatio, setPointsRatio] = useState(loyaltyConfig.pointsRatio);
  const [cashbackPercent, setCashbackPercent] = useState(loyaltyConfig.cashbackPercent);
  const [pointsThreshold, setPointsThreshold] = useState(loyaltyConfig.pointsThreshold);
  const [couponRewardValue, setCouponRewardValue] = useState(loyaltyConfig.couponRewardValue);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Apenas administradores podem alterar as regras de cashback!');
      return;
    }
    onUpdateLoyaltyConfig({
      pointsRatio: parseFloat(pointsRatio.toString()),
      cashbackPercent: parseFloat(cashbackPercent.toString()),
      pointsThreshold: parseInt(pointsThreshold.toString(), 10),
      couponRewardValue: parseFloat(couponRewardValue.toString())
    });
    alert('Configurações de fidelidade e cashback atualizadas com sucesso!');
  };

  const handleCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle || !campaignTemplate) {
      alert('Preencha os campos da campanha!');
      return;
    }
    onSendCRMBlast(campaignTitle, campaignTemplate, campaignAudience);
    alert(`Disparo da campanha "${campaignTitle}" efetuado para os clientes selecionados! Um registro foi adicionado ao mural de notificações.`);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6" id="crm_and_loyalty_view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            CRM & Fidelidade Inteligente
          </h2>
          <p className="text-sm text-gray-500">
            Acompanhe o saldo de cashback dos clientes, defina metas de pontos para cupons automáticos e envie disparos de engajamento.
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('cartoes')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'cartoes'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Cartões de Fidelidade Ativos
        </button>
        <button
          onClick={() => setActiveTab('campanhas')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'campanhas'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Disparos CRM (Engajamento)
        </button>
        <button
          onClick={() => setActiveTab('parametros')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'parametros'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Parâmetros do Programa
        </button>
      </div>

      {activeTab === 'cartoes' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar cliente por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Grid list loyalty cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(c => {
              const scorePercent = Math.min(100, (c.loyaltyPoints / loyaltyConfig.pointsThreshold) * 100);
              const eligibleForReward = c.loyaltyPoints >= loyaltyConfig.pointsThreshold;

              return (
                <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                  {/* Digital Wallet Card Styling top decoration */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600"></div>

                  <div className="flex justify-between items-start pt-1">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm truncate">{c.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">{c.phone}</p>
                    </div>
                    {eligibleForReward && (
                      <span className="bg-yellow-100 text-yellow-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                        <Sparkles className="h-3 w-3 text-yellow-600" /> Prêmio Disponível
                      </span>
                    )}
                  </div>

                  {/* Points and Cashback values */}
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-center border-r border-gray-200">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Pontos Acumulados</span>
                      <p className="text-xl font-extrabold text-indigo-700 font-mono">{c.loyaltyPoints}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Cashback Disponível</span>
                      <p className="text-xl font-extrabold text-emerald-700 font-mono">R$ {c.cashbackAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Progress bar to next prize */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span>Progresso p/ Cupom de R$ {loyaltyConfig.couponRewardValue}</span>
                      <span>{c.loyaltyPoints} / {loyaltyConfig.pointsThreshold}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-300" style={{ width: `${scorePercent}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[10px] text-gray-500 border-t border-gray-50">
                    <span>Membro desde: {new Date().toLocaleDateString()}</span>
                    <button
                      onClick={() => {
                        alert(`Cartão Digital: ${c.name}\nPontos: ${c.loyaltyPoints}\nCashback: R$ ${c.cashbackAmount.toFixed(2)}\nFidelidade sincronizada no Firestore.`);
                      }}
                      className="text-purple-600 font-bold hover:underline"
                    >
                      Ver Extrato
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'campanhas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* CRM Blast form */}
          <form onSubmit={handleCampaignSubmit} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Configurar Disparo de Engajamento</h3>
              <p className="text-xs text-gray-500">Escreva um modelo de mensagem direcionado e selecione o público ideal para fidelizar.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Público-Alvo</label>
              <select
                value={campaignAudience}
                onChange={(e) => setCampaignAudience(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
              >
                <option value="todos">Todos os Clientes Ativos ({clients.length})</option>
                <option value="inativos">Clientes Inativos há +30 dias</option>
                <option value="aniversariantes">Aniversariantes do Mês</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Título da Campanha</label>
              <input
                type="text"
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Modelo de Texto (WhatsApp / SMS)</label>
              <textarea
                required
                value={campaignTemplate}
                onChange={(e) => setCampaignTemplate(e.target.value)}
                rows={4}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none font-sans text-gray-700"
              />
              <p className="text-[10px] text-gray-400 mt-1">Dica: Use <span className="font-bold">{`{CLIENT_NAME}`}</span> para personalizar o nome do cliente no envio automático.</p>
            </div>

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="h-4 w-4" /> Disparar Campanha de Fidelidade
            </button>
          </form>

          {/* Simulated WhatsApp notification preview */}
          <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 max-w-sm mx-auto">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Smartphone className="h-5 w-5 text-purple-400" />
              <div>
                <h4 className="text-xs font-bold">Simulador de Telefone</h4>
                <p className="text-[9px] text-gray-400">Exemplo da mensagem no celular do cliente</p>
              </div>
            </div>

            <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-900/60 text-slate-100 text-xs space-y-2 relative">
              <span className="absolute bottom-2 right-3 text-[8px] text-emerald-400 font-mono">14:15 ✔✔</span>
              <p className="font-semibold text-emerald-400">📱 WhatsApp {BarberStateEngine.getCompanyConfig().name}</p>
              <p className="text-[11px] leading-relaxed italic text-slate-300">
                "{campaignTemplate.replace('{CLIENT_NAME}', clients[0]?.name || 'Carlos')}"
              </p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl text-[10px] text-slate-400 border border-slate-800">
              <p className="font-bold text-purple-400 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> API de WhatsApp Pronta!
              </p>
              <p className="mt-1">A integração de disparo utiliza os ganchos do Node.js backend. Ao disparar, as notificações automáticas do sistema alertam o cliente em tempo real.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'parametros' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
          <form onSubmit={handleSaveParameters} className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Configurar Cashback e Multiplicadores</h3>
              <p className="text-xs text-gray-500">Defina o comportamento matemático do programa de recompensas para toda a barbearia.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pontos por Real Gasto (Ratio)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={pointsRatio}
                  onChange={(e) => setPointsRatio(parseFloat(e.target.value) || 0.5)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                />
                <p className="text-[9px] text-gray-400 mt-1">Ex: 1 Real gasto = 1 Ponto de fidelidade</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">% de Cashback nas Vendas</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={cashbackPercent}
                  onChange={(e) => setCashbackPercent(parseFloat(e.target.value) || 5)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                />
                <p className="text-[9px] text-gray-400 mt-1">Ex: 5% de cashback sobre o total pago</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Limiar de Pontos para Prêmio (Threshold)</label>
                <input
                  type="number"
                  required
                  value={pointsThreshold}
                  onChange={(e) => setPointsThreshold(parseInt(e.target.value, 10) || 100)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                />
                <p className="text-[9px] text-gray-400 mt-1">Quantidade de pontos necessários para liberar bônus</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Valor do Cupom de Recompensa (R$)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={couponRewardValue}
                  onChange={(e) => setCouponRewardValue(parseFloat(e.target.value) || 15)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none font-bold"
                />
                <p className="text-[9px] text-gray-400 mt-1">Valor de desconto do cupom automático gerado</p>
              </div>
            </div>

            {isAdmin ? (
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all mt-2"
              >
                Salvar Regras de Cashback
              </button>
            ) : (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs mt-2 font-semibold">
                Modo Leitura. Apenas administradores podem reconfigurar os percentuais matemáticos do cashback comercial.
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
