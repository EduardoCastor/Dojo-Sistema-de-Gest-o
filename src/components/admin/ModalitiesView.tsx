import React, { useState } from 'react';
import { Award, Plus, Edit2, Trash2, Check, Shield } from 'lucide-react';
import { MartialArt, BeltRank } from '../../types';

interface ModalitiesViewProps {
  martialArts: MartialArt[];
  beltRanks: BeltRank[];
  onAddBeltRank: (rank: BeltRank) => void;
  onAddMartialArt: (art: MartialArt) => void;
}

export const ModalitiesView: React.FC<ModalitiesViewProps> = ({
  martialArts,
  beltRanks,
  onAddBeltRank,
  onAddMartialArt,
}) => {
  const [selectedArtId, setSelectedArtId] = useState<string>(martialArts[0]?.id || 'art-judo');
  const [isAddBeltOpen, setIsAddBeltOpen] = useState(false);

  // New Belt state
  const [newBeltName, setNewBeltName] = useState('');
  const [newBeltColor, setNewBeltColor] = useState('#2563eb');
  const [newMinAge, setNewMinAge] = useState(8);
  const [newMinMonths, setNewMinMonths] = useState(10);
  const [newRequirements, setNewRequirements] = useState('');

  const activeArt: MartialArt = martialArts.find(m => m.id === selectedArtId) || martialArts[0] || {
    id: 'art-judo',
    tenantId: 'tenant-kodokan',
    name: 'Judô',
    description: 'Caminho Suave',
    active: true,
  };
  const artBelts = beltRanks
    .filter(b => b.martialArtId === selectedArtId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const handleCreateBelt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeltName.trim()) return;

    const rank: BeltRank = {
      id: `rank-${Date.now()}`,
      tenantId: activeArt.tenantId || 'tenant-kodokan',
      martialArtId: selectedArtId,
      name: newBeltName,
      rankType: 'faixa',
      orderIndex: artBelts.length + 1,
      colorHex: newBeltColor,
      minAgeYears: Number(newMinAge),
      minPracticeMonths: Number(newMinMonths),
      technicalRequirements: newRequirements || 'Técnicas e kyu compatíveis.',
      requiresExam: true,
    };

    onAddBeltRank(rank);
    setNewBeltName('');
    setNewRequirements('');
    setIsAddBeltOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Modalidades & Sistema de Graduações</h2>
          <p className="text-xs text-slate-400">
            Cadastre modalidades e parametrize os critérios de faixas, dans, carências e idades mínimas.
          </p>
        </div>

        <button
          onClick={() => setIsAddBeltOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors shadow cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Graduação / Faixa</span>
        </button>
      </div>

      {/* Modality Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {martialArts.map((art) => (
          <button
            key={art.id}
            onClick={() => setSelectedArtId(art.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedArtId === art.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>{art.name}</span>
          </button>
        ))}
      </div>

      {/* Active Modality Info */}
      {activeArt && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-bold text-white text-sm">{activeArt.name}</div>
            <div className="text-slate-400 mt-0.5">{activeArt.description}</div>
            <div className="text-slate-500 text-[11px] mt-1">Origem: {activeArt.origin} · {activeArt.governingFederation}</div>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-[11px]">
            {artBelts.length} Graduações Cadastradas
          </span>
        </div>
      )}

      {/* Belt Sequence Timeline / Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4 text-red-500" />
            <span>Sequência Progressiva de Faixas ({activeArt?.name})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Ordenação por nível técnico e maturidade</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-14">Ordem</th>
                <th className="py-3 px-4">Faixa / Graduação</th>
                <th className="py-3 px-4">Idade Mínima</th>
                <th className="py-3 px-4">Carência Mínima</th>
                <th className="py-3 px-4">Exige Exame?</th>
                <th className="py-3 px-4">Requisitos Técnicos (Kata / Waza)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {artBelts.map((b, index) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">
                    #{index + 1}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-4 w-4 rounded-full border border-slate-500 shadow-sm shrink-0"
                        style={{ backgroundColor: b.colorHex }}
                      ></span>
                      <span className="font-bold text-white">{b.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    {b.minAgeYears} anos
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    {b.minPracticeMonths === 0 ? 'Iniciação' : `${b.minPracticeMonths} meses`}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        b.requiresExam
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {b.requiresExam ? 'Banca Examinadora' : 'Automática'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-400 max-w-md truncate" title={b.technicalRequirements}>
                    {b.technicalRequirements}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Belt Modal */}
      {isAddBeltOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white mb-3">Cadastrar Nova Graduação / Faixa</h3>

            <form onSubmit={handleCreateBelt} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome da Graduação *</label>
                <input
                  type="text"
                  required
                  value={newBeltName}
                  onChange={(e) => setNewBeltName(e.target.value)}
                  placeholder="Ex: Faixa Ponta Vermelha"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cor Representativa</label>
                  <input
                    type="color"
                    value={newBeltColor}
                    onChange={(e) => setNewBeltColor(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-700 bg-slate-800 p-1 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Idade Mínima (Anos)</label>
                  <input
                    type="number"
                    value={newMinAge}
                    onChange={(e) => setNewMinAge(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Carência Mínima (Meses de Treino)</label>
                <input
                  type="number"
                  value={newMinMonths}
                  onChange={(e) => setNewMinMonths(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Requisitos Técnicos / Golpes</label>
                <textarea
                  rows={3}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="Descreva as técnicas, katas e requisitos exigidos pela banca..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBeltOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-500"
                >
                  Salvar Graduação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
