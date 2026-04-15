import { useMemo, useState } from 'react';
import { getLevelChecklist, getLevelProgress, summarizeLevelInventory } from '../data/levels';

function MissionPanel({
  levels,
  level,
  levelIndex,
  nodes,
  edges,
  result,
  onValidate,
  onSelectLevel,
  onResetRun,
}) {
  const checklist = getLevelChecklist(levelIndex, nodes, edges);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const inventory = useMemo(() => summarizeLevelInventory(nodes) || 'No components placed.', [nodes]);

  return (
    <section className="pointer-events-none absolute inset-0 z-20">
      <div className="pointer-events-auto absolute left-4 right-4 top-4 rounded-2xl border border-slate-700/70 bg-slate-950/75 p-3 backdrop-blur-sm">
        <div className="grid grid-cols-[minmax(200px,1fr)_auto_minmax(220px,1fr)] items-center gap-3">
          <div className="min-w-[200px]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mission {getLevelProgress(levelIndex)}</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-100">
              {level.code}: {level.title}
            </h1>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {levels.map((item, index) => {
              const active = index === levelIndex;
              const hovered = hoveredLevel === index;
              const showFull = active || hovered;

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setHoveredLevel(index)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  onFocus={() => setHoveredLevel(index)}
                  onBlur={() => setHoveredLevel(null)}
                  onClick={() => onSelectLevel(index)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-sky-300/70 bg-sky-500/20 text-sky-100'
                      : 'border-slate-600/80 bg-slate-900/70 text-slate-300 hover:border-slate-400'
                  }`}
                  title={`${item.code}: ${item.title}`}
                >
                  {showFull ? `${item.code} ${item.title}` : item.code}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onValidate}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Deploy & Test
            </button>
            <button
              type="button"
              onClick={onResetRun}
              className="rounded-lg border border-rose-500/50 bg-slate-950/70 px-3 py-2 text-sm text-rose-200 transition hover:border-rose-400"
            >
              Reset Run
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="pointer-events-auto absolute right-4 top-24 w-[min(420px,calc(100%-2rem))]">
          <div
            className={`rounded-lg border p-3 text-sm ${
              result.ok
                ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                : 'border-rose-400/40 bg-rose-500/15 text-rose-200'
            }`}
          >
            {!result.ok && result.kind === 'regression' ? 'Regression: ' : ''}
            {result.message}
          </div>
        </div>
      )}

      <div className="pointer-events-auto absolute bottom-4 left-4">
        <button
          type="button"
          onClick={() => setIsHelpOpen((current) => !current)}
          className="h-11 w-11 rounded-full border border-slate-500/70 bg-slate-900/85 text-lg font-semibold text-slate-100 transition hover:border-slate-300"
          aria-expanded={isHelpOpen}
          aria-label="Toggle mission help"
          title="Toggle mission help"
        >
          ?
        </button>

        {isHelpOpen && (
          <div className="glass-panel reveal-up absolute bottom-14 left-0 w-[360px] rounded-2xl p-4">
            <p className="text-sm leading-relaxed text-slate-300">{level.briefing}</p>
            <p className="mt-3 rounded-lg border border-slate-700/70 bg-slate-900/50 p-3 text-sm text-slate-200">{level.objective}</p>
            <p className="mt-2 text-xs text-slate-400">Cumulative mode: this level must pass and all previous levels must still pass.</p>

            <div className="mt-4 text-xs text-slate-400">
              <span className="uppercase tracking-[0.18em]">Canvas Inventory</span>
              <p className="mt-1 min-h-8 text-slate-300">{inventory}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Milestones</p>
              <div className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1 text-xs">
                {checklist.map((item) => (
                  <p
                    key={`${item.levelCode}-${item.label}`}
                    className={item.done ? 'text-emerald-300' : item.isCurrentLevelRule ? 'text-amber-200' : 'text-rose-200'}
                  >
                    {item.done ? '[OK]' : '[ ]'} {item.levelCode} - {item.label}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MissionPanel;
