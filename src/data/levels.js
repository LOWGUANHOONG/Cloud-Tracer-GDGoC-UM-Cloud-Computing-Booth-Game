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

const countDistinctDirectTargets = (edges, labelIndex, fromLabel, toLabel) => {
  const fromIds = new Set(labelIndex.get(fromLabel) || []);
  const toIds = new Set(labelIndex.get(toLabel) || []);
  const distinctTargets = new Set();

  for (const edge of edges) {
    if (fromIds.has(edge.source) && toIds.has(edge.target)) {
      distinctTargets.add(edge.target);
    }
  }

  return distinctTargets.size;
};

const countDistinctDirectSources = (edges, labelIndex, fromLabel, toLabel) => {
  const fromIds = new Set(labelIndex.get(fromLabel) || []);
  const toIds = new Set(labelIndex.get(toLabel) || []);
  const distinctSources = new Set();

  for (const edge of edges) {
    if (fromIds.has(edge.source) && toIds.has(edge.target)) {
      distinctSources.add(edge.source);
    }
  }

  return distinctSources.size;
};

const hasNodeWithTemplateVm = (nodes, label, templateVm) =>
  nodes.some((node) => node?.data?.label === label && node?.data?.templateVm === templateVm);

const evaluateRule = (rule, nodes, edges) => {
  const labelIndex = getNodeIdsByLabel(nodes);

  if (rule.type === 'path') {
    return hasPathByLabel(nodes, edges, rule.from, rule.to);
  }

  if (rule.type === 'direct') {
    return hasDirectConnection(edges, labelIndex, rule.from, rule.to);
  }

  if (rule.type === 'forbiddenDirect') {
    return !hasDirectConnection(edges, labelIndex, rule.from, rule.to);
  }

  if (rule.type === 'minCount') {
    return countLabel(nodes, rule.label) >= rule.min;
  }

  if (rule.type === 'minDistinctDirectTargets') {
    return countDistinctDirectTargets(edges, labelIndex, rule.from, rule.to) >= rule.min;
  }

  if (rule.type === 'minDistinctDirectSources') {
    return countDistinctDirectSources(edges, labelIndex, rule.from, rule.to) >= rule.min;
  }

  if (rule.type === 'templateVmEquals') {
    return hasNodeWithTemplateVm(nodes, rule.label, rule.templateVm);
  }

  return false;
};

export const levels = [
  {
    id: 1,
    code: 'L1',
    title: 'The Gateway',
    briefing: 'Start with the baseline app tier and data tier chain.',
    objective: 'Internet -> Web VM -> Cloud SQL.',
    successMessage: 'Level 1 cleared. Baseline app-to-database routing is complete.',
    rules: [
      {
        type: 'path',
        from: 'Internet',
        to: 'Web VM',
        checklist: 'Internet reaches Web VM.',
        failMessage: 'Missing secure route. Build Internet -> Web VM first.',
      },
      {
        type: 'path',
        from: 'Web VM',
        to: 'Cloud SQL',
        checklist: 'Web VM reaches Cloud SQL.',
        failMessage: 'Data tier is disconnected. Build Web VM -> Cloud SQL.',
      },
    ],
  },
  {
    id: 2,
    code: 'L2',
    title: 'Traffic Surge',
    briefing: 'Shift traffic handling to a managed instance group control path.',
    objective: 'Internet -> MIG -> Cloud SQL, plus Instance Template -> MIG and Autoscaler -> MIG.',
    successMessage: 'Level 2 cleared. MIG control plane and data path are in place.',
    rules: [
      {
        type: 'path',
        from: 'Internet',
        to: 'MIG',
        checklist: 'Internet reaches MIG.',
        failMessage: 'Missing ingress path. Connect Internet -> MIG.',
      },
      {
        type: 'path',
        from: 'MIG',
        to: 'Cloud SQL',
        checklist: 'MIG reaches Cloud SQL.',
        failMessage: 'Data path missing. Connect MIG -> Cloud SQL.',
      },
      {
        type: 'direct',
        from: 'Instance Template',
        to: 'MIG',
        checklist: 'Instance Template connects to MIG.',
        failMessage: 'Template binding missing. Connect Instance Template -> MIG.',
      },
      {
        type: 'direct',
        from: 'Autoscaler',
        to: 'MIG',
        checklist: 'Autoscaler connects to MIG.',
        failMessage: 'Autoscaler control missing. Connect Autoscaler -> MIG.',
      },
    ],
  },
  {
    id: 3,
    code: 'L3',
    title: 'Regional Blackout',
    briefing: 'Move to dual-MIG behind Global LB with mirrored control links.',
    objective:
      'Internet -> Global LB -> MIG(1) -> Cloud SQL and Internet -> Global LB -> MIG(2) -> Cloud SQL, plus Autoscaler -> MIG(1)&MIG(2), Instance Template -> MIG(1)&MIG(2).',
    successMessage: 'Level 3 cleared. Dual-MIG regional pattern is established.',
    rules: [
      {
        type: 'path',
        from: 'Internet',
        to: 'Global LB',
        checklist: 'Internet reaches Global LB.',
        failMessage: 'Missing entry path. Connect Internet -> Global LB.',
      },
      {
        type: 'minCount',
        label: 'MIG',
        min: 2,
        checklist: 'At least two MIG nodes exist.',
        failMessage: 'Place at least two MIG nodes to represent two regions.',
      },
      {
        type: 'minDistinctDirectTargets',
        from: 'Global LB',
        to: 'MIG',
        min: 2,
        checklist: 'Global LB connects directly to two different MIG nodes.',
        failMessage: 'Global LB must connect directly to two separate MIG nodes.',
      },
      {
        type: 'minDistinctDirectSources',
        from: 'MIG',
        to: 'Cloud SQL',
        min: 2,
        checklist: 'Both MIG nodes connect directly to Cloud SQL.',
        failMessage: 'Connect both MIG nodes to Cloud SQL.',
      },
      {
        type: 'minDistinctDirectTargets',
        from: 'Autoscaler',
        to: 'MIG',
        min: 2,
        checklist: 'Autoscaler connects to both MIG nodes.',
        failMessage: 'Autoscaler must connect to both MIG nodes.',
      },
      {
        type: 'minDistinctDirectTargets',
        from: 'Instance Template',
        to: 'MIG',
        min: 2,
        checklist: 'Instance Template connects to both MIG nodes.',
        failMessage: 'Instance Template must connect to both MIG nodes.',
      },
    ],
  },
  {
    id: 4,
    code: 'L4',
    title: 'Edge Acceleration',
    briefing: 'Keep Level 3 and add CDN/storage links into Global LB.',
    objective: 'Same as Level 3, plus Cloud CDN -> Global LB and Cloud Storage -> Global LB.',
    successMessage: 'Level 4 cleared. Edge entry links are attached to Global LB.',
    rules: [
      {
        type: 'direct',
        from: 'Cloud CDN',
        to: 'Global LB',
        checklist: 'Cloud CDN connects to Global LB.',
        failMessage: 'Connect Cloud CDN -> Global LB.',
      },
      {
        type: 'direct',
        from: 'Cloud Storage',
        to: 'Global LB',
        checklist: 'Cloud Storage connects to Global LB.',
        failMessage: 'Connect Cloud Storage -> Global LB.',
      },
    ],
  },
  {
    id: 5,
    code: 'L5',
    title: 'The Intruder',
    briefing: 'Keep Level 4 and place Cloud Armor between Internet and Global LB.',
    objective: 'Internet -> Cloud Armor -> Global LB, with the rest of Level 4 unchanged.',
    successMessage: 'Level 5 cleared. Cloud Armor now fronts Global LB ingress.',
    rules: [
      {
        type: 'path',
        from: 'Internet',
        to: 'Cloud Armor',
        checklist: 'Internet reaches Cloud Armor.',
        failMessage: 'Cloud Armor is not receiving internet ingress.',
      },
      {
        type: 'path',
        from: 'Cloud Armor',
        to: 'Global LB',
        checklist: 'Cloud Armor forwards to Global LB.',
        failMessage: 'Cloud Armor must sit in front of Global LB.',
      },
      {
        type: 'forbiddenDirect',
        from: 'Internet',
        to: 'Global LB',
        checklist: 'Direct Internet -> Global LB is blocked.',
        failMessage: 'Direct Internet -> Global LB bypasses Cloud Armor.',
      },
    ],
  },
  {
    id: 6,
    code: 'L6',
    title: 'Budget Squeezer',
    briefing: 'Keep Level 5 and insert scheduler/function routing between Global LB and both MIGs.',
    objective: 'Global LB -> Cloud Scheduler -> Cloud Function -> MIG(1)&MIG(2), and Instance Template VM must be Spot VM.',
    successMessage: 'Level 6 cleared. Scheduler/function chain now fronts both MIG targets.',
    rules: [
      {
        type: 'direct',
        from: 'Global LB',
        to: 'Cloud Scheduler',
        checklist: 'Global LB connects to Cloud Scheduler.',
        failMessage: 'Connect Global LB -> Cloud Scheduler.',
      },
      {
        type: 'direct',
        from: 'Cloud Scheduler',
        to: 'Cloud Function',
        checklist: 'Cloud Scheduler connects to Cloud Function.',
        failMessage: 'Connect Cloud Scheduler -> Cloud Function.',
      },
      {
        type: 'minDistinctDirectTargets',
        from: 'Cloud Function',
        to: 'MIG',
        min: 2,
        checklist: 'Cloud Function connects to both MIG nodes.',
        failMessage: 'Cloud Function must connect to both MIG nodes.',
      },
      {
        type: 'templateVmEquals',
        label: 'Instance Template',
        templateVm: 'Spot VM',
        checklist: 'Instance Template is configured with Spot VM.',
        failMessage: 'For Level 6, drop Spot VM into Instance Template.',
      },
    ],
  },
  {
    id: 7,
    code: 'L7',
    title: 'Identity Lockdown',
    briefing: 'Keep Level 6 and add IAM linkage into template control.',
    objective: 'Add IAM Role -> Service Account -> Instance Template.',
    successMessage: 'Level 7 cleared. Final identity-control chain is integrated.',
    rules: [
      {
        type: 'direct',
        from: 'IAM Role',
        to: 'Service Account',
        checklist: 'IAM Role connects to Service Account.',
        failMessage: 'Connect IAM Role -> Service Account.',
      },
      {
        type: 'direct',
        from: 'Service Account',
        to: 'Instance Template',
        checklist: 'Service Account connects to Instance Template.',
        failMessage: 'Connect Service Account -> Instance Template.',
      },
    ],
  },
];

const resolveLevelIndex = (levelOrIndex) => {
  if (typeof levelOrIndex === 'number') return levelOrIndex;
  if (!levelOrIndex) return -1;

  const byId = levels.findIndex((level) => level.id === levelOrIndex.id);
  if (byId >= 0) return byId;

  return levels.findIndex((level) => level.code === levelOrIndex.code);
};

const getLevelRules = (levelIndex) => {
  const level = levels[levelIndex];
  if (!level) return [];

  return (level.rules || []).map((rule) => ({
    ...rule,
    levelCode: level.code,
  }));
};

export const getLevelChecklist = (levelIndex, nodes, edges) => {
  const resolved = resolveLevelIndex(levelIndex);
  if (resolved < 0) return [];

  return getLevelRules(resolved).map((rule) => ({
    label: rule.checklist,
    done: evaluateRule(rule, nodes, edges),
    levelCode: rule.levelCode,
    isCurrentLevelRule: true,
  }));
};

export const validateLevel = (levelOrIndex, nodes, edges) => {
  const levelIndex = resolveLevelIndex(levelOrIndex);
  if (levelIndex < 0) return { ok: false, message: 'Level validator missing.' };
  if (!nodes.length) return { ok: false, message: 'Canvas is empty. Drag components onto the workspace.' };

  const level = levels[levelIndex];
  const levelRules = getLevelRules(levelIndex);

  for (const rule of levelRules) {
    if (!evaluateRule(rule, nodes, edges)) {
      return {
        ok: false,
        kind: 'current',
        message: rule.failMessage,
      };
    }
  }

  return { ok: true, kind: 'success', message: level.successMessage };
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
