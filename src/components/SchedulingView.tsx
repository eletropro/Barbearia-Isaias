/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Scissors,
  AlertCircle,
  Lock,
  Unlock,
  ChevronsRight,
  Filter
} from 'lucide-react';
import { Appointment, Client, Service, User as BarberUser, AppointmentStatus } from '../types';

interface SchedulingViewProps {
  currentUser: BarberUser | null;
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  barbers: BarberUser[];
  onSaveAppointment: (app: any) => void;
}

export default function SchedulingView({
  currentUser,
  appointments,
  clients,
  services,
  barbers,
  onSaveAppointment
}: SchedulingViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'grid' | 'lista'>('grid');
  
  // Book Appointment Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appId, setAppId] = useState('');
  const [clientId, setClientId] = useState('');
  const [barberId, setBarberId] = useState('');
  const [time, setTime] = useState('09:00');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isBlockedTime, setIsBlockedTime] = useState(false);
  const [status, setStatus] = useState<AppointmentStatus>('agendado');

  const hoursList = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const handleOpenAddModal = (initialTime?: string, initialBarberId?: string) => {
    setAppId('');
    setClientId(clients[0]?.id || '');
    setBarberId(initialBarberId || barbers[0]?.id || '');
    setTime(initialTime || '09:00');
    setSelectedServices([]);
    setNotes('');
    setIsBlockedTime(false);
    setStatus('agendado');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: Appointment) => {
    setAppId(app.id);
    setClientId(app.clientId);
    setBarberId(app.barberId);
    setTime(app.time);
    setSelectedServices(app.serviceIds);
    setNotes(app.notes || '');
    setIsBlockedTime(!!app.isBlockedTime);
    setStatus(app.status);
    setIsModalOpen(true);
  };

  const handleServiceToggle = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBlockedTime && !clientId) {
      alert('Selecione um cliente!');
      return;
    }
    if (!isBlockedTime && selectedServices.length === 0) {
      alert('Selecione ao menos um serviço!');
      return;
    }

    const clientObj = clients.find(c => c.id === clientId);
    const barberObj = barbers.find(b => b.id === barberId);
    const serviceNamesArr = selectedServices.map(sId => services.find(s => s.id === sId)?.name || '');

    onSaveAppointment({
      id: appId || undefined,
      clientId: isBlockedTime ? '' : clientId,
      clientName: isBlockedTime ? 'BLOQUEADO' : (clientObj?.name || 'Cliente Oculto'),
      clientPhone: isBlockedTime ? '' : (clientObj?.phone || ''),
      barberId,
      barberName: barberObj?.name || 'Barbeiro',
      serviceIds: isBlockedTime ? [] : selectedServices,
      serviceNames: isBlockedTime ? [] : serviceNamesArr,
      date: selectedDate,
      time,
      status,
      notes,
      isBlockedTime
    });

    setIsModalOpen(false);
  };

  const handleUpdateStatus = (app: Appointment, newStatus: AppointmentStatus) => {
    onSaveAppointment({
      ...app,
      status: newStatus
    });
  };

  // Grid Data compilation: find appointments for selected date and map them by hour & barber
  const dailyScheduleGrid = useMemo(() => {
    const grid: { [timeSlot: string]: { [barber: string]: Appointment } } = {};
    
    // Initialize slot rows
    hoursList.forEach(h => {
      grid[h] = {};
    });

    // Populate with appointments
    appointments.forEach(app => {
      if (app.date === selectedDate) {
        // Find closest slot or place exactly
        if (grid[app.time]) {
          grid[app.time][app.barberId] = app;
        }
      }
    });

    return grid;
  }, [appointments, selectedDate]);

  return (
    <div className="space-y-6" id="scheduling_view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Agenda Interativa e Reserva
          </h2>
          <p className="text-sm text-gray-500">
            Acompanhe o mapa de assentos diário, crie novos agendamentos e faça bloqueios de horários com facilidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Quadro Diário
            </button>
            <button
              onClick={() => setActiveTab('lista')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'lista' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Lista Completa
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-xs shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Agendar Horário
          </button>
        </div>
      </div>

      {/* Date selector and filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selecionar Dia:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none"
          />
        </div>

        {activeTab === 'lista' && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedBarberFilter}
              onChange={(e) => setSelectedBarberFilter(e.target.value)}
              className="p-2 text-xs rounded-xl border border-gray-200 text-gray-700 focus:outline-none"
            >
              <option value="todos">Filtrar por Barbeiro: Todos</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeTab === 'grid' ? (
        /* GRID VIEW: Split by column (Barber) and row (Hours) */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header: Columns representing barbers */}
              <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 text-center font-bold text-xs text-gray-500 uppercase">
                <div className="col-span-2 p-3 border-r border-gray-100">Horário</div>
                {barbers.map(barber => (
                  <div key={barber.id} className="col-span-3 p-3 border-r border-gray-100 flex items-center justify-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: barber.color || '#820ad1' }}></div>
                    <span>{barber.name}</span>
                  </div>
                ))}
              </div>

              {/* Rows of time slots */}
              <div className="divide-y divide-gray-100">
                {hoursList.map(hour => {
                  return (
                    <div key={hour} className="grid grid-cols-12 items-stretch min-h-[50px]">
                      {/* Hour slot marker */}
                      <div className="col-span-2 p-2 border-r border-gray-100 bg-gray-50/20 text-center flex items-center justify-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-mono text-xs font-bold text-gray-700">{hour}</span>
                      </div>

                      {/* Barber Column Slots */}
                      {barbers.map(barber => {
                        const cellApp = dailyScheduleGrid[hour]?.[barber.id];
                        
                        return (
                          <div key={barber.id} className="col-span-3 p-1.5 border-r border-gray-100 flex items-center justify-stretch">
                            {cellApp ? (
                              cellApp.isBlockedTime ? (
                                /* Blocked slot block */
                                <div 
                                  onClick={() => handleOpenEditModal(cellApp)}
                                  className="w-full h-full bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl p-2 flex items-center gap-2 text-red-800 cursor-pointer transition-colors"
                                >
                                  <Lock className="h-3.5 w-3.5 shrink-0" />
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Bloqueado</p>
                                    <p className="text-[10px] italic truncate">{cellApp.notes}</p>
                                  </div>
                                </div>
                              ) : (
                                /* Active appointment block */
                                <div
                                  onClick={() => handleOpenEditModal(cellApp)}
                                  className={`w-full h-full rounded-xl p-2 flex flex-col justify-between cursor-pointer border hover:shadow-sm transition-all ${
                                    cellApp.status === 'finalizado' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                                    cellApp.status === 'em_atendimento' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                                    cellApp.status === 'confirmado' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
                                    cellApp.status === 'cancelado' ? 'bg-gray-100 border-gray-200 text-gray-500 line-through' :
                                    'bg-purple-50/60 border-purple-100 text-purple-900'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <p className="text-xs font-bold truncate leading-tight">{cellApp.clientName}</p>
                                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white border border-black/5">
                                      {cellApp.status}
                                    </span>
                                  </div>
                                  <p className="text-[9px] truncate font-medium mt-1">
                                    {cellApp.serviceNames.join(' + ') || 'Sem serviços'}
                                  </p>
                                </div>
                              )
                            ) : (
                              /* Empty button slot */
                              <button
                                onClick={() => handleOpenAddModal(hour, barber.id)}
                                className="w-full h-full border border-dashed border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 rounded-xl transition-all duration-150 flex items-center justify-center text-gray-300 hover:text-purple-600 group text-xs font-semibold gap-1"
                              >
                                <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">Reservar</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW: General management filterable */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs font-bold uppercase">
                  <th className="p-4">Cliente / Horário</th>
                  <th className="p-4">Barbeiro</th>
                  <th className="p-4">Serviços</th>
                  <th className="p-4">Valor Estimado</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments
                  .filter(app => {
                    const matchesBarber = selectedBarberFilter === 'todos' || app.barberId === selectedBarberFilter;
                    const matchesDate = app.date === selectedDate;
                    return matchesBarber && matchesDate;
                  })
                  .map(app => (
                    <tr key={app.id} className="hover:bg-gray-50/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="p-2.5 bg-gray-50 text-gray-700 rounded-xl font-mono text-xs font-bold border border-gray-100">
                            {app.time}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900">{app.isBlockedTime ? 'HORÁRIO BLOQUEADO' : app.clientName}</p>
                            <p className="text-xs text-gray-400">{app.clientPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">{app.barberName}</td>
                      <td className="p-4 text-xs font-medium text-gray-500 max-w-xs truncate">
                        {app.isBlockedTime ? 'Bloqueio de Agenda' : app.serviceNames.join(', ')}
                      </td>
                      <td className="p-4 font-bold text-gray-900">R$ {app.priceTotal.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase inline-block border ${
                          app.status === 'finalizado' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                          app.status === 'em_atendimento' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                          app.status === 'confirmado' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
                          app.status === 'cancelado' ? 'bg-red-50 border-red-100 text-red-500' :
                          'bg-purple-50 border-purple-100 text-purple-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {app.status === 'agendado' && (
                            <button
                              onClick={() => handleUpdateStatus(app, 'confirmado')}
                              className="p-1 text-xs font-bold hover:bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 px-2 py-1"
                            >
                              Confirmar
                            </button>
                          )}
                          {app.status === 'confirmado' && (
                            <button
                              onClick={() => handleUpdateStatus(app, 'em_atendimento')}
                              className="p-1 text-xs font-bold hover:bg-blue-50 text-blue-600 rounded-lg border border-blue-200 px-2 py-1"
                            >
                              Sentar
                            </button>
                          )}
                          {app.status === 'em_atendimento' && (
                            <button
                              onClick={() => handleUpdateStatus(app, 'finalizado')}
                              className="p-1 text-xs font-bold hover:bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200 px-2 py-1"
                            >
                              Concluir
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1 text-xs hover:bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg font-semibold text-gray-600"
                          >
                            Reagendar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Book / Edit Appointment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                {appId ? 'Modificar Agendamento de Cadeira' : 'Agendar Novo Horário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Fechar</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {/* Type selector: standard vs blocked */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsBlockedTime(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isBlockedTime ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Reserva para Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlockedTime(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isBlockedTime ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Bloquear Horário
                </button>
              </div>

              {/* Day info readout */}
              <div className="p-2 bg-purple-50 text-purple-800 rounded-xl text-xs font-bold flex justify-between">
                <span>Data: {selectedDate}</span>
                <span>Hora de início: {time}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Barbeiro Designado</label>
                <select
                  value={barberId}
                  onChange={(e) => setBarberId(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
                >
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Horário Selecionado</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
                >
                  {hoursList.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {!isBlockedTime ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Selecionar Cliente</label>
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none"
                    >
                      <option value="" disabled>Selecione o Cliente</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Serviços Selecionados</label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                      {services.map(srv => {
                        const isChecked = selectedServices.includes(srv.id);
                        return (
                          <label key={srv.id} className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isChecked ? 'bg-purple-100 border-purple-300 text-purple-900' : 'bg-white hover:bg-gray-50 text-gray-600'
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleServiceToggle(srv.id)}
                              className="rounded accent-purple-600 text-white"
                            />
                            <span>{srv.name} (R$ {srv.price})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Observações ou Motivo de Bloqueio</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Almoço, folga ou preferências adicionais..."
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none h-16 text-gray-700"
                />
              </div>

              {appId && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status do Atendimento</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none capitalize"
                  >
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-between gap-2 border-t border-gray-100">
                {appId ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Deseja realmente remover este agendamento?')) {
                        handleUpdateStatus({ id: appId } as Appointment, 'cancelado');
                        setIsModalOpen(false);
                      }
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir / Cancelar
                  </button>
                ) : <div />}
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                  >
                    Salvar Reserva
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
