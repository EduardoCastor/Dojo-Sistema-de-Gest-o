import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  ShieldCheck,
  User,
  Users,
  Award,
  Activity,
  HeartPulse,
  Calendar,
  X,
  FileText,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  Student,
  Person,
  GuardianRelationship,
  PhysicalAssessment,
  HealthRecord,
  BeltRank,
  ClassGroup,
  Enrollment,
} from '../../types';
import {
  formatDateBR,
  calculateAge,
  calculateBMI,
  formatCPF,
  formatPhoneBR,
  formatCurrencyBRL,
} from '../../utils/formatters';

interface StudentsViewProps {
  students: Student[];
  persons: Person[];
  guardians: GuardianRelationship[];
  assessments: PhysicalAssessment[];
  healthRecords: HealthRecord[];
  belts: BeltRank[];
  classes: ClassGroup[];
  enrollments: Enrollment[];
  isLoading?: boolean;
  onOpenCreateStudent: () => void;
  onEditStudent: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  persons,
  guardians,
  assessments,
  healthRecords,
  belts,
  classes,
  enrollments,
  isLoading,
  onOpenCreateStudent,
  onEditStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [profileTab, setProfileTab] = useState<'id' | 'guardians' | 'anthropometry' | 'health' | 'ranks' | 'classes'>('id');

  // Filter students
  const filteredStudents = students.filter((s) => {
    const person = persons.find(p => p.id === s.personId);
    if (!person) return false;

    const matchesSearch =
      person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.cpf.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStudentPerson = (student: Student) => {
    return persons.find(p => p.id === student.personId);
  };

  const getStudentGuardians = (studentId: string) => {
    const rels = guardians.filter(g => g.studentId === studentId);
    return rels.map(r => ({
      relationship: r,
      person: persons.find(p => p.id === r.guardianPersonId),
    }));
  };

  const getStudentAssessments = (studentId: string) => {
    return assessments.filter(a => a.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStudentHealthRecord = (studentId: string) => {
    return healthRecords.find(h => h.studentId === studentId);
  };

  const getStudentClasses = (studentId: string) => {
    const studentEnr = enrollments.filter(e => e.studentId === studentId && e.status === 'active');
    return studentEnr.map(e => classes.find(c => c.id === e.classGroupId)).filter(Boolean) as ClassGroup[];
  };

  const activePerson = selectedStudent ? getStudentPerson(selectedStudent) : null;
  const studentAge = activePerson ? calculateAge(activePerson.birthDate) : 0;
  const activeAssessments = selectedStudent ? getStudentAssessments(selectedStudent.id) : [];
  const latestAssessment = activeAssessments[0];
  const activeHealth = selectedStudent ? getStudentHealthRecord(selectedStudent.id) : null;
  const activeGuardians = selectedStudent ? getStudentGuardians(selectedStudent.id) : [];
  const activeClasses = selectedStudent ? getStudentClasses(selectedStudent.id) : [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gestão de Alunos & Prontuários</h2>
          <p className="text-xs text-slate-400">
            Ficha cadastral completa, histórico esportivo, responsáveis e prontuário de saúde protegido.
          </p>
        </div>

        <button
          onClick={onOpenCreateStudent}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 active:bg-red-700 transition-colors shadow cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Aluno</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do aluno, matrícula ou CPF..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'active' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ativos ({students.filter(s => s.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'inactive' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inativos ({students.filter(s => s.status !== 'active').length})
          </button>
        </div>
      </div>

      {/* Students Data Grid */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Aluno / Matrícula</th>
                <th className="py-3 px-4">Idade</th>
                <th className="py-3 px-4">Graduação Atual</th>
                <th className="py-3 px-4">Responsável Legal</th>
                <th className="py-3 px-4">Mensalidade</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum aluno encontrado com os filtros informados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const person = getStudentPerson(s);
                  if (!person) return null;
                  const age = calculateAge(person.birthDate);
                  const guardianRels = getStudentGuardians(s.id);
                  const legalGuardian = guardianRels.find(g => g.relationship.isLegalGuardian);
                  const currentBelt = s.currentGraduations[0];

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{person.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Matrícula: {s.registrationNumber}</div>
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                        {age} anos
                        <span className="block text-[10px] text-slate-500">{formatDateBR(person.birthDate)}</span>
                      </td>

                      <td className="py-3 px-4">
                        {currentBelt ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full border border-slate-600 shrink-0"
                              style={{ backgroundColor: currentBelt.beltColorHex }}
                            ></span>
                            <span className="font-medium text-slate-200">{currentBelt.beltName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Sem graduação</span>
                        )}
                        <span className="text-[10px] text-slate-400 block">{currentBelt?.martialArtName || 'Judô'}</span>
                      </td>

                      <td className="py-3 px-4">
                        {legalGuardian && legalGuardian.person ? (
                          <div>
                            <span className="text-slate-200">{legalGuardian.person.fullName}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {legalGuardian.relationship.relationshipLabel} · {formatPhoneBR(legalGuardian.person.phone)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Próprio Aluno (Maior de idade)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-200">
                        {formatCurrencyBRL(s.monthlyFee)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            s.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950/60 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {s.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Ver Prontuário & Ficha Completa"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onEditStudent(s)}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Editar Cadastro"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Student Profile Modal / Drawer */}
      {selectedStudent && activePerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-red-400 text-lg font-bold">
                {activePerson.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{activePerson.fullName}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    {selectedStudent.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Matrícula: <strong className="text-slate-200 font-mono">{selectedStudent.registrationNumber}</strong></span>
                  <span>·</span>
                  <span>Idade: <strong className="text-slate-200 font-mono">{studentAge} anos</strong></span>
                  <span>·</span>
                  <span>Ingresso: {formatDateBR(selectedStudent.enrollmentDate)}</span>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-slate-800 my-4 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setProfileTab('id')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  profileTab === 'id' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Identificação & Contato
              </button>
              <button
                onClick={() => setProfileTab('guardians')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  profileTab === 'guardians' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Responsáveis ({activeGuardians.length})
              </button>
              <button
                onClick={() => setProfileTab('anthropometry')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  profileTab === 'anthropometry' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Antropometria & IMC
              </button>
              <button
                onClick={() => setProfileTab('health')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  profileTab === 'health' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Saúde & Atestados (LGPD)
              </button>
              <button
                onClick={() => setProfileTab('ranks')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  profileTab === 'ranks' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Graduações & Faixas
              </button>
              <button
                onClick={() => setProfileTab('classes')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  profileTab === 'classes' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Turmas Ativas ({activeClasses.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="text-xs space-y-4">
              {/* TAB 1: IDENTIFICAÇÃO */}
              {profileTab === 'id' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
                    {activePerson.socialName && (
                      <div className="text-slate-400">Nome Social: <span className="text-red-400 font-semibold">{activePerson.socialName}</span></div>
                    )}
                    <div className="text-slate-400">CPF: <span className="text-white font-mono">{formatCPF(activePerson.cpf)}</span></div>
                    <div className="text-slate-400">Nascimento: <span className="text-white font-mono">{formatDateBR(activePerson.birthDate)}</span></div>
                    <div className="text-slate-400">Gênero: <span className="text-white capitalize">{activePerson.gender === 'male' ? 'Masculino' : 'Feminino'}</span></div>
                    <div className="text-slate-400">Telefone: <span className="text-white">{formatPhoneBR(activePerson.phone)}</span></div>
                    <div className="text-slate-400">E-mail: <span className="text-white">{activePerson.email}</span></div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
                    <div className="font-semibold text-slate-300">Endereço Residencial:</div>
                    <div className="text-slate-400">{activePerson.address.street}, {activePerson.address.number}</div>
                    <div className="text-slate-400">Bairro: {activePerson.address.neighborhood}</div>
                    <div className="text-slate-400">{activePerson.address.city} - {activePerson.address.state}</div>
                    <div className="text-slate-400 font-mono">CEP: {activePerson.address.zipCode}</div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESPONSÁVEIS */}
              {profileTab === 'guardians' && (
                <div className="space-y-3">
                  <div className="text-slate-400 text-[11px]">
                    Conforme diretrizes legais e LGPD, parentesco biológico não presume automaticamente representação financeira ou autorização de retirada.
                  </div>
                  {activeGuardians.length === 0 ? (
                    <div className="p-4 rounded-lg border border-slate-800 text-center text-slate-500">
                      Nenhum responsável legal cadastrado para este aluno.
                    </div>
                  ) : (
                    activeGuardians.map((g, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white text-sm">
                            {g.person?.fullName || 'Responsável'} ({g.relationship.relationshipLabel})
                          </div>
                          <div className="flex gap-2">
                            {g.relationship.isLegalGuardian && (
                              <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-400 text-[10px] font-semibold">
                                Responsável Legal
                              </span>
                            )}
                            {g.relationship.isFinancialGuardian && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                                Responsável Financeiro
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                          <div>Telefone: <span className="text-slate-200">{g.person ? formatPhoneBR(g.person.phone) : '-'}</span></div>
                          <div>E-mail: <span className="text-slate-200">{g.person?.email || '-'}</span></div>
                          <div>Contato de Emergência: <span className={g.relationship.isEmergencyContact ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{g.relationship.isEmergencyContact ? 'Sim' : 'Não'}</span></div>
                          <div>Autorizado p/ Retirada: <span className={g.relationship.isPickupAuthorized ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{g.relationship.isPickupAuthorized ? 'Sim' : 'Não'}</span></div>
                        </div>

                        {g.relationship.notes && (
                          <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                            Observações: {g.relationship.notes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: ANTROPOMETRIA & IMC */}
              {profileTab === 'anthropometry' && (
                <div className="space-y-4">
                  {latestAssessment ? (
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Peso Atual</div>
                        <div className="text-lg font-bold text-white font-mono tabular-nums">{latestAssessment.weightKg} kg</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Altura</div>
                        <div className="text-lg font-bold text-white font-mono tabular-nums">{latestAssessment.heightCm} cm</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">IMC Calculado</div>
                        <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">{latestAssessment.bmi}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Classificação</div>
                        <div className="text-xs font-semibold text-slate-200 mt-1">
                          {calculateBMI(latestAssessment.weightKg, latestAssessment.heightCm).classification}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500">Nenhuma avaliação antropométrica registrada.</div>
                  )}

                  <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400">
                    <span className="font-semibold text-amber-300">Nota técnica:</span> O Índice de Massa Corporal (IMC) é exibido apenas como indicador biométrico auxiliar e não substitui avaliação médica clínica. Categorias de peso para torneios respeitam as tabelas oficiais da federação (ex: CBJ).
                  </div>

                  {activeAssessments.length > 0 && (
                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                      <div className="bg-slate-950 px-3 py-2 font-semibold text-slate-300 text-[11px]">
                        Histórico de Pesagens
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                          <tr>
                            <th className="py-2 px-3">Data</th>
                            <th className="py-2 px-3">Peso</th>
                            <th className="py-2 px-3">Altura</th>
                            <th className="py-2 px-3">IMC</th>
                            <th className="py-2 px-3">Avaliador</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {activeAssessments.map(a => (
                            <tr key={a.id}>
                              <td className="py-2 px-3 font-mono">{formatDateBR(a.date)}</td>
                              <td className="py-2 px-3 font-mono">{a.weightKg} kg</td>
                              <td className="py-2 px-3 font-mono">{a.heightCm} cm</td>
                              <td className="py-2 px-3 font-mono">{a.bmi}</td>
                              <td className="py-2 px-3 text-slate-300">{a.evaluatorName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SAÚDE & ATESTADOS (LGPD) */}
              {profileTab === 'health' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-red-200">
                      <strong>Área de Acesso Restrito (LGPD):</strong> Registros de saúde são de visualização restrita para instrutores autorizados e equipe médica. Todas as consultas geram registro de auditoria.
                    </div>
                  </div>

                  {activeHealth ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
                        <div className="font-semibold text-slate-200">Condições Clínicas & Alergias</div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeHealth.conditions.length > 0 ? (
                            activeHealth.conditions.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500">Nenhuma condição informada.</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 pt-1">
                          Alergias conhecidas: {activeHealth.allergies.join(', ') || 'Nenhuma informada.'}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1.5">
                        <div className="font-semibold text-slate-200">Histórico de Lesões & Medicamentos</div>
                        <div className="text-slate-400 text-[11px]">Lesões prévias: {activeHealth.injuryHistory || 'Nenhuma registrada.'}</div>
                        <div className="text-slate-400 text-[11px]">Medicamentos voluntários: {activeHealth.voluntaryMedications || 'Nenhum.'}</div>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">Atestados Médicos Cadastrados</span>
                          {activeHealth.medicalCertExpiryDate && (
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                              Válido até {formatDateBR(activeHealth.medicalCertExpiryDate)}
                            </span>
                          )}
                        </div>
                        {activeHealth.medicalDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                            <div className="flex items-center gap-2">
                              <FileCheck className="h-4 w-4 text-emerald-400" />
                              <span className="text-slate-200 font-medium">{doc.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Enviado em {formatDateBR(doc.uploadDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500">Nenhum prontuário de saúde preenchido.</div>
                  )}
                </div>
              )}

              {/* TAB 5: GRADUAÇÕES */}
              {profileTab === 'ranks' && (
                <div className="space-y-3">
                  <div className="font-semibold text-slate-200">Faixas Atuais do Praticante</div>
                  {selectedStudent.currentGraduations.map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full border border-slate-500"
                          style={{ backgroundColor: g.beltColorHex }}
                        ></span>
                        <div>
                          <div className="font-bold text-white">{g.beltName}</div>
                          <div className="text-[11px] text-slate-400">{g.martialArtName}</div>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        <div>Graduado em: {formatDateBR(g.graduatedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: TURMAS */}
              {profileTab === 'classes' && (
                <div className="space-y-3">
                  <div className="font-semibold text-slate-200">Turmas e Horários Matriculados</div>
                  {activeClasses.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">Nenhuma turma vinculada a este aluno.</div>
                  ) : (
                    activeClasses.map((c) => (
                      <div key={c.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{c.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {c.startTime} às {c.endTime} · {c.tatamiRoom} · Prof. {c.headInstructorName}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          Matrícula Regular
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
