/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Calendar,
  DollarSign,
  Briefcase,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  LogOut,
  Sparkles,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Client, Product, Service, Appointment, Sale, CashRegister, User, UserRole } from '../types';

interface DashboardProps {
  currentUser: User | null;
  clients: Client[];
  products: Product[];
  services: Service[];
  appointments: Appointment[];
  sales: Sale[];
  cashRegister: CashRegister;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  currentUser,
  clients,
  products,
  services,
  appointments,
  sales,
  cashRegister,
  onNavigate
}: DashboardProps) {
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Faturamento do dia
    const todaySales = sales.filter(s => s.date.startsWith(todayStr) && s.status === 'concluido');
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

    // 2. Clientes atendidos hoje
    const todayAppointmentsFinished = appointments.filter(
      a => a.date === todayStr && a.status === 'finalizado'
    ).length;

    // 3. Produtos vendidos hoje
    let todayProductsSold = 0;
    todaySales.forEach(s => {
      s.items.forEach(item => {
        if (item.type === 'product') {
          todayProductsSold += item.quantity;
        }
      });
    });

    // 4. Agendamentos pendentes/confirmados hoje
    const todayAppointmentsScheduled = appointments.filter(
      a => a.date === todayStr && (a.status === 'agendado' || a.status === 'confirmado' || a.status === 'em_atendimento')
    ).length;

    // 5. Comissões a pagar hoje / geradas hoje
    // Para as vendas concluídas hoje, calcular a comissão de cada item que for serviço
    let todayCommissions = 0;
    todaySales.forEach(s => {
      s.items.forEach(item => {
        if (item.type === 'service') {
          // Achar a comissão percentual do serviço
          const srv = services.find(sv => sv.id === item.itemId);
          const pct = srv ? srv.commissionPercent : 40;
          todayCommissions += (item.price * item.quantity) * (pct / 100);
        }
      });
    });

    // 6. Caixa do dia (Saldo atual do caixa)
    const currentCashBalance = cashRegister.isOpen ? cashRegister.currentBalance : 0;

    // 7. Lucro do dia (Faturamento hoje menos o custo de aquisição dos produtos vendidos e comissões do dia)
    let productCostsToday = 0;
    todaySales.forEach(s => {
      s.items.forEach(item => {
        if (item.type === 'product') {
          const prod = products.find(p => p.id === item.itemId);
          if (prod) {
            productCostsToday += prod.buyPrice * item.quantity;
          }
        }
      });
    });
    const todayProfit = todayRevenue - todayCommissions - productCostsToday;

    // Low stock warning count
    const lowStockCount = products.filter(p => p.quantity <= p.minStock && p.status === 'ativo').length;

    return {
      todayRevenue,
      todayAppointmentsFinished,
      todayProductsSold,
      todayAppointmentsScheduled,
      todayCommissions,
      currentCashBalance,
      todayProfit,
      lowStockCount
    };
  }, [sales, appointments, products, services, cashRegister]);

  // Chart Data Generation
  const weeklyData = useMemo(() => {
    // Last 7 days
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      const daySales = sales.filter(s => s.date.startsWith(dateStr) && s.status === 'concluido');
      const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
      
      // Calculate profit
      let commission = 0;
      let cost = 0;
      daySales.forEach(s => {
        s.items.forEach(item => {
          if (item.type === 'service') {
            const srv = services.find(sv => sv.id === item.itemId);
            const pct = srv ? srv.commissionPercent : 40;
            commission += (item.price * item.quantity) * (pct / 100);
          } else {
            const prod = products.find(p => p.id === item.itemId);
            cost += prod ? prod.buyPrice * item.quantity : 0;
          }
        });
      });
      const profit = revenue - commission - cost;

      result.push({
        name: dayName,
        'Faturamento (R$)': revenue,
        'Lucro Líquido (R$)': parseFloat(profit.toFixed(2))
      });
    }
    return result;
  }, [sales, services, products]);

  const monthlyData = useMemo(() => {
    // Split last 4 weeks
    const result = [];
    const today = new Date();

    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(today.getDate() - (i * 7) - 6);
      const end = new Date();
      end.setDate(today.getDate() - (i * 7));

      const label = `Semana -${i}`;

      const periodSales = sales.filter(s => {
        const sDate = new Date(s.date);
        return sDate >= start && sDate <= end && s.status === 'concluido';
      });

      const revenue = periodSales.reduce((sum, s) => sum + s.total, 0);
      
      let commission = 0;
      let cost = 0;
      periodSales.forEach(s => {
        s.items.forEach(item => {
          if (item.type === 'service') {
            const srv = services.find(sv => sv.id === item.itemId);
            const pct = srv ? srv.commissionPercent : 40;
            commission += (item.price * item.quantity) * (pct / 100);
          } else {
            const prod = products.find(p => p.id === item.itemId);
            cost += prod ? prod.buyPrice * item.quantity : 0;
          }
        });
      });
      const profit = revenue - commission - cost;

      result.push({
        name: label,
        'Faturamento (R$)': revenue,
        'Lucro Líquido (R$)': parseFloat(profit.toFixed(2))
      });
    }
    return result;
  }, [sales, services, products]);

  // Ranking of top-performing barbers
  const barberRanking = useMemo(() => {
    const map: { [name: string]: { value: number; count: number; name: string } } = {};
    sales.forEach(s => {
      if (s.status === 'concluido') {
        if (!map[s.employeeName]) {
          map[s.employeeName] = { value: 0, count: 0, name: s.employeeName };
        }
        map[s.employeeName].value += s.total;
        map[s.employeeName].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 3);
  }, [sales]);

  const chartData = chartPeriod === 'weekly' ? weeklyData : monthlyData;

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6" id="dashboard_view">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {isAdmin ? 'Acesso Administrativo' : 'Acesso Funcionário'}
            </span>
            <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">Olá, {currentUser?.name || 'Bem-vindo'}!</h1>
          <p className="text-purple-200 text-sm mt-1">
            {isAdmin 
              ? 'Aqui está o desempenho financeiro e operacional da Barbearia Isaias hoje.'
              : 'Gerencie seus atendimentos, comissões, agende clientes e registre vendas.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.lowStockCount > 0 && (
            <button 
              onClick={() => onNavigate('produtos')}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-amber-500/30 transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{stats.lowStockCount} produto(s) com estoque baixo!</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento do Dia */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200 min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">Faturamento Hoje</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">R$ {stats.todayRevenue.toFixed(2)}</h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>Sincronizado via Firestore</span>
            </span>
          </div>
        </div>

        {/* Card 2: Clientes Atendidos */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200 min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">Atendimentos Concluídos</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{stats.todayAppointmentsFinished} clientes</h3>
            <span className="text-xs text-gray-500 mt-1 block">
              +{stats.todayAppointmentsScheduled} agendados para hoje
            </span>
          </div>
        </div>

        {/* Card 3: Produtos Vendidos */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200 min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">Produtos Vendidos Hoje</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{stats.todayProductsSold} unidades</h3>
            <span className="text-xs text-amber-600 font-semibold mt-1 block hover:underline cursor-pointer" onClick={() => onNavigate('produtos')}>
              Controle de estoque ativo
            </span>
          </div>
        </div>

        {/* Card 4: Comissões de Hoje */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200 min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">
              {isAdmin ? 'Comissões Geradas Hoje' : 'Minha Comissão Hoje'}
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Percent className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">R$ {stats.todayCommissions.toFixed(2)}</h3>
            <span className="text-xs text-indigo-600 font-semibold mt-1 block hover:underline cursor-pointer" onClick={() => onNavigate('comissoes')}>
              Ver metas de comissão
            </span>
          </div>
        </div>
      </div>

      {/* Admin specific stats (Caixa and Lucro) */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/15 flex justify-between items-center">
            <div>
              <span className="text-emerald-800 text-sm font-semibold block">Caixa do Dia</span>
              <h3 className="text-3xl font-extrabold text-emerald-900 mt-1">R$ {stats.currentCashBalance.toFixed(2)}</h3>
              <p className="text-xs text-emerald-700 mt-1">Fundo inicial + vendas em dinheiro e PIX</p>
            </div>
            <span className="p-3 bg-emerald-500/10 text-emerald-700 rounded-2xl">
              <DollarSign className="h-6 w-6" />
            </span>
          </div>

          <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/15 flex justify-between items-center">
            <div>
              <span className="text-blue-800 text-sm font-semibold block">Lucro Estimado Hoje</span>
              <h3 className="text-3xl font-extrabold text-blue-900 mt-1">R$ {stats.todayProfit.toFixed(2)}</h3>
              <p className="text-xs text-blue-700 mt-1">Total hoje menos custos e comissões</p>
            </div>
            <span className="p-3 bg-blue-500/10 text-blue-700 rounded-2xl">
              <Briefcase className="h-6 w-6" />
            </span>
          </div>
        </div>
      )}

      {/* Visual Charts & Ranking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Main Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Análise de Performance Comercial</h2>
              <p className="text-sm text-gray-500">Acompanhamento do faturamento versus lucro líquido</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  chartPeriod === 'weekly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  chartPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Mensal
              </button>
            </div>
          </div>

          {/* Recharts Component */}
          {isAdmin ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#820ad1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#820ad1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: 'none', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Faturamento (R$)" stroke="#820ad1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="Lucro Líquido (R$)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
              <DollarSign className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-700 font-semibold text-sm">Visualização Restrita</p>
              <p className="text-gray-500 text-xs mt-1 max-w-sm">
                Como funcionário, você não tem permissão para visualizar relatórios financeiros da empresa. Consulte a guia "Minhas Comissões" para ver seus ganhos individuais.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Ranking and CRM Quick Alerts */}
        <div className="space-y-6">
          {/* Barber Ranking */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-purple-600" />
              <h3 className="text-md font-bold text-gray-900">Ranking dos Barbeiros</h3>
            </div>
            
            <div className="space-y-4">
              {barberRanking.length > 0 ? (
                barberRanking.map((barber, idx) => (
                  <div key={barber.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                        {idx + 1}º
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{barber.name}</p>
                        <p className="text-xs text-gray-500">{barber.count} vendas registradas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">R$ {barber.value.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Nenhuma venda realizada neste período.</p>
              )}
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="text-md font-bold mb-3">Atalhos Rápidos</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('agenda')}
                className="bg-white/10 hover:bg-white/15 px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all"
              >
                Ver Agenda
              </button>
              <button
                onClick={() => onNavigate('vendas')}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all"
              >
                Nova Venda (PDV)
              </button>
              <button
                onClick={() => onNavigate('clientes')}
                className="bg-white/10 hover:bg-white/15 px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all"
              >
                Cadastrar Cliente
              </button>
              <button
                onClick={() => onNavigate('portal_cliente')}
                className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2.5 rounded-xl text-xs font-semibold text-center transition-all"
              >
                App do Cliente 📱
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
