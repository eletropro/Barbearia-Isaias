/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Percent,
  Plus,
  Minus,
  Lock,
  Unlock,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  FileText,
  BarChart,
  UserCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { CashRegister, Sale, User, UserRole, Service, Product } from '../types';

interface FinanceAndReportsViewProps {
  currentUser: User | null;
  cashRegister: CashRegister;
  sales: Sale[];
  barbers: User[];
  services: Service[];
  products: Product[];
  onOpenCash: (initial: number) => void;
  onCloseCash: () => void;
  onAddCashMovement: (type: 'suprimento' | 'sangria' | 'despesa', amount: number, description: string) => void;
}

export default function FinanceAndReportsView({
  currentUser,
  cashRegister,
  sales,
  barbers,
  services,
  products,
  onOpenCash,
  onCloseCash,
  onAddCashMovement
}: FinanceAndReportsViewProps) {
  const [activeTab, setActiveTab] = useState<'caixa' | 'financeiro' | 'comissoes' | 'relatorios'>('caixa');

  // Modal manual cash movement state
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [moveType, setMoveType] = useState<'suprimento' | 'sangria' | 'despesa'>('suprimento');
  const [moveAmount, setMoveAmount] = useState(0);
  const [moveReason, setMoveReason] = useState('');

  // Initial cash register opening state
  const [initialOpeningAmount, setInitialOpeningAmount] = useState(150);

  // Report filter states
  const [reportPeriod, setReportPeriod] = useState<'diario' | 'semanal' | 'mensal' | 'anual'>('diario');

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // 1. Commissions Compilation per Barber
  const commissionsSummary = useMemo(() => {
    return barbers.map(barber => {
      // Find sales belonging to this barber
      const barberSales = sales.filter(s => s.employeeId === barber.id && s.status === 'concluido');
      
      let totalSold = 0;
      let commissionEarned = 0;
      let serviceCount = 0;

      barberSales.forEach(s => {
        s.items.forEach(item => {
          totalSold += item.price * item.quantity;
          if (item.type === 'service') {
            serviceCount += item.quantity;
            // Get commission percent
            const srv = services.find(sv => sv.id === item.itemId);
            const pct = srv ? srv.commissionPercent : 40;
            commissionEarned += (item.price * item.quantity) * (pct / 100);
          }
        });
      });

      // Meta check
      const metaReached = totalSold >= barber.targetMonth;
      const finalBonus = metaReached ? barber.bonusAmount : 0;

      return {
        id: barber.id,
        name: barber.name,
        photoUrl: barber.photoUrl,
        serviceCount,
        totalSold,
        commissionEarned,
        targetMonth: barber.targetMonth,
        bonusAmount: barber.bonusAmount,
        metaReached,
        finalBonus,
        totalCompensation: commissionEarned + finalBonus
      };
    });
  }, [barbers, sales, services]);

  // 2. Financial Metrics Calculations
  const financialTotals = useMemo(() => {
    // Net profit, total cost, total services revenues, total product revenues
    let servicesRevenue = 0;
    let productsRevenue = 0;
    let productAcquisitionCost = 0;
    let totalCommissionsPaid = 0;

    const completedSales = sales.filter(s => s.status === 'concluido');

    completedSales.forEach(s => {
      s.items.forEach(item => {
        const val = item.price * item.quantity;
        if (item.type === 'service') {
          servicesRevenue += val;
          // compute commission
          const srv = services.find(sv => sv.id === item.itemId);
          const pct = srv ? srv.commissionPercent : 40;
          totalCommissionsPaid += val * (pct / 100);
        } else {
          productsRevenue += val;
          // compute cost
          const prod = products.find(p => p.id === item.itemId);
          if (prod) {
            productAcquisitionCost += prod.buyPrice * item.quantity;
          }
        }
      });
    });

    const manualExpenses = cashRegister.movements
      .filter(m => m.type === 'despesa')
      .reduce((sum, m) => sum + m.amount, 0);

    const manualRevenues = cashRegister.movements
      .filter(m => m.type === 'suprimento')
      .reduce((sum, m) => sum + m.amount, 0);

    const totalRevenue = servicesRevenue + productsRevenue + manualRevenues;
    const totalOutflow = totalCommissionsPaid + productAcquisitionCost + manualExpenses;
    const netProfit = totalRevenue - totalOutflow;

    return {
      servicesRevenue,
      productsRevenue,
      productAcquisitionCost,
      totalCommissionsPaid,
      manualExpenses,
      manualRevenues,
      totalRevenue,
      totalOutflow,
      netProfit
    };
  }, [sales, services, products, cashRegister]);

  // 3. Periodic Reports Calculation
  const reportSummary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();
    
    // Filter sales based on period
    const filteredSales = sales.filter(s => {
      if (s.status !== 'concluido') return false;
      const sDate = new Date(s.date);

      if (reportPeriod === 'diario') {
        return s.date.startsWith(todayStr);
      } else if (reportPeriod === 'semanal') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        return sDate >= sevenDaysAgo;
      } else if (reportPeriod === 'mensal') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return sDate >= thirtyDaysAgo;
      } else { // anual
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return sDate >= startOfYear;
      }
    });

    let billing = 0;
    let productsCount = 0;
    let servicesCount = 0;

    filteredSales.forEach(s => {
      billing += s.total;
      s.items.forEach(item => {
        if (item.type === 'product') {
          productsCount += item.quantity;
        } else {
          servicesCount += item.quantity;
        }
      });
    });

    // Ranking of seller's billing for report period
    const sellerBillingMap: { [name: string]: number } = {};
    filteredSales.forEach(s => {
      sellerBillingMap[s.employeeName] = (sellerBillingMap[s.employeeName] || 0) + s.total;
    });

    const ranking = Object.entries(sellerBillingMap)
      .map(([name, val]) => ({ name, value: val }))
      .sort((a, b) => b.value - a.value);

    return {
      billing,
      productsCount,
      servicesCount,
      totalOrders: filteredSales.length,
      ranking
    };
  }, [sales, reportPeriod]);

  const handleSubmitCashMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (moveAmount <= 0 || !moveReason) {
      alert('Preencha os dados corretamente!');
      return;
    }
    try {
      onAddCashMovement(moveType, moveAmount, moveReason);
      setIsMoveOpen(false);
      setMoveAmount(0);
      setMoveReason('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenCashRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenCash(initialOpeningAmount);
  };

  // Recharts Data of Revenues vs Expenses
  const financeChartData = [
    { name: 'Receita Serviços', Valor: financialTotals.servicesRevenue, color: '#820ad1' },
    { name: 'Receita Venda Prod.', Valor: financialTotals.productsRevenue, color: '#3b82f6' },
    { name: 'Comissões Pagas', Valor: financialTotals.totalCommissionsPaid, color: '#ec4899' },
    { name: 'Custos Aquisição', Valor: financialTotals.productAcquisitionCost, color: '#f59e0b' },
    { name: 'Despesas Gerais', Valor: financialTotals.manualExpenses, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6" id="finance_and_reports_view">
      {/* Tab Selectors */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-lg">
        <button
          onClick={() => setActiveTab('caixa')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
            activeTab === 'caixa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Caixa Diário
        </button>
        <button
          onClick={() => setActiveTab('comissoes')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
            activeTab === 'comissoes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Comissões & Metas
        </button>
        <button
          onClick={() => setActiveTab('financeiro')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
            activeTab === 'financeiro' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Fluxo Financeiro
        </button>
        <button
          onClick={() => setActiveTab('relatorios')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
            activeTab === 'relatorios' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Relatórios Faturamento
        </button>
      </div>

      {/* TAB 1: Caixa Diário (Accessible to all roles, but actions can be restricted) */}
      {activeTab === 'caixa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cash Register State Card */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">Status do Caixa</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                cashRegister.isOpen ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-red-100 border-red-200 text-red-800'
              }`}>
                {cashRegister.isOpen ? 'CAIXA ABERTO' : 'CAIXA FECHADO'}
              </span>
            </div>

            {cashRegister.isOpen ? (
              /* Opened layout info */
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Saldo Acumulado Atual</span>
                  <h3 className="text-3xl font-extrabold text-gray-950 mt-1">
                    R$ {cashRegister.currentBalance.toFixed(2)}
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-gray-500 border-t border-gray-100 pt-2 font-mono">
                    <div>
                      <span className="block text-gray-400">Abertura:</span>
                      <span className="font-bold text-gray-700">R$ {cashRegister.initialBalance.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Operador:</span>
                      <span className="font-bold text-gray-700 truncate block">{cashRegister.openedBy}</span>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMoveType('suprimento');
                      setIsMoveOpen(true);
                    }}
                    className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-2.5 rounded-xl text-xs font-bold border border-purple-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Registrar Entrada (Suprimento)
                  </button>
                  <button
                    onClick={() => {
                      setMoveType('sangria');
                      setIsMoveOpen(true);
                    }}
                    className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-xl text-xs font-bold border border-amber-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Minus className="h-4 w-4" /> Registrar Saída (Sangria)
                  </button>
                  <button
                    onClick={() => {
                      setMoveType('despesa');
                      setIsMoveOpen(true);
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold border border-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Minus className="h-4 w-4" /> Lançar Despesa de Caixa
                  </button>

                  {isAdmin ? (
                    <button
                      onClick={onCloseCash}
                      className="w-full bg-slate-900 hover:bg-slate-950 text-white py-3 rounded-xl text-xs font-bold shadow-md transition-all text-center flex items-center justify-center gap-1"
                    >
                      <Lock className="h-4 w-4" /> Fechar Caixa do Dia
                    </button>
                  ) : (
                    <p className="text-[10px] text-gray-400 text-center italic mt-2">
                      Apenas administradores podem fechar o caixa.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Closed layout open-form */
              <form onSubmit={handleOpenCashRegister} className="space-y-4 pt-2">
                <div className="bg-amber-50 text-amber-800 p-3.5 rounded-xl text-xs flex gap-2 border border-amber-100">
                  <Unlock className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                  <div>
                    <p className="font-bold">Abertura Obrigatória</p>
                    <p className="mt-0.5">O caixa está fechado. Para registrar vendas ou movimentações, é preciso abri-lo informando um fundo inicial.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fundo de Troco Inicial (R$)</label>
                  <input
                    type="number"
                    required
                    value={initialOpeningAmount}
                    onChange={(e) => setInitialOpeningAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-gray-200 text-sm rounded-xl focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-xs font-bold shadow-md transition-all text-center"
                >
                  Abrir Caixa Diário
                </button>
              </form>
            )}
          </div>

          {/* Movements History List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[350px]">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">Movimentações do Caixa Aberto</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {cashRegister.movements.length > 0 ? (
                cashRegister.movements.map(m => (
                  <div key={m.id} className="p-4 flex justify-between items-center text-xs hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`p-2.5 rounded-xl font-bold font-mono border ${
                        m.type === 'entrada_venda' || m.type === 'suprimento'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {m.type === 'entrada_venda' || m.type === 'suprimento' ? '+' : '-'}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{m.description}</p>
                        <p className="text-[10px] text-gray-400">Operador: {m.user} • {new Date(m.date).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-extrabold font-mono text-sm ${
                        m.type === 'entrada_venda' || m.type === 'suprimento'
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}>
                        R$ {m.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                  <Layers className="h-8 w-8 mb-2 text-gray-300" />
                  <p className="text-xs font-semibold text-gray-500">Nenhuma movimentação lançada neste turno.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Comissões & Metas (Accessible to both but employees can only consult themselves) */}
      {activeTab === 'comissoes' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h3 className="text-md font-bold text-gray-900">Acompanhamento Individual de Comissões e Metas</h3>
              <p className="text-xs text-gray-500">Visualize quantidade de atendimentos, faturamento total, comissão líquida acumulada e alcance de metas.</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-xl text-xs font-bold">
              Bônus por Meta Atingida: R$ {barbers.reduce((sum, b) => sum + b.bonusAmount, 0).toFixed(2)} total
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commissionsSummary.map(c => {
              // Strict accessibility boundary: employee can only view their own commissions!
              const isSelf = currentUser?.id === c.id;
              const hasAccess = isAdmin || isSelf;

              if (!hasAccess) {
                return (
                  <div key={c.id} className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-2 opacity-60">
                    <Lock className="h-6 w-6 text-gray-400" />
                    <p className="text-xs font-bold text-gray-700">Comissão de {c.name}</p>
                    <p className="text-[10px] text-gray-400">Privado. Permissão restrita a administradores e ao próprio funcionário.</p>
                  </div>
                );
              }

              // Access allowed
              const progressPct = Math.min(100, (c.totalSold / c.targetMonth) * 100);

              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.photoUrl}
                        alt={c.name}
                        className="h-12 w-12 rounded-full object-cover border border-purple-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{c.name}</h4>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{c.serviceCount} Atendimentos</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-gray-50 py-3 font-mono">
                      <div>
                        <span className="block text-gray-400 text-[10px] uppercase font-bold">Total Vendido:</span>
                        <span className="font-extrabold text-gray-900">R$ {c.totalSold.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 text-[10px] uppercase font-bold">Comissão Líquida:</span>
                        <span className="font-extrabold text-purple-700">R$ {c.commissionEarned.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Progress Meta */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500">Meta do Mês: R$ {c.targetMonth}</span>
                        <span className="text-indigo-600">{progressPct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Meta achievement badges */}
                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                    {c.metaReached ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Meta Batida (+R$ {c.bonusAmount})
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Faltam R$ {(c.targetMonth - c.totalSold).toFixed(2)}
                      </span>
                    )}

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Ganhos Gerais</span>
                      <span className="font-extrabold text-emerald-700 text-sm">R$ {c.totalCompensation.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Fluxo Financeiro (Admin Only restriction) */}
      {activeTab === 'financeiro' && (
        <div className="space-y-6">
          {!isAdmin ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-3">
              <Lock className="h-10 w-10 text-red-500 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900">Acesso Restrito ao Proprietário</h3>
              <p className="text-xs text-gray-500">
                Você está conectado como funcionário. A visualização do balancete consolidado, receitas brutas, comissões globais e despesas manuais é estritamente protegida no Firestore para cargos administrativos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              {/* Financial balances */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalhamento Balancete</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Receita de Serviços:</span>
                      <span className="font-bold text-emerald-700 font-mono">+ R$ {financialTotals.servicesRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Vendas de Prateleira:</span>
                      <span className="font-bold text-emerald-700 font-mono">+ R$ {financialTotals.productsRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Entradas Caixa (Manual):</span>
                      <span className="font-bold text-emerald-700 font-mono">+ R$ {financialTotals.manualRevenues.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 hover:bg-gray-50 rounded-lg border-t border-dashed border-gray-200 pt-3">
                      <span className="text-gray-500">Comissões Gerais Pagas:</span>
                      <span className="font-bold text-red-500 font-mono">- R$ {financialTotals.totalCommissionsPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Custos Estoque (C.A.):</span>
                      <span className="font-bold text-red-500 font-mono">- R$ {financialTotals.productAcquisitionCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Despesas / Sangrias (Gerais):</span>
                      <span className="font-bold text-red-500 font-mono">- R$ {financialTotals.manualExpenses.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Lucro Líquido Real</span>
                    <h3 className="text-3xl font-extrabold text-emerald-950 mt-1 font-mono">
                      R$ {financialTotals.netProfit.toFixed(2)}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Chart breakdown */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Visualização de Centros de Custo</h3>
                  <p className="text-xs text-gray-500">Entradas vs. Saídas operacionais divididos por categoria.</p>
                </div>

                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={financeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#fff', borderRadius: '12px' }} />
                      <Bar dataKey="Valor" fill="#820ad1" radius={[8, 8, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Relatórios Faturamento (Admin Only) */}
      {activeTab === 'relatorios' && (
        <div className="space-y-6">
          {!isAdmin ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-3">
              <Lock className="h-10 w-10 text-red-500 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900">Acesso Restrito</h3>
              <p className="text-xs text-gray-500">
                Você precisa ser administrador para visualizar métricas consolidadas de faturamento e rankings de funcionários.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Period selection filters */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Período de Relatório</h4>
                  <p className="text-xs text-gray-500">Selecione para calcular faturamentos e volumes de vendas correspondentes.</p>
                </div>

                <div className="bg-gray-100 p-1 rounded-xl flex w-full sm:w-auto">
                  {(['diario', 'semanal', 'mensal', 'anual'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setReportPeriod(p)}
                      className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        reportPeriod === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* General report metric totals */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Faturamento Bruto</span>
                  <h4 className="text-xl font-extrabold text-purple-700 mt-1 font-mono">
                    R$ {reportSummary.billing.toFixed(2)}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Vendas pagas e concluídas</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Ordens de Serviço</span>
                  <h4 className="text-xl font-extrabold text-gray-950 mt-1 font-mono">
                    {reportSummary.totalOrders} emitidas
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Total de tickets encerrados</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Cadeiras Atendidas</span>
                  <h4 className="text-xl font-extrabold text-gray-950 mt-1 font-mono">
                    {reportSummary.servicesCount} serviços
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Cortes, barbas, pigmentações</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Itens Vendidos</span>
                  <h4 className="text-xl font-extrabold text-gray-950 mt-1 font-mono">
                    {reportSummary.productsCount} unids
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Pomadas, óleos, cosméticos</p>
                </div>
              </div>

              {/* Rankings table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-purple-600" /> Ranking de Faturamento por Vendedor ({reportPeriod})
                </h3>

                <div className="space-y-3.5">
                  {reportSummary.ranking.map((s, idx) => {
                    return (
                      <div key={s.name} className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="bg-purple-50 text-purple-700 h-6 w-6 text-xs font-bold rounded-lg flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-800">{s.name}</span>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-gray-950">R$ {s.value.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {reportSummary.ranking.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">Sem registros comerciais neste período.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Manual Cash Movement Form */}
      {isMoveOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-800">
                Lançar {moveType.toUpperCase()} de Caixa
              </h3>
              <button onClick={() => setIsMoveOpen(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Fechar</button>
            </div>

            <form onSubmit={handleSubmitCashMovement} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Valor do Lançamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={0.01}
                  value={moveAmount}
                  onChange={(e) => setMoveAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-gray-200 text-sm rounded-xl focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Descrição / Justificativa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pagamento de conta de luz, troco do dia..."
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 text-sm rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMoveOpen(false)}
                  className="bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
