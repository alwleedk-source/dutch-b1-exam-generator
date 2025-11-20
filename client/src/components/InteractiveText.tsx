import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

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
  const [vocabulary, setVocabulary] = useState<Map<string, VocabularyWord>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fetch vocabulary for this text
  const { data: vocabData } = trpc.text.getVocabulary.useQuery({ textId });
  
  useEffect(() => {
    if (vocabData) {
      const vocabMap = new Map<string, VocabularyWord>();
      vocabData.forEach((item: any) => {
        // Normalize word (lowercase, remove punctuation)
        const normalized = item.word.toLowerCase().replace(/[.,!?;:]/g, '');
        vocabMap.set(normalized, {
          word: item.word,
          arabic: item.arabic || '',
          english: item.english || '',
          turkish: item.turkish || '',
          dutchDefinition: item.dutchDefinition || '',
        });
      });
      setVocabulary(vocabMap);
    }
  }, [vocabData]);
  
  useEffect(() => {
    if (!containerRef.current || vocabulary.size === 0) return;
    
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
          const span = document.createElement('span');
          span.className = 'vocab-word';
          span.textContent = word;
          span.setAttribute('data-word', vocabWord.word);
          span.setAttribute('data-arabic', vocabWord.arabic);
          span.setAttribute('data-english', vocabWord.english);
          span.setAttribute('data-turkish', vocabWord.turkish);
          span.setAttribute('data-dutch', vocabWord.dutchDefinition);
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(word));
        }
      });
      
      if (hasVocab && textNode.parentNode) {
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });
  }, [vocabulary, content]);
  
  return (
    <>
      <style>{`
        .vocab-word {
          position: relative;
          cursor: help;
          border-bottom: 2px dotted #3b82f6;
          color: #2563eb;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .vocab-word:hover {
          background-color: #dbeafe;
          border-bottom-color: #1d4ed8;
        }
        
        .vocab-word::after {
          content: attr(data-arabic) " • " attr(data-english);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 400;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.4;
        }
        
        .vocab-word:hover::after {
          opacity: 1;
          transform: translateX(-50%) translateY(-4px);
        }
        
        /* Arrow */
        .vocab-word::before {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(2px);
          border: 6px solid transparent;
          border-top-color: #1e293b;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 1001;
        }
        
        .vocab-word:hover::before {
          opacity: 1;
        }
        
        /* Mobile: show tooltip below */
        @media (max-width: 640px) {
          .vocab-word::after {
            bottom: auto;
            top: 100%;
            transform: translateX(-50%) translateY(8px);
            max-width: 250px;
            white-space: normal;
            text-align: center;
          }
          
          .vocab-word:hover::after {
            transform: translateX(-50%) translateY(4px);
          }
          
          .vocab-word::before {
            bottom: auto;
            top: 100%;
            transform: translateX(-50%) translateY(-2px);
            border-top-color: transparent;
            border-bottom-color: #1e293b;
          }
        }
      `}</style>
      
      <div 
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}
