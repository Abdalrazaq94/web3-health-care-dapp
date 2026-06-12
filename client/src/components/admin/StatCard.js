
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

function StatCard({ title, value, icon, color, pulse = false, onClick }) {
  const palette = {
    orange: { card: 'bg-orange-50 border-orange-200 hover:border-orange-300', num: 'text-orange-600', label: 'text-orange-500', dot: 'bg-orange-400' },
    green:  { card: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300', num: 'text-emerald-600', label: 'text-emerald-500', dot: 'bg-emerald-400' },
    blue:   { card: 'bg-blue-50 border-blue-200 hover:border-blue-300', num: 'text-blue-600', label: 'text-blue-500', dot: 'bg-blue-400' },
    purple: { card: 'bg-purple-50 border-purple-200 hover:border-purple-300', num: 'text-purple-600', label: 'text-purple-500', dot: 'bg-purple-400' },
    cyan:   { card: 'bg-cyan-50 border-cyan-200 hover:border-cyan-300', num: 'text-cyan-600', label: 'text-cyan-500', dot: 'bg-cyan-400' },
    slate:  { card: 'bg-slate-50 border-slate-200 hover:border-slate-300', num: 'text-slate-600', label: 'text-slate-500', dot: 'bg-slate-400' },
  };
  const c = palette[color] || palette.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden border rounded-2xl p-5 transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5 select-none
        ${c.card} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* watermark */}
      <span className="absolute -right-2 -bottom-2 text-5xl opacity-[0.07] pointer-events-none select-none">
        {icon}
      </span>

      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {pulse && Number(value) > 0 && (
          <span className="relative flex h-2.5 w-2.5 mt-1">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${c.dot}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${c.dot}`} />
          </span>
        )}
      </div>

      <p className={`text-3xl font-black tabular-nums ${c.num}`}>{value ?? '—'}</p>
      <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${c.label}`}>{title}</p>
    </div>
  );
}

export default StatCard;    