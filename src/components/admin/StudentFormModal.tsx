import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, AlertCircle, Loader2, Edit } from 'lucide-react';
import {
  Student,
  Person,
  GuardianRelationship,
  BeltRank,
  MartialArt,
} from '../../types';
import { calculateAge } from '../../utils/formatters';
import { CreateStudentPayload, UpdateStudentPayload } from '../../services/studentService';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  branchId: string;
  belts: BeltRank[];
  martialArts: MartialArt[];
  studentToEdit?: Student | null;
  personToEdit?: Person | null;
  guardianRelToEdit?: GuardianRelationship | null;
  guardianPersonToEdit?: Person | null;
  onSave: (
    newStudent: Student,
    newPerson: Person,
    guardianPerson?: Person,
    relationship?: GuardianRelationship,
    payloadDetails?: CreateStudentPayload
  ) => Promise<void> | void;
  onUpdate?: (
    updatedStudent: Student,
    updatedPerson: Person,
    guardianPerson?: Person,
    relationship?: GuardianRelationship,
    payloadDetails?: UpdateStudentPayload
  ) => Promise<void> | void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  branchId,
  belts,
  martialArts,
  studentToEdit,
  personToEdit,
  guardianRelToEdit,
  guardianPersonToEdit,
  onSave,
  onUpdate,
}) => {
  const isEditing = Boolean(studentToEdit && personToEdit);

  // Student Personal Data
  const [fullName, setFullName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('2014-05-10');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [monthlyFee, setMonthlyFee] = useState('220');
  const [studentStatus, setStudentStatus] = useState<'active' | 'inactive' | 'suspended' | 'dropped'>('active');

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar dados ao abrir para criar ou editar
  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setIsSubmitting(false);

    if (studentToEdit && personToEdit) {
      setFullName(personToEdit.fullName || '');
      setSocialName(personToEdit.socialName || '');
      setCpf(personToEdit.cpf || '');
      setBirthDate(personToEdit.birthDate || '2014-05-10');
      setGender(personToEdit.gender || 'male');
      setPhone(personToEdit.phone || '');
      setEmail(personToEdit.email || '');
      setCity(personToEdit.address?.city || 'São Paulo');
      setMonthlyFee(String(studentToEdit.monthlyFee ?? 220));
      setStudentStatus(studentToEdit.status || 'active');

      const initialArtId = studentToEdit.currentGraduations?.[0]?.martialArtId || martialArts[0]?.id || 'art-judo';
      setSelectedArtId(initialArtId);
      const initialBeltId = studentToEdit.currentGraduations?.[0]?.beltId || belts[0]?.id || 'rank-judo-branca';
      setSelectedBeltId(initialBeltId);

      if (guardianPersonToEdit) {
        setHasGuardian(true);
        setGuardianName(guardianPersonToEdit.fullName || '');
        setGuardianCpf(guardianPersonToEdit.cpf || '');
        setGuardianPhone(guardianPersonToEdit.phone || '');
        setGuardianEmail(guardianPersonToEdit.email || '');
        setRelationshipType(guardianRelToEdit?.relationshipLabel || 'Pai');
      } else {
        const isMinor = calculateAge(personToEdit.birthDate) < 18;
        setHasGuardian(isMinor);
        setGuardianName('');
        setGuardianCpf('');
        setGuardianPhone('');
        setGuardianEmail('');
        setRelationshipType('Pai');
      }
    } else {
      // Modo Criação
      setFullName('');
      setSocialName('');
      setCpf('');
      setBirthDate('2014-05-10');
      setGender('male');
      setPhone('');
      setEmail('');
      setCity('São Paulo');
      setMonthlyFee('220');
      setStudentStatus('active');
      setSelectedArtId(martialArts[0]?.id || 'art-judo');
      setSelectedBeltId(belts[0]?.id || 'rank-judo-branca');
      setHasGuardian(true);
      setGuardianName('');
      setGuardianCpf('');
      setGuardianPhone('');
      setGuardianEmail('');
      setRelationshipType('Pai');
    }
  }, [isOpen, studentToEdit, personToEdit, guardianRelToEdit, guardianPersonToEdit, martialArts, belts]);

  if (!isOpen) return null;

  const currentAge = calculateAge(birthDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !birthDate) {
      setError('Por favor, informe ao menos o nome completo e data de nascimento do aluno.');
      return;
    }

    if (hasGuardian && !guardianName.trim()) {
      setError('Por favor, informe o nome do responsável ou desmarque a opção de vincular responsável.');
      return;
    }

    setIsSubmitting(true);

    const chosenBelt = belts.find(b => b.id === selectedBeltId) || belts[0];
    const chosenArt = martialArts.find(m => m.id === selectedArtId) || martialArts[0];

    // ==========================================
    // FLUXO DE EDIÇÃO DE ALUNO EXISTENTE
    // ==========================================
    if (isEditing && studentToEdit && personToEdit) {
      const updatedPerson: Person = {
        ...personToEdit,
        fullName: fullName.trim(),
        socialName: socialName.trim() || undefined,
        cpf: cpf || personToEdit.cpf,
        birthDate,
        gender,
        phone: phone || personToEdit.phone,
        email: email || personToEdit.email,
        address: {
          ...personToEdit.address,
          city,
        },
      };

      const updatedStudent: Student = {
        ...studentToEdit,
        monthlyFee: Number(monthlyFee) || studentToEdit.monthlyFee,
        status: studentStatus,
        currentGraduations: [
          {
            martialArtId: chosenArt?.id || studentToEdit.currentGraduations?.[0]?.martialArtId || 'art-judo',
            martialArtName: chosenArt?.name || studentToEdit.currentGraduations?.[0]?.martialArtName || 'Judô',
            beltId: chosenBelt?.id || studentToEdit.currentGraduations?.[0]?.beltId || 'rank-judo-branca',
            beltName: chosenBelt?.name || studentToEdit.currentGraduations?.[0]?.beltName || 'Faixa Branca',
            beltColorHex: chosenBelt?.colorHex || studentToEdit.currentGraduations?.[0]?.beltColorHex || '#ffffff',
            graduatedAt: studentToEdit.currentGraduations?.[0]?.graduatedAt || new Date().toISOString().split('T')[0],
          },
        ],
      };

      let updatedGuardianPerson: Person | undefined = undefined;
      let updatedRelationship: GuardianRelationship | undefined = undefined;

      if (hasGuardian && guardianName.trim()) {
        const gId = guardianPersonToEdit?.id || `person-g-${Date.now()}`;
        updatedGuardianPerson = {
          id: gId,
          tenantId,
          fullName: guardianName.trim(),
          cpf: guardianCpf || guardianPersonToEdit?.cpf || '111.222.333-44',
          birthDate: guardianPersonToEdit?.birthDate || '1985-01-01',
          gender: guardianPersonToEdit?.gender || 'other',
          phone: guardianPhone || guardianPersonToEdit?.phone || phone || '(11) 98888-7777',
          email: guardianEmail || guardianPersonToEdit?.email || 'responsavel@tatamehub.com.br',
          address: updatedPerson.address,
          createdAt: guardianPersonToEdit?.createdAt || new Date().toISOString(),
        };

        updatedRelationship = {
          id: guardianRelToEdit?.id || `rel-${Date.now()}`,
          tenantId,
          studentId: studentToEdit.id,
          guardianPersonId: gId,
          relationshipLabel: relationshipType,
          isLegalGuardian: true,
          isFinancialGuardian: true,
          isEmergencyContact: true,
          isPickupAuthorized: true,
        };
      }

      const updatePayload: UpdateStudentPayload = {
        studentId: studentToEdit.id,
        personId: personToEdit.id,
        tenantId,
        branchId,
        fullName: fullName.trim(),
        socialName: socialName.trim() || undefined,
        birthDate,
        cpf,
        gender,
        phone,
        email,
        city,
        monthlyFee: Number(monthlyFee) || studentToEdit.monthlyFee,
        status: studentStatus,
        martialArtId: selectedArtId,
        beltRankId: selectedBeltId,
        selectedArt: chosenArt,
        selectedBelt: chosenBelt,
        hasGuardian,
        guardianPersonId: guardianPersonToEdit?.id,
        guardianRelId: guardianRelToEdit?.id,
        guardianName: guardianName.trim(),
        guardianCpf,
        guardianPhone,
        guardianEmail,
        relationshipType,
      };

      try {
        if (onUpdate) {
          await onUpdate(updatedStudent, updatedPerson, updatedGuardianPerson, updatedRelationship, updatePayload);
        } else {
          await onSave(updatedStudent, updatedPerson, updatedGuardianPerson, updatedRelationship);
        }
      } catch (err: any) {
        setError(err?.message || 'Erro ao atualizar dados do aluno.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ==========================================
    // FLUXO DE CRIAÇÃO DE NOVO ALUNO
    // ==========================================
    const studentPersonId = `person-${Date.now()}`;
    const studentId = `student-${Date.now()}`;
    const now = new Date().toISOString();

    const newPerson: Person = {
      id: studentPersonId,
      tenantId,
      fullName: fullName.trim(),
      socialName: socialName.trim() || undefined,
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

    const newStudent: Student = {
      id: studentId,
      tenantId,
      branchId,
      personId: studentPersonId,
      registrationNumber: `KOD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: studentStatus,
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
        fullName: guardianName.trim(),
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

    const payloadDetails: CreateStudentPayload = {
      tenantId,
      branchId,
      fullName: fullName.trim(),
      socialName: socialName.trim() || undefined,
      cpf,
      birthDate,
      gender,
      phone,
      email,
      city,
      monthlyFee: Number(monthlyFee) || 220,
      martialArtId: selectedArtId,
      beltRankId: selectedBeltId,
      selectedArt: chosenArt,
      selectedBelt: chosenBelt,
      hasGuardian,
      guardianName: guardianName.trim(),
      guardianCpf,
      guardianPhone,
      guardianEmail,
      relationshipType,
    };

    try {
      await onSave(newStudent, newPerson, guardianPerson, relationship, payloadDetails);
    } catch (err: any) {
      setError(err?.message || 'Erro ao persistir aluno.');
    } finally {
      setIsSubmitting(false);
    }
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
            {isEditing ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isEditing ? `Editar Aluno: ${personToEdit?.fullName || fullName}` : 'Cadastrar Novo Aluno'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEditing
                ? `Matrícula: ${studentToEdit?.registrationNumber} · Atualize os dados cadastrais e responsáveis.`
                : 'Preencha os dados de identificação, graduação inicial e responsáveis.'}
            </p>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <label className="block text-slate-300 font-medium mb-1">Nome Social (Opcional)</label>
                <input
                  type="text"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  placeholder="Como prefere ser chamado"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 font-medium mb-1">E-mail do Aluno</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aluno@email.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Cidade / Estado</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Modalidade, Graduação e Mensalidade */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              2. Modalidade, Graduação & Situação
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                <label className="block text-slate-300 font-medium mb-1">Mensalidade (R$)</label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Situação / Status</label>
                <select
                  value={studentStatus}
                  onChange={(e) => setStudentStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Trancado / Suspenso</option>
                  <option value="dropped">Cancelado</option>
                </select>
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
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isEditing ? 'Atualizando no Banco...' : 'Gravando no Banco...'}</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{isEditing ? 'Salvar Alterações' : 'Salvar Aluno'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
