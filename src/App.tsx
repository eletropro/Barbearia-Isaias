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
import { User, UserRole, Client, Product, Service, Appointment, Sale, StockMovement, CashRegister, LoyaltyConfig, SystemLog, CompanyConfig, AppNotification } from './types';

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
import AuthView from './components/AuthView';

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
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => BarberStateEngine.getCompanyConfig());

  // Modal Notification Center
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => BarberStateEngine.getNotifications());

  // Sync engine updates to state
  const syncWithEngine = () => {
    const user = BarberStateEngine.getCurrentUser();

    setCurrentUser(user);
    setBarbers([...BarberStateEngine.getUsers()]);
    setClients([...BarberStateEngine.getClients()]);
    setProducts([...BarberStateEngine.getProducts()]);
    setServices([...BarberStateEngine.getServices()]);
    setAppointments([...BarberStateEngine.getAppointments()]);
    setSales([...BarberStateEngine.getSales()]);
    setStockMovements([...BarberStateEngine.getStockMovements()]);
    setCashRegister({ ...BarberStateEngine.getCashRegister() });
    setCompanyConfig(BarberStateEngine.getCompanyConfig());
    setNotifications([...BarberStateEngine.getNotifications()]);
    
    // Map SecurityLog to SystemLog
    const mappedLogs: SystemLog[] = BarberStateEngine.getLogs().map(l => ({
      id: l.id,
      user: l.userName,
      action: l.action,
      date: l.timestamp
    }));
    setSystemLogs(mappedLogs);
  };

  const handleSaveCompanyConfig = (config: CompanyConfig) => {
    BarberStateEngine.saveCompanyConfig(config);
    syncWithEngine();
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
    
    BarberStateEngine.addNotification(
      `Campanha Disparada: ${title} 🚀`,
      `Campanha de marketing disparada com sucesso para ${targets.length} clientes pelo CRM.`,
      'crm'
    );
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

  // Notification management handlers
  const handleMarkNotificationsRead = () => {
    BarberStateEngine.markAllNotificationsAsRead();
    syncWithEngine();
  };

  const handleClearNotifications = () => {
    BarberStateEngine.clearNotifications();
    syncWithEngine();
  };

  const handleDeleteNotification = (id: string) => {
    BarberStateEngine.deleteNotification(id);
    syncWithEngine();
  };

  // Dynamic Deletion handlers
  const handleDeleteClient = (id: string) => {
    BarberStateEngine.deleteClient(id);
    syncWithEngine();
  };

  const handleDeleteProduct = (id: string) => {
    BarberStateEngine.deleteProduct(id);
    syncWithEngine();
  };

  const handleDeleteService = (id: string) => {
    BarberStateEngine.deleteService(id);
    syncWithEngine();
  };

  const handleDeleteAppointment = (id: string) => {
    BarberStateEngine.deleteAppointment(id);
    syncWithEngine();
  };

  const handleDeleteUser = (id: string) => {
    BarberStateEngine.deleteUser(id);
    syncWithEngine();
  };

  // Trigger default syncing on load
  useEffect(() => {
    syncWithEngine();
  }, []);

  const hasAccess = (tab: string) => {
    if (!currentUser) return false;
    if (currentUser.role === UserRole.ADMIN) return true;
    if (currentUser.role === UserRole.CUSTOMER) return false;
    return currentUser.allowedTabs?.includes(tab) ?? ['dashboard', 'agenda', 'vendas', 'clientes'].includes(tab);
  };

  useEffect(() => {
    if (currentUser && currentUser.role === UserRole.EMPLOYEE) {
      if (!hasAccess(activeTab)) {
        const allowed = currentUser.allowedTabs || ['dashboard', 'agenda', 'vendas', 'clientes'];
        if (allowed.length > 0) {
          setActiveTab(allowed[0]);
        }
      }
    }
  }, [currentUser, activeTab]);

  if (!currentUser) {
    return <AuthView onLoginSuccess={syncWithEngine} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  if (currentUser.role === UserRole.CUSTOMER) {
    return (
      <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-900'}`} id="app_root">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <CustomerPortalView
            appointments={appointments}
            clients={clients}
            services={services}
            barbers={barbers}
            loyaltyConfig={loyaltyConfig}
            currentUser={currentUser}
            onSaveAppointment={handleSaveAppointment}
            onSaveClient={handleSaveClient}
            onLogout={() => {
              BarberStateEngine.logout();
              syncWithEngine();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-900'}`} id="app_root">
      
      {/* Visual Frame wrapper */}
      <div className="flex h-screen overflow-hidden">
        
        {/* SIDEBAR FOR DESKTOP / DRAWER FOR MOBILE */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Header branding block */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-purple-400 animate-pulse" />
                <span className="font-extrabold text-sm tracking-widest font-mono text-purple-300 uppercase">{companyConfig.name}</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none text-xs">
            {hasAccess('dashboard') && (
              <button
                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> Painel Comercial
              </button>
            )}
            {hasAccess('agenda') && (
              <button
                onClick={() => { setActiveTab('agenda'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'agenda' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Calendar className="h-4 w-4" /> Agenda & Cadeiras
              </button>
            )}
            {hasAccess('vendas') && (
              <button
                onClick={() => { setActiveTab('vendas'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'vendas' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ShoppingBag className="h-4 w-4" /> Frente de Caixa (PDV)
              </button>
            )}
            {hasAccess('clientes') && (
              <button
                onClick={() => { setActiveTab('clientes'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'clientes' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" /> Clientes & CRM
              </button>
            )}

            {hasAccess('estoque') && (
              <button
                onClick={() => { setActiveTab('estoque'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'estoque' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Package className="h-4 w-4" /> Estoque & Catálogo
              </button>
            )}
            {hasAccess('servicos') && (
              <button
                onClick={() => { setActiveTab('servicos'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'servicos' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Scissors className="h-4 w-4" /> Serviços Menu
              </button>
            )}
            {hasAccess('fidelidade') && (
              <button
                onClick={() => { setActiveTab('fidelidade'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'fidelidade' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Gift className="h-4 w-4" /> Campanhas & Cashback
              </button>
            )}
            {hasAccess('financas') && (
              <button
                onClick={() => { setActiveTab('financas'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'financas' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <DollarSign className="h-4 w-4" /> Caixa & Finanças
              </button>
            )}
            {hasAccess('configuracoes') && (
              <button
                onClick={() => { setActiveTab('configuracoes'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'configuracoes' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4" /> Configs & Firebase
              </button>
            )}

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
                BarberStateEngine.logout();
                syncWithEngine();
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
                <span>Perfil Ativo:</span>
                <span className="text-purple-600 font-extrabold uppercase">{currentUser?.role === 'admin' ? 'Administrador' : currentUser?.role === 'employee' ? 'Funcionário/Barbeiro' : 'Cliente'}</span>
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
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    handleMarkNotificationsRead();
                  }}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/40 relative"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-600 animate-ping"></span>
                  )}
                </button>

                {/* Notifications Dropdown Popup */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3.5 text-xs animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center border-b border-gray-50 dark:border-slate-800 pb-2">
                      <span className="font-bold text-gray-800 dark:text-slate-200">Notificações Recentes</span>
                      <button onClick={handleClearNotifications} className="text-[10px] text-purple-600 font-bold hover:underline">Limpar</button>
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          Nenhuma notificação recente.
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className="p-2.5 bg-gray-50 dark:bg-slate-800/40 rounded-xl space-y-1 relative group">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-gray-800 dark:text-slate-200">{notif.title}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notif.id);
                                }}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-[10px]"
                                title="Remover"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-500">{notif.description}</p>
                            <span className="text-[8px] text-gray-400 font-mono mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Core active viewport container */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto h-full">
              {activeTab === 'dashboard' && hasAccess('dashboard') && (
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

              {activeTab === 'clientes' && hasAccess('clientes') && (
                <ClientsView
                  currentUser={currentUser}
                  clients={clients}
                  onSaveClient={handleSaveClient}
                  onAddAttachment={handleAddAttachment}
                  onDeleteClient={handleDeleteClient}
                />
              )}

              {activeTab === 'estoque' && hasAccess('estoque') && (
                <ProductsView
                  currentUser={currentUser}
                  products={products}
                  stockMovements={stockMovements}
                  onSaveProduct={handleSaveProduct}
                  onRegisterStockMovement={handleRegisterStockMovement}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === 'servicos' && hasAccess('servicos') && (
                <ServicesView
                  currentUser={currentUser}
                  services={services}
                  onSaveService={handleSaveService}
                  onDeleteService={handleDeleteService}
                />
              )}

              {activeTab === 'agenda' && hasAccess('agenda') && (
                <SchedulingView
                  currentUser={currentUser}
                  appointments={appointments}
                  clients={clients}
                  services={services}
                  barbers={barbers}
                  onSaveAppointment={handleSaveAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                />
              )}

              {activeTab === 'vendas' && hasAccess('vendas') && (
                <SalesView
                  currentUser={currentUser}
                  clients={clients}
                  products={products}
                  services={services}
                  barbers={barbers}
                  onRegisterSale={handleRegisterSale}
                />
              )}

              {activeTab === 'financas' && hasAccess('financas') && (
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

              {activeTab === 'fidelidade' && hasAccess('fidelidade') && (
                <CRMAndLoyaltyView
                  currentUser={currentUser}
                  clients={clients}
                  loyaltyConfig={loyaltyConfig}
                  onUpdateLoyaltyConfig={handleUpdateLoyaltyConfig}
                  onSendCRMBlast={handleSendCRMBlast}
                />
              )}

              {activeTab === 'configuracoes' && hasAccess('configuracoes') && (
                <SettingsView
                  currentUser={currentUser}
                  barbers={barbers}
                  systemLogs={systemLogs}
                  companyConfig={companyConfig}
                  onSaveBarber={handleSaveBarber}
                  onSaveCompanyConfig={handleSaveCompanyConfig}
                  onTriggerBackup={handleTriggerBackup}
                  onRestoreBackup={handleRestoreBackup}
                  autoSync={autoSync}
                  onToggleAutoSync={handleToggleAutoSync}
                  onDeleteUser={handleDeleteUser}
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
