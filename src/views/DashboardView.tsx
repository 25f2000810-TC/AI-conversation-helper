import React from 'react';
import { 
  UserProfile, 
  ProgressSummary, 
  PracticeSession, 
  PracticeCategory 
} from '../types/index.ts';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  BookOpen, 
  Briefcase, 
  Drama, 
  MessageCircle, 
  ChevronRight,
  TrendingUp,
  Compass
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  progress: ProgressSummary;
  onStartSession: (category: PracticeCategory, title?: string, scenarioId?: string) => void;
  onViewSessionReport: (sessionId: string) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  progress,
  onStartSession,
  onViewSessionReport,
  onNavigate
}) => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'roleplay': return <Drama className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'interview_prep': return <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'pronunciation': return <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      default: return <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* A. Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4" />
            <span>SpeakFlow Daily English Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting()}, {profile.name}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Your current goal is <span className="font-semibold text-white">{profile.primaryGoal.replace('_', ' ')}</span> at{' '}
            <span className="font-semibold text-white capitalize">{profile.proficiencyLevel}</span> level. Speak for{' '}
            {profile.dailyPracticeMinutes} minutes today to maintain your speaking momentum.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartSession('free_conversation', 'Spontaneous Conversation')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all"
            >
              <span>Start Speaking Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('practice')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Scenarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* B. Daily Practice Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-850 dark:via-slate-850 dark:to-indigo-950/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Recommended for Today</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 font-normal">Estimated 8-10 mins</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            HR Behavioral Interview: Overcoming a Project Challenge
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Practice structuring answers using past tense verbs and transition phrases with Ms. Harrison.
          </p>
        </div>
        <button
          onClick={() => onStartSession('interview_prep', 'HR Job Interview', 'job_interview_hr')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shrink-0 self-start md:self-auto"
        >
          <span>Begin Daily Exercise</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* C. Progress Overview Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Speaking Progress & Consistency
          </h2>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Detailed Analytics
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Practice Streak</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {progress.currentStreakDays}
              </span>
              <span className="text-xs text-slate-500 font-medium">days</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Active daily momentum
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Total Practice</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {progress.totalPracticeMinutes}
              </span>
              <span className="text-xs text-slate-500 font-medium">mins</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {progress.totalSessionsCompleted} total completed sessions
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Average Fluency</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {progress.averageScore > 0 ? progress.averageScore : '—'}
              </span>
              {progress.averageScore > 0 && <span className="text-xs text-slate-500 font-medium">/ 100</span>}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Based on real session evaluations
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>Vocabulary Bank</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {progress.vocabularyCount.total}
              </span>
              <span className="text-xs text-slate-500 font-medium">words</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {progress.vocabularyCount.mastered} mastered · {progress.vocabularyCount.learning} learning
            </div>
          </div>

        </div>
      </div>

      {/* D. Three Recommended Personalized Activities */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Recommended Next Activities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Real-Life Simulation</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">Intermediate</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Airport Delayed Connection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Why recommended: Practice polite assertiveness and problem explanation during an unexpected flight rebooking.
              </p>
            </div>
            <button
              onClick={() => onStartSession('real_life_scenario', 'Airport Flight Rebooking', 'airport_missed_flight')}
              className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              <span>Start Simulation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pronunciation Lab</span>
                <span className="font-medium text-cyan-600 dark:text-cyan-400">Sound Drill</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Unvoiced /θ/ vs Voiced /ð/
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Why recommended: Master tongue placement on "think", "three", and "the" to eliminate foreign sound substitutions.
              </p>
            </div>
            <button
              onClick={() => onNavigate('pronunciation')}
              className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              <span>Practice Sounds</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Roleplay</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">Advanced</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Salary & Perks Negotiation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Why recommended: Advocate for your value using professional phrasing and polite counter-proposals.
              </p>
            </div>
            <button
              onClick={() => onStartSession('interview_prep', 'Salary Negotiation', 'salary_negotiation')}
              className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              <span>Negotiate Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* E. Recent Completed Sessions */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Recent Practice Sessions
        </h2>

        {progress.recentSessions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-white/50 dark:bg-slate-850/50">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No sessions completed yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your real conversation scores, grammar improvements, and diagnostic reports will automatically appear here once you finish your first speaking session.
            </p>
            <button
              onClick={() => onStartSession('free_conversation', 'Spontaneous Chat')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Start First Conversation
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {progress.recentSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => onViewSessionReport(s.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getCategoryIcon(s.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {s.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{s.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{s.durationMinutes} min</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-xs">{s.mainImprovement}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
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
