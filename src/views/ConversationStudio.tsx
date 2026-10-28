import React, { useState, useEffect, useRef } from 'react';
import { 
  PracticeSession, 
  ConversationTurn, 
  TurnCorrection, 
  UserProfile 
} from '../types/index.ts';
import { 
  Mic, 
  Square, 
  RotateCcw, 
  Send, 
  MessageSquare, 
  ArrowLeft, 
  Sparkles,
  AlertCircle,
  Sliders,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { audioEngine, SpeakingState } from '../services/audioEngine.ts';
import { api } from '../services/api.ts';
import { AudioWaveform } from '../components/AudioWaveform.tsx';
import { CorrectionDrawer } from '../components/CorrectionDrawer.tsx';

interface ConversationStudioProps {
  session: PracticeSession;
  profile: UserProfile;
  onBack: () => void;
  onFinishSession: (session: PracticeSession) => void;
}

export const ConversationStudio: React.FC<ConversationStudioProps> = ({
  session,
  profile,
  onBack,
  onFinishSession
}) => {
  const [turns, setTurns] = useState<ConversationTurn[]>(session.turns || []);
  const [speakingState, setSpeakingState] = useState<SpeakingState>('idle');
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [activeCorrection, setActiveCorrection] = useState<TurnCorrection | null>(null);
  const [subtitleMode, setSubtitleMode] = useState<boolean>(true); // Subtitle lyrics mode by default for roleplay
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcribingNotice, setTranscribingNotice] = useState<string | null>(null);

  // Session duration timer
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript / subtitles smoothly
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, interimTranscript]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Play opening greeting audio if it's the start of the session
  useEffect(() => {
    if (turns.length > 0 && turns[0].speaker === 'ai' && turns.length === 1) {
      const firstTurn = turns[0];
      setSpeakingState('speaking');
      audioEngine.playAudio({
        audioBase64: firstTurn.audioBase64,
        textFallback: firstTurn.transcript,
        onStart: () => setSpeakingState('speaking'),
        onEnd: () => setSpeakingState('idle'),
        onError: () => setSpeakingState('idle')
      });
    }

    return () => {
      audioEngine.stopListening();
      audioEngine.stopAudio();
    };
  }, []);

  // Keyboard shortcut: Space to toggle mic when not typing in text field
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        if (speakingState === 'listening') {
          handleStopListening();
        } else if (speakingState === 'idle') {
          handleStartListening();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speakingState, interimTranscript]);

  const handleStartListening = async () => {
    setErrorMessage(null);
    setTranscribingNotice(null);
    setInterimTranscript('');
    
    // Interrupt any active AI audio
    audioEngine.stopAudio();
    setSpeakingState('listening');

    await audioEngine.startListening({
      onInterim: (text) => {
        setInterimTranscript(text);
      },
      onFinal: (text) => {
        setInterimTranscript('');
        handleSendMessage(text);
      },
      onError: (err) => {
        console.warn('Speech recognition notification:', err);
        // Do not block - MediaRecorder continues to record in parallel
      },
      onLevels: (levels) => {
        setAudioLevels(levels);
      }
    });
  };

  const handleStopListening = async () => {
    setSpeakingState('processing');
    const audioData = await audioEngine.stopListening();
    
    // 1. If Web Speech produced transcript, use it immediately
    if (interimTranscript && interimTranscript.trim()) {
      const finalMsg = interimTranscript.trim();
      setInterimTranscript('');
      await handleSendMessage(finalMsg, audioData || undefined);
      return;
    }

    // 2. Fallback: If Web Speech was blocked or silent in the browser, transcribe recorded audio via Gemini backend!
    if (audioData) {
      setTranscribingNotice('Processing speech with Gemini audio transcription...');
      try {
        const transRes = await api.transcribeAudio(audioData);
        setTranscribingNotice(null);
        if (transRes.transcript && transRes.transcript.trim()) {
          await handleSendMessage(transRes.transcript.trim(), audioData);
          return;
        } else {
          setSpeakingState('idle');
          setErrorMessage('No clear speech was heard. Please speak closer to your microphone or type your sentence below.');
          return;
        }
      } catch (err) {
        console.error('Transcription fallback error:', err);
        setTranscribingNotice(null);
        setSpeakingState('idle');
        setErrorMessage('Could not connect to microphone audio. Please check browser microphone permissions or type below.');
        return;
      }
    }

    setSpeakingState('idle');
  };

  const handleSendMessage = async (text: string, audioBase64?: string) => {
    if (!text.trim()) return;

    setSpeakingState('processing');
    setErrorMessage(null);
    setTranscribingNotice(null);

    // Optimistically show user message
    const tempUserTurn: ConversationTurn = {
      id: `temp_${Date.now()}`,
      sessionId: session.id,
      turnIndex: turns.length + 1,
      speaker: 'user',
      transcript: text.trim(),
      timestamp: new Date().toISOString()
    };
    setTurns(prev => [...prev, tempUserTurn]);
    setTextInput('');

    try {
      const res = await api.submitTurn(session.id, text.trim(), audioBase64);
      
      // Update with server turn & attach any corrections
      setTurns(prev => {
        const filtered = prev.filter(t => t.id !== tempUserTurn.id);
        return [...filtered, res.userTurn, res.aiTurn];
      });

      // Show instant correction if returned
      if (res.correction) {
        setActiveCorrection(res.correction);
      }

      // Play AI spoken response
      setSpeakingState('speaking');
      await audioEngine.playAudio({
        audioBase64: res.audioBase64,
        textFallback: res.aiTurn.transcript,
        voiceName: profile.preferredVoice || 'Kore',
        onStart: () => setSpeakingState('speaking'),
        onEnd: () => setSpeakingState('idle'),
        onError: () => setSpeakingState('idle')
      });
    } catch (err: any) {
      console.error('Turn submission error:', err);
      setErrorMessage(err.message || 'Failed to get AI response. Please check your connection.');
      setSpeakingState('idle');
    }
  };

  const handleReplayLastTurn = async () => {
    const lastAiTurn = [...turns].reverse().find(t => t.speaker === 'ai');
    if (!lastAiTurn) return;

    setSpeakingState('speaking');
    await audioEngine.playAudio({
      audioBase64: lastAiTurn.audioBase64,
      textFallback: lastAiTurn.transcript,
      voiceName: profile.preferredVoice || 'Kore',
      onStart: () => setSpeakingState('speaking'),
      onEnd: () => setSpeakingState('idle'),
      onError: () => setSpeakingState('idle')
    });
  };

  const handleStopAudio = () => {
    audioEngine.stopAudio();
    setSpeakingState('idle');
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    audioEngine.stopAudio();
    audioEngine.stopListening();

    try {
      const updated = await api.finishSession(session.id, sessionSeconds);
      onFinishSession(updated);
    } catch (err) {
      console.error('Finish session failed:', err);
      setIsFinishing(false);
      setErrorMessage('Failed to evaluate session. Please try again.');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stateLabels: Record<SpeakingState, { text: string; color: string }> = {
    idle: { text: 'Ready to speak', color: 'text-slate-500 dark:text-slate-400' },
    listening: { text: 'Listening to your voice...', color: 'text-rose-600 dark:text-rose-400 font-semibold animate-pulse' },
    processing: { text: 'AI is responding within seconds...', color: 'text-amber-600 dark:text-amber-400 font-semibold' },
    speaking: { text: 'AI character is speaking', color: 'text-indigo-600 dark:text-indigo-400 font-semibold' },
    paused: { text: 'Paused', color: 'text-slate-400' },
    error: { text: 'Audio note', color: 'text-rose-500' }
  };

  const isRoleplay = session.category === 'roleplay' || session.category === 'real_life_scenario' || session.category === 'interview_prep';

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] max-w-5xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Session Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Leave conversation"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{session.title}</span>
              {isRoleplay && (
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                  Roleplay Studio
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="tabular-nums font-mono">{formatTimer(sessionSeconds)}</span>
              <span aria-hidden="true">·</span>
              {session.scenarioConfig ? (
                <span>
                  <strong className="text-slate-700 dark:text-slate-300">{session.scenarioConfig.userRole}</strong> speaking with <strong className="text-slate-700 dark:text-slate-300">{session.scenarioConfig.aiRole}</strong>
                </span>
              ) : (
                <span>Spontaneous Conversation</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtitle / Karaoke Mode Toggle */}
          <button
            onClick={() => setSubtitleMode(!subtitleMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              subtitleMode
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800'
                : 'text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Toggle Subtitle lyrics sliding animation"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{subtitleMode ? 'Subtitles Active' : 'Chat Bubbles'}</span>
          </button>

          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm whitespace-nowrap transition-colors"
          >
            {isFinishing ? 'Generating Report...' : 'End & Evaluate'}
          </button>
        </div>
      </div>

      {/* Main Conversation & Subtitle Stage */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden py-4 gap-4">
        
        {/* Dialogue Stream: Subtitle Lyrics Sliding Mode */}
        {subtitleMode ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
            {turns.map((turn, index) => {
              const isAi = turn.speaker === 'ai';
              const isLatestTurn = index === turns.length - 1;

              return (
                <div
                  key={turn.id}
                  className={`transition-all duration-500 ease-out flex flex-col ${
                    isAi ? 'items-start' : 'items-end'
                  } ${
                    isLatestTurn 
                      ? 'scale-100 opacity-100 transform translate-y-0' 
                      : 'scale-[0.98] opacity-75 transform -translate-y-1'
                  }`}
                >
                  {/* Speaker Label with distinctive badge */}
                  <div className="flex items-center gap-2 text-[11px] mb-1.5 px-1 font-medium">
                    {isAi ? (
                      <span className="text-purple-600 dark:text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{session.scenarioConfig?.aiRole || 'AI Character'}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                        <span>{session.scenarioConfig?.userRole || 'You'}</span>
                      </span>
                    )}
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="text-slate-400">{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Subtitle Dialogue Card: Different Colors for AI & User */}
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed transition-all shadow-md ${
                      isAi
                        ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-500/40 shadow-indigo-950/20 rounded-tl-sm'
                        : 'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white border border-emerald-400/40 shadow-emerald-950/20 rounded-tr-sm'
                    } ${isLatestTurn ? 'ring-2 ring-indigo-400/40 dark:ring-indigo-500/50' : ''}`}
                  >
                    <p className="font-normal">{turn.transcript}</p>
                  </div>
                </div>
              );
            })}

            {/* Interim live speech preview (actively speaking) */}
            {interimTranscript && (
              <div className="flex flex-col items-end animate-in fade-in duration-200">
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mb-1 px-1 font-bold">
                  You (Speaking...)
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm p-4 text-base bg-emerald-600 text-white border border-emerald-400 animate-pulse shadow-md">
                  <p>{interimTranscript} ...</p>
                </div>
              </div>
            )}

            <div ref={turnsEndRef} />
          </div>
        ) : (
          /* Standard Chat Bubbles */
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {turns.map((turn) => {
              const isAi = turn.speaker === 'ai';
              return (
                <div
                  key={turn.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 px-1">
                    <span>{isAi ? session.scenarioConfig?.aiRole || 'AI Coach' : 'You'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isAi
                        ? 'bg-indigo-950 text-white border border-indigo-800 rounded-tl-sm'
                        : 'bg-emerald-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <p>{turn.transcript}</p>
                  </div>
                </div>
              );
            })}
            <div ref={turnsEndRef} />
          </div>
        )}

        {/* Instant Pronunciation & Grammar Correction Card */}
        {activeCorrection && (
          <div className="shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CorrectionDrawer
              correction={activeCorrection}
              onClose={() => setActiveCorrection(null)}
              onPracticeCorrection={(sentence) => {
                setTextInput(sentence);
              }}
            />
          </div>
        )}

        {/* Processing or Transcription Notice */}
        {transcribingNotice && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{transcribingNotice}</span>
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Interactive Voice Console Deck */}
        <div className="shrink-0 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col items-center justify-center gap-3">
          
          {/* Status Label & Waveform */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs ${stateLabels[speakingState].color}`}>
                {stateLabels[speakingState].text}
              </span>
            </div>

            <AudioWaveform
              isActive={speakingState === 'listening' || speakingState === 'speaking'}
              levels={audioLevels}
              color={speakingState === 'listening' ? 'emerald' : 'indigo'}
            />
          </div>

          {/* Primary Voice Action Button */}
          <div className="flex items-center gap-4">
            {speakingState === 'speaking' ? (
              <button
                onClick={handleStopAudio}
                className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
                title="Stop AI speech"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Audio</span>
              </button>
            ) : speakingState === 'listening' ? (
              <button
                onClick={handleStopListening}
                className="relative flex items-center justify-center w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
                title="Finish speaking sentence"
              >
                <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-25" />
                <Square className="w-6 h-6 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleStartListening}
                disabled={speakingState === 'processing'}
                className="relative flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Tap to speak into microphone"
              >
                <Mic className="w-7 h-7" />
              </button>
            )}

            {/* Replay last AI turn */}
            <button
              onClick={handleReplayLastTurn}
              disabled={speakingState === 'speaking' || speakingState === 'listening'}
              className="p-3 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              title="Replay last character response"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Tap mic or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">Space</kbd> to speak naturally · Tap square when done speaking
          </div>

          {/* Text Input Fallback */}
          <div className="w-full pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textInput.trim()) {
                  handleSendMessage(textInput);
                }
              }}
              placeholder="Or type what you want to say in English..."
              disabled={speakingState === 'listening' || speakingState === 'processing'}
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleSendMessage(textInput)}
              disabled={!textInput.trim() || speakingState === 'listening' || speakingState === 'processing'}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
