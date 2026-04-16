import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addEdge,
  Background,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import Sidebar from './components/Sidebar';
import MissionPanel from './components/MissionPanel';
import { nodeTypes } from './components/NodeTemplates';
import { levels, validateLevel } from './data/levels';
import { getLevelSolution } from './data/solutions';

const initialNodes = [];
const initialEdges = [];
const revealPositionScale = 1.08;

const revealEdgeDefaults = {
  animated: true,
  style: { stroke: '#38bdf8', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
  type: 'smoothstep',
};

const normalizeRevealEdges = (edges) =>
  edges.map((edge) => ({
    ...revealEdgeDefaults,
    ...edge,
    style: { ...revealEdgeDefaults.style, ...(edge.style || {}) },
    markerEnd: { ...revealEdgeDefaults.markerEnd, ...(edge.markerEnd || {}) },
  }));

const spreadRevealNodes = (nodes) =>
  nodes.map((node) => ({
    ...node,
    position: {
      x: Math.round(node.position.x * revealPositionScale),
      y: Math.round(node.position.y * revealPositionScale),
    },
  }));

function CloudTracerBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [levelIndex, setLevelIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selection, setSelection] = useState({ nodes: [], edges: [] });
  const clipboardRef = useRef(null);
  const pasteCountRef = useRef(0);
  const { getViewport, screenToFlowPosition, setViewport } = useReactFlow();

  const level = levels[levelIndex];

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

  const handleAttachVmToTemplate = useCallback(
    (nodeId, vmType) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id !== nodeId) return node;
          if (node.data?.label !== 'Instance Template') return node;

          return {
            ...node,
            data: {
              ...node.data,
              templateVm: vmType,
            },
          };
        })
      );
    },
    [setNodes]
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
      const nodeId = `${template.type}-${crypto.randomUUID()}`;

      const newNode = {
        id: nodeId,
        type: 'gcpNode',
        position,
        data: {
          label: template.type,
          category: template.category,
          nodeId,
          templateVm: template.type === 'Instance Template' ? null : undefined,
          onAttachVmToTemplate: handleAttachVmToTemplate,
        },
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);

      const currentViewport = getViewport();
      const nextZoom = Math.max(0.75, currentViewport.zoom - 0.04);
      if (nextZoom !== currentViewport.zoom) {
        setViewport({ ...currentViewport, zoom: nextZoom }, { duration: 120 });
      }
    },
    [getViewport, handleAttachVmToTemplate, screenToFlowPosition, setNodes, setViewport]
  );

  const handleValidate = useCallback(() => {
    setResult(validateLevel(levelIndex, nodes, edges));
  }, [edges, levelIndex, nodes]);

  const goToLevel = useCallback((nextIndex) => {
    setLevelIndex(nextIndex);
    setResult(null);
  }, []);

  const handleSelectLevel = useCallback(
    (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= levels.length) return;
      goToLevel(nextIndex);
    },
    [goToLevel]
  );

  const handleResetRun = useCallback(() => {
    setLevelIndex(0);
    resetCanvas();
  }, [resetCanvas]);

  const handleRevealSolution = useCallback(() => {
    const solution = getLevelSolution(level.code);
    if (!solution) {
      setResult({ ok: false, message: 'Solution reveal is not configured for this level yet.' });
      return;
    }

    setNodes(spreadRevealNodes(solution.nodes));
    setEdges(normalizeRevealEdges(solution.edges));
    setResult(null);
    setSelection({ nodes: [], edges: [] });
    clipboardRef.current = null;
    pasteCountRef.current = 0;
  }, [level.code, setEdges, setNodes]);

  const handleToggleSelectMode = useCallback(() => {
    setIsSelectMode((current) => !current);
  }, []);

  const handleSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
    setSelection({ nodes: selectedNodes, edges: selectedEdges });
  }, []);

  const handleKeyboardShortcuts = useCallback(
    (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!selection.nodes.length && !selection.edges.length) return;
        event.preventDefault();

        const selectedNodeIds = new Set(selection.nodes.map((node) => node.id));
        const selectedEdgeIds = new Set(selection.edges.map((edge) => edge.id));

        setNodes((currentNodes) => currentNodes.filter((node) => !selectedNodeIds.has(node.id)));
        setEdges((currentEdges) =>
          currentEdges.filter(
            (edge) =>
              !selectedEdgeIds.has(edge.id) &&
              !selectedNodeIds.has(edge.source) &&
              !selectedNodeIds.has(edge.target)
          )
        );
        return;
      }

      if (!isSelectMode) return;

      const isMetaKey = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isMetaKey && key === 'c') {
        if (!selection.nodes.length) return;
        event.preventDefault();

        const selectedNodeIds = new Set(selection.nodes.map((node) => node.id));
        const selectedEdges = edges.filter(
          (edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
        );

        clipboardRef.current = {
          nodes: selection.nodes.map((node) => ({ ...node, selected: false })),
          edges: selectedEdges.map((edge) => ({ ...edge, selected: false })),
        };
        pasteCountRef.current = 0;
        return;
      }

      if (isMetaKey && key === 'v') {
        if (!clipboardRef.current?.nodes?.length) return;
        event.preventDefault();

        pasteCountRef.current += 1;
        const offset = 40 * pasteCountRef.current;
        const idMap = new Map();

        const pastedNodes = clipboardRef.current.nodes.map((node) => {
          const id = `${node.type || 'node'}-${crypto.randomUUID()}`;
          idMap.set(node.id, id);

          return {
            ...node,
            id,
            selected: true,
            position: {
              x: node.position.x + offset,
              y: node.position.y + offset,
            },
            data: {
              ...node.data,
              nodeId: id,
              onAttachVmToTemplate: handleAttachVmToTemplate,
            },
          };
        });

        const pastedEdges = clipboardRef.current.edges
          .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
          .map((edge) => ({
            ...edge,
            id: `edge-${crypto.randomUUID()}`,
            source: idMap.get(edge.source),
            target: idMap.get(edge.target),
            selected: true,
          }));

        setNodes((currentNodes) => [
          ...currentNodes.map((node) => ({ ...node, selected: false })),
          ...pastedNodes,
        ]);
        setEdges((currentEdges) => [
          ...currentEdges.map((edge) => ({ ...edge, selected: false })),
          ...pastedEdges,
        ]);
        return;
      }

    },
    [edges, handleAttachVmToTemplate, isSelectMode, selection.edges, selection.nodes, setEdges, setNodes]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

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
        <MissionPanel
          levels={levels}
          level={level}
          levelIndex={levelIndex}
          nodes={nodes}
          edges={edges}
          isSelectMode={isSelectMode}
          result={result}
          onValidate={handleValidate}
          onRevealSolution={handleRevealSolution}
          onSelectLevel={handleSelectLevel}
          onToggleSelectMode={handleToggleSelectMode}
          onResetRun={handleResetRun}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onSelectionChange={handleSelectionChange}
          selectionOnDrag={isSelectMode}
          selectionMode={SelectionMode.Partial}
          panOnDrag={!isSelectMode}
          deleteKeyCode={null}
          defaultEdgeOptions={{ animated: true }}
          className={isSelectMode ? 'bg-transparent cursor-crosshair' : 'bg-transparent'}
        >
          <Background color="#1e293b" gap={22} size={1.1} />
          <MiniMap
            pannable
            zoomable
            nodeColor={miniMapNodeColor}
            className="!bg-slate-900/90 !border !border-slate-700/70"
          />
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
