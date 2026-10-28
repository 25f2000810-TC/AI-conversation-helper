import React, { useState } from 'react';
import { UserProfile, CEFRLevel, LearningGoal, FeedbackMode } from '../types/index.ts';
import { X, Check, Volume2, Shield, Settings } from 'lucide-react';
import { api } from '../services/api.ts';
import { audioEngine } from '../services/audioEngine.ts';

interface SettingsModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onClose,
  onUpdate
}) => {
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState<CEFRLevel>(profile.proficiencyLevel);
  const [goal, setGoal] = useState<LearningGoal>(profile.primaryGoal);
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>(profile.feedbackMode);
  const [voice, setVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'>(profile.preferredVoice || 'Kore');
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyPracticeMinutes || 15);
  const [isSaving, setIsSaving] = useState(false);

  const handleTestVoice = async () => {
    await audioEngine.playAudio({
      textFallback: `Hello ${name}! This is the ${voice} voice for your English speaking coaching.`,
      voiceName: voice
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        proficiencyLevel: level,
        primaryGoal: goal,
        feedbackMode,
        preferredVoice: voice,
        dailyPracticeMinutes: dailyMinutes
      });
      onUpdate(updated);
      onClose();
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>Coaching Preferences & Settings</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proficiency Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="beginner">Beginner (A1)</option>
                <option value="elementary">Elementary (A2)</option>
                <option value="intermediate">Intermediate (B1)</option>
                <option value="upper_intermediate">Upper-Intermediate (B2)</option>
                <option value="advanced">Advanced (C1-C2)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="confidence_fluency">Confidence & Fluency</option>
                <option value="job_interviews">Job Interviews</option>
                <option value="everyday_conversation">Everyday Conversation</option>
                <option value="grammar_improvement">Grammar Accuracy</option>
                <option value="workplace_communication">Workplace Communication</option>
                <option value="travel_english">Travel English</option>
                <option value="academic_english">Academic English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Feedback Delivery Style
            </label>
            <select
              value={feedbackMode}
              onChange={(e) => setFeedbackMode(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="instant">Instant Correction (after each turn)</option>
              <option value="gentle">Gentle Coaching (only significant errors)</option>
              <option value="end_of_session">End-of-Session Review (uninterrupted speech)</option>
            </select>
          </div>

          {/* Voice selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                AI Coach Voice Persona
              </label>
              <button
                type="button"
                onClick={handleTestVoice}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>
            </div>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Kore">Kore · Warm, encouraging & natural</option>
              <option value="Puck">Puck · Energetic, conversational & bright</option>
              <option value="Fenrir">Fenrir · Deep, calm & authoritative</option>
              <option value="Zephyr">Zephyr · Friendly, articulate & upbeat</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daily Practice Target
            </label>
            <select
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes (Standard recommendation)</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Audio and transcripts are processed privately on server for coaching.</span>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
