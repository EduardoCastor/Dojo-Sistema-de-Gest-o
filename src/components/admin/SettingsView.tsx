import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Sparkles, Check, Clock } from 'lucide-react';
import { Tenant, SaaSPlan } from '../../types';

interface SettingsViewProps {
  tenant: Tenant;
  plans: SaaSPlan[];
  onSaveTenant: (updatedTenant: Tenant) => void;
  onUpgradePlan: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  tenant,
  plans,
  onSaveTenant,
  onUpgradePlan,
}) => {
  const [tradeName, setTradeName] = useState(tenant.tradeName);
  const [legalName, setLegalName] = useState(tenant.legalName);
  const [cnpj, setCnpj] = useState(tenant.cnpjOrCpf);
  const [email, setEmail] = useState(tenant.email);
  const [phone, setPhone] = useState(tenant.phone);
  const [dueDay, setDueDay] = useState(tenant.settings.defaultDueDay);
  const [familyDiscount, setFamilyDiscount] = useState(tenant.settings.familyDiscount2ndMember);
  const [multiArtDiscount, setMultiArtDiscount] = useState(tenant.settings.multiArtDiscount);
  const [penaltyRate, setPenaltyRate] = useState(tenant.settings.penaltyRate);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentPlan = plans.find(p => p.id === tenant.planId) || plans[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Tenant = {
      ...tenant,
      tradeName,
      legalName,
      cnpjOrCpf: cnpj,
      email,
      phone,
      settings: {
        ...tenant.settings,
        defaultDueDay: Number(dueDay),
        familyDiscount2ndMember: Number(familyDiscount),
        multiArtDiscount: Number(multiArtDiscount),
        penaltyRate: Number(penaltyRate),
      },
    };
    onSaveTenant(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Configurações & Parâmetros do Dojo</h2>
        <p className="text-xs text-slate-400">
          Personalize as regras comerciais de desconto, dia padrão de vencimento e dados institucionais.
        </p>
      </div>

      {/* Plan Status Banner */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white">Plano Contratado: {currentPlan.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              {tenant.status === 'trial' ? 'Em Período de Teste' : 'Assinatura Ativa'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Limite: até {currentPlan.maxStudents} alunos e {currentPlan.maxBranches} filiais.
          </p>
        </div>

        <button
          onClick={onUpgradePlan}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow transition-colors cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Trocar ou Contratar Plano</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Configurações atualizadas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Dados Institucionais */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            1. Dados Cadastrais & Impressão de Recibos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nome Fantasia *</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Razão Social</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">CNPJ ou CPF</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">E-mail de Contato</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Telefone Principal</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Políticas de Mensalidades & Descontos */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            2. Regras Comerciais & Descontos Familiares
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Dia Padrão de Vencimento</label>
              <input
                type="number"
                min="1"
                max="28"
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Todo dia {dueDay} do mês</span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Desconto Familiar (2º Membro)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={familyDiscount}
                  onChange={(e) => setFamilyDiscount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Para irmãos matriculados</span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Desconto 2ª Modalidade</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={multiArtDiscount}
                  onChange={(e) => setMultiArtDiscount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Ex: Judô + Jiu-Jitsu</span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Multa por Atraso</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={penaltyRate}
                  onChange={(e) => setPenaltyRate(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Conforme limites legais CDC</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
