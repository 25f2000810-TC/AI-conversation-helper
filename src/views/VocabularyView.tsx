import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types/index.ts';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Volume2, 
  Check, 
  Trash2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.ts';
import { audioEngine } from '../services/audioEngine.ts';

export const VocabularyView: React.FC = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // New word form state
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newSynonym, setNewSynonym] = useState('');

  useEffect(() => {
    loadVocab();
  }, []);

  const loadVocab = async () => {
    try {
      const data = await api.listVocabulary();
      setVocabulary(data);
    } catch (e) {
      console.error('Failed to load vocab', e);
    }
  };

  const handlePronounce = async (word: string) => {
    await audioEngine.playAudio({
      textFallback: word
    });
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) return;

    try {
      await api.addVocabulary({
        term: newTerm.trim(),
        definition: newDefinition.trim(),
        exampleSentence: newExample.trim(),
        synonym: newSynonym.trim(),
        level: 'intermediate'
      });
      setNewTerm('');
      setNewDefinition('');
      setNewExample('');
      setNewSynonym('');
      setShowAddModal(false);
      loadVocab();
    } catch (e) {
      console.error('Failed to add vocab', e);
    }
  };

  const handleUpdateStatus = async (id: string, state: 'new' | 'learning' | 'mastered') => {
    try {
      await api.updateVocabulary(id, { reviewState: state });
      loadVocab();
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteVocabulary(id);
      loadVocab();
    } catch (e) {
      console.error('Failed to delete item', e);
    }
  };

  const filtered = vocabulary.filter(v => {
    const matchesFilter = filterState === 'all' || v.reviewState === filterState;
    const matchesSearch = v.term.toLowerCase().includes(search.toLowerCase()) ||
      v.definition.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Route G · Vocabulary Expansion</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Vocabulary Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Words saved from conversation corrections and study sessions, scheduled with spaced repetition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFlashcardMode(!flashcardMode);
              setCurrentCardIndex(0);
              setIsCardFlipped(false);
            }}
            disabled={filtered.length === 0}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-2 ${
              flashcardMode
                ? 'bg-purple-600 text-white border-purple-600'
                : 'text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{flashcardMode ? 'Close Flashcards' : 'Review Flashcards'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {/* Flashcard Study Mode */}
      {flashcardMode && filtered.length > 0 && (
        <div className="p-8 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-b from-purple-50/50 to-white dark:from-slate-850 dark:to-purple-950/20 text-center space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Spaced Repetition Review</span>
            <span className="font-mono tabular-nums">{currentCardIndex + 1} of {filtered.length}</span>
          </div>

          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="min-h-[220px] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md select-none"
          >
            {!isCardFlipped ? (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Click to reveal definition</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {filtered[currentCardIndex].term}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                  Click card to flip
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-md">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Definition</span>
                <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {filtered[currentCardIndex].definition}
                </p>
                {filtered[currentCardIndex].exampleSentence && (
                  <p className="text-xs italic text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    "{filtered[currentCardIndex].exampleSentence}"
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                handleUpdateStatus(filtered[currentCardIndex].id, 'learning');
                if (currentCardIndex < filtered.length - 1) setCurrentCardIndex(prev => prev + 1);
                setIsCardFlipped(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
            >
              Need Practice
            </button>
            <button
              onClick={() => {
                handleUpdateStatus(filtered[currentCardIndex].id, 'mastered');
                if (currentCardIndex < filtered.length - 1) setCurrentCardIndex(prev => prev + 1);
                setIsCardFlipped(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              I Know This!
            </button>
          </div>
        </div>
      )}

      {/* Search & Segmented Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filterState === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Words ({vocabulary.length})
          </button>
          <button
            onClick={() => setFilterState('new')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filterState === 'new'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setFilterState('learning')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filterState === 'learning'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Learning
          </button>
          <button
            onClick={() => setFilterState('mastered')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filterState === 'mastered'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mastered
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search word or definition..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Vocabulary Card Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-500">No vocabulary items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-3 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-900 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {item.term}
                    </span>
                    <button
                      onClick={() => handlePronounce(item.term)}
                      className="p-1 text-slate-400 hover:text-indigo-600"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Zero-pill status text */}
                  <span className="text-[11px] font-medium text-slate-500 capitalize">
                    {item.reviewState}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.definition}
                </p>

                {item.exampleSentence && (
                  <p className="text-xs italic text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    "{item.exampleSentence}"
                  </p>
                )}

                {item.synonym && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Synonyms: </span>
                    {item.synonym}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'mastered')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      item.reviewState === 'mastered'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Mark Mastered
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remove from bank"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add New Word or Phrase
            </h3>
            <form onSubmit={handleAddWord} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Word or Phrase *
                </label>
                <input
                  type="text"
                  required
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="e.g. articulate, prerequisite"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Definition *
                </label>
                <input
                  type="text"
                  required
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="Simple explanation of meaning"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contextual Example Sentence
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Sentence showing how it is used naturally"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Synonyms (optional)
                </label>
                <input
                  type="text"
                  value={newSynonym}
                  onChange={(e) => setNewSynonym(e.target.value)}
                  placeholder="e.g. eloquent, lucid"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Save to Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
