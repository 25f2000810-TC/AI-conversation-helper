import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  PracticeSession, 
  ProgressSummary, 
  ScenarioDefinition,
  PracticeCategory,
  FeedbackMode 
} from './types/index.ts';
import { api } from './services/api.ts';
import { Header } from './components/Header.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { ConversationStudio } from './views/ConversationStudio.tsx';
import { PracticeHubView } from './views/PracticeHubView.tsx';
import { PronunciationView } from './views/PronunciationView.tsx';
import { VocabularyView } from './views/VocabularyView.tsx';
import { ProgressView } from './views/ProgressView.tsx';
import { ConversationHistoryView } from './views/ConversationHistoryView.tsx';
import { SessionReportModal } from './components/SessionReportModal.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { SettingsModal } from './views/SettingsModal.tsx';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
  const [reportSession, setReportSession] = useState<PracticeSession | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('speakflow_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('speakflow_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initial Data Load
  const loadAppData = async () => {
    try {
      const [profData, progData, scenData] = await Promise.all([
        api.getProfile(),
        api.getProgressSummary(),
        api.getScenarios()
      ]);
      setProfile(profData);
      setProgress(progData);
      setScenarios(scenData);
      if (!profData.onboardingCompleted) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error('Failed to load SpeakFlow initial state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // Session Management
  const handleStartSession = async (
    category: PracticeCategory,
    title?: string,
    scenarioId?: string,
    topic?: string,
    feedbackMode?: FeedbackMode
  ) => {
    try {
      let scenarioConfig = undefined;
      if (scenarioId) {
        const found = scenarios.find(s => s.id === scenarioId);
        if (found) {
          scenarioConfig = {
            scenarioId: found.id,
            userRole: found.userRole,
            aiRole: found.aiRole,
            objective: found.objective,
            difficulty: found.difficulty,
            successCriteria: found.successCriteria,
            suggestedPhrases: found.suggestedPhrases
          };
        }
      }

      const session = await api.createSession({
        category,
        title: title || 'English Speaking Practice',
        topic,
        scenarioConfig,
        feedbackMode: feedbackMode || profile?.feedbackMode || 'instant'
      });

      setActiveSession(session);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const handleFinishSession = (completedSession: PracticeSession) => {
    setActiveSession(null);
    setReportSession(completedSession);
    // Refresh progress metrics
    api.getProgressSummary().then(setProgress);
  };

  const handleViewSessionReport = async (sessionId: string) => {
    try {
      const session = await api.getSession(sessionId);
      if (session) {
        setReportSession(session);
      }
    } catch (err) {
      console.error('Failed to fetch session report:', err);
    }
  };

  if (isLoading || !profile || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading SpeakFlow AI...
          </p>
        </div>
      </div>
    );
  }

  // Active Live Voice Conversation Studio
  if (activeSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <ConversationStudio
          session={activeSession}
          profile={profile}
          onBack={() => {
            setActiveSession(null);
            api.getProgressSummary().then(setProgress);
          }}
          onFinishSession={handleFinishSession}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onStartSpeaking={() => handleStartSession('free_conversation', 'Spontaneous Conversation')}
        onOpenSettings={() => setShowSettings(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <DashboardView
            profile={profile}
            progress={progress}
            onStartSession={handleStartSession}
            onViewSessionReport={handleViewSessionReport}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'practice' && (
          <PracticeHubView
            scenarios={scenarios}
            onStartSession={handleStartSession}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'history' && (
          <ConversationHistoryView
            onStartSpeaking={() => handleStartSession('free_conversation', 'Spontaneous Conversation')}
            onViewEvaluation={(sess) => setReportSession(sess)}
          />
        )}

        {currentView === 'pronunciation' && (
          <PronunciationView />
        )}

        {currentView === 'vocabulary' && (
          <VocabularyView />
        )}

        {currentView === 'progress' && (
          <ProgressView
            progress={progress}
            profile={profile}
            onViewSessionReport={handleViewSessionReport}
            onStartSpeaking={() => handleStartSession('free_conversation', 'Spontaneous Conversation')}
          />
        )}
      </main>

      {/* End-of-Session Evaluation Report Modal */}
      {reportSession && (
        <SessionReportModal
          session={reportSession}
          onClose={() => setReportSession(null)}
          onRetry={() => {
            const cat = reportSession.category;
            const title = reportSession.title;
            const scId = reportSession.scenarioConfig?.scenarioId;
            setReportSession(null);
            handleStartSession(cat, title, scId);
          }}
          onStartNextActivity={(cat, title) => {
            setReportSession(null);
            handleStartSession(cat as any, title);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          profile={profile}
          onClose={() => setShowSettings(false)}
          onUpdate={(updated) => setProfile(updated)}
        />
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          initialProfile={profile}
          onComplete={(updated) => {
            setProfile(updated);
            setShowOnboarding(false);
            api.updateProfile(updated);
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Clean minimal footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>SpeakFlow AI · Personal English Conversation & Fluency Coach</span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Powered by Gemini 3.8 Flash & TTS</span>
            <span aria-hidden="true">·</span>
            <span>Private Server Evaluation</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
