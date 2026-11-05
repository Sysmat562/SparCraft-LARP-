import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Send, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { SparScenario, DifficultyLevel, ConversationTurn, PerformanceEvaluation } from '../types/spar';
import { useVoiceConversation } from '../hooks/useVoiceConversation';
import { playAiSpeech, stopAllSpeech } from '../utils/audioPlayer';
import { AudioWaveform } from './AudioWaveform';

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
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>('');

  // Conversation turns
  const [transcript, setTranscript] = useState<ConversationTurn[]>([]);
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null);

  // Play opening gambit on start
  const hasInitializedRef = useRef(false);

  // Handler when user finishes a voice turn
  const handleUserMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isThinking || isAiSpeaking) return;

    const userTurn: ConversationTurn = {
      id: `turn-user-${Date.now()}`,
      role: 'user',
      speakerName: 'You',
      text: userText.trim(),
      timestamp: Date.now(),
    };

    const newTranscript = [...transcript, userTurn];
    setTranscript(newTranscript);
    setIsThinking(true);
    setManualText('');

    try {
      const response = await fetch('/api/spar/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: { ...scenario, difficulty },
          history: newTranscript.map((t) => ({ role: t.role, text: t.text })),
          userMessage: userText.trim(),
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
      setIsThinking(false);

      // Play AI Voice
      await playAiSpeech(
        aiReply,
        scenario.character.voiceName,
        () => setIsAiSpeaking(true),
        () => setIsAiSpeaking(false)
      );
    } catch (err) {
      console.error('Failed to send turn:', err);
      setIsThinking(false);
      setIsAiSpeaking(false);
    }
  }, [isThinking, isAiSpeaking, transcript, scenario, difficulty, durationSeconds, timeLeft]);

  // Hook for hands-free continuous voice recognition & silence detection
  const {
    isListening,
    interimText,
    audioLevel,
    micPermission,
    isHandsfreePaused,
    setIsHandsfreePaused,
    submitCurrentSpeech,
    clearSpeech,
  } = useVoiceConversation({
    onUserMessageComplete: handleUserMessage,
    isAiSpeaking,
    isRoundActive: isRoundActive && !isEvaluating,
    silenceThresholdMs: 1400, // natural conversational pause
  });

  // Start round with character's opening gambit
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initialTurn: ConversationTurn = {
      id: `turn-initial-${Date.now()}`,
      role: 'assistant',
      speakerName: scenario.character.name,
      text: scenario.initialMessage,
      timestamp: Date.now(),
    };

    setTranscript([initialTurn]);

    // Speak initial message
    playAiSpeech(
      scenario.initialMessage,
      scenario.character.voiceName,
      () => setIsAiSpeaking(true),
      () => setIsAiSpeaking(false)
    );
  }, [scenario]);

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

  // Scroll transcript down as messages arrive
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText]);

  // Interrupt AI button
  const handleInterrupt = () => {
    stopAllSpeech();
    setIsAiSpeaking(false);
  };

  // Conclude round and request evaluation
  const handleFinishRound = async () => {
    stopAllSpeech();
    setIsRoundActive(false);
    setIsAiSpeaking(false);
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
          ? "No spoken or written input was detected. Conversational sparring requires active participation."
          : "Steady conversational footing recorded.",
        moments: [],
        eloChange: {
          previousElo: 1200,
          newElo: isZeroParticipation ? 1170 : 1205,
          delta: isZeroParticipation ? -30 : 5,
          explanation: isZeroParticipation ? "Zero participation / silence penalty." : "Completed round under target difficulty.",
        },
        generalAdvice: isZeroParticipation
          ? "Start speaking within the first 5 seconds next time!"
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
            Diagnosing your relevance, specificity, conversational flow, adaptability, and separating vocal credibility from factual accuracy.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
          <span>Benchmarking against {difficulty} Elo baseline</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Arena HUD Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-display">
            {scenario.character.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-amber-400 font-semibold">{scenario.categoryLabel}</span>
              <span>·</span>
              <span className="capitalize">{difficulty}</span>
            </div>
            <h2 className="text-base font-bold text-white font-display">
              {scenario.title}
            </h2>
          </div>
        </div>

        {/* Timer & Conclude Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 font-mono text-sm">
            <span className="text-slate-400 text-xs">TIME</span>
            <span className={`font-bold ${timeLeft <= 15 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {formattedTime}
            </span>
          </div>

          <button
            onClick={handleFinishRound}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5 fill-slate-300" />
            <span>Wrap Up Early</span>
          </button>

          <button
            onClick={() => {
              stopAllSpeech();
              onCancelRound();
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
            title="Abandon Spar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Mic Permission Warning Banner */}
      {micPermission === 'denied' && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-3 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Microphone access is blocked in your browser. You can still participate seamlessly using the quick text input below!
          </span>
        </div>
      )}

      {/* Main Stage: Character Persona + Dynamic Audio Waveform */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Opponent Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {scenario.character.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-white">
                  {scenario.character.name}
                </h3>
                <span className="text-xs font-mono text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-md">
                  {scenario.character.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 italic">
                "{scenario.character.challengeStyle}"
              </p>
            </div>
          </div>

          {/* Quick Context / Cheat Sheet Toggle */}
          {scenario.bluffKnowledgeHints && scenario.bluffKnowledgeHints.length > 0 && (
            <button
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-amber-300 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showCheatSheet ? 'Hide Cheat Sheet' : 'Topic Cheat Sheet'}</span>
              {showCheatSheet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Collapsible Bluff Knowledge Hints */}
        {showCheatSheet && scenario.bluffKnowledgeHints && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-1.5 text-xs text-amber-200/90 font-mono">
            <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] block mb-1">
              Quick Reference Bluff Anchors:
            </span>
            {scenario.bluffKnowledgeHints.map((hint, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-amber-500">·</span>
                <span>{hint}</span>
              </div>
            ))}
          </div>
        )}

        {/* Dual Live Audio Waveform */}
        <AudioWaveform
          isListening={isListening && !isAiSpeaking}
          isAiSpeaking={isAiSpeaking}
          isThinking={isThinking}
          audioLevel={audioLevel}
          characterName={scenario.character.name}
        />

        {/* Hands-free Voice Activity & Interim Transcript Bar */}
        <div className="min-h-[56px] p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-center">
          {isAiSpeaking ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono text-sky-300 italic truncate">
                {scenario.character.name} is speaking...
              </span>
              <button
                onClick={handleInterrupt}
                className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors shrink-0"
              >
                Interrupt AI
              </button>
            </div>
          ) : isThinking ? (
            <span className="text-xs font-mono text-amber-400 animate-pulse">
              Formulating counter-challenge...
            </span>
          ) : interimText ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400">Hands-Free Speech Detected</span>
                <span className="text-slate-500">Pausing naturally triggers turn</span>
              </div>
              <p className="text-sm font-medium text-white italic">
                "{interimText}"
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>{isListening ? 'Speak freely into your microphone...' : 'Microphone standby'}</span>
              <span className="hidden sm:inline">Pause ~1.4s to send</span>
            </div>
          )}
        </div>

        {/* Manual Hand-over / Nudge Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHandsfreePaused(!isHandsfreePaused)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl border flex items-center gap-1.5 transition-colors ${
                isHandsfreePaused
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {isHandsfreePaused ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isHandsfreePaused ? 'Resume Mic' : 'Mute Mic'}</span>
            </button>

            {interimText && (
              <>
                <button
                  onClick={submitCurrentSpeech}
                  className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3 fill-slate-950" />
                  <span>Send Turn Now</span>
                </button>
                <button
                  onClick={clearSpeech}
                  className="px-2.5 py-1.5 text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Natural two-way dialogue · No buttons required
          </div>
        </div>
      </div>

      {/* Live Conversation Transcript Feed */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Live Sparring Exchange</span>
          </div>
          <span>{transcript.length} volleys</span>
        </div>

        {/* Scrollable Transcript Messages */}
        <div className="max-h-72 overflow-y-auto space-y-3.5 pr-2">
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
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                    isUser
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-sky-600 text-white'
                  }`}
                >
                  {isUser ? 'U' : scenario.character.name.charAt(0)}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    isUser
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-none'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="text-[10px] font-mono mb-1 opacity-60">
                    {turn.speakerName}
                  </div>
                  <p>{turn.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={transcriptBottomRef} />
        </div>

        {/* Bottom Text Input Fallback */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualText.trim()) {
              handleUserMessage(manualText);
            }
          }}
          className="pt-3 border-t border-slate-800/60 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your comeback here if in a loud room or mic is muted..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isThinking || isAiSpeaking}
            className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!manualText.trim() || isThinking || isAiSpeaking}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
