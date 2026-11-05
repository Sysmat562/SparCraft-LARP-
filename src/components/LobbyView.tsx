import React, { useState } from 'react';
import { 
  Brain, 
  Flame, 
  Users, 
  Sparkles, 
  Layers, 
  Shuffle, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Sliders,
  Plus
} from 'lucide-react';
import { SparScenario, ScenarioCategory, DifficultyLevel, UserStats } from '../types/spar';
import { SCENARIO_CATEGORIES, PRESET_SCENARIOS } from '../data/scenarios';
import { getEloTier } from '../utils/elo';

interface LobbyViewProps {
  customScenarios: SparScenario[];
  userStats: UserStats;
  onSelectScenario: (scenario: SparScenario, durationSeconds: number, difficulty: DifficultyLevel) => void;
  onOpenCustomModal: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  customScenarios,
  userStats,
  onSelectScenario,
  onOpenCustomModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected scenario for pre-flight configuration modal
  const [activeConfigScenario, setActiveConfigScenario] = useState<SparScenario | null>(null);
  const [configDifficulty, setConfigDifficulty] = useState<DifficultyLevel>('adept');
  const [configDuration, setConfigDuration] = useState<number>(90);

  const allScenarios = [...customScenarios, ...PRESET_SCENARIOS];

  const filteredScenarios = allScenarios.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.character.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenConfig = (scenario: SparScenario) => {
    setActiveConfigScenario(scenario);
    setConfigDifficulty(scenario.difficulty);
    setConfigDuration(scenario.suggestedDurationSeconds || 90);
  };

  const handleStartConfiguredSpar = () => {
    if (!activeConfigScenario) return;
    onSelectScenario(activeConfigScenario, configDuration, configDifficulty);
    setActiveConfigScenario(null);
  };

  const handleRandomize = () => {
    const randomScenario = allScenarios[Math.floor(Math.random() * allScenarios.length)];
    const difficulties: DifficultyLevel[] = ['adept', 'master', 'grandmaster'];
    const randomDiff = difficulties[Math.floor(Math.random() * difficulties.length)];
    onSelectScenario(randomScenario, 90, randomDiff);
  };

  const currentTier = getEloTier(userStats.currentElo);

  const categoryIcons: Record<ScenarioCategory, React.ReactNode> = {
    bluff_expert: <Brain className="w-4 h-4 text-amber-400" />,
    defend_hot_take: <Flame className="w-4 h-4 text-rose-400" />,
    join_ongoing: <Users className="w-4 h-4 text-sky-400" />,
    curveball_question: <Sparkles className="w-4 h-4 text-purple-400" />,
    improv_story: <Layers className="w-4 h-4 text-emerald-400" />,
  };

  const difficultyColors: Record<DifficultyLevel, string> = {
    novice: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40',
    adept: 'text-sky-400 border-sky-800/60 bg-sky-950/40',
    master: 'text-amber-400 border-amber-800/60 bg-amber-950/40',
    grandmaster: 'text-rose-400 border-rose-800/60 bg-rose-950/40',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header Strip */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>VOICE IMPROV GYM</span>
              <span aria-hidden="true">·</span>
              <span>100% HANDS-FREE ORAL SPARRING</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
              Think on your feet against authentic AI sparring partners.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Step into high-pressure conversational simulations. Bluff on niche topics, defend harmless hot takes, infiltrate group banter, and tackle unexpected curveballs.
            </p>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col">
              <span className="text-xs text-slate-400 font-mono">Current Elo</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold font-mono text-amber-400">{userStats.currentElo}</span>
                <span className="text-xs text-slate-400">{currentTier.name}</span>
              </div>
            </div>

            <button
              onClick={handleRandomize}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Shuffle className="w-4 h-4 fill-slate-950" />
              <span>Surprise Me</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Horizontal Category Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Scenarios ({allScenarios.length})
          </button>
          {SCENARIO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {categoryIcons[cat.id]}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Custom Button */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search topic or character..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 px-3.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <button
            onClick={onOpenCustomModal}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 shrink-0"
            title="Create Custom Scenario"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Custom</span>
          </button>
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScenarios.map((scenario) => {
          return (
            <div
              key={scenario.id}
              className="flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 p-5 transition-all hover:bg-slate-900/90 group"
            >
              <div className="space-y-3.5">
                {/* Meta Row: Clean Unboxed Separator */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    {categoryIcons[scenario.category]}
                    <span className="text-slate-300">{scenario.categoryLabel}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-mono capitalize ${difficultyColors[scenario.difficulty]}`}>
                    {scenario.difficulty}
                  </span>
                </div>

                {/* Scenario Title */}
                <div>
                  <h3 className="text-base font-bold font-display text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {scenario.title}
                  </h3>
                  <p className="text-xs font-mono text-amber-500/90 mt-0.5">
                    Topic: {scenario.topic}
                  </p>
                </div>

                {/* Premise */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {scenario.premise}
                </p>

                {/* Opponent Card Preview */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      {scenario.character.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {scenario.character.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    "{scenario.character.challengeStyle}"
                  </p>
                </div>
              </div>

              {/* Action Strip */}
              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{scenario.suggestedDurationSeconds}s standard</span>
                </div>

                <button
                  onClick={() => handleOpenConfig(scenario)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                >
                  <span>Step In</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pre-Flight Configuration Modal */}
      {activeConfigScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <span>PRE-SPAR CONFIGURATION</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeConfigScenario.categoryLabel}</span>
                </div>
                <h2 className="text-xl font-bold font-display text-white">
                  {activeConfigScenario.title}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Topic: {activeConfigScenario.topic}
                </p>
              </div>
              <button
                onClick={() => setActiveConfigScenario(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Character & Opening Gambit */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{activeConfigScenario.character.name}</span>
                <span className="font-mono text-slate-400">{activeConfigScenario.character.role}</span>
              </div>
              <p className="text-xs text-amber-200/90 italic bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/30">
                Opening Gambit: "{activeConfigScenario.initialMessage}"
              </p>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block">
                Select Difficulty Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['novice', 'adept', 'master', 'grandmaster'] as DifficultyLevel[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setConfigDifficulty(d)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all capitalize font-mono text-center ${
                      configDifficulty === d
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Round Length Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block">
                Round Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[60, 90, 120, 180].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setConfigDuration(sec)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all font-mono text-center ${
                      configDuration === sec
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sec}s {sec === 60 ? 'Blitz' : sec === 90 ? 'Std' : sec === 120 ? 'Spar' : 'Deep'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveConfigScenario(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartConfiguredSpar}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <span>Enter Sparring Ring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
