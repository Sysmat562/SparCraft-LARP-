import React, { useState } from 'react';
import { RotateCcw, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { MomentBreakdown, SparScenario } from '../types/spar';

interface RetryMomentModalProps {
  moment: MomentBreakdown;
  scenario: SparScenario;
  onClose: () => void;
}

export const RetryMomentModal: React.FC<RetryMomentModalProps> = ({
  moment,
  scenario,
  onClose,
}) => {
  const [userNewResponse, setUserNewResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryResult, setRetryResult] = useState<{
    characterReaction: string;
    improvementRating: string;
    keyImprovement: string;
    newCredibilityScore: number;
  } | null>(null);

  const handleSubmitRetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNewResponse.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/spar/retry-moment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          challengePrompt: moment.retryPrompt || moment.aiQuote,
          userNewResponse: userNewResponse.trim(),
        }),
      });

      const data = await response.json();
      setRetryResult(data);
    } catch (err) {
      console.error('Error submitting retry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 space-y-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>INTERACTIVE WEAK MOMENT RETRY</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Redo the Exchange
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* The Original Exchange */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-mono text-sky-400 block">
              {scenario.character.name}'s Challenging Probe:
            </span>
            <p className="text-sm text-slate-200 italic font-medium">
              "{moment.retryPrompt || moment.aiQuote}"
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-1">
            <div className="flex items-center justify-between text-amber-400/90 font-mono text-[11px]">
              <span>Your Original Response:</span>
              <span>Tag: {moment.tag}</span>
            </div>
            <p className="text-slate-300 italic">
              "{moment.userQuote}"
            </p>
            <p className="text-amber-200/80 pt-1 font-sans">
              Feedback: {moment.feedback}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-xs space-y-1">
            <span className="text-emerald-400 font-mono text-[11px] block">
              Suggested High-Impact Alternative:
            </span>
            <p className="text-emerald-100 italic">
              "{moment.suggestedAlternative}"
            </p>
          </div>
        </div>

        {/* User New Response Form or Result */}
        {!retryResult ? (
          <form onSubmit={handleSubmitRetry} className="space-y-3">
            <label className="text-xs font-mono text-slate-300 block">
              Deliver your new comeback (try anchoring with a concrete name, number, or sharp confidence):
            </label>
            <textarea
              rows={3}
              value={userNewResponse}
              onChange={(e) => setUserNewResponse(e.target.value)}
              placeholder="e.g. 'Actually, I run a 48-hour cold fermentation with 18% corn oil for that signature crunch...'"
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!userNewResponse.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <span>Evaluating Delivery...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Test Comeback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sky-400">
                  {scenario.character.name}'s Reaction:
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
                  Credibility: {retryResult.newCredibilityScore}/100
                </span>
              </div>
              <p className="text-sm font-medium text-white italic">
                "{retryResult.characterReaction}"
              </p>
              <div className="pt-2 border-t border-slate-800/70 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{retryResult.keyImprovement}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setRetryResult(null);
                  setUserNewResponse('');
                }}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Try Another Angle
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
