/**
 * Automatic text formatting for Dutch texts
 * Detects text structure and applies appropriate formatting
 */

export interface FormattedText {
  html: string;
  textType: "newspaper" | "article" | "instruction" | "list" | "plain";
  hasColumns: boolean;
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
  
  // Check for newspaper/article style (short paragraphs, multiple sections)
  const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  
  if (paragraphs.length >= 4 && avgParagraphLength < 300) {
    return "newspaper";
  }
  
  if (paragraphs.length >= 3 && avgParagraphLength < 500) {
    return "article";
  }
  
  return "plain";
}

/**
 * Check if text should be displayed in columns
 */
function shouldUseColumns(text: string, textType: string): boolean {
  // Only newspaper and article types benefit from columns
  if (textType !== "newspaper" && textType !== "article") {
    return false;
  }
  
  // Check text length (columns work best for medium to long texts)
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 200 || wordCount > 1000) {
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
  const lines = text.split("\n");
  
  switch (textType) {
    case "instruction":
      html = formatInstructionText(lines);
      break;
    case "list":
      html = formatListText(lines);
      break;
    case "newspaper":
    case "article":
      html = formatArticleText(lines, hasColumns);
      break;
    default:
      html = formatPlainText(lines);
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
function formatInstructionText(lines: string[]): string {
  let html = '<div class="formatted-text instruction-text">';
  let inList = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const numberedPattern = /^(\d+[\.\)])\s*(.+)$/;
    const match = trimmed.match(numberedPattern);
    
    if (match) {
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
      // Check if it's a heading (short line, possibly all caps or bold indicators)
      if (trimmed.length < 50 && (trimmed === trimmed.toUpperCase() || trimmed.endsWith(":"))) {
        html += `<h3 class="section-heading">${escapeHtml(trimmed)}</h3>`;
      } else {
        html += `<p>${escapeHtml(trimmed)}</p>`;
      }
    }
  }
  
  if (inList) {
    html += '</ol>';
  }
  
  html += '</div>';
  return html;
}

/**
 * Format list-style text (bullet points)
 */
function formatListText(lines: string[]): string {
  let html = '<div class="formatted-text list-text">';
  let inList = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const bulletPattern = /^[•\-\*]\s*(.+)$/;
    const match = trimmed.match(bulletPattern);
    
    if (match) {
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
      if (trimmed.length < 50 && (trimmed === trimmed.toUpperCase() || trimmed.endsWith(":"))) {
        html += `<h3 class="section-heading">${escapeHtml(trimmed)}</h3>`;
      } else {
        html += `<p>${escapeHtml(trimmed)}</p>`;
      }
    }
  }
  
  if (inList) {
    html += '</ul>';
  }
  
  html += '</div>';
  return html;
}

/**
 * Format article/newspaper style text
 */
function formatArticleText(lines: string[], hasColumns: boolean): string {
  const className = hasColumns ? "formatted-text article-text columns-layout" : "formatted-text article-text";
  let html = `<div class="${className}">`;
  
  let currentParagraph = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      // Empty line = end of paragraph
      if (currentParagraph) {
        // Check if it's a heading
        if (currentParagraph.length < 50 && (currentParagraph === currentParagraph.toUpperCase() || currentParagraph.endsWith(":"))) {
          html += `<h3 class="section-heading">${escapeHtml(currentParagraph)}</h3>`;
        } else {
          html += `<p>${escapeHtml(currentParagraph)}</p>`;
        }
        currentParagraph = "";
      }
    } else {
      // Add to current paragraph
      if (currentParagraph) {
        currentParagraph += " " + trimmed;
      } else {
        currentParagraph = trimmed;
      }
    }
  }
  
  // Don't forget the last paragraph
  if (currentParagraph) {
    if (currentParagraph.length < 50 && (currentParagraph === currentParagraph.toUpperCase() || currentParagraph.endsWith(":"))) {
      html += `<h3 class="section-heading">${escapeHtml(currentParagraph)}</h3>`;
    } else {
      html += `<p>${escapeHtml(currentParagraph)}</p>`;
    }
  }
  
  html += '</div>';
  return html;
}

/**
 * Format plain text
 */
function formatPlainText(lines: string[]): string {
  let html = '<div class="formatted-text plain-text">';
  
  let currentParagraph = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      if (currentParagraph) {
        html += `<p>${escapeHtml(currentParagraph)}</p>`;
        currentParagraph = "";
      }
    } else {
      if (currentParagraph) {
        currentParagraph += " " + trimmed;
      } else {
        currentParagraph = trimmed;
      }
    }
  }
  
  if (currentParagraph) {
    html += `<p>${escapeHtml(currentParagraph)}</p>`;
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
      line-height: 1.6;
      color: #333;
    }
    
    .formatted-text p {
      margin-bottom: 1em;
      text-align: justify;
    }
    
    .formatted-text .section-heading {
      font-weight: bold;
      font-size: 1.2em;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: #2c3e50;
    }
    
    /* Columns layout for newspaper/article style */
    .formatted-text.columns-layout {
      column-count: 2;
      column-gap: 40px;
      column-rule: 1px solid #ddd;
    }
    
    /* Instruction list styling */
    .formatted-text .instruction-list {
      list-style-type: decimal;
      padding-left: 2em;
      margin: 1em 0;
    }
    
    .formatted-text .instruction-list li {
      margin-bottom: 0.5em;
    }
    
    /* Bullet list styling */
    .formatted-text .bullet-list {
      list-style-type: disc;
      padding-left: 2em;
      margin: 1em 0;
    }
    
    .formatted-text .bullet-list li {
      margin-bottom: 0.5em;
    }
    
    /* Responsive: disable columns on small screens */
    @media (max-width: 768px) {
      .formatted-text.columns-layout {
        column-count: 1;
      }
    }
  `;
}
