/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  Car,
  Paperclip,
  Trash2,
  ExternalLink,
  Cake,
  Award,
  Clock,
  MapPin,
  FileText,
  Smartphone,
  Eye,
  CheckCircle,
  MessageSquare,
  Users
} from 'lucide-react';
import { Client, Attachment, User, UserRole } from '../types';
import { BarberStateEngine } from '../barberState';

interface ClientsViewProps {
  currentUser: User | null;
  clients: Client[];
  onSaveClient: (client: any) => void;
  onAddAttachment: (clientId: string, name: string, size: string) => void;
  onDeleteClient?: (id: string) => void;
}

export default function ClientsView({
  currentUser,
  clients,
  onSaveClient,
  onAddAttachment,
  onDeleteClient
}: ClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'ativos' | 'inativos' | 'aniversariantes' | 'vip' | 'atrasados'>('todos');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  // Form states
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [vehicleType, setVehicleType] = useState<'carro' | 'moto' | 'outro'>('carro');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Simulated notification triggers
  const [whatsAppNotification, setWhatsAppNotification] = useState<{ show: boolean; msg: string } | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleOpenAddModal = () => {
    setClientId('');
    setName('');
    setPhone('');
    setCpfCnpj('');
    setEmail('');
    setBirthDate('');
    setAddress('');
    setCity('');
    setNotes('');
    setVehicleType('carro');
    setVehicleModel('');
    setVehicleColor('');
    setVehiclePlate('');
    setPhotoUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200');
    setIsEditing(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setClientId(client.id);
    setName(client.name);
    setPhone(client.phone);
    setCpfCnpj(client.cpfCnpj);
    setEmail(client.email);
    setBirthDate(client.birthDate);
    setAddress(client.address);
    setCity(client.city);
    setNotes(client.notes);
    setVehicleType(client.vehicleType || 'carro');
    setVehicleModel(client.vehicleModel || '');
    setVehicleColor(client.vehicleColor || '');
    setVehiclePlate(client.vehiclePlate || '');
    setPhotoUrl(client.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200');
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Nome e Telefone são obrigatórios!');
      return;
    }
    onSaveClient({
      id: clientId || undefined,
      name,
      phone,
      cpfCnpj,
      email,
      birthDate,
      address,
      city,
      notes,
      vehicleType,
      vehicleModel,
      vehicleColor,
      vehiclePlate,
      photoUrl
    });
    setIsEditing(false);
    setSelectedClient(null);
  };

  const handleAttachFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !uploadFileName) return;
    onAddAttachment(selectedClient.id, uploadFileName, '1.4 MB');
    
    // Update selected client details in local view state
    const updatedClient = clients.find(c => c.id === selectedClient.id);
    if (updatedClient) {
      setSelectedClient(updatedClient);
    }
    setUploadFileName('');
  };

  const sendWhatsAppCampaign = (client: Client, type: 'agendamento' | 'aniversario' | 'retorno' | 'promocao') => {
    let msg = '';
    const nameF = client.name.split(' ')[0];
    const companyName = BarberStateEngine.getCompanyConfig().name;
    if (type === 'agendamento') {
      msg = `Olá ${nameF}! Confirmamos o seu agendamento na ${companyName} para amanhã. Estamos te esperando! 💈`;
    } else if (type === 'aniversario') {
      msg = `Parabéns ${nameF}! 🎂 Hoje é seu aniversário e nós da ${companyName} preparamos um cupom especial de 15% de desconto para sua próxima visita. Aproveite seu dia!`;
    } else if (type === 'retorno') {
      msg = `Olá ${nameF}, sentimos sua falta! Já faz mais de 15 dias de sua última visita. Que tal agendar um horário para dar aquele tapa no visual? ✂️ Responda para reservar!`;
    } else {
      msg = `PROMOÇÃO 💈 Fala ${nameF}! Combo Corte + Barba + Sobrancelha com preço especial nesta terça-feira. Reserve agora pelo WhatsApp!`;
    }

    setWhatsAppNotification({ show: true, msg });
    setTimeout(() => {
      setWhatsAppNotification(null);
    }, 4500);
  };

  // Filter Logic
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.vehiclePlate && c.vehiclePlate.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Active filter categories
      const today = new Date();
      const bDate = c.birthDate ? new Date(c.birthDate) : null;
      const daysDiff = c.lastVisit ? Math.floor((today.getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24)) : 999;

      if (activeFilter === 'ativos') {
        return daysDiff <= 30;
      }
      if (activeFilter === 'inativos') {
        return daysDiff > 60;
      }
      if (activeFilter === 'aniversariantes') {
        return bDate ? bDate.getDate() === today.getDate() && bDate.getMonth() === today.getMonth() : false;
      }
      if (activeFilter === 'vip') {
        return c.totalSpent >= 500 || c.loyaltyPoints >= 200;
      }
      if (activeFilter === 'atrasados') {
        return daysDiff > 30 && daysDiff <= 60;
      }

      return true;
    });
  }, [clients, searchQuery, activeFilter]);

  return (
    <div className="space-y-6" id="clients_view">
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-purple-600" />
            Cadastro e CRM de Clientes
          </h2>
          <p className="text-sm text-gray-500">
            Gerencie perfis, veículos, envie mensagens personalizadas de engajamento e consulte históricos de atendimentos.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Campaign Simulated Toast */}
      {whatsAppNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl max-w-sm border border-purple-500/30 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-green-500/20 text-green-400 rounded-lg">
              <Smartphone className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-400">Integração WhatsApp</span>
          </div>
          <p className="text-xs text-gray-300 italic">"Disparando campanha via API..."</p>
          <p className="text-xs text-white mt-2 font-mono bg-black/40 p-2 rounded-lg border border-white/5">
            {whatsAppNotification.msg}
          </p>
          <div className="mt-3 flex justify-between items-center text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-400" /> Status: Enviado</span>
            <span>2026-06-28</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Pesquise por nome, telefone, e-mail, placa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {(['todos', 'ativos', 'inativos', 'aniversariantes', 'vip', 'atrasados'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                  activeFilter === f
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f === 'todos' && 'Todos'}
                {f === 'ativos' && 'Ativos'}
                {f === 'inativos' && 'Inativos (>60 dias)'}
                {f === 'aniversariantes' && 'Aniversariantes'}
                {f === 'vip' && 'Clientes VIP'}
                {f === 'atrasados' && 'Não retorna >30d'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: List on left, Profile View/Edit on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clients List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-1 h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase">Lista de Clientes ({filteredClients.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredClients.length > 0 ? (
              filteredClients.map(client => {
                const today = new Date();
                const isBirthday = client.birthDate ? (
                  new Date(client.birthDate).getDate() === today.getDate() &&
                  new Date(client.birthDate).getMonth() === today.getMonth()
                ) : false;

                const daysDiff = client.lastVisit ? Math.floor((today.getTime() - new Date(client.lastVisit).getTime()) / (1000 * 60 * 60 * 24)) : 999;
                const isVip = client.totalSpent >= 500 || client.loyaltyPoints >= 200;

                return (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setIsEditing(false);
                    }}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      selectedClient?.id === client.id ? 'bg-purple-50/70 border-r-4 border-purple-600' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={client.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                        alt={client.name}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-gray-900">{client.name}</h4>
                          {isVip && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Award className="h-2 w-2" /> VIP
                            </span>
                          )}
                          {isBirthday && (
                            <span className="bg-pink-100 text-pink-700 p-0.5 rounded-full">
                              <Cake className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{client.phone}</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-gray-800">
                        R$ {client.totalSpent.toFixed(2)}
                      </span>
                      {client.lastVisit ? (
                        <span className="text-[9px] text-gray-400">
                          Visita: {client.lastVisit}
                        </span>
                      ) : (
                        <span className="text-[9px] text-red-400 font-semibold">Sem visitas</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                <Users className="h-8 w-8 mb-2 text-gray-300" />
                <p className="text-sm font-semibold">Nenhum cliente encontrado</p>
                <p className="text-xs text-gray-400 mt-0.5">Mude a busca ou use os filtros superiores.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile View or Adding Form */}
        <div className="lg:col-span-2 h-[600px] flex flex-col">
          {isEditing ? (
            /* Create / Edit Form */
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">
                  {clientId ? 'Editar Perfil de Cliente' : 'Cadastrar Novo Cliente'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
                >
                  Cancelar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Section 1: Dados Pessoais */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider">1. Informações Pessoais</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João da Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp / Telefone *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: (11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">CPF ou CNPJ</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpfCnpj}
                        onChange={(e) => setCpfCnpj(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label>
                      <input
                        type="email"
                        placeholder="cliente@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">URL da Foto</label>
                      <input
                        type="text"
                        placeholder="Link opcional para imagem"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Endereço Residencial</label>
                      <input
                        type="text"
                        placeholder="Ex: Alameda das Flores, 100"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        placeholder="São Paulo"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Preferências / Observações</label>
                      <input
                        type="text"
                        placeholder="Ex: Cabelo seco, prefere cerveja escura"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Veículo */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider">2. Dados do Veículo (Controle de Estacionamento)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tipo</label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value as any)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      >
                        <option value="carro">Carro</option>
                        <option value="moto">Moto</option>
                        <option value="outro">Outro / Sem</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Modelo</label>
                      <input
                        type="text"
                        placeholder="Corolla, CB300..."
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Cor</label>
                      <input
                        type="text"
                        placeholder="Preto, Prata..."
                        value={vehicleColor}
                        onChange={(e) => setVehicleColor(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Placa</label>
                      <input
                        type="text"
                        placeholder="BRA2E19"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          ) : selectedClient ? (
            /* Profile Detail Card View */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-500/10 via-white to-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedClient.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={selectedClient.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-purple-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {selectedClient.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="h-3 w-3" /> {selectedClient.loyaltyPoints} Pontos
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        R$ {selectedClient.cashbackAmount.toFixed(2)} Cashback
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedClient)}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                  >
                    Editar Cadastro
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza de que deseja remover o cliente ${selectedClient.name}?`)) {
                          onDeleteClient?.(selectedClient.id);
                          setSelectedClient(null);
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-600 transition-colors"
                    >
                      Excluir Cliente
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Última Visita</span>
                    <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-purple-600" />
                      {selectedClient.lastVisit || 'Sem registros'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Próximo Retorno Recomendado</span>
                    <span className="text-sm font-bold text-purple-700 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      {selectedClient.nextRecommendedReturn || 'Não calculado'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Gasto Total Acumulado</span>
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                      R$ {selectedClient.totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* More Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  {/* Contato & Detalhes */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contato e Localização</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedClient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedClient.email || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {selectedClient.address ? `${selectedClient.address}, ${selectedClient.city}` : 'Endereço não cadastrado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>CPF/CNPJ: {selectedClient.cpfCnpj || 'Não cadastrado'}</span>
                      </div>
                      {selectedClient.birthDate && (
                        <div className="flex items-center gap-2">
                          <Cake className="h-4 w-4 text-pink-500" />
                          <span>Data Nasc: {selectedClient.birthDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                      <span className="text-[10px] font-bold text-purple-800 uppercase block mb-1">Notas Internas</span>
                      <p className="text-xs text-purple-900 italic">"{selectedClient.notes || 'Sem observações adicionais.'}"</p>
                    </div>
                  </div>

                  {/* Veículo & Atendimento */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-purple-600" /> Controle de Estacionamento / Veículo
                      </h4>
                      {selectedClient.vehicleModel ? (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400 font-medium block">Modelo / Tipo</span>
                            <span className="font-semibold text-gray-800 capitalize">
                              {selectedClient.vehicleModel} ({selectedClient.vehicleType})
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium block">Cor</span>
                            <span className="font-semibold text-gray-800">{selectedClient.vehicleColor || 'Não informada'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400 font-medium block">Placa</span>
                            <span className="font-mono bg-white px-2 py-0.5 border border-gray-200 rounded text-gray-900 font-bold uppercase inline-block">
                              {selectedClient.vehiclePlate || 'Não informada'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Nenhum veículo cadastrado para este cliente.</p>
                      )}
                    </div>

                    {/* CRM Campaigns Action */}
                    <div className="bg-gradient-to-r from-purple-900 to-slate-800 p-4 rounded-xl text-white">
                      <span className="text-[9px] font-bold text-purple-300 uppercase block mb-1">CRM Marketing & WhatsApp</span>
                      <p className="text-xs text-purple-200 mb-3">Envie mensagens pré-configuradas para fidelizar o cliente.</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => sendWhatsAppCampaign(selectedClient, 'agendamento')}
                          className="bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" /> Lembrete de Agenda
                        </button>
                        <button
                          onClick={() => sendWhatsAppCampaign(selectedClient, 'aniversario')}
                          className="bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Cake className="h-3 w-3" /> Aniversário
                        </button>
                        <button
                          onClick={() => sendWhatsAppCampaign(selectedClient, 'retorno')}
                          className="bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" /> Incentivar Retorno
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="h-4 w-4 text-purple-600" /> Documentos Anexados
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedClient.attachments.map(att => (
                      <div key={att.id} className="p-2.5 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-gray-50">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 text-purple-500 shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-700 truncate">{att.name}</p>
                            <p className="text-[10px] text-gray-400">{att.size} • {att.date}</p>
                          </div>
                        </div>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Upload Simulator Form */}
                  <form onSubmit={handleAttachFile} className="flex gap-2 max-w-sm mt-3">
                    <input
                      type="text"
                      placeholder="Simular upload de arquivo (Ex: foto_corte.png)"
                      value={uploadFileName}
                      onChange={(e) => setUploadFileName(e.target.value)}
                      className="flex-1 p-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                    <button
                      type="submit"
                      disabled={!uploadFileName}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-3.5 rounded-xl text-xs font-bold transition-all"
                    >
                      Anexar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* Blank state profile details */
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex-1 flex flex-col items-center justify-center text-center p-6 h-full">
              <Users className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-700">Nenhum Cliente Selecionado</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Selecione um cliente na lista ao lado para visualizar os detalhes completos, veículos, fotos, anexos e campanhas CRM.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
