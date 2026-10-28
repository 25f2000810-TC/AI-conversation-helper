import React, { useState } from 'react';
import { UserProfile, CEFRLevel, LearningGoal, FeedbackMode } from '../types/index.ts';
import { Sparkles, Check, ArrowRight, User, Globe, Target, Sliders } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(initialProfile.name || '');
  const [level, setLevel] = useState<CEFRLevel>(initialProfile.proficiencyLevel || 'intermediate');
  const [goal, setGoal] = useState<LearningGoal>(initialProfile.primaryGoal || 'confidence_fluency');
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>(initialProfile.feedbackMode || 'instant');
  const [accent, setAccent] = useState<'US' | 'UK' | 'AU' | 'Neutral'>(initialProfile.preferredAccent || 'US');
  const [voice, setVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'>(initialProfile.preferredVoice || 'Kore');
  const [dailyMinutes, setDailyMinutes] = useState<number>(initialProfile.dailyPracticeMinutes || 15);

  const handleFinish = () => {
    const updated: UserProfile = {
      ...initialProfile,
      name: name.trim() || 'Learner',
      proficiencyLevel: level,
      primaryGoal: goal,
      feedbackMode: feedbackMode,
      preferredAccent: accent,
      preferredVoice: voice,
      dailyPracticeMinutes: dailyMinutes,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    };
    onComplete(updated);
  };

  const proficiencyLevels: Array<{ id: CEFRLevel; title: string; desc: string }> = [
    { id: 'beginner', title: 'Beginner (A1)', desc: 'Basic words & simple greetings' },
    { id: 'elementary', title: 'Elementary (A2)', desc: 'Routine conversations & everyday phrases' },
    { id: 'intermediate', title: 'Intermediate (B1)', desc: 'Can express ideas & handle most travel situations' },
    { id: 'upper_intermediate', title: 'Upper-Intermediate (B2)', desc: 'Fluent spontaneous discussions & technical topics' },
    { id: 'advanced', title: 'Advanced (C1-C2)', desc: 'Nuanced, effortless professional expression' }
  ];

  const goals: Array<{ id: LearningGoal; title: string; desc: string }> = [
    { id: 'confidence_fluency', title: 'Confidence & Fluency', desc: 'Overcome hesitation and speak smoothly' },
    { id: 'job_interviews', title: 'Job Interviews', desc: 'STAR method answers & executive presence' },
    { id: 'everyday_conversation', title: 'Everyday Conversation', desc: 'Small talk, social connection, and hobbies' },
    { id: 'grammar_improvement', title: 'Grammar Accuracy', desc: 'Fix recurring tense, preposition, and word order errors' },
    { id: 'workplace_communication', title: 'Workplace & Business', desc: 'Meetings, project updates, and negotiations' },
    { id: 'travel_english', title: 'Travel & Relocation', desc: 'Airports, hotels, dining, and navigating cities' }
  ];

  const feedbackModes: Array<{ id: FeedbackMode; title: string; desc: string }> = [
    { id: 'instant', title: 'Instant Correction', desc: 'Immediate breakdown of errors & better phrases after each turn' },
    { id: 'gentle', title: 'Gentle Coaching', desc: 'Only high-severity mistakes flagged; keeps smooth dialogue' },
    { id: 'end_of_session', title: 'End-of-Session Review', desc: 'Zero interruptions during conversation; complete report at finish' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl transition-all">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>Personalized English Coaching Setup</span>
          </div>
          <div className="text-xs text-slate-400 font-medium tabular-nums">
            Step {step} of 3
          </div>
        </div>

        {/* Step 1: Name & Proficiency */}
        {step === 1 && (
          <div className="space-y-5 pt-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Welcome! What should your coach call you?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                We use this to personalize conversations and recommendations.
              </p>
              <div className="mt-3 relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your preferred name or nickname"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                What is your current English speaking level?
              </span>
              <div className="space-y-2">
                {proficiencyLevels.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLevel(item.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      level === item.id
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-slate-900 dark:text-white font-medium">{item.title}</div>
                      <div className="text-slate-500 text-[11px]">{item.desc}</div>
                    </div>
                    {level === item.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Learning Goal */}
        {step === 2 && (
          <div className="space-y-5 pt-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                What is your primary speaking goal?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your AI coach will tailor conversation topics and scenarios to this goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {goals.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                    goal === item.id
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.title}</span>
                    {goal === item.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </div>
                  <span className="text-slate-500 text-[11px]">{item.desc}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Feedback Mode & Daily Target */}
        {step === 3 && (
          <div className="space-y-5 pt-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Coaching Style & Daily Commitment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose how you want feedback delivered during practice sessions.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Feedback Style
              </span>
              {feedbackModes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFeedbackMode(item.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    feedbackMode === item.id
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-slate-900 dark:text-white font-medium">{item.title}</div>
                    <div className="text-slate-500 text-[11px]">{item.desc}</div>
                  </div>
                  {feedbackMode === item.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Coach Voice & Accent */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  AI Coach Voice
                </span>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white"
                >
                  <option value="Kore">Kore (Warm & Natural)</option>
                  <option value="Puck">Puck (Energetic & Clear)</option>
                  <option value="Fenrir">Fenrir (Calm & Deep)</option>
                  <option value="Zephyr">Zephyr (Bright & Friendly)</option>
                </select>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Daily Practice Goal
                </span>
                <select
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white"
                >
                  <option value={10}>10 minutes / day</option>
                  <option value={15}>15 minutes / day (Recommended)</option>
                  <option value={20}>20 minutes / day</option>
                  <option value={30}>30 minutes / day</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Start Speaking with SpeakFlow
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
