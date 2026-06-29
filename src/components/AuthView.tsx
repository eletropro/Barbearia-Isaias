/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Scissors, Lock, Mail, User, Phone, ShieldCheck, KeyRound, Sparkles, HelpCircle, ArrowLeft, Sun, Moon, RefreshCw } from 'lucide-react';
import { BarberStateEngine } from '../barberState';
import { UserRole } from '../types';

interface AuthViewProps {
  onLoginSuccess: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function AuthView({
  onLoginSuccess,
  darkMode,
  setDarkMode
}: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  
  // Recovery process states
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');

  // General error/success alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = BarberStateEngine.login(email, password, true);
      setLoading(false);
      if (user) {
        setSuccess('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setError('E-mail ou senha inválidos. Tente novamente.');
      }
    }, 800);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!name || !email || !password) {
      setError('Por favor, preencha nome, e-mail e senha.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        BarberStateEngine.signUp(name, email, password, role, phone);
        setLoading(false);
        setSuccess('Conta criada com sucesso! Faça login para acessar.');
        // Switch back to login with newly registered email
        setTimeout(() => {
          setMode('login');
          setPassword('');
          clearAlerts();
        }, 2000);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Erro ao realizar cadastro.');
      }
    }, 1000);
  };

  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!email) {
      setError('Por favor, preencha o e-mail cadastrado.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = BarberStateEngine.getUsers();
      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      setLoading(false);
      if (!userExists) {
        setError('Nenhum usuário cadastrado com este e-mail.');
        return;
      }

      // Generate a simple 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedCode(code);
      setRecoveryStep(2);
      setSuccess(`Código de segurança enviado! Simulação do SMS/E-mail: o código é [ ${code} ]`);
    }, 1000);
  };

  const handleConfirmRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!recoveryCode || !newPassword) {
      setError('Preencha o código de segurança e a nova senha.');
      return;
    }

    if (recoveryCode !== simulatedCode) {
      setError('Código de segurança incorreto. Verifique a mensagem de simulação.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const successReset = BarberStateEngine.recoverPassword(email, newPassword);
      setLoading(false);
      if (successReset) {
        setSuccess('Senha redefinida com sucesso! Faça login com a nova senha.');
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setRecoveryStep(1);
          setRecoveryCode('');
          setNewPassword('');
          clearAlerts();
        }, 2000);
      } else {
        setError('Erro ao redefinir a senha.');
      }
    }, 1000);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`} id="auth_view_root">
      
      {/* Absolute top right dark mode toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-md hover:scale-105 transition-all text-gray-500 dark:text-gray-400"
        >
          {darkMode ? <Sun className="h-4 w-4 text-purple-400" /> : <Moon className="h-4 w-4 text-purple-600" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Upper Branding Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
            <Scissors className="h-7 w-7 rotate-[135deg]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight font-sans text-gray-900 dark:text-white flex items-center gap-1">
            {BarberStateEngine.getCompanyConfig().name} <Sparkles className="h-4 w-4 text-purple-500 fill-purple-500" />
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Plataforma Integrada para Administradores, Funcionários e Clientes
          </p>
        </div>

        {/* Global Notifications Alert boxes */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 animate-in slide-in-from-top-1">
            <span className="font-bold shrink-0 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 h-5 w-5 rounded-full flex items-center justify-center">!</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400 animate-in slide-in-from-top-1">
            <span className="font-bold shrink-0 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 h-5 w-5 rounded-full flex items-center justify-center">✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* MODE: LOGIN SCREEN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@barbearia.com.br"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400">Dica: Administrador de demonstração é <span className="font-bold">admin@barbearia.com.br</span></p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Senha</label>
                <button
                  type="button"
                  onClick={() => { setMode('recover'); clearAlerts(); }}
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400">Dica: Senha do administrador de demonstração é <span className="font-bold">admin</span></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Entrar na Conta'
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-400">Não tem uma conta profissional ou de cliente? </span>
              <button
                type="button"
                onClick={() => { setMode('register'); clearAlerts(); }}
                className="text-xs font-extrabold text-purple-600 hover:underline"
              >
                Criar Conta
              </button>
            </div>
          </form>
        )}

        {/* MODE: REGISTER / SIGN UP SCREEN */}
        {mode === 'register' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@provedor.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (11) 99999-8888"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha segura"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Role Selection Blocks */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Selecione seu Tipo de Conta</label>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CUSTOMER)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    role === UserRole.CUSTOMER
                      ? 'border-purple-600 bg-purple-50/20 text-purple-900 dark:text-purple-300 ring-1 ring-purple-600'
                      : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <User className="h-5 w-5 mt-0.5 text-purple-600" />
                  <div>
                    <span className="font-extrabold text-xs block">Cliente Barbearia 📱</span>
                    <span className="text-[10px] text-gray-400">Portal de autoatendimento para marcar cortes, checar pontos e cashback.</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole(UserRole.EMPLOYEE)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    role === UserRole.EMPLOYEE
                      ? 'border-cyan-600 bg-cyan-50/20 text-cyan-950 dark:text-cyan-300 ring-1 ring-cyan-600'
                      : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 mt-0.5 text-cyan-600" />
                  <div>
                    <span className="font-extrabold text-xs block">Funcionário / Barbeiro 💈</span>
                    <span className="text-[10px] text-gray-400">Acesso às cadeiras agendadas, painel de comissão e frente de caixa.</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole(UserRole.ADMIN)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    role === UserRole.ADMIN
                      ? 'border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-600'
                      : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <KeyRound className="h-5 w-5 mt-0.5 text-emerald-600" />
                  <div>
                    <span className="font-extrabold text-xs block">Administrador Geral 🔑</span>
                    <span className="text-[10px] text-gray-400">Gestor completo da loja, faturamento, caixa, estoque e relatórios.</span>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Finalizar Cadastro'
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); clearAlerts(); }}
              className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o Login
            </button>
          </form>
        )}

        {/* MODE: PASSWORD RECOVERY */}
        {mode === 'recover' && (
          <div className="space-y-4">
            {recoveryStep === 1 ? (
              <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 p-4 rounded-2xl space-y-1">
                  <span className="font-bold text-xs text-purple-900 dark:text-purple-300 block flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" /> Como funciona?
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Insira seu e-mail cadastrado. O sistema gerará um código de segurança de 6 dígitos simulado para que você possa redefinir sua senha imediatamente.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@provedor.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Solicitar Código'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmRecovery} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono">Código de Segurança</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="Insira os 6 dígitos recebidos"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Escolha uma senha forte"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Alterando Senha...
                    </>
                  ) : (
                    'Redefinir e Entrar'
                  )}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => { setMode('login'); setRecoveryStep(1); clearAlerts(); }}
              className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Login
            </button>
          </div>
        )}

      </div>
      
      {/* Outer subtle decorative footer */}
      <div className="text-[10px] text-gray-400 mt-6 font-mono font-bold tracking-wider uppercase opacity-50 select-none">
        Conexão Criptografada SSL
      </div>
    </div>
  );
}
