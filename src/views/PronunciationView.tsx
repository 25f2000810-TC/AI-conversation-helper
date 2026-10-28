import React, { useState, useEffect } from 'react';
import { PronunciationChallenge } from '../types/index.ts';
import { 
  Mic, 
  Square, 
  Volume2, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api.ts';
import { audioEngine } from '../services/audioEngine.ts';

export const PronunciationView: React.FC = () => {
  const [challenges, setChallenges] = useState<PronunciationChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<PronunciationChallenge | null>(null);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    score: number;
    feedback: string;
    differences: Array<{ word: string; status: 'accurate' | 'omitted' | 'substituted' | 'mispronounced' }>;
    stressTip: string;
  } | null>(null);

  useEffect(() => {
    api.getPronunciationChallenges().then(data => {
      setChallenges(data);
      if (data.length > 0) setSelectedChallenge(data[0]);
    });
  }, []);

  const handlePlayReference = async () => {
    if (!selectedChallenge) return;
    setIsPlayingReference(true);
    await audioEngine.playAudio({
      textFallback: selectedChallenge.text,
      onEnd: () => setIsPlayingReference(false),
      onError: () => setIsPlayingReference(false)
    });
  };

  const handleStartRecording = async () => {
    setUserTranscript('');
    setEvalResult(null);
    setIsRecording(true);

    await audioEngine.startListening({
      onInterim: (text) => setUserTranscript(text),
      onFinal: (text) => {
        setIsRecording(false);
        setUserTranscript(text);
        evaluateAttempt(text);
      },
      onError: () => {
        setIsRecording(false);
      }
    });
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    await audioEngine.stopListening();
    if (userTranscript) {
      evaluateAttempt(userTranscript);
    }
  };

  const evaluateAttempt = async (spoken: string) => {
    if (!selectedChallenge || !spoken.trim()) return;
    setIsEvaluating(true);
    try {
      const result = await api.evaluatePronunciation(selectedChallenge.text, spoken.trim());
      setEvalResult(result);
    } catch (e) {
      console.error('Pronunciation eval failed:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Route F · Pronunciation & Phonetics</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pronunciation & Articulation Practice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Listen to reference pronunciations, record your voice, and analyze speech fidelity and phoneme stress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Challenge Selector */}
        <div className="space-y-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Sound Drills & Minimal Pairs
          </span>
          <div className="space-y-2">
            {challenges.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedChallenge(c);
                  setEvalResult(null);
                  setUserTranscript('');
                }}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                  selectedChallenge?.id === c.id
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{c.focusSound}</span>
                  <span className="capitalize">{c.difficulty}</span>
                </div>
                <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                  "{c.text}"
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Practice Studio */}
        <div className="lg:col-span-2 space-y-6">
          {selectedChallenge && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-6 shadow-xs">
              
              {/* Target Prompt Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Target Text · {selectedChallenge.focusSound}</span>
                  <span className="capitalize">{selectedChallenge.type}</span>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                  "{selectedChallenge.text}"
                </div>

                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg inline-block">
                  IPA: {selectedChallenge.phonetic}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Coach tip: </span>
                  {selectedChallenge.tip}
                </p>
              </div>

              {/* Action Controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
                <button
                  onClick={handlePlayReference}
                  disabled={isPlayingReference}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>{isPlayingReference ? 'Playing Reference...' : 'Listen to Reference'}</span>
                </button>

                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm flex items-center gap-2 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop & Evaluate</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record Your Attempt</span>
                  </button>
                )}
              </div>

              {/* Spoken Attempt Preview */}
              {userTranscript && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Your speech transcript:</span>
                  <p className="text-slate-900 dark:text-white font-medium text-sm">
                    "{userTranscript}"
                  </p>
                </div>
              )}

              {/* Evaluation Result */}
              {isEvaluating && (
                <div className="text-center py-6 text-xs text-slate-500">
                  Analyzing phonetic alignment and accuracy...
                </div>
              )}

              {evalResult && (
                <div className="p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Speech Practice Feedback
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {evalResult.score}
                      </span>
                      <span className="text-slate-400"> / 100</span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300">
                    {evalResult.feedback}
                  </p>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Word alignment:</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {evalResult.differences.map((diff, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            diff.status === 'accurate'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          {diff.word}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Articulatory Advice: </span>
                    {evalResult.stressTip}
                  </div>
                </div>
              )}

              {/* Honest Evaluation Notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Pronunciation scores are calculated through speech transcription comparison and phoneme alignment. Regional accents are respected; focus is on clarity and intelligibility.
                </span>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
