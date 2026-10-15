import React, { useState } from 'react';
import { Calendar, Plus, Users, Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { ClassGroup, Enrollment, MartialArt, User } from '../../types';
import { getDaysOfWeekLabels } from '../../utils/formatters';

interface ClassesViewProps {
  classes: ClassGroup[];
  enrollments: Enrollment[];
  martialArts: MartialArt[];
  instructors: User[];
  onOpenAttendance: (classGroup: ClassGroup) => void;
  onAddClass: (newClass: ClassGroup) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  enrollments,
  martialArts,
  instructors,
  onOpenAttendance,
  onAddClass,
}) => {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [name, setName] = useState('');
  const [martialArtId, setMartialArtId] = useState(martialArts[0]?.id || 'art-judo');
  const [instructorId, setInstructorId] = useState(instructors[0]?.id || 'user-instructor');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 3, 5]); // Seg, Qua, Sex
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [minAge, setMinAge] = useState(8);
  const [maxAge, setMaxAge] = useState(13);
  const [tatamiRoom, setTatamiRoom] = useState('Tatami Principal');

  const getEnrolledCount = (classId: string) => {
    return enrollments.filter(e => e.classGroupId === classId && e.status === 'active').length;
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenInstructor = instructors.find(i => i.id === instructorId);

    const newClass: ClassGroup = {
      id: `class-${Date.now()}`,
      tenantId: classes[0]?.tenantId || 'tenant-kodokan',
      branchId: classes[0]?.branchId || 'branch-matriz',
      martialArtId,
      name,
      headInstructorId: instructorId,
      headInstructorName: chosenInstructor?.name || 'Sensei Responsável',
      daysOfWeek,
      startTime,
      endTime,
      maxCapacity: Number(maxCapacity) || 20,
      minAge: Number(minAge) || 5,
      maxAge: maxAge ? Number(maxAge) : undefined,
      tatamiRoom: tatamiRoom || 'Tatami Principal',
      active: true,
    };

    onAddClass(newClass);
    setIsAddClassOpen(false);
    setName('');
  };

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Turmas, Horários & Capacidade</h2>
          <p className="text-xs text-slate-400">
            Grade de treinamentos com validação de conflitos de horário e controle de lotação do tatami.
          </p>
        </div>

        <button
          onClick={() => setIsAddClassOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors shadow cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Turma de Treino</span>
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const enrolled = getEnrolledCount(cls.id);
          const percent = Math.min(100, Math.round((enrolled / cls.maxCapacity) * 100));
          const isFull = enrolled >= cls.maxCapacity;

          return (
            <div
              key={cls.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-white">{cls.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isFull
                        ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isFull ? 'Turma Lotada' : `${cls.maxCapacity - enrolled} vagas livres`}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 my-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>{getDaysOfWeekLabels(cls.daysOfWeek)} · {cls.startTime} às {cls.endTime}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{cls.tatamiRoom}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>Prof. {cls.headInstructorName}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1">
                    Faixa etária: {cls.minAge} {cls.maxAge ? `a ${cls.maxAge}` : '+'} anos
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Ocupação do Tatami</span>
                    <span className="font-mono text-slate-200 font-semibold">{enrolled}/{cls.maxCapacity} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono">Anti-conflito OK</span>
                <button
                  onClick={() => onOpenAttendance(cls)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  Chamada da Turma
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Class Modal */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white mb-3">Cadastrar Nova Turma</h3>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome da Turma *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Judô Juvenil & Adultos (Noite)"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Arte Marcial</label>
                  <select
                    value={martialArtId}
                    onChange={(e) => setMartialArtId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  >
                    {martialArts.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Professor Responsável</label>
                  <select
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  >
                    {instructors.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Dias de Treino</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 1, label: 'Seg' },
                    { id: 2, label: 'Ter' },
                    { id: 3, label: 'Qua' },
                    { id: 4, label: 'Qui' },
                    { id: 5, label: 'Sex' },
                    { id: 6, label: 'Sáb' },
                  ].map(d => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleDay(d.id)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        daysOfWeek.includes(d.id)
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Horário Início</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Horário Término</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lotação Máx.</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Idade Mín.</label>
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Idade Máx.</label>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    placeholder="Livre"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Local / Tatami</label>
                <input
                  type="text"
                  value={tatamiRoom}
                  onChange={(e) => setTatamiRoom(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-500"
                >
                  Criar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
