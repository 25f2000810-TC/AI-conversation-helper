export type SpeakingState = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused' | 'error';

class AudioEngine {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private isListening: boolean = false;

  // Visualizer level callback
  private animFrameId: number | null = null;
  private onLevelsUpdate?: (levels: number[]) => void;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' && 
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  /**
   * Request microphone permission and initialize AudioContext analyser for visualizer
   */
  public async requestMicrophoneAccess(): Promise<boolean> {
    try {
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      return false;
    }
  }

  /**
   * Start listening to speech with interim & final callbacks
   */
  public async startListening(callbacks: {
    onInterim?: (text: string) => void;
    onFinal: (text: string, audioBase64?: string) => void;
    onError?: (error: string) => void;
    onLevels?: (levels: number[]) => void;
  }): Promise<void> {
    const hasMic = await this.requestMicrophoneAccess();
    if (!hasMic) {
      callbacks.onError?.('Microphone access is unavailable. Please allow microphone permissions or type your message below.');
      return;
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isListening = true;
    this.onLevelsUpdate = callbacks.onLevels;
    this.startLevelMonitoring();

    // Start MediaRecorder in parallel for backup/transcription
    this.recordedChunks = [];
    if (this.mediaStream && typeof MediaRecorder !== 'undefined') {
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.recordedChunks.push(e.data);
        };
        this.mediaRecorder.start(250);
      } catch (e) {
        console.warn('MediaRecorder init failed:', e);
      }
    }

    // Re-create SpeechRecognition instance cleanly to prevent InvalidStateError
    const SpeechRecognition = 
      typeof window !== 'undefined' && 
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        let finalTranscript = '';
        
        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (interim && callbacks.onInterim) {
            callbacks.onInterim(interim);
          }

          if (finalTranscript.trim()) {
            this.stopListening();
            callbacks.onFinal(finalTranscript.trim());
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
          // If browser speech recognition fails (network or permissions), MediaRecorder will capture audio
          if (event.error === 'not-allowed') {
            callbacks.onError?.('Microphone access is not permitted in this browser window. You can type or verify browser mic permissions.');
          }
        };

        this.recognition.onend = () => {
          // Normal end
        };

        this.recognition.start();
      } catch (err) {
        console.warn('SpeechRecognition start failed, relying on MediaRecorder fallback:', err);
      }
    }
  }

  /**
   * Stop listening and return recorded audio data
   */
  public async stopListening(): Promise<string | null> {
    this.isListening = false;
    this.stopLevelMonitoring();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }

    return new Promise<string | null>((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = async () => {
          try {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string)?.split(',')[1] || null;
              resolve(base64);
            };
            reader.readAsDataURL(blob);
          } catch (_) {
            resolve(null);
          }
        };
        try {
          this.mediaRecorder.stop();
        } catch (_) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Continuous level monitoring for waveform visualizer
   */
  private startLevelMonitoring() {
    const update = () => {
      if (!this.isListening || !this.analyser || !this.dataArray) {
        return;
      }

      (this.analyser as any).getByteFrequencyData(this.dataArray);
      
      // Sample 12 frequency bins normalized between 0.05 and 1.0
      const levels: number[] = [];
      const step = Math.max(1, Math.floor(this.dataArray.length / 12));
      for (let i = 0; i < 12; i++) {
        const val = this.dataArray[i * step] || 0;
        levels.push(Math.max(0.08, val / 255));
      }

      this.onLevelsUpdate?.(levels);
      this.animFrameId = requestAnimationFrame(update);
    };

    update();
  }

  private stopLevelMonitoring() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Play AI response audio (WAV base64 from Gemini TTS or browser speech synthesis fallback)
   */
  public async playAudio(params: {
    audioBase64?: string;
    textFallback: string;
    voiceName?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }): Promise<void> {
    this.stopAudio();

    const { audioBase64, textFallback, onStart, onEnd, onError } = params;

    if (audioBase64) {
      try {
        const audioSrc = `data:audio/wav;base64,${audioBase64}`;
        this.currentAudio = new Audio(audioSrc);
        
        this.currentAudio.onplay = () => onStart?.();
        this.currentAudio.onended = () => {
          this.currentAudio = null;
          onEnd?.();
        };
        this.currentAudio.onerror = (e) => {
          console.warn('Audio element error, falling back to browser synthesis:', e);
          this.playBrowserSpeechFallback(textFallback, onStart, onEnd);
        };

        await this.currentAudio.play();
        return;
      } catch (err) {
        console.warn('Failed to play base64 audio, trying browser speech:', err);
        this.playBrowserSpeechFallback(textFallback, onStart, onEnd);
        return;
      }
    }

    // Fallback: Browser SpeechSynthesis
    this.playBrowserSpeechFallback(textFallback, onStart, onEnd);
  }

  private playBrowserSpeechFallback(text: string, onStart?: () => void, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95; // Slightly measured, coach-like pace
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop any currently playing audio immediately (interruption support)
   */
  public stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public isAudioPlaying(): boolean {
    return Boolean(
      (this.currentAudio && !this.currentAudio.paused) || 
      (typeof window !== 'undefined' && window.speechSynthesis?.speaking)
    );
  }

  /**
   * Clean up tracks
   */
  public dispose() {
    this.stopListening();
    this.stopAudio();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const audioEngine = new AudioEngine();
