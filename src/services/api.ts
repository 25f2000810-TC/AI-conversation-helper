import { 
  UserProfile, 
  PracticeSession, 
  ConversationTurn, 
  VocabularyItem, 
  ScenarioDefinition, 
  PronunciationChallenge, 
  ProgressSummary,
  TurnCorrection,
  PracticeCategory,
  FeedbackMode
} from '../types/index.ts';

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData?.error) errorMsg = errorData.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; hasGeminiKey: boolean }>('/health'),

  // Profile
  getProfile: () => request<UserProfile>('/profile'),
  updateProfile: (updates: Partial<UserProfile>) => 
    request<UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(updates) }),

  // Scenarios & Modes
  getPracticeModes: () => request<Array<{ id: string; title: string; description: string; icon: string; tag: string }>>('/practice/modes'),
  getScenarios: (category?: string) => request<ScenarioDefinition[]>(category ? `/practice/scenarios?category=${category}` : '/practice/scenarios'),

  // Sessions
  createSession: (data: {
    category: PracticeCategory;
    title: string;
    topic?: string;
    scenarioConfig?: PracticeSession['scenarioConfig'];
    feedbackMode?: FeedbackMode;
  }) => request<PracticeSession>('/sessions', { method: 'POST', body: JSON.stringify(data) }),

  listSessions: () => request<PracticeSession[]>('/sessions'),
  getSession: (id: string) => request<PracticeSession>(`/sessions/${id}`),
  deleteSession: (id: string) => request<{ success: boolean }>(`/sessions/${id}`, { method: 'DELETE' }),

  submitTurn: (sessionId: string, message: string, audioBase64?: string) =>
    request<{
      userTurn: ConversationTurn;
      aiTurn: ConversationTurn;
      correction?: TurnCorrection;
      audioBase64?: string;
    }>(`/sessions/${sessionId}/turns`, {
      method: 'POST',
      body: JSON.stringify({ message, audioBase64 })
    }),

  finishSession: (sessionId: string, durationSeconds: number) =>
    request<PracticeSession>(`/sessions/${sessionId}/finish`, {
      method: 'POST',
      body: JSON.stringify({ durationSeconds })
    }),

  // Speech & Pronunciation
  synthesizeSpeech: (text: string, voice?: string) =>
    request<{ audioBase64: string; mimeType: string }>('/speech/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, voice })
    }),

  transcribeAudio: (audioBase64: string, mimeType?: string) =>
    request<{ transcript: string }>('/speech/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, mimeType })
    }),

  getPronunciationChallenges: () => request<PronunciationChallenge[]>('/pronunciation/challenges'),
  evaluatePronunciation: (targetText: string, spokenText: string) =>
    request<{
      score: number;
      feedback: string;
      differences: Array<{ word: string; status: 'accurate' | 'omitted' | 'substituted' | 'mispronounced' }>;
      stressTip: string;
    }>('/pronunciation/evaluate', {
      method: 'POST',
      body: JSON.stringify({ targetText, spokenText })
    }),

  // Progress
  getProgressSummary: () => request<ProgressSummary>('/progress/summary'),

  // Vocabulary
  listVocabulary: () => request<VocabularyItem[]>('/vocabulary'),
  addVocabulary: (item: Partial<VocabularyItem>) =>
    request<VocabularyItem>('/vocabulary', { method: 'POST', body: JSON.stringify(item) }),
  updateVocabulary: (id: string, updates: Partial<VocabularyItem>) =>
    request<VocabularyItem>(`/vocabulary/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteVocabulary: (id: string) =>
    request<{ success: boolean }>(`/vocabulary/${id}`, { method: 'DELETE' })
};
