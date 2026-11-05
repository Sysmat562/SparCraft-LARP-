import { DifficultyLevel, EvaluationScores } from '../types/spar';

export interface EloTier {
  name: string;
  minElo: number;
  badgeColor: string;
  description: string;
}

export const ELO_TIERS: EloTier[] = [
  { name: 'Conversational Initiate', minElo: 0, badgeColor: 'text-slate-400 bg-slate-800/80 border-slate-700', description: 'Learning basic conversational footing and pacing under pressure.' },
  { name: 'Spontaneous Debater', minElo: 1100, badgeColor: 'text-sky-300 bg-sky-950/60 border-sky-800', description: 'Holding ground with emerging confidence and responsive volleys.' },
  { name: 'Agile Rhetorician', minElo: 1300, badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-800', description: 'Skillfully navigating curveballs and challenging questions.' },
  { name: 'Silver Tongue Pro', minElo: 1500, badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-800', description: 'High composure, vivid specificity, and unflappable conversational swagger.' },
  { name: 'Improv Virtuoso', minElo: 1700, badgeColor: 'text-purple-300 bg-purple-950/60 border-purple-800', description: 'Flawlessly bluffing, adapting, and turning aggressive probes into dialogue art.' },
  { name: 'Grandmaster of Banter', minElo: 1900, badgeColor: 'text-rose-300 bg-rose-950/60 border-rose-800', description: 'Supreme verbal agility, effortless wit, and bulletproof conviction.' },
];

export function getEloTier(elo: number): EloTier {
  for (let i = ELO_TIERS.length - 1; i >= 0; i--) {
    if (elo >= ELO_TIERS[i].minElo) {
      return ELO_TIERS[i];
    }
  }
  return ELO_TIERS[0];
}

const DIFFICULTY_RATINGS: Record<DifficultyLevel, number> = {
  novice: 1050,
  adept: 1300,
  master: 1600,
  grandmaster: 1900,
};

export function calculateEloDelta(
  currentElo: number,
  difficulty: DifficultyLevel,
  overallScore: number,
  scores: EvaluationScores,
  totalRounds: number
): { delta: number; newElo: number; explanation: string } {
  const opponentElo = DIFFICULTY_RATINGS[difficulty];
  
  // Standard Elo expected outcome: E = 1 / (1 + 10^((opponent - player)/400))
  const expectedOutcome = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  
  // If zero words or complete silence, apply explicit forfeit penalty
  if (overallScore === 0) {
    const penalty = -30;
    const newElo = Math.max(600, currentElo + penalty);
    const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    return {
      delta: penalty,
      newElo,
      explanation: `-30 Elo (${currentElo} → ${newElo}): Zero participation / complete silence recorded. Forfeited round against ${diffLabel} challenge.`,
    };
  }

  // Actual outcome normalized from 0.0 to 1.0
  const actualOutcome = Math.max(0, Math.min(1, overallScore / 100));

  // Dynamic K-factor
  let k = 32;
  if (totalRounds < 8) {
    k = 44; // Provisional volatility for new learners
  } else if (currentElo >= 1600) {
    k = 24;
  }

  // Base Elo delta
  let rawDelta = k * (actualOutcome - expectedOutcome);

  // Composure & Specificity nuances
  if (scores.credibility >= 88 && (difficulty === 'master' || difficulty === 'grandmaster')) {
    rawDelta += 3; // Bonus for high conviction in hostile territory
  }
  if (scores.specificity >= 85) {
    rawDelta += 2; // Bonus for concrete details
  }
  if (scores.conversationalFlow < 45 && rawDelta > 0) {
    rawDelta = Math.max(1, rawDelta - 2); // Slight deduction for halting monologue/silence
  }

  const delta = Math.round(rawDelta);
  const newElo = Math.max(600, currentElo + delta);

  // Narrative explanation
  const percentExpected = Math.round(expectedOutcome * 100);
  const sign = delta >= 0 ? '+' : '';
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  let driver = 'Balanced performance across conversational metrics.';
  if (scores.credibility >= 85 && scores.factualAccuracy <= 50) {
    driver = `High delivery credibility (${scores.credibility}) sold the bluff even with improvised facts (${scores.factualAccuracy}% accuracy).`;
  } else if (scores.adaptability >= 85) {
    driver = `Superb adaptability (${scores.adaptability}) turning skeptical questions back to the speaker.`;
  } else if (scores.specificity < 50) {
    driver = `Vague or hesitant generalizations (${scores.specificity} specificity) limited rating upside.`;
  } else if (scores.conversationalFlow >= 85) {
    driver = `Fluid natural pacing and uninterrupted rhythm (${scores.conversationalFlow}) elevated the round.`;
  }

  const explanation = `${sign}${delta} Elo (${currentElo} → ${newElo}): Performed at ${overallScore}% vs ${percentExpected}% expected against ${diffLabel}-tier challenge. ${driver}`;

  return {
    delta,
    newElo,
    explanation,
  };
}
