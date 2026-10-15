import React, { useState, useEffect } from 'react';
import { DataStore } from './data/storage';
import {
  Tenant,
  Branch,
  User,
  Person,
  GuardianRelationship,
  Student,
  ClassGroup,
  Enrollment,
  AttendanceRecord,
  Invoice,
  DigitalLibraryItem,
  BeltExamEvent,
  BeltExamRegistration,
  Competition,
  CompetitionAthlete,
  AuditLog,
  SaaSPlan,
  SaaSPlanId,
  BeltRank,
  MartialArt,
} from './types';

// Layouts
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { DashboardLayout, AdminViewTab } from './components/layout/DashboardLayout';
import { StudentLayout } from './components/layout/StudentLayout';

// Public Sections & Modals
import { HeroSection } from './components/public/HeroSection';
import { FeaturesSection } from './components/public/FeaturesSection';
import { PricingSection } from './components/public/PricingSection';
import { FAQSection } from './components/public/FAQSection';
import { RegisterModal } from './components/public/RegisterModal';
import { LoginModal } from './components/public/LoginModal';

// Admin Views
import { OverviewDashboard } from './components/admin/OverviewDashboard';
import { StudentsView } from './components/admin/StudentsView';
import { StudentFormModal } from './components/admin/StudentFormModal';
import { ModalitiesView } from './components/admin/ModalitiesView';
import { ClassesView } from './components/admin/ClassesView';
import { AttendanceModal } from './components/admin/AttendanceModal';
import { FinancialView } from './components/admin/FinancialView';
import { DigitalLibraryView } from './components/admin/DigitalLibraryView';
import { BeltExamsView } from './components/admin/BeltExamsView';
import { CompetitionsView } from './components/admin/CompetitionsView';
import { BranchesView } from './components/admin/BranchesView';
import { ReportsView } from './components/admin/ReportsView';
import { SettingsView } from './components/admin/SettingsView';
import { PlanUpgradeModal } from './components/admin/PlanUpgradeModal';

// Portals
import { StudentDashboard } from './components/student-portal/StudentDashboard';
import { GuardianPortal } from './components/student-portal/GuardianPortal';
import { PlatformAdminView } from './components/superadmin/PlatformAdminView';

export default function App() {
  // App view navigation
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'student_portal' | 'guardian_portal' | 'superadmin'>('public');
  const [adminTab, setAdminTab] = useState<AdminViewTab>('overview');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
  const [isUpgradePlanOpen, setIsUpgradePlanOpen] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<ClassGroup | null>(null);

  // Active Session context
  const [currentTenantId, setCurrentTenantId] = useState<string>('tenant-kodokan');
  const [currentBranchId, setCurrentBranchId] = useState<string>('branch-matriz');
  const [currentUserId, setCurrentUserId] = useState<string>('user-owner');

  // Data Store States
  const [plans, setPlans] = useState<SaaSPlan[]>(() => DataStore.getPlans());
  const [tenants, setTenants] = useState<Tenant[]>(() => DataStore.getTenants());
  const [branches, setBranches] = useState<Branch[]>(() => DataStore.getBranches());
  const [users, setUsers] = useState<User[]>(() => DataStore.getUsers());
  const [persons, setPersons] = useState<Person[]>(() => DataStore.getPersons(currentTenantId));
  const [guardians, setGuardians] = useState<GuardianRelationship[]>(() => DataStore.getGuardianRelationships(currentTenantId));
  const [students, setStudents] = useState<Student[]>(() => DataStore.getStudents(currentTenantId));
  const [physicalAssessments, setPhysicalAssessments] = useState(() => DataStore.getPhysicalAssessments(currentTenantId));
  const [healthRecords, setHealthRecords] = useState(() => DataStore.getHealthRecords(currentTenantId));
  const [martialArts, setMartialArts] = useState(() => DataStore.getMartialArts(currentTenantId));
  const [beltRanks, setBeltRanks] = useState(() => DataStore.getBeltRanks(currentTenantId));
  const [classes, setClasses] = useState<ClassGroup[]>(() => DataStore.getClasses(currentTenantId));
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => DataStore.getEnrollments(currentTenantId));
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => DataStore.getAttendances(currentTenantId));
  const [invoices, setInvoices] = useState<Invoice[]>(() => DataStore.getInvoices(currentTenantId));
  const [libraryItems, setLibraryItems] = useState<DigitalLibraryItem[]>(() => DataStore.getLibraryItems(currentTenantId));
  const [beltExams, setBeltExams] = useState<BeltExamEvent[]>(() => DataStore.getBeltExams(currentTenantId));
  const [examRegistrations, setExamRegistrations] = useState<BeltExamRegistration[]>(() => DataStore.getExamRegistrations(currentTenantId));
  const [competitions, setCompetitions] = useState<Competition[]>(() => DataStore.getCompetitions(currentTenantId));
  const [competitionAthletes, setCompetitionAthletes] = useState<CompetitionAthlete[]>(() => DataStore.getCompetitionAthletes(currentTenantId));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => DataStore.getAuditLogs(currentTenantId));

  // Sync data when currentTenantId changes
  useEffect(() => {
    setPersons(DataStore.getPersons(currentTenantId));
    setGuardians(DataStore.getGuardianRelationships(currentTenantId));
    setStudents(DataStore.getStudents(currentTenantId));
    setPhysicalAssessments(DataStore.getPhysicalAssessments(currentTenantId));
    setHealthRecords(DataStore.getHealthRecords(currentTenantId));
    setMartialArts(DataStore.getMartialArts(currentTenantId));
    setBeltRanks(DataStore.getBeltRanks(currentTenantId));
    setClasses(DataStore.getClasses(currentTenantId));
    setEnrollments(DataStore.getEnrollments(currentTenantId));
    setAttendances(DataStore.getAttendances(currentTenantId));
    setInvoices(DataStore.getInvoices(currentTenantId));
    setLibraryItems(DataStore.getLibraryItems(currentTenantId));
    setBeltExams(DataStore.getBeltExams(currentTenantId));
    setExamRegistrations(DataStore.getExamRegistrations(currentTenantId));
    setCompetitions(DataStore.getCompetitions(currentTenantId));
    setCompetitionAthletes(DataStore.getCompetitionAthletes(currentTenantId));
    setAuditLogs(DataStore.getAuditLogs(currentTenantId));
  }, [currentTenantId]);

  const activeTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];
  const tenantBranches = branches.filter(b => b.tenantId === currentTenantId);
  const currentUser = users.find(u => u.id === currentUserId) || users[1]; // default owner

  // Handlers for User Switching & Login
  const handleSelectUser = (user: User) => {
    setCurrentUserId(user.id);
    setIsLoginOpen(false);

    if (user.role === 'superadmin') {
      setCurrentView('superadmin');
    } else if (user.role === 'student') {
      setCurrentTenantId(user.tenantId);
      setCurrentView('student_portal');
    } else if (user.role === 'guardian') {
      setCurrentTenantId(user.tenantId);
      setCurrentView('guardian_portal');
    } else {
      // Owner, Branch Manager, Secretary, Financial, Instructor
      setCurrentTenantId(user.tenantId);
      if (user.branchId) setCurrentBranchId(user.branchId);
      setCurrentView('admin');
      setAdminTab('overview');
    }
  };

  // Handlers for Registration
  const handleRegisterSuccess = (newTenant: Tenant, newBranch: Branch, newUser: User) => {
    const updatedTenants = [...tenants, newTenant];
    const updatedBranches = [...branches, newBranch];
    const updatedUsers = [...users, newUser];

    DataStore.saveTenants(updatedTenants);
    DataStore.saveBranches(updatedBranches);
    DataStore.saveUsers(updatedUsers);

    setTenants(updatedTenants);
    setBranches(updatedBranches);
    setUsers(updatedUsers);

    setCurrentTenantId(newTenant.id);
    setCurrentBranchId(newBranch.id);
    setCurrentUserId(newUser.id);
    setIsRegisterOpen(false);
    setCurrentView('admin');
    setAdminTab('overview');

    DataStore.logAudit(
      newTenant.id,
      newUser.id,
      newUser.name,
      'Criação de Conta',
      'Tenant',
      newTenant.id,
      `Nova academia "${newTenant.tradeName}" cadastrada com 10 dias de teste grátis.`
    );
  };

  // Handlers for Student Creation
  const handleSaveStudent = (
    newStudent: Student,
    newPerson: Person,
    guardianPerson?: Person,
    relationship?: GuardianRelationship
  ) => {
    const updatedStudents = [...students, newStudent];
    const updatedPersons = guardianPerson ? [...persons, newPerson, guardianPerson] : [...persons, newPerson];
    const updatedGuardians = relationship ? [...guardians, relationship] : guardians;

    // Generate initial invoice for this student
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      tenantId: currentTenantId,
      branchId: currentBranchId,
      studentId: newStudent.id,
      financialGuardianId: guardianPerson?.id,
      competence: '10/2026',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(activeTenant.settings.defaultDueDay).padStart(2, '0')}`,
      originalAmount: newStudent.monthlyFee,
      discountAmount: 0,
      penaltyAndInterestAmount: 0,
      finalAmount: newStudent.monthlyFee,
      paidAmount: 0,
      balance: newStudent.monthlyFee,
      status: 'pending',
      pixCode: `00020126580014br.gov.bcb.pix0136${Date.now()}5204000053039865406${newStudent.monthlyFee}.005802BR5925${activeTenant.tradeName.substring(0, 25).toUpperCase()}6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000)}`,
      auditTrail: [
        {
          date: new Date().toISOString(),
          action: 'Emissão inicial com matrícula',
          userName: currentUser.name,
        },
      ],
    };

    const updatedInvoices = [newInvoice, ...invoices];

    DataStore.saveStudents(updatedStudents);
    DataStore.savePersons(updatedPersons);
    DataStore.saveGuardianRelationships(updatedGuardians);
    DataStore.saveInvoices(updatedInvoices);

    setStudents(updatedStudents);
    setPersons(updatedPersons);
    setGuardians(updatedGuardians);
    setInvoices(updatedInvoices);

    DataStore.logAudit(
      currentTenantId,
      currentUser.id,
      currentUser.name,
      'Matrícula de Aluno',
      'Student',
      newStudent.id,
      `Matriculado o aluno ${newPerson.fullName} com mensalidade ${newStudent.monthlyFee} BRL.`
    );

    setIsNewStudentOpen(false);
  };

  // Handlers for Attendance
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    const updated = [...records, ...attendances];
    DataStore.saveAttendances(updated);
    setAttendances(updated);

    DataStore.logAudit(
      currentTenantId,
      currentUser.id,
      currentUser.name,
      'Registro de Chamada',
      'AttendanceRecord',
      selectedClassForAttendance?.id || 'class',
      `Chamada realizada para a turma ${selectedClassForAttendance?.name} (${records.length} alunos verificados).`
    );
  };

  // Handlers for Invoice settlement
  const handleSettleInvoice = (invoiceId: string, method: Invoice['paymentMethod'], amount: number) => {
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'paid' as const,
          paidAmount: amount,
          balance: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: method,
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          auditTrail: [
            ...inv.auditTrail,
            {
              date: new Date().toISOString(),
              action: `Baixa manual confirmada via ${method?.toUpperCase()}`,
              userName: currentUser.name,
            },
          ],
        };
      }
      return inv;
    });

    DataStore.saveInvoices(updatedInvoices);
    setInvoices(updatedInvoices);

    DataStore.logAudit(
      currentTenantId,
      currentUser.id,
      currentUser.name,
      'Baixa Financeira',
      'Invoice',
      invoiceId,
      `Liquidação registrada no valor de ${amount} BRL.`
    );
  };

  // Handlers for Belt Rank addition
  const handleAddBeltRank = (rank: BeltRank) => {
    const updated = [...beltRanks, rank];
    DataStore.saveBeltRanks(updated);
    setBeltRanks(updated);

    DataStore.logAudit(
      currentTenantId,
      currentUser.id,
      currentUser.name,
      'Criação de Faixa',
      'BeltRank',
      rank.id,
      `Nova graduação ${rank.name} cadastrada.`
    );
  };

  // Handlers for Classes
  const handleAddClass = (newClass: ClassGroup) => {
    const updated = [...classes, newClass];
    DataStore.saveClasses(updated);
    setClasses(updated);

    DataStore.logAudit(
      currentTenantId,
      currentUser.id,
      currentUser.name,
      'Criação de Turma',
      'ClassGroup',
      newClass.id,
      `Nova turma ${newClass.name} criada no ${newClass.tatamiRoom}.`
    );
  };

  // Handlers for Library Items
  const handleAddLibraryItem = (newItem: DigitalLibraryItem) => {
    const updated = [newItem, ...libraryItems];
    DataStore.saveLibraryItems(updated);
    setLibraryItems(updated);

    DataStore.logAudit(
      currentTenantId,
      currentUser.id,
      currentUser.name,
      'Publicação Técnica',
      'DigitalLibraryItem',
      newItem.id,
      `Publicado material: ${newItem.title}.`
    );
  };

  // Handlers for Exam Creation and Approval
  const handleAddExam = (newExam: BeltExamEvent) => {
    const updated = [newExam, ...beltExams];
    DataStore.saveBeltExams(updated);
    setBeltExams(updated);

    DataStore.logAudit(
      currentTenantId,
      currentUser.id,
      currentUser.name,
      'Agendamento de Exame',
      'BeltExamEvent',
      newExam.id,
      `Exame marcado para ${newExam.examDate}.`
    );
  };

  const handleApproveCandidate = (regId: string, score: number, notes: string) => {
    const reg = examRegistrations.find(r => r.id === regId);
    if (!reg) return;

    const updatedRegs = examRegistrations.map((r) =>
      r.id === regId ? { ...r, resultStatus: 'approved' as const, score, examinerNotes: notes } : r
    );
    DataStore.saveExamRegistrations(updatedRegs);
    setExamRegistrations(updatedRegs);

    // Promote student rank
    const updatedStudents = students.map((s) => {
      if (s.id === reg.studentId) {
        return {
          ...s,
          currentGraduations: [
            {
              martialArtId: 'art-judo',
              martialArtName: 'Judô',
              beltId: reg.targetBeltId,
              beltName: reg.targetBelt,
              beltColorHex: '#f97316', // Orange
              graduatedAt: new Date().toISOString().split('T')[0],
            },
            ...s.currentGraduations,
          ],
        };
      }
      return s;
    });

    DataStore.saveStudents(updatedStudents);
    setStudents(updatedStudents);

    DataStore.logAudit(
      currentTenantId,
      currentUser.id,
      currentUser.name,
      'Graduação Aprovada',
      'Student',
      reg.studentId,
      `Aluno ${reg.studentName} aprovado pela banca com nota ${score} e promovido a ${reg.targetBelt}.`
    );
  };

  // Handlers for Competitions
  const handleAddCompetition = (comp: Competition) => {
    const updated = [comp, ...competitions];
    DataStore.saveCompetitions(updated);
    setCompetitions(updated);
  };

  // Handlers for Branches
  const handleAddBranch = (branch: Branch) => {
    const updated = [...branches, branch];
    DataStore.saveBranches(updated);
    setBranches(updated);
  };

  // Handlers for Tenant settings
  const handleSaveTenant = (updatedTenant: Tenant) => {
    const updatedTenants = tenants.map(t => (t.id === updatedTenant.id ? updatedTenant : t));
    DataStore.saveTenants(updatedTenants);
    setTenants(updatedTenants);
  };

  // Handlers for Plan Upgrade
  const handleConfirmUpgrade = (newPlanId: SaaSPlanId) => {
    const updatedTenant: Tenant = {
      ...activeTenant,
      planId: newPlanId,
      status: 'active',
    };
    handleSaveTenant(updatedTenant);
  };

  // Handlers for Superadmin updates
  const handleUpdatePlans = (updatedPlans: SaaSPlan[]) => {
    DataStore.savePlans(updatedPlans);
    setPlans(updatedPlans);
  };

  const handleUpdateTenantStatus = (tenantId: string, status: Tenant['status']) => {
    const updated = tenants.map(t => (t.id === tenantId ? { ...t, status } : t));
    DataStore.saveTenants(updated);
    setTenants(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-600 selection:text-white">
      {/* VIEW 1: PUBLIC COMMERCIAL LANDING PAGE */}
      {currentView === 'public' && (
        <>
          <PublicNavbar
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
          <main>
            <HeroSection
              onOpenRegister={() => setIsRegisterOpen(true)}
              onOpenLogin={() => setIsLoginOpen(true)}
            />
            <FeaturesSection />
            <PricingSection
              plans={plans}
              onSelectPlan={(planId) => {
                if (planId === 'trial') {
                  setIsRegisterOpen(true);
                } else {
                  setIsRegisterOpen(true);
                }
              }}
            />
            <FAQSection />
          </main>
          <PublicFooter />
        </>
      )}

      {/* VIEW 2: TENANT ACADEMY ADMIN CONSOLE */}
      {currentView === 'admin' && (
        <DashboardLayout
          currentUser={currentUser}
          tenant={activeTenant}
          branches={tenantBranches}
          currentBranchId={currentBranchId}
          onSelectBranch={setCurrentBranchId}
          activeTab={adminTab}
          onSelectTab={setAdminTab}
          onSwitchPersona={() => setIsLoginOpen(true)}
          onLogout={() => setCurrentView('public')}
          onUpgradePlan={() => setIsUpgradePlanOpen(true)}
        >
          {adminTab === 'overview' && (
            <OverviewDashboard
              tenant={activeTenant}
              students={students}
              classes={classes}
              invoices={invoices}
              exams={beltExams}
              auditLogs={auditLogs}
              onNavigateTab={setAdminTab}
              onOpenNewStudent={() => setIsNewStudentOpen(true)}
            />
          )}

          {adminTab === 'students' && (
            <StudentsView
              students={students}
              persons={persons}
              guardians={guardians}
              assessments={physicalAssessments}
              healthRecords={healthRecords}
              belts={beltRanks}
              classes={classes}
              enrollments={enrollments}
              onOpenCreateStudent={() => setIsNewStudentOpen(true)}
              onEditStudent={() => {}}
            />
          )}

          {adminTab === 'modalities' && (
            <ModalitiesView
              martialArts={martialArts}
              beltRanks={beltRanks}
              onAddBeltRank={handleAddBeltRank}
              onAddMartialArt={() => {}}
            />
          )}

          {adminTab === 'classes' && (
            <ClassesView
              classes={classes}
              enrollments={enrollments}
              martialArts={martialArts}
              instructors={users.filter(u => u.role === 'instructor' || u.role === 'owner')}
              onOpenAttendance={(cls) => setSelectedClassForAttendance(cls)}
              onAddClass={handleAddClass}
            />
          )}

          {adminTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Controle de Frequência & Chamadas</h2>
                  <p className="text-xs text-slate-400">Selecione uma turma para realizar a chamada oficial do Sensei.</p>
                </div>
              </div>
              <ClassesView
                classes={classes}
                enrollments={enrollments}
                martialArts={martialArts}
                instructors={users.filter(u => u.role === 'instructor' || u.role === 'owner')}
                onOpenAttendance={(cls) => setSelectedClassForAttendance(cls)}
                onAddClass={handleAddClass}
              />
            </div>
          )}

          {adminTab === 'financial' && (
            <FinancialView
              tenant={activeTenant}
              invoices={invoices}
              students={students}
              persons={persons}
              onSettleInvoice={handleSettleInvoice}
            />
          )}

          {adminTab === 'library' && (
            <DigitalLibraryView
              libraryItems={libraryItems}
              beltRanks={beltRanks}
              onAddLibraryItem={handleAddLibraryItem}
            />
          )}

          {adminTab === 'exams' && (
            <BeltExamsView
              tenant={activeTenant}
              exams={beltExams}
              registrations={examRegistrations}
              students={students}
              persons={persons}
              beltRanks={beltRanks}
              onAddExam={handleAddExam}
              onApproveCandidate={handleApproveCandidate}
            />
          )}

          {adminTab === 'competitions' && (
            <CompetitionsView
              competitions={competitions}
              athletes={competitionAthletes}
              students={students}
              persons={persons}
              onAddCompetition={handleAddCompetition}
              onAddAthlete={() => {}}
            />
          )}

          {adminTab === 'branches' && (
            <BranchesView
              branches={tenantBranches}
              tenant={activeTenant}
              plans={plans}
              onAddBranch={handleAddBranch}
              onUpgradePlan={() => setIsUpgradePlanOpen(true)}
            />
          )}

          {adminTab === 'reports' && (
            <ReportsView
              students={students}
              persons={persons}
              invoices={invoices}
              attendances={attendances}
              belts={beltRanks}
            />
          )}

          {adminTab === 'settings' && (
            <SettingsView
              tenant={activeTenant}
              plans={plans}
              onSaveTenant={handleSaveTenant}
              onUpgradePlan={() => setIsUpgradePlanOpen(true)}
            />
          )}
        </DashboardLayout>
      )}

      {/* VIEW 3: STUDENT PORTAL */}
      {currentView === 'student_portal' && (
        <StudentLayout
          currentUser={currentUser}
          tenant={activeTenant}
          onSwitchPersona={() => setIsLoginOpen(true)}
          onLogout={() => setCurrentView('public')}
        >
          {(() => {
            const currentStudent = students.find(s => s.id === currentUser.studentId) || students[0];
            const currentPerson = persons.find(p => p.id === currentStudent?.personId) || persons[0];
            return (
              <StudentDashboard
                student={currentStudent}
                person={currentPerson}
                classes={classes}
                invoices={invoices}
                attendances={attendances}
                libraryItems={libraryItems}
                onOpenLibraryItem={() => {}}
              />
            );
          })()}
        </StudentLayout>
      )}

      {/* VIEW 4: GUARDIAN PORTAL */}
      {currentView === 'guardian_portal' && (
        <StudentLayout
          currentUser={currentUser}
          tenant={activeTenant}
          onSwitchPersona={() => setIsLoginOpen(true)}
          onLogout={() => setCurrentView('public')}
        >
          {(() => {
            const guardianPerson = persons.find(p => p.id === currentUser.guardianPersonId) || persons[2];
            return (
              <GuardianPortal
                guardianPerson={guardianPerson}
                relationships={guardians}
                students={students}
                persons={persons}
                invoices={invoices}
                classes={classes}
                attendances={attendances}
                healthRecords={healthRecords}
              />
            );
          })()}
        </StudentLayout>
      )}

      {/* VIEW 5: CENTRAL SAAS SUPERADMIN CONSOLE */}
      {currentView === 'superadmin' && (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">TatameHub Central</span>
              <span className="text-xs bg-red-600 px-2 py-0.5 rounded text-white font-semibold">SuperAdmin</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Trocar Persona
              </button>
              <button
                onClick={() => setCurrentView('public')}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-xs font-semibold text-white hover:bg-red-500"
              >
                Ver Site Comercial
              </button>
            </div>
          </div>

          <PlatformAdminView
            tenants={tenants}
            plans={plans}
            currentUser={currentUser}
            onUpdatePlans={handleUpdatePlans}
            onUpdateTenantStatus={handleUpdateTenantStatus}
            onSwitchTenant={(tId) => {
              setCurrentTenantId(tId);
              setCurrentView('admin');
              setAdminTab('overview');
            }}
          />
        </div>
      )}

      {/* GLOBAL MODALS */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        users={users}
        onSelectUser={handleSelectUser}
      />

      <StudentFormModal
        isOpen={isNewStudentOpen}
        onClose={() => setIsNewStudentOpen(false)}
        tenantId={currentTenantId}
        branchId={currentBranchId}
        belts={beltRanks}
        martialArts={martialArts}
        onSave={handleSaveStudent}
      />

      {selectedClassForAttendance && (
        <AttendanceModal
          isOpen={true}
          onClose={() => setSelectedClassForAttendance(null)}
          classGroup={selectedClassForAttendance}
          students={students}
          persons={persons}
          enrollments={enrollments}
          currentUser={currentUser}
          onSaveAttendance={handleSaveAttendance}
        />
      )}

      <PlanUpgradeModal
        isOpen={isUpgradePlanOpen}
        onClose={() => setIsUpgradePlanOpen(false)}
        plans={plans}
        currentPlanId={activeTenant.planId}
        onConfirmUpgrade={handleConfirmUpgrade}
      />
    </div>
  );
}
