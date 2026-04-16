import { useEffect, useMemo, useRef, useState } from 'react';
import { getLevelChecklist, getLevelProgress, summarizeLevelInventory } from '../data/levels';

const LEVEL_PROBLEMS = {
  L1: 'You have just launched your startup. You have a Web Server that needs to talk to the internet so users can see your site. You also have a Database that stores all your users\' private passwords and data. If a hacker connects directly to your database, your company is finished.',
  L2: 'Your startup is a success! Suddenly, a famous influencer tweets about your site. Traffic jumps from 10 users to 10,000 in one minute. Your single Web VM from Level 1 starts smoking and crashes (HTTP 500 error).',
  L3: 'Your site is booming! But suddenly, a massive storm or power grid failure hits the entire region (e.g., us-central1). Even though you have an Autoscaler, it can\'t find any \'living\' hardware in that city to start new servers. Your global users are seeing a \'Connection Timed Out\' error.',
  L4: 'Your global architecture is reliable (thanks to Level 3), but users in Malaysia are complaining. Every time they click a button, they have to wait for a \'handshake\' to travel all the way to a data center in Europe or the US. The physical distance is causing Latency (lag). We need to move the data closer to the user.',
  L5: 'A rival gaming company is jealous of your success. They launch a DDoS attack, using a botnet of 100,000 hijacked computers to flood your Global Load Balancer with fake traffic. Your Autoscaler (from Level 2) tries to help, but it starts spinning up thousands of VMs to handle the fake traffic, and your cloud bill skyrockets. Even worse, hackers are trying SQL Injection to steal your user data.',
  L6: 'Your game is a global hit, but your finance manager just showed you the monthly cloud bill. Running hundreds of high-performance VMs 24/7 in multiple regions is draining your startup\'s budget. To keep the company alive, you need to find a way to run the same infrastructure for 90% less cost without sacrificing performance for your players.',
  L7: 'A hacker exploits a tiny bug to \'get inside\' one of your Web VMs. Because your VMs have \'Editor\' power, the hacker can now delete your entire database and wipe your storage. Your own excessive permissions are the \'Silent Killer\' of your empire.',
};

function MissionPanel({
  levels,
  level,
  levelIndex,
  nodes,
  edges,
  isSelectMode,
  result,
  onValidate,
  onRevealSolution,
  onSelectLevel,
  onToggleSelectMode,
  onResetRun,
}) {
  const checklist = getLevelChecklist(levelIndex, nodes, edges);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProblemOpen, setIsProblemOpen] = useState(true);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const problemButtonRef = useRef(null);
  const problemPanelRef = useRef(null);
  const inventory = useMemo(() => summarizeLevelInventory(nodes) || 'No components placed.', [nodes]);
  const levelProblem = LEVEL_PROBLEMS[level.code] || 'No problem statement available for this level yet.';

  useEffect(() => {
    setIsProblemOpen(true);
  }, [levelIndex]);

  useEffect(() => {
    if (!isProblemOpen) return;

    const handleOutsidePointer = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (problemPanelRef.current?.contains(target) || problemButtonRef.current?.contains(target)) {
        return;
      }

      setIsProblemOpen(false);
    };

    document.addEventListener('mousedown', handleOutsidePointer, true);
    return () => document.removeEventListener('mousedown', handleOutsidePointer, true);
  }, [isProblemOpen]);

  return (
    <section className="pointer-events-none absolute inset-0 z-20">
      <div className="pointer-events-auto absolute left-4 right-4 top-4 rounded-2xl border border-slate-700/70 bg-slate-950/75 p-3 backdrop-blur-sm">
        <div className="grid grid-cols-[minmax(200px,1fr)_auto_minmax(220px,1fr)] items-center gap-3">
          <div className="min-w-[200px]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mission {getLevelProgress(levelIndex)}</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-100">
              {level.code}: {level.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                ref={problemButtonRef}
                type="button"
                onClick={() => setIsProblemOpen((current) => !current)}
                className="rounded-lg border border-amber-300/70 bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-amber-100 transition hover:border-amber-200"
                aria-expanded={isProblemOpen}
                aria-label="Toggle level problem statement"
                title="Show level problem"
              >
                Problems
              </button>

              <button
                type="button"
                onClick={onRevealSolution}
                className="rounded-lg border border-emerald-300/70 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-100 transition hover:border-emerald-200"
                aria-label="Reveal the current level solution on the canvas"
                title="Reveal solution"
              >
                Solution
              </button>
            </div>

            {isProblemOpen && (
              <div
                ref={problemPanelRef}
                className="glass-panel reveal-up absolute left-4 top-28 z-30 w-[min(560px,calc(100vw-3rem))] rounded-xl border border-amber-300/35 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Level Problem</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">{levelProblem}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {levels.map((item, index) => {
              const active = index === levelIndex;
              const hovered = hoveredLevel === index;
              const showFull = hovered;

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
            {result.message}
          </div>
        </div>
      )}

      <div className="pointer-events-auto absolute bottom-4 left-4 flex items-end gap-2">
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

        <button
          type="button"
          onClick={onToggleSelectMode}
          className={`h-11 w-11 rounded-full border text-sm font-semibold transition ${
            isSelectMode
              ? 'border-sky-300/80 bg-sky-500/25 text-sky-100'
              : 'border-slate-500/70 bg-slate-900/85 text-slate-100 hover:border-slate-300'
          }`}
          aria-pressed={isSelectMode}
          aria-label="Toggle select mode"
          title="Toggle select mode"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="mx-auto h-5 w-5 fill-current">
            <path d="M4 3l8.3 16 1.5-5.2L19 12.2z" />
            <path d="M12.7 14.6l3.7 5.4 1.9-1.3-3.7-5.4z" />
          </svg>
        </button>

        {isHelpOpen && (
          <div className="glass-panel reveal-up absolute bottom-14 left-0 w-[360px] rounded-2xl p-4">
            <p className="text-sm leading-relaxed text-slate-300">{level.briefing}</p>
            <p className="mt-3 rounded-lg border border-slate-700/70 bg-slate-900/50 p-3 text-sm text-slate-200">{level.objective}</p>

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
                    className={item.done ? 'text-emerald-300' : 'text-amber-200'}
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
