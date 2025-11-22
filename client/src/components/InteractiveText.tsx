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
    
    return translation || vocabWord.word;
  };
  
  // Escape HTML special characters
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  };
  
  // Process content and wrap vocabulary words using string replacement
  const processedContent = useMemo(() => {
    if (vocabulary.size === 0) {
      return content;
    }
    
    // Parse HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Process text nodes recursively using string replacement
    const processTextNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const text = node.textContent;
        const words = text.split(/(\s+|[.,!?;:])/);
        
        let hasVocab = false;
        let htmlParts: string[] = [];
        
        words.forEach(word => {
          const normalized = word.toLowerCase().replace(/[.,!?;:]/g, '');
          const vocabWord = vocabulary.get(normalized);
          
          if (vocabWord && word.trim().length > 0) {
            hasVocab = true;
            const translation = getTranslation(vocabWord);
            const escapedWord = escapeHtml(word);
            const escapedTranslation = escapeHtml(translation || vocabWord.word);
            const escapedVocabWord = escapeHtml(vocabWord.word);
            
            // Build wrapper with tooltip inside as a single HTML string
            htmlParts.push(
              `<span class="vocab-word-wrapper" data-word="${escapedVocabWord}">` +
                `<span class="vocab-word">${escapedWord}</span>` +
                `<div class="vocab-tooltip">` +
                  `<div class="tooltip-translation">${escapedTranslation}</div>` +
                  `<div class="tooltip-hint">💾 Double-click to save</div>` +
                `</div>` +
              `</span>`
            );
          } else {
            htmlParts.push(escapeHtml(word));
          }
        });
        
        if (hasVocab) {
          // Replace text node with HTML
          const span = document.createElement('span');
          span.innerHTML = htmlParts.join('');
          node.parentNode?.replaceChild(span, node);
          
          // Unwrap the span to keep only its children
          while (span.firstChild) {
            span.parentNode?.insertBefore(span.firstChild, span);
          }
          span.parentNode?.removeChild(span);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // Skip script, style, and already processed vocab words
        if (element.tagName !== 'SCRIPT' && 
            element.tagName !== 'STYLE' && 
            !element.classList.contains('vocab-word-wrapper')) {
          // Process child nodes
          Array.from(node.childNodes).forEach(child => processTextNode(child));
        }
      }
    };
    
    // Process all nodes
    Array.from(tempDiv.childNodes).forEach(child => processTextNode(child));
    
    return tempDiv.innerHTML;
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
  
  // Dynamic tooltip positioning using fixed positioning
  useEffect(() => {
    const adjustTooltipPosition = (wrapper: HTMLElement) => {
      const tooltip = wrapper.querySelector('.vocab-tooltip') as HTMLElement;
      if (!tooltip) return;
      
      const wrapperRect = wrapper.getBoundingClientRect();
      
      // Position tooltip using fixed positioning relative to viewport
      const tooltipWidth = tooltip.offsetWidth || 200;
      const tooltipHeight = tooltip.offsetHeight || 60;
      
      // Calculate center position
      let left = wrapperRect.left + (wrapperRect.width / 2);
      const top = wrapperRect.top - tooltipHeight - 8;
      
      // Adjust if would overflow right
      if (left + tooltipWidth / 2 > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      // Adjust if would overflow left
      else if (left - tooltipWidth / 2 < 10) {
        left = tooltipWidth / 2 + 10;
      }
      
      // Apply positioning
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.transform = 'translateX(-50%)';
    };
    
    const handleMouseEnter = (e: Event) => {
      const wrapper = e.currentTarget as HTMLElement;
      adjustTooltipPosition(wrapper);
    };
    
    const wrappers = document.querySelectorAll('.vocab-word-wrapper');
    wrappers.forEach(wrapper => {
      wrapper.addEventListener('mouseenter', handleMouseEnter);
    });
    
    return () => {
      wrappers.forEach(wrapper => {
        wrapper.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, [processedContent]);
  
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
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 10px 14px;
          border-radius: 8px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          white-space: nowrap;
          min-width: 100px;
          max-width: 300px;
          width: max-content;
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
            white-space: normal;
            max-width: 250px;
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
