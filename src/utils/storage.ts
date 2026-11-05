import { PerformanceEvaluation, UserStats, SparScenario, ScenarioCategory } from '../types/spar';

const STATS_KEY = 'sparcraft_user_stats_v1';
const CUSTOM_SCENARIOS_KEY = 'sparcraft_custom_scenarios_v1';

const INITIAL_STATS: UserStats = {
  currentElo: 1200,
  highestElo: 1200,
  firstEverScore: null,
  bestScore: 0,
  rollingLast3Avg: 0,
  totalSparRounds: 0,
  winCount: 0,
  totalMinutesSparred: 0,
  categoryMastery: {
    bluff_expert: { rounds: 0, avgScore: 0 },
    defend_hot_take: { rounds: 0, avgScore: 0 },
    join_ongoing: { rounds: 0, avgScore: 0 },
    curveball_question: { rounds: 0, avgScore: 0 },
    improv_story: { rounds: 0, avgScore: 0 },
  },
  history: [],
};

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    
    // Compute firstEverScore, bestScore, and rollingLast3Avg if not already stored
    const history: PerformanceEvaluation[] = parsed.history || [];
    let firstEverScore = parsed.firstEverScore ?? null;
    let bestScore = parsed.bestScore ?? 0;
    let rollingLast3Avg = parsed.rollingLast3Avg ?? 0;

    if (history.length > 0) {
      if (firstEverScore === null) {
        // Oldest item in history is the first ever score
        firstEverScore = history[history.length - 1].overallScore;
      }
      if (!bestScore) {
        bestScore = Math.max(...history.map((h) => h.overallScore));
      }
      const recent3 = history.slice(0, 3);
      rollingLast3Avg = Number((recent3.reduce((sum, h) => sum + h.overallScore, 0) / recent3.length).toFixed(1));
    }

    return {
      ...INITIAL_STATS,
      ...parsed,
      firstEverScore,
      bestScore,
      rollingLast3Avg,
      categoryMastery: {
        ...INITIAL_STATS.categoryMastery,
        ...(parsed.categoryMastery || {}),
      },
      history,
    };
  } catch (e) {
    console.error('Failed to load user stats from localStorage:', e);
    return INITIAL_STATS;
  }
}

export function saveEvaluation(evaluation: PerformanceEvaluation): UserStats {
  const current = loadUserStats();

  const newTotalRounds = current.totalSparRounds + 1;
  const isWin = evaluation.overallScore >= 75;
  const newWinCount = current.winCount + (isWin ? 1 : 0);
  const durationMin = Math.round(evaluation.durationSeconds / 60) || 1;
  const newMinutes = current.totalMinutesSparred + durationMin;
  const newElo = evaluation.eloChange.newElo;
  const newHighestElo = Math.max(current.highestElo, newElo);

  // First ever score
  const firstEverScore = current.firstEverScore !== null ? current.firstEverScore : evaluation.overallScore;

  // Best score
  const bestScore = Math.max(current.bestScore || 0, evaluation.overallScore);

  // New combined history (latest first)
  const updatedHistory = [evaluation, ...current.history].slice(0, 50);

  // Rolling last 3 avg
  const last3 = updatedHistory.slice(0, 3);
  const rollingLast3Avg = Number((last3.reduce((sum, h) => sum + h.overallScore, 0) / last3.length).toFixed(1));

  // Update category stats
  const cat = evaluation.category;
  const prevCat = current.categoryMastery[cat] || { rounds: 0, avgScore: 0 };
  const newCatRounds = prevCat.rounds + 1;
  const newCatAvg = Math.round((prevCat.avgScore * prevCat.rounds + evaluation.overallScore) / newCatRounds);

  const updatedStats: UserStats = {
    ...current,
    currentElo: newElo,
    highestElo: newHighestElo,
    firstEverScore,
    bestScore,
    rollingLast3Avg,
    totalSparRounds: newTotalRounds,
    winCount: newWinCount,
    totalMinutesSparred: newMinutes,
    categoryMastery: {
      ...current.categoryMastery,
      [cat]: {
        rounds: newCatRounds,
        avgScore: newCatAvg,
      },
    },
    history: updatedHistory,
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
  } catch (e) {
    console.error('Failed to persist stats:', e);
  }

  return updatedStats;
}

export function loadCustomScenarios(): SparScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_SCENARIOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomScenario(scenario: SparScenario): SparScenario[] {
  const existing = loadCustomScenarios();
  const updated = [scenario, ...existing.filter((s) => s.id !== scenario.id)];
  try {
    localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function deleteCustomScenario(id: string): SparScenario[] {
  const existing = loadCustomScenarios();
  const updated = existing.filter((s) => s.id !== id);
  try {
    localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}
