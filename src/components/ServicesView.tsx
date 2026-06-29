/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Clock, Percent, DollarSign, Plus, Edit3, Scissors } from 'lucide-react';
import { Service, User, UserRole } from '../types';

interface ServicesViewProps {
  currentUser: User | null;
  services: Service[];
  onSaveService: (service: Service) => void;
}

export default function ServicesView({
  currentUser,
  services,
  onSaveService
}: ServicesViewProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form fields
  const [srvId, setSrvId] = useState('');
  const [srvName, setSrvName] = useState('');
  const [srvDuration, setSrvDuration] = useState(30);
  const [srvPrice, setSrvPrice] = useState(40);
  const [srvCommission, setSrvCommission] = useState(40);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleOpenAddForm = () => {
    setSrvId(`srv_${Date.now()}`);
    setSrvName('');
    setSrvDuration(30);
    setSrvPrice(40);
    setSrvCommission(40);
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (srv: Service) => {
    if (!isAdmin) {
      alert('Apenas administradores podem cadastrar ou alterar serviços!');
      return;
    }
    setSrvId(srv.id);
    setSrvName(srv.name);
    setSrvDuration(srv.durationMin);
    setSrvPrice(srv.price);
    setSrvCommission(srv.commissionPercent);
    setEditingService(srv);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || srvPrice <= 0 || srvCommission <= 0) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    onSaveService({
      id: srvId,
      name: srvName,
      durationMin: parseInt(srvDuration.toString(), 10),
      price: parseFloat(srvPrice.toString()),
      commissionPercent: parseFloat(srvCommission.toString())
    });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6" id="services_view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-purple-600" />
            Catálogo de Serviços da Barbearia
          </h2>
          <p className="text-sm text-gray-500">
            Configure o menu de serviços disponíveis, tempos de duração padrão de cadeira e respectivas taxas de comissão dos barbeiros.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddForm}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Novo Serviço
          </button>
        )}
      </div>

      {/* Grid Menu items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map(srv => {
          const barberCommissionGains = srv.price * (srv.commissionPercent / 100);
          return (
            <div key={srv.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <Scissors className="h-5 w-5" />
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {srv.durationMin} min
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{srv.name}</h3>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-50 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Preço ao Consumidor:</span>
                  <span className="font-extrabold text-gray-900 text-sm">R$ {srv.price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-600">
                  <span>Comissão Barbeiro:</span>
                  <span className="font-bold text-indigo-600">{srv.commissionPercent}%</span>
                </div>

                <div className="flex justify-between items-center text-gray-500 text-[10px] bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  <span>Valor Líquido do Barbeiro:</span>
                  <span className="font-bold text-emerald-600">R$ {barberCommissionGains.toFixed(2)}</span>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleOpenEditForm(srv)}
                  className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Ajustar Preços / Comissão
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: Service Configuration Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                {editingService ? 'Editar Configuração de Serviço' : 'Cadastrar Novo Serviço'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Fechar</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barba com Toalha Quente"
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tempo de Cadeira Estimado (Minutos)</label>
                <select
                  value={srvDuration}
                  onChange={(e) => setSrvDuration(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                >
                  <option value={15}>15 minutos (Rápido, Sobrancelha)</option>
                  <option value={30}>30 minutos (Padrão, Corte/Barba)</option>
                  <option value={45}>45 minutos (Médio, Pigmentação)</option>
                  <option value={60}>60 minutos (Longo, Combo)</option>
                  <option value={90}>90 minutos (Tratamento químico)</option>
                  <option value={120}>120 minutos (Completo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Preço ao Consumidor (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Taxa de Comissão do Barbeiro (%) *</label>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">%</span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={srvCommission}
                    onChange={(e) => setSrvCommission(parseFloat(e.target.value) || 0)}
                    className="w-full pl-4 pr-9 p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none font-bold text-indigo-600"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">O barbeiro receberá R$ {((srvPrice * srvCommission) / 100).toFixed(2)} por cadeira atendida.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  Confirmar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
