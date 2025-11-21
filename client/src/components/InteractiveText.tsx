import { useMemo, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface InteractiveTextProps {
  textId: number;
  content: string;
  className?: string;
}

interface VocabularyWord {
  word: string;
  arabic: string;
  english: string;
  turkish: string;
  dutchDefinition: string;
}

/**
 * Interactive text component with hover translations
 * Rewritten to use React state instead of DOM manipulation
 */
export default function InteractiveText({ textId, content, className = "" }: InteractiveTextProps) {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<Map<string, VocabularyWord>>(new Map());
  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');
  
  // Mutation to save word to vocabulary
  const saveWordMutation = trpc.vocabulary.saveWordFromText.useMutation({
    onSuccess: () => {
      toast.success('Word saved to vocabulary!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save word');
    },
  });
  
  // Get preferred language from user or localStorage
  useEffect(() => {
    if (user?.preferred_language) {
      setPreferredLanguage(user.preferred_language);
    } else {
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang) {
        setPreferredLanguage(savedLang);
      }
    }
  }, [user]);
  
  // Fetch vocabulary for this text
  const { data: vocabData } = trpc.vocabulary.getVocabularyByText.useQuery({ text_id: textId });
  
  useEffect(() => {
    if (vocabData) {
      const vocabMap = new Map<string, VocabularyWord>();
      vocabData.forEach((item: any) => {
        // Normalize word (lowercase, remove punctuation)
        const normalized = item.dutchWord.toLowerCase().replace(/[.,!?;:]/g, '');
        vocabMap.set(normalized, {
          word: item.dutchWord,
          arabic: item.arabicTranslation || '',
          english: item.englishTranslation || '',
          turkish: item.turkishTranslation || '',
          dutchDefinition: item.dutchDefinition || '',
        });
      });
      setVocabulary(vocabMap);
    }
  }, [vocabData]);
  
  // Handle double-click to save word
  const handleSaveWord = (word: string) => {
    saveWordMutation.mutate({
      textId: textId,
      dutchWord: word,
    });
  };
  
  // Get translation based on preferred language
  const getTranslation = (vocabWord: VocabularyWord): string => {
    switch (preferredLanguage) {
      case 'ar':
        return vocabWord.arabic || vocabWord.english;
      case 'en':
        return vocabWord.english || vocabWord.arabic;
      case 'tr':
        return vocabWord.turkish || vocabWord.english;
      case 'nl':
        return vocabWord.dutchDefinition || '';
      default:
        return vocabWord.english || vocabWord.arabic;
    }
  };
  
  // Process content and wrap vocabulary words
  // Using useMemo to avoid re-processing on every render
  const processedContent = useMemo(() => {
    if (vocabulary.size === 0) {
      return content;
    }
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Function to process text nodes recursively
    const processNode = (node: Node): Node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const words = text.split(/(\s+|[.,!?;:])/);
        
        let hasVocab = false;
        const fragment = document.createDocumentFragment();
        
        words.forEach(word => {
          const normalized = word.toLowerCase().replace(/[.,!?;:]/g, '');
          const vocabWord = vocabulary.get(normalized);
          
          if (vocabWord && word.trim().length > 0) {
            hasVocab = true;
            const wrapper = document.createElement('span');
            wrapper.className = 'vocab-word-wrapper';
            wrapper.setAttribute('data-word', vocabWord.word);
            
            const span = document.createElement('span');
            span.className = 'vocab-word';
            span.textContent = word;
            
            const translation = getTranslation(vocabWord);
            const tooltip = document.createElement('div');
            tooltip.className = 'vocab-tooltip';
            tooltip.innerHTML = `
              <div class="tooltip-translation">${translation}</div>
              <div class="tooltip-hint">💾 Double-click to save</div>
            `;
            
            wrapper.appendChild(span);
            wrapper.appendChild(tooltip);
            fragment.appendChild(wrapper);
          } else {
            fragment.appendChild(document.createTextNode(word));
          }
        });
        
        return hasVocab ? fragment : node;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // Skip script, style, and already processed vocab words
        if (element.tagName === 'SCRIPT' || 
            element.tagName === 'STYLE' || 
            element.classList.contains('vocab-word-wrapper')) {
          return node;
        }
        
        // Process child nodes
        const newElement = element.cloneNode(false) as Element;
        Array.from(node.childNodes).forEach(child => {
          const processedChild = processNode(child);
          if (processedChild.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            Array.from((processedChild as DocumentFragment).childNodes).forEach(fragChild => {
              newElement.appendChild(fragChild.cloneNode(true));
            });
          } else {
            newElement.appendChild(processedChild.cloneNode(true));
          }
        });
        return newElement;
      }
      
      return node;
    };
    
    // Process all child nodes
    const processedDiv = document.createElement('div');
    Array.from(tempDiv.childNodes).forEach(child => {
      const processedChild = processNode(child);
      if (processedChild.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        Array.from((processedChild as DocumentFragment).childNodes).forEach(fragChild => {
          processedDiv.appendChild(fragChild.cloneNode(true));
        });
      } else {
        processedDiv.appendChild(processedChild.cloneNode(true));
      }
    });
    
    return processedDiv.innerHTML;
  }, [content, vocabulary, preferredLanguage]);
  
  // Handle clicks on vocab words
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('vocab-word')) {
        const wrapper = target.closest('.vocab-word-wrapper');
        if (wrapper) {
          const word = wrapper.getAttribute('data-word');
          if (word && e.detail === 2) { // Double-click
            e.preventDefault();
            e.stopPropagation();
            handleSaveWord(word);
          }
        }
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [textId]);
  
  return (
    <>
      <style>{`
        .vocab-word-wrapper {
          position: relative;
          display: inline;
        }
        
        .vocab-word {
          cursor: pointer;
          border-bottom: 2px dotted #3b82f6;
          color: #2563eb;
          font-weight: 500;
          transition: all 0.2s ease;
          user-select: none;
          display: inline;
        }
        
        .vocab-word:hover {
          background-color: #dbeafe;
          border-bottom-color: #1d4ed8;
        }
        
        .vocab-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 10px 14px;
          border-radius: 8px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          white-space: nowrap;
          min-width: 100px;
        }
        
        .vocab-word-wrapper:hover .vocab-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(-4px);
        }
        
        .tooltip-translation {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 6px;
          text-align: center;
          direction: ltr;
          unicode-bidi: embed;
        }
        
        .tooltip-hint {
          font-size: 11px;
          font-weight: 400;
          opacity: 0.85;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 6px;
          margin-top: 2px;
        }
        
        /* Arrow */
        .vocab-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: #1e293b;
        }
        
        /* Mobile: show tooltip below */
        @media (max-width: 640px) {
          .vocab-tooltip {
            bottom: auto;
            top: 100%;
            transform: translateX(-50%) translateY(8px);
            white-space: normal;
            max-width: 250px;
          }
          
          .vocab-word-wrapper:hover .vocab-tooltip {
            transform: translateX(-50%) translateY(4px);
          }
          
          .vocab-tooltip::after {
            top: auto;
            bottom: 100%;
            border-top-color: transparent;
            border-bottom-color: #1e293b;
          }
        }
      `}</style>
      
      <div 
        className={className}
        dir="ltr"
        style={{ textAlign: 'left' }}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </>
  );
}
