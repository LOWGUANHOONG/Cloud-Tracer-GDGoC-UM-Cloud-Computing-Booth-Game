import { Handle, Position } from '@xyflow/react';

const categoryStyles = {
  Compute: 'border-sky-400/40 bg-sky-500/20 text-sky-100',
  Network: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
  Security: 'border-rose-400/40 bg-rose-500/20 text-rose-100',
  Storage: 'border-amber-400/40 bg-amber-500/20 text-amber-100',
  Tools: 'border-violet-400/40 bg-violet-500/20 text-violet-100',
};

export function GcpNode({ data }) {
  const categoryClass = categoryStyles[data.category] || 'border-slate-500/40 bg-slate-600/20 text-slate-100';

  return (
    <div className="min-w-[180px] rounded-xl border border-slate-600/70 bg-slate-900/90 px-3 py-2 shadow-lg">
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-slate-900 !bg-sky-400" />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-100">{data.label}</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${categoryClass}`}>
          {data.category}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">Drag links to build secure architecture flow.</p>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-slate-900 !bg-cyan-300" />
    </div>
  );
}

export const nodeTypes = {
  gcpNode: GcpNode,
};
