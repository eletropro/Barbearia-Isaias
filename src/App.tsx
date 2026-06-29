/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Users,
  Package,
  Gift,
  DollarSign,
  Settings,
  LogOut,
  UserCheck,
  Bell,
  Sun,
  Moon,
  Layers,
  Menu,
  X,
  Cloud,
  Smartphone
} from 'lucide-react';

// State and Types
import { BarberStateEngine } from './barberState';
import { User, UserRole, Client, Product, Service, Appointment, Sale, StockMovement, CashRegister, LoyaltyConfig, SystemLog } from './types';

// Views
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import ProductsView from './components/ProductsView';
import ServicesView from './components/ServicesView';
import SchedulingView from './components/SchedulingView';
import SalesView from './components/SalesView';
import FinanceAndReportsView from './components/FinanceAndReportsView';
import CRMAndLoyaltyView from './components/CRMAndLoyaltyView';
import SettingsView from './components/SettingsView';
import CustomerPortalView from './components/CustomerPortalView';

export default function App() {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Syncing React tree with local engine state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [barbers, setBarbers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegister>({
    isOpen: false,
    initialBalance: 0,
    currentBalance: 0,
    movements: []
  });
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig>({
    pointsRatio: 0.5,
    cashbackPercent: 5,
    pointsThreshold: 100,
    couponRewardValue: 15
  });
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [autoSync, setAutoSync] = useState<boolean>(true);

  // Modal Notification Center
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // Sync engine updates to state
  const syncWithEngine = () => {
    // Check and set default logged in user if not authenticated
    let user = BarberStateEngine.getCurrentUser();
    if (!user) {
      const users = BarberStateEngine.getUsers();
      user = users[0] || null;
      if (user) {
        BarberStateEngine.login(user.email, user.role, true);
      }
    }

    setCurrentUser(user);
    setBarbers([...BarberStateEngine.getUsers()]);
    setClients([...BarberStateEngine.getClients()]);
    setProducts([...BarberStateEngine.getProducts()]);
    setServices([...BarberStateEngine.getServices()]);
    setAppointments([...BarberStateEngine.getAppointments()]);
    setSales([...BarberStateEngine.getSales()]);
    setStockMovements([...BarberStateEngine.getStockMovements()]);
    setCashRegister({ ...BarberStateEngine.getCashRegister() });
    
    // Map SecurityLog to SystemLog
    const mappedLogs: SystemLog[] = BarberStateEngine.getLogs().map(l => ({
      id: l.id,
      user: l.userName,
      action: l.action,
      date: l.timestamp
    }));
    setSystemLogs(mappedLogs);
  };

  // Switch role helper for testing role constraints easily
  const handleSwitchRole = (role: UserRole) => {
    const user = BarberStateEngine.getCurrentUser();
    if (user) {
      BarberStateEngine.login(user.email, role, true);
      syncWithEngine();
    }
  };

  // State modification wrappers
  const handleSaveClient = (client: any) => {
    BarberStateEngine.saveClient(client);
    syncWithEngine();
  };

  const handleAddAttachment = (clientId: string, name: string, size: string) => {
    BarberStateEngine.addClientAttachment(clientId, name, size);
    syncWithEngine();
  };

  const handleSaveProduct = (product: any) => {
    BarberStateEngine.saveProduct(product);
    syncWithEngine();
  };

  const handleRegisterStockMovement = (productId: string, type: 'entrada' | 'saida_manual' | 'ajuste', quantity: number, reason: string) => {
    BarberStateEngine.registerStockMovement(productId, type, quantity, reason);
    syncWithEngine();
  };

  const handleSaveService = (service: Service) => {
    BarberStateEngine.saveService(service);
    syncWithEngine();
  };

  const handleSaveAppointment = (app: any) => {
    BarberStateEngine.saveAppointment(app);
    syncWithEngine();
  };

  const handleRegisterSale = (saleData: any) => {
    const receipt = BarberStateEngine.registerSale(saleData);
    syncWithEngine();
    return receipt;
  };

  const handleOpenCash = (initial: number) => {
    BarberStateEngine.openCashRegister(initial);
    syncWithEngine();
  };

  const handleCloseCash = () => {
    BarberStateEngine.closeCashRegister();
    syncWithEngine();
  };

  const handleAddCashMovement = (type: 'suprimento' | 'sangria' | 'despesa', amount: number, description: string) => {
    BarberStateEngine.addCashMovement(type, amount, description);
    syncWithEngine();
  };

  const handleUpdateLoyaltyConfig = (config: LoyaltyConfig) => {
    setLoyaltyConfig(config);
    BarberStateEngine.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'admin',
      `Parâmetros de fidelidade alterados: ${config.cashbackPercent}% cashback`,
      'configuracao',
      `Fator multiplicativo alterado.`
    );
    syncWithEngine();
  };

  const handleSendCRMBlast = (title: string, template: string, audience: 'todos' | 'inativos' | 'aniversariantes') => {
    const targets = BarberStateEngine.getCRMClients(audience === 'todos' ? 'ativos' : audience === 'inativos' ? 'inativos' : 'aniversariantes');
    
    BarberStateEngine.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'admin',
      `Disparo de campanha: "${title}"`,
      'cadastro',
      `Disparadas ${targets.length} mensagens para clientes via WhatsApp.`
    );
    
    setNotificationCount(prev => prev + 1);
    syncWithEngine();
  };

  const handleTriggerBackup = () => {
    BarberStateEngine.triggerFirebaseBackup();
    syncWithEngine();
  };

  const handleRestoreBackup = () => {
    // Simulated rollback to seeds
    localStorage.clear();
    syncWithEngine();
  };

  const handleToggleAutoSync = () => {
    setAutoSync(!autoSync);
  };

  const handleSaveBarber = (barberData: any) => {
    BarberStateEngine.saveBarber(barberData);
    syncWithEngine();
  };

  // Trigger default syncing on load
  useEffect(() => {
    syncWithEngine();
  }, []);

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-900'}`} id="app_root">
      
      {/* Visual Frame wrapper */}
      <div className="flex h-screen overflow-hidden">
        
        {/* SIDEBAR FOR DESKTOP / DRAWER FOR MOBILE */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Header branding block */}
          <div className="p-6 border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-purple-400 animate-pulse" />
                <span className="font-extrabold text-sm tracking-widest font-mono text-purple-300 uppercase">BARBEARIA ISAIAS</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick role switcher for testing convenience */}
            <div className="bg-slate-800 p-2.5 rounded-xl border border-white/5 space-y-1.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider">Simular Nível de Acesso</span>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
                <button
                  type="button"
                  onClick={() => handleSwitchRole(UserRole.ADMIN)}
                  className={`py-1 rounded-lg transition-all ${
                    currentUser?.role === UserRole.ADMIN
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  ADMIN
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchRole(UserRole.EMPLOYEE)}
                  className={`py-1 rounded-lg transition-all ${
                    currentUser?.role === UserRole.EMPLOYEE
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  FUNCIONÁRIO
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none text-xs">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Painel Comercial
            </button>
            <button
              onClick={() => { setActiveTab('agenda'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'agenda' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar className="h-4 w-4" /> Agenda & Cadeiras
            </button>
            <button
              onClick={() => { setActiveTab('vendas'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'vendas' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> Frente de Caixa (PDV)
            </button>
            <button
              onClick={() => { setActiveTab('clientes'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'clientes' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" /> Clientes & CRM
            </button>
            <button
              onClick={() => { setActiveTab('estoque'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'estoque' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Package className="h-4 w-4" /> Estoque & Catálogo
            </button>
            <button
              onClick={() => { setActiveTab('servicos'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'servicos' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Scissors className="h-4 w-4" /> Serviços Menu
            </button>
            <button
              onClick={() => { setActiveTab('fidelidade'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'fidelidade' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Gift className="h-4 w-4" /> Campanhas & Cashback
            </button>
            <button
              onClick={() => { setActiveTab('financas'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'financas' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <DollarSign className="h-4 w-4" /> Caixa & Finanças
            </button>
            <button
              onClick={() => { setActiveTab('configuracoes'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'configuracoes' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" /> Configs & Firebase
            </button>
            <button
              onClick={() => { setActiveTab('portal_cliente'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'portal_cliente' ? 'bg-purple-600 text-indigo-200 bg-indigo-600/10 border border-indigo-500/10' : 'text-indigo-400 hover:bg-indigo-500/5 hover:text-indigo-200'
              }`}
            >
              <Smartphone className="h-4 w-4 text-indigo-400" /> App do Cliente 📱
            </button>
          </nav>

          {/* Footer User Profile box */}
          <div className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={currentUser?.name}
                className="h-10 w-10 rounded-full object-cover border border-purple-500/50"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <h4 className="font-extrabold text-xs text-gray-100 truncate">{currentUser?.name}</h4>
                <span className="text-[9px] font-extrabold text-purple-400 uppercase block leading-none mt-0.5">{currentUser?.role}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Login deslogado com sucesso! Redirecionando para interface simplificada.');
              }}
              className="text-gray-500 hover:text-white p-1 rounded-lg"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* MAIN BODY WINDOW */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header Bar */}
          <header className={`px-6 py-4 flex items-center justify-between border-b ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800 p-1">
                <Menu className="h-6 w-6" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-800">
                <UserCheck className="h-3.5 w-3.5 text-purple-500" />
                <span>Modo de Teste:</span>
                <span className="text-purple-600 font-extrabold uppercase">{currentUser?.role}</span>
              </div>
            </div>

            {/* Quick headers controls */}
            <div className="flex items-center gap-4">
              {/* Daily cash balance state indicator badge */}
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/50">
                <Layers className="h-3.5 w-3.5" />
                <span>Caixa do Dia:</span>
                <span className="font-mono">
                  {cashRegister.isOpen ? `R$ ${cashRegister.currentBalance.toFixed(2)}` : 'Fechado'}
                </span>
              </div>

              {/* Theme toggle indicator */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/40"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/40 relative"
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-600 animate-ping"></span>
                  )}
                </button>

                {/* Notifications Dropdown Popup */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3.5 text-xs animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center border-b border-gray-50 dark:border-slate-800 pb-2">
                      <span className="font-bold text-gray-800 dark:text-slate-200">Notificações Recentes</span>
                      <button onClick={() => setNotificationCount(0)} className="text-[10px] text-purple-600 font-bold hover:underline">Limpar</button>
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      <div className="p-2.5 bg-purple-50/40 dark:bg-purple-950/20 rounded-xl space-y-1">
                        <p className="font-bold text-purple-900 dark:text-purple-300">📱 WhatsApp Campanha Disparada</p>
                        <p className="text-[10px] text-gray-500">O robô do CRM enviou os modelos de agendamento de inverno para aniversariantes.</p>
                      </div>
                      <div className="p-2.5 bg-gray-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <p className="font-bold text-gray-800 dark:text-slate-200">🔄 Sincronização Sucedida</p>
                        <p className="text-[10px] text-gray-500">Último backup exportado de forma íntegra para o Firebase Firestore.</p>
                      </div>
                      <div className="p-2.5 bg-gray-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <p className="font-bold text-gray-800 dark:text-slate-200">⚠️ Estoque Baixo Alerta</p>
                        <p className="text-[10px] text-gray-500">A Pomada Modeladora atingiu o estoque mínimo de segurança.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Core active viewport container */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto h-full">
              {activeTab === 'dashboard' && (
                <DashboardView
                  currentUser={currentUser}
                  clients={clients}
                  products={products}
                  services={services}
                  appointments={appointments}
                  sales={sales}
                  cashRegister={cashRegister}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'clientes' && (
                <ClientsView
                  currentUser={currentUser}
                  clients={clients}
                  onSaveClient={handleSaveClient}
                  onAddAttachment={handleAddAttachment}
                />
              )}

              {activeTab === 'estoque' && (
                <ProductsView
                  currentUser={currentUser}
                  products={products}
                  stockMovements={stockMovements}
                  onSaveProduct={handleSaveProduct}
                  onRegisterStockMovement={handleRegisterStockMovement}
                />
              )}

              {activeTab === 'servicos' && (
                <ServicesView
                  currentUser={currentUser}
                  services={services}
                  onSaveService={handleSaveService}
                />
              )}

              {activeTab === 'agenda' && (
                <SchedulingView
                  currentUser={currentUser}
                  appointments={appointments}
                  clients={clients}
                  services={services}
                  barbers={barbers}
                  onSaveAppointment={handleSaveAppointment}
                />
              )}

              {activeTab === 'vendas' && (
                <SalesView
                  currentUser={currentUser}
                  clients={clients}
                  products={products}
                  services={services}
                  barbers={barbers}
                  onRegisterSale={handleRegisterSale}
                />
              )}

              {activeTab === 'financas' && (
                <FinanceAndReportsView
                  currentUser={currentUser}
                  cashRegister={cashRegister}
                  sales={sales}
                  barbers={barbers}
                  services={services}
                  products={products}
                  onOpenCash={handleOpenCash}
                  onCloseCash={handleCloseCash}
                  onAddCashMovement={handleAddCashMovement}
                />
              )}

              {activeTab === 'fidelidade' && (
                <CRMAndLoyaltyView
                  currentUser={currentUser}
                  clients={clients}
                  loyaltyConfig={loyaltyConfig}
                  onUpdateLoyaltyConfig={handleUpdateLoyaltyConfig}
                  onSendCRMBlast={handleSendCRMBlast}
                />
              )}

              {activeTab === 'configuracoes' && (
                <SettingsView
                  currentUser={currentUser}
                  barbers={barbers}
                  systemLogs={systemLogs}
                  onSaveBarber={handleSaveBarber}
                  onTriggerBackup={handleTriggerBackup}
                  onRestoreBackup={handleRestoreBackup}
                  autoSync={autoSync}
                  onToggleAutoSync={handleToggleAutoSync}
                />
              )}

              {activeTab === 'portal_cliente' && (
                <CustomerPortalView
                  appointments={appointments}
                  clients={clients}
                  services={services}
                  barbers={barbers}
                  loyaltyConfig={loyaltyConfig}
                  onSaveAppointment={handleSaveAppointment}
                  onSaveClient={handleSaveClient}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
