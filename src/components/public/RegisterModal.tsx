import React, { useState } from 'react';
import { X, Building2, User, Mail, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Tenant, Branch, User as UserType } from '../../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTenant: Tenant, newBranch: Branch, newUser: UserType) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [cnpjOrCpf, setCnpjOrCpf] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim() || !adminName.trim() || !email.trim()) {
      setError('Por favor, preencha o nome da academia, responsável e e-mail.');
      return;
    }

    const tenantId = `tenant-${Date.now()}`;
    const branchId = `branch-matriz-${Date.now()}`;
    const userId = `user-owner-${Date.now()}`;

    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days

    const newTenant: Tenant = {
      id: tenantId,
      tradeName,
      legalName: legalName || tradeName,
      cnpjOrCpf: cnpjOrCpf || '00.000.000/0001-00',
      adminName,
      email,
      phone: phone || '(11) 98888-0000',
      whatsapp: phone || '(11) 98888-0000',
      address: {
        street: 'Rua Principal',
        number: '100',
        neighborhood: 'Centro',
        city: city || 'São Paulo',
        state: state || 'SP',
        zipCode: '01000-000',
      },
      planId: 'trial',
      status: 'trial',
      trialStartedAt: now.toISOString(),
      trialExpiresAt: trialExpiry.toISOString(),
      createdAt: now.toISOString(),
      retentionDays: 60,
      settings: {
        defaultDueDay: 10,
        penaltyRate: 2.0,
        dailyInterestRate: 0.033,
        familyDiscount2ndMember: 15,
        multiArtDiscount: 20,
        customBrandColor: '#dc2626',
      },
    };

    const newBranch: Branch = {
      id: branchId,
      tenantId,
      name: 'Unidade Matriz',
      isHeadquarter: true,
      phone: phone || '(11) 98888-0000',
      email,
      address: `Rua Principal, 100 - Centro, ${city}/${state}`,
      managerName: adminName,
      active: true,
    };

    const newUser: UserType = {
      id: userId,
      tenantId,
      branchId,
      name: adminName,
      email,
      role: 'owner',
      phone,
      active: true,
    };

    onSuccess(newTenant, newBranch, newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/20 text-red-500">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cadastre sua Academia</h3>
            <p className="text-xs text-slate-400">Ativação imediata do Plano Teste Gratuito de 10 dias.</p>
          </div>
        </div>

        <div className="my-4 p-3 rounded-lg bg-amber-950/40 border border-amber-600/30 flex items-center gap-2 text-xs text-amber-300">
          <Clock className="h-4 w-4 shrink-0 text-amber-400" />
          <span>Acesso completo ao plano Avançado por 10 dias corridos sem cobrança.</span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nome Fantasia da Academia *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="Ex: Associação de Judô Bushido"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Razão Social (Opcional)</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Bushido Artes Marciais Ltda"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">CNPJ ou CPF</label>
              <input
                type="text"
                value={cnpjOrCpf}
                onChange={(e) => setCnpjOrCpf(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nome do Responsável / Sensei *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Sensei Carlos Eduardo"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">E-mail Administrativo *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@bushidojudo.com.br"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cidade</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">UF</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              >
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                <option value="PR">PR</option>
                <option value="RS">RS</option>
                <option value="BA">BA</option>
                <option value="DF">DF</option>
                <option value="SC">SC</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-500 active:bg-red-700 transition-colors shadow-lg shadow-red-900/30 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Ativar Avaliação de 10 Dias</span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Ao cadastrar, você concorda com os Termos de Uso e Política de Privacidade (LGPD).
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
