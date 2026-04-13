import { useCallback, useMemo, useState } from 'react';
import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import Sidebar from './components/Sidebar';
import MissionPanel from './components/MissionPanel';
import { nodeTypes } from './components/NodeTemplates';
import { levels, validateLevel } from './data/levels';

const initialNodes = [];
const initialEdges = [];

function CloudTracerBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [levelIndex, setLevelIndex] = useState(0);
  const [result, setResult] = useState(null);
  const { screenToFlowPosition } = useReactFlow();

  const level = levels[levelIndex];
  const canGoPrev = levelIndex > 0;
  const canGoNext = levelIndex < levels.length - 1;

  const resetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setResult(null);
  }, [setEdges, setNodes]);

  const onConnect = useCallback(
    (params) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#38bdf8', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
            type: 'smoothstep',
          },
          currentEdges
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData('application/cloudtracer-node');
      if (!payload) return;

      const template = JSON.parse(payload);
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      const newNode = {
        id: `${template.type}-${crypto.randomUUID()}`,
        type: 'gcpNode',
        position,
        data: {
          label: template.type,
          category: template.category,
        },
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  const handleValidate = useCallback(() => {
    setResult(validateLevel(level, nodes, edges));
  }, [edges, level, nodes]);

  const goToLevel = useCallback(
    (nextIndex) => {
      setLevelIndex(nextIndex);
      resetCanvas();
    },
    [resetCanvas]
  );

  const handlePrevLevel = useCallback(() => {
    if (!canGoPrev) return;
    goToLevel(levelIndex - 1);
  }, [canGoPrev, goToLevel, levelIndex]);

  const handleNextLevel = useCallback(() => {
    if (!canGoNext) return;
    goToLevel(levelIndex + 1);
  }, [canGoNext, goToLevel, levelIndex]);

  const miniMapNodeColor = useMemo(
    () => (node) => {
      if (node.data?.category === 'Compute') return '#38bdf8';
      if (node.data?.category === 'Network') return '#2dd4bf';
      if (node.data?.category === 'Security') return '#fb7185';
      if (node.data?.category === 'Storage') return '#f59e0b';
      return '#a78bfa';
    },
    []
  );

  return (
    <div className="relative flex min-h-screen gap-4 p-4 text-slate-100">
      <Sidebar />

      <main className="relative flex-1 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/70">
        <div className="scanline-overlay" />
        <div className="absolute left-4 top-4 z-20">
          <MissionPanel
            level={level}
            levelIndex={levelIndex}
            nodes={nodes}
            result={result}
            onValidate={handleValidate}
            onPrevLevel={handlePrevLevel}
            onNextLevel={handleNextLevel}
          />
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          defaultEdgeOptions={{ animated: true }}
          className="bg-transparent"
        >
          <Background color="#1e293b" gap={22} size={1.1} />
          <MiniMap
            pannable
            zoomable
            nodeColor={miniMapNodeColor}
            className="!bg-slate-900/90 !border !border-slate-700/70"
          />
          <Controls className="!bg-slate-900/80 !border !border-slate-700/70" />
        </ReactFlow>
      </main>
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <CloudTracerBoard />
    </ReactFlowProvider>
  );
}

export default App;
