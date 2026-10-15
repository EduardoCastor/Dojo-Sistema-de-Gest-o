import React from 'react';
import { Download, FileSpreadsheet, Users, DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';
import { Student, Person, Invoice, AttendanceRecord, BeltRank } from '../../types';
import { formatDateBR, formatCurrencyBRL, calculateAge } from '../../utils/formatters';

interface ReportsViewProps {
  students: Student[];
  persons: Person[];
  invoices: Invoice[];
  attendances: AttendanceRecord[];
  belts: BeltRank[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  persons,
  invoices,
  attendances,
  belts,
}) => {
  // Download CSV helper
  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStudentsCSV = () => {
    let csv = 'Matricula;Nome Completo;CPF;Idade;Data Nascimento;Faixa Atual;Mensalidade (BRL);Situacao\n';
    students.forEach((s) => {
      const person = persons.find(p => p.id === s.personId);
      const age = person ? calculateAge(person.birthDate) : 0;
      const belt = s.currentGraduations[0]?.beltName || 'Iniciante';
      csv += `"${s.registrationNumber}";"${person?.fullName || ''}";"${person?.cpf || ''}";"${age}";"${formatDateBR(person?.birthDate)}";"${belt}";"${s.monthlyFee}";"${s.status === 'active' ? 'Ativo' : 'Inativo'}"\n`;
    });
    downloadCSV(`relatorio_alunos_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const exportFinancialCSV = () => {
    let csv = 'ID Cobranca;Aluno;Competencia;Data Vencimento;Valor Final (BRL);Valor Pago (BRL);Saldo Devedor;Situacao;Meio Pagamento\n';
    invoices.forEach((inv) => {
      const student = students.find(s => s.id === inv.studentId);
      const person = student ? persons.find(p => p.id === student.personId) : null;
      csv += `"${inv.id}";"${person?.fullName || ''}";"${inv.competence}";"${formatDateBR(inv.dueDate)}";"${inv.finalAmount}";"${inv.paidAmount}";"${inv.balance}";"${inv.status}";"${inv.paymentMethod || '-'}"\n`;
    });
    downloadCSV(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const exportAttendanceCSV = () => {
    let csv = 'Data;Aluno;Matricula;Status Frequencia;Professor Responsavel;Observacoes\n';
    attendances.forEach((att) => {
      const student = students.find(s => s.id === att.studentId);
      const person = student ? persons.find(p => p.id === student.personId) : null;
      const statusLabel = att.status === 'present' ? 'Presente' : att.status === 'excused' ? 'Justificada' : 'Falta';
      csv += `"${formatDateBR(att.date)}";"${person?.fullName || ''}";"${student?.registrationNumber || ''}";"${statusLabel}";"${att.recordedByUserName}";"${att.notes || ''}"\n`;
    });
    downloadCSV(`relatorio_frequencia_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  // Belt distribution stats
  const beltCounts: Record<string, number> = {};
  students.forEach((s) => {
    const beltName = s.currentGraduations[0]?.beltName || 'Faixa Branca';
    beltCounts[beltName] = (beltCounts[beltName] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Relatórios & Indicadores Gerenciais</h2>
        <p className="text-xs text-slate-400">
          Exportação de planilhas em formato CSV estruturado e consolidação de indicadores técnicos e financeiros.
        </p>
      </div>

      {/* CSV Export Options Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
              <Users className="h-4 w-4 text-red-500" />
              <span>Base Completa de Alunos</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Exporta cadastros com idade, data de nascimento, graduação atual, matrícula e mensalidade contratada.
            </p>
          </div>
          <button
            onClick={exportStudentsCSV}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar Planilha (CSV)</span>
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Livro Financeiro & Inadimplência</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Exporta competências, datas de vencimento, pagamentos confirmados, descontos concedidos e pendências.
            </p>
          </div>
          <button
            onClick={exportFinancialCSV}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar Planilha (CSV)</span>
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>Histórico de Frequência</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Exporta todos os registros de chamadas realizadas no tatami pelos professores com faltas e justificativas.
            </p>
          </div>
          <button
            onClick={exportAttendanceCSV}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar Planilha (CSV)</span>
          </button>
        </div>
      </div>

      {/* Visual Indicator Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Belt distribution */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span>Distribuição de Alunos por Faixa / Nível</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(beltCounts).map(([beltName, count]) => {
              const percentage = Math.round((count / students.length) * 100);
              return (
                <div key={beltName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{beltName}</span>
                    <span className="text-slate-400 font-mono">{count} aluno(s) ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial collection rate */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span>Resumo de Cobranças por Competência</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Competência 10/2026 (Outubro)</div>
                <div className="text-[11px] text-slate-400">Total gerado de mensalidades</div>
              </div>
              <div className="text-right font-mono">
                <div className="font-bold text-white">{formatCurrencyBRL(invoices.reduce((a, b) => a + b.finalAmount, 0))}</div>
                <div className="text-[10px] text-emerald-400">
                  {Math.round((invoices.filter(i => i.status === 'paid').length / (invoices.length || 1)) * 100)}% quitadas
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Descontos Familiares Aplicados</div>
                <div className="text-[11px] text-slate-400">Economia repassada a irmãos matriculados</div>
              </div>
              <div className="text-right font-mono font-bold text-emerald-400">
                {formatCurrencyBRL(invoices.reduce((a, b) => a + b.discountAmount, 0))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Fuso Horário Operacional</div>
                <div className="text-[11px] text-slate-400">Configuração de relógio e chamadas</div>
              </div>
              <div className="text-right font-mono text-slate-300">
                America/Sao_Paulo (UTC-3)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
