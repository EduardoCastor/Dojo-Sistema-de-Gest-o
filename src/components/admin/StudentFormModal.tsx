import React, { useState } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import {
  Student,
  Person,
  GuardianRelationship,
  BeltRank,
  MartialArt,
} from '../../types';
import { calculateAge } from '../../utils/formatters';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  branchId: string;
  belts: BeltRank[];
  martialArts: MartialArt[];
  onSave: (
    newStudent: Student,
    newPerson: Person,
    guardianPerson?: Person,
    relationship?: GuardianRelationship
  ) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  branchId,
  belts,
  martialArts,
  onSave,
}) => {
  // Student Personal Data
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('2014-05-10');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [monthlyFee, setMonthlyFee] = useState('220');

  // Belt & Martial Art
  const [selectedArtId, setSelectedArtId] = useState(martialArts[0]?.id || 'art-judo');
  const [selectedBeltId, setSelectedBeltId] = useState(belts[0]?.id || 'rank-judo-branca');

  // Guardian Data (if minor)
  const [hasGuardian, setHasGuardian] = useState(true);
  const [guardianName, setGuardianName] = useState('');
  const [guardianCpf, setGuardianCpf] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [relationshipType, setRelationshipType] = useState('Pai');

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentAge = calculateAge(birthDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !birthDate) {
      setError('Por favor, informe ao menos o nome completo e data de nascimento do aluno.');
      return;
    }

    const studentPersonId = `person-${Date.now()}`;
    const studentId = `student-${Date.now()}`;
    const now = new Date().toISOString();

    const newPerson: Person = {
      id: studentPersonId,
      tenantId,
      fullName,
      cpf: cpf || '000.000.000-00',
      birthDate,
      gender,
      phone: phone || '(11) 90000-0000',
      email: email || 'aluno@tatamehub.com.br',
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city,
        state: 'SP',
        zipCode: '01000-000',
      },
      createdAt: now,
    };

    const chosenBelt = belts.find(b => b.id === selectedBeltId) || belts[0];
    const chosenArt = martialArts.find(m => m.id === selectedArtId) || martialArts[0];

    const newStudent: Student = {
      id: studentId,
      tenantId,
      branchId,
      personId: studentPersonId,
      registrationNumber: `KOD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      currentGraduations: [
        {
          martialArtId: chosenArt?.id || 'art-judo',
          martialArtName: chosenArt?.name || 'Judô',
          beltId: chosenBelt?.id || 'rank-judo-branca',
          beltName: chosenBelt?.name || 'Faixa Branca',
          beltColorHex: chosenBelt?.colorHex || '#ffffff',
          graduatedAt: new Date().toISOString().split('T')[0],
        },
      ],
      monthlyFee: Number(monthlyFee) || 220,
    };

    let guardianPerson: Person | undefined = undefined;
    let relationship: GuardianRelationship | undefined = undefined;

    if (hasGuardian && guardianName.trim()) {
      const guardianId = `person-g-${Date.now()}`;
      guardianPerson = {
        id: guardianId,
        tenantId,
        fullName: guardianName,
        cpf: guardianCpf || '111.222.333-44',
        birthDate: '1985-01-01',
        gender: 'male',
        phone: guardianPhone || phone || '(11) 98888-7777',
        email: guardianEmail || 'responsavel@tatamehub.com.br',
        address: newPerson.address,
        createdAt: now,
      };

      relationship = {
        id: `rel-${Date.now()}`,
        tenantId,
        studentId,
        guardianPersonId: guardianId,
        relationshipLabel: relationshipType,
        isLegalGuardian: true,
        isFinancialGuardian: true,
        isEmergencyContact: true,
        isPickupAuthorized: true,
      };
    }

    onSave(newStudent, newPerson, guardianPerson, relationship);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/20 text-red-500">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cadastrar Novo Aluno</h3>
            <p className="text-xs text-slate-400">Preencha os dados de identificação, graduação inicial e responsáveis.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Seção 1: Dados Pessoais do Aluno */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              1. Identificação do Aluno
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome do atleta"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">CPF do Aluno</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Data de Nascimento *</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Idade calculada: <strong>{currentAge} anos</strong></span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Gênero</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Graduação Inicial e Mensalidade */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              2. Modalidade & Mensalidade
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Arte Marcial</label>
                <select
                  value={selectedArtId}
                  onChange={(e) => setSelectedArtId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  {martialArts.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Faixa / Graduação</label>
                <select
                  value={selectedBeltId}
                  onChange={(e) => setSelectedBeltId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  {belts.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mensalidade Padrão (R$)</label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Responsável Legal & Financeiro (Obrigatório se menor) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                3. Responsável Legal & Financeiro {currentAge < 18 ? '(Obrigatório para Menores)' : '(Opcional)'}
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={hasGuardian}
                  onChange={(e) => setHasGuardian(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-0"
                />
                <span>Vincular Responsável</span>
              </label>
            </div>

            {hasGuardian && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Nome do Responsável *</label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Nome do Pai, Mãe ou Tutor legal"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Parentesco / Vínculo</label>
                    <select
                      value={relationshipType}
                      onChange={(e) => setRelationshipType(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                    >
                      <option value="Pai">Pai</option>
                      <option value="Mãe">Mãe</option>
                      <option value="Tutor Legal">Tutor Legal (Documentado)</option>
                      <option value="Tio(a)">Tio(a)</option>
                      <option value="Avô(ó)">Avô(ó)</option>
                      <option value="Outro">Outro Representante</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">CPF do Responsável</label>
                    <input
                      type="text"
                      value={guardianCpf}
                      onChange={(e) => setGuardianCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">WhatsApp do Responsável</label>
                    <input
                      type="text"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">E-mail do Responsável</label>
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="responsavel@email.com"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors shadow cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Salvar Aluno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
