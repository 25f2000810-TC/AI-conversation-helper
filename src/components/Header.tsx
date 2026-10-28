import React from 'react';
import { Sparkles, Settings, Sun, Moon, Volume2 } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onStartSpeaking: () => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onStartSpeaking,
  onOpenSettings,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        
        {/* Zone 1: Single text element wordmark */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Volume2 className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            SpeakFlow AI
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentView === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('practice')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentView === 'practice' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Practice Hub
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentView === 'history' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            History
          </button>
          <button
            onClick={() => onNavigate('pronunciation')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentView === 'pronunciation' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Pronunciation
          </button>
          <button
            onClick={() => onNavigate('vocabulary')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentView === 'vocabulary' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Vocabulary
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentView === 'progress' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Progress
          </button>
        </nav>

        {/* Zone 3: 1 primary action + minimal utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onStartSpeaking}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Speaking</span>
          </button>
        </div>
      </div>
    </header>
  );
};
