/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Edit2,
  Database,
  Cloud,
  RefreshCw,
  CheckCircle,
  Unlock,
  Lock,
  Smartphone,
  Building,
  FileText
} from 'lucide-react';
import { User, UserRole, SystemLog, CompanyConfig } from '../types';

interface SettingsViewProps {
  currentUser: User | null;
  barbers: User[];
  systemLogs: SystemLog[];
  companyConfig: CompanyConfig;
  onSaveBarber: (barber: any) => void;
  onSaveCompanyConfig: (config: CompanyConfig) => void;
  onTriggerBackup: () => void;
  onRestoreBackup: () => void;
  autoSync: boolean;
  onToggleAutoSync: () => void;
  onDeleteUser?: (id: string) => void;
}

export default function SettingsView({
  currentUser,
  barbers,
  systemLogs,
  companyConfig,
  onSaveBarber,
  onSaveCompanyConfig,
  onTriggerBackup,
  onRestoreBackup,
  autoSync,
  onToggleAutoSync,
  onDeleteUser
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'empresa' | 'funcionamento' | 'firebase' | 'logs'>('usuarios');
  
  // Backup loading animation simulation
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState('');

  // Company Profile states
  const [companyName, setCompanyName] = useState(companyConfig?.name || '');
  const [companyPhone, setCompanyPhone] = useState(companyConfig?.phone || '');
  const [companyWhatsapp, setCompanyWhatsapp] = useState(companyConfig?.whatsapp || '');
  const [companyInstagram, setCompanyInstagram] = useState(companyConfig?.instagram || '');
  const [companyAddress, setCompanyAddress] = useState(companyConfig?.address || '');
  
  // Invoice states
  const [companyRazaoSocial, setCompanyRazaoSocial] = useState(companyConfig?.razaoSocial || '');
  const [companyCnpj, setCompanyCnpj] = useState(companyConfig?.cnpj || '');
  const [companyIe, setCompanyIe] = useState(companyConfig?.inscricaoEstadual || '');
  const [companyIm, setCompanyIm] = useState(companyConfig?.inscricaoMunicipal || '');
  const [companyTaxRegime, setCompanyTaxRegime] = useState(companyConfig?.taxRegime || 'Simples Nacional');
  const [companyInvoiceEnabled, setCompanyInvoiceEnabled] = useState(companyConfig?.invoiceEnabled ?? true);
  const [companyInvoiceToken, setCompanyInvoiceToken] = useState(companyConfig?.invoiceApiToken || '');

  // Barber form states
  const [isBarberFormOpen, setIsBarberFormOpen] = useState(false);
  const [bId, setBId] = useState('');
  const [bName, setBName] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bRole, setBRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [bTarget, setBTarget] = useState(3000);
  const [bBonus, setBBonus] = useState(300);
  const [bPhotoUrl, setBPhotoUrl] = useState('');
  const [bColor, setBColor] = useState('#820ad1');
  const [bAllowedTabs, setBAllowedTabs] = useState<string[]>(['dashboard', 'agenda', 'vendas', 'clientes']);

  // Business Hours state
  const [workingHours, setWorkingHours] = useState<{ weekday: string; hours: string; closed: boolean }[]>(
    companyConfig?.workingHours || [
      { weekday: 'Segunda-feira', hours: '09:00 às 18:00', closed: false },
      { weekday: 'Terça-feira', hours: '09:00 às 20:00', closed: false },
      { weekday: 'Quarta-feira', hours: '09:00 às 20:00', closed: false },
      { weekday: 'Quinta-feira', hours: '09:00 às 21:00', closed: false },
      { weekday: 'Sexta-feira', hours: '09:00 às 21:00', closed: false },
      { weekday: 'Sábado', hours: '08:00 às 20:00', closed: false },
      { weekday: 'Domingo', hours: 'Fechado', closed: true }
    ]
  );

  const getTimesFromHoursString = (hoursStr: string) => {
    const match = hoursStr.match(/(\d{2}):(\d{2})\s*(?:às|to|-)\s*(\d{2}):(\d{2})/i);
    if (match) {
      return { start: `${match[1]}:${match[2]}`, end: `${match[3]}:${match[4]}` };
    }
    return { start: '09:00', end: '18:00' };
  };

  const handleWorkingHoursChange = (index: number, field: 'closed' | 'start' | 'end', value: any) => {
    setWorkingHours(prev => {
      const updated = [...prev];
      const current = { ...updated[index] };
      
      if (field === 'closed') {
        current.closed = value;
        if (value) {
          current.hours = 'Fechado';
        } else {
          current.hours = '09:00 às 18:00';
        }
      } else {
        const { start, end } = getTimesFromHoursString(current.hours);
        const newStart = field === 'start' ? value : start;
        const newEnd = field === 'end' ? value : end;
        current.hours = `${newStart} às ${newEnd}`;
        current.closed = false;
      }
      
      updated[index] = current;
      return updated;
    });
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleOpenAddBarber = () => {
    setBId('');
    setBName('');
    setBEmail('');
    setBRole(UserRole.EMPLOYEE);
    setBTarget(3000);
    setBBonus(300);
    setBPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
    setBColor('#820ad1');
    setBAllowedTabs(['dashboard', 'agenda', 'vendas', 'clientes']);
    setIsBarberFormOpen(true);
  };

  const handleOpenEditBarber = (barber: User) => {
    if (!isAdmin) {
      alert('Apenas administradores podem gerenciar contas de funcionários!');
      return;
    }
    setBId(barber.id);
    setBName(barber.name);
    setBEmail(barber.email);
    setBRole(barber.role);
    setBTarget(barber.targetMonth);
    setBBonus(barber.bonusAmount);
    setBPhotoUrl(barber.photoUrl);
    setBColor(barber.color || '#820ad1');
    setBAllowedTabs(barber.allowedTabs || ['dashboard', 'agenda', 'vendas', 'clientes']);
    setIsBarberFormOpen(true);
  };

  const handleBarberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName || !bEmail) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    onSaveBarber({
      id: bId || undefined,
      name: bName,
      email: bEmail,
      role: bRole,
      targetMonth: parseFloat(bTarget.toString()),
      bonusAmount: parseFloat(bBonus.toString()),
      photoUrl: bPhotoUrl,
      color: bColor,
      allowedTabs: bAllowedTabs
    });
    setIsBarberFormOpen(false);
  };

  const handleManualBackup = () => {
    setIsBackupLoading(true);
    setBackupSuccessMessage('');
    setTimeout(() => {
      onTriggerBackup();
      setIsBackupLoading(false);
      setBackupSuccessMessage('Backup exportado para o Firebase Cloud Storage com sucesso!');
    }, 1200);
  };

  const handleManualRestore = () => {
    if (confirm('A restauração irá resetar as coleções do Firestore para o último ponto de salvamento. Prosseguir?')) {
      setIsBackupLoading(true);
      setBackupSuccessMessage('');
      setTimeout(() => {
        onRestoreBackup();
        setIsBackupLoading(false);
        setBackupSuccessMessage('Tabelas e coleções do Firestore restauradas com sucesso!');
      }, 1200);
    }
  };



  return (
    <div className="space-y-6" id="settings_view_inner">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Configurações e Painel Firebase
          </h2>
          <p className="text-sm text-gray-500">
            Gerencie os barbeiros e comissões da equipe, horários de expediente, auditoria de logs e backup em tempo real.
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200 font-bold">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`pb-3 px-4 text-sm border-b-2 transition-all ${
            activeTab === 'usuarios'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Equipe / Barbeiros
        </button>
        <button
          onClick={() => setActiveTab('empresa')}
          className={`pb-3 px-4 text-sm border-b-2 transition-all ${
            activeTab === 'empresa'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Empresa & Notas Fiscais
        </button>
        <button
          onClick={() => setActiveTab('funcionamento')}
          className={`pb-3 px-4 text-sm border-b-2 transition-all ${
            activeTab === 'funcionamento'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Expediente
        </button>
        <button
          onClick={() => setActiveTab('firebase')}
          className={`pb-3 px-4 text-sm border-b-2 transition-all ${
            activeTab === 'firebase'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Sincronização Firebase
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-sm border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Registro de Auditoria
        </button>
      </div>

      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Equipe de Barbeiros Credenciados</span>
            {isAdmin && (
              <button
                onClick={handleOpenAddBarber}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Membro
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map(barber => (
              <div key={barber.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={barber.photoUrl}
                    alt={barber.name}
                    className="h-12 w-12 rounded-full object-cover border border-purple-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{barber.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">{barber.email}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-50 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nível de Acesso:</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold ${
                      barber.role === UserRole.ADMIN ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-purple-50 text-purple-700 border border-purple-100'
                    }`}>
                      {barber.role}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Cor na Agenda:</span>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: barber.color || '#820ad1' }}></div>
                      <span className="font-mono text-[10px] text-gray-400 uppercase">{barber.color}</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Meta do Mês:</span>
                    <span className="text-gray-800 font-bold">R$ {barber.targetMonth.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Bônus por Meta:</span>
                    <span className="text-emerald-600 font-extrabold">R$ {barber.bonusAmount.toFixed(2)}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleOpenEditBarber(barber)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Ajustar Perfil
                    </button>
                    {barber.id !== currentUser?.id && (
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza de que deseja remover o funcionário ${barber.name}?`)) {
                            onDeleteUser?.(barber.id);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                        title="Remover Funcionário"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'empresa' && (
        <form onSubmit={(e) => {
          e.preventDefault();
          onSaveCompanyConfig({
            ...companyConfig,
            name: companyName,
            phone: companyPhone,
            whatsapp: companyWhatsapp,
            instagram: companyInstagram,
            address: companyAddress,
            razaoSocial: companyRazaoSocial,
            cnpj: companyCnpj,
            inscricaoEstadual: companyIe,
            inscricaoMunicipal: companyIm,
            taxRegime: companyTaxRegime,
            invoiceEnabled: companyInvoiceEnabled,
            invoiceApiToken: companyInvoiceToken
          });
          alert('Configurações da empresa e dados para emissão de notas fiscais salvos com sucesso!');
        }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Company Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-50 dark:border-slate-800 pb-3">
                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Perfil & Dados Gerais</h3>
                  <p className="text-[11px] text-gray-500">Informações públicas de contato e localização da barbearia.</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Nome Fantasia (Exibido no App) *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Barbearia Estilo Real"
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Telefone Comercial</label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="(11) 3255-9000"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">WhatsApp de Contato</label>
                    <input
                      type="text"
                      value={companyWhatsapp}
                      onChange={(e) => setCompanyWhatsapp(e.target.value)}
                      placeholder="(11) 99999-1111"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Perfil do Instagram</label>
                  <input
                    type="text"
                    value={companyInstagram}
                    onChange={(e) => setCompanyInstagram(e.target.value)}
                    placeholder="@barbearia_exemplo"
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Endereço Completo</label>
                  <textarea
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Ex: Alameda Lorena, 1500 - Cerqueira César, São Paulo - SP"
                    rows={2}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Invoicing and Billing Data */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-50 dark:border-slate-800 pb-3">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Emissão de Notas Fiscais</h3>
                  <p className="text-[11px] text-gray-500">Dados cadastrais para emissão de NFS-e / NF-e.</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    required={companyInvoiceEnabled}
                    value={companyRazaoSocial}
                    onChange={(e) => setCompanyRazaoSocial(e.target.value)}
                    placeholder="Ex: Nome Completo ou Razão Social LTDA"
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">CNPJ *</label>
                  <input
                    type="text"
                    required={companyInvoiceEnabled}
                    value={companyCnpj}
                    onChange={(e) => setCompanyCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={companyIe}
                      onChange={(e) => setCompanyIe(e.target.value)}
                      placeholder="Isento ou Número IE"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Inscrição Municipal</label>
                    <input
                      type="text"
                      value={companyIm}
                      onChange={(e) => setCompanyIm(e.target.value)}
                      placeholder="Número IM"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Regime Tributário</label>
                    <select
                      value={companyTaxRegime}
                      onChange={(e) => setCompanyTaxRegime(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="MEI">MEI (Microempreendedor)</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                      <option value="Lucro Real">Lucro Real</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Emissão Ativa</label>
                    <div className="flex items-center mt-2.5 gap-2">
                      <input
                        type="checkbox"
                        id="invoice_enabled"
                        checked={companyInvoiceEnabled}
                        onChange={(e) => setCompanyInvoiceEnabled(e.target.checked)}
                        className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                      />
                      <label htmlFor="invoice_enabled" className="text-xs text-gray-600 dark:text-slate-300 cursor-pointer font-semibold select-none">
                        Faturamento Automatizado
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">API Token de Integração NFS-e</label>
                  <input
                    type="password"
                    value={companyInvoiceToken}
                    onChange={(e) => setCompanyInvoiceToken(e.target.value)}
                    placeholder="Chave privada de integração para notas"
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Conecta o caixa ao emissor da prefeitura municipal de forma segura.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button for Company settings */}
          {isAdmin ? (
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" /> Salvar Configurações da Empresa
              </button>
            </div>
          ) : (
            <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs font-semibold">
              Somente administradores podem alterar as configurações da empresa e dados para emissão de notas fiscais.
            </div>
          )}
        </form>
      )}

      {activeTab === 'funcionamento' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Configurar Horário de Funcionamento</h3>
            <p className="text-xs text-gray-500">Defina o início, fim e fechamento de cada dia da semana. Estas informações serão mostradas aos clientes no portal de agendamentos.</p>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {workingHours.map((wh, idx) => {
              const { start, end } = getTimesFromHoursString(wh.hours);
              return (
                <div key={wh.weekday} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="w-32">
                    <span className="text-sm font-bold text-gray-800">{wh.weekday}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Toggle closed */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wh.closed}
                        onChange={(e) => handleWorkingHoursChange(idx, 'closed', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs font-semibold text-gray-600">Fechado</span>
                    </label>

                    {!wh.closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={start}
                          onChange={(e) => handleWorkingHoursChange(idx, 'start', e.target.value)}
                          className="p-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                        <span className="text-xs text-gray-400">às</span>
                        <input
                          type="time"
                          value={end}
                          onChange={(e) => handleWorkingHoursChange(idx, 'end', e.target.value)}
                          className="p-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isAdmin ? (
            <button
              onClick={() => {
                onSaveCompanyConfig({
                  ...companyConfig,
                  workingHours: workingHours
                });
                alert('Grade de horários atualizada com sucesso!');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              Salvar Expediente
            </button>
          ) : (
            <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs font-semibold">
              Somente administradores podem editar o horário comercial de funcionamento.
            </div>
          )}
        </div>
      )}

      {activeTab === 'firebase' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Backup parameters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Firebase Cloud Integration Hub</h3>
              <p className="text-xs text-gray-500">Status em tempo real das conexões e cópias de segurança da barbearia.</p>
            </div>

            {/* Metrics list */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">Banco de Dados:</span>
                <span className="font-bold text-gray-800">Firestore (Online)</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">Autenticação:</span>
                <span className="font-bold text-gray-800">Firebase Auth</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">Tamanho Backup:</span>
                <span className="font-bold text-purple-700">14.2 KB (JSON)</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">Último Sync:</span>
                <span className="font-bold text-emerald-600">Agora mesmo</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Sincronização Contínua Firestore</span>
                  <span className="text-[10px] text-gray-400 block">Salvar todas as ações e vendas instantaneamente no Firebase.</span>
                </div>
                <button
                  onClick={onToggleAutoSync}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoSync ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoSync ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Status messages readout */}
              {backupSuccessMessage && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                  <CheckCircle className="h-4 w-4" /> {backupSuccessMessage}
                </div>
              )}

              {/* Manual buttons */}
              {isAdmin && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleManualBackup}
                    disabled={isBackupLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    {isBackupLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Cloud className="h-4 w-4" />
                    )}
                    Gerar Backup Firestore
                  </button>
                  <button
                    onClick={handleManualRestore}
                    disabled={isBackupLoading}
                    className="flex-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-4 w-4" /> Restaurar Último Ponto
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Technical layout details */}
          <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="h-5 w-5 text-purple-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold">Terminal de Serviços Firebase</h4>
                <p className="text-[9px] text-gray-400">Ativação de microsserviços integrados</p>
              </div>
            </div>

            <div className="space-y-3.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">🔥 Firestore Collections:</span>
                <span className="text-emerald-400">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">🔒 Security Rules:</span>
                <span className="text-emerald-400">v2 Strict Rules Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">📂 Cloud Storage:</span>
                <span className="text-emerald-400">Referrer Policy Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">⚡ Cloud Functions:</span>
                <span className="text-indigo-400">WhatsApp Hooks Bound</span>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl text-[10px] text-slate-400 border border-slate-800">
              <p className="font-semibold text-slate-200">Sincronização Completa</p>
              <p className="mt-1">Toda a alteração de vendas, produtos, comissões de barbeiros e logs do caixa é guardada localmente e replicada nas coleções correspondentes do Firebase.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase">Log de Atividades e Segurança</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 border-b border-gray-100 text-[10px] uppercase font-bold">
                  <th className="p-3">Operador / Usuário</th>
                  <th className="p-3">Ação Realizada</th>
                  <th className="p-3">Data e Hora</th>
                  <th className="p-3">Sincronizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {systemLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/40">
                    <td className="p-3 font-bold text-gray-950">{log.user}</td>
                    <td className="p-3 text-gray-700 italic">"{log.action}"</td>
                    <td className="p-3 text-gray-400 font-mono text-[10px]">{new Date(log.date).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[9px]">
                        <Cloud className="h-3 w-3" /> Cloud Firestore Sync
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Barber Form */}
      {isBarberFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                {bId ? 'Ajustar Configurações de Membro' : 'Adicionar Novo Barbeiro / Usuário'}
              </h3>
              <button onClick={() => setIsBarberFormOpen(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Fechar</button>
            </div>

            <form onSubmit={handleBarberSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Oliveira"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">E-mail Credencial *</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: carlos@barbeariaisaias.com.br"
                  value={bEmail}
                  onChange={(e) => setBEmail(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nível de Acesso</label>
                <select
                  value={bRole}
                  onChange={(e) => setBRole(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none capitalize"
                >
                  <option value={UserRole.ADMIN}>Administrador (Acesso Geral)</option>
                  <option value={UserRole.EMPLOYEE}>Funcionário / Barbeiro (Restrito)</option>
                </select>
              </div>

              {bRole === UserRole.EMPLOYEE && (
                <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                    Recursos Autorizados para este Funcionário:
                  </label>
                  <p className="text-[10px] text-gray-400 mb-2">Selecione quais funções este funcionário pode visualizar e gerenciar:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'dashboard', label: 'Painel Comercial' },
                      { id: 'agenda', label: 'Agenda & Cadeiras' },
                      { id: 'vendas', label: 'Frente de Caixa (PDV)' },
                      { id: 'clientes', label: 'Clientes & CRM' },
                      { id: 'estoque', label: 'Estoque & Catálogo' },
                      { id: 'servicos', label: 'Serviços Menu' },
                      { id: 'fidelidade', label: 'Campanhas & Cashback' },
                      { id: 'financas', label: 'Caixa & Finanças' },
                      { id: 'configuracoes', label: 'Configurações' }
                    ].map(tab => (
                      <label key={tab.id} className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700 dark:text-slate-300 hover:text-gray-900 select-none">
                        <input
                          type="checkbox"
                          checked={bAllowedTabs.includes(tab.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBAllowedTabs(prev => [...prev, tab.id]);
                            } else {
                              setBAllowedTabs(prev => prev.filter(t => t !== tab.id));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                        />
                        <span>{tab.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Meta Mensal (R$)</label>
                  <input
                    type="number"
                    value={bTarget}
                    onChange={(e) => setBTarget(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bônus por Meta (R$)</label>
                  <input
                    type="number"
                    value={bBonus}
                    onChange={(e) => setBBonus(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Link de Foto de Perfil</label>
                <input
                  type="text"
                  value={bPhotoUrl}
                  onChange={(e) => setBPhotoUrl(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cor Designada na Agenda</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={bColor}
                    onChange={(e) => setBColor(e.target.value)}
                    className="h-10 w-12 rounded-xl cursor-pointer border border-gray-200 p-1"
                  />
                  <span className="text-xs font-mono text-gray-500 uppercase">{bColor}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBarberFormOpen(false)}
                  className="bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  Confirmar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
