import React, { useState } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Clock, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  ShieldAlert,
  Brain,
  Users,
  Sparkles,
  Layers
} from 'lucide-react';
import { UserStats, PerformanceEvaluation, ScenarioCategory } from '../types/spar';
import { getEloTier } from '../utils/elo';

interface ProgressViewProps {
  userStats: UserStats;
  onSelectSavedRound?: (evaluation: PerformanceEvaluation) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userStats,
  onSelectSavedRound,
}) => {
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);

  const currentTier = getEloTier(userStats.currentElo);
  const highestTier = getEloTier(userStats.highestElo);

  // Category Icons
  const categoryIcons: Record<ScenarioCategory, React.ReactNode> = {
    bluff_expert: <Brain className="w-4 h-4 text-amber-400" />,
    defend_hot_take: <Flame className="w-4 h-4 text-rose-400" />,
    join_ongoing: <Users className="w-4 h-4 text-sky-400" />,
    curveball_question: <Sparkles className="w-4 h-4 text-purple-400" />,
    improv_story: <Layers className="w-4 h-4 text-emerald-400" />,
  };

  const categoryLabels: Record<ScenarioCategory, string> = {
    bluff_expert: 'Bluff the Expert',
    defend_hot_take: 'Defend Hot Take',
    join_ongoing: 'Ongoing Banter',
    curveball_question: 'Unexpected Questions',
    improv_story: 'Improvise Story',
  };

  // Progression history sorted chronologically (oldest to newest for trajectory chart)
  const chronologicalHistory = [...userStats.history].reverse();

  // SVG Chart Dimensions
  const chartHeight = 160;
  const chartWidth = 640;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile Header */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>SPARRING MASTERY & PROGRESSION VAULT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Conversational Trajectory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Tracking your spontaneous thinking-on-your-feet agility, credibility, and Elo rating over time.
            </p>
          </div>

          {/* Current Rank Badge */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6 fill-amber-400/20" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-400">
                  {userStats.currentElo}
                </span>
                <span className="text-xs font-mono text-slate-400">Elo</span>
              </div>
              <div className="text-xs font-bold text-white font-display">
                {currentTier.name}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Peak: {userStats.highestElo} Elo ({highestTier.name})
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Metrics: First Ever Score, Rolling Last 3 Avg, Best Score */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. First Ever Score */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>First Ever Score</span>
              <Award className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-white">
              {userStats.firstEverScore !== null ? `${userStats.firstEverScore}/100` : '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Debut benchmark</p>
          </div>

          {/* 2. Rolling Last 3 Avg */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Rolling Last 3 Avg</span>
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-sky-300">
              {userStats.rollingLast3Avg ? `${userStats.rollingLast3Avg}/100` : '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Recent form momentum</p>
          </div>

          {/* 3. Best Score */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Best Score (Record)</span>
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
              {userStats.bestScore ? `${userStats.bestScore}/100` : '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">All-time personal high</p>
          </div>

          {/* 4. Total Spars */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Total Spar Rounds</span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-white">
              {userStats.totalSparRounds}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {userStats.totalMinutesSparred} minutes in the ring
            </p>
          </div>
        </div>
      </div>

      {/* Visual Progression Over Time: Interactive SVG Score Trajectory */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              Score Progression Over Time
            </h2>
            <p className="text-xs text-slate-400">
              Comparing your debut score against rolling form and all-time trajectory
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Overall Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              <span>Credibility</span>
            </div>
          </div>
        </div>

        {chronologicalHistory.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center rounded-2xl bg-slate-950/50 border border-slate-800/80 text-center p-6 space-y-2">
            <Trophy className="w-8 h-8 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No Sparring Rounds Recorded Yet</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Complete your first sparring round in the Arena to establish your baseline debut score and start tracking growth!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[500px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                {/* Background Grid Lines */}
                {[25, 50, 75, 100].map((scoreVal) => {
                  const y = chartHeight - (scoreVal / 100) * (chartHeight - 30) - 15;
                  return (
                    <g key={scoreVal}>
                      <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#1E293B" strokeDasharray="3 3" />
                      <text x={4} y={y - 3} fill="#64748B" fontSize="9" fontFamily="monospace">
                        {scoreVal}
                      </text>
                    </g>
                  );
                })}

                {/* Score Polyline */}
                {chronologicalHistory.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chronologicalHistory
                      .map((h, i) => {
                        const x = 30 + (i / (chronologicalHistory.length - 1)) * (chartWidth - 60);
                        const y = chartHeight - (h.overallScore / 100) * (chartHeight - 30) - 15;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Credibility Polyline */}
                {chronologicalHistory.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                    points={chronologicalHistory
                      .map((h, i) => {
                        const x = 30 + (i / (chronologicalHistory.length - 1)) * (chartWidth - 60);
                        const y = chartHeight - ((h.scores?.credibility ?? 70) / 100) * (chartHeight - 30) - 15;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Data Points */}
                {chronologicalHistory.map((h, i) => {
                  const x =
                    chronologicalHistory.length === 1
                      ? chartWidth / 2
                      : 30 + (i / (chronologicalHistory.length - 1)) * (chartWidth - 60);
                  const y = chartHeight - (h.overallScore / 100) * (chartHeight - 30) - 15;
                  const isFirst = i === 0;
                  const isBest = h.overallScore === userStats.bestScore;

                  return (
                    <g key={h.id} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r={isBest ? 6 : 4.5}
                        fill={isBest ? '#FBBF24' : '#F59E0B'}
                        stroke="#0F172A"
                        strokeWidth="2"
                      />
                      {/* Score Value Label */}
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#F8FAFC"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {h.overallScore}
                      </text>
                      {/* Tag for Debut and Record */}
                      {isFirst && (
                        <text
                          x={x}
                          y={chartHeight - 2}
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          Debut
                        </text>
                      )}
                      {isBest && (
                        <text
                          x={x}
                          y={y - 20}
                          textAnchor="middle"
                          fill="#FBBF24"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          ★ Best
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Category Mastery Breakdown */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold font-display text-white">
            Scenario Mastery Breakdown
          </h2>
          <p className="text-xs text-slate-400">
            Average scores and volume across distinct conversational disciplines
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(Object.keys(categoryLabels) as ScenarioCategory[]).map((cat) => {
            const mastery = userStats.categoryMastery[cat] || { rounds: 0, avgScore: 0 };
            return (
              <div
                key={cat}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {categoryIcons[cat]}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      {categoryLabels[cat]}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      {mastery.rounds} {mastery.rounds === 1 ? 'round' : 'rounds'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold font-mono text-amber-400">
                    {mastery.avgScore > 0 ? `${mastery.avgScore}/100` : '—'}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500">
                    Avg Score
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved Conversation History List */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              Saved Conversation Vault
            </h2>
            <p className="text-xs text-slate-400">
              Full transcripts, dimensional scorecards, and moment-by-moment feedback from past spars
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {userStats.history.length} Saved Records
          </span>
        </div>

        {userStats.history.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 italic py-4">
            Completed conversations will be saved here automatically with transcripts and scores.
          </p>
        ) : (
          <div className="space-y-3">
            {userStats.history.map((evalItem) => {
              const isExpanded = expandedRoundId === evalItem.id;
              const dateStr = new Date(evalItem.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={evalItem.id}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden transition-colors"
                >
                  {/* Card Header Row */}
                  <div
                    onClick={() => setExpandedRoundId(isExpanded ? null : evalItem.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span>{dateStr}</span>
                        <span>·</span>
                        <span className="capitalize">{evalItem.difficulty}</span>
                        <span>·</span>
                        <span>{evalItem.durationSeconds}s</span>
                      </div>
                      <h3 className="text-sm font-bold text-white font-display">
                        {evalItem.scenarioTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-extrabold font-mono text-amber-400">
                          {evalItem.overallScore}/100
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {evalItem.eloChange.delta >= 0 ? `+${evalItem.eloChange.delta}` : evalItem.eloChange.delta} Elo
                        </div>
                      </div>

                      <div className="p-1 rounded-lg text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Transcript & Subscore Details */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-800/60 space-y-4 text-xs">
                      {/* Subscores Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Relevance</span>
                          <span className="font-mono font-bold text-white">{evalItem.scores.relevance}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Specificity</span>
                          <span className="font-mono font-bold text-white">{evalItem.scores.specificity}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Flow</span>
                          <span className="font-mono font-bold text-white">{evalItem.scores.conversationalFlow}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Credibility</span>
                          <span className="font-mono font-bold text-amber-300">{evalItem.scores.credibility}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Accuracy</span>
                          <span className="font-mono font-bold text-sky-300">{evalItem.scores.factualAccuracy}</span>
                        </div>
                      </div>

                      <p className="text-slate-300 italic pt-1">
                        "{evalItem.deliveryVsAccuracyAnalysis}"
                      </p>

                      {/* Saved Transcript Dialogue */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                          Recorded Transcript:
                        </span>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                          {evalItem.transcript.map((t, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl ${
                                t.role === 'user'
                                  ? 'bg-amber-950/20 border border-amber-900/30 text-amber-100'
                                  : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                              }`}
                            >
                              <span className="font-mono text-[10px] opacity-60 block">
                                {t.speakerName}
                              </span>
                              <p className="text-xs">{t.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
