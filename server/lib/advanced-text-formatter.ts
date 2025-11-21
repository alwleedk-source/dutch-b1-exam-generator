/**
 * Advanced AI-Powered Text Formatting System
 * Intelligently formats any Dutch text with excellent structure detection
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FormattedText {
  html: string;
  textType: "newspaper" | "article" | "instruction" | "list" | "plain";
  hasColumns: boolean;
  usedAI: boolean;
}

interface TextAnalysis {
  textType: "newspaper" | "article" | "instruction" | "list" | "plain";
  layout: "single-column" | "two-column";
  sections: Section[];
  confidence: number;
}

interface Section {
  type: "heading" | "paragraph" | "bullet-list" | "numbered-list" | "text";
  level?: number; // For headings: 1, 2, or 3
  content: string;
  startLine: number;
  endLine: number;
  items?: string[]; // For lists
}

/**
 * Assess text complexity to decide between rule-based or AI formatting
 */
function assessComplexity(text: string): "simple" | "complex" {
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  
  // Indicators of simple text
  const hasDoubleNewlines = /\n\s*\n/.test(text);
  const hasSimpleBullets = /^[-•]\s/m.test(text);
  const hasSimpleNumbering = /^\d+\.\s/m.test(text);
  const hasRomanNumerals = /^[IVX]+\s/m.test(text);
  const hasClearHeadings = /^[A-Z][^.!?]{10,60}:?\s*$/m.test(text);
  
  // Indicators of complex text
  const hasSingleNewlinesOnly = nonEmptyLines.length > 5 && !hasDoubleNewlines;
  const hasMixedLists = (text.match(/^[-•]\s/gm)?.length || 0) > 0 && 
                        (text.match(/^\d+\.\s/gm)?.length || 0) > 0;
  const hasNestedStructure = /^\s{2,}[-•\d]/m.test(text);
  const hasAmbiguousStructure = !hasClearHeadings && !hasRomanNumerals && 
                                nonEmptyLines.length > 10;
  const hasVeryLongParagraphs = text.split(/\n\s*\n/).some(p => p.length > 1000);
  
  // Calculate complexity score
  let complexityScore = 0;
  
  if (hasSingleNewlinesOnly) complexityScore += 3;
  if (hasMixedLists) complexityScore += 2;
  if (hasNestedStructure) complexityScore += 2;
  if (hasAmbiguousStructure) complexityScore += 2;
  if (hasVeryLongParagraphs) complexityScore += 1;
  
  // Reduce score for simple indicators
  if (hasDoubleNewlines) complexityScore -= 1;
  if (hasRomanNumerals) complexityScore -= 1;
  if (hasClearHeadings) complexityScore -= 1;
  
  return complexityScore >= 3 ? "complex" : "simple";
}

/**
 * AI-powered text structure analysis
 */
async function analyzeTextStructure(text: string): Promise<TextAnalysis> {
  const prompt = `Je bent een expert in het analyseren van Nederlandse teksten. Analyseer de volgende tekst en bepaal de structuur.

TEKST:
${text}

TAAK:
1. Bepaal het teksttype:
   - "newspaper": Krantenartikel (korte alinea's, feitelijk, nieuwsachtig)
   - "article": Artikel (langere alinea's, diepgaand, verhalend)
   - "instruction": Instructietekst (genummerde stappen, hoe-te)
   - "list": Lijstformaat (voornamelijk opsommingen)
   - "plain": Gewone tekst

2. Bepaal de layout:
   - "two-column": Voor krantenartikelen met korte alinea's (< 200 tekens gemiddeld)
   - "single-column": Voor alle andere teksten

3. Identificeer alle secties:
   - Koppen (niveau 1, 2, of 3)
   - Alinea's
   - Opsommingen (bullet-list)
   - Genummerde lijsten (numbered-list)

REGELS VOOR KOPPEN:
- Romeinse cijfers (I, II, III, IV, V) = niveau 2 kop
- Genummerde koppen (1., 2., 3.) = niveau 2 kop
- Korte zinnen zonder punt (<80 tekens) = mogelijk kop
- Zinnen die eindigen met dubbele punt (:) = kop
- HOOFDLETTERS = niveau 1 kop

REGELS VOOR ALINEA'S:
- Elke groep zinnen tussen lege regels = aparte alinea
- Als er geen lege regels zijn, gebruik context om alinea's te scheiden
- Lange teksten zonder structuur: splits op logische punten

Geef het resultaat in JSON formaat:
{
  "textType": "newspaper" | "article" | "instruction" | "list" | "plain",
  "layout": "single-column" | "two-column",
  "confidence": 0-100,
  "sections": [
    {
      "type": "heading" | "paragraph" | "bullet-list" | "numbered-list",
      "level": 1-3,
      "content": "De volledige tekst van deze sectie",
      "startLine": 0,
      "endLine": 5,
      "items": ["item 1", "item 2"] // Alleen voor lijsten
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Je bent een expert in tekstanalyse en structuurherkenning voor Nederlandse teksten. Geef altijd valide JSON terug."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return analysis as TextAnalysis;
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Fallback to basic analysis
    return {
      textType: "plain",
      layout: "single-column",
      sections: [{
        type: "paragraph",
        content: text,
        startLine: 0,
        endLine: text.split('\n').length
      }],
      confidence: 0
    };
  }
}

/**
 * Generate HTML from AI analysis
 */
function generateHTMLFromAnalysis(text: string, analysis: TextAnalysis): string {
  const className = analysis.layout === "two-column" 
    ? "formatted-text advanced-format columns-layout" 
    : "formatted-text advanced-format";
  
  let html = `<div class="${className}">`;
  
  for (const section of analysis.sections) {
    const content = escapeHtml(section.content.trim());
    
    switch (section.type) {
      case "heading":
        const level = section.level || 2;
        html += `<h${level} class="section-heading level-${level}">${content}</h${level}>`;
        break;
        
      case "paragraph":
        html += `<p>${content}</p>`;
        break;
        
      case "bullet-list":
        html += '<ul class="bullet-list">';
        if (section.items) {
          section.items.forEach(item => {
            html += `<li>${escapeHtml(item.trim())}</li>`;
          });
        } else {
          // Parse items from content
          const items = section.content.split('\n').filter(l => l.trim());
          items.forEach(item => {
            const cleaned = item.replace(/^[-•]\s*/, '').trim();
            if (cleaned) {
              html += `<li>${escapeHtml(cleaned)}</li>`;
            }
          });
        }
        html += '</ul>';
        break;
        
      case "numbered-list":
        html += '<ol class="numbered-list">';
        if (section.items) {
          section.items.forEach(item => {
            html += `<li>${escapeHtml(item.trim())}</li>`;
          });
        } else {
          // Parse items from content
          const items = section.content.split('\n').filter(l => l.trim());
          items.forEach(item => {
            const cleaned = item.replace(/^\d+\.\s*/, '').trim();
            if (cleaned) {
              html += `<li>${escapeHtml(cleaned)}</li>`;
            }
          });
        }
        html += '</ol>';
        break;
        
      default:
        html += `<p>${content}</p>`;
    }
  }
  
  html += '</div>';
  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Main formatting function - Hybrid approach
 */
export async function formatTextAdvanced(text: string): Promise<FormattedText> {
  // Step 1: Assess complexity
  const complexity = assessComplexity(text);
  
  console.log(`[Text Formatter] Complexity: ${complexity}`);
  
  if (complexity === "simple") {
    // Use fast rule-based formatter (import from existing text-formatter.ts)
    console.log("[Text Formatter] Using rule-based formatter");
    const { formatText } = await import("./text-formatter");
    const result = formatText(text);
    return {
      ...result,
      usedAI: false
    };
  }
  
  // Step 2: Use AI for complex texts
  console.log("[Text Formatter] Using AI-powered formatter");
  
  try {
    const analysis = await analyzeTextStructure(text);
    console.log(`[Text Formatter] AI Analysis: ${analysis.textType}, confidence: ${analysis.confidence}%`);
    
    const html = generateHTMLFromAnalysis(text, analysis);
    
    return {
      html,
      textType: analysis.textType,
      hasColumns: analysis.layout === "two-column",
      usedAI: true
    };
  } catch (error) {
    console.error("[Text Formatter] AI formatting failed, falling back to rules:", error);
    // Fallback to rule-based
    const { formatText } = await import("./text-formatter");
    const result = formatText(text);
    return {
      ...result,
      usedAI: false
    };
  }
}

/**
 * Get enhanced CSS for advanced formatting
 */
export function getAdvancedFormattingCSS(): string {
  return `
    .formatted-text.advanced-format {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 16px;
      line-height: 1.8;
      color: #1a1a1a;
    }
    
    .formatted-text.advanced-format p {
      margin-bottom: 1.4em;
      text-align: justify;
      hyphens: auto;
    }
    
    .formatted-text.advanced-format .section-heading {
      font-weight: 700;
      margin-top: 1.8em;
      margin-bottom: 0.8em;
      color: #1a1a1a;
      line-height: 1.3;
    }
    
    .formatted-text.advanced-format .section-heading.level-1 {
      font-size: 1.5em;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.3em;
    }
    
    .formatted-text.advanced-format .section-heading.level-2 {
      font-size: 1.25em;
    }
    
    .formatted-text.advanced-format .section-heading.level-3 {
      font-size: 1.1em;
    }
    
    .formatted-text.advanced-format .section-heading:first-child {
      margin-top: 0;
    }
    
    /* Columns layout for newspaper style */
    .formatted-text.advanced-format.columns-layout {
      column-count: 2;
      column-gap: 3rem;
      column-rule: 1px solid #e5e7eb;
    }
    
    /* Prevent headings from breaking across columns */
    .formatted-text.advanced-format.columns-layout .section-heading {
      break-after: avoid;
      column-span: none;
    }
    
    /* List styling */
    .formatted-text.advanced-format .bullet-list,
    .formatted-text.advanced-format .numbered-list {
      padding-left: 2em;
      margin: 1.4em 0;
    }
    
    .formatted-text.advanced-format .bullet-list li,
    .formatted-text.advanced-format .numbered-list li {
      margin-bottom: 0.8em;
      line-height: 1.6;
    }
    
    /* Responsive: disable columns on tablets and mobile */
    @media (max-width: 1024px) {
      .formatted-text.advanced-format.columns-layout {
        column-count: 1;
      }
    }
    
    /* Mobile optimizations */
    @media (max-width: 640px) {
      .formatted-text.advanced-format {
        font-size: 15px;
      }
      
      .formatted-text.advanced-format p {
        text-align: left;
        margin-bottom: 1.2em;
      }
    }
  `;
}
