import { useEffect, useRef, useState } from "react";
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
 * Lightweight implementation using pure CSS tooltips
 */
export default function InteractiveText({ textId, content, className = "" }: InteractiveTextProps) {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<Map<string, VocabularyWord>>(new Map());
  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');
  const containerRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<boolean>(false);
  const utils = trpc.useUtils();
  
  // Mutation to save word to vocabulary
  const saveWordMutation = trpc.vocabulary.saveWordFromText.useMutation({
    onSuccess: () => {
      toast.success('Word saved to vocabulary!');
      // Don't invalidate here to prevent re-render and disappearing words
      // User can refresh vocabulary page to see new words
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
  
  useEffect(() => {
    if (!containerRef.current || vocabulary.size === 0) return;
    
    // Prevent re-processing if already processed for this content
    if (processedRef.current) return;
    
    // Find all text nodes and wrap vocabulary words
    const container = containerRef.current;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes: Text[] = [];
    let node: Node | null;
    
    while ((node = walker.nextNode())) {
      if (node.parentElement?.tagName !== 'SCRIPT' && 
          node.parentElement?.tagName !== 'STYLE' &&
          !node.parentElement?.classList.contains('vocab-word')) {
        textNodes.push(node as Text);
      }
    }
    
    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
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
          wrapper.style.position = 'relative';
          wrapper.style.display = 'inline';
          
          const span = document.createElement('span');
          span.className = 'vocab-word';
          span.textContent = word;
          span.setAttribute('data-word', vocabWord.word);
          
          // Set translation based on preferred language
          let translation = '';
          switch (preferredLanguage) {
            case 'ar':
              translation = vocabWord.arabic || vocabWord.english;
              break;
            case 'en':
              translation = vocabWord.english || vocabWord.arabic;
              break;
            case 'tr':
              translation = vocabWord.turkish || vocabWord.english;
              break;
            case 'nl':
              translation = vocabWord.dutchDefinition || '';
              break;
            default:
              translation = vocabWord.english || vocabWord.arabic;
          }
          
          // Create tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'vocab-tooltip';
          tooltip.innerHTML = `
            <div class="tooltip-translation">${translation}</div>
            <div class="tooltip-hint">💾 Double-click to save</div>
          `;
          
          // Add double-click handler to save word
          span.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Save word to user's vocabulary
            saveWordMutation.mutate({
              textId: textId,
              dutchWord: vocabWord.word,
            });
          });
          
          wrapper.appendChild(span);
          wrapper.appendChild(tooltip);
          fragment.appendChild(wrapper);
        } else {
          fragment.appendChild(document.createTextNode(word));
        }
      });
      
      if (hasVocab && textNode.parentNode) {
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });
    
    // Mark as processed
    processedRef.current = true;
  }, [vocabulary, preferredLanguage]); // Only re-run when vocabulary or language changes
  
  // Reset processed flag when content actually changes
  useEffect(() => {
    processedRef.current = false;
  }, [content]);
  
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
        ref={containerRef}
        className={className}
        dir="ltr"
        style={{ textAlign: 'left' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}
