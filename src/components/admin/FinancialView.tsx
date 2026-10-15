import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  QrCode,
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  Printer,
  X,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import { Invoice, Student, Person, Tenant } from '../../types';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

interface FinancialViewProps {
  tenant: Tenant;
  invoices: Invoice[];
  students: Student[];
  persons: Person[];
  onSettleInvoice: (invoiceId: string, method: Invoice['paymentMethod'], amount: number) => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  tenant,
  invoices,
  students,
  persons,
  onSettleInvoice,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceForPix, setSelectedInvoiceForPix] = useState<Invoice | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);
  const [settlingInvoice, setSettlingInvoice] = useState<Invoice | null>(null);
  const [settleMethod, setSettleMethod] = useState<'pix' | 'cash' | 'credit_card' | 'boleto'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const student = students.find(s => s.id === inv.studentId);
    const person = student ? persons.find(p => p.id === student.personId) : null;
    const nameMatch = person ? person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const compMatch = inv.competence.includes(searchTerm);

    const matchesSearch = nameMatch || compMatch;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.finalAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((acc, i) => acc + i.balance, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.balance, 0);

  const getStudentAndPerson = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const person = student ? persons.find(p => p.id === student.personId) : null;
    return { student, person };
  };

  const handleCopyPix = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleConfirmSettle = () => {
    if (!settlingInvoice) return;
    onSettleInvoice(settlingInvoice.id, settleMethod, settlingInvoice.finalAmount);
    setSettlingInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gestão Financeira de Mensalidades</h2>
          <p className="text-xs text-slate-400">
            Controle de cobranças, baixa manual de recebimentos, geração de PIX e recibos com desconto familiar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 p-2 rounded-lg bg-slate-900 border border-slate-800">
            Regra Ativa: <span className="text-emerald-400 font-semibold">{tenant.settings.familyDiscount2ndMember}% Desconto Familiar</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-1">Total Previsto</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">{formatCurrencyBRL(totalInvoiced)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{invoices.length} cobranças geradas</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-1">Total Recebido</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{formatCurrencyBRL(totalPaid)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Liquidações confirmadas</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-1">Total Pendente (No Prazo)</div>
          <div className="text-2xl font-bold text-blue-400 font-mono tabular-nums">{formatCurrencyBRL(totalPending)}</div>
          <div className="text-[11px] text-slate-500 mt-1">A vencer</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-1">Total Vencido / Em Atraso</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{formatCurrencyBRL(totalOverdue)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Cobrança e notificações automáticas</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do aluno ou competência (ex: 10/2026)..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
              statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
              statusFilter === 'pending' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
              statusFilter === 'overdue' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vencidas
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
              statusFilter === 'paid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pagas
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Aluno / Beneficiário</th>
                <th className="py-3 px-4">Competência</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Valor Original</th>
                <th className="py-3 px-4">Desconto</th>
                <th className="py-3 px-4">Valor Final</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map((inv) => {
                const { student, person } = getStudentAndPerson(inv.studentId);
                const isPaid = inv.status === 'paid';
                const isOverdue = inv.status === 'overdue';

                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{person?.fullName || 'Aluno'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Matrícula: {student?.registrationNumber}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                      {inv.competence}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                      {formatDateBR(inv.dueDate)}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400">
                      {formatCurrencyBRL(inv.originalAmount)}
                    </td>

                    <td className="py-3 px-4">
                      {inv.discountAmount > 0 ? (
                        <div>
                          <span className="font-mono text-emerald-400 font-semibold">
                            -{formatCurrencyBRL(inv.discountAmount)}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[130px]" title={inv.discountDescription}>
                            {inv.discountDescription}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-white">
                      {formatCurrencyBRL(inv.finalAmount)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isPaid
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : isOverdue
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {isPaid ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isPaid && (
                          <>
                            <button
                              onClick={() => setSelectedInvoiceForPix(inv)}
                              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Ver QR Code PIX"
                            >
                              <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                            </button>
                            <button
                              onClick={() => setSettlingInvoice(inv)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-500 transition-colors shadow cursor-pointer whitespace-nowrap"
                            >
                              Baixa Manual
                            </button>
                          </>
                        )}

                        {isPaid && (
                          <button
                            onClick={() => setSelectedInvoiceForReceipt(inv)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Visualizar Recibo de Pagamento"
                          >
                            <FileText className="h-3.5 w-3.5 text-blue-400" />
                            <span>Recibo</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Baixa Manual */}
      {settlingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white mb-2">Confirmar Baixa Manual</h3>
            <p className="text-xs text-slate-400 mb-4">
              Registrar liquidação financeira desta mensalidade com registro de auditoria.
            </p>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 mb-4 text-xs space-y-1">
              <div>Valor a Baixar: <strong className="text-emerald-400 font-mono text-sm">{formatCurrencyBRL(settlingInvoice.finalAmount)}</strong></div>
              <div>Competência: <span className="font-mono text-white">{settlingInvoice.competence}</span></div>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Forma de Pagamento</label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="pix">PIX (Chave ou QR Code)</option>
                  <option value="cash">Dinheiro em Espécie (Secretaria)</option>
                  <option value="credit_card">Cartão de Crédito / Débito (Maquininha)</option>
                  <option value="boleto">Boleto Bancário</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSettlingInvoice(null)}
                className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                className="px-4 py-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-500 shadow"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal PIX QR Code */}
      {selectedInvoiceForPix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200 text-center">
            <button
              onClick={() => setSelectedInvoiceForPix(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Cobrança Instantânea PIX</h3>
            <p className="text-xs text-slate-400 mb-4">
              Valor: <strong className="text-emerald-400 font-mono text-sm">{formatCurrencyBRL(selectedInvoiceForPix.finalAmount)}</strong>
            </p>

            {/* Simulated PIX QR display */}
            <div className="mx-auto w-48 h-48 bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow mb-4">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-950 rounded">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      i % 2 === 0 || i % 7 === 0 ? 'bg-white' : 'bg-transparent'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 break-all text-left mb-4 font-mono">
              {selectedInvoiceForPix.pixCode || '00020126580014br.gov.bcb.pix0136...'}
            </div>

            <button
              onClick={() => handleCopyPix(selectedInvoiceForPix.pixCode)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 font-semibold text-white text-xs hover:bg-emerald-500 transition-colors shadow cursor-pointer"
            >
              {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedPix ? 'Copiado para a Área de Transferência!' : 'Copiar Chave Copia e Cola'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Recibo Formal de Pagamento */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200">
            <button
              onClick={() => setSelectedInvoiceForReceipt(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border border-slate-700 rounded-xl p-5 bg-white text-slate-950 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                <div>
                  <h4 className="font-bold text-base tracking-tight text-slate-900">{tenant.tradeName}</h4>
                  <div className="text-[11px] text-slate-600">CNPJ: {tenant.cnpjOrCpf}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-700 uppercase">Recibo de Quitação</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedInvoiceForReceipt.receiptNumber || 'REC-2026-001'}</div>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-800">
                <p>
                  Recebemos de <strong>{getStudentAndPerson(selectedInvoiceForReceipt.studentId).person?.fullName}</strong> a quantia de:
                </p>
                <div className="p-2.5 bg-slate-100 rounded-lg font-mono font-bold text-slate-900 text-sm">
                  {formatCurrencyBRL(selectedInvoiceForReceipt.paidAmount)}
                </div>
                <p className="text-[11px] text-slate-600">
                  Referente à mensalidade da competência <strong>{selectedInvoiceForReceipt.competence}</strong> de práticas de artes marciais.
                </p>
                <div className="text-[11px] text-slate-600 pt-1">
                  Data do Pagamento: {formatDateBR(selectedInvoiceForReceipt.paymentDate || selectedInvoiceForReceipt.dueDate)}
                  <br />
                  Meio: {selectedInvoiceForReceipt.paymentMethod?.toUpperCase() || 'PIX'}
                </div>
              </div>

              <div className="border-t border-slate-300 pt-3 flex items-center justify-between text-[10px] text-slate-500">
                <span>Autenticação Digital: {tenant.id.toUpperCase()}-{selectedInvoiceForReceipt.id}</span>
                <span>São Paulo/SP</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedInvoiceForReceipt(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
