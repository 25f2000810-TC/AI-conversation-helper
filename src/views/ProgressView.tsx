import React from 'react';
import { ProgressSummary, UserProfile } from '../types/index.ts';
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ProgressViewProps {
  progress: ProgressSummary;
  profile: UserProfile;
  onViewSessionReport: (sessionId: string) => void;
  onStartSpeaking: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  profile,
  onViewSessionReport,
  onStartSpeaking
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Real Diagnostic History</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Speaking Analytics & Fluency Trends
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tracking your speaking consistency, grammar accuracy, and vocabulary retention over time.
        </p>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Active Streak</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {progress.currentStreakDays}
            </span>
            <span className="text-xs text-slate-500 font-medium">days in a row</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Calculated from verified daily sessions
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Speaking Time</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {progress.totalPracticeMinutes}
            </span>
            <span className="text-xs text-slate-500 font-medium">total minutes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {progress.totalSessionsCompleted} completed conversation runs
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Average Score</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {progress.averageScore > 0 ? progress.averageScore : '—'}
            </span>
            {progress.averageScore > 0 && <span className="text-xs text-slate-500 font-medium">/ 100</span>}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Deterministic 5-factor rubric scoring
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span>Active Lexicon</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {progress.vocabularyCount.total}
            </span>
            <span className="text-xs text-slate-500 font-medium">words</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {progress.vocabularyCount.mastered} mastered in conversation
          </p>
        </div>

      </div>

      {/* Fluency & Accuracy Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fluency Trend */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Fluency & Coherence Progression
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated continuity, pacing, and natural clause linking
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          {progress.fluencyTrend.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Complete practice sessions to see your fluency trend line.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {progress.fluencyTrend.map((pt, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>{pt.date}</span>
                    <span className="font-semibold tabular-nums">{pt.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pt.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grammar Accuracy Trend */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Grammatical Accuracy Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tense consistency, preposition placement, and agreement
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>

          {progress.grammarAccuracyTrend.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Complete practice sessions to see your grammar accuracy trend line.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {progress.grammarAccuracyTrend.map((pt, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>{pt.date}</span>
                    <span className="font-semibold tabular-nums">{pt.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pt.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Honest Methodology Notice */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Coaching Methodology Notice
          </span>
          <p>
            All metrics reflect actual stored sessions. Scores are coaching diagnostic estimates calculated across 5 clear dimensions (Grammar 25%, Vocabulary 20%, Fluency 20%, Task Completion 20%, Clarity 15%), not official IELTS, TOEFL, or CEFR certifications.
          </p>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Completed Diagnostic Sessions
        </h3>
        {progress.recentSessions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-500">No session history recorded yet.</p>
            <button
              onClick={onStartSpeaking}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Start a practice conversation now →
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {progress.recentSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => onViewSessionReport(s.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {s.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{s.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{s.durationMinutes} min</span>
                    <span aria-hidden="true">·</span>
                    <span>{s.category.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      {s.score}
                    </span>
                    <span className="text-xs text-slate-400"> / 100</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
