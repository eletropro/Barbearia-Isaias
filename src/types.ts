/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  photoUrl?: string;
  color?: string; // Color code for appointments grid
  targetMonth: number; // Meta de vendas/atendimentos
  bonusAmount: number; // Bonificação por meta atingida
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: string;
  date: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  cpfCnpj: string;
  email: string;
  birthDate: string;
  address: string;
  city: string;
  notes: string;
  photoUrl?: string;
  // Veículo
  vehicleType?: 'carro' | 'moto' | 'outro';
  vehicleModel?: string;
  vehicleColor?: string;
  vehiclePlate?: string;
  // Históricos e CRM
  attachments: Attachment[];
  loyaltyPoints: number;
  cashbackAmount: number;
  totalSpent: number;
  lastVisit?: string;
  nextRecommendedReturn?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  code: string;
  supplier: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  minStock: number;
  photoUrl?: string;
  barcode?: string;
  description: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'saida_automatica' | 'saida_manual' | 'ajuste';
  quantity: number;
  date: string;
  reason?: string;
  user: string;
}

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  commissionPercent: number; // e.g. 30 para 30%
}

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_atendimento' | 'finalizado' | 'cancelado';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  barberId: string;
  barberName: string;
  serviceIds: string[];
  serviceNames: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  notes?: string;
  isBlockedTime?: boolean; // Se for um horário bloqueado pelo admin/barbeiro
  priceTotal: number;
}

export interface SaleItem {
  type: 'product' | 'service';
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'parcelado';

export interface Sale {
  id: string;
  saleNumber: string;
  clientId: string;
  clientName: string;
  employeeId: string;
  employeeName: string;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  installments?: number;
  subtotal: number;
  discount: number;
  total: number;
  cashbackEarned: number;
  pointsEarned: number;
  status: 'concluido' | 'cancelado';
  notes?: string;
  date: string; // ISO String ou YYYY-MM-DD
}

export interface CashMovement {
  id: string;
  type: 'entrada_venda' | 'suprimento' | 'sangria' | 'despesa';
  amount: number;
  description: string;
  date: string;
  user: string;
}

export interface CashRegister {
  isOpen: boolean;
  openedAt?: string;
  closedAt?: string;
  openedBy?: string;
  closedBy?: string;
  initialBalance: number;
  currentBalance: number;
  movements: CashMovement[];
}

export interface SecurityLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  category: 'auth' | 'cadastro' | 'vendas' | 'estoque' | 'financeiro' | 'configuracao';
  details: string;
  timestamp: string;
}

export interface CompanyConfig {
  name: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  workingHours: {
    weekday: string;
    hours: string;
    closed: boolean;
  }[];
}

export interface LoyaltyConfig {
  pointsRatio: number;
  cashbackPercent: number;
  pointsThreshold: number;
  couponRewardValue: number;
}

export interface SystemLog {
  id: string;
  user: string;
  action: string;
  date: string;
}

