import React, { useEffect, useState } from 'react';
import { PracticeSession, SessionEvaluation } from '../types/index.ts';
import { 
  Trophy, 
  CheckCircle2, 
  ArrowRight, 
  Volume2, 
  RotateCcw, 
  BookmarkPlus, 
  Check, 
  X, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../services/audioEngine.ts';
import { api } from '../services/api.ts';

interface SessionReportModalProps {
  session: PracticeSession;
  onClose: () => void;
  onRetry: () => void;
  onStartNextActivity: (category: string, title: string) => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  session,
  onClose,
  onRetry,
  onStartNextActivity
}) => {
  const evalData: SessionEvaluation | undefined = session.evaluation;
  const [playingSentence, setPlayingSentence] = useState<string | null>(null);
  const [savedVocabTerms, setSavedVocabTerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (evalData && !evalData.isInsufficientEvidence && evalData.overallScore >= 75) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (_) {}
    }
  }, [evalData]);

  const handleListen = async (text: string) => {
    setPlayingSentence(text);
    await audioEngine.playAudio({
      textFallback: text,
      onEnd: () => setPlayingSentence(null),
      onError: () => setPlayingSentence(null)
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
      setSavedVocabTerms(prev => new Set(prev).add(vocab.term));
    } catch (e) {
      console.error('Failed to save vocabulary item:', e);
    }
  };

  if (!evalData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full text-center">
          <p className="text-slate-600 dark:text-slate-300">Generating conversation evaluation...</p>
        </div>
      </div>
    );
  }

  const rubrics = evalData.rubrics;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span>Session Evaluation Report</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {session.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Duration: {Math.max(1, Math.round((session.durationSeconds || 60) / 60))} min</span>
              <span aria-hidden="true">·</span>
              <span>{session.turnCount || 0} conversation turns</span>
              <span aria-hidden="true">·</span>
              <span>Category: {session.category.replace('_', ' ')}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Insufficient Evidence State */}
        {evalData.isInsufficientEvidence ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Not enough conversation to assess confidently
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                This session only contained {session.turnCount || 0} turns. Speak for at least 3-4 conversational exchanges so our coach can accurately analyze grammar, fluency, and vocabulary patterns.
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onRetry}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Try Session Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-6">
            {/* Top Score Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 gap-4">
              <div className="text-center sm:text-left">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Overall Fluency Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {evalData.overallScore}
                  </span>
                  <span className="text-base font-semibold text-slate-400">/ 100</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Estimated coaching benchmark based on 5 language dimensions
                </p>
              </div>

              {/* Mini visual summary of rubrics */}
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Grammar ({rubrics.grammar.score}/25)</span>
                  <span className="font-semibold tabular-nums">{Math.round((rubrics.grammar.score / 25) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(rubrics.grammar.score / 25) * 100}%` }} />
                </div>

                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Fluency ({rubrics.fluency.score}/20)</span>
                  <span className="font-semibold tabular-nums">{Math.round((rubrics.fluency.score / 20) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(rubrics.fluency.score / 20) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Rubrics Grid */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Performance Rubric Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {Object.entries(rubrics).map(([key, dim]) => (
                  <div key={key} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white mb-1">
                      <span>{dim.label}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {dim.score} / {dim.maxScore}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">
                      {dim.explanation}
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Action tip: </span>
                      {dim.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Priority Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block mb-2">
                  What You Did Well
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {evalData.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-400 block mb-2">
                  Top Priority Focus
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {evalData.priorityImprovements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Complete Roleplay Mistakes & Corrections Ledger */}
            {evalData.allRoleplayMistakes && evalData.allRoleplayMistakes.length > 0 ? (
              <div className="space-y-3 p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Complete Roleplay Mistakes & Correction Ledger ({evalData.allRoleplayMistakes.length} items)
                    </h3>
                  </div>
                  <span className="text-[11px] text-purple-600 dark:text-purple-300 font-semibold">
                    Turn-by-turn analysis
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Every language and pronunciation correction recorded during this scenario:
                </p>

                <div className="space-y-3 pt-2">
                  {evalData.allRoleplayMistakes.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/60 bg-white dark:bg-slate-850 space-y-2 text-xs shadow-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pb-1 border-b border-slate-100 dark:border-slate-800">
                        <span>Turn #{item.turnIndex}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{item.encouragement}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-rose-600 dark:text-rose-400 font-medium">
                          You said: "{item.original}"
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            Better: "{item.corrected}"
                          </span>
                          <button
                            onClick={() => handleListen(item.corrected)}
                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-xs shrink-0"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{playingSentence === item.corrected ? 'Playing...' : 'Listen'}</span>
                          </button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                          <strong className="text-slate-700 dark:text-slate-200">Correction: </strong>{item.explanation}
                        </p>
                        {item.pronunciationTip && (
                          <p className="text-cyan-700 dark:text-cyan-400 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                            <strong>Pronunciation Tip: </strong>{item.pronunciationTip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : evalData.correctedExamples && evalData.correctedExamples.length > 0 ? (
              /* Fallback to standard corrected examples */
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Real Examples from Your Conversation
                </h3>
                <div className="space-y-2">
                  {evalData.correctedExamples.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="text-rose-600 dark:text-rose-400 font-medium">
                          You said: "{ex.original}"
                        </div>
                        <button
                          onClick={() => handleListen(ex.corrected)}
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{playingSentence === ex.corrected ? 'Playing...' : 'Listen'}</span>
                        </button>
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Better: "{ex.corrected}"
                      </div>
                      <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                        {ex.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Flawless phrasing! No recurring grammatical mistakes identified in this session.</span>
              </div>
            )}

            {/* Recommended Vocabulary */}
            {evalData.recommendedVocabulary && evalData.recommendedVocabulary.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Vocabulary Worth Keeping
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {evalData.recommendedVocabulary.map((v, idx) => {
                    const isSaved = savedVocabTerms.has(v.term);
                    return (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{v.term}</div>
                          <div className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{v.definition}</div>
                          <div className="italic text-slate-500 text-[11px] mt-1">"{v.example}"</div>
                        </div>
                        <button
                          onClick={() => handleSaveVocab(v)}
                          disabled={isSaved}
                          className="p-1.5 rounded text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 shrink-0"
                          title="Save to Vocabulary"
                        >
                          {isSaved ? <Check className="w-4 h-4 text-emerald-500" /> : <BookmarkPlus className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Recommended Activity */}
            {evalData.recommendedNextActivity && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                    Adaptive Recommendation
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {evalData.recommendedNextActivity.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {evalData.recommendedNextActivity.reason}
                  </p>
                </div>
                <button
                  onClick={() => onStartNextActivity(
                    evalData.recommendedNextActivity.category, 
                    evalData.recommendedNextActivity.title
                  )}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Scenario</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
