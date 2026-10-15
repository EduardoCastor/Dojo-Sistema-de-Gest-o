import React, { useState } from 'react';
import { X, ShieldAlert, Award, User, Users, Wallet, Building2 } from 'lucide-react';
import { User as UserType } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  onSelectUser: (user: UserType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'personas' | 'custom'>('personas');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.email.toLowerCase() === customEmail.toLowerCase());
    if (found) {
      onSelectUser(found);
    } else {
      setError('Usuário não localizado com este e-mail nos dados de demonstração.');
    }
  };

  const getRoleBadge = (role: UserType['role']) => {
    const map: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      superadmin: { label: 'Admin SaaS', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30', icon: ShieldAlert },
      owner: { label: 'Proprietário Sensei', color: 'text-red-400 bg-red-950/60 border-red-500/30', icon: Award },
      branch_manager: { label: 'Gestor de Filial', color: 'text-blue-400 bg-blue-950/60 border-blue-500/30', icon: Building2 },
      secretary: { label: 'Secretaria', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30', icon: User },
      financial: { label: 'Financeiro', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30', icon: Wallet },
      instructor: { label: 'Professor / Sensei', color: 'text-purple-400 bg-purple-950/60 border-purple-500/30', icon: Award },
      student: { label: 'Aluno (Portal)', color: 'text-orange-400 bg-orange-950/60 border-orange-500/30', icon: User },
      guardian: { label: 'Responsável (Portal)', color: 'text-pink-400 bg-pink-950/60 border-pink-500/30', icon: Users },
    };
    return map[role] || { label: role, color: 'text-slate-400 bg-slate-800', icon: User };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">Acessar a Plataforma TatameHub</h3>
          <p className="text-xs text-slate-400">
            Selecione uma das personas para avaliar a experiência específica de cada papel ou entre com credenciais.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('personas')}
            className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'personas'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Personas de Demonstração (1 Clique)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar com E-mail & Senha
          </button>
        </div>

        {activeTab === 'personas' ? (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {users.map((u) => {
              const badge = getRoleBadge(u.role);
              const Icon = badge.icon;
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white font-bold group-hover:bg-red-600/20 group-hover:text-red-400 transition-colors">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                        {u.name}
                      </div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium ${badge.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{badge.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">E-mail Cadastrado</label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yamamoto@kodokanbrasil.com.br"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Senha de Acesso</label>
              <input
                type="password"
                required
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors cursor-pointer"
            >
              Entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
