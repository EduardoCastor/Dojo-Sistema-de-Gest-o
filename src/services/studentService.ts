import { supabase, isSupabaseConfigured } from './supabase';
import { Student, Person, GuardianRelationship, BeltRank, MartialArt } from '../types';

/**
 * Validador de formato UUID v4 para evitar erro 'invalid input syntax for type uuid'
 */
export function isValidUUID(id: string): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export interface CreateStudentPayload {
  tenantId: string;
  branchId: string;
  fullName: string;
  birthDate: string;
  cpf?: string;
  socialName?: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  city?: string;
  monthlyFee: number;
  martialArtId: string;
  beltRankId: string;
  selectedBelt?: BeltRank;
  selectedArt?: MartialArt;
  hasGuardian?: boolean;
  guardianName?: string;
  guardianCpf?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  relationshipType?: string;
}

export interface StudentServiceResult {
  student: Student;
  person: Person;
  guardianPerson?: Person;
  relationship?: GuardianRelationship;
}

export const studentService = {
  /**
   * Consulta a lista de alunos da academia informada (filtrada por tenant_id e RLS).
   * Retorna os registros normalizados para o modelo utilizado na interface do React.
   */
  async fetchStudentsWithDetails(tenantId: string): Promise<{
    students: Student[];
    persons: Person[];
    guardians: GuardianRelationship[];
  } | null> {
    if (!isSupabaseConfigured() || !supabase || !isValidUUID(tenantId)) {
      return null;
    }

    try {
      // 1. Buscar alunos com dados da pessoa vinculada e graduações
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          tenant_id,
          branch_id,
          person_id,
          registration_number,
          enrollment_date,
          status,
          monthly_fee,
          notes,
          created_at,
          person:persons (
            id,
            tenant_id,
            full_name,
            social_name,
            cpf,
            birth_date,
            gender,
            phone,
            email,
            address,
            created_at
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (studentsError) {
        console.warn('Aviso ao carregar alunos do Supabase (RLS ou conexão):', studentsError.message);
        return null;
      }

      // 2. Buscar vínculos de responsáveis
      const { data: guardiansData, error: guardiansError } = await supabase
        .from('guardian_relationships')
        .select(`
          id,
          tenant_id,
          student_id,
          guardian_person_id,
          relationship_label,
          is_legal_guardian,
          is_financial_guardian,
          is_emergency_contact,
          is_pickup_authorized,
          notes,
          guardian:persons!guardian_person_id (
            id,
            tenant_id,
            full_name,
            cpf,
            birth_date,
            gender,
            phone,
            email,
            address,
            created_at
          )
        `)
        .eq('tenant_id', tenantId);

      if (guardiansError) {
        console.warn('Aviso ao carregar responsáveis do Supabase:', guardiansError.message);
      }

      // 3. Buscar histórico de graduações
      const { data: graduationsData } = await supabase
        .from('student_graduations')
        .select(`
          id,
          tenant_id,
          student_id,
          martial_art_id,
          belt_rank_id,
          graduated_at,
          martial_art:martial_arts (id, name),
          belt_rank:belt_ranks (id, name, color_hex)
        `)
        .eq('tenant_id', tenantId);

      // Normalizar para os tipos do frontend
      const loadedPersons: Person[] = [];
      const personMap = new Map<string, Person>();

      const loadedStudents: Student[] = (studentsData || []).map((row: any) => {
        const p = row.person;
        if (p && !personMap.has(p.id)) {
          const parsedPerson: Person = {
            id: p.id,
            tenantId: p.tenant_id,
            fullName: p.full_name,
            socialName: p.social_name || undefined,
            cpf: p.cpf || '',
            birthDate: p.birth_date,
            gender: (p.gender as any) || 'male',
            phone: p.phone || '',
            email: p.email || '',
            address: {
              street: p.address?.street || '',
              number: p.address?.number || '',
              neighborhood: p.address?.neighborhood || '',
              city: p.address?.city || '',
              state: p.address?.state || 'SP',
              zipCode: p.address?.zipCode || '',
            },
            createdAt: p.created_at || new Date().toISOString(),
          };
          personMap.set(p.id, parsedPerson);
          loadedPersons.push(parsedPerson);
        }

        // Buscar graduações do aluno
        const studentGrads = (graduationsData || [])
          .filter((g: any) => g.student_id === row.id)
          .map((g: any) => ({
            martialArtId: g.martial_art_id,
            martialArtName: g.martial_art?.name || 'Artes Marciais',
            beltId: g.belt_rank_id,
            beltName: g.belt_rank?.name || 'Faixa Inicial',
            beltColorHex: g.belt_rank?.color_hex || '#ffffff',
            graduatedAt: g.graduated_at || row.enrollment_date,
          }));

        return {
          id: row.id,
          tenantId: row.tenant_id,
          branchId: row.branch_id,
          personId: row.person_id,
          registrationNumber: row.registration_number,
          enrollmentDate: row.enrollment_date,
          status: row.status,
          currentGraduations: studentGrads.length > 0 ? studentGrads : [
            {
              martialArtId: 'art-judo',
              martialArtName: 'Judô',
              beltId: 'rank-judo-branca',
              beltName: 'Faixa Branca',
              beltColorHex: '#ffffff',
              graduatedAt: row.enrollment_date,
            },
          ],
          monthlyFee: Number(row.monthly_fee) || 0,
          notes: row.notes || undefined,
        };
      });

      const loadedGuardians: GuardianRelationship[] = [];
      (guardiansData || []).forEach((row: any) => {
        const gp = row.guardian;
        if (gp && !personMap.has(gp.id)) {
          const parsedGuardianPerson: Person = {
            id: gp.id,
            tenantId: gp.tenant_id,
            fullName: gp.full_name,
            cpf: gp.cpf || '',
            birthDate: gp.birth_date || '1985-01-01',
            gender: (gp.gender as any) || 'other',
            phone: gp.phone || '',
            email: gp.email || '',
            address: {
              street: gp.address?.street || '',
              number: gp.address?.number || '',
              neighborhood: gp.address?.neighborhood || '',
              city: gp.address?.city || '',
              state: gp.address?.state || 'SP',
              zipCode: gp.address?.zipCode || '',
            },
            createdAt: gp.created_at || new Date().toISOString(),
          };
          personMap.set(gp.id, parsedGuardianPerson);
          loadedPersons.push(parsedGuardianPerson);
        }

        loadedGuardians.push({
          id: row.id,
          tenantId: row.tenant_id,
          studentId: row.student_id,
          guardianPersonId: row.guardian_person_id,
          relationshipLabel: row.relationship_label,
          isLegalGuardian: Boolean(row.is_legal_guardian),
          isFinancialGuardian: Boolean(row.is_financial_guardian),
          isEmergencyContact: Boolean(row.is_emergency_contact),
          isPickupAuthorized: Boolean(row.is_pickup_authorized),
          notes: row.notes || undefined,
        });
      });

      return {
        students: loadedStudents,
        persons: loadedPersons,
        guardians: loadedGuardians,
      };
    } catch (err) {
      console.error('Erro na requisição ao Supabase ao listar alunos:', err);
      return null;
    }
  },

  /**
   * Persiste um novo aluno no Supabase.
   * Utiliza preferencialmente a função RPC atômica register_student_atomic.
   * Em caso de ausência do RPC, utiliza inserções sequenciais com salvaguarda de integridade.
   */
  async createStudent(payload: CreateStudentPayload): Promise<StudentServiceResult> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }

    if (!isValidUUID(payload.tenantId)) {
      throw new Error('ID da academia (tenant_id) deve ser um UUID válido no Supabase.');
    }

    const regNumber = `MAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const personPayload = {
      full_name: payload.fullName.trim(),
      social_name: payload.socialName?.trim() || null,
      cpf: payload.cpf?.trim() || null,
      birth_date: payload.birthDate,
      gender: payload.gender || 'male',
      phone: payload.phone?.trim() || null,
      email: payload.email?.trim() || null,
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: payload.city || 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
      },
    };

    const studentPayload = {
      registration_number: regNumber,
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'active',
      monthly_fee: payload.monthlyFee,
      notes: null,
    };

    const guardianPersonPayload = (payload.hasGuardian && payload.guardianName?.trim()) ? {
      full_name: payload.guardianName.trim(),
      cpf: payload.guardianCpf?.trim() || null,
      birth_date: '1985-01-01',
      gender: 'other',
      phone: payload.guardianPhone?.trim() || payload.phone?.trim() || null,
      email: payload.guardianEmail?.trim() || 'responsavel@tatamehub.com.br',
      address: personPayload.address,
    } : null;

    const guardianRelPayload = guardianPersonPayload ? {
      relationship_label: payload.relationshipType || 'Responsável',
      is_legal_guardian: true,
      is_financial_guardian: true,
      is_emergency_contact: true,
      is_pickup_authorized: true,
      notes: null,
    } : null;

    const graduationPayload = (isValidUUID(payload.martialArtId) && isValidUUID(payload.beltRankId)) ? {
      martial_art_id: payload.martialArtId,
      belt_rank_id: payload.beltRankId,
      graduated_at: new Date().toISOString().split('T')[0],
      examiner_name: 'Sensei Responsável',
      notes: 'Graduação inicial no ato da matrícula',
    } : null;

    // Tentar executar via RPC atômica register_student_atomic
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('register_student_atomic', {
        p_tenant_id: payload.tenantId,
        p_branch_id: isValidUUID(payload.branchId) ? payload.branchId : null,
        p_person: personPayload,
        p_student: studentPayload,
        p_guardian_person: guardianPersonPayload,
        p_guardian_rel: guardianRelPayload,
        p_graduation: graduationPayload,
      });

      if (!rpcError && rpcResult?.success) {
        const studentId = rpcResult.student_id;
        const personId = rpcResult.person_id;
        const guardianPersonId = rpcResult.guardian_person_id;
        const guardianRelId = rpcResult.guardian_relationship_id;

        const newPerson: Person = {
          id: personId,
          tenantId: payload.tenantId,
          fullName: payload.fullName,
          socialName: payload.socialName,
          cpf: payload.cpf || '000.000.000-00',
          birthDate: payload.birthDate,
          gender: payload.gender,
          phone: payload.phone || '',
          email: payload.email || '',
          address: personPayload.address,
          createdAt: new Date().toISOString(),
        };

        const newStudent: Student = {
          id: studentId,
          tenantId: payload.tenantId,
          branchId: payload.branchId,
          personId: personId,
          registrationNumber: rpcResult.registration_number || regNumber,
          enrollmentDate: studentPayload.enrollment_date,
          status: 'active',
          currentGraduations: [
            {
              martialArtId: payload.selectedArt?.id || payload.martialArtId,
              martialArtName: payload.selectedArt?.name || 'Judô',
              beltId: payload.selectedBelt?.id || payload.beltRankId,
              beltName: payload.selectedBelt?.name || 'Faixa Branca',
              beltColorHex: payload.selectedBelt?.colorHex || '#ffffff',
              graduatedAt: studentPayload.enrollment_date,
            },
          ],
          monthlyFee: payload.monthlyFee,
        };

        let createdGuardianPerson: Person | undefined = undefined;
        let createdRelationship: GuardianRelationship | undefined = undefined;

        if (guardianPersonPayload && guardianPersonId && guardianRelId) {
          createdGuardianPerson = {
            id: guardianPersonId,
            tenantId: payload.tenantId,
            fullName: guardianPersonPayload.full_name,
            cpf: guardianPersonPayload.cpf || '',
            birthDate: '1985-01-01',
            gender: 'other',
            phone: guardianPersonPayload.phone || '',
            email: guardianPersonPayload.email || '',
            address: personPayload.address,
            createdAt: new Date().toISOString(),
          };

          createdRelationship = {
            id: guardianRelId,
            tenantId: payload.tenantId,
            studentId: studentId,
            guardianPersonId: guardianPersonId,
            relationshipLabel: payload.relationshipType || 'Responsável',
            isLegalGuardian: true,
            isFinancialGuardian: true,
            isEmergencyContact: true,
            isPickupAuthorized: true,
          };
        }

        return {
          student: newStudent,
          person: newPerson,
          guardianPerson: createdGuardianPerson,
          relationship: createdRelationship,
        };
      }
    } catch (err: any) {
      console.warn('RPC register_student_atomic indisponível ou falhou, tentando fallback direto:', err?.message);
    }

    // FALLBACK DIRETO VIA REST (Caso a migration 06 ainda não tenha sido executada no SQL Editor)
    // 1. Inserir Person
    const { data: personData, error: personErr } = await supabase
      .from('persons')
      .insert({
        tenant_id: payload.tenantId,
        full_name: payload.fullName.trim(),
        social_name: payload.socialName?.trim() || null,
        cpf: payload.cpf?.trim() || null,
        birth_date: payload.birthDate,
        gender: payload.gender || 'male',
        phone: payload.phone?.trim() || null,
        email: payload.email?.trim() || null,
        address: personPayload.address,
      })
      .select()
      .single();

    if (personErr || !personData) {
      throw new Error(`Erro ao salvar pessoa do aluno no Supabase: ${personErr?.message || 'Falha no retorno'}`);
    }

    const studentPersonId = personData.id;

    // 2. Inserir Student
    const { data: studentData, error: studentErr } = await supabase
      .from('students')
      .insert({
        tenant_id: payload.tenantId,
        branch_id: payload.branchId,
        person_id: studentPersonId,
        registration_number: regNumber,
        enrollment_date: studentPayload.enrollment_date,
        status: 'active',
        monthly_fee: payload.monthlyFee,
      })
      .select()
      .single();

    if (studentErr || !studentData) {
      // Rollback da pessoa criada
      await supabase.from('persons').delete().eq('id', studentPersonId);
      throw new Error(`Erro ao salvar matrícula do aluno no Supabase: ${studentErr?.message}`);
    }

    const createdStudentId = studentData.id;

    // 3. Inserir Responsável (se houver)
    let createdGuardianPerson: Person | undefined = undefined;
    let createdRelationship: GuardianRelationship | undefined = undefined;

    if (guardianPersonPayload) {
      try {
        const { data: gpData } = await supabase
          .from('persons')
          .insert({
            tenant_id: payload.tenantId,
            full_name: guardianPersonPayload.full_name,
            cpf: guardianPersonPayload.cpf,
            birth_date: guardianPersonPayload.birth_date,
            gender: guardianPersonPayload.gender,
            phone: guardianPersonPayload.phone,
            email: guardianPersonPayload.email,
            address: personPayload.address,
          })
          .select()
          .single();

        if (gpData) {
          createdGuardianPerson = {
            id: gpData.id,
            tenantId: payload.tenantId,
            fullName: gpData.full_name,
            cpf: gpData.cpf || '',
            birthDate: gpData.birth_date,
            gender: gpData.gender,
            phone: gpData.phone || '',
            email: gpData.email || '',
            address: personPayload.address,
            createdAt: gpData.created_at,
          };

          const { data: grData } = await supabase
            .from('guardian_relationships')
            .insert({
              tenant_id: payload.tenantId,
              student_id: createdStudentId,
              guardian_person_id: gpData.id,
              relationship_label: payload.relationshipType || 'Responsável',
              is_legal_guardian: true,
              is_financial_guardian: true,
              is_emergency_contact: true,
              is_pickup_authorized: true,
            })
            .select()
            .single();

          if (grData) {
            createdRelationship = {
              id: grData.id,
              tenantId: payload.tenantId,
              studentId: createdStudentId,
              guardianPersonId: gpData.id,
              relationshipLabel: grData.relationship_label,
              isLegalGuardian: grData.is_legal_guardian,
              isFinancialGuardian: grData.is_financial_guardian,
              isEmergencyContact: grData.is_emergency_contact,
              isPickupAuthorized: grData.is_pickup_authorized,
            };
          }
        }
      } catch (gErr) {
        console.warn('Aviso: Responsável não pode ser persistido:', gErr);
      }
    }

    // 4. Inserir Graduação se os IDs forem UUIDs válidos
    if (isValidUUID(payload.martialArtId) && isValidUUID(payload.beltRankId)) {
      try {
        await supabase.from('student_graduations').insert({
          tenant_id: payload.tenantId,
          student_id: createdStudentId,
          martial_art_id: payload.martialArtId,
          belt_rank_id: payload.beltRankId,
          graduated_at: studentPayload.enrollment_date,
          examiner_name: 'Sensei Responsável',
        });
      } catch (gradErr) {
        console.warn('Aviso: Graduação inicial não pode ser inserida:', gradErr);
      }
    }

    const resultStudent: Student = {
      id: createdStudentId,
      tenantId: payload.tenantId,
      branchId: payload.branchId,
      personId: studentPersonId,
      registrationNumber: regNumber,
      enrollmentDate: studentPayload.enrollment_date,
      status: 'active',
      currentGraduations: [
        {
          martialArtId: payload.selectedArt?.id || payload.martialArtId,
          martialArtName: payload.selectedArt?.name || 'Judô',
          beltId: payload.selectedBelt?.id || payload.beltRankId,
          beltName: payload.selectedBelt?.name || 'Faixa Branca',
          beltColorHex: payload.selectedBelt?.colorHex || '#ffffff',
          graduatedAt: studentPayload.enrollment_date,
        },
      ],
      monthlyFee: payload.monthlyFee,
    };

    const resultPerson: Person = {
      id: studentPersonId,
      tenantId: payload.tenantId,
      fullName: payload.fullName,
      socialName: payload.socialName,
      cpf: payload.cpf || '000.000.000-00',
      birthDate: payload.birthDate,
      gender: payload.gender,
      phone: payload.phone || '',
      email: payload.email || '',
      address: personPayload.address,
      createdAt: new Date().toISOString(),
    };

    return {
      student: resultStudent,
      person: resultPerson,
      guardianPerson: createdGuardianPerson,
      relationship: createdRelationship,
    };
  },
};
