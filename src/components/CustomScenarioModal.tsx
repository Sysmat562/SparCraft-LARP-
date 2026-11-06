import React, { useState } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';
import { SparScenario, ScenarioCategory, DifficultyLevel } from '../types/spar';
import { SCENARIO_CATEGORIES } from '../data/scenarios';

interface CustomScenarioModalProps {
  onClose: () => void;
  onSaveScenario: (scenario: SparScenario) => void;
}

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  onClose,
  onSaveScenario,
}) => {
  const [category, setCategory] = useState<ScenarioCategory>('bluff_expert');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [premise, setPremise] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [characterRole, setCharacterRole] = useState('');
  const [challengeStyle, setChallengeStyle] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('adept');
  const [durationSeconds, setDurationSeconds] = useState<number>(90);
  const [initialMessage, setInitialMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim() || !characterName.trim()) return;

    const categoryObj = SCENARIO_CATEGORIES.find((c) => c.id === category);

    const newScenario: SparScenario = {
      id: `custom-${Date.now()}`,
      category,
      categoryLabel: categoryObj?.label || 'Custom Spar',
      title: title.trim(),
      topic: topic.trim(),
      premise: premise.trim() || `A spontaneous conversation about ${topic}.`,
      character: {
        name: characterName.trim(),
        role: characterRole.trim() || 'Conversational Sparring Partner',
        avatarSeed: characterName.toLowerCase().replace(/\s+/g, '-'),
        personality: 'Opinionated, sharp, and authentic.',
        challengeStyle: challengeStyle.trim() || 'Probes for concrete specifics, catches vague answers, and tests conviction.',
      },
      difficulty,
      suggestedDurationSeconds: durationSeconds,
      initialMessage: initialMessage.trim() || `Alright, I hear you have some strong thoughts on ${topic}. Let's hear them—what's your real angle?`,
      sampleQuestions: [],
    };

    onSaveScenario(newScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CUSTOM CONVERSATION BUILDER</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Forge a New Sparring Drill
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block">Scenario Archetype</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCENARIO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 text-xs font-medium rounded-xl border text-left transition-all ${
                    category === cat.id
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 block">Drill Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Vintage Leather Shoe Purist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 block">Niche Topic / Hot Take</label>
              <input
                type="text"
                required
                placeholder="e.g. Goodyear Welt Stitching"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Premise */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 block">Social Premise & Setting</label>
            <textarea
              rows={2}
              placeholder="e.g. You are at an upscale cobbler shop and claim you only wear bespoke hand-welted leather oxfords..."
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {/* Character Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 block">Opponent Character Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dominic Croft"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 block">Character Role / Occupation</label>
              <input
                type="text"
                placeholder="e.g. Master Cobbler & Historian"
                value={characterRole}
                onChange={(e) => setCharacterRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Character Challenge Style */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 block">How They Challenge You</label>
            <input
              type="text"
              placeholder="e.g. Probes about French calfskin tanning, leather soles in the rain, and catchphrase bluffs."
              value={challengeStyle}
              onChange={(e) => setChallengeStyle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Character's Opening Gambit */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 block">Opening Gambit / First Spoken Line</label>
            <input
              type="text"
              placeholder="e.g. Did you just claim blake stitching holds up better than Goodyear welting?"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Difficulty & Duration */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 block">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 capitalize focus:outline-none focus:border-amber-500/50 font-mono"
              >
                <option value="novice">Novice</option>
                <option value="adept">Adept</option>
                <option value="master">Master</option>
                <option value="grandmaster">Grandmaster</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 block">Round Length</label>
              <select
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
              >
                <option value={60}>60s Blitz</option>
                <option value={90}>90s Standard</option>
                <option value={120}>120s Extended</option>
                <option value={180}>180s Deep Dive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save & Add to Deck</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
