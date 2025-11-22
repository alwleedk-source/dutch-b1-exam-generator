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
    let translation = '';
    
    switch (preferredLanguage) {
      case 'ar':
        translation = vocabWord.arabic || vocabWord.english || vocabWord.turkish || vocabWord.dutchDefinition;
        break;
      case 'en':
        translation = vocabWord.english || vocabWord.arabic || vocabWord.turkish || vocabWord.dutchDefinition;
        break;
      case 'tr':
        translation = vocabWord.turkish || vocabWord.english || vocabWord.arabic || vocabWord.dutchDefinition;
        break;
      case 'nl':
        translation = vocabWord.dutchDefinition || vocabWord.english || vocabWord.arabic;
        break;
      default:
        translation = vocabWord.english || vocabWord.arabic || vocabWord.turkish || vocabWord.dutchDefinition;
    }
    
    return translation || vocabWord.word; // Fallback to the word itself if no translation
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
            
            // Debug: log if translation is empty
            if (!translation || translation.trim() === '') {
              console.warn(`[InteractiveText] Empty translation for word:`, vocabWord);
            }
            
            const tooltip = document.createElement('div');
            tooltip.className = 'vocab-tooltip';
            tooltip.innerHTML = `
              <div class="tooltip-translation">${translation || vocabWord.word}</div>
              <div class="tooltip-hint">💾 Double-click to save</div>
            `;
            
            // Add hover event to position tooltip dynamically
            wrapper.addEventListener('mouseenter', (e) => {
              const rect = wrapper.getBoundingClientRect();
              const tooltipRect = tooltip.getBoundingClientRect();
              
              // Position above the word by default
              let top = rect.top - tooltipRect.height - 8;
              let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
              
              // Adjust if tooltip goes off-screen
              if (left < 10) left = 10;
              if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
              }
              if (top < 10) {
                // Show below if not enough space above
                top = rect.bottom + 8;
              }
              
              tooltip.style.top = `${top}px`;
              tooltip.style.left = `${left}px`;
            });
            
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
          border-bottom: 2px dotted currentColor;
          color: inherit;
          transition: all 0.2s ease;
          user-select: none;
          display: inline;
          /* Inherit all font properties from parent */
          font-size: inherit;
          font-weight: inherit;
          font-family: inherit;
          line-height: inherit;
          letter-spacing: inherit;
        }
        
        .vocab-word:hover {
          background-color: #f3f4f6;
          border-bottom-style: solid;
          border-bottom-width: 2px;
        }
        
        .vocab-tooltip {
          position: fixed;
          bottom: auto;
          left: auto;
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
          max-width: 300px;
        }
        
        .vocab-word-wrapper:hover .vocab-tooltip {
          opacity: 1;
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
