const COMPONENT_GROUPS = [
  {
    title: 'Compute',
    items: [
      { type: 'Web VM', category: 'Compute', accent: 'from-sky-500/50 to-blue-400/10' },
      { type: 'Spot VM', category: 'Compute', accent: 'from-cyan-500/50 to-sky-400/10' },
      { type: 'MIG', category: 'Compute', accent: 'from-blue-500/50 to-indigo-400/10' },
      { type: 'Instance Template', category: 'Compute', accent: 'from-indigo-500/50 to-violet-400/10' },
      { type: 'Cloud Function', category: 'Compute', accent: 'from-teal-500/50 to-cyan-400/10' },
    ],
  },
  {
    title: 'Network',
    items: [
      { type: 'User', category: 'Network', accent: 'from-emerald-500/50 to-teal-400/10' },
      { type: 'Internet', category: 'Network', accent: 'from-emerald-500/50 to-blue-400/10' },
      { type: 'Load Balancer', category: 'Network', accent: 'from-blue-500/50 to-cyan-400/10' },
      { type: 'Global LB', category: 'Network', accent: 'from-blue-500/50 to-indigo-400/10' },
      { type: 'Cloud CDN', category: 'Network', accent: 'from-cyan-500/50 to-sky-400/10' },
    ],
  },
  {
    title: 'Security',
    items: [{ type: 'Cloud Armor', category: 'Security', accent: 'from-rose-500/50 to-orange-400/10' }],
  },
  {
    title: 'Storage',
    items: [
      { type: 'Cloud SQL', category: 'Storage', accent: 'from-amber-500/50 to-orange-400/10' },
      { type: 'Cloud Storage', category: 'Storage', accent: 'from-orange-500/50 to-yellow-400/10' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { type: 'Autoscaler', category: 'Tools', accent: 'from-fuchsia-500/50 to-pink-400/10' },
      { type: 'Cloud Scheduler', category: 'Tools', accent: 'from-purple-500/50 to-fuchsia-400/10' },
      { type: 'IAM Role', category: 'Tools', accent: 'from-violet-500/50 to-indigo-400/10' },
      { type: 'Service Account', category: 'Tools', accent: 'from-slate-500/50 to-zinc-400/10' },
    ],
  },
];

const onDragStart = (event, nodeTemplate) => {
  event.dataTransfer.setData('application/cloudtracer-node', JSON.stringify(nodeTemplate));
  event.dataTransfer.effectAllowed = 'move';
};

function Sidebar() {
  return (
    <aside className="glass-panel reveal-up w-80 rounded-2xl p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Component Library</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-100">Cloud Blocks</h2>
      </div>

      <div className="max-h-[78vh] space-y-4 overflow-y-auto pr-1">
        {COMPONENT_GROUPS.map((group, groupIndex) => (
          <section key={group.title} className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {String(groupIndex + 1).padStart(2, '0')} {group.title}
            </h3>

            <div className="space-y-2">
              {group.items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(event) => onDragStart(event, item)}
                  className={`cursor-grab rounded-lg border border-slate-600/50 bg-gradient-to-r ${item.accent} px-3 py-2 text-sm text-slate-100 transition hover:scale-[1.01] hover:border-sky-400/60 active:cursor-grabbing`}
                >
                  {item.type}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
