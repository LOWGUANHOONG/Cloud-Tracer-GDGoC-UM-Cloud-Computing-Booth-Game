import { Handle, Position } from '@xyflow/react';

const categoryStyles = {
  Compute: 'border-sky-400/40 bg-sky-500/20 text-sky-100',
  Network: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
  Security: 'border-rose-400/40 bg-rose-500/20 text-rose-100',
  Storage: 'border-amber-400/40 bg-amber-500/20 text-amber-100',
  Tools: 'border-violet-400/40 bg-violet-500/20 text-violet-100',
};

const templateVmSlotStyles = {
  'Web VM': 'border-sky-400/60 bg-gradient-to-r from-sky-500/45 to-blue-400/15 text-sky-100',
  'Spot VM': 'border-cyan-400/60 bg-gradient-to-r from-cyan-500/45 to-sky-400/15 text-cyan-100',
};

export function GcpNode({ id, data }) {
  const categoryClass = categoryStyles[data.category] || 'border-slate-500/40 bg-slate-600/20 text-slate-100';
  const isInstanceTemplate = data.label === 'Instance Template';
  const slotClass =
    templateVmSlotStyles[data.templateVm] ||
    'border-slate-500/70 bg-slate-950/60 text-slate-300';

  const onTemplateDragOver = (event) => {
    if (!isInstanceTemplate) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  };

  const onTemplateDrop = (event) => {
    if (!isInstanceTemplate) return;
    event.preventDefault();
    event.stopPropagation();

    const payload = event.dataTransfer.getData('application/cloudtracer-node');
    if (!payload) return;

    const droppedTemplate = JSON.parse(payload);
    const vmChoices = new Set(['Web VM', 'Spot VM']);
    if (!vmChoices.has(droppedTemplate.type)) return;
    if (typeof data.onAttachVmToTemplate !== 'function') return;

    data.onAttachVmToTemplate(data.nodeId || id, droppedTemplate.type);
  };

  return (
    <div className="min-w-[150px] rounded-xl border border-slate-600/70 bg-slate-900/90 px-2.5 py-2 shadow-lg">
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-slate-900 !bg-sky-400" />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-100">{data.label}</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${categoryClass}`}>
          {data.category}
        </span>
      </div>

      {isInstanceTemplate && (
        <div
          onDragOver={onTemplateDragOver}
          onDrop={onTemplateDrop}
          className={`mt-2 rounded-md border border-dashed px-2 py-2 text-[11px] ${slotClass}`}
        >
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Template VM Slot</p>
          <p className="mt-1 font-medium text-slate-100">{data.templateVm || 'Drop Web VM or Spot VM here'}</p>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-slate-900 !bg-cyan-300" />
    </div>
  );
}

export const nodeTypes = {
  gcpNode: GcpNode,
};
