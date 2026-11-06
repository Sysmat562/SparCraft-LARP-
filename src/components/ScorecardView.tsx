import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  History,
  ShieldCheck,
  Zap,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PerformanceEvaluation, UserStats, SparScenario, MomentBreakdown } from '../types/spar';
import { getEloTier } from '../utils/elo';
import { RetryMomentModal } from './RetryMomentModal';

interface ScorecardViewProps {
  evaluation: PerformanceEvaluation;
  userStats: UserStats;
  scenario: SparScenario;
  onSparAgain: () => void;
  onBrowseScenarios: () => void;
  onViewProgress: () => void;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  evaluation,
  userStats,
  scenario,
  onSparAgain,
  onBrowseScenarios,
  onViewProgress,
}) => {
  const [activeRetryMoment, setActiveRetryMoment] = useState<MomentBreakdown | null>(null);

  // Trigger celebratory confetti on high scores or new best (never on 0)
  useEffect(() => {
    if (evaluation.overallScore >= 85 || (evaluation.overallScore >= (userStats.bestScore || 0) && evaluation.overallScore > 50)) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#38BDF8', '#10B981'],
      });
    }
  }, [evaluation.overallScore, userStats.bestScore]);

  const { scores, eloChange } = evaluation;
  const isPositiveElo = eloChange.delta >= 0;

  // Grade classification
  const getGrade = (score: number) => {
    if (score === 0) return { grade: 'F', label: 'Zero Participation', color: 'text-rose-500' };
    if (score >= 93) return { grade: 'A+', label: 'Virtuoso Delivery', color: 'text-emerald-400' };
    if (score >= 85) return { grade: 'A', label: 'Compelling Swagger', color: 'text-emerald-300' };
    if (score >= 78) return { grade: 'B+', label: 'Solid Composure', color: 'text-sky-300' };
    if (score >= 70) return { grade: 'B', label: 'Capable Volley', color: 'text-amber-300' };
    if (score >= 60) return { grade: 'C', label: 'Hesitant Recovery', color: 'text-amber-400' };
    if (score >= 40) return { grade: 'D', label: 'Needs Reps', color: 'text-rose-400' };
    return { grade: 'F', label: 'Struggling Under Pressure', color: 'text-rose-500' };
  };

  const gradeInfo = getGrade(evaluation.overallScore);

  // Comparison metrics requested by user
  const firstScore = userStats.firstEverScore;
  const deltaFromFirst = firstScore !== null ? evaluation.overallScore - firstScore : null;
  const rollingAvg = userStats.rollingLast3Avg || evaluation.overallScore;
  const deltaFromRolling = Number((evaluation.overallScore - rollingAvg).toFixed(1));
  const isNewBest = evaluation.overallScore >= (userStats.bestScore || 0) && userStats.totalSparRounds > 1;

  const subscoresList = [
    { label: 'Relevance', score: scores.relevance, desc: 'Staying on premise & directly engaging' },
    { label: 'Specificity', score: scores.specificity, desc: 'Concrete nouns, numbers & vivid sensory anchors' },
    { label: 'Conversational Flow', score: scores.conversationalFlow, desc: 'Pacing, volley timing & natural rhythm' },
    { label: 'Adaptability', score: scores.adaptability, desc: 'Absorbing surprises & pivoting under scrutiny' },
    { label: 'Delivery Credibility', score: scores.credibility, desc: 'Conviction, unapologetic confidence & swagger' },
    { label: 'Factual Accuracy', score: scores.factualAccuracy, desc: 'Actual technical & real-world precision' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Score & Grade Header */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>ROUND DIAGNOSTIC SCORECARD</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{evaluation.difficulty} Spar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              {evaluation.scenarioTitle}
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Sparred with {scenario.character.name} for {evaluation.durationSeconds}s
            </p>
          </div>

          {/* Primary Overall Score Lockup */}
          <div className="flex items-center gap-4 shrink-0 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
                {evaluation.overallScore}
                <span className="text-lg text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Overall Score
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-black font-display ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </div>
              <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                {gradeInfo.label}
              </div>
            </div>
          </div>
        </div>

        {/* Progression Over Time: First Ever, Rolling Last 3, Best Score */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* 1. First Ever Score */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>First Ever Score</span>
              <Award className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">
                {firstScore !== null ? `${firstScore}/100` : `${evaluation.overallScore}/100`}
              </span>
              {deltaFromFirst !== null && (
                <span className={`text-xs font-mono font-semibold ${deltaFromFirst >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {deltaFromFirst >= 0 ? `+${deltaFromFirst}` : deltaFromFirst} pts
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">Your baseline debut score</span>
          </div>

          {/* 2. Rolling Last 3 Average */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Rolling Last 3 Avg</span>
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-sky-300">
                {userStats.rollingLast3Avg || evaluation.overallScore}/100
              </span>
              <span className={`text-xs font-mono font-semibold ${deltaFromRolling >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {deltaFromRolling >= 0 ? `+${deltaFromRolling}` : deltaFromRolling} pts
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">Recent form trend</span>
          </div>

          {/* 3. Best Score (All-Time High) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>All-Time Best</span>
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-amber-400">
                {Math.max(userStats.bestScore, evaluation.overallScore)}/100
              </span>
              {isNewBest && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                  NEW RECORD!
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">Peak performance record</span>
          </div>
        </div>

        {/* Elo Rating Update Strip */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-semibold">Elo Rating Adjustment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{userStats.currentElo - eloChange.delta} → {userStats.currentElo} Elo</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${isPositiveElo ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                {isPositiveElo ? `+${eloChange.delta}` : eloChange.delta} Elo
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {eloChange.explanation}
          </p>
        </div>
      </div>

      {/* 5-Dimensional Subscores Breakdown Grid */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              Dimensional Subscores Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Granular scoring across essential spontaneous conversational competencies
            </p>
          </div>
          <button
            onClick={onViewProgress}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All-Time Trajectory</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscoresList.map((item) => {
            const pct = Math.min(100, Math.max(0, item.score));
            let barColor = 'bg-amber-500';
            if (pct >= 85) barColor = 'bg-emerald-400';
            else if (pct >= 70) barColor = 'bg-sky-400';
            else if (pct < 55) barColor = 'bg-rose-400';

            return (
              <div key={item.label} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className="font-mono font-bold text-white">{item.score}/100</span>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Delivery Credibility vs Factual Accuracy Spotlight */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>DELIVERY CREDIBILITY VS. FACTUAL ACCURACY</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 font-mono">
              <div>
                <span className="text-slate-400 block text-[11px]">Convincing Delivery:</span>
                <span className="text-amber-300 font-bold text-sm">{scores.credibility}/100</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[11px]">Factual Accuracy:</span>
                <span className="text-sky-300 font-bold text-sm">{scores.factualAccuracy}/100</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 sm:max-w-md font-sans">
              {evaluation.deliveryVsAccuracyAnalysis}
            </p>
          </div>
        </div>
      </div>

      {/* Moment-by-Moment Quotations & Improvements */}
      {evaluation.moments && evaluation.moments.length > 0 && (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              Moment-by-Moment Diagnostic Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific verbatim quotes analyzed with tactical alternatives and one-click retries
            </p>
          </div>

          <div className="space-y-4">
            {evaluation.moments.map((moment, index) => {
              const isStrength = moment.assessment === 'strength';
              return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isStrength
                      ? 'bg-emerald-950/15 border-emerald-800/40'
                      : 'bg-amber-950/15 border-amber-800/40'
                  }`}
                >
                  {/* Tag & Assessment Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      {isStrength ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <span className={isStrength ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'}>
                        {isStrength ? 'High-Impact Volley' : 'Vague / Hesitant Moment'}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">{moment.tag}</span>
                    </div>

                    {!isStrength && (
                      <button
                        onClick={() => setActiveRetryMoment(moment)}
                        className="px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry Moment</span>
                      </button>
                    )}
                  </div>

                  {/* Dialogue Quote Exchange */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1">
                      <span className="text-[11px] font-mono text-sky-400 block">
                        {scenario.character.name}:
                      </span>
                      <p className="italic text-slate-300">
                        "{moment.aiQuote}"
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1">
                      <span className="text-[11px] font-mono text-amber-400 block">
                        Your Response:
                      </span>
                      <p className="italic text-white font-medium">
                        "{moment.userQuote}"
                      </p>
                    </div>
                  </div>

                  {/* Feedback & Alternative */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <p className="text-slate-300">
                      <strong className="text-slate-200">Analysis:</strong> {moment.feedback}
                    </p>
                    {moment.suggestedAlternative && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-emerald-200/90 italic">
                        <strong className="font-mono text-emerald-400 text-[11px] not-italic block mb-0.5">
                          Sharper Comeback Alternative:
                        </strong>
                        "{moment.suggestedAlternative}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* General Coaching Advice */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-mono font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>KEY TAKEAWAYS FOR YOUR NEXT SPAR</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans text-sm">
          {evaluation.generalAdvice}
        </p>
      </div>

      {/* Action Footer Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBrowseScenarios}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Browse Other Scenarios
          </button>
          <button
            onClick={onViewProgress}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Progression Vault</span>
          </button>
        </div>

        <button
          onClick={onSparAgain}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Spar Again on This Topic</span>
        </button>
      </div>

      {/* Interactive Retry Modal */}
      {activeRetryMoment && (
        <RetryMomentModal
          moment={activeRetryMoment}
          scenario={scenario}
          onClose={() => setActiveRetryMoment(null)}
        />
      )}
    </div>
  );
};
