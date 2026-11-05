import React from 'react';
import { Mic, Trophy, History, Compass, Plus, Flame } from 'lucide-react';
import { UserStats } from '../types/spar';
import { getEloTier } from '../utils/elo';

interface HeaderProps {
  currentView: 'lobby' | 'arena' | 'scorecard' | 'progress' | 'history';
  onNavigate: (view: 'lobby' | 'progress' | 'history') => void;
  onQuickSpar: () => void;
  onOpenCustomModal: () => void;
  userStats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onQuickSpar,
  onOpenCustomModal,
  userStats,
}) => {
  const currentTier = getEloTier(userStats.currentElo);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('lobby')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-lg font-bold font-display tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
                SparCraft
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-400">
                Voice Improv
              </span>
            </div>
          </button>

          {/* Quick Elo Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-amber-400 font-semibold">{userStats.currentElo} Elo</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 truncate max-w-[140px]">{currentTier.name}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onNavigate('lobby')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1 ${
              currentView === 'lobby' || currentView === 'arena' || currentView === 'scorecard'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Sparring Arena</span>
          </button>

          <button
            onClick={() => onNavigate('progress')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1 ${
              currentView === 'progress'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Elo & Ratings</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1 ${
              currentView === 'history'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Spars</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCustomModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Topic</span>
          </button>

          <button
            onClick={onQuickSpar}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            <span>Roll Random Drill</span>
          </button>
        </div>
      </div>
    </header>
  );
};
