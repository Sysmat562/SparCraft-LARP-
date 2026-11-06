export type ScenarioCategory = 
  | 'bluff_expert'
  | 'defend_hot_take'
  | 'join_ongoing'
  | 'curveball_question'
  | 'improv_story';

export type DifficultyLevel = 'novice' | 'adept' | 'master' | 'grandmaster';

export interface SparCharacter {
  name: string;
  role: string;
  avatarSeed: string;
  personality: string;
  challengeStyle: string;
}

export interface SparScenario {
  id: string;
  category: ScenarioCategory;
  categoryLabel: string;
  title: string;
  topic: string;
  premise: string;
  character: SparCharacter;
  difficulty: DifficultyLevel;
  suggestedDurationSeconds: number;
  initialMessage: string;
  sampleQuestions: string[];
  bluffKnowledgeHints?: string[]; // Quick reference tips if user wants a cheat sheet
}

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  speakerName: string;
  text: string;
  timestamp: number;
  isRetry?: boolean;
}

export interface MomentBreakdown {
  id: string;
  userQuote: string;
  aiQuote: string;
  assessment: 'strength' | 'weakness';
  tag: string; // e.g. "Vague Assertion", "Quick Recovery", "Vivid Metaphor", "Hesitant Pause"
  feedback: string;
  suggestedAlternative: string;
  retryPrompt: string;
}

export interface EvaluationScores {
  relevance: number;        // 0-100
  specificity: number;      // 0-100
  conversationalFlow: number;// 0-100
  adaptability: number;     // 0-100
  credibility: number;      // 0-100 (convincing delivery, swagger, unflappable composure)
  factualAccuracy: number;  // 0-100 (actual real-world factual correctness)
}

export interface PerformanceEvaluation {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  category: ScenarioCategory;
  difficulty: DifficultyLevel;
  timestamp: number;
  durationSeconds: number;
  overallScore: number;
  scores: EvaluationScores;
  deliveryVsAccuracyAnalysis: string;
  moments: MomentBreakdown[];
  eloChange: {
    previousElo: number;
    newElo: number;
    delta: number;
    explanation: string;
  };
  generalAdvice: string;
  transcript: ConversationTurn[];
}

export interface UserStats {
  currentElo: number;
  highestElo: number;
  firstEverScore: number | null;
  bestScore: number;
  rollingLast3Avg: number;
  totalSparRounds: number;
  winCount: number; // rounds with overallScore >= 75
  totalMinutesSparred: number;
  categoryMastery: Record<ScenarioCategory, { rounds: number; avgScore: number }>;
  history: PerformanceEvaluation[];
}
