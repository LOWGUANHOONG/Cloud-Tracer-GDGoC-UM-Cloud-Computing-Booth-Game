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

const evaluateRule = (rule, nodes, edges) => {
  const labelIndex = getNodeIdsByLabel(nodes);

  if (rule.type === 'path') {
    return hasPathByLabel(nodes, edges, rule.from, rule.to);
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

  return false;
};

export const levels = [
  {
    id: 1,
    code: 'L1',
    title: 'The Gateway',
    briefing: 'Start with secure three-tier ingress before touching data.',
    objective: 'Build Internet -> Web VM -> Cloud SQL and block direct Internet -> Cloud SQL.',
    successMessage: 'Gateway baseline secured. Your architecture is ready for traffic growth.',
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
      {
        type: 'forbiddenDirect',
        from: 'Internet',
        to: 'Cloud SQL',
        checklist: 'Direct Internet -> Cloud SQL is blocked.',
        failMessage: 'Direct Internet -> Cloud SQL detected. Keep the compute tier in between.',
      },
    ],
  },
  {
    id: 2,
    code: 'L2',
    title: 'Traffic Surge',
    briefing: 'Requests spike hard. Extend your existing baseline with elastic ingress handling.',
    objective: 'Add Load Balancer -> MIG -> Autoscaler without breaking Level 1 security path.',
    successMessage: 'Elastic ingress online. The architecture now scales with demand.',
    rules: [
      {
        type: 'path',
        from: 'Load Balancer',
        to: 'MIG',
        checklist: 'Load Balancer routes to MIG.',
        failMessage: 'High-traffic routing is missing. Connect Load Balancer -> MIG.',
      },
      {
        type: 'path',
        from: 'MIG',
        to: 'Autoscaler',
        checklist: 'MIG is tied to Autoscaler.',
        failMessage: 'Autoscaling control missing. Connect MIG -> Autoscaler.',
      },
    ],
  },
  {
    id: 3,
    code: 'L3',
    title: 'Regional Blackout',
    briefing: 'One region fails. Add redundancy while keeping previous levels healthy.',
    objective: 'Use Global LB to fan out to two distinct MIG nodes.',
    successMessage: 'Regional resilience active. One regional failure no longer takes the app down.',
    rules: [
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
    ],
  },
  {
    id: 4,
    code: 'L4',
    title: 'Edge Acceleration',
    briefing: 'Latency hurts user experience. Extend the design with edge caching.',
    objective: 'Build User -> Load Balancer -> Cloud CDN -> Cloud Storage.',
    successMessage: 'Edge path deployed. Static delivery is now globally optimized.',
    rules: [
      {
        type: 'path',
        from: 'User',
        to: 'Load Balancer',
        checklist: 'User traffic reaches the Load Balancer.',
        failMessage: 'User ingress path missing. Connect User -> Load Balancer.',
      },
      {
        type: 'path',
        from: 'Load Balancer',
        to: 'Cloud CDN',
        checklist: 'Load Balancer routes to Cloud CDN.',
        failMessage: 'CDN offload missing. Connect Load Balancer -> Cloud CDN.',
      },
      {
        type: 'path',
        from: 'Cloud CDN',
        to: 'Cloud Storage',
        checklist: 'Cloud CDN reaches Cloud Storage origin.',
        failMessage: 'Static origin path missing. Connect Cloud CDN -> Cloud Storage.',
      },
    ],
  },
  {
    id: 5,
    code: 'L5',
    title: 'The Intruder',
    briefing: 'Hostile traffic appears. Add perimeter defense to your existing ingress chain.',
    objective: 'Insert Cloud Armor between Internet and Load Balancer. Block direct Internet -> Load Balancer.',
    successMessage: 'Perimeter defense enabled. Ingress now filters malicious traffic first.',
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
        to: 'Load Balancer',
        checklist: 'Cloud Armor forwards to Load Balancer.',
        failMessage: 'Cloud Armor must sit in front of the Load Balancer.',
      },
      {
        type: 'forbiddenDirect',
        from: 'Internet',
        to: 'Load Balancer',
        checklist: 'Direct Internet -> Load Balancer is blocked.',
        failMessage: 'Direct Internet -> Load Balancer bypasses Cloud Armor.',
      },
    ],
  },
  {
    id: 6,
    code: 'L6',
    title: 'Budget Squeezer',
    briefing: 'Costs rise overnight. Add automated low-cost execution without regressing reliability.',
    objective: 'Build Cloud Scheduler -> Cloud Function -> Spot VM.',
    successMessage: 'Cost automation integrated. Scheduled workloads now run on discounted compute.',
    rules: [
      {
        type: 'path',
        from: 'Cloud Scheduler',
        to: 'Cloud Function',
        checklist: 'Cloud Scheduler triggers Cloud Function.',
        failMessage: 'Scheduling trigger missing. Connect Cloud Scheduler -> Cloud Function.',
      },
      {
        type: 'path',
        from: 'Cloud Function',
        to: 'Spot VM',
        checklist: 'Cloud Function dispatches Spot VM work.',
        failMessage: 'Execution handoff missing. Connect Cloud Function -> Spot VM.',
      },
    ],
  },
  {
    id: 7,
    code: 'L7',
    title: 'Identity Lockdown',
    briefing: 'Finalize a production-grade architecture with identity boundaries and least privilege.',
    objective: 'Build Web VM -> Service Account -> IAM Role -> Cloud Storage while preserving all previous layers.',
    successMessage: 'Mission complete. You assembled a robust, multi-layer GCP architecture.',
    rules: [
      {
        type: 'path',
        from: 'Web VM',
        to: 'Service Account',
        checklist: 'Web VM uses a Service Account.',
        failMessage: 'Identity handoff missing. Connect Web VM -> Service Account.',
      },
      {
        type: 'path',
        from: 'Service Account',
        to: 'IAM Role',
        checklist: 'Service Account is bound to IAM Role.',
        failMessage: 'Role binding missing. Connect Service Account -> IAM Role.',
      },
      {
        type: 'path',
        from: 'IAM Role',
        to: 'Cloud Storage',
        checklist: 'IAM Role grants Cloud Storage access.',
        failMessage: 'Least-privilege chain incomplete. Connect IAM Role -> Cloud Storage.',
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

const getCumulativeRules = (levelIndex) =>
  levels.slice(0, levelIndex + 1).flatMap((level, index) =>
    (level.rules || []).map((rule) => ({
      ...rule,
      levelIndex: index,
      levelCode: level.code,
    }))
  );

export const getLevelChecklist = (levelIndex, nodes, edges) => {
  const resolved = resolveLevelIndex(levelIndex);
  if (resolved < 0) return [];

  return getCumulativeRules(resolved).map((rule) => ({
    label: rule.checklist,
    done: evaluateRule(rule, nodes, edges),
    levelCode: rule.levelCode,
    isCurrentLevelRule: rule.levelIndex === resolved,
  }));
};

export const validateLevel = (levelOrIndex, nodes, edges) => {
  const levelIndex = resolveLevelIndex(levelOrIndex);
  if (levelIndex < 0) return { ok: false, message: 'Level validator missing.' };
  if (!nodes.length) return { ok: false, message: 'Canvas is empty. Drag components onto the workspace.' };

  const level = levels[levelIndex];
  const cumulativeRules = getCumulativeRules(levelIndex);

  for (const rule of cumulativeRules) {
    if (!evaluateRule(rule, nodes, edges)) {
      const isRegression = rule.levelIndex < levelIndex;
      return {
        ok: false,
        kind: isRegression ? 'regression' : 'current',
        message: isRegression
          ? `Regression detected in ${rule.levelCode}. ${rule.failMessage}`
          : rule.failMessage,
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
