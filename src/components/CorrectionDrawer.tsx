import React, { useState } from 'react';
import { TurnCorrection } from '../types/index.ts';
import { Check, Volume2, Sparkles, X, ArrowRight, BookPlus } from 'lucide-react';
import { audioEngine } from '../services/audioEngine.ts';
import { api } from '../services/api.ts';

interface CorrectionDrawerProps {
  correction: TurnCorrection;
  onClose: () => void;
  onPracticeCorrection?: (text: string) => void;
}

export const CorrectionDrawer: React.FC<CorrectionDrawerProps> = ({
  correction,
  onClose,
  onPracticeCorrection
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [savedVocab, setSavedVocab] = useState<string | null>(null);

  const handleListenCorrected = async () => {
    setIsPlayingAudio(true);
    await audioEngine.playAudio({
      textFallback: correction.correctedText,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  const handleSaveVocab = async (vocab: { term: string; definition: string; example: string }) => {
    try {
      await api.addVocabulary({
        term: vocab.term,
        definition: vocab.definition,
        exampleSentence: vocab.example,
        level: 'intermediate'
      });
      setSavedVocab(vocab.term);
      setTimeout(() => setSavedVocab(null), 3000);
    } catch (e) {
      console.error('Failed to save vocab', e);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4" />
          <span>Language Coaching Feedback</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
          aria-label="Dismiss feedback"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {/* Encouraging Coach Message */}
        {correction.encouragement && (
          <div className="p-3 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-medium">{correction.encouragement}</span>
          </div>
        )}

        {/* Original vs Better Version */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
            <span className="block text-xs font-medium text-rose-700 dark:text-rose-400 mb-1">
              What you said
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-medium">
              "{correction.originalText}"
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Better version
              </span>
              <button
                onClick={handleListenCorrected}
                disabled={isPlayingAudio}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 text-xs"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? 'Playing...' : 'Listen'}</span>
              </button>
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-semibold">
              "{correction.correctedText}"
            </p>
          </div>
        </div>

        {/* Grammar & Phrasing Corrections */}
        {correction.issues && correction.issues.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Grammar & Phrasing Improvements:
            </span>
            <div className="space-y-1.5">
              {correction.issues.map((issue, idx) => (
                <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">·</span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      "{issue.originalSpan}" → "{issue.suggestion}":
                    </span>{' '}
                    <span>{issue.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pronunciation & Articulation Tips */}
        {correction.pronunciationTips && correction.pronunciationTips.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Pronunciation & Phonetic Guidance:</span>
            </span>
            <div className="space-y-1.5">
              {correction.pronunciationTips.map((tip, idx) => (
                <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 p-2.5 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">"{tip.word}"</span>
                    <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">{tip.phonetic}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{tip.tip}</p>
                  {tip.stressGuide && (
                    <p className="text-[10px] text-slate-500 font-mono">Stress: {tip.stressGuide}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Natural alternative */}
        {correction.naturalAlternative && correction.naturalAlternative !== correction.correctedText && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">
              Natural conversational alternative:
            </span>
            <p className="italic text-slate-800 dark:text-slate-200">
              "{correction.naturalAlternative}"
            </p>
          </div>
        )}

        {/* Vocabulary Suggestion */}
        {correction.vocabularySuggestions && correction.vocabularySuggestions.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Useful vocabulary suggestion</span>
            </div>
            {correction.vocabularySuggestions.map((vocab, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{vocab.term}</span>: {vocab.definition}
                </div>
                <button
                  onClick={() => handleSaveVocab(vocab)}
                  disabled={savedVocab === vocab.term}
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 text-xs shrink-0 ml-2"
                >
                  {savedVocab === vocab.term ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <BookPlus className="w-3.5 h-3.5" />
                      <span>Save Word</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action: Practice this correction */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {onPracticeCorrection && (
            <button
              onClick={() => onPracticeCorrection(correction.correctedText)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
            >
              <span>Practice Saying This</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
