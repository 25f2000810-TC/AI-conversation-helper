export type CEFRLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';

export type LearningGoal = 
  | 'everyday_conversation'
  | 'confidence_fluency'
  | 'grammar_improvement'
  | 'vocabulary_expansion'
  | 'pronunciation'
  | 'job_interviews'
  | 'workplace_communication'
  | 'public_speaking'
  | 'academic_english'
  | 'travel_english'
  | 'competitive_exams';

export type FeedbackMode = 
  | 'instant'        // Show corrections after each user turn
  | 'gentle'         // Point out high-severity errors without interrupting flow
  | 'end_of_session' // Uninterrupted conversation, complete report at end
  | 'focus';         // Focus on a specific weakness (articles, tenses, etc.)

export type PracticeCategory = 
  | 'free_conversation'
  | 'instant_correction'
  | 'uninterrupted'
  | 'roleplay'
  | 'real_life_scenario'
  | 'pronunciation'
  | 'vocabulary'
  | 'grammar_focus'
  | 'interview_prep';

export interface UserProfile {
  id: string;
  name: string;
  proficiencyLevel: CEFRLevel;
  primaryGoal: LearningGoal;
  feedbackMode: FeedbackMode;
  preferredAccent: 'US' | 'UK' | 'AU' | 'Neutral';
  preferredVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr';
  dailyPracticeMinutes: number;
  weaknessFocus?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectionIssue {
  category: 
    | 'verb_tense'
    | 'articles'
    | 'prepositions'
    | 'subject_verb_agreement'
    | 'word_choice'
    | 'word_order'
    | 'collocation'
    | 'awkward_phrasing'
    | 'punctuation'
    | 'clarity';
  originalSpan: string;
  suggestion: string;
  explanation: string;
  severity: 'error' | 'awkward' | 'style_enhancement';
  confidence: number;
}

export interface PronunciationTip {
  word: string;
  phonetic: string;
  tip: string;
  stressGuide?: string;
}

export interface TurnCorrection {
  originalText: string;
  correctedText: string;
  naturalAlternative: string;
  encouragement: string;
  explanationSummary?: string;
  issues: CorrectionIssue[];
  pronunciationTips?: PronunciationTip[];
  vocabularySuggestions?: Array<{
    term: string;
    definition: string;
    example: string;
  }>;
  overallFeedback?: string;
}

export interface ConversationTurn {
  id: string;
  sessionId: string;
  turnIndex: number;
  speaker: 'user' | 'ai';
  transcript: string;
  audioBase64?: string;
  timestamp: string;
  latencyMs?: number;
  correction?: TurnCorrection;
}

export interface RubricDimension {
  score: number;
  maxScore: number;
  label: string;
  explanation: string;
  evidence: string;
  recommendation: string;
}

export interface SessionEvaluation {
  id: string;
  sessionId: string;
  overallScore: number; // 0-100
  isInsufficientEvidence: boolean;
  rubrics: {
    grammar: RubricDimension;     // 25 pts
    vocabulary: RubricDimension;  // 20 pts
    fluency: RubricDimension;     // 20 pts
    taskCompletion: RubricDimension; // 20 pts
    clarity: RubricDimension;     // 15 pts
  };
  strengths: string[];
  priorityImprovements: string[];
  correctedExamples: Array<{
    original: string;
    corrected: string;
    reason: string;
  }>;
  recommendedVocabulary: Array<{
    term: string;
    definition: string;
    example: string;
  }>;
  recommendedNextActivity: {
    category: PracticeCategory;
    title: string;
    reason: string;
    scenarioId?: string;
  };
  allRoleplayMistakes?: Array<{
    turnIndex: number;
    original: string;
    corrected: string;
    explanation: string;
    pronunciationTip?: string;
    encouragement: string;
  }>;
  generatedAt: string;
}

export interface PracticeSession {
  id: string;
  userId: string;
  category: PracticeCategory;
  title: string;
  topic?: string;
  scenarioConfig?: {
    scenarioId?: string;
    userRole: string;
    aiRole: string;
    objective: string;
    difficulty: CEFRLevel;
    successCriteria?: string[];
    suggestedPhrases?: string[];
  };
  feedbackMode: FeedbackMode;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  turnCount: number;
  score?: number;
  evaluation?: SessionEvaluation;
  turns?: ConversationTurn[];
}

export interface ScenarioDefinition {
  id: string;
  category: 'roleplay' | 'real_life' | 'interview';
  title: string;
  tagline: string;
  difficulty: CEFRLevel;
  userRole: string;
  aiRole: string;
  objective: string;
  context: string;
  initialPrompt: string;
  successCriteria: string[];
  suggestedPhrases: string[];
  targetVocabulary: string[];
  icon: string;
}

export interface VocabularyItem {
  id: string;
  userId: string;
  term: string;
  definition: string;
  exampleSentence: string;
  synonym?: string;
  level: CEFRLevel;
  sourceSessionId?: string;
  reviewState: 'new' | 'learning' | 'mastered';
  reviewCount: number;
  nextReviewDate: string;
  createdAt: string;
}

export interface PronunciationChallenge {
  id: string;
  text: string;
  type: 'word' | 'sound' | 'phrase' | 'sentence';
  phonetic: string;
  focusSound: string;
  audioGuideUrl?: string;
  difficulty: CEFRLevel;
  tip: string;
}

export interface ProgressSummary {
  totalPracticeMinutes: number;
  totalSessionsCompleted: number;
  currentStreakDays: number;
  averageScore: number;
  fluencyTrend: Array<{ date: string; score: number }>;
  grammarAccuracyTrend: Array<{ date: string; score: number }>;
  vocabularyCount: {
    total: number;
    mastered: number;
    learning: number;
  };
  recentSessions: Array<{
    id: string;
    title: string;
    category: PracticeCategory;
    date: string;
    durationMinutes: number;
    score: number;
    mainImprovement: string;
  }>;
}
