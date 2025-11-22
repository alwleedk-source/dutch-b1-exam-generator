import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Volume2, Plus, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

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
      alert("Word added to your vocabulary!");
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
            placeholder="Search for a word..."
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
          All
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

      {words && words.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No results found. Try a different search or letter.
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
                    title="Play audio"
                  >
                    <Volume2 size={20} />
                  </button>
                  <button
                    onClick={() => addToVocabularyMutation.mutate({ word: word.word })}
                    disabled={addToVocabularyMutation.isPending}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
                    title="Add to my vocabulary"
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
