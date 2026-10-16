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

export interface UpdateStudentPayload {
  studentId: string;
  personId: string;
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
  status: 'active' | 'inactive' | 'suspended' | 'dropped';
  martialArtId: string;
  beltRankId: string;
  selectedBelt?: BeltRank;
  selectedArt?: MartialArt;
  hasGuardian?: boolean;
  guardianPersonId?: string;
  guardianRelId?: string;
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
   * Consulta as modalidades de artes marciais da academia informada (tenant_id) no Supabase.
   * Filtra por tenant_id e opcionalmente por status='active' (padrão true para formulários de alunos).
   */
  async fetchMartialArts(tenantId: string, includeInactive: boolean = false): Promise<MartialArt[]> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId)) {
      throw new Error('ID da academia (tenant_id) deve ser um UUID válido no Supabase.');
    }

    let query = supabase
      .from('martial_arts')
      .select('id, tenant_id, name, origin, description, governing_federation, status')
      .eq('tenant_id', tenantId);

    if (!includeInactive) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      console.error('Erro ao consultar public.martial_arts no Supabase:', error);
      throw new Error(`Erro ao consultar modalidades: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      origin: row.origin || '',
      description: row.description || '',
      governingFederation: row.governing_federation || undefined,
      status: (row.status || 'active') as 'active' | 'inactive',
    }));
  },

  /**
   * Cadastra uma nova modalidade de arte marcial no Supabase.
   */
  async createMartialArt(
    tenantId: string,
    data: {
      name: string;
      origin?: string;
      description?: string;
      governingFederation?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<MartialArt> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId)) {
      throw new Error('ID da academia (tenant_id) deve ser um UUID válido.');
    }
    if (!data.name || !data.name.trim()) {
      throw new Error('O nome da arte marcial é obrigatório.');
    }

    const insertPayload = {
      tenant_id: tenantId,
      name: data.name.trim(),
      origin: data.origin?.trim() || null,
      description: data.description?.trim() || null,
      governing_federation: data.governingFederation?.trim() || null,
      status: data.status || 'active',
    };

    const { data: created, error } = await supabase
      .from('martial_arts')
      .insert(insertPayload)
      .select('id, tenant_id, name, origin, description, governing_federation, status')
      .single();

    if (error) {
      console.error('Erro ao inserir arte marcial no Supabase:', error);
      throw new Error(`Erro ao cadastrar modalidade: ${error.message}`);
    }

    return {
      id: created.id,
      tenantId: created.tenant_id,
      name: created.name,
      origin: created.origin || '',
      description: created.description || '',
      governingFederation: created.governing_federation || undefined,
      status: created.status as 'active' | 'inactive',
    };
  },

  /**
   * Atualiza os dados de uma modalidade existente no Supabase.
   */
  async updateMartialArt(
    tenantId: string,
    id: string,
    data: Partial<{
      name: string;
      origin: string;
      description: string;
      governingFederation: string;
      status: 'active' | 'inactive';
    }>
  ): Promise<MartialArt> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId) || !isValidUUID(id)) {
      throw new Error('tenantId e id devem ser UUIDs válidos.');
    }

    const updatePayload: Record<string, any> = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.origin !== undefined) updatePayload.origin = data.origin.trim();
    if (data.description !== undefined) updatePayload.description = data.description.trim();
    if (data.governingFederation !== undefined) updatePayload.governing_federation = data.governingFederation.trim() || null;
    if (data.status !== undefined) updatePayload.status = data.status;

    const { data: updated, error } = await supabase
      .from('martial_arts')
      .update(updatePayload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, tenant_id, name, origin, description, governing_federation, status')
      .single();

    if (error) {
      console.error('Erro ao atualizar arte marcial no Supabase:', error);
      throw new Error(`Erro ao atualizar modalidade: ${error.message}`);
    }

    return {
      id: updated.id,
      tenantId: updated.tenant_id,
      name: updated.name,
      origin: updated.origin || '',
      description: updated.description || '',
      governingFederation: updated.governing_federation || undefined,
      status: updated.status as 'active' | 'inactive',
    };
  },

  /**
   * Altera o status (active / inactive) de uma modalidade.
   */
  async toggleMartialArtStatus(
    tenantId: string,
    id: string,
    status: 'active' | 'inactive'
  ): Promise<MartialArt> {
    return this.updateMartialArt(tenantId, id, { status });
  },

  /**
   * Exclui uma modalidade do Supabase (se não houver registros dependentes ou regras de restrição).
   */
  async deleteMartialArt(tenantId: string, id: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId) || !isValidUUID(id)) {
      throw new Error('tenantId e id devem ser UUIDs válidos.');
    }

    const { error } = await supabase
      .from('martial_arts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Erro ao excluir arte marcial no Supabase:', error);
      throw new Error(`Erro ao excluir modalidade: ${error.message}`);
    }
  },

  /**
   * Consulta as faixas/graduações da academia informada (tenant_id) no Supabase.
   * Filtra exclusivamente por tenant_id e martial_art_id correspondente, ordenando por order_index crescente.
   */
  async fetchBeltRanks(tenantId: string, martialArtId?: string): Promise<BeltRank[]> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId)) {
      throw new Error('ID da academia (tenant_id) deve ser um UUID válido no Supabase.');
    }

    let query = supabase
      .from('belt_ranks')
      .select('id, tenant_id, martial_art_id, name, rank_type, order_index, color_hex, stripe_color_hex, min_age_years, min_practice_months, technical_requirements, requires_exam')
      .eq('tenant_id', tenantId);

    if (martialArtId) {
      if (!isValidUUID(martialArtId)) {
        throw new Error('ID da modalidade deve ser um UUID válido.');
      }
      query = query.eq('martial_art_id', martialArtId);
    }

    const { data, error } = await query.order('order_index', { ascending: true });

    if (error) {
      console.error('Erro ao consultar public.belt_ranks no Supabase:', error);
      throw new Error(`Erro ao consultar graduações: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      martialArtId: row.martial_art_id,
      name: row.name,
      rankType: row.rank_type || 'faixa',
      orderIndex: row.order_index,
      colorHex: row.color_hex || '#ffffff',
      stripeColorHex: row.stripe_color_hex || undefined,
      minAgeYears: row.min_age_years ?? 4,
      minPracticeMonths: row.min_practice_months ?? 0,
      technicalRequirements: row.technical_requirements || '',
      requiresExam: Boolean(row.requires_exam),
    }));
  },

  /**
   * Cadastra uma nova faixa/graduação vinculada a uma modalidade no Supabase.
   */
  async createBeltRank(
    tenantId: string,
    data: {
      martialArtId: string;
      name: string;
      rankType?: 'faixa' | 'grau' | 'dan' | 'corda';
      orderIndex?: number;
      colorHex: string;
      stripeColorHex?: string;
      minAgeYears?: number;
      minPracticeMonths?: number;
      technicalRequirements?: string;
      requiresExam?: boolean;
    }
  ): Promise<BeltRank> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId) || !isValidUUID(data.martialArtId)) {
      throw new Error('tenantId e martialArtId devem ser UUIDs válidos.');
    }
    if (!data.name || !data.name.trim()) {
      throw new Error('O nome da faixa/graduação é obrigatório.');
    }

    // Se orderIndex não foi informado, buscar o maior atual e somar 1
    let nextOrder = data.orderIndex;
    if (nextOrder === undefined || nextOrder === null) {
      const { data: existing } = await supabase
        .from('belt_ranks')
        .select('order_index')
        .eq('tenant_id', tenantId)
        .eq('martial_art_id', data.martialArtId)
        .order('order_index', { ascending: false })
        .limit(1);

      nextOrder = (existing?.[0]?.order_index ?? 0) + 1;
    }

    const insertPayload = {
      tenant_id: tenantId,
      martial_art_id: data.martialArtId,
      name: data.name.trim(),
      rank_type: data.rankType || 'faixa',
      order_index: nextOrder,
      color_hex: data.colorHex || '#ffffff',
      stripe_color_hex: data.stripeColorHex || null,
      min_age_years: data.minAgeYears ?? 4,
      min_practice_months: data.minPracticeMonths ?? 0,
      technical_requirements: data.technicalRequirements?.trim() || null,
      requires_exam: data.requiresExam !== false,
    };

    const { data: created, error } = await supabase
      .from('belt_ranks')
      .insert(insertPayload)
      .select('id, tenant_id, martial_art_id, name, rank_type, order_index, color_hex, stripe_color_hex, min_age_years, min_practice_months, technical_requirements, requires_exam')
      .single();

    if (error) {
      console.error('Erro ao cadastrar faixa no Supabase:', error);
      throw new Error(`Erro ao cadastrar graduação: ${error.message}`);
    }

    return {
      id: created.id,
      tenantId: created.tenant_id,
      martialArtId: created.martial_art_id,
      name: created.name,
      rankType: created.rank_type as any,
      orderIndex: created.order_index,
      colorHex: created.color_hex,
      stripeColorHex: created.stripe_color_hex || undefined,
      minAgeYears: created.min_age_years,
      minPracticeMonths: created.min_practice_months,
      technicalRequirements: created.technical_requirements || '',
      requiresExam: created.requires_exam,
    };
  },

  /**
   * Atualiza os dados de uma faixa/graduação existente no Supabase.
   */
  async updateBeltRank(
    tenantId: string,
    id: string,
    data: Partial<{
      name: string;
      rankType: 'faixa' | 'grau' | 'dan' | 'corda';
      orderIndex: number;
      colorHex: string;
      stripeColorHex: string;
      minAgeYears: number;
      minPracticeMonths: number;
      technicalRequirements: string;
      requiresExam: boolean;
    }>
  ): Promise<BeltRank> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId) || !isValidUUID(id)) {
      throw new Error('tenantId e id devem ser UUIDs válidos.');
    }

    const updatePayload: Record<string, any> = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.rankType !== undefined) updatePayload.rank_type = data.rankType;
    if (data.orderIndex !== undefined) updatePayload.order_index = Number(data.orderIndex);
    if (data.colorHex !== undefined) updatePayload.color_hex = data.colorHex;
    if (data.stripeColorHex !== undefined) updatePayload.stripe_color_hex = data.stripeColorHex || null;
    if (data.minAgeYears !== undefined) updatePayload.min_age_years = Number(data.minAgeYears);
    if (data.minPracticeMonths !== undefined) updatePayload.min_practice_months = Number(data.minPracticeMonths);
    if (data.technicalRequirements !== undefined) updatePayload.technical_requirements = data.technicalRequirements.trim();
    if (data.requiresExam !== undefined) updatePayload.requires_exam = Boolean(data.requiresExam);

    const { data: updated, error } = await supabase
      .from('belt_ranks')
      .update(updatePayload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, tenant_id, martial_art_id, name, rank_type, order_index, color_hex, stripe_color_hex, min_age_years, min_practice_months, technical_requirements, requires_exam')
      .single();

    if (error) {
      console.error('Erro ao atualizar faixa no Supabase:', error);
      throw new Error(`Erro ao atualizar graduação: ${error.message}`);
    }

    return {
      id: updated.id,
      tenantId: updated.tenant_id,
      martialArtId: updated.martial_art_id,
      name: updated.name,
      rankType: updated.rank_type as any,
      orderIndex: updated.order_index,
      colorHex: updated.color_hex,
      stripeColorHex: updated.stripe_color_hex || undefined,
      minAgeYears: updated.min_age_years,
      minPracticeMonths: updated.min_practice_months,
      technicalRequirements: updated.technical_requirements || '',
      requiresExam: updated.requires_exam,
    };
  },

  /**
   * Exclui uma faixa/graduação do Supabase.
   */
  async deleteBeltRank(tenantId: string, id: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId) || !isValidUUID(id)) {
      throw new Error('tenantId e id devem ser UUIDs válidos.');
    }

    const { error } = await supabase
      .from('belt_ranks')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Erro ao excluir faixa no Supabase:', error);
      throw new Error(`Erro ao excluir graduação: ${error.message}`);
    }
  },

  /**
   * Reordena as faixas de uma arte marcial atualizando seu order_index progressivo.
   * Tenta primeiro a função RPC atômica reorder_belt_ranks e faz fallback seguro para updates individuais.
   */
  async reorderBeltRanks(tenantId: string, martialArtId: string, orderedBeltIds: string[]): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }
    if (!isValidUUID(tenantId) || !isValidUUID(martialArtId)) {
      throw new Error('tenantId e martialArtId devem ser UUIDs válidos.');
    }

    // 1. Tentar via RPC atômica
    try {
      const { error: rpcError } = await supabase.rpc('reorder_belt_ranks', {
        p_tenant_id: tenantId,
        p_martial_art_id: martialArtId,
        p_ordered_belt_ids: orderedBeltIds,
      });

      if (!rpcError) {
        return;
      }
    } catch {
      // Se a função RPC ainda não foi aplicada na migration, prosseguir para fallback
    }

    // 2. Fallback: update individual em paralelo/sequencial
    for (let index = 0; index < orderedBeltIds.length; index++) {
      const beltId = orderedBeltIds[index];
      await supabase
        .from('belt_ranks')
        .update({ order_index: index + 1 })
        .eq('id', beltId)
        .eq('tenant_id', tenantId)
        .eq('martial_art_id', martialArtId);
    }
  },

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

        // Buscar graduações do aluno no Supabase ordenadas pela mais recente
        // Agrupar a graduação mais recente por modalidade (suporte a múltiplas artes marciais)
        const latestByArt = new Map<string, any>();
        (graduationsData || [])
          .filter((g: any) => g.student_id === row.id)
          .sort((a: any, b: any) => new Date(b.graduated_at || 0).getTime() - new Date(a.graduated_at || 0).getTime())
          .forEach((g: any) => {
            if (!latestByArt.has(g.martial_art_id)) {
              latestByArt.set(g.martial_art_id, {
                martialArtId: g.martial_art_id,
                martialArtName: g.martial_art?.name || 'Arte Marcial',
                beltId: g.belt_rank_id,
                beltName: g.belt_rank?.name || 'Faixa Cadastrada',
                beltColorHex: g.belt_rank?.color_hex || '#ffffff',
                graduatedAt: g.graduated_at || row.enrollment_date,
              });
            }
          });
        const studentGrads = Array.from(latestByArt.values());

        return {
          id: row.id,
          tenantId: row.tenant_id,
          branchId: row.branch_id,
          personId: row.person_id,
          registrationNumber: row.registration_number,
          enrollmentDate: row.enrollment_date,
          status: row.status,
          currentGraduations: studentGrads,
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

    let graduationPayload: any = null;
    if (payload.martialArtId && payload.beltRankId) {
      if (!isValidUUID(payload.martialArtId) || !isValidUUID(payload.beltRankId)) {
        throw new Error('A modalidade ou faixa selecionada deve ser um UUID válido no Supabase.');
      }

      // Validar que a modalidade pertence à academia ativa e está ativa
      const { data: validArt, error: artErr } = await supabase
        .from('martial_arts')
        .select('id, name')
        .eq('id', payload.martialArtId)
        .eq('tenant_id', payload.tenantId)
        .eq('status', 'active')
        .maybeSingle();

      if (artErr || !validArt) {
        throw new Error('A modalidade selecionada não pertence à academia ativa ou não está ativa.');
      }

      // Validar que a faixa pertence à mesma academia e modalidade
      const { data: validBelt, error: beltErr } = await supabase
        .from('belt_ranks')
        .select('id, name, color_hex')
        .eq('id', payload.beltRankId)
        .eq('tenant_id', payload.tenantId)
        .eq('martial_art_id', payload.martialArtId)
        .maybeSingle();

      if (beltErr || !validBelt) {
        throw new Error('A graduação selecionada não pertence à modalidade ou à academia ativa.');
      }

      graduationPayload = {
        martial_art_id: payload.martialArtId,
        belt_rank_id: payload.beltRankId,
        graduated_at: new Date().toISOString().split('T')[0],
        examiner_name: 'Sensei Responsável',
        notes: 'Graduação inicial no ato da matrícula',
      };
    }

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

  /**
   * Atualiza dados de um aluno existente no Supabase.
   * Modifica `persons`, `students`, e `guardian_relationships` preservando integridade e RLS.
   */
  async updateStudent(payload: UpdateStudentPayload): Promise<StudentServiceResult> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado');
    }

    if (!isValidUUID(payload.tenantId)) {
      throw new Error('ID da academia (tenant_id) deve ser um UUID válido no Supabase.');
    }

    if (!isValidUUID(payload.studentId) || !isValidUUID(payload.personId)) {
      throw new Error('Identificadores de aluno ou pessoa física inválidos.');
    }

    // 1. Atualizar registro na tabela persons
    const personAddress = {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: payload.city || 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
    };

    const { data: updatedPerson, error: personError } = await supabase
      .from('persons')
      .update({
        full_name: payload.fullName.trim(),
        social_name: payload.socialName?.trim() || null,
        cpf: payload.cpf?.trim() || null,
        birth_date: payload.birthDate,
        gender: payload.gender || 'male',
        phone: payload.phone?.trim() || null,
        email: payload.email?.trim() || null,
        address: personAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.personId)
      .eq('tenant_id', payload.tenantId)
      .select()
      .single();

    if (personError) {
      throw new Error(`Erro ao atualizar dados pessoais do aluno: ${personError.message}`);
    }

    if (!updatedPerson) {
      throw new Error('Nenhum registro de pessoa localizado para atualização ou permissão negada.');
    }

    // 2. Atualizar registro na tabela students
    const { data: updatedStudentData, error: studentError } = await supabase
      .from('students')
      .update({
        monthly_fee: payload.monthlyFee,
        status: payload.status || 'active',
        branch_id: payload.branchId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.studentId)
      .eq('tenant_id', payload.tenantId)
      .select()
      .single();

    if (studentError) {
      throw new Error(`Erro ao atualizar matrícula do aluno: ${studentError.message}`);
    }

    if (!updatedStudentData) {
      throw new Error('Nenhum registro de aluno localizado para atualização ou permissão negada.');
    }

    // 3. Atualizar ou Vincular Responsável Legal / Financeiro
    let resultGuardianPerson: Person | undefined = undefined;
    let resultRelationship: GuardianRelationship | undefined = undefined;

    if (payload.hasGuardian && payload.guardianName?.trim()) {
      if (payload.guardianPersonId && isValidUUID(payload.guardianPersonId)) {
        // Atualizar responsável existente
        const { data: gpData } = await supabase
          .from('persons')
          .update({
            full_name: payload.guardianName.trim(),
            cpf: payload.guardianCpf?.trim() || null,
            phone: payload.guardianPhone?.trim() || null,
            email: payload.guardianEmail?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.guardianPersonId)
          .eq('tenant_id', payload.tenantId)
          .select()
          .single();

        if (gpData) {
          resultGuardianPerson = {
            id: gpData.id,
            tenantId: gpData.tenant_id,
            fullName: gpData.full_name,
            cpf: gpData.cpf || '',
            birthDate: gpData.birth_date,
            gender: gpData.gender,
            phone: gpData.phone || '',
            email: gpData.email || '',
            address: gpData.address || {},
            createdAt: gpData.created_at,
          };
        }

        if (payload.guardianRelId && isValidUUID(payload.guardianRelId)) {
          const { data: grData } = await supabase
            .from('guardian_relationships')
            .update({
              relationship_label: payload.relationshipType || 'Responsável',
            })
            .eq('id', payload.guardianRelId)
            .eq('tenant_id', payload.tenantId)
            .select()
            .single();

          if (grData && resultGuardianPerson) {
            resultRelationship = {
              id: grData.id,
              tenantId: grData.tenant_id,
              studentId: payload.studentId,
              guardianPersonId: resultGuardianPerson.id,
              relationshipLabel: grData.relationship_label,
              isLegalGuardian: grData.is_legal_guardian,
              isFinancialGuardian: grData.is_financial_guardian,
              isEmergencyContact: grData.is_emergency_contact,
              isPickupAuthorized: grData.is_pickup_authorized,
            };
          }
        }
      } else {
        // Inserir novo responsável para este aluno
        const { data: newGp } = await supabase
          .from('persons')
          .insert({
            tenant_id: payload.tenantId,
            full_name: payload.guardianName.trim(),
            cpf: payload.guardianCpf?.trim() || null,
            birth_date: '1985-01-01',
            gender: 'other',
            phone: payload.guardianPhone?.trim() || null,
            email: payload.guardianEmail?.trim() || 'responsavel@tatamehub.com.br',
            address: personAddress,
          })
          .select()
          .single();

        if (newGp) {
          resultGuardianPerson = {
            id: newGp.id,
            tenantId: newGp.tenant_id,
            fullName: newGp.full_name,
            cpf: newGp.cpf || '',
            birthDate: newGp.birth_date,
            gender: newGp.gender,
            phone: newGp.phone || '',
            email: newGp.email || '',
            address: newGp.address || {},
            createdAt: newGp.created_at,
          };

          const { data: newGr } = await supabase
            .from('guardian_relationships')
            .insert({
              tenant_id: payload.tenantId,
              student_id: payload.studentId,
              guardian_person_id: newGp.id,
              relationship_label: payload.relationshipType || 'Responsável',
              is_legal_guardian: true,
              is_financial_guardian: true,
              is_emergency_contact: true,
              is_pickup_authorized: true,
            })
            .select()
            .single();

          if (newGr) {
            resultRelationship = {
              id: newGr.id,
              tenantId: newGr.tenant_id,
              studentId: payload.studentId,
              guardianPersonId: newGp.id,
              relationshipLabel: newGr.relationship_label,
              isLegalGuardian: newGr.is_legal_guardian,
              isFinancialGuardian: newGr.is_financial_guardian,
              isEmergencyContact: newGr.is_emergency_contact,
              isPickupAuthorized: newGr.is_pickup_authorized,
            };
          }
        }
      }
    }

    // 4. Se a graduação mudou e são UUIDs válidos

    // 4. Persistir a graduação do aluno no Supabase com validações estritas
    if (
      !isValidUUID(payload.martialArtId) ||
      !isValidUUID(payload.beltRankId)
    ) {
      throw new Error(
        'A modalidade ou graduação selecionada não possui um UUID válido no Supabase. ' +
        'Cadastre a modalidade e suas graduações no banco.'
      );
    }

    // 4.1. Validar que a modalidade pertence à academia ativa e está com status ativo
    const { data: validArt, error: artValError } = await supabase
      .from('martial_arts')
      .select('id, tenant_id, name, status')
      .eq('id', payload.martialArtId)
      .eq('tenant_id', payload.tenantId)
      .eq('status', 'active')
      .maybeSingle();

    if (artValError) {
      throw new Error('Erro ao validar modalidade no Supabase: ' + artValError.message);
    }
    if (!validArt) {
      throw new Error('A modalidade selecionada não pertence à academia ativa ou não está ativa.');
    }

    // 4.2. Validar que a graduação pertence à mesma academia e à modalidade selecionada
    const { data: validBelt, error: beltValError } = await supabase
      .from('belt_ranks')
      .select('id, tenant_id, martial_art_id, name, color_hex')
      .eq('id', payload.beltRankId)
      .eq('tenant_id', payload.tenantId)
      .eq('martial_art_id', payload.martialArtId)
      .maybeSingle();

    if (beltValError) {
      throw new Error('Erro ao validar graduação no Supabase: ' + beltValError.message);
    }
    if (!validBelt) {
      throw new Error('A graduação selecionada não pertence à modalidade escolhida ou à academia ativa.');
    }

    // 4.3. Consultar a graduação mais recente do aluno especificamente para a modalidade selecionada
    const { data: existingGrads, error: fetchGradError } = await supabase
      .from('student_graduations')
      .select('id, martial_art_id, belt_rank_id, graduated_at')
      .eq('student_id', payload.studentId)
      .eq('tenant_id', payload.tenantId)
      .eq('martial_art_id', payload.martialArtId)
      .order('graduated_at', { ascending: false })
      .limit(1);

    if (fetchGradError) {
      throw new Error(
        'Erro ao consultar histórico de graduação: ' + fetchGradError.message
      );
    }

    const currentGradForModality = existingGrads?.[0];

    const graduationChanged =
      !currentGradForModality ||
      currentGradForModality.belt_rank_id !== payload.beltRankId;

    if (graduationChanged) {
      let rpcSucceeded = false;

      // Tentativa 1: Executar via função RPC atômica record_student_graduation (imune a inconsistências de RLS no cliente)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('record_student_graduation', {
          p_tenant_id: payload.tenantId,
          p_student_id: payload.studentId,
          p_martial_art_id: payload.martialArtId,
          p_belt_rank_id: payload.beltRankId,
          p_examiner_name: 'Atualização administrativa',
          p_notes: 'Graduação atualizada no cadastro do aluno',
        });

        if (!rpcError && rpcData?.id) {
          rpcSucceeded = true;
        } else if (rpcError) {
          const errMsg = rpcError.message || '';
          // Se a função não existe ainda no Supabase (código 42883 ou mensagem 'does not exist'), prosseguir para o fallback
          if (!errMsg.includes('does not exist') && !errMsg.includes('function') && rpcError.code !== '42883') {
            throw new Error('Falha ao registrar graduação via RPC: ' + errMsg);
          }
        }
      } catch (rpcErr: any) {
        const msg = rpcErr.message || '';
        if (!msg.includes('does not exist') && !msg.includes('function') && rpcErr.code !== '42883') {
          throw rpcErr;
        }
      }

      // Tentativa 2: Fallback para INSERT direto em student_graduations
      if (!rpcSucceeded) {
        const { data: insertData, error: saveGradError } = await supabase
          .from('student_graduations')
          .insert({
            tenant_id: payload.tenantId,
            student_id: payload.studentId,
            martial_art_id: payload.martialArtId,
            belt_rank_id: payload.beltRankId,
            graduated_at: new Date().toISOString().split('T')[0],
            examiner_name: 'Atualização administrativa',
            notes: 'Graduação atualizada no cadastro do aluno',
          })
          .select('id');

        if (saveGradError) {
          const isRlsError =
            saveGradError.code === '42501' ||
            saveGradError.message?.toLowerCase().includes('row-level security') ||
            saveGradError.message?.toLowerCase().includes('violates row-level security policy') ||
            saveGradError.message?.toLowerCase().includes('permission denied');

          if (isRlsError) {
            throw new Error(
              'Erro de Permissão (RLS) no Supabase: A tabela "student_graduations" bloqueou a gravação da graduação. ' +
              'Certifique-se de que seu usuário possui papel de staff ativo nesta academia e execute o script SQL da migration 07_student_graduations_rls_and_rpc.sql no SQL Editor do Supabase.'
            );
          }

          throw new Error('Erro ao salvar Faixa/Graduação no Supabase: ' + saveGradError.message);
        }
      }
    }

    // 4.4. Consultar todas as graduações vigentes do aluno (uma por modalidade) para manter o estado atualizado
    const { data: allStudentGrads } = await supabase
      .from('student_graduations')
      .select(`
        id,
        martial_art_id,
        belt_rank_id,
        graduated_at,
        martial_art:martial_arts (id, name),
        belt_rank:belt_ranks (id, name, color_hex)
      `)
      .eq('student_id', payload.studentId)
      .eq('tenant_id', payload.tenantId)
      .order('graduated_at', { ascending: false });

    const latestByArtMap = new Map<string, any>();
    // Garante que a recém-atualizada esteja presente
    latestByArtMap.set(payload.martialArtId, {
      martialArtId: payload.martialArtId,
      martialArtName: validArt.name,
      beltId: payload.beltRankId,
      beltName: validBelt.name,
      beltColorHex: validBelt.color_hex || '#ffffff',
      graduatedAt: new Date().toISOString().split('T')[0],
    });

    (allStudentGrads || []).forEach((g: any) => {
      if (!latestByArtMap.has(g.martial_art_id)) {
        latestByArtMap.set(g.martial_art_id, {
          martialArtId: g.martial_art_id,
          martialArtName: g.martial_art?.name || 'Arte Marcial',
          beltId: g.belt_rank_id,
          beltName: g.belt_rank?.name || 'Faixa',
          beltColorHex: g.belt_rank?.color_hex || '#ffffff',
          graduatedAt: g.graduated_at || new Date().toISOString().split('T')[0],
        });
      }
    });

    const finalCurrentGraduations = Array.from(latestByArtMap.values());

    // 5. Registrar log de auditoria
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;
      const currentUserId = currentSession?.user?.id;
      if (currentUserId) {
        await supabase.from('audit_logs').insert({
          tenant_id: payload.tenantId,
          user_id: currentUserId,
          user_name: currentSession.user.user_metadata?.full_name || 'Usuário',
          action: 'Atualização de Aluno',
          entity: 'Student',
          entity_id: payload.studentId,
          details: `Cadastro do aluno "${payload.fullName}" atualizado com sucesso.`,
        });
      }
    } catch (auditErr) {
      console.warn('Aviso: falha ao registrar audit log da edição:', auditErr);
    }

    const finalPerson: Person = {
      id: payload.personId,
      tenantId: payload.tenantId,
      fullName: payload.fullName.trim(),
      socialName: payload.socialName?.trim() || undefined,
      cpf: payload.cpf || '',
      birthDate: payload.birthDate,
      gender: payload.gender,
      phone: payload.phone || '',
      email: payload.email || '',
      address: updatedPerson.address || personAddress,
      createdAt: updatedPerson.created_at,
    };

    const finalStudent: Student = {
      id: payload.studentId,
      tenantId: payload.tenantId,
      branchId: payload.branchId,
      personId: payload.personId,
      registrationNumber: updatedStudentData.registration_number,
      enrollmentDate: updatedStudentData.enrollment_date,
      status: updatedStudentData.status,
      currentGraduations: finalCurrentGraduations,
      monthlyFee: Number(updatedStudentData.monthly_fee) || payload.monthlyFee,
      notes: updatedStudentData.notes || undefined,
    };

    return {
      student: finalStudent,
      person: finalPerson,
      guardianPerson: resultGuardianPerson,
      relationship: resultRelationship,
    };
  },
};
