import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  PracticeSession, 
  ConversationTurn, 
  VocabularyItem, 
  ScenarioDefinition,
  PronunciationChallenge,
  ProgressSummary,
  TurnCorrection,
  SessionEvaluation
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'speakflow_db.json');

export const CURATED_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'job_interview_hr',
    category: 'interview',
    title: 'HR Job Interview',
    tagline: 'Standard behavioral questions & career story',
    difficulty: 'intermediate',
    userRole: 'Job Candidate',
    aiRole: 'Senior HR Recruiter (Ms. Harrison)',
    objective: 'Introduce yourself, answer behavioral questions using STAR method, and explain why you are a great fit.',
    context: 'You are interviewing for an open position at a forward-thinking international company. The interviewer is warm, professional, and wants to evaluate your communication clarity and past achievements.',
    initialPrompt: 'Welcome! Thank you for joining us today. To start off, could you tell me a little bit about yourself and what brought you to this opportunity?',
    successCriteria: [
      'Give a concise 1-2 minute introduction without rambling',
      'Explain a past obstacle and how you overcame it',
      'Use professional vocabulary and transitions',
      'Ask a thoughtful question at the end'
    ],
    suggestedPhrases: [
      'In my previous role, I was responsible for...',
      'One challenge I encountered was...',
      'The outcome was a 25% improvement in...',
      'What I find most compelling about this team is...'
    ],
    targetVocabulary: ['collaborative', 'initiative', 'milestone', 'streamline', 'cross-functional'],
    icon: 'Briefcase'
  },
  {
    id: 'tech_interview_arch',
    category: 'interview',
    title: 'Technical Project Walkthrough',
    tagline: 'Explaining architecture & technical tradeoffs',
    difficulty: 'upper_intermediate',
    userRole: 'Software Engineer',
    aiRole: 'Lead Systems Architect (David)',
    objective: 'Explain the technical architecture of a project you built, justify design decisions, and discuss scalability.',
    context: 'Technical interview round. The interviewer is curious about how you design systems, handle bottlenecks, and balance speed versus reliability.',
    initialPrompt: "Hi there! I'd love to hear about a challenging software project you designed or contributed to recently. Walk me through the high-level architecture.",
    successCriteria: [
      'Clearly describe frontend, backend, and database tiers',
      'Articulate why you chose specific technologies',
      'Discuss how you handled caching, latency, or concurrency'
    ],
    suggestedPhrases: [
      'We decoupled the service to isolate bottlenecks...',
      'To prevent cascade failures, we implemented...',
      'The primary trade-off was latency versus consistency...'
    ],
    targetVocabulary: ['throughput', 'decouple', 'resilience', 'bottleneck', 'asynchronous'],
    icon: 'Cpu'
  },
  {
    id: 'restaurant_fine_dining',
    category: 'roleplay',
    title: 'Dining at a Bistro',
    tagline: 'Ordering food, asking for recommendations, dietary preferences',
    difficulty: 'elementary',
    userRole: 'Dinner Guest',
    aiRole: 'Attentive Waiter (Julian)',
    objective: 'Order a three-course dinner, ask about daily specials, request wine pairing, and ask for the bill politely.',
    context: 'You are having dinner at a cozy, upscale downtown bistro. The waiter is welcoming and knowledgeable about the menu.',
    initialPrompt: 'Good evening and welcome to Le Miroir! May I start you off with some sparkling water or perhaps a house aperitif while you look over our dinner menu?',
    successCriteria: [
      'Politely inquire about vegetarian or gluten-free options',
      'Order an appetizer, main dish, and beverage',
      'Inquire about the bill and thank the staff'
    ],
    suggestedPhrases: [
      'Could you recommend a popular house specialty?',
      'Does this dish contain any dairy or nuts?',
      'Could we have the bill whenever you have a moment, please?'
    ],
    targetVocabulary: ['appetizer', 'entree', 'savory', 'beverage', 'complimentary'],
    icon: 'Utensils'
  },
  {
    id: 'airport_missed_flight',
    category: 'real_life',
    title: 'Airport Flight Rebooking',
    tagline: 'Handling travel delays & negotiating polite solutions',
    difficulty: 'intermediate',
    userRole: 'Stranded Passenger',
    aiRole: 'Airline Service Agent (Agent Sandra)',
    objective: 'Politely explain your connecting flight was missed due to delay, request rebooking on the next flight, and ask about hotel vouchers.',
    context: 'Your incoming flight arrived 45 minutes late, and you just saw the gate close for your connecting flight to New York. You approach the customer assistance desk.',
    initialPrompt: 'Next in line, please. Hello! How can I assist you with your travels today?',
    successCriteria: [
      'State your situation clearly without losing temper',
      'Provide your flight details and destination',
      'Politely request alternative flight accommodations or meal vouchers'
    ],
    suggestedPhrases: [
      'My inbound flight was delayed, causing me to miss my connection.',
      'Are there any remaining seats on the evening flight?',
      'Could you please advise if hotel accommodations are provided?'
    ],
    targetVocabulary: ['connection', 'rebooking', 'compensation', 'itinerary', 'gate'],
    icon: 'Plane'
  },
  {
    id: 'salary_negotiation',
    category: 'interview',
    title: 'Salary & Compensation Negotiation',
    tagline: 'Advocating your value with professional tact',
    difficulty: 'advanced',
    userRole: 'Candidate with an Offer',
    aiRole: 'Hiring Manager (Karen)',
    objective: 'Express excitement about the job offer while negotiating a 10-15% higher base salary and flexible remote days.',
    context: 'You received a written offer of $90,000. Market research shows comparable roles pay $100,000-$105,000. You are speaking with the hiring manager.',
    initialPrompt: "Hello! We are thrilled to extend this offer to you. Did you have a chance to review the terms, and how are you feeling about joining our team?",
    successCriteria: [
      'Express genuine enthusiasm first',
      'Cite market benchmarks and specific unique skills',
      'Negotiate base salary or bonus respectfully'
    ],
    suggestedPhrases: [
      'I am very excited about the mission and the team...',
      'Based on the market rate for this seniority and my track record in...',
      'Is there flexibility on the starting base salary or signing bonus?'
    ],
    targetVocabulary: ['compensation', 'benchmark', 'equity', 'flexibility', 'proven track record'],
    icon: 'DollarSign'
  },
  {
    id: 'doctor_consultation',
    category: 'real_life',
    title: 'Medical Clinic Appointment',
    tagline: 'Describing symptoms, duration, and medical history',
    difficulty: 'elementary',
    userRole: 'Patient',
    aiRole: 'Attentive Physician (Dr. Evans)',
    objective: 'Describe physical symptoms accurately, explain how long you have had them, and understand medication instructions.',
    context: 'You visit a walk-in health clinic because of persistent fatigue, sore throat, and intermittent fever.',
    initialPrompt: 'Good morning, please have a seat. What seems to be troubling you today?',
    successCriteria: [
      'Describe symptoms with sensory details (sharp, dull, throbbing, intermittent)',
      'Specify the onset and timeline of the illness',
      'Ask about side effects of prescribed medication'
    ],
    suggestedPhrases: [
      'I have been experiencing a sharp pain since Tuesday...',
      'It gets worse when I swallow or try to lie down.',
      'How often should I take this medication, and should it be taken with food?'
    ],
    targetVocabulary: ['symptom', 'prescription', 'dosage', 'drowsy', 'inflammation'],
    icon: 'HeartPulse'
  },
  {
    id: 'apartment_lease_inquiry',
    category: 'real_life',
    title: 'Apartment Rental Tour & Inquiry',
    tagline: 'Asking landlord about utilities, lease terms, and rules',
    difficulty: 'intermediate',
    userRole: 'Prospective Tenant',
    aiRole: 'Property Manager (Marcus)',
    objective: 'Tour an apartment, ask about utility bills, parking, pet policies, security deposit, and lease duration.',
    context: 'You are viewing a one-bedroom apartment in a vibrant neighborhood and want to verify all details before submitting an application.',
    initialPrompt: 'Welcome! This is our top-floor one-bedroom unit with southern exposure. Feel free to look around! What questions can I answer for you?',
    successCriteria: [
      'Ask what utilities are included in the monthly rent',
      'Inquire about security deposit and lease break clauses',
      'Ask about laundry facilities and pet policies'
    ],
    suggestedPhrases: [
      'Are water and heating included in the monthly rent?',
      'What is the standard duration of the lease agreement?',
      'How does the building handle maintenance requests?'
    ],
    targetVocabulary: ['utilities', 'security deposit', 'lease agreement', 'maintenance', 'sublet'],
    icon: 'Home'
  },
  {
    id: 'startup_pitch_investor',
    category: 'roleplay',
    title: 'Startup Pitch to Angel Investor',
    tagline: 'Articulating problem, solution, unit economics & traction',
    difficulty: 'advanced',
    userRole: 'Startup Founder',
    aiRole: 'Angel Investor (Arthur Vance)',
    objective: 'Deliver an engaging 2-minute elevator pitch, defend your moat/differentiation, and answer probing questions.',
    context: 'You have a 10-minute meeting with a prominent early-stage investor who is known for asking tough questions about market size and customer retention.',
    initialPrompt: "Great to connect. I know you're building in the EdTech/AI space. You've got my full attention—what problem are you solving and why now?",
    successCriteria: [
      'Hook the listener with an acute, relatable problem',
      'Clearly explain the unfair advantage or moat',
      'Mention concrete traction or user feedback metrics'
    ],
    suggestedPhrases: [
      'Existing solutions fail because they treat language as a test rather than a habit...',
      'Our early cohorts show 3x higher retention because...',
      'We are raising a seed round to accelerate our distribution...'
    ],
    targetVocabulary: ['traction', 'retention', 'unit economics', 'competitive advantage', 'go-to-market'],
    icon: 'Sparkles'
  },
  {
    id: 'customer_complaint_return',
    category: 'real_life',
    title: 'Handling a Damaged Product Return',
    tagline: 'Firm yet polite customer resolution',
    difficulty: 'intermediate',
    userRole: 'Disappointed Customer',
    aiRole: 'Store Support Representative (Chloe)',
    objective: 'Explain you received a defective electronic item, show proof of purchase, and request a prompt replacement or refund.',
    context: 'You bought a high-end noise-canceling headset that stopped charging after 3 days. You visit the store customer desk.',
    initialPrompt: 'Hi there, welcome to TechGear support. How can I help you today?',
    successCriteria: [
      'Politely explain the defect without aggression',
      'Provide receipt details and describe troubleshooting steps taken',
      'Assertively request an exchange or full refund'
    ],
    suggestedPhrases: [
      'I purchased this unit three days ago, but the left earbud stopped charging.',
      'I tried resetting it according to the manual, but the issue persists.',
      'I would appreciate an exchange for a working unit or a full refund.'
    ],
    targetVocabulary: ['defective', 'replacement', 'warranty', 'receipt', 'malfunction'],
    icon: 'RotateCcw'
  },
  {
    id: 'academic_college_viva',
    category: 'roleplay',
    title: 'University Thesis Defense / Viva',
    tagline: 'Academic presentation, methodology & defending conclusions',
    difficulty: 'advanced',
    userRole: 'Graduate Researcher',
    aiRole: 'Academic Review Committee Chair (Professor Sterling)',
    objective: 'Defend your research methodology, address potential confounding variables, and explain the real-world significance.',
    context: 'You are presenting your capstone research paper to the faculty panel. The professor wants to see critical thinking and scholarly communication.',
    initialPrompt: 'Welcome Candidate. Your paper on conversational AI adaptations was intriguing. Let us begin with your methodology: how did you account for sample bias in your pilot study?',
    successCriteria: [
      'Demonstrate deep familiarity with research literature',
      'Concede limitations thoughtfully while highlighting empirical strengths',
      'Speak in formal academic register'
    ],
    suggestedPhrases: [
      'To mitigate potential confounding factors, we controlled for...',
      'While the sample size was relatively modest, the findings correlate with...',
      'Future iterations of this study will investigate...'
    ],
    targetVocabulary: ['methodology', 'empirical', 'confounding', 'statistically significant', 'implications'],
    icon: 'GraduationCap'
  }
];

export const PRONUNCIATION_CHALLENGES: PronunciationChallenge[] = [
  {
    id: 'th_voiced_unvoiced',
    text: 'Think through the three thrilling theories.',
    type: 'sentence',
    phonetic: '/θɪŋk θruː ðə θriː ˈθrɪl.ɪŋ ˈθɪə.riz/',
    focusSound: 'Unvoiced /θ/ vs Voiced /ð/',
    difficulty: 'intermediate',
    tip: 'Place the tip of your tongue gently between your upper and lower front teeth. Blow air gently for /θ/ (think), and vibrate your vocal cords for /ð/ (the).'
  },
  {
    id: 'v_w_distinction',
    text: 'Very wary wolves viewed the winding valley.',
    type: 'sentence',
    phonetic: '/ˈvɛr.i ˈwɛə.ri wʊlvz vjuːd ðə ˈwaɪn.dɪŋ ˈvæl.i/',
    focusSound: '/v/ vs /w/',
    difficulty: 'intermediate',
    tip: 'For /v/, touch your top teeth to your bottom lip with friction. For /w/, round your lips into a tight circle like blowing out a candle.'
  },
  {
    id: 'r_l_clarity',
    text: 'Really rare red rubies reflect brilliant light.',
    type: 'sentence',
    phonetic: '/ˈrɪə.li reə rɛd ˈruː.biz rɪˈflɛkt ˈbrɪl.jənt laɪt/',
    focusSound: '/r/ vs /l/',
    difficulty: 'upper_intermediate',
    tip: 'For /l/, press the tongue tip against the roof of the mouth behind your teeth. For /r/, curl the tongue back without touching the roof.'
  },
  {
    id: 'syllable_stress_photo',
    text: 'Photograph, photographer, photographic.',
    type: 'word',
    phonetic: '/ˈfoʊ.tə.ɡræf / fəˈtɑː.ɡrə.fɚ / ˌfoʊ.t̬əˈɡræf.ɪk/',
    focusSound: 'Shifting Word Stress',
    difficulty: 'intermediate',
    tip: 'Notice how the primary stress jumps: PHO-to-graph (1st), pho-TOG-ra-pher (2nd), pho-to-GRAPH-ic (3rd).'
  },
  {
    id: 'minimal_pairs_ship_sheep',
    text: 'The ship slipped through the deep green sea.',
    type: 'sentence',
    phonetic: '/ðə ʃɪp slɪpt θruː ðə diːp ɡriːn siː/',
    focusSound: 'Short /ɪ/ vs Long /iː/',
    difficulty: 'elementary',
    tip: 'Short /ɪ/ in "ship" is relaxed and short. Long /iː/ in "sheep" is smiling and tense.'
  },
  {
    id: 'connected_speech_gonna',
    text: 'What are you going to do about the schedule?',
    type: 'phrase',
    phonetic: '/wʌt ɑːr juː ˈɡoʊ.ɪŋ tuː duː əˈbaʊt ðə ˈskɛdʒ.uːl/',
    focusSound: 'Connected Speech & Linking',
    difficulty: 'advanced',
    tip: 'Native speakers link "what are you" smoothly into /wʌt-ər-jə/ and "going to" into /ɡənə/ in casual conversational rhythm.'
  }
];

interface DatabaseSchema {
  userProfile: UserProfile;
  sessions: PracticeSession[];
  turns: ConversationTurn[];
  vocabulary: VocabularyItem[];
  activityDates: string[]; // List of YYYY-MM-DD
}

class SpeakFlowDataStore {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load database file, creating fresh store', e);
    }

    const initialDb: DatabaseSchema = {
      userProfile: {
        id: 'user_default',
        name: 'Learner',
        proficiencyLevel: 'intermediate',
        primaryGoal: 'confidence_fluency',
        feedbackMode: 'instant',
        preferredAccent: 'US',
        preferredVoice: 'Kore',
        dailyPracticeMinutes: 15,
        weaknessFocus: 'verb_tense',
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      sessions: [],
      turns: [],
      vocabulary: [
        {
          id: 'vocab_1',
          userId: 'user_default',
          term: 'articulate',
          definition: 'Able to express thoughts and ideas clearly and effectively.',
          exampleSentence: 'She gave an articulate defense of her proposal during the meeting.',
          synonym: 'eloquent, coherent',
          level: 'intermediate',
          reviewState: 'learning',
          reviewCount: 2,
          nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 'vocab_2',
          userId: 'user_default',
          term: 'collaborate',
          definition: 'To work jointly with others or together especially in an intellectual endeavor.',
          exampleSentence: 'Engineers collaborate with designers to create intuitive software.',
          synonym: 'cooperate, team up',
          level: 'elementary',
          reviewState: 'mastered',
          reviewCount: 5,
          nextReviewDate: new Date(Date.now() + 864000000).toISOString(),
          createdAt: new Date(Date.now() - 604800000).toISOString()
        },
        {
          id: 'vocab_3',
          userId: 'user_default',
          term: 'nuance',
          definition: 'A subtle distinction or variation in expression, meaning, or tone.',
          exampleSentence: 'He caught every nuance of the speaker’s humorous remarks.',
          synonym: 'subtlety, distinction',
          level: 'upper_intermediate',
          reviewState: 'new',
          reviewCount: 0,
          nextReviewDate: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      activityDates: [
        new Date().toISOString().split('T')[0]
      ]
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(db: DatabaseSchema = this.db) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  // --- Profile ---
  public getProfile(): UserProfile {
    return this.db.userProfile;
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.db.userProfile = {
      ...this.db.userProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    return this.db.userProfile;
  }

  // --- Sessions ---
  public createSession(sessionData: {
    category: PracticeSession['category'];
    title: string;
    topic?: string;
    scenarioConfig?: PracticeSession['scenarioConfig'];
    feedbackMode?: PracticeSession['feedbackMode'];
  }): PracticeSession {
    const today = new Date().toISOString().split('T')[0];
    if (!this.db.activityDates.includes(today)) {
      this.db.activityDates.push(today);
    }

    const newSession: PracticeSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: this.db.userProfile.id,
      category: sessionData.category,
      title: sessionData.title,
      topic: sessionData.topic,
      scenarioConfig: sessionData.scenarioConfig,
      feedbackMode: sessionData.feedbackMode || this.db.userProfile.feedbackMode || 'instant',
      status: 'active',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      turnCount: 0,
      turns: []
    };

    this.db.sessions.unshift(newSession);
    this.saveDatabase();
    return newSession;
  }

  public getSession(id: string): PracticeSession | undefined {
    const session = this.db.sessions.find(s => s.id === id);
    if (!session) return undefined;
    const turns = this.db.turns.filter(t => t.sessionId === id).sort((a, b) => a.turnIndex - b.turnIndex);
    return {
      ...session,
      turns
    };
  }

  public listSessions(): PracticeSession[] {
    return this.db.sessions;
  }

  public deleteSession(id: string): boolean {
    const idx = this.db.sessions.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.db.sessions.splice(idx, 1);
    this.db.turns = this.db.turns.filter(t => t.sessionId !== id);
    this.saveDatabase();
    return true;
  }

  public addTurn(turnData: {
    sessionId: string;
    speaker: 'user' | 'ai';
    transcript: string;
    audioBase64?: string;
    latencyMs?: number;
    correction?: TurnCorrection;
  }): ConversationTurn {
    const session = this.db.sessions.find(s => s.id === turnData.sessionId);
    const currentSessionTurns = this.db.turns.filter(t => t.sessionId === turnData.sessionId);
    const turnIndex = currentSessionTurns.length + 1;

    const newTurn: ConversationTurn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: turnData.sessionId,
      turnIndex,
      speaker: turnData.speaker,
      transcript: turnData.transcript,
      audioBase64: turnData.audioBase64,
      timestamp: new Date().toISOString(),
      latencyMs: turnData.latencyMs,
      correction: turnData.correction
    };

    this.db.turns.push(newTurn);

    if (session) {
      session.turnCount = turnIndex;
    }

    this.saveDatabase();
    return newTurn;
  }

  public finishSession(
    sessionId: string, 
    evaluation: SessionEvaluation, 
    durationSeconds: number
  ): PracticeSession | undefined {
    const session = this.db.sessions.find(s => s.id === sessionId);
    if (!session) return undefined;

    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    session.durationSeconds = durationSeconds;
    session.score = evaluation.overallScore;
    session.evaluation = evaluation;

    // Track activity date
    const today = new Date().toISOString().split('T')[0];
    if (!this.db.activityDates.includes(today)) {
      this.db.activityDates.push(today);
    }

    // Auto-save recommended vocabulary items if provided
    if (evaluation.recommendedVocabulary && evaluation.recommendedVocabulary.length > 0) {
      for (const vocab of evaluation.recommendedVocabulary) {
        const existing = this.db.vocabulary.find(v => v.term.toLowerCase() === vocab.term.toLowerCase());
        if (!existing) {
          this.db.vocabulary.push({
            id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: session.userId,
            term: vocab.term,
            definition: vocab.definition,
            exampleSentence: vocab.example,
            level: session.scenarioConfig?.difficulty || 'intermediate',
            sourceSessionId: sessionId,
            reviewState: 'new',
            reviewCount: 0,
            nextReviewDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    this.saveDatabase();
    return this.getSession(sessionId);
  }

  // --- Vocabulary ---
  public listVocabulary(): VocabularyItem[] {
    return this.db.vocabulary;
  }

  public addVocabulary(item: {
    term: string;
    definition: string;
    exampleSentence: string;
    synonym?: string;
    level?: UserProfile['proficiencyLevel'];
    sourceSessionId?: string;
  }): VocabularyItem {
    const newItem: VocabularyItem = {
      id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: this.db.userProfile.id,
      term: item.term.trim(),
      definition: item.definition.trim(),
      exampleSentence: item.exampleSentence.trim(),
      synonym: item.synonym,
      level: item.level || 'intermediate',
      sourceSessionId: item.sourceSessionId,
      reviewState: 'new',
      reviewCount: 0,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.db.vocabulary.unshift(newItem);
    this.saveDatabase();
    return newItem;
  }

  public updateVocabulary(id: string, updates: Partial<VocabularyItem>): VocabularyItem | undefined {
    const item = this.db.vocabulary.find(v => v.id === id);
    if (!item) return undefined;
    Object.assign(item, updates);
    this.saveDatabase();
    return item;
  }

  public deleteVocabulary(id: string): boolean {
    const idx = this.db.vocabulary.findIndex(v => v.id === id);
    if (idx === -1) return false;
    this.db.vocabulary.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  // --- Real Progress Computation ---
  public getProgressSummary(): ProgressSummary {
    const completedSessions = this.db.sessions.filter(s => s.status === 'completed');
    const totalPracticeMinutes = Math.round(
      completedSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
    );

    // Calculate real streak based on consecutive activity dates
    const streak = this.calculateStreak(this.db.activityDates);

    // Average score across completed sessions with evaluation
    const scores = completedSessions
      .map(s => s.score)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s));
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Build timeline trends (last 7 completed sessions or daily aggregates)
    const fluencyTrend = completedSessions
      .filter(s => s.evaluation?.rubrics?.fluency?.score !== undefined)
      .slice(-7)
      .map(s => ({
        date: new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(((s.evaluation!.rubrics.fluency.score) / (s.evaluation!.rubrics.fluency.maxScore || 20)) * 100)
      }));

    const grammarAccuracyTrend = completedSessions
      .filter(s => s.evaluation?.rubrics?.grammar?.score !== undefined)
      .slice(-7)
      .map(s => ({
        date: new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(((s.evaluation!.rubrics.grammar.score) / (s.evaluation!.rubrics.grammar.maxScore || 25)) * 100)
      }));

    const vocabMastered = this.db.vocabulary.filter(v => v.reviewState === 'mastered').length;
    const vocabLearning = this.db.vocabulary.filter(v => v.reviewState === 'learning').length;

    const recentSessions = completedSessions.slice(0, 5).map(s => ({
      id: s.id,
      title: s.title,
      category: s.category,
      date: new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      durationMinutes: Math.max(1, Math.round((s.durationSeconds || 60) / 60)),
      score: s.score || 0,
      mainImprovement: s.evaluation?.priorityImprovements?.[0] || 'Fluency pacing and past tense verbs'
    }));

    return {
      totalPracticeMinutes,
      totalSessionsCompleted: completedSessions.length,
      currentStreakDays: streak,
      averageScore,
      fluencyTrend,
      grammarAccuracyTrend,
      vocabularyCount: {
        total: this.db.vocabulary.length,
        mastered: vocabMastered,
        learning: vocabLearning
      },
      recentSessions
    };
  }

  private calculateStreak(dates: string[]): number {
    if (!dates || dates.length === 0) return 0;
    const uniqueSorted = Array.from(new Set(dates)).sort().reverse();
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak is active (activity today or yesterday)
    if (!uniqueSorted.includes(todayStr) && !uniqueSorted.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = uniqueSorted.includes(todayStr) ? today : yesterday;

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueSorted.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}

export const dataStore = new SpeakFlowDataStore();
