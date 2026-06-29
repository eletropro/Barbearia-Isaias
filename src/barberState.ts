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
    email: 'isaias@barbearia.com.br',
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
    quantity: 4, // Alerta de estoque baixo!
    minStock: 6,
    photoUrl: 'https://images.unsplash.com/photo-1626475760590-169996614f85?auto=format&fit=crop&q=80&w=300',
    barcode: '7891415161718',
    description: 'Hidrata profundamente a pele e os pelos da barba, deixando-os macios, brilhantes e perfumados.',
    status: 'ativo',
    createdAt: '2026-06-15'
  },
  {
    id: 'prod_shampoo',
    name: 'Shampoo Anticaspa e Energizante 250ml',
    category: 'Shampoo',
    code: 'SH-003',
    supplier: 'Men Essence',
    buyPrice: 15.00,
    sellPrice: 32.00,
    quantity: 25,
    minStock: 8,
    photoUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=300',
    barcode: '7891819202122',
    description: 'Limpeza refrescante com ativos naturais que combatem a caspa e fortalecem o couro cabeludo.',
    status: 'ativo',
    createdAt: '2026-06-16'
  },
  {
    id: 'prod_gel',
    name: 'Gel Fixador Ultra Forte 250g',
    category: 'Finalizador',
    code: 'GF-004',
    supplier: 'Booster Corp',
    buyPrice: 8.00,
    sellPrice: 19.90,
    quantity: 3, // Alerta de estoque baixo!
    minStock: 5,
    photoUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300',
    barcode: '7892223242526',
    description: 'Gel cola de altíssima fixação, ideal para penteados blindados e moicanos.',
    status: 'ativo',
    createdAt: '2026-06-16'
  }
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_marcos',
    name: 'Marcos de Souza',
    phone: '(11) 98123-4567',
    cpfCnpj: '123.456.789-00',
    email: 'marcos.souza@gmail.com',
    birthDate: '1992-06-25', // Fez aniversário recentemente
    address: 'Av. Paulista, 1000 - Bela Vista',
    city: 'São Paulo',
    notes: 'Gosta de corte degradê navalhado bem curto nas laterais e barba bem desenhada.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    vehicleType: 'carro',
    vehicleModel: 'Corolla',
    vehicleColor: 'Prata',
    vehiclePlate: 'BRA2E19',
    attachments: [
      { id: 'att_1', name: 'ficha_anamnese_capilar.jpg', url: '#', size: '1.2 MB', date: '2026-06-10' }
    ],
    loyaltyPoints: 120,
    cashbackAmount: 15.50,
    totalSpent: 480.00,
    lastVisit: '2026-06-20',
    nextRecommendedReturn: '2026-07-05',
    createdAt: '2026-01-10'
  },
  {
    id: 'cli_rodrigo',
    name: 'Rodrigo Mello (VIP)',
    phone: '(11) 99111-2233',
    cpfCnpj: '234.567.890-11',
    email: 'rodrigo.mello@outlook.com',
    birthDate: '1988-10-12',
    address: 'Rua Augusta, 450 - Consolação',
    city: 'São Paulo',
    notes: 'Cliente VIP. Faz hidratação e barba semanalmente. Gosta de café expresso.',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    vehicleType: 'moto',
    vehicleModel: 'CB 500F',
    vehicleColor: 'Preta',
    vehiclePlate: 'ABC1D23',
    attachments: [],
    loyaltyPoints: 340,
    cashbackAmount: 42.00,
    totalSpent: 1250.00,
    lastVisit: '2026-06-27', // Ontem
    nextRecommendedReturn: '2026-07-11',
    createdAt: '2026-02-15'
  },
  {
    id: 'cli_vitor',
    name: 'Vitor Fernandes (Inativo)',
    phone: '(11) 97755-4422',
    cpfCnpj: '345.678.901-22',
    email: 'vitor.fernandes@yahoo.com.br',
    birthDate: '1995-03-04',
    address: 'Rua Pamplona, 789 - Jardim Paulista',
    city: 'São Paulo',
    notes: 'Corta cabelo tradicional na tesoura. Não faz barba.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    vehicleType: 'carro',
    vehicleModel: 'Jeep Compass',
    vehicleColor: 'Branco',
    vehiclePlate: 'XYZ9A87',
    attachments: [],
    loyaltyPoints: 50,
    cashbackAmount: 5.00,
    totalSpent: 150.00,
    lastVisit: '2026-04-10', // Mais de 30 dias sem retornar!
    nextRecommendedReturn: '2026-05-10',
    createdAt: '2026-03-20'
  },
  {
    id: 'cli_gustavo',
    name: 'Gustavo Santos',
    phone: '(11) 99888-7766',
    cpfCnpj: '456.789.012-33',
    email: 'gustavo.santos@gmail.com',
    birthDate: '2001-06-29', // Faz aniversário HOJE! (2026-06-28 ou 29 dependendo do fuso, vamos celebrar aniversário!)
    address: 'Rua Bela Cintra, 1200 - Consolação',
    city: 'São Paulo',
    notes: 'Sempre pede risquinho na sobrancelha e na lateral do cabelo.',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    vehicleType: 'outro',
    vehicleModel: 'Patinete Elétrico',
    attachments: [],
    loyaltyPoints: 80,
    cashbackAmount: 10.00,
    totalSpent: 320.00,
    lastVisit: '2026-06-12',
    nextRecommendedReturn: '2026-06-26', // Passou o retorno
    createdAt: '2026-04-01'
  }
];

const INITIAL_COMPANY: CompanyConfig = {
  name: 'Barbearia Isaias',
  phone: '(11) 3255-9000',
  whatsapp: '(11) 99999-1111',
  instagram: '@barbeariaisaias_oficial',
  address: 'Alameda Lorena, 1500 - Cerqueira César, São Paulo - SP',
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

// Generates some random appointments for today, yesterday, and future
const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app_1',
    clientId: 'cli_marcos',
    clientName: 'Marcos de Souza',
    clientPhone: '(11) 98123-4567',
    barberId: 'user_lucas',
    barberName: 'Lucas Silva',
    serviceIds: ['srv_corte', 'srv_barba'],
    serviceNames: ['Corte Social/Degradê', 'Barba com Toalha Quente'],
    date: '2026-06-28', // HOJE
    time: '10:00',
    status: 'finalizado',
    notes: 'Deixou gorjeta.',
    priceTotal: 90
  },
  {
    id: 'app_2',
    clientId: 'cli_rodrigo',
    clientName: 'Rodrigo Mello (VIP)',
    clientPhone: '(11) 99111-2233',
    barberId: 'user_isaias',
    barberName: 'Isaias Barbosa (Admin)',
    serviceIds: ['srv_combo', 'srv_hidratacao'],
    serviceNames: ['Combo Corte + Barba', 'Hidratação Capilar'],
    date: '2026-06-28', // HOJE
    time: '14:30',
    status: 'em_atendimento',
    priceTotal: 115
  },
  {
    id: 'app_3',
    clientId: 'cli_gustavo',
    clientName: 'Gustavo Santos',
    clientPhone: '(11) 99888-7766',
    barberId: 'user_thiago',
    barberName: 'Thiago Oliveira',
    serviceIds: ['srv_corte', 'srv_sobrancelha'],
    serviceNames: ['Corte Social/Degradê', 'Sobrancelha Navalha'],
    date: '2026-06-28', // HOJE
    time: '17:00',
    status: 'confirmado',
    priceTotal: 70
  },
  {
    id: 'app_4',
    clientId: 'cli_marcos',
    clientName: 'Marcos de Souza',
    clientPhone: '(11) 98123-4567',
    barberId: 'user_lucas',
    barberName: 'Lucas Silva',
    serviceIds: ['srv_combo'],
    serviceNames: ['Combo Corte + Barba'],
    date: '2026-06-29', // AMANHÃ
    time: '09:00',
    status: 'agendado',
    priceTotal: 80
  },
  {
    id: 'app_blocked_1',
    clientId: '',
    clientName: 'BLOQUEADO',
    clientPhone: '',
    barberId: 'user_isaias',
    barberName: 'Isaias Barbosa (Admin)',
    serviceIds: [],
    serviceNames: [],
    date: '2026-06-28',
    time: '12:00',
    status: 'confirmado',
    isBlockedTime: true,
    notes: 'Horário de almoço',
    priceTotal: 0
  }
];

// Seed some historical sales to populate charts
const INITIAL_SALES: Sale[] = [
  {
    id: 'sale_1',
    saleNumber: 'OS-1001',
    clientId: 'cli_marcos',
    clientName: 'Marcos de Souza',
    employeeId: 'user_lucas',
    employeeName: 'Lucas Silva',
    items: [
      { type: 'service', itemId: 'srv_corte', itemName: 'Corte Social/Degradê', quantity: 1, price: 50 },
      { type: 'service', itemId: 'srv_barba', itemName: 'Barba com Toalha Quente', quantity: 1, price: 40 },
      { type: 'product', itemId: 'prod_pomada', itemName: 'Pomada Modeladora Efeito Matte 150g', quantity: 1, price: 45 }
    ],
    paymentMethod: 'pix',
    subtotal: 135,
    discount: 10,
    total: 125,
    cashbackEarned: 6.25,
    pointsEarned: 12,
    status: 'concluido',
    notes: 'Cliente pagou com desconto de aniversário.',
    date: '2026-06-25'
  },
  {
    id: 'sale_2',
    saleNumber: 'OS-1002',
    clientId: 'cli_rodrigo',
    clientName: 'Rodrigo Mello (VIP)',
    employeeId: 'user_isaias',
    employeeName: 'Isaias Barbosa (Admin)',
    items: [
      { type: 'service', itemId: 'srv_combo', itemName: 'Combo Corte + Barba', quantity: 1, price: 80 },
      { type: 'product', itemId: 'prod_oleo', itemName: 'Óleo para Barba Wood & Spice 30ml', quantity: 1, price: 39.90 }
    ],
    paymentMethod: 'cartao_credito',
    subtotal: 119.90,
    discount: 0,
    total: 119.90,
    cashbackEarned: 11.99,
    pointsEarned: 23,
    status: 'concluido',
    date: '2026-06-26'
  },
  {
    id: 'sale_3',
    saleNumber: 'OS-1003',
    clientId: 'cli_marcos',
    clientName: 'Marcos de Souza',
    employeeId: 'user_thiago',
    employeeName: 'Thiago Oliveira',
    items: [
      { type: 'service', itemId: 'srv_progressiva', itemName: 'Progressiva Masculina', quantity: 1, price: 120 }
    ],
    paymentMethod: 'dinheiro',
    subtotal: 120,
    discount: 15,
    total: 105,
    cashbackEarned: 5.25,
    pointsEarned: 10,
    status: 'concluido',
    date: '2026-06-27'
  },
  {
    id: 'sale_4',
    saleNumber: 'OS-1004',
    clientId: 'cli_rodrigo',
    clientName: 'Rodrigo Mello (VIP)',
    employeeId: 'user_lucas',
    employeeName: 'Lucas Silva',
    items: [
      { type: 'service', itemId: 'srv_corte', itemName: 'Corte Social/Degradê', quantity: 1, price: 50 },
      { type: 'product', itemId: 'prod_shampoo', itemName: 'Shampoo Anticaspa e Energizante 250ml', quantity: 1, price: 32 }
    ],
    paymentMethod: 'pix',
    subtotal: 82,
    discount: 0,
    total: 82,
    cashbackEarned: 4.10,
    pointsEarned: 8,
    status: 'concluido',
    date: '2026-06-28' // HOJE
  }
];

const INITIAL_CASH: CashRegister = {
  isOpen: true,
  openedAt: '2026-06-28T08:00:00',
  openedBy: 'Isaias Barbosa (Admin)',
  initialBalance: 200.00,
  currentBalance: 407.00, // 200 initial + 125 sale1(pix) + 82 sale4(pix) Wait, credit cards and cash is calculated
  movements: [
    {
      id: 'mov_1',
      type: 'entrada_venda',
      amount: 125,
      description: 'Venda OS-1001 - Marcos de Souza',
      date: '2026-06-25T11:30:00',
      user: 'Lucas Silva'
    },
    {
      id: 'mov_2',
      type: 'entrada_venda',
      amount: 105,
      description: 'Venda OS-1003 - Marcos de Souza (Em dinheiro)',
      date: '2026-06-27T16:00:00',
      user: 'Thiago Oliveira'
    },
    {
      id: 'mov_3',
      type: 'entrada_venda',
      amount: 82,
      description: 'Venda OS-1004 - Rodrigo Mello (PIX)',
      date: '2026-06-28T10:45:00',
      user: 'Lucas Silva'
    }
  ]
};

const INITIAL_LOGS: SecurityLog[] = [
  {
    id: 'log_1',
    userId: 'user_isaias',
    userName: 'Isaias Barbosa (Admin)',
    role: 'admin',
    action: 'Login Efetuado',
    category: 'auth',
    details: 'Login bem sucedido do administrador via IP 192.168.15.10',
    timestamp: '2026-06-28T08:01:00'
  },
  {
    id: 'log_2',
    userId: 'user_isaias',
    userName: 'Isaias Barbosa (Admin)',
    role: 'admin',
    action: 'Abertura de Caixa',
    category: 'financeiro',
    details: 'Abertura de caixa registrada com saldo inicial de R$ 200,00',
    timestamp: '2026-06-28T08:02:00'
  },
  {
    id: 'log_3',
    userId: 'user_lucas',
    userName: 'Lucas Silva',
    role: 'employee',
    action: 'Criação de Venda',
    category: 'vendas',
    details: 'Registro da venda OS-1004 para Rodrigo Mello (VIP), valor total: R$ 82,00',
    timestamp: '2026-06-28T10:45:10'
  }
];

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
  static login(email: string, roleRequested: UserRole, remainConnected: boolean): User | null {
    const users = this.getUsers();
    // Filter matching email or role for fast demo login
    let matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // If we type a role but no exact user, find first user matching that role for seamless demo experience
    if (!matchedUser) {
      matchedUser = users.find(u => u.role === roleRequested);
    }

    if (matchedUser) {
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
