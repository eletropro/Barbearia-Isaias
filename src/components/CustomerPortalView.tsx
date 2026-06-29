/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Scissors,
  CheckCircle,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gift,
  Search,
  MessageSquare,
  Car,
  AlertCircle,
  RefreshCw,
  XCircle,
  DollarSign
} from 'lucide-react';
import { Appointment, Client, Service, User as BarberUser, LoyaltyConfig, CompanyConfig } from '../types';
import { BarberStateEngine } from '../barberState';

interface CustomerPortalViewProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  barbers: BarberUser[];
  loyaltyConfig: LoyaltyConfig;
  companyConfig?: CompanyConfig;
  currentUser?: any;
  onSaveAppointment: (app: any) => void;
  onSaveClient: (client: any) => void;
  onLogout?: () => void;
}

export default function CustomerPortalView({
  appointments,
  clients,
  services,
  barbers,
  loyaltyConfig,
  companyConfig,
  currentUser,
  onSaveAppointment,
  onSaveClient,
  onLogout
}: CustomerPortalViewProps) {
  // Navigation inside portal
  const [portalTab, setPortalTab] = useState<'agendar' | 'meu_perfil'>('agendar');
  
  // Frame Simulation
  const isRealCustomer = currentUser && currentUser.role === 'customer';
  const [deviceFrame, setDeviceFrame] = useState<boolean>(!isRealCustomer);

  // Booking Flow States
  const [step, setStep] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('qualquer'); // 'qualquer' or barber.id
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Client Info States
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custCpf, setCustCpf] = useState('');
  
  // Vehicle Info (Optional)
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState<'carro' | 'moto' | 'outro'>('carro');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Finished Booking result
  const [bookingReceipt, setBookingReceipt] = useState<Appointment | null>(null);

  // Loyalty Inquiry States
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedClient, setSearchedClient] = useState<Client | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-fill and lookup if customer is authenticated
  useEffect(() => {
    if (currentUser && currentUser.role === 'customer') {
      const clientObj = clients.find(c => c.id === `cli_${currentUser.id}` || c.email.toLowerCase() === currentUser.email.toLowerCase());
      if (clientObj) {
        setSearchedClient(clientObj);
        setHasSearched(true);
        setCustName(clientObj.name);
        setCustPhone(clientObj.phone);
        setCustEmail(clientObj.email);
        setCustCpf(clientObj.cpfCnpj);
      } else {
        setCustName(currentUser.name);
        setCustEmail(currentUser.email);
        setCustPhone(currentUser.phone || '');
      }
    }
  }, [currentUser, clients]);

  const getWeekdayName = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[dateObj.getDay()];
  };

  const activeWorkingHour = useMemo(() => {
    const weekday = getWeekdayName(selectedDate);
    return companyConfig?.workingHours?.find(h => h.weekday === weekday) || { weekday, hours: '09:00 às 18:00', closed: false };
  }, [selectedDate, companyConfig]);

  const hoursList = useMemo(() => {
    if (!activeWorkingHour || activeWorkingHour.closed) return [];
    
    const match = activeWorkingHour.hours.match(/(\d{2}):(\d{2})\s*(?:às|to|-)\s*(\d{2}):(\d{2})/i);
    if (!match) {
      return [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
      ];
    }
    
    const startHour = parseInt(match[1], 10);
    const startMin = parseInt(match[2], 10);
    const endHour = parseInt(match[3], 10);
    const endMin = parseInt(match[4], 10);
    
    const slots: string[] = [];
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      const hStr = currentHour.toString().padStart(2, '0');
      const mStr = currentMin.toString().padStart(2, '0');
      slots.push(`${hStr}:${mStr}`);
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin -= 60;
      }
    }
    
    if (slots.length > 1 && slots[slots.length - 1] === `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`) {
      slots.pop();
    }
    
    return slots;
  }, [activeWorkingHour]);

  // Calculate selected services totals
  const selectedServicesObjects = useMemo(() => {
    return services.filter(s => selectedServices.includes(s.id));
  }, [selectedServices, services]);

  const priceTotal = useMemo(() => {
    return selectedServicesObjects.reduce((acc, s) => acc + s.price, 0);
  }, [selectedServicesObjects]);

  const durationTotal = useMemo(() => {
    return selectedServicesObjects.reduce((acc, s) => acc + s.durationMin, 0);
  }, [selectedServicesObjects]);

  // Determine availability dynamically
  const getUnavailableSlotsForDateAndBarber = (date: string, bId: string) => {
    // Return times that are already booked on this date for this barber
    return appointments
      .filter(app => {
        if (app.date !== date || app.status === 'cancelado') return false;
        if (bId === 'qualquer') {
          // If customer wants 'any professional', a slot is only unavailable if ALL barbers are busy at that slot
          return false; // we handle this check in the slot generator
        }
        return app.barberId === bId;
      })
      .map(app => app.time);
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (timeStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    // Past times today are disabled
    if (selectedDate === today && timeStr <= currentTime) {
      return false;
    }

    if (selectedBarberId !== 'qualquer') {
      const busySlots = getUnavailableSlotsForDateAndBarber(selectedDate, selectedBarberId);
      return !busySlots.includes(timeStr);
    } else {
      // For Any Barber, we check if there's at least one barber who is NOT busy at this slot
      const bookedOnDate = appointments.filter(app => app.date === selectedDate && app.time === timeStr && app.status !== 'cancelado');
      const busyBarberIds = bookedOnDate.map(app => app.barberId);
      // Available if at least one of our barbers is not in the busy list
      const availableBarbers = barbers.filter(b => !busyBarberIds.includes(b.id));
      return availableBarbers.length > 0;
    }
  };

  // Find a free barber for a specific date/time (useful for 'qualquer' choice)
  const findAvailableBarberForSlot = (date: string, timeStr: string) => {
    const bookedOnDate = appointments.filter(app => app.date === date && app.time === timeStr && app.status !== 'cancelado');
    const busyBarberIds = bookedOnDate.map(app => app.barberId);
    const freeBarbers = barbers.filter(b => !busyBarberIds.includes(b.id));
    return freeBarbers[0] || barbers[0]; // defaults to first barber if none or all busy
  };

  // Toggle selected service
  const handleToggleService = (sId: string) => {
    setSelectedServices(prev => 
      prev.includes(sId) ? prev.filter(id => id !== sId) : [...prev, sId]
    );
  };

  // Perform client lookup or registration + schedule appointment
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !selectedTime || !custName || !custPhone) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    // 1. Look up client or Register client
    let clientObj = null;

    if (currentUser && currentUser.role === 'customer') {
      clientObj = clients.find(c => c.id === `cli_${currentUser.id}` || (c.email && c.email.toLowerCase() === currentUser.email.toLowerCase()));
    }

    if (!clientObj) {
      const cleanPhone = custPhone.replace(/\D/g, '');
      clientObj = clients.find(c => c.phone.replace(/\D/g, '') === cleanPhone);
    }

    if (!clientObj) {
      // Create new client in local storage state
      const newClient = {
        id: currentUser?.role === 'customer' ? `cli_${currentUser.id}` : undefined,
        name: custName,
        phone: custPhone,
        email: custEmail || (currentUser?.email) || `${custPhone.replace(/\D/g, '')}@cliente.com`,
        cpfCnpj: custCpf,
        birthDate: '',
        address: '',
        city: '',
        notes: 'Cadastrado via aplicativo de agendamento online.',
        vehicleType: hasVehicle ? vehicleType : undefined,
        vehicleModel: hasVehicle ? vehicleModel : undefined,
        vehicleColor: hasVehicle ? vehicleColor : undefined,
        vehiclePlate: hasVehicle ? vehiclePlate : undefined,
        loyaltyPoints: 0,
        cashbackAmount: 0,
        totalSpent: 0,
        attachments: []
      };
      clientObj = onSaveClient(newClient) as any;
    }

    // Determine target Barber
    let targetBarber = barbers.find(b => b.id === selectedBarberId);
    if (selectedBarberId === 'qualquer' || !targetBarber) {
      targetBarber = findAvailableBarberForSlot(selectedDate, selectedTime);
    }

    // 2. Schedule Appointment
    const newAppointment = {
      clientId: clientObj?.id || (currentUser?.role === 'customer' ? `cli_${currentUser.id}` : `cust_${Date.now()}`),
      clientName: custName,
      clientPhone: custPhone,
      barberId: targetBarber.id,
      barberName: targetBarber.name,
      serviceIds: selectedServices,
      serviceNames: selectedServicesObjects.map(s => s.name),
      date: selectedDate,
      time: selectedTime,
      status: 'agendado' as const,
      notes: hasVehicle ? `Veículo: ${vehicleModel} (${vehiclePlate})` : '',
      isBlockedTime: false,
      priceTotal: priceTotal
    };

    onSaveAppointment(newAppointment);

    // Save temporary booking receipt state
    setBookingReceipt(newAppointment);
    setStep(5);
  };

  // Customer Loyalty card search
  const handleSearchLoyalty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) return;

    const clean = searchPhone.replace(/\D/g, '');
    const found = clients.find(c => c.phone.replace(/\D/g, '') === clean);
    setSearchedClient(found || null);
    setHasSearched(true);
  };

  // Get active upcoming appointments of searched user
  const clientAppointments = useMemo(() => {
    if (!searchedClient) return [];
    return appointments.filter(app => 
      app.clientId === searchedClient.id && app.status !== 'cancelado'
    );
  }, [searchedClient, appointments]);

  const handleCancelAppointment = (appId: string) => {
    if (confirm('Tem certeza de que deseja cancelar este agendamento?')) {
      const targetApp = appointments.find(a => a.id === appId);
      if (targetApp) {
        onSaveAppointment({
          ...targetApp,
          status: 'cancelado'
        });
        alert('Agendamento cancelado com sucesso!');
      }
    }
  };

  // Reset booking form to make a new reservation
  const handleResetForm = () => {
    setStep(1);
    setSelectedServices([]);
    setSelectedBarberId('qualquer');
    setSelectedTime('');
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustCpf('');
    setHasVehicle(false);
    setVehicleModel('');
    setVehicleColor('');
    setVehiclePlate('');
    setBookingReceipt(null);
  };

  return (
    <div className="space-y-6" id="customer_portal_root">
      {/* Upper Information Banner */}
      {!isRealCustomer && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
              Aplicativo de Agendamento do Cliente
            </h2>
            <p className="text-sm text-gray-500">
              Esta tela representa o aplicativo ou link direto que seus clientes utilizam para realizar agendamentos integrados, consultar fidelidade e acompanhar o histórico de visitas em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">Visualização:</span>
            <button
              onClick={() => setDeviceFrame(!deviceFrame)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                deviceFrame 
                  ? 'bg-purple-100 border-purple-200 text-purple-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              {deviceFrame ? 'Visualização Mobile' : 'Tela Cheia (Responsivo)'}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className={deviceFrame ? 'flex justify-center items-center py-4 bg-slate-100/50 rounded-3xl border border-slate-200' : 'w-full'}>
        
        {/* Smartphone Wrapper or Simple Layout Container */}
        <div className={deviceFrame ? 'w-[375px] h-[720px] bg-slate-950 rounded-[50px] p-3.5 shadow-2xl relative border-[6px] border-slate-800 flex flex-col overflow-hidden' : 'w-full bg-white rounded-3xl border border-gray-100 shadow-md p-6'}>
          
          {/* Smartphone Speaker and Camera Notch Sim */}
          {deviceFrame && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
            </div>
          )}

          {/* Core Smartphone Screen Viewport */}
          <div className={`flex-1 flex flex-col rounded-[36px] overflow-hidden bg-slate-50 relative ${deviceFrame ? 'pt-6' : ''}`}>
            
            {/* Simulation Header */}
            <header className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scissors className="h-4.5 w-4.5 text-purple-400" />
                <span className="font-extrabold text-xs tracking-wider font-mono">{BarberStateEngine.getCompanyConfig().name.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                {currentUser ? (
                  <button
                    onClick={onLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-[9px] font-bold transition-all shadow"
                  >
                    Sair da Conta
                  </button>
                ) : (
                  <span>● Online</span>
                )}
              </div>
            </header>

            {/* Portal Tab Switcher */}
            <div className="flex border-b border-gray-200 bg-white">
              <button
                onClick={() => setPortalTab('agendar')}
                className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 ${
                  portalTab === 'agendar'
                    ? 'border-purple-600 text-purple-600 bg-purple-50/20'
                    : 'border-transparent text-gray-400 hover:text-gray-800'
                }`}
              >
                Agendar Horário
              </button>
              <button
                onClick={() => {
                  setPortalTab('meu_perfil');
                  setHasSearched(false);
                  setSearchedClient(null);
                  setSearchPhone('');
                }}
                className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 ${
                  portalTab === 'meu_perfil'
                    ? 'border-purple-600 text-purple-600 bg-purple-50/20'
                    : 'border-transparent text-gray-400 hover:text-gray-800'
                }`}
              >
                Fidelidade & Agenda
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {portalTab === 'agendar' ? (
                <div>
                  {/* Step Indicators */}
                  {step <= 4 && (
                    <div className="flex items-center justify-between px-2 mb-4">
                      {[1, 2, 3, 4].map(sNum => (
                        <div key={sNum} className="flex items-center">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all border ${
                            step === sNum
                              ? 'bg-purple-600 border-purple-600 text-white shadow'
                              : step > sNum
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-gray-200 text-gray-400'
                          }`}>
                            {step > sNum ? '✓' : sNum}
                          </div>
                          {sNum < 4 && (
                            <div className={`w-8 h-0.5 mx-1 transition-all ${
                              step > sNum ? 'bg-emerald-400' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 1: SELECT SERVICES */}
                  {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">Selecione os Serviços</h3>
                        <p className="text-[11px] text-gray-400">Você pode selecionar mais de um serviço para seu agendamento.</p>
                      </div>

                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {services.map(service => {
                          const isSelected = selectedServices.includes(service.id);
                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => handleToggleService(service.id)}
                              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-purple-50 border-purple-400 shadow-sm'
                                  : 'bg-white hover:bg-gray-50 border-gray-100'
                              }`}
                            >
                              <div className="space-y-1 pr-2">
                                <span className="text-xs font-bold text-gray-900 block">{service.name}</span>
                                <span className="text-[10px] text-gray-400 block font-mono">⏱ {service.durationMin} min</span>
                              </div>
                              <span className="text-xs font-extrabold text-purple-700 font-mono">
                                R$ {service.price.toFixed(2)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Sticky Summary bottom */}
                      {selectedServices.length > 0 && (
                        <div className="bg-purple-900 text-white p-3 rounded-2xl space-y-2 mt-4">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold">Serviços Selecionados:</span>
                            <span className="font-extrabold">{selectedServices.length}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-white/10 pt-1.5 font-bold">
                            <span>Valor Estimado:</span>
                            <span className="font-mono">R$ {priceTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={selectedServices.length === 0}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-bold py-3 rounded-2xl shadow transition-all flex items-center justify-center gap-1.5 mt-2"
                      >
                        Avançar <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: SELECT BARBER */}
                  {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setStep(1)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900">Selecione o Profissional</h3>
                          <p className="text-[11px] text-gray-400">Escolha o seu barbeiro favorito ou o primeiro disponível.</p>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {/* Option: Qualquer Profissional */}
                        <button
                          type="button"
                          onClick={() => setSelectedBarberId('qualquer')}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                            selectedBarberId === 'qualquer'
                              ? 'bg-purple-50 border-purple-400 shadow-sm'
                              : 'bg-white hover:bg-gray-50 border-gray-100'
                          }`}
                        >
                          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">Qualquer Profissional</span>
                            <span className="text-[10px] text-purple-600 block">Selecione para ver maior disponibilidade</span>
                          </div>
                        </button>

                        {/* List Barbers */}
                        {barbers.map(barber => (
                          <button
                            key={barber.id}
                            type="button"
                            onClick={() => setSelectedBarberId(barber.id)}
                            className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                              selectedBarberId === barber.id
                                ? 'bg-purple-50 border-purple-400 shadow-sm'
                                : 'bg-white hover:bg-gray-50 border-gray-100'
                            }`}
                          >
                            <img
                              src={barber.photoUrl}
                              alt={barber.name}
                              className="h-10 w-10 rounded-full object-cover border border-purple-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="text-xs font-bold text-gray-900 block">{barber.name}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: barber.color }} />
                                <span className="text-[10px] text-gray-400">Excelente em degradê e barba</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-2xl shadow transition-all flex items-center justify-center gap-1.5 mt-2"
                      >
                        Avançar <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 3: SELECT DATE & TIME */}
                  {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setStep(2)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900">Agenda Disponível</h3>
                          <p className="text-[11px] text-gray-400">Escolha o dia e o horário desejado.</p>
                        </div>
                      </div>

                      {/* Date Picker input */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Selecione o Dia</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime('');
                          }}
                          className="w-full p-2.5 border border-gray-200 text-xs rounded-xl focus:outline-none bg-white font-semibold"
                        />
                      </div>

                      {/* Time Slots Grid */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Horários Disponíveis para este dia</label>
                        <div className="grid grid-cols-4 gap-1.5 max-h-[220px] overflow-y-auto p-1 bg-white border border-gray-100 rounded-2xl">
                          {hoursList.map(tSlot => {
                            const available = isTimeSlotAvailable(tSlot);
                            const isSelected = selectedTime === tSlot;
                            return (
                              <button
                                key={tSlot}
                                type="button"
                                disabled={!available}
                                onClick={() => setSelectedTime(tSlot)}
                                className={`py-2 text-center text-[10px] font-extrabold rounded-xl transition-all border ${
                                  isSelected
                                    ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                    : available
                                    ? 'bg-purple-50/40 hover:bg-purple-100/60 border-purple-100 text-purple-900'
                                    : 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed line-through'
                                }`}
                              >
                                {tSlot}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-4 items-center justify-center text-[9px] font-bold text-gray-400 mt-2">
                          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-purple-50 rounded-md border border-purple-100" /> Livre</span>
                          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-gray-100 rounded-md border border-gray-100" /> Ocupado / Passado</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        disabled={!selectedTime}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-bold py-3 rounded-2xl shadow transition-all flex items-center justify-center gap-1.5 mt-2"
                      >
                        Avançar <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 4: CUSTOMER CONTACT & CONFIRMATION */}
                  {step === 4 && (
                    <form onSubmit={handleConfirmBooking} className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setStep(3)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900">Seus Dados de Contato</h3>
                          <p className="text-[11px] text-gray-400">Última etapa! Informe seus dados para confirmar.</p>
                        </div>
                      </div>

                      <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1">Nome Completo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Seu Nome Completo"
                            value={custName}
                            onChange={(e) => setCustName(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1">WhatsApp / Telefone *</label>
                          <input
                            type="tel"
                            required
                            placeholder="Ex: (11) 99999-8888"
                            value={custPhone}
                            onChange={(e) => setCustPhone(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none font-semibold"
                          />
                        </div>

                        {/* Collapsible Vehicle Check (VIP Parking service) */}
                        <div className="border-t border-gray-100 pt-2.5">
                          <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 font-bold">
                            <input
                              type="checkbox"
                              checked={hasVehicle}
                              onChange={(e) => setHasVehicle(e.target.checked)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Vou de Carro ou Moto (Vaga Garantida)</span>
                          </label>

                          {hasVehicle && (
                            <div className="mt-2.5 bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 grid grid-cols-2 gap-2">
                              <div className="col-span-2">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase">Modelo do Veículo</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Civic Preto"
                                  value={vehicleModel}
                                  onChange={(e) => setVehicleModel(e.target.value)}
                                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase">Placa</label>
                                <input
                                  type="text"
                                  placeholder="Ex: ABC-1234"
                                  value={vehiclePlate}
                                  onChange={(e) => setVehiclePlate(e.target.value)}
                                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase">Tipo</label>
                                <select
                                  value={vehicleType}
                                  onChange={(e) => setVehicleType(e.target.value as any)}
                                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                                >
                                  <option value="carro">Carro</option>
                                  <option value="moto">Moto</option>
                                  <option value="outro">Outro</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Briefing Box */}
                      <div className="bg-purple-950 text-white p-3.5 rounded-2xl text-[10px] space-y-2">
                        <p className="font-extrabold uppercase tracking-wide text-purple-400">Resumo do Agendamento</p>
                        <div className="space-y-1">
                          <p><span className="text-gray-400">Dia:</span> <span className="font-bold">{selectedDate.split('-').reverse().join('/')}</span> às <span className="font-bold">{selectedTime}</span></p>
                          <p><span className="text-gray-400">Profissional:</span> <span className="font-bold">{selectedBarberId === 'qualquer' ? 'Primeiro Disponível' : barbers.find(b => b.id === selectedBarberId)?.name}</span></p>
                          <p><span className="text-gray-400">Serviços:</span> <span className="font-semibold">{selectedServicesObjects.map(s => s.name).join(', ')}</span></p>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-xs">
                          <span>Total Estimado:</span>
                          <span className="text-emerald-400 font-mono">R$ {priceTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-2xl shadow transition-all flex items-center justify-center gap-1.5 mt-2"
                      >
                        <CheckCircle className="h-4.5 w-4.5 animate-pulse" /> Confirmar & Agendar Corte
                      </button>
                    </form>
                  )}

                  {/* STEP 5: SUCCESS RECEIPT SCREEN */}
                  {step === 5 && bookingReceipt && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center py-6">
                      <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="h-7 w-7" />
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">Agendamento Realizado!</h3>
                        <p className="text-[11px] text-gray-500">Seu horário está confirmado e sincronizado com os sistemas da barbearia.</p>
                      </div>

                      {/* Paper Ticket Sim */}
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm text-left p-4 space-y-3 relative overflow-hidden font-mono text-[10px] text-gray-700">
                        {/* Cut lines decors */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
                        
                        <div className="text-center font-bold text-xs uppercase text-gray-900 border-b border-gray-100 pb-2">
                          Recibo de Agendamento
                        </div>

                        <div className="space-y-1">
                          <p><span className="text-gray-400">CLIENTE:</span> <span className="font-bold text-gray-900">{bookingReceipt.clientName}</span></p>
                          <p><span className="text-gray-400">TELEFONE:</span> <span className="font-bold">{bookingReceipt.clientPhone}</span></p>
                          <p><span className="text-gray-400">PROFISSIONAL:</span> <span className="font-bold text-gray-900">{bookingReceipt.barberName}</span></p>
                          <p><span className="text-gray-400">DATA:</span> <span className="font-bold text-gray-900">{bookingReceipt.date.split('-').reverse().join('/')}</span></p>
                          <p><span className="text-gray-400">HORÁRIO:</span> <span className="font-bold text-gray-900">{bookingReceipt.time}</span></p>
                          <p><span className="text-gray-400">SERVIÇOS:</span> <span className="font-semibold text-gray-900">{bookingReceipt.serviceNames.join(', ')}</span></p>
                        </div>

                        <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-xs text-gray-950">
                          <span>TOTAL:</span>
                          <span>R$ {bookingReceipt.priceTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bg-purple-50 text-purple-950 text-[10px] p-3 rounded-2xl border border-purple-100 flex items-center gap-1.5 text-left">
                        <MessageSquare className="h-4 w-4 text-purple-600 shrink-0" />
                        <span>Um lembrete de agendamento automático foi disparado para seu WhatsApp. Nos vemos lá!</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-2xl shadow transition-all"
                      >
                        Fazer Novo Agendamento
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                /* TAB 2: MY FIDELITY AND SCHEDULING HISTORY */
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Hide search field for logged-in real customer */}
                  {!isRealCustomer ? (
                    <>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">Consulta de Fidelidade</h3>
                        <p className="text-[11px] text-gray-400">Informe seu WhatsApp para consultar seu saldo de pontos, cashback e agendamentos.</p>
                      </div>

                      <form onSubmit={handleSearchLoyalty} className="flex gap-2">
                        <input
                          type="tel"
                          required
                          placeholder="Ex: (11) 99999-8888"
                          value={searchPhone}
                          onChange={(e) => setSearchPhone(e.target.value)}
                          className="flex-1 p-2.5 border border-gray-200 text-xs rounded-xl focus:outline-none bg-white font-semibold shadow-sm"
                        />
                        <button
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="pb-2 border-b border-gray-100">
                      <h3 className="text-sm font-extrabold text-gray-900">Olá, {custName}!</h3>
                      <p className="text-[11px] text-gray-400">Aqui está o seu painel de fidelidade, saldo e histórico de agendamentos em tempo real.</p>
                    </div>
                  )}

                  {hasSearched && searchedClient ? (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-250">
                      
                      {/* Fidelity digital card mockup */}
                      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 text-white rounded-3xl p-5 shadow-lg border border-indigo-500/20 space-y-4 relative overflow-hidden">
                        {/* Glow orb */}
                        <div className="absolute -top-12 -right-12 h-36 w-36 bg-purple-500/10 rounded-full blur-xl" />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase font-mono">CARTÃO FIDELIDADE DIGITAL</span>
                            <h4 className="font-extrabold text-sm mt-0.5">{searchedClient.name}</h4>
                          </div>
                          <Gift className="h-5 w-5 text-purple-400 animate-pulse" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 font-mono">
                          <div>
                            <span className="text-[8px] text-gray-400 uppercase block">Pontos Acumulados</span>
                            <span className="text-lg font-bold text-indigo-300">{searchedClient.loyaltyPoints} pts</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-400 uppercase block">Saldo Cashback</span>
                            <span className="text-lg font-bold text-emerald-300">R$ {searchedClient.cashbackAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Progress Bar to next coupon */}
                        <div className="space-y-1 text-[9px]">
                          <div className="flex justify-between text-gray-300">
                            <span>Meta para Cupom de R$ {loyaltyConfig.couponRewardValue}</span>
                            <span className="font-bold">{searchedClient.loyaltyPoints} / {loyaltyConfig.pointsThreshold} pts</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-purple-400 to-indigo-400 h-full transition-all duration-300" 
                              style={{ width: `${Math.min(100, (searchedClient.loyaltyPoints / loyaltyConfig.pointsThreshold) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Client Scheduled Appointments */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-800">Seus Próximos Agendamentos</h4>
                        
                        {clientAppointments.length === 0 ? (
                          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <p className="text-[11px] text-gray-400 font-medium">Nenhum agendamento futuro encontrado.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {clientAppointments.map(app => (
                              <div key={app.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center text-xs">
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-gray-900 block capitalize">⏱ {app.time} - {app.date.split('-').reverse().join('/')}</span>
                                  <span className="text-[10px] text-purple-600 block">Profissional: {app.barberName}</span>
                                  <span className="text-[10px] text-gray-400 block truncate max-w-[180px]">{app.serviceNames.join(', ')}</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleCancelAppointment(app.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all"
                                  title="Cancelar Horário"
                                >
                                  <XCircle className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : hasSearched ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center text-red-800 text-xs font-semibold animate-in zoom-in-95 duration-200">
                      <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-2" />
                      Nenhum cliente cadastrado com este telefone. Faça um agendamento para se credenciar em nosso sistema de fidelidade!
                    </div>
                  ) : null}

                </div>
              )}

            </div>

            {/* Simulated Smartphone Dock buttons bar */}
            {deviceFrame && (
              <div className="bg-white border-t border-gray-100 p-2 flex justify-center items-center gap-1 shrink-0">
                <div className="h-1 w-28 bg-slate-400 rounded-full"></div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Visual walkthrough instructions card */}
      {!isRealCustomer && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-extrabold">1</div>
            <h4 className="font-bold text-purple-300">Reserva de Horários Automatizada</h4>
            <p className="text-gray-400">O cliente seleciona um ou mais serviços, o profissional preferido e o dia. O sistema calcula a disponibilidade com base nas agendas de cada cadeira da barbearia.</p>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-extrabold">2</div>
            <h4 className="font-bold text-purple-300">Integração do Cadastro em CRM</h4>
            <p className="text-gray-400">Ao preencher os dados de contato, o sistema cruza as informações. Se o cliente já existia, ele apenas agenda. Se for novo, ele é automaticamente credenciado no banco de dados.</p>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-extrabold">3</div>
            <h4 className="font-bold text-purple-300">Consulta de Fidelidade & Cashback</h4>
            <p className="text-gray-400">O cliente pode consultar o cartão fidelidade digital dele instantaneamente, vendo sua pontuação e saldo cashback acumulado em tempo real direto pela tela simulação do app.</p>
          </div>
        </div>
      )}
    </div>
  );
}
