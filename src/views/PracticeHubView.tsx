import React, { useState } from 'react';
import { ScenarioDefinition, PracticeCategory, FeedbackMode } from '../types/index.ts';
import { 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  Drama, 
  MapPin, 
  Briefcase, 
  Target, 
  BookOpen, 
  Search, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface PracticeHubViewProps {
  scenarios: ScenarioDefinition[];
  onStartSession: (
    category: PracticeCategory, 
    title?: string, 
    scenarioId?: string, 
    topic?: string,
    feedbackMode?: FeedbackMode
  ) => void;
  onNavigate: (view: string) => void;
}

export const PracticeHubView: React.FC<PracticeHubViewProps> = ({
  scenarios,
  onStartSession,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'scenarios' | 'modes'>('all');
  const [scenarioFilter, setScenarioFilter] = useState<'all' | 'roleplay' | 'real_life' | 'interview'>('all');
  const [customTopic, setCustomTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScenarios = scenarios.filter(s => {
    const matchesFilter = scenarioFilter === 'all' || s.category === scenarioFilter;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.objective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Practice Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Choose a conversation mode or immerse yourself in real-world scenarios and professional simulations.
        </p>
      </div>

      {/* Quick Launch Custom Topic (Route A: Free Conversation) */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
          <MessageCircle className="w-4 h-4" />
          <span>Route A · Free Conversation</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Speak Freely on Any Topic
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Enter any topic you want to discuss (e.g. "Recent movies", "Remote work pros & cons", "My career plan") or jump in with no set topic for spontaneous everyday conversation.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Type your own topic (or leave blank for open conversation)..."
            className="w-full sm:flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => onStartSession(
              'free_conversation', 
              customTopic.trim() ? `Topic: ${customTopic}` : 'Spontaneous Free Chat',
              undefined,
              customTopic.trim() || undefined
            )}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm whitespace-nowrap transition-colors flex items-center justify-center gap-2"
          >
            <span>Start Free Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Tabs / Filter controls following Frontend Design guidelines */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setScenarioFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              scenarioFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Scenarios ({scenarios.length})
          </button>
          <button
            onClick={() => setScenarioFilter('roleplay')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              scenarioFilter === 'roleplay'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fictional Roleplay
          </button>
          <button
            onClick={() => setScenarioFilter('real_life')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              scenarioFilter === 'real_life'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Real-Life Situations
          </button>
          <button
            onClick={() => setScenarioFilter('interview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              scenarioFilter === 'interview'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Interviews & Professional
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scenarios or roles..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs group"
          >
            <div className="space-y-3">
              {/* Zero-Pill Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="capitalize">{scenario.category.replace('_', ' ')}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{scenario.difficulty}</span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {scenario.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {scenario.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">You: </span>
                  {scenario.userRole}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">AI Partner: </span>
                  {scenario.aiRole}
                </div>
                <div className="text-slate-500 text-[11px] pt-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Goal: </span>
                  {scenario.objective}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {scenario.targetVocabulary.length} target vocabulary
              </span>
              <button
                onClick={() => onStartSession(
                  scenario.category === 'interview' ? 'interview_prep' : scenario.category === 'roleplay' ? 'roleplay' : 'real_life_scenario',
                  scenario.title,
                  scenario.id
                )}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <span>Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
