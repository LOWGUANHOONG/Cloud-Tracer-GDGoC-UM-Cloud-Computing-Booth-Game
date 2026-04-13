const getNodeIdsByLabel = (nodes) => {
  const index = new Map();

  for (const node of nodes) {
    const label = node?.data?.label;
    if (!label) continue;
    if (!index.has(label)) index.set(label, []);
    index.get(label).push(node.id);
  }

  return index;
};

const hasDirectConnection = (edges, labelIndex, fromLabel, toLabel) => {
  const fromIds = new Set(labelIndex.get(fromLabel) || []);
  const toIds = new Set(labelIndex.get(toLabel) || []);

  return edges.some((edge) => fromIds.has(edge.source) && toIds.has(edge.target));
};

const hasPathByLabel = (nodes, edges, fromLabel, toLabel) => {
  const labelIndex = getNodeIdsByLabel(nodes);
  const fromIds = labelIndex.get(fromLabel) || [];
  const toIds = new Set(labelIndex.get(toLabel) || []);

  if (!fromIds.length || !toIds.size) return false;

  const adjacency = new Map();
  for (const node of nodes) adjacency.set(node.id, []);
  for (const edge of edges) {
    if (adjacency.has(edge.source)) adjacency.get(edge.source).push(edge.target);
  }

  const queue = [...fromIds];
  const visited = new Set(queue);

  while (queue.length) {
    const current = queue.shift();
    if (toIds.has(current)) return true;

    const neighbors = adjacency.get(current) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return false;
};

const countLabel = (nodes, label) => nodes.filter((node) => node?.data?.label === label).length;

export const levels = [
  {
    id: 1,
    code: 'L1',
    title: 'The Gateway',
    briefing: 'Route public ingress through a compute tier before touching data.',
    objective: 'Internet -> Web VM -> Cloud SQL. Direct Internet -> Cloud SQL is forbidden.',
    validate: (nodes, edges) => {
      const labelIndex = getNodeIdsByLabel(nodes);
      const hasRoute = hasPathByLabel(nodes, edges, 'Internet', 'Web VM') && hasPathByLabel(nodes, edges, 'Web VM', 'Cloud SQL');
      const forbidden = hasDirectConnection(edges, labelIndex, 'Internet', 'Cloud SQL');

      if (!hasRoute) {
        return { ok: false, message: 'Missing secure route. Build Internet -> Web VM -> Cloud SQL.' };
      }
      if (forbidden) {
        return { ok: false, message: 'Direct Internet -> Cloud SQL detected. Insert the VM hop.' };
      }
      return { ok: true, message: 'Gateway hardened. Traffic now lands safely on data.' };
    },
  },
  {
    id: 2,
    code: 'L2',
    title: 'The Elastic Bridge',
    briefing: 'Scale traffic handling based on demand spikes.',
    objective: 'Load Balancer -> MIG -> Autoscaler.',
    validate: (nodes, edges) => {
      const pass = hasPathByLabel(nodes, edges, 'Load Balancer', 'MIG') && hasPathByLabel(nodes, edges, 'MIG', 'Autoscaler');
      return pass
        ? { ok: true, message: 'Elastic bridge online. Autoscaler can now tune MIG capacity.' }
        : { ok: false, message: 'Expected flow not found: Load Balancer -> MIG -> Autoscaler.' };
    },
  },
  {
    id: 3,
    code: 'L3',
    title: 'Regional Blackout',
    briefing: 'Design for resilience when one region fails.',
    objective: 'Global LB must feed two distinct MIG nodes (regional split).',
    validate: (nodes, edges) => {
      const labelIndex = getNodeIdsByLabel(nodes);
      const globalLbIds = labelIndex.get('Global LB') || [];
      const migIds = new Set(labelIndex.get('MIG') || []);

      if (migIds.size < 2) {
        return { ok: false, message: 'Place at least two MIG nodes to represent two regions.' };
      }

      const reachedMigTargets = new Set();
      for (const edge of edges) {
        if (globalLbIds.includes(edge.source) && migIds.has(edge.target)) reachedMigTargets.add(edge.target);
      }

      return reachedMigTargets.size >= 2
        ? { ok: true, message: 'Regional redundancy achieved. Global LB fans out correctly.' }
        : { ok: false, message: 'Global LB must connect directly to two separate MIG nodes.' };
    },
  },
  {
    id: 4,
    code: 'L4',
    title: 'Speed of Light',
    briefing: 'Accelerate static delivery with edge caching.',
    objective: 'User -> Load Balancer -> Cloud CDN -> Cloud Storage.',
    validate: (nodes, edges) => {
      const pass =
        hasPathByLabel(nodes, edges, 'User', 'Load Balancer') &&
        hasPathByLabel(nodes, edges, 'Load Balancer', 'Cloud CDN') &&
        hasPathByLabel(nodes, edges, 'Cloud CDN', 'Cloud Storage');

      return pass
        ? { ok: true, message: 'Edge delivery optimized. Static assets now ride the CDN path.' }
        : { ok: false, message: 'Build the chain: User -> Load Balancer -> Cloud CDN -> Cloud Storage.' };
    },
  },
  {
    id: 5,
    code: 'L5',
    title: 'The Intruder',
    briefing: 'Filter malicious traffic before entry.',
    objective: 'Internet -> Cloud Armor -> Load Balancer (direct Internet -> LB blocked).',
    validate: (nodes, edges) => {
      const labelIndex = getNodeIdsByLabel(nodes);
      const pass = hasPathByLabel(nodes, edges, 'Internet', 'Cloud Armor') && hasPathByLabel(nodes, edges, 'Cloud Armor', 'Load Balancer');
      const direct = hasDirectConnection(edges, labelIndex, 'Internet', 'Load Balancer');

      if (!pass) {
        return { ok: false, message: 'You need Cloud Armor between Internet and the Load Balancer.' };
      }
      if (direct) {
        return { ok: false, message: 'Direct Internet -> Load Balancer bypasses Cloud Armor.' };
      }
      return { ok: true, message: 'Intrusion guard active. Armor now fronts ingress.' };
    },
  },
  {
    id: 6,
    code: 'L6',
    title: 'Budget Squeezer',
    briefing: 'Automate low-cost workloads with timed execution.',
    objective: 'Cloud Scheduler -> Cloud Function -> Spot VM.',
    validate: (nodes, edges) => {
      const pass = hasPathByLabel(nodes, edges, 'Cloud Scheduler', 'Cloud Function') && hasPathByLabel(nodes, edges, 'Cloud Function', 'Spot VM');
      return pass
        ? { ok: true, message: 'Cost saver unlocked. Scheduler now dispatches Spot VM workload.' }
        : { ok: false, message: 'Expected chain missing: Cloud Scheduler -> Cloud Function -> Spot VM.' };
    },
  },
  {
    id: 7,
    code: 'L7',
    title: 'Silent Killer',
    briefing: 'Use identity boundaries to secure storage access.',
    objective: 'Web VM -> Service Account -> IAM Role -> Cloud Storage.',
    validate: (nodes, edges) => {
      const pass =
        hasPathByLabel(nodes, edges, 'Web VM', 'Service Account') &&
        hasPathByLabel(nodes, edges, 'Service Account', 'IAM Role') &&
        hasPathByLabel(nodes, edges, 'IAM Role', 'Cloud Storage');

      return pass
        ? { ok: true, message: 'Identity chain complete. Principle of least privilege enforced.' }
        : { ok: false, message: 'Wire identity flow: Web VM -> Service Account -> IAM Role -> Cloud Storage.' };
    },
  },
];

export const validateLevel = (level, nodes, edges) => {
  if (!level?.validate) return { ok: false, message: 'Level validator missing.' };
  if (!nodes.length) return { ok: false, message: 'Canvas is empty. Drag components onto the workspace.' };

  return level.validate(nodes, edges);
};

export const getLevelProgress = (currentIndex) => `${currentIndex + 1}/${levels.length}`;

export const summarizeLevelInventory = (nodes) => {
  const summary = nodes.reduce((acc, node) => {
    const label = node?.data?.label;
    if (!label) return acc;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(summary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, qty]) => `${label} x${qty}`)
    .join(', ');
};

export const isFinalLevel = (currentIndex) => currentIndex === levels.length - 1;

export const hasMultiMIG = (nodes) => countLabel(nodes, 'MIG') > 1;
