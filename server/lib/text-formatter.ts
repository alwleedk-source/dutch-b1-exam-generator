/**
 * Improved automatic text formatting for Dutch texts
 * Smarter detection and cleaner formatting
 */

export interface FormattedText {
  html: string;
  textType: "newspaper" | "article" | "instruction" | "list" | "plain";
  hasColumns: boolean;
}

/**
 * Detect if a line is a heading
 */
function isHeading(line: string): boolean {
  const trimmed = line.trim();
  
  // Empty line
  if (!trimmed) return false;
  
  // Markdown heading (## Heading)
  if (/^##\s+/.test(trimmed)) return true;
  
  // Roman numeral section markers (I, II, III, IV, V, etc.)
  if (/^[IVX]+\s/.test(trimmed)) return true;
  
  // Too long to be a heading (more than 80 chars)
  if (trimmed.length > 80) return false;
  
  const words = trimmed.split(/\s+/);
  
  // Too many words (more than 10)
  if (words.length > 10) return false;
  
  // Ends with colon (strong indicator)
  if (trimmed.endsWith(':')) return true;
  
  // All uppercase (at least 2 words)
  if (words.length >= 2 && trimmed === trimmed.toUpperCase()) return true;
  
  // Short line (1-4 words) starting with capital, no period
  if (words.length <= 4 && /^[A-Z]/.test(trimmed) && !trimmed.endsWith('.')) {
    return true;
  }
  
  // Medium line (5-10 words) starting with capital, no period, and relatively short
  if (words.length <= 10 && /^[A-Z]/.test(trimmed) && !trimmed.endsWith('.') && trimmed.length < 60) {
    // Check if it looks like a title (mostly capitalized words)
    const capitalizedWords = words.filter(w => /^[A-Z]/.test(w)).length;
    if (capitalizedWords >= words.length * 0.5) {
      return true;
    }
  }
  
  return false;
}

/**
 * Detect text type based on content structure
 */
function detectTextType(text: string): "newspaper" | "article" | "instruction" | "list" | "plain" {
  const lines = text.split("\n").filter(line => line.trim().length > 0);
  
  // Check for numbered lists (instruction style)
  const numberedListPattern = /^\d+\.|^\d+\)/;
  const numberedLines = lines.filter(line => numberedListPattern.test(line.trim()));
  if (numberedLines.length >= 3) {
    return "instruction";
  }
  
  // Check for bullet lists
  const bulletPattern = /^[•\-\*]/;
  const bulletLines = lines.filter(line => bulletPattern.test(line.trim()));
  if (bulletLines.length >= 3) {
    return "list";
  }
  
  // Analyze paragraph structure
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;
  
  // Newspaper: many short paragraphs, short lines
  if (paragraphs.length >= 5 && avgParagraphLength < 250 && avgLineLength < 80) {
    return "newspaper";
  }
  
  // Article: moderate paragraphs
  if (paragraphs.length >= 3 && avgParagraphLength < 600) {
    return "article";
  }
  
  return "plain";
}

/**
 * Check if text should be displayed in columns
 */
function shouldUseColumns(text: string, textType: string): boolean {
  // Only newspaper types benefit from columns
  if (textType !== "newspaper") {
    return false;
  }
  
  // Check text length (columns work best for medium texts)
  const wordCount = text.split(/\s+/).length;
  
  // Between 300 and 800 words
  if (wordCount < 300 || wordCount > 800) {
    return false;
  }
  
  // Check if there are enough paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length < 4) {
    return false;
  }
  
  return true;
}

/**
 * Format text into HTML with appropriate styling
 */
export function formatText(text: string): FormattedText {
  const textType = detectTextType(text);
  const hasColumns = shouldUseColumns(text, textType);
  
  let html = "";
  
  switch (textType) {
    case "instruction":
      html = formatInstructionText(text);
      break;
    case "list":
      html = formatListText(text);
      break;
    case "newspaper":
    case "article":
      html = formatArticleText(text, hasColumns);
      break;
    default:
      html = formatPlainText(text);
  }
  
  return {
    html,
    textType,
    hasColumns,
  };
}

/**
 * Format instruction-style text (numbered lists)
 */
function formatInstructionText(text: string): string {
  let html = '<div class="formatted-text instruction-text">';
  const lines = text.split("\n");
  let inList = false;
  let currentParagraph = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Empty line
      if (currentParagraph && !inList) {
        html += `<p>${escapeHtml(currentParagraph)}</p>`;
        currentParagraph = "";
      }
      continue;
    }
    
    const numberedPattern = /^(\d+[\.\)])\s*(.+)$/;
    const match = trimmed.match(numberedPattern);
    
    if (match) {
      // Close any open paragraph
      if (currentParagraph) {
        html += `<p>${escapeHtml(currentParagraph)}</p>`;
        currentParagraph = "";
      }
      
      if (!inList) {
        html += '<ol class="instruction-list">';
        inList = true;
      }
      html += `<li>${escapeHtml(match[2])}</li>`;
    } else {
      if (inList) {
        html += '</ol>';
        inList = false;
      }
      
      if (isHeading(trimmed)) {
        if (currentParagraph) {
          html += `<p>${escapeHtml(currentParagraph)}</p>`;
          currentParagraph = "";
        }
        const headingText = trimmed.replace(/^##\s+/, '');
        html += `<h3 class="section-heading">${escapeHtml(headingText)}</h3>`;
      } else {
        if (currentParagraph) {
          currentParagraph += " " + trimmed;
        } else {
          currentParagraph = trimmed;
        }
      }
    }
  }
  
  if (inList) {
    html += '</ol>';
  }
  if (currentParagraph) {
    html += `<p>${escapeHtml(currentParagraph)}</p>`;
  }
  
  html += '</div>';
  return html;
}

/**
 * Format list-style text (bullet points)
 */
function formatListText(text: string): string {
  let html = '<div class="formatted-text list-text">';
  const lines = text.split("\n");
  let inList = false;
  let currentParagraph = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentParagraph && !inList) {
        html += `<p>${escapeHtml(currentParagraph)}</p>`;
        currentParagraph = "";
      }
      continue;
    }
    
    const bulletPattern = /^[•\-\*]\s*(.+)$/;
    const match = trimmed.match(bulletPattern);
    
    if (match) {
      if (currentParagraph) {
        html += `<p>${escapeHtml(currentParagraph)}</p>`;
        currentParagraph = "";
      }
      
      if (!inList) {
        html += '<ul class="bullet-list">';
        inList = true;
      }
      html += `<li>${escapeHtml(match[1])}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      
      if (isHeading(trimmed)) {
        if (currentParagraph) {
          html += `<p>${escapeHtml(currentParagraph)}</p>`;
          currentParagraph = "";
        }
        const headingText = trimmed.replace(/^##\s+/, '');
        html += `<h3 class="section-heading">${escapeHtml(headingText)}</h3>`;
      } else {
        if (currentParagraph) {
          currentParagraph += " " + trimmed;
        } else {
          currentParagraph = trimmed;
        }
      }
    }
  }
  
  if (inList) {
    html += '</ul>';
  }
  if (currentParagraph) {
    html += `<p>${escapeHtml(currentParagraph)}</p>`;
  }
  
  html += '</div>';
  return html;
}

/**
 * Format article/newspaper style text
 */
function formatArticleText(text: string, hasColumns: boolean): string {
  const className = hasColumns ? "formatted-text article-text columns-layout" : "formatted-text article-text";
  let html = `<div class="${className}">`;
  
  // First split by double newlines to get major sections
  const sections = text.split(/\n\s*\n/);
  
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    
    const lines = trimmed.split('\n');
    let currentParagraph: string[] = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check for bullet points
      const bulletMatch = line.match(/^[-•]\s*(.+)$/);
      if (bulletMatch) {
        // Flush current paragraph
        if (currentParagraph.length > 0) {
          const merged = currentParagraph.join(' ').replace(/\s+/g, ' ');
          html += `<p>${escapeHtml(merged)}</p>`;
          currentParagraph = [];
        }
        
        if (!inList) {
          html += '<ul class="bullet-list">';
          inList = true;
        }
        html += `<li>${escapeHtml(bulletMatch[1])}</li>`;
        continue;
      }
      
      // Close list if we were in one
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      
      // Check if this line is a heading (including Roman numerals)
      if (isHeading(line)) {
        // Flush current paragraph
        if (currentParagraph.length > 0) {
          const merged = currentParagraph.join(' ').replace(/\s+/g, ' ');
          html += `<p>${escapeHtml(merged)}</p>`;
          currentParagraph = [];
        }
        // Add heading (remove ## markdown if present)
        const headingText = line.replace(/^##\s+/, '');
        html += `<h3 class="section-heading">${escapeHtml(headingText)}</h3>`;
      } else {
        // Add to current paragraph
        currentParagraph.push(line);
      }
    }
    
    // Close list if still open
    if (inList) {
      html += '</ul>';
    }
    
    // Flush remaining paragraph
    if (currentParagraph.length > 0) {
      const merged = currentParagraph.join(' ').replace(/\s+/g, ' ');
      html += `<p>${escapeHtml(merged)}</p>`;
    }
  }
  
  html += '</div>';
  return html;
}

/**
 * Format plain text
 */
function formatPlainText(text: string): string {
  let html = '<div class="formatted-text plain-text">';
  
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    
    const merged = trimmed.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    if (isHeading(merged)) {
      const headingText = merged.replace(/^##\s+/, '');
      html += `<h3 class="section-heading">${escapeHtml(headingText)}</h3>`;
    } else {
      html += `<p>${escapeHtml(merged)}</p>`;
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
 * Get CSS for formatted text
 * This should be included in the frontend
 */
export function getFormattingCSS(): string {
  return `
    .formatted-text {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 16px;
      line-height: 1.7;
      color: #1a1a1a;
    }
    
    .formatted-text p {
      margin-bottom: 1.2em;
      text-align: justify;
      hyphens: auto;
    }
    
    .formatted-text .section-heading {
      font-weight: 700;
      font-size: 1.2em;
      margin-top: 1.8em;
      margin-bottom: 0.8em;
      color: #01689b;
      line-height: 1.3;
      font-family: inherit;
    }
    
    .formatted-text .section-heading:first-child {
      margin-top: 0;
    }
    
    /* Columns layout for newspaper style */
    .formatted-text.columns-layout {
      column-count: 2;
      column-gap: 2.5rem;
      column-rule: 1px solid #e5e7eb;
    }
    
    /* Prevent headings from breaking across columns */
    .formatted-text.columns-layout .section-heading {
      break-after: avoid;
      column-span: none;
    }
    
    /* Instruction list styling */
    .formatted-text .instruction-list {
      list-style-type: decimal;
      padding-left: 2em;
      margin: 1.2em 0;
    }
    
    .formatted-text .instruction-list li {
      margin-bottom: 0.8em;
      line-height: 1.6;
    }
    
    /* Bullet list styling */
    .formatted-text .bullet-list {
      list-style-type: disc;
      padding-left: 2em;
      margin: 1.2em 0;
    }
    
    .formatted-text .bullet-list li {
      margin-bottom: 0.8em;
      line-height: 1.6;
    }
    
    /* Responsive: disable columns on tablets and mobile */
    @media (max-width: 1024px) {
      .formatted-text.columns-layout {
        column-count: 1;
      }
    }
    
    /* Mobile optimizations */
    @media (max-width: 640px) {
      .formatted-text {
        font-size: 15px;
      }
      
      .formatted-text p {
        text-align: left;
        margin-bottom: 1em;
      }
      
      .formatted-text .section-heading {
        font-size: 1.15em;
        margin-top: 1.5em;
        margin-bottom: 0.6em;
      }
    }
  `;
}
