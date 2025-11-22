import { useMemo, useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [vocabulary, setVocabulary] = useState<Map<string, VocabularyWord>>(new Map());
  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Mutation to save word to vocabulary
  const saveWordMutation = trpc.vocabulary.saveWordFromText.useMutation({
    onSuccess: () => {
      toast.success(t.wordSavedToVocabulary);
    },
    onError: (error) => {
      toast.error(error.message || t.failedToSaveWord);
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
  
  // Process content and wrap vocabulary words
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
            
            // Build wrapper WITHOUT tooltip (tooltip is separate, outside wrapper)
            htmlParts.push(
              `<span class="vocab-word-wrapper" data-word="${escapedVocabWord}" data-translation="${escapedTranslation}">` +
                `<span class="vocab-word">${escapedWord}</span>` +
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
  
  // Handle tooltip positioning on hover
  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    
    const handleMouseEnter = (e: Event) => {
      const wrapper = e.currentTarget as HTMLElement;
      const translation = wrapper.getAttribute('data-translation') || '';
      
      // Update tooltip content
      const translationDiv = tooltip.querySelector('.tooltip-translation');
      if (translationDiv) {
        translationDiv.textContent = translation;
      }
      
      // Position tooltip
      const wrapperRect = wrapper.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 200;
      const tooltipHeight = tooltip.offsetHeight || 60;
      
      let left = wrapperRect.left + (wrapperRect.width / 2);
      const top = wrapperRect.top - tooltipHeight - 8;
      
      // Adjust if would overflow
      if (left + tooltipWidth / 2 > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth / 2 - 10;
      } else if (left - tooltipWidth / 2 < 10) {
        left = tooltipWidth / 2 + 10;
      }
      
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.opacity = '1';
    };
    
    const handleMouseLeave = () => {
      tooltip.style.opacity = '0';
    };
    
    const wrappers = document.querySelectorAll('.vocab-word-wrapper');
    wrappers.forEach(wrapper => {
      wrapper.addEventListener('mouseenter', handleMouseEnter);
      wrapper.addEventListener('mouseleave', handleMouseLeave);
    });
    
    return () => {
      wrappers.forEach(wrapper => {
        wrapper.removeEventListener('mouseenter', handleMouseEnter);
        wrapper.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [processedContent]);
  
  return (
    <>
      <style>{`
        .vocab-word-wrapper {
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
        
        .global-vocab-tooltip {
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
          transform: translateX(-50%);
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
        
        .global-vocab-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: #1e293b;
        }
        
        @media (max-width: 640px) {
          .global-vocab-tooltip {
            white-space: normal;
            max-width: 250px;
          }
        }
      `}</style>
      
      {/* Single global tooltip */}
      <div ref={tooltipRef} className="global-vocab-tooltip">
        <div className="tooltip-translation"></div>
        <div className="tooltip-hint">💾 Double-click to save</div>
      </div>
      
      <div 
        className={className}
        dir="ltr"
        style={{ textAlign: 'left' }}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </>
  );
}
