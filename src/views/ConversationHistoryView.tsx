import React, { useState, useEffect } from 'react';
import { PracticeSession } from '../types/index.ts';
import { 
  History, 
  Search, 
  Trash2, 
  ChevronRight, 
  MessageSquare, 
  Award, 
  Volume2, 
  Clock, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.ts';
import { audioEngine } from '../services/audioEngine.ts';

interface ConversationHistoryViewProps {
  onStartSpeaking: () => void;
  onViewEvaluation: (session: PracticeSession) => void;
}

export const ConversationHistoryView: React.FC<ConversationHistoryViewProps> = ({
  onStartSpeaking,
  onViewEvaluation
}) => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await api.listSessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load sessions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = async (session: PracticeSession) => {
    try {
      // Fetch full session with turns
      const full = await api.getSession(session.id);
      setSelectedSession(full || session);
    } catch (e) {
      setSelectedSession(session);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation history?')) return;
    try {
      await api.deleteSession(id);
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
      loadSessions();
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  };

  const handlePlayAudio = async (turnId: string, text: string, audioBase64?: string) => {
    setPlayingAudioId(turnId);
    await audioEngine.playAudio({
      audioBase64,
      textFallback: text,
      onEnd: () => setPlayingAudioId(null),
      onError: () => setPlayingAudioId(null)
    });
  };

  const filteredSessions = sessions.filter(s => {
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || 
      (s.topic && s.topic.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <History className="w-4 h-4" />
            <span>Conversation Archives</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Past Conversation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review all previous conversations, dialogue transcripts, audio replays, and diagnostic evaluations.
          </p>
        </div>

        <button
          onClick={onStartSpeaking}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <span>New Practice Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by topic, scenario, or category..."
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Main Grid: List on Left, Detailed Transcript on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sessions List */}
        <div className="space-y-3 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Completed Sessions ({filteredSessions.length})
          </span>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading history...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              No conversations found. Start a speaking session to see history here!
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectSession(s)}
                  className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedSession?.id === s.id
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>{new Date(s.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{s.category.replace('_', ' ')}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {s.title}
                    </h3>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2">
                      <span>{s.turnCount || 0} turns</span>
                      {s.score !== undefined && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Score: {s.score}/100</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Transcript & Turns View */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-6 shadow-xs">
              
              {/* Session Top Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span>{new Date(selectedSession.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{selectedSession.category.replace('_', ' ')}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedSession.title}
                  </h2>
                  {selectedSession.scenarioConfig && (
                    <p className="text-xs text-slate-500 mt-1">
                      Roleplay: {selectedSession.scenarioConfig.userRole} with {selectedSession.scenarioConfig.aiRole}
                    </p>
                  )}
                </div>

                {selectedSession.evaluation && (
                  <button
                    onClick={() => onViewEvaluation(selectedSession)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Evaluation ({selectedSession.score || 0}/100)</span>
                  </button>
                )}
              </div>

              {/* Full Transcript Turns */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {selectedSession.turns && selectedSession.turns.length > 0 ? (
                  selectedSession.turns.map((turn, i) => {
                    const isAi = turn.speaker === 'ai';
                    return (
                      <div key={turn.id || i} className={`space-y-1.5 flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {isAi ? selectedSession.scenarioConfig?.aiRole || 'AI Coach' : 'You'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Turn #{turn.turnIndex}</span>
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                            isAi
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                              : 'bg-indigo-600 text-white rounded-tr-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p>{turn.transcript}</p>
                            <button
                              onClick={() => handlePlayAudio(turn.id, turn.transcript, turn.audioBase64)}
                              className={`p-1 rounded shrink-0 ${
                                isAi ? 'text-slate-500 hover:text-indigo-600' : 'text-indigo-200 hover:text-white'
                              }`}
                              title="Listen"
                            >
                              <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === turn.id ? 'animate-pulse text-indigo-400' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* If user turn has correction attached */}
                        {turn.correction && turn.correction.issues && turn.correction.issues.length > 0 && (
                          <div className="max-w-[85%] p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                            <span className="font-semibold text-amber-800 dark:text-amber-400 block">
                              Coaching Correction:
                            </span>
                            <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                              Better: "{turn.correction.correctedText}"
                            </div>
                            <div className="text-slate-500">
                              {turn.correction.issues[0]?.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No transcript turns recorded in this session.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-white/50 dark:bg-slate-850/50">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Select a conversation from the left
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click any session in your history to review the full audio transcript, speaker exchanges, and grammar corrections.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
