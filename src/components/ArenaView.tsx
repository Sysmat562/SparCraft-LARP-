import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Square, 
  Send, 
  Sparkles, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { SparScenario, DifficultyLevel, ConversationTurn, PerformanceEvaluation } from '../types/spar';

interface ArenaViewProps {
  scenario: SparScenario;
  durationSeconds: number;
  difficulty: DifficultyLevel;
  onConcludeRound: (evaluation: PerformanceEvaluation) => void;
  onCancelRound: () => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  scenario,
  durationSeconds,
  difficulty,
  onConcludeRound,
  onCancelRound,
}) => {
  // Round state
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [isRoundActive, setIsRoundActive] = useState<boolean>(true);
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);
  const [userDraft, setUserDraft] = useState<string>('');

  // Pacing & timing metrics
  const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());
  const [avgResponseTime, setAvgResponseTime] = useState<number>(0);
  const responseTimesRef = useRef<number[]>([]);

  // Conversation turns
  const [transcript, setTranscript] = useState<ConversationTurn[]>([]);
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize opening gambit on start
  useEffect(() => {
    const initialTurn: ConversationTurn = {
      id: `turn-initial-${Date.now()}`,
      role: 'assistant',
      speakerName: scenario.character.name,
      text: scenario.initialMessage,
      timestamp: Date.now(),
    };

    setTranscript([initialTurn]);
    setTurnStartTime(Date.now());
    textareaRef.current?.focus();
  }, [scenario]);

  // Scroll transcript down as messages arrive
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isAiReplying]);

  // Countdown timer
  useEffect(() => {
    if (!isRoundActive || isEvaluating) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRoundActive, isEvaluating]);

  // Handler to submit user turn
  const handleSubmitTurn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = userDraft.trim();
    if (!textToSend || isAiReplying || !isRoundActive) return;

    // Track response speed for thinking-on-your-feet metric
    const elapsedTurnSec = Math.max(1, Math.round((Date.now() - turnStartTime) / 1000));
    responseTimesRef.current.push(elapsedTurnSec);
    const avgSec = Math.round(
      responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length
    );
    setAvgResponseTime(avgSec);

    const userTurn: ConversationTurn = {
      id: `turn-user-${Date.now()}`,
      role: 'user',
      speakerName: 'You',
      text: textToSend,
      timestamp: Date.now(),
    };

    const newTranscript = [...transcript, userTurn];
    setTranscript(newTranscript);
    setUserDraft('');
    setIsAiReplying(true);

    try {
      const response = await fetch('/api/spar/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: { ...scenario, difficulty },
          history: newTranscript.map((t) => ({ role: t.role, text: t.text })),
          userMessage: textToSend,
          elapsedSeconds: durationSeconds - timeLeft,
        }),
      });

      const data = await response.json();
      const aiReply = data.text || "Let's dig deeper into that point.";

      const aiTurn: ConversationTurn = {
        id: `turn-ai-${Date.now()}`,
        role: 'assistant',
        speakerName: scenario.character.name,
        text: aiReply,
        timestamp: Date.now(),
      };

      setTranscript((prev) => [...prev, aiTurn]);
    } catch (err) {
      console.error('Failed to send turn:', err);
      const fallbackTurn: ConversationTurn = {
        id: `turn-ai-err-${Date.now()}`,
        role: 'assistant',
        speakerName: scenario.character.name,
        text: "Wait a second—give me a concrete detail to back that up.",
        timestamp: Date.now(),
      };
      setTranscript((prev) => [...prev, fallbackTurn]);
    } finally {
      setIsAiReplying(false);
      setTurnStartTime(Date.now());
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  // Conclude round and request evaluation
  const handleFinishRound = async () => {
    setIsRoundActive(false);
    setIsAiReplying(false);
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/spar/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          transcript,
          durationSeconds: durationSeconds - timeLeft,
          difficulty,
        }),
      });

      const evalData = await response.json();
      
      const completeEvaluation: PerformanceEvaluation = {
        id: `eval-${Date.now()}`,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        category: scenario.category,
        difficulty,
        timestamp: Date.now(),
        durationSeconds: durationSeconds - timeLeft,
        overallScore: evalData.overallScore ?? 75,
        scores: evalData.scores ?? {
          relevance: 75,
          specificity: 70,
          conversationalFlow: 75,
          adaptability: 70,
          credibility: 80,
          factualAccuracy: 60,
        },
        deliveryVsAccuracyAnalysis: evalData.deliveryVsAccuracyAnalysis || "Strong confident delivery regardless of factual depth.",
        moments: evalData.moments || [],
        eloChange: {
          previousElo: 1200,
          newElo: 1215,
          delta: 15,
          explanation: "Round completed",
        },
        generalAdvice: evalData.generalAdvice || "Keep up the assertive rhythm.",
        transcript,
      };

      onConcludeRound(completeEvaluation);
    } catch (e) {
      console.error('Evaluation failed:', e);
      const userTurns = transcript.filter((t) => t.role === 'user' && t.text && t.text.trim().length > 0);
      const isZeroParticipation = userTurns.length === 0;

      onConcludeRound({
        id: `eval-${Date.now()}`,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        category: scenario.category,
        difficulty,
        timestamp: Date.now(),
        durationSeconds: durationSeconds - timeLeft,
        overallScore: isZeroParticipation ? 0 : 65,
        scores: isZeroParticipation
          ? { relevance: 0, specificity: 0, conversationalFlow: 0, adaptability: 0, credibility: 0, factualAccuracy: 0 }
          : { relevance: 65, specificity: 60, conversationalFlow: 65, adaptability: 60, credibility: 70, factualAccuracy: 55 },
        deliveryVsAccuracyAnalysis: isZeroParticipation
          ? "No responses were detected during this round."
          : "Steady conversational footing recorded.",
        moments: [],
        eloChange: {
          previousElo: 1200,
          newElo: isZeroParticipation ? 1170 : 1205,
          delta: isZeroParticipation ? -30 : 5,
          explanation: isZeroParticipation ? "Zero participation / forfeit penalty." : "Completed round under target difficulty.",
        },
        generalAdvice: isZeroParticipation
          ? "Start sending your comeback early in the round!"
          : "Sharpen specific vocabulary and keep calm cadence.",
        transcript,
      });
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (isEvaluating) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">
            Analyzing Spontaneous Delivery...
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Diagnosing your relevance, specificity, conversational flow, adaptability, and separating delivery credibility from factual accuracy.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
          <span>Benchmarking against {difficulty} Elo baseline</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Top Arena HUD Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-display text-lg">
            {scenario.character.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-amber-400 font-semibold">{scenario.categoryLabel}</span>
              <span>·</span>
              <span className="capitalize">{difficulty}</span>
              {avgResponseTime > 0 && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-mono">Avg {avgResponseTime}s pacing</span>
                </>
              )}
            </div>
            <h2 className="text-base font-bold text-white font-display">
              {scenario.title}
            </h2>
          </div>
        </div>

        {/* Timer & Conclude Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 font-mono text-sm">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className={`font-bold ${timeLeft <= 15 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {formattedTime}
            </span>
          </div>

          <button
            onClick={handleFinishRound}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5 fill-slate-300" />
            <span>Conclude Spar</span>
          </button>

          <button
            onClick={onCancelRound}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors text-sm"
            title="Abandon Spar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Opponent Profile Card & Quick Reference */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {scenario.character.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-display">{scenario.character.name}</span>
              <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded">
                {scenario.character.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 italic mt-0.5">
              "{scenario.character.challengeStyle}"
            </p>
          </div>
        </div>

        {scenario.bluffKnowledgeHints && scenario.bluffKnowledgeHints.length > 0 && (
          <button
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-amber-300 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{showCheatSheet ? 'Hide Topic Anchors' : 'Topic Cheat Sheet'}</span>
            {showCheatSheet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Collapsible Bluff Knowledge Hints */}
      {showCheatSheet && scenario.bluffKnowledgeHints && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-1.5 text-xs text-amber-200/90 font-mono animate-in fade-in duration-200">
          <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] block mb-1">
            Quick Reference Topic Anchors:
          </span>
          {scenario.bluffKnowledgeHints.map((hint, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-500">·</span>
              <span>{hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Dialogue Stage */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Live Dialogue Sparring</span>
          </div>
          <span>{transcript.length} volleys</span>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="min-h-[280px] max-h-[380px] overflow-y-auto space-y-4 pr-2">
          {transcript.map((turn) => {
            const isUser = turn.role === 'user';
            return (
              <div
                key={turn.id}
                className={`flex gap-3 text-xs sm:text-sm leading-relaxed ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${
                    isUser
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-sky-600 text-white'
                  }`}
                >
                  {isUser ? 'You' : scenario.character.name.charAt(0)}
                </div>

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                    isUser
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-none'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="text-[10px] font-mono mb-1 opacity-60">
                    {turn.speakerName}
                  </div>
                  <p className="whitespace-pre-wrap">{turn.text}</p>
                </div>
              </div>
            );
          })}

          {/* AI Thinking Animation Indicator */}
          {isAiReplying && (
            <div className="flex gap-3 text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-xl shrink-0 bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                {scenario.character.name.charAt(0)}
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-950/80 border border-slate-800 text-sky-400 font-mono text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>{scenario.character.name} is sizing up your comeback...</span>
              </div>
            </div>
          )}

          <div ref={transcriptBottomRef} />
        </div>

        {/* Comeback Input Box */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <form onSubmit={handleSubmitTurn} className="space-y-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={3}
                disabled={isAiReplying || !isRoundActive}
                value={userDraft}
                onChange={(e) => setUserDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitTurn();
                  }
                }}
                placeholder={`Fire back at ${scenario.character.name}... (Press Enter to send, Shift+Enter for new line)`}
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 disabled:opacity-50 resize-none transition-colors shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Anchor with specifics · Avoid vague hand-waving</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!userDraft.trim() || isAiReplying || !isRoundActive}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Send Comeback</span>
                  <Send className="w-3.5 h-3.5 fill-slate-950" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
