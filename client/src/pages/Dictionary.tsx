import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Volume2, Plus, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";

export default function Dictionary() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  
  // Get preferred translation based on user language
  const getPreferredTranslation = (word: any) => {
    switch(language) {
      case 'ar': return word.translation_ar;
      case 'en': return word.translation_en;
      case 'tr': return word.translation_tr;
      default: return word.translation_en || word.translation_ar || word.translation_tr;
    }
  };
  
  const getTranslationLabel = () => {
    switch(language) {
      case 'ar': return 'الترجمة';
      case 'en': return 'Translation';
      case 'tr': return 'Çeviri';
      case 'nl': return 'Vertaling';
      default: return 'Translation';
    }
  };

  const { data: words, isLoading } = trpc.dictionary.search.useQuery(
    { query: searchQuery, letter: selectedLetter },
    { enabled: searchQuery.length >= 2 || selectedLetter !== null }
  );

  const addToVocabularyMutation = trpc.vocabulary.addFromDictionary.useMutation({
    onSuccess: () => {
      toast.success("✅ تمت إضافة الكلمة إلى مفرداتك!");
    },
    onError: (error) => {
      if (error.message.includes("already have")) {
        toast.info("ℹ️ هذه الكلمة موجودة بالفعل في مفرداتك");
      } else {
        toast.error("❌ فشل في إضافة الكلمة: " + error.message);
      }
    },
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const playAudio = async (audioUrl: string | null, word: string) => {
    try {
      if (audioUrl) {
        // Use R2 audio if available
        const audio = new Audio(audioUrl);
        await audio.play();
      } else {
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "nl-NL";
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
      // If R2 audio fails, try Web Speech API as fallback
      if (audioUrl) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "nl-NL";
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">B1 Dictionary</h1>
        <p className="text-gray-600">Search and explore Dutch B1 vocabulary with translations</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchForWord}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Alphabet Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedLetter(null)}
          className={`px-3 py-1 rounded ${
            selectedLetter === null
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {t.allLetters}
        </button>
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`px-3 py-1 rounded ${
              selectedLetter === letter
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}

      {/* Welcome Page when ALL is selected and no search */}
      {!isLoading && selectedLetter === null && searchQuery.length < 2 && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 text-white rounded-full p-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
              {t.dictionaryWelcomeTitle || "📚 B1 Dutch Dictionary"}
            </h2>
            
            {/* Description */}
            <p className="text-lg text-center text-gray-700 mb-8 leading-relaxed">
              {t.dictionaryWelcomeDesc || "This dictionary contains essential Dutch words that every B1 level learner should know."}
            </p>

            {/* How to Use Section */}
            <div className="space-y-6 mb-8">
              {/* Browse */}
              <div className="flex gap-4 items-start">
                <div className="bg-blue-600 text-white rounded-full p-2 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {t.dictionaryHowToBrowse || "🔍 How to browse?"}
                  </h3>
                  <p className="text-gray-700">
                    {t.dictionaryHowToBrowseDesc || "Choose a letter from A-Z to browse words, or use the search bar to find specific words."}
                  </p>
                </div>
              </div>

              {/* Add to Vocabulary */}
              <div className="flex gap-4 items-start">
                <div className="bg-green-600 text-white rounded-full p-2 flex-shrink-0">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {t.dictionaryHowToAdd || "➕ How to add words to your vocabulary?"}
                  </h3>
                  <p className="text-gray-700">
                    {t.dictionaryHowToAddDesc || "Click the + button next to any word to add it to your personal vocabulary for practice and memorization."}
                  </p>
                </div>
              </div>

              {/* Listen */}
              <div className="flex gap-4 items-start">
                <div className="bg-purple-600 text-white rounded-full p-2 flex-shrink-0">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {t.dictionaryHowToListen || "🔊 How to listen?"}
                  </h3>
                  <p className="text-gray-700">
                    {t.dictionaryHowToListenDesc || "Click the speaker icon to hear the correct pronunciation of each word."}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={() => setSelectedLetter('A')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {t.dictionaryStartBrowsing || "🚀 Start Browsing →"}
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-blue-200">
              <p className="text-center text-sm text-gray-600">
                {t.dictionaryStats || "📊 Contains thousands of B1-level Dutch words with translations in Arabic, English, and Turkish"}
              </p>
            </div>
          </div>
        </div>
      )}

      {words && words.length === 0 && searchQuery.length >= 2 && (
        <div className="text-center py-12 text-gray-500">
          {t.noResultsFound}
        </div>
      )}

      {words && words.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <div key={word.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Word Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => playAudio(word.audio_url, word.word)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title={t.playAudio}
                  >
                    <Volume2 size={20} />
                  </button>
                  <button
                    onClick={() => addToVocabularyMutation.mutate({ word: word.word })}
                    disabled={addToVocabularyMutation.isPending}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
                    title={t.addToVocabulary}
                  >
                    {addToVocabularyMutation.isPending ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Plus size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Dutch Definition */}
              {word.definition_nl && (
                <div className="mb-3 p-2 bg-blue-50 rounded">
                  <p className="text-sm text-gray-700">{word.definition_nl}</p>
                </div>
              )}

              {/* Primary Translation (based on user language) */}
              {getPreferredTranslation(word) && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase">{getTranslationLabel()}:</span>
                  <p className="text-base font-medium text-gray-900 mt-1">{getPreferredTranslation(word)}</p>
                </div>
              )}
              
              {/* Other Translations (collapsed) */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">Other translations</summary>
                <div className="space-y-1 mt-2 pl-2">
                  {word.translation_ar && language !== 'ar' && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">AR:</span>
                      <span className="text-sm text-gray-700 ml-2">{word.translation_ar}</span>
                    </div>
                  )}
                  {word.translation_en && language !== 'en' && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">EN:</span>
                      <span className="text-sm text-gray-700 ml-2">{word.translation_en}</span>
                    </div>
                  )}
                  {word.translation_tr && language !== 'tr' && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">TR:</span>
                      <span className="text-sm text-gray-700 ml-2">{word.translation_tr}</span>
                    </div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  );
}
