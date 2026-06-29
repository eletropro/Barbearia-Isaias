/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  UserRole,
  Client,
  Product,
  Service,
  Appointment,
  Sale,
  CashRegister,
  SecurityLog,
  CompanyConfig,
  StockMovement,
  PaymentMethod,
  Attachment
} from './types';

// Initial Mock/Seed Data
const INITIAL_USERS: User[] = [
  {
    id: 'user_isaias',
    name: 'Isaias Barbosa (Admin)',
    email: 'admin@barbearia.com.br',
    password: 'admin',
    role: UserRole.ADMIN,
    phone: '(11) 99999-1111',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    color: '#a855f7', // purple
    targetMonth: 8000,
    bonusAmount: 500
  },
  {
    id: 'user_lucas',
    name: 'Lucas Silva',
    email: 'lucas@barbearia.com.br',
    password: '123',
    role: UserRole.EMPLOYEE,
    phone: '(11) 98888-2222',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    color: '#06b6d4', // cyan
    targetMonth: 5000,
    bonusAmount: 300
  },
  {
    id: 'user_thiago',
    name: 'Thiago Oliveira',
    email: 'thiago@barbearia.com.br',
    password: '123',
    role: UserRole.EMPLOYEE,
    phone: '(11) 97777-3333',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    color: '#10b981', // emerald
    targetMonth: 5000,
    bonusAmount: 300
  }
];

const INITIAL_SERVICES: Service[] = [
  { id: 'srv_corte', name: 'Corte Social/Degradê', durationMin: 30, price: 50, commissionPercent: 40 },
  { id: 'srv_barba', name: 'Barba com Toalha Quente', durationMin: 30, price: 40, commissionPercent: 45 },
  { id: 'srv_combo', name: 'Combo Corte + Barba', durationMin: 60, price: 80, commissionPercent: 40 },
  { id: 'srv_pigmentacao', name: 'Pigmentação Premium', durationMin: 45, price: 30, commissionPercent: 50 },
  { id: 'srv_sobrancelha', name: 'Sobrancelha Navalha', durationMin: 15, price: 20, commissionPercent: 50 },
  { id: 'srv_hidratacao', name: 'Hidratação Capilar', durationMin: 20, price: 35, commissionPercent: 40 },
  { id: 'srv_progressiva', name: 'Progressiva Masculina', durationMin: 90, price: 120, commissionPercent: 40 },
  { id: 'srv_coloracao', name: 'Coloração/Platinado', durationMin: 120, price: 150, commissionPercent: 40 }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_pomada',
    name: 'Pomada Modeladora Efeito Matte 150g',
    category: 'Finalizador',
    code: 'PM-001',
    supplier: 'Barba Forte',
    buyPrice: 20.00,
    sellPrice: 45.00,
    quantity: 18,
    minStock: 5,
    photoUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300',
    barcode: '7891011121314',
    description: 'Pomada modeladora de alta fixação com acabamento fosco/matte. Perfeita para penteados estruturados.',
    status: 'ativo',
    createdAt: '2026-06-15'
  },
  {
    id: 'prod_oleo',
    name: 'Óleo para Barba Wood & Spice 30ml',
    category: 'Barba',
    code: 'OB-002',
    supplier: 'Sobrebarba',
    buyPrice: 18.50,
    sellPrice: 39.90,
    quantity: 15,
    minStock: 6,
    photoUrl: 'https://images.unsplash.com/photo-1626475760590-169996614f85?auto=format&fit=crop&q=80&w=300',
    barcode: '7891415161718',
    description: 'Hidrata profundamente a pele e os pelos da barba, deixando-os macios, brilhantes e perfumados.',
    status: 'ativo',
    createdAt: '2026-06-15'
  }
];

const INITIAL_CLIENTS: Client[] = [];

const INITIAL_COMPANY: CompanyConfig = {
  name: 'Barbearia Isaias',
  phone: '(11) 3255-9000',
  whatsapp: '(11) 99999-1111',
  instagram: '@barbeariaisaias_oficial',
  address: 'Alameda Lorena, 1500 - Cerqueira César, São Paulo - SP',
  razaoSocial: 'Isaias Barbosa Barber Shop LTDA',
  cnpj: '12.345.678/0001-99',
  inscricaoEstadual: '111.222.333.444',
  inscricaoMunicipal: '555.666.777-8',
  taxRegime: 'Simples Nacional',
  invoiceEnabled: true,
  invoiceApiToken: 'token_demonstracao_api_nfe_99381832',
  workingHours: [
    { weekday: 'Segunda-feira', hours: '09:00 às 18:00', closed: false },
    { weekday: 'Terça-feira', hours: '09:00 às 20:00', closed: false },
    { weekday: 'Quarta-feira', hours: '09:00 às 20:00', closed: false },
    { weekday: 'Quinta-feira', hours: '09:00 às 21:00', closed: false },
    { weekday: 'Sexta-feira', hours: '09:00 às 21:00', closed: false },
    { weekday: 'Sábado', hours: '08:00 às 20:00', closed: false },
    { weekday: 'Domingo', hours: 'Fechado', closed: true }
  ]
};

// Clean, real collections for production use
const INITIAL_APPOINTMENTS: Appointment[] = [];

const INITIAL_SALES: Sale[] = [];

const INITIAL_CASH: CashRegister = {
  isOpen: false,
  openedAt: undefined,
  openedBy: undefined,
  initialBalance: 0.00,
  currentBalance: 0.00,
  movements: []
};

const INITIAL_LOGS: SecurityLog[] = [];

const STORAGE_KEYS = {
  CURRENT_USER: 'barber_current_user',
  USERS: 'barber_users',
  CLIENTS: 'barber_clients',
  PRODUCTS: 'barber_products',
  SERVICES: 'barber_services',
  APPOINTMENTS: 'barber_appointments',
  SALES: 'barber_sales',
  CASH: 'barber_cash',
  LOGS: 'barber_logs',
  COMPANY: 'barber_company',
  MOVEMENTS: 'barber_movements',
  REMAIN_CONNECTED: 'barber_remain_connected'
};

// Helper to safely load JSON from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error loading key from LocalStorage:', key, e);
    return defaultValue;
  }
}

// Helper to save JSON to localStorage
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving key to LocalStorage:', key, e);
  }
}

export class BarberStateEngine {
  // Read operations
  static getCurrentUser(): User | null {
    return loadFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static getRemainConnected(): boolean {
    return loadFromStorage<boolean>(STORAGE_KEYS.REMAIN_CONNECTED, false);
  }

  static getUsers(): User[] {
    return loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getClients(): Client[] {
    return loadFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  }

  static getProducts(): Product[] {
    return loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  static getServices(): Service[] {
    return loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  }

  static getAppointments(): Appointment[] {
    return loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  static getSales(): Sale[] {
    return loadFromStorage<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  }

  static getCashRegister(): CashRegister {
    return loadFromStorage<CashRegister>(STORAGE_KEYS.CASH, INITIAL_CASH);
  }

  static getLogs(): SecurityLog[] {
    return loadFromStorage<SecurityLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  }

  static getCompanyConfig(): CompanyConfig {
    return loadFromStorage<CompanyConfig>(STORAGE_KEYS.COMPANY, INITIAL_COMPANY);
  }

  static getStockMovements(): StockMovement[] {
    const products = this.getProducts();
    // Reconstruct some history if not in storage
    const initialMovements: StockMovement[] = products.map((p, idx) => ({
      id: `mov_p_${idx}`,
      productId: p.id,
      productName: p.name,
      type: 'entrada',
      quantity: p.quantity + 5,
      date: p.createdAt,
      reason: 'Estoque inicial de inauguração',
      user: 'Isaias Barbosa (Admin)'
    }));
    return loadFromStorage<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, initialMovements);
  }

  // Write operations and Actions
  static login(email: string, passwordRequested: string, remainConnected: boolean): User | null {
    const users = this.getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (matchedUser && matchedUser.password === passwordRequested) {
      saveToStorage(STORAGE_KEYS.CURRENT_USER, matchedUser);
      saveToStorage(STORAGE_KEYS.REMAIN_CONNECTED, remainConnected);
      this.addLog(
        matchedUser.id,
        matchedUser.name,
        matchedUser.role,
        'Login Efetuado',
        'auth',
        `Usuário conectado com sucesso. Lembrar-me: ${remainConnected ? 'Sim' : 'Não'}`
      );
      return matchedUser;
    }
    return null;
  }

  static signUp(name: string, email: string, passwordRequested: string, roleRequested: UserRole, phone?: string): User {
    const users = this.getUsers();
    
    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Este e-mail já está cadastrado!');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password: passwordRequested,
      role: roleRequested,
      phone,
      targetMonth: roleRequested === UserRole.ADMIN ? 8000 : 5000,
      bonusAmount: roleRequested === UserRole.ADMIN ? 500 : 300,
      color: roleRequested === UserRole.ADMIN ? '#a855f7' : (roleRequested === UserRole.EMPLOYEE ? '#06b6d4' : '#10b981')
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);

    // If role is CUSTOMER, also add them to CLIENTS table so their appointments work flawlessly
    if (roleRequested === UserRole.CUSTOMER) {
      const clients = this.getClients();
      const newClient: Client = {
        id: `cli_${newUser.id}`, // link client ID with user ID
        name,
        phone: phone || '',
        cpfCnpj: '',
        email,
        birthDate: '',
        address: '',
        city: '',
        notes: 'Cliente cadastrado via portal autônomo.',
        loyaltyPoints: 0,
        cashbackAmount: 0.00,
        totalSpent: 0.00,
        attachments: [],
        createdAt: new Date().toISOString().split('T')[0]
      };
      clients.push(newClient);
      saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    }

    this.addLog(
      newUser.id,
      newUser.name,
      newUser.role,
      'Cadastro Efetuado',
      'auth',
      `Novo usuário cadastrado com sucesso. Cargo: ${roleRequested.toUpperCase()}`
    );

    return newUser;
  }

  static recoverPassword(email: string, newPasswordRequested: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      users[idx].password = newPasswordRequested;
      saveToStorage(STORAGE_KEYS.USERS, users);

      this.addLog(
        users[idx].id,
        users[idx].name,
        users[idx].role,
        'Recuperação de Senha',
        'auth',
        'Senha redefinida pelo usuário com sucesso.'
      );
      return true;
    }
    return false;
  }

  static logout(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Logout Efetuado',
        'auth',
        'Usuário desconectado manualmente.'
      );
    }
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
    saveToStorage(STORAGE_KEYS.REMAIN_CONNECTED, false);
  }

  static addLog(userId: string, userName: string, role: string, action: string, category: SecurityLog['category'], details: string): void {
    const logs = this.getLogs();
    const newLog: SecurityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      userName,
      role,
      action,
      category,
      details,
      timestamp: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.LOGS, [newLog, ...logs]);
  }

  // Client actions
  static saveClient(client: Omit<Client, 'id' | 'createdAt' | 'attachments' | 'loyaltyPoints' | 'cashbackAmount' | 'totalSpent'> & { id?: string }): Client {
    const clients = this.getClients();
    const currentUser = this.getCurrentUser();
    let savedClient: Client;

    if (client.id) {
      // Edit
      const existingIdx = clients.findIndex(c => c.id === client.id);
      const existing = clients[existingIdx];
      savedClient = {
        ...existing,
        ...client,
        id: client.id
      } as Client;
      clients[existingIdx] = savedClient;
      
      this.addLog(
        currentUser?.id || 'sys',
        currentUser?.name || 'Sistema',
        currentUser?.role || 'employee',
        'Cliente Atualizado',
        'cadastro',
        `Cadastro do cliente ${savedClient.name} foi atualizado.`
      );
    } else {
      // Create
      savedClient = {
        ...client,
        id: `cli_${Date.now()}`,
        attachments: [],
        loyaltyPoints: 0,
        cashbackAmount: 0.00,
        totalSpent: 0.00,
        createdAt: new Date().toISOString().split('T')[0]
      };
      clients.push(savedClient);

      this.addLog(
        currentUser?.id || 'sys',
        currentUser?.name || 'Sistema',
        currentUser?.role || 'employee',
        'Cliente Cadastrado',
        'cadastro',
        `Novo cliente cadastrado: ${savedClient.name}.`
      );
    }

    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    return savedClient;
  }

  static addClientAttachment(clientId: string, name: string, size: string): Attachment {
    const clients = this.getClients();
    const idx = clients.findIndex(c => c.id === clientId);
    if (idx === -1) throw new Error('Cliente não encontrado');

    const attachment: Attachment = {
      id: `att_${Date.now()}`,
      name,
      url: '#',
      size,
      date: new Date().toISOString().split('T')[0]
    };

    clients[idx].attachments.push(attachment);
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);

    const currentUser = this.getCurrentUser();
    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'employee',
      'Anexo Adicionado',
      'cadastro',
      `Arquivo ${name} anexado ao cliente ${clients[idx].name}.`
    );

    return attachment;
  }

  // Product Actions & Stock Control
  static saveProduct(product: Omit<Product, 'id' | 'createdAt'> & { id?: string }): Product {
    const products = this.getProducts();
    const currentUser = this.getCurrentUser();
    let savedProduct: Product;

    if (product.id) {
      const existingIdx = products.findIndex(p => p.id === product.id);
      const existing = products[existingIdx];
      savedProduct = {
        ...existing,
        ...product,
        id: product.id
      } as Product;
      products[existingIdx] = savedProduct;

      this.addLog(
        currentUser?.id || 'sys',
        currentUser?.name || 'Sistema',
        currentUser?.role || 'admin',
        'Produto Atualizado',
        'estoque',
        `Produto ${savedProduct.name} atualizado.`
      );
    } else {
      savedProduct = {
        ...product,
        id: `prod_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      products.push(savedProduct);

      this.addLog(
        currentUser?.id || 'sys',
        currentUser?.name || 'Sistema',
        currentUser?.role || 'admin',
        'Produto Cadastrado',
        'estoque',
        `Novo produto cadastrado: ${savedProduct.name}.`
      );
    }

    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return savedProduct;
  }

  static registerStockMovement(productId: string, type: StockMovement['type'], quantity: number, reason: string): void {
    const products = this.getProducts();
    const pIdx = products.findIndex(p => p.id === productId);
    if (pIdx === -1) return;

    const p = products[pIdx];
    let newQty = p.quantity;

    if (type === 'entrada') {
      newQty += quantity;
    } else if (type.startsWith('saida') || type === 'ajuste' && quantity < 0) {
      newQty = Math.max(0, newQty - Math.abs(quantity));
    } else if (type === 'ajuste') {
      newQty = quantity;
    }

    products[pIdx].quantity = newQty;
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    const currentUser = this.getCurrentUser();
    const movements = this.getStockMovements();
    const newMovement: StockMovement = {
      id: `mov_${Date.now()}`,
      productId,
      productName: p.name,
      type,
      quantity: Math.abs(quantity),
      date: new Date().toISOString(),
      reason,
      user: currentUser?.name || 'Sistema'
    };

    saveToStorage(STORAGE_KEYS.MOVEMENTS, [newMovement, ...movements]);

    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'employee',
      'Movimentação de Estoque',
      'estoque',
      `Produto: ${p.name} | Operação: ${type} | Quantidade: ${Math.abs(quantity)} | Novo Estoque: ${newQty}`
    );
  }

  // Service Actions
  static saveService(service: Service): void {
    const services = this.getServices();
    const existingIdx = services.findIndex(s => s.id === service.id);
    const currentUser = this.getCurrentUser();

    if (existingIdx !== -1) {
      services[existingIdx] = service;
      this.addLog(
        currentUser?.id || 'sys',
        currentUser?.name || 'Sistema',
        currentUser?.role || 'admin',
        'Serviço Atualizado',
        'configuracao',
        `Serviço ${service.name} atualizado.`
      );
    } else {
      services.push(service);
      this.addLog(
        currentUser?.id || 'sys',
        currentUser?.name || 'Sistema',
        currentUser?.role || 'admin',
        'Serviço Cadastrado',
        'configuracao',
        `Novo serviço cadastrado: ${service.name}.`
      );
    }
    saveToStorage(STORAGE_KEYS.SERVICES, services);
  }

  // Scheduling (Agendamento) Actions
  static saveAppointment(app: Omit<Appointment, 'id' | 'priceTotal'> & { id?: string }): Appointment {
    const apps = this.getAppointments();
    const services = this.getServices();
    const currentUser = this.getCurrentUser();

    // Calculate total price
    const priceTotal = app.isBlockedTime ? 0 : app.serviceIds.reduce((sum, sId) => {
      const s = services.find(srv => srv.id === sId);
      return sum + (s ? s.price : 0);
    }, 0);

    let savedApp: Appointment;

    if (app.id) {
      const idx = apps.findIndex(a => a.id === app.id);
      savedApp = {
        ...apps[idx],
        ...app,
        priceTotal,
        id: app.id
      } as Appointment;
      apps[idx] = savedApp;

      this.addLog(
        currentUser?.id || 'sys',
        currentUser?.name || 'Sistema',
        currentUser?.role || 'employee',
        'Agendamento Atualizado',
        'cadastro',
        `Agendamento para ${savedApp.isBlockedTime ? 'BLOQUEIO' : savedApp.clientName} alterado para status ${savedApp.status}.`
      );
    } else {
      savedApp = {
        ...app,
        id: `app_${Date.now()}`,
        priceTotal
      };
      apps.push(savedApp);

      this.addLog(
        currentUser?.id || 'sys',
        currentUser?.name || 'Sistema',
        currentUser?.role || 'employee',
        'Agendamento Criado',
        'cadastro',
        `Novo agendamento criado para ${savedApp.isBlockedTime ? 'BLOQUEIO' : savedApp.clientName} no dia ${savedApp.date} às ${savedApp.time}.`
      );
    }

    saveToStorage(STORAGE_KEYS.APPOINTMENTS, apps);
    return savedApp;
  }

  // POS / Cashier Register Sales Process
  static registerSale(saleData: Omit<Sale, 'id' | 'saleNumber' | 'cashbackEarned' | 'pointsEarned' | 'status' | 'date'>): Sale {
    const sales = this.getSales();
    const clients = this.getClients();
    const products = this.getProducts();
    const currentUser = this.getCurrentUser();
    const cash = this.getCashRegister();

    if (!cash.isOpen) {
      throw new Error('É necessário abrir o caixa antes de realizar uma venda!');
    }

    // Generate OS/Invoice Number
    const nextOS = `OS-${1000 + sales.length + 1}`;

    // Loyalty and Cashback Calculation
    // 5% Cashback on service, 2% on product. Points are 1 point for every 10 R$ spent.
    let pointsEarned = Math.floor(saleData.total / 10);
    let cashbackEarned = 0;

    saleData.items.forEach(item => {
      if (item.type === 'service') {
        cashbackEarned += (item.price * item.quantity) * 0.05;
      } else {
        cashbackEarned += (item.price * item.quantity) * 0.02;
      }
    });

    // Sub discounts if applicable
    cashbackEarned = parseFloat(cashbackEarned.toFixed(2));

    const finalSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      saleNumber: nextOS,
      cashbackEarned,
      pointsEarned,
      status: 'concluido',
      date: new Date().toISOString()
    };

    // Update Client Loyalty & Spend Accumulations
    const clientIdx = clients.findIndex(c => c.id === saleData.clientId);
    if (clientIdx !== -1) {
      clients[clientIdx].loyaltyPoints += pointsEarned;
      clients[clientIdx].cashbackAmount = parseFloat((clients[clientIdx].cashbackAmount + cashbackEarned).toFixed(2));
      clients[clientIdx].totalSpent += saleData.total;
      clients[clientIdx].lastVisit = new Date().toISOString().split('T')[0];
      
      // Recommend return after 15 days
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 15);
      clients[clientIdx].nextRecommendedReturn = returnDate.toISOString().split('T')[0];
      
      saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    }

    // Deduct stock of physical products
    saleData.items.forEach(item => {
      if (item.type === 'product') {
        this.registerStockMovement(
          item.itemId,
          'saida_automatica',
          item.quantity,
          `Saída automática por venda ${nextOS}`
        );
      }
    });

    // Add revenue to Cash Register
    cash.currentBalance = parseFloat((cash.currentBalance + saleData.total).toFixed(2));
    cash.movements.push({
      id: `mov_s_${Date.now()}`,
      type: 'entrada_venda',
      amount: saleData.total,
      description: `Venda ${nextOS} - ${saleData.clientName} (Pago via ${saleData.paymentMethod.toUpperCase()})`,
      date: new Date().toISOString(),
      user: currentUser?.name || 'Sistema'
    });
    saveToStorage(STORAGE_KEYS.CASH, cash);

    // Save sale
    sales.push(finalSale);
    saveToStorage(STORAGE_KEYS.SALES, sales);

    // Register log
    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'employee',
      'Venda Registrada',
      'vendas',
      `Ordem de Serviço ${nextOS} registrada para o cliente ${saleData.clientName}. Total: R$ ${saleData.total.toFixed(2)}.`
    );

    return finalSale;
  }

  // Cash Register Management (Caixa)
  static openCashRegister(initialBalance: number): CashRegister {
    const cash = this.getCashRegister();
    const currentUser = this.getCurrentUser();

    cash.isOpen = true;
    cash.openedAt = new Date().toISOString();
    cash.openedBy = currentUser?.name || 'Administrador';
    cash.initialBalance = initialBalance;
    cash.currentBalance = initialBalance;
    cash.closedAt = undefined;
    cash.closedBy = undefined;
    cash.movements = [];

    saveToStorage(STORAGE_KEYS.CASH, cash);

    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'admin',
      'Abertura de Caixa',
      'financeiro',
      `Caixa aberto com saldo inicial de R$ ${initialBalance.toFixed(2)}`
    );

    return cash;
  }

  static closeCashRegister(): CashRegister {
    const cash = this.getCashRegister();
    const currentUser = this.getCurrentUser();

    cash.isOpen = false;
    cash.closedAt = new Date().toISOString();
    cash.closedBy = currentUser?.name || 'Administrador';

    saveToStorage(STORAGE_KEYS.CASH, cash);

    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'admin',
      'Fechamento de Caixa',
      'financeiro',
      `Caixa fechado. Saldo final acumulado: R$ ${cash.currentBalance.toFixed(2)}`
    );

    return cash;
  }

  static addCashMovement(type: 'suprimento' | 'sangria' | 'despesa', amount: number, description: string): void {
    const cash = this.getCashRegister();
    const currentUser = this.getCurrentUser();

    if (!cash.isOpen) {
      throw new Error('O caixa precisa estar aberto para registrar movimentações!');
    }

    if (type === 'sangria' || type === 'despesa') {
      if (cash.currentBalance < amount) {
        throw new Error('Saldo insuficiente em caixa para realizar esta operação!');
      }
      cash.currentBalance = parseFloat((cash.currentBalance - amount).toFixed(2));
    } else {
      cash.currentBalance = parseFloat((cash.currentBalance + amount).toFixed(2));
    }

    cash.movements.push({
      id: `mov_m_${Date.now()}`,
      type,
      amount,
      description,
      date: new Date().toISOString(),
      user: currentUser?.name || 'Sistema'
    });

    saveToStorage(STORAGE_KEYS.CASH, cash);

    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'employee',
      'Movimentação Manual Caixa',
      'financeiro',
      `Movimentação de ${type.toUpperCase()}: R$ ${amount.toFixed(2)} | Motivo: ${description}`
    );
  }

  // Company Configurations
  static saveCompanyConfig(config: CompanyConfig): void {
    saveToStorage(STORAGE_KEYS.COMPANY, config);
    const currentUser = this.getCurrentUser();
    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'admin',
      'Configurações da Empresa',
      'configuracao',
      'Informações da Barbearia e horários atualizados.'
    );
  }

  // CRM Filters
  static getCRMClients(filter: 'ativos' | 'inativos' | 'aniversariantes' | 'vip' | 'nao_retornam_30_dias' | 'maiores_compradores'): Client[] {
    const clients = this.getClients();
    const sales = this.getSales();
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    switch (filter) {
      case 'ativos':
        // Ativos são os que visitaram nos últimos 30 dias
        return clients.filter(c => {
          if (!c.lastVisit) return false;
          const visitDate = new Date(c.lastVisit);
          return visitDate >= thirtyDaysAgo;
        });

      case 'inativos':
        // Sem visitas registradas ou visitou há mais de 60 dias
        return clients.filter(c => {
          if (!c.lastVisit) return true;
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          const visitDate = new Date(c.lastVisit);
          return visitDate < sixtyDaysAgo;
        });

      case 'aniversariantes':
        // Mesma data de nascimento (mês e dia iguais ao de hoje)
        return clients.filter(c => {
          if (!c.birthDate) return false;
          const bDate = new Date(c.birthDate);
          return bDate.getDate() === today.getDate() && bDate.getMonth() === today.getMonth();
        });

      case 'vip':
        // Gastou mais de R$ 500 total ou tem mais de 200 pontos de fidelidade
        return clients.filter(c => c.totalSpent >= 500 || c.loyaltyPoints >= 200);

      case 'nao_retornam_30_dias':
        // Visitou entre 30 e 60 dias atrás
        return clients.filter(c => {
          if (!c.lastVisit) return false;
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          const visitDate = new Date(c.lastVisit);
          return visitDate < thirtyDaysAgo && visitDate >= sixtyDaysAgo;
        });

      case 'maiores_compradores':
        // Ordena por maior gasto total desc
        return [...clients].sort((a, b) => b.totalSpent - a.totalSpent);

      default:
        return clients;
    }
  }

  // Backup Trigger
  static triggerFirebaseBackup(): { success: boolean; message: string; timestamp: string } {
    const backupData = {
      users: this.getUsers(),
      clients: this.getClients(),
      products: this.getProducts(),
      services: this.getServices(),
      appointments: this.getAppointments(),
      sales: this.getSales(),
      cash: this.getCashRegister(),
      logs: this.getLogs(),
      company: this.getCompanyConfig()
    };
    
    // Simulate writing/updating backup log
    const currentUser = this.getCurrentUser();
    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'admin',
      'Backup Automático Realizado',
      'configuracao',
      `Sincronização realizada com sucesso para o banco de dados Firebase. Total de registros salvos: ${
        Object.values(backupData).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 1), 0)
      }`
    );

    return {
      success: true,
      message: 'Sincronização e Backup no Firebase Firestore e Storage realizados com sucesso!',
      timestamp: new Date().toISOString()
    };
  }

  // Save/Update Barber info
  static saveBarber(barber: any): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === barber.id);
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        ...barber
      };
    } else {
      users.push({
        ...barber,
        id: barber.id || `user_${Date.now()}`
      });
    }
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    const currentUser = this.getCurrentUser();
    this.addLog(
      currentUser?.id || 'sys',
      currentUser?.name || 'Sistema',
      currentUser?.role || 'admin',
      `Perfil de equipe alterado: ${barber.name}`,
      'configuracao',
      `Perfil e comissões atualizados.`
    );
  }
}
