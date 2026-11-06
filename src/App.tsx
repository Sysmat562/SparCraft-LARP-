/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  SparScenario, 
  DifficultyLevel, 
  PerformanceEvaluation, 
  UserStats 
} from './types/spar';
import { PRESET_SCENARIOS } from './data/scenarios';
import { 
  loadUserStats, 
  saveEvaluation, 
  loadCustomScenarios, 
  saveCustomScenario 
} from './utils/storage';
import { calculateEloDelta } from './utils/elo';
import { Header } from './components/Header';
import { LobbyView } from './components/LobbyView';
import { ArenaView } from './components/ArenaView';
import { ScorecardView } from './components/ScorecardView';
import { ProgressView } from './components/ProgressView';
import { CustomScenarioModal } from './components/CustomScenarioModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'lobby' | 'arena' | 'scorecard' | 'progress' | 'history'>('lobby');
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats);
  const [customScenarios, setCustomScenarios] = useState<SparScenario[]>(loadCustomScenarios);
  
  // Active sparring session state
  const [activeScenario, setActiveScenario] = useState<SparScenario | null>(null);
  const [activeDuration, setActiveDuration] = useState<number>(90);
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>('adept');
  const [latestEvaluation, setLatestEvaluation] = useState<PerformanceEvaluation | null>(null);

  // Custom scenario modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Sync stats on mount
  useEffect(() => {
    setUserStats(loadUserStats());
    setCustomScenarios(loadCustomScenarios());
  }, []);

  // Launch a scenario
  const handleSelectScenario = (
    scenario: SparScenario,
    durationSeconds: number,
    difficulty: DifficultyLevel
  ) => {
    setActiveScenario(scenario);
    setActiveDuration(durationSeconds);
    setActiveDifficulty(difficulty);
    setCurrentView('arena');
  };

  // Quick Random Spar
  const handleQuickSpar = () => {
    const all = [...customScenarios, ...PRESET_SCENARIOS];
    const randomScenario = all[Math.floor(Math.random() * all.length)];
    const difficulties: DifficultyLevel[] = ['adept', 'master'];
    const randomDiff = difficulties[Math.floor(Math.random() * difficulties.length)];
    handleSelectScenario(randomScenario, 90, randomDiff);
  };

  // Complete round and calculate Elo & stats update
  const handleConcludeRound = (rawEvaluation: PerformanceEvaluation) => {
    const currentElo = userStats.currentElo;
    const eloResult = calculateEloDelta(
      currentElo,
      rawEvaluation.difficulty,
      rawEvaluation.overallScore,
      rawEvaluation.scores,
      userStats.totalSparRounds
    );

    const fullEvaluation: PerformanceEvaluation = {
      ...rawEvaluation,
      eloChange: {
        previousElo: currentElo,
        newElo: eloResult.newElo,
        delta: eloResult.delta,
        explanation: eloResult.explanation,
      },
    };

    // Save and update userStats state with firstEverScore, rollingLast3Avg, bestScore
    const updatedStats = saveEvaluation(fullEvaluation);
    setUserStats(updatedStats);
    setLatestEvaluation(fullEvaluation);
    setCurrentView('scorecard');
  };

  // Re-spar on the same scenario
  const handleSparAgain = () => {
    if (activeScenario) {
      setCurrentView('arena');
    } else {
      setCurrentView('lobby');
    }
  };

  // Save new custom scenario
  const handleSaveCustom = (newScenario: SparScenario) => {
    const updated = saveCustomScenario(newScenario);
    setCustomScenarios(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* 3-Zone Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onQuickSpar={handleQuickSpar}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        userStats={userStats}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'lobby' && (
          <LobbyView
            customScenarios={customScenarios}
            userStats={userStats}
            onSelectScenario={handleSelectScenario}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
          />
        )}

        {currentView === 'arena' && activeScenario && (
          <ArenaView
            scenario={activeScenario}
            durationSeconds={activeDuration}
            difficulty={activeDifficulty}
            onConcludeRound={handleConcludeRound}
            onCancelRound={() => setCurrentView('lobby')}
          />
        )}

        {currentView === 'scorecard' && latestEvaluation && activeScenario && (
          <ScorecardView
            evaluation={latestEvaluation}
            userStats={userStats}
            scenario={activeScenario}
            onSparAgain={handleSparAgain}
            onBrowseScenarios={() => setCurrentView('lobby')}
            onViewProgress={() => setCurrentView('progress')}
          />
        )}

        {(currentView === 'progress' || currentView === 'history') && (
          <ProgressView
            userStats={userStats}
            onSelectSavedRound={(evalItem) => {
              setLatestEvaluation(evalItem);
              const matchedScenario = [...customScenarios, ...PRESET_SCENARIOS].find((s) => s.id === evalItem.scenarioId) || PRESET_SCENARIOS[0];
              setActiveScenario(matchedScenario);
              setCurrentView('scorecard');
            }}
          />
        )}
      </main>

      {/* Custom Scenario Builder Modal */}
      {isCustomModalOpen && (
        <CustomScenarioModal
          onClose={() => setIsCustomModalOpen(false)}
          onSaveScenario={handleSaveCustom}
        />
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">SparCraft</span>
            <span aria-hidden="true">·</span>
            <span>Spontaneous Thinking-on-Your-Feet Improv Gym</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Fast Conversational Volleys</span>
            <span>·</span>
            <span>Elo Progression Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
