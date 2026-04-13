import { getLevelProgress, isFinalLevel, summarizeLevelInventory } from '../data/levels';

function MissionPanel({ level, levelIndex, nodes, result, onValidate, onPrevLevel, onNextLevel }) {
  return (
    <section className="glass-panel reveal-up w-[360px] rounded-2xl p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mission {getLevelProgress(levelIndex)}</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-100">{level.code}: {level.title}</h1>
        </div>
        <span className="rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-xs text-sky-200">Deploy Sim</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-300">{level.briefing}</p>
      <p className="mt-3 rounded-lg border border-slate-700/70 bg-slate-900/50 p-3 text-sm text-slate-200">{level.objective}</p>

      <div className="mt-4 text-xs text-slate-400">
        <span className="uppercase tracking-[0.18em]">Canvas Inventory</span>
        <p className="mt-1 min-h-8 text-slate-300">{summarizeLevelInventory(nodes) || 'No components placed.'}</p>
      </div>

      {result && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            result.ok
              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
              : 'border-rose-400/40 bg-rose-500/15 text-rose-200'
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onValidate}
          className="flex-1 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Deploy & Test
        </button>
        <button
          type="button"
          onClick={onPrevLevel}
          disabled={levelIndex === 0}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={onNextLevel}
          disabled={isFinalLevel(levelIndex)}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default MissionPanel;
