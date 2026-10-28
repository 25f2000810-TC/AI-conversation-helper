import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { dataStore, CURATED_SCENARIOS, PRONUNCIATION_CHALLENGES } from './server/dataStore.ts';
import { geminiService } from './server/geminiService.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support large payload for audio base64 uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// --- API ROUTES ---

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'SpeakFlow AI',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// User Profile
app.get('/api/profile', (req: Request, res: Response) => {
  res.json(dataStore.getProfile());
});

app.put('/api/profile', (req: Request, res: Response) => {
  const updated = dataStore.updateProfile(req.body);
  res.json(updated);
});

// Practice Modes & Scenarios
app.get('/api/practice/modes', (req: Request, res: Response) => {
  res.json([
    {
      id: 'free_conversation',
      title: 'Free Conversation',
      description: 'Speak spontaneously on any topic with adaptive AI dialogue.',
      icon: 'MessageCircle',
      tag: 'Core'
    },
    {
      id: 'instant_correction',
      title: 'Instant Correction Mode',
      description: 'Get immediate grammar, phrasing, and vocabulary feedback after every sentence.',
      icon: 'CheckCircle2',
      tag: 'Coaching'
    },
    {
      id: 'uninterrupted',
      title: 'Uninterrupted Immersion',
      description: 'Natural flowing dialogue without interruptions. Full review report at the end.',
      icon: 'Sparkles',
      tag: 'Fluency'
    },
    {
      id: 'roleplay',
      title: 'Fictional Roleplay',
      description: 'Immerse yourself as a character in restaurants, negotiations, or interviews.',
      icon: 'Drama',
      tag: 'Immersive'
    },
    {
      id: 'real_life_scenario',
      title: 'Real-Life Situation Simulator',
      description: 'Guided task simulations like flight delays, doctor visits, and apartment tours.',
      icon: 'MapPin',
      tag: 'Practical'
    },
    {
      id: 'pronunciation',
      title: 'Pronunciation & Phonetics',
      description: 'Practice difficult English sounds, minimal pairs, and syllable stress with feedback.',
      icon: 'Mic',
      tag: 'Clarity'
    },
    {
      id: 'vocabulary',
      title: 'Vocabulary Builder',
      description: 'Spaced repetition flashcards with definitions, synonyms, and context examples.',
      icon: 'BookOpen',
      tag: 'Lexicon'
    },
    {
      id: 'grammar_focus',
      title: 'Grammar & Fluency Focus',
      description: 'Target specific weaknesses like verb tenses, prepositions, or filler words.',
      icon: 'Target',
      tag: 'Precision'
    },
    {
      id: 'interview_prep',
      title: 'Interview & Professional English',
      description: 'Master behavioral questions, project walkthroughs, and salary negotiations.',
      icon: 'Briefcase',
      tag: 'Career'
    }
  ]);
});

app.get('/api/practice/scenarios', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  if (category) {
    res.json(CURATED_SCENARIOS.filter(s => s.category === category));
  } else {
    res.json(CURATED_SCENARIOS);
  }
});

// Sessions
app.post('/api/sessions', async (req: Request, res: Response) => {
  try {
    const { category, title, topic, scenarioConfig, feedbackMode } = req.body;
    const session = dataStore.createSession({
      category: category || 'free_conversation',
      title: title || 'English Speaking Practice',
      topic,
      scenarioConfig,
      feedbackMode
    });

    // If scenario has initial prompt, generate initial AI turn
    if (scenarioConfig?.scenarioId) {
      const scenario = CURATED_SCENARIOS.find(s => s.id === scenarioConfig.scenarioId);
      if (scenario) {
        const greeting = scenario.initialPrompt;
        dataStore.addTurn({
          sessionId: session.id,
          speaker: 'ai',
          transcript: greeting
        });
      }
    } else {
      // Default welcome prompt for free conversation
      const greeting = topic 
        ? `Hello! I'm excited to practice English with you today. We're discussing "${topic}". What are your initial thoughts on this?`
        : "Hello! I'm your SpeakFlow AI conversation coach. How was your day today, or is there a specific topic you'd love to chat about?";

      dataStore.addTurn({
        sessionId: session.id,
        speaker: 'ai',
        transcript: greeting
      });
    }

    const fullSession = dataStore.getSession(session.id);
    res.json(fullSession);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/sessions', (req: Request, res: Response) => {
  res.json(dataStore.listSessions());
});

app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const session = dataStore.getSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

app.delete('/api/sessions/:id', (req: Request, res: Response) => {
  const deleted = dataStore.deleteSession(req.params.id);
  res.json({ success: deleted });
});

// Submit user turn & receive AI response with instant analysis
app.post('/api/sessions/:id/turns', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { message, audioBase64 } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const session = dataStore.getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const profile = dataStore.getProfile();
    const currentTurns = session.turns || [];
    const context = currentTurns.slice(-2).map(t => `${t.speaker}: ${t.transcript}`).join('; ');

    // Execute unified high-speed turn processing with gemini-3.1-flash-lite
    // Generates conversational response, grammar correction, pronunciation tips, and encouragement in ~2 seconds
    const unifiedResult = await geminiService.processTurnUnified({
      session,
      turns: currentTurns,
      userMessage: message.trim(),
      profile
    });

    const { replyText, correction, latencyMs } = unifiedResult;

    // 2. Add User Turn with instant correction and pronunciation guidance
    const userTurn = dataStore.addTurn({
      sessionId,
      speaker: 'user',
      transcript: message.trim(),
      audioBase64,
      correction
    });

    // 3. Add AI Turn
    const aiTurn = dataStore.addTurn({
      sessionId,
      speaker: 'ai',
      transcript: replyText,
      latencyMs
    });

    // Fast return so the UI receives the response in under 3-5 seconds!
    res.json({
      userTurn,
      aiTurn,
      correction,
      audioBase64: undefined
    });
  } catch (error) {
    console.error('Turn submission error:', error);
    res.status(500).json({ error: 'Failed to process conversation turn' });
  }
});

// Finish session and run comprehensive 5-factor rubric evaluation
app.post('/api/sessions/:id/finish', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { durationSeconds = 120 } = req.body;

    const session = dataStore.getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const profile = dataStore.getProfile();
    const evaluation = await geminiService.evaluateSession({
      session,
      turns: session.turns || [],
      profile
    });

    const finishedSession = dataStore.finishSession(sessionId, evaluation, durationSeconds);
    res.json(finishedSession);
  } catch (error) {
    console.error('Session completion error:', error);
    res.status(500).json({ error: 'Failed to finish session evaluation' });
  }
});

// Direct Turn Analysis endpoint
app.post('/api/analysis/turn', async (req: Request, res: Response) => {
  try {
    const { text, context, learnerLevel } = req.body;
    const profile = dataStore.getProfile();
    const correction = await geminiService.analyzeTurn({
      userText: text,
      context: context || '',
      learnerLevel: learnerLevel || profile.proficiencyLevel
    });
    res.json({ correction });
  } catch (e) {
    res.status(500).json({ error: 'Turn analysis failed' });
  }
});

// Direct Speech Synthesize endpoint
app.post('/api/speech/synthesize', async (req: Request, res: Response) => {
  try {
    const { text, voice } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    const profile = dataStore.getProfile();
    const result = await geminiService.synthesizeSpeech(text, voice || profile.preferredVoice || 'Kore');
    if (!result) {
      res.status(500).json({ error: 'Speech synthesis unavailable' });
      return;
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Synthesis failed' });
  }
});

// Direct Speech Transcription endpoint
app.post('/api/speech/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: 'audioBase64 is required' });
      return;
    }
    const transcript = await geminiService.transcribeAudio(audioBase64, mimeType || 'audio/webm');
    res.json({ transcript });
  } catch (e) {
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Pronunciation Practice Challenges & Evaluation
app.get('/api/pronunciation/challenges', (req: Request, res: Response) => {
  res.json(PRONUNCIATION_CHALLENGES);
});

app.post('/api/pronunciation/evaluate', async (req: Request, res: Response) => {
  try {
    const { targetText, spokenText } = req.body;
    if (!targetText || !spokenText) {
      res.status(400).json({ error: 'targetText and spokenText are required' });
      return;
    }
    const result = await geminiService.evaluatePronunciationAttempt(targetText, spokenText);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Pronunciation evaluation failed' });
  }
});

// Progress Summary
app.get('/api/progress/summary', (req: Request, res: Response) => {
  res.json(dataStore.getProgressSummary());
});

// Vocabulary
app.get('/api/vocabulary', (req: Request, res: Response) => {
  res.json(dataStore.listVocabulary());
});

app.post('/api/vocabulary', (req: Request, res: Response) => {
  const item = dataStore.addVocabulary(req.body);
  res.json(item);
});

app.patch('/api/vocabulary/:id', (req: Request, res: Response) => {
  const updated = dataStore.updateVocabulary(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/vocabulary/:id', (req: Request, res: Response) => {
  const deleted = dataStore.deleteVocabulary(req.params.id);
  res.json({ success: deleted });
});

// Vite & Static Asset Handling
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpeakFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
