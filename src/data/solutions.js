const createSolutionNode = (id, label, category, position, data = {}) => ({
  id,
  type: 'gcpNode',
  position,
  selected: false,
  data: {
    label,
    category,
    nodeId: id,
    ...data,
  },
});

const createSolutionEdge = (source, target) => ({
  id: `edge-${source}-${target}`,
  source,
  target,
  selected: false,
});

const LEVEL_SOLUTIONS = {
  L1: {
    nodes: [
      createSolutionNode('internet', 'Internet', 'Network', { x: 60, y: 90 }),
      createSolutionNode('web-vm', 'Web VM', 'Compute', { x: 380, y: 90 }),
      createSolutionNode('cloud-sql', 'Cloud SQL', 'Storage', { x: 720, y: 90 }),
    ],
    edges: [createSolutionEdge('internet', 'web-vm'), createSolutionEdge('web-vm', 'cloud-sql')],
  },
  L2: {
    nodes: [
      createSolutionNode('internet', 'Internet', 'Network', { x: 60, y: 180 }),
      createSolutionNode('mig', 'MIG', 'Compute', { x: 380, y: 180 }),
      createSolutionNode('cloud-sql', 'Cloud SQL', 'Storage', { x: 720, y: 180 }),
      createSolutionNode('autoscaler', 'Autoscaler', 'Tools', { x: 380, y: 20 }),
      createSolutionNode('instance-template', 'Instance Template', 'Compute', {
        x: 380,
        y: 330,
      }, { templateVm: 'Web VM' }),
    ],
    edges: [
      createSolutionEdge('internet', 'mig'),
      createSolutionEdge('mig', 'cloud-sql'),
      createSolutionEdge('autoscaler', 'mig'),
      createSolutionEdge('instance-template', 'mig'),
    ],
  },
  L3: {
    nodes: [
      createSolutionNode('internet', 'Internet', 'Network', { x: 60, y: 280 }),
      createSolutionNode('global-lb', 'Global LB', 'Network', { x: 280, y: 280 }),
      createSolutionNode('mig-a', 'MIG', 'Compute', { x: 560, y: 150 }),
      createSolutionNode('mig-b', 'MIG', 'Compute', { x: 560, y: 420 }),
      createSolutionNode('cloud-sql', 'Cloud SQL', 'Storage', { x: 860, y: 150 }),
      createSolutionNode('cloud-sql-2', 'Cloud SQL', 'Storage', { x: 860, y: 420 }),
      createSolutionNode('autoscaler-top', 'Autoscaler', 'Tools', { x: 560, y: 30 }),
      createSolutionNode('autoscaler-bottom', 'Autoscaler', 'Tools', { x: 560, y: 540 }),
      createSolutionNode('instance-template', 'Instance Template', 'Compute', {
        x: 620,
        y: 280,
      }, { templateVm: 'Web VM' }),
    ],
    edges: [
      createSolutionEdge('internet', 'global-lb'),
      createSolutionEdge('global-lb', 'mig-a'),
      createSolutionEdge('global-lb', 'mig-b'),
      createSolutionEdge('mig-a', 'cloud-sql'),
      createSolutionEdge('mig-b', 'cloud-sql-2'),
      createSolutionEdge('autoscaler-top', 'mig-a'),
      createSolutionEdge('autoscaler-bottom', 'mig-b'),
      createSolutionEdge('instance-template', 'mig-a'),
      createSolutionEdge('instance-template', 'mig-b'),
    ],
  },
  L4: {
    nodes: [
      createSolutionNode('internet', 'Internet', 'Network', { x: 60, y: 280 }),
      createSolutionNode('global-lb', 'Global LB', 'Network', { x: 280, y: 280 }),
      createSolutionNode('cloud-cdn', 'Cloud CDN', 'Network', { x: 220, y: 170 }),
      createSolutionNode('cloud-storage', 'Cloud Storage', 'Storage', { x: 220, y: 390 }),
      createSolutionNode('mig-a', 'MIG', 'Compute', { x: 560, y: 150 }),
      createSolutionNode('mig-b', 'MIG', 'Compute', { x: 560, y: 420 }),
      createSolutionNode('cloud-sql', 'Cloud SQL', 'Storage', { x: 860, y: 150 }),
      createSolutionNode('cloud-sql-2', 'Cloud SQL', 'Storage', { x: 860, y: 420 }),
      createSolutionNode('autoscaler-top', 'Autoscaler', 'Tools', { x: 560, y: 30 }),
      createSolutionNode('autoscaler-bottom', 'Autoscaler', 'Tools', { x: 560, y: 540 }),
      createSolutionNode('instance-template', 'Instance Template', 'Compute', {
        x: 620,
        y: 280,
      }, { templateVm: 'Web VM' }),
    ],
    edges: [
      createSolutionEdge('internet', 'global-lb'),
      createSolutionEdge('global-lb', 'mig-a'),
      createSolutionEdge('global-lb', 'mig-b'),
      createSolutionEdge('cloud-cdn', 'global-lb'),
      createSolutionEdge('cloud-storage', 'global-lb'),
      createSolutionEdge('mig-a', 'cloud-sql'),
      createSolutionEdge('mig-b', 'cloud-sql-2'),
      createSolutionEdge('autoscaler-top', 'mig-a'),
      createSolutionEdge('autoscaler-bottom', 'mig-b'),
      createSolutionEdge('instance-template', 'mig-a'),
      createSolutionEdge('instance-template', 'mig-b'),
    ],
  },
  L5: {
    nodes: [
      createSolutionNode('internet', 'Internet', 'Network', { x: 40, y: 280 }),
      createSolutionNode('cloud-armor', 'Cloud Armor', 'Security', { x: 230, y: 280 }),
      createSolutionNode('global-lb', 'Global LB', 'Network', { x: 450, y: 280 }),
      createSolutionNode('cloud-cdn', 'Cloud CDN', 'Network', { x: 240, y: 170 }),
      createSolutionNode('cloud-storage', 'Cloud Storage', 'Storage', { x: 240, y: 390 }),
      createSolutionNode('mig-a', 'MIG', 'Compute', { x: 560, y: 150 }),
      createSolutionNode('mig-b', 'MIG', 'Compute', { x: 560, y: 420 }),
      createSolutionNode('cloud-sql', 'Cloud SQL', 'Storage', { x: 860, y: 150 }),
      createSolutionNode('cloud-sql-2', 'Cloud SQL', 'Storage', { x: 860, y: 420 }),
      createSolutionNode('autoscaler-top', 'Autoscaler', 'Tools', { x: 560, y: 30 }),
      createSolutionNode('autoscaler-bottom', 'Autoscaler', 'Tools', { x: 560, y: 540 }),
      createSolutionNode('instance-template', 'Instance Template', 'Compute', {
        x: 620,
        y: 280,
      }, { templateVm: 'Web VM' }),
    ],
    edges: [
      createSolutionEdge('internet', 'cloud-armor'),
      createSolutionEdge('cloud-armor', 'global-lb'),
      createSolutionEdge('cloud-cdn', 'global-lb'),
      createSolutionEdge('cloud-storage', 'global-lb'),
      createSolutionEdge('global-lb', 'mig-a'),
      createSolutionEdge('global-lb', 'mig-b'),
      createSolutionEdge('mig-a', 'cloud-sql'),
      createSolutionEdge('mig-b', 'cloud-sql-2'),
      createSolutionEdge('autoscaler-top', 'mig-a'),
      createSolutionEdge('autoscaler-bottom', 'mig-b'),
      createSolutionEdge('instance-template', 'mig-a'),
      createSolutionEdge('instance-template', 'mig-b'),
    ],
  },
  L6: {
    nodes: [
      createSolutionNode('internet', 'Internet', 'Network', { x: 40, y: 280 }),
      createSolutionNode('cloud-armor', 'Cloud Armor', 'Security', { x: 240, y: 280 }),
      createSolutionNode('global-lb', 'Global LB', 'Network', { x: 460, y: 280 }),
      createSolutionNode('cloud-cdn', 'Cloud CDN', 'Network', { x: 240, y: 170 }),
      createSolutionNode('cloud-storage', 'Cloud Storage', 'Storage', { x: 240, y: 390 }),
      createSolutionNode('cloud-scheduler', 'Cloud Scheduler', 'Tools', { x: 700, y: 280 }),
      createSolutionNode('cloud-function', 'Cloud Function', 'Compute', { x: 940, y: 280 }),
      createSolutionNode('mig-a', 'MIG', 'Compute', { x: 1160, y: 150 }),
      createSolutionNode('mig-b', 'MIG', 'Compute', { x: 1160, y: 420 }),
      createSolutionNode('cloud-sql', 'Cloud SQL', 'Storage', { x: 1460, y: 150 }),
      createSolutionNode('cloud-sql-2', 'Cloud SQL', 'Storage', { x: 1460, y: 420 }),
      createSolutionNode('autoscaler-top', 'Autoscaler', 'Tools', { x: 1160, y: 30 }),
      createSolutionNode('autoscaler-bottom', 'Autoscaler', 'Tools', { x: 1160, y: 540 }),
      createSolutionNode('instance-template', 'Instance Template', 'Compute', {
        x: 1220,
        y: 280,
      }, { templateVm: 'Spot VM' }),
    ],
    edges: [
      createSolutionEdge('internet', 'cloud-armor'),
      createSolutionEdge('cloud-armor', 'global-lb'),
      createSolutionEdge('cloud-cdn', 'global-lb'),
      createSolutionEdge('cloud-storage', 'global-lb'),
      createSolutionEdge('global-lb', 'cloud-scheduler'),
      createSolutionEdge('cloud-scheduler', 'cloud-function'),
      createSolutionEdge('cloud-function', 'mig-a'),
      createSolutionEdge('cloud-function', 'mig-b'),
      createSolutionEdge('mig-a', 'cloud-sql'),
      createSolutionEdge('mig-b', 'cloud-sql-2'),
      createSolutionEdge('autoscaler-top', 'mig-a'),
      createSolutionEdge('autoscaler-bottom', 'mig-b'),
      createSolutionEdge('instance-template', 'mig-a'),
      createSolutionEdge('instance-template', 'mig-b'),
    ],
  },
  L7: {
    nodes: [
      createSolutionNode('internet', 'Internet', 'Network', { x: 40, y: 280 }),
      createSolutionNode('cloud-armor', 'Cloud Armor', 'Security', { x: 240, y: 280 }),
      createSolutionNode('global-lb', 'Global LB', 'Network', { x: 460, y: 280 }),
      createSolutionNode('cloud-cdn', 'Cloud CDN', 'Network', { x: 240, y: 170 }),
      createSolutionNode('cloud-storage', 'Cloud Storage', 'Storage', { x: 240, y: 390 }),
      createSolutionNode('cloud-scheduler', 'Cloud Scheduler', 'Tools', { x: 700, y: 280 }),
      createSolutionNode('cloud-function', 'Cloud Function', 'Compute', { x: 940, y: 280 }),
      createSolutionNode('mig-a', 'MIG', 'Compute', { x: 1160, y: 150 }),
      createSolutionNode('mig-b', 'MIG', 'Compute', { x: 1160, y: 420 }),
      createSolutionNode('cloud-sql', 'Cloud SQL', 'Storage', { x: 1460, y: 150 }),
      createSolutionNode('cloud-sql-2', 'Cloud SQL', 'Storage', { x: 1460, y: 420 }),
      createSolutionNode('autoscaler-top', 'Autoscaler', 'Tools', { x: 1160, y: 30 }),
      createSolutionNode('autoscaler-bottom', 'Autoscaler', 'Tools', { x: 1160, y: 540 }),
      createSolutionNode('iam-role', 'IAM Role', 'Tools', { x: 1260, y: 280 }),
      createSolutionNode('service-account', 'Service Account', 'Tools', { x: 1560, y: 280 }),
      createSolutionNode('instance-template', 'Instance Template', 'Compute', {
        x: 1880,
        y: 280,
      }, { templateVm: 'Spot VM' }),
    ],
    edges: [
      createSolutionEdge('internet', 'cloud-armor'),
      createSolutionEdge('cloud-armor', 'global-lb'),
      createSolutionEdge('cloud-cdn', 'global-lb'),
      createSolutionEdge('cloud-storage', 'global-lb'),
      createSolutionEdge('global-lb', 'cloud-scheduler'),
      createSolutionEdge('cloud-scheduler', 'cloud-function'),
      createSolutionEdge('cloud-function', 'mig-a'),
      createSolutionEdge('cloud-function', 'mig-b'),
      createSolutionEdge('mig-a', 'cloud-sql'),
      createSolutionEdge('mig-b', 'cloud-sql-2'),
      createSolutionEdge('autoscaler-top', 'mig-a'),
      createSolutionEdge('autoscaler-bottom', 'mig-b'),
      createSolutionEdge('iam-role', 'service-account'),
      createSolutionEdge('service-account', 'instance-template'),
      createSolutionEdge('instance-template', 'mig-a'),
      createSolutionEdge('instance-template', 'mig-b'),
    ],
  },
};

const cloneNode = (node) => ({
  ...node,
  position: { ...node.position },
  data: { ...node.data },
});

const cloneEdge = (edge) => ({ ...edge });

export const getLevelSolution = (levelCode) => {
  const solution = LEVEL_SOLUTIONS[levelCode];
  if (!solution) return null;

  return {
    nodes: solution.nodes.map(cloneNode),
    edges: solution.edges.map(cloneEdge),
  };
};
