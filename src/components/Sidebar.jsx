const COMPONENT_GROUPS = [
  {
    title: 'Compute',
    items: [
      {
        type: 'Web VM',
        category: 'Compute',
        accent: 'from-sky-500/50 to-blue-400/10',
        description:
          'Uses the Standard Provisioning Model, meaning it runs your website\'s code, processes user requests and stays powered on 24/7 with guaranteed reliability.',
      },
      {
        type: 'Spot VM',
        category: 'Compute',
        accent: 'from-cyan-500/50 to-sky-400/10',
        description: 'Highly discounted VM (60-91% off) that Google can reclaim at any time; perfect for cost-saving.',
      },
      {
        type: 'MIG',
        category: 'Compute',
        accent: 'from-blue-500/50 to-indigo-400/10',
        description: 'A group of identical VMs that acts as one unit; handles auto-healing, updates, and multi-zone scaling.',
      },
      {
        type: 'Instance Template',
        category: 'Compute',
        accent: 'from-indigo-500/50 to-violet-400/10',
        description: 'A global configuration file defining the blueprint of your VM (OS, RAM, Disk, and Boot Script).',
      },
      {
        type: 'Cloud Function',
        category: 'Compute',
        accent: 'from-teal-500/50 to-cyan-400/10',
        description: 'A serverless piece of code that runs in response to a trigger (e.g., resizing a MIG or moving data).',
      },
    ],
  },
  {
    title: 'Network',
    items: [
      {
        type: 'Internet',
        category: 'Network',
        accent: 'from-emerald-500/50 to-blue-400/10',
        description: 'Represents the global player or client sending a request to your system.',
      },
      {
        type: 'Global LB',
        label: 'Global HTTP(S) LB',
        category: 'Network',
        accent: 'from-blue-500/50 to-indigo-400/10',
        description: 'A global proxy that routes traffic to the closest healthy region based on the user\'s location.',
      },
      {
        type: 'Cloud CDN',
        category: 'Network',
        accent: 'from-cyan-500/50 to-sky-400/10',
        description: 'Stores copies of static files (images/videos) at the "Edge" to reduce lag for global users.',
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        type: 'Cloud Armor',
        category: 'Security',
        accent: 'from-rose-500/50 to-orange-400/10',
        description: 'Filters incoming traffic to block DDoS attacks and hackers (WAF) before they hit your servers.',
      },
    ],
  },
  {
    title: 'Storage',
    items: [
      {
        type: 'Cloud SQL',
        category: 'Storage',
        accent: 'from-amber-500/50 to-orange-400/10',
        description: 'A managed relational database (MySQL/PostgreSQL) that stores user data, high scores, and profiles.',
      },
      {
        type: 'Cloud Storage',
        category: 'Storage',
        accent: 'from-orange-500/50 to-yellow-400/10',
        description: 'A global "bucket" used to store massive amounts of static data like game assets, images, and videos.',
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        type: 'Autoscaler',
        category: 'Tools',
        accent: 'from-fuchsia-500/50 to-pink-400/10',
        description: 'Automatically adds or removes VMs in a MIG based on CPU load or traffic spikes.',
      },
      {
        type: 'Cloud Scheduler',
        category: 'Tools',
        accent: 'from-purple-500/50 to-fuchsia-400/10',
        description: 'A cron-job service that triggers actions (like turning off servers) at a specific time.',
      },
      {
        type: 'IAM Role',
        category: 'Tools',
        accent: 'from-violet-500/50 to-indigo-400/10',
        description: 'A set of permissions assigned to a Service Account that defines exactly what it is allowed to do.',
      },
      {
        type: 'Service Account',
        category: 'Tools',
        accent: 'from-slate-500/50 to-zinc-400/10',
        description: 'A special "Identity" for your software/VMs so they can talk to other GCP services without a password.',
      },
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
                  className={`group cursor-grab rounded-lg border border-slate-600/50 bg-gradient-to-r ${item.accent} px-3 py-2 text-sm text-slate-100 transition hover:scale-[1.01] hover:border-sky-400/60 active:cursor-grabbing`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{item.label || item.type}</span>
                    {item.description && (
                      <span className="max-h-0 overflow-hidden text-[11px] leading-snug text-slate-100/0 transition-all duration-200 group-hover:max-h-20 group-hover:text-slate-100/90">
                        {item.description}
                      </span>
                    )}
                  </div>
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
