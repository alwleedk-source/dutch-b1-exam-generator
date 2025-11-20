import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("[Gemini AI] GEMINI_API_KEY not found in environment variables");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface GeminiMessage {
  role: "user" | "model";
  parts: string;
}

export interface GeminiGenerateOptions {
  messages: GeminiMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  responseFormat?: "json" | "text";
}

/**
 * Generate content using Gemini AI
 */
export async function generateWithGemini(options: GeminiGenerateOptions): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini AI is not initialized. Please set GEMINI_API_KEY environment variable.");
  }

  try {
    // Use gemini-2.0-flash for fast responses
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 2048,
      },
    });

    // Build chat history
    const history = options.messages.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    }));

    // Get the last message (current prompt)
    const lastMessage = options.messages[options.messages.length - 1];

    // Start chat with history
    const chat = model.startChat({
      history,
    });

    // Add JSON format instruction if needed
    let prompt = lastMessage.parts;
    if (options.responseFormat === "json") {
      prompt += "\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just the raw JSON object.";
    }

    // Send message and get response
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    let text = response.text();

    // Clean up JSON response if needed
    if (options.responseFormat === "json") {
      // Remove markdown code blocks if present
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }

    return text;
  } catch (error) {
    console.error("[Gemini AI] Error generating content:", error);
    throw error;
  }
}

/**
 * Validate Dutch text and detect CEFR level
 */
export async function validateDutchText(text: string) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Analyze the following text and determine:
1. Is it in Dutch language? (yes/no)
2. What CEFR level is it? (A1, A2, B1, B2, C1, C2)
3. Confidence level for the CEFR assessment (0-100)

Text: ${text}

Respond in JSON format:
{
  "isDutch": true/false,
  "level": "B1",
  "confidence": 85
}`,
      },
    ],
    responseFormat: "json",
  });

  return JSON.parse(response);
}

/**
 * Translate Dutch text to multiple languages
 */
export async function translateText(dutchText: string) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Translate the following Dutch text to Arabic, English, and Turkish.

Dutch text: ${dutchText}

Respond in JSON format:
{
  "arabic": "...",
  "english": "...",
  "turkish": "..."
}`,
      },
    ],
    responseFormat: "json",
  });

  return JSON.parse(response);
}

/**
 * Generate exam questions from Dutch text (Staatsexamen NT2 style)
 */
export async function generateExamQuestions(dutchText: string, questionCount: number = 10) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Je bent een expert in het maken van Staatsexamen NT2 Lezen I (B1) vragen. Genereer ${questionCount} meerkeuzevragen op basis van de volgende Nederlandse tekst.

Tekst:
${dutchText}

=== BELANGRIJKE INSTRUCTIES ===

1. VRAAGTYPEN EN VERDELING:
   - Hoofdidee vragen (20%): "Wat is het doel van de tekst?", "Voor wie is deze tekst bedoeld?"
   - Scannen naar details (30%): "Waarover kun je meer informatie vinden?", "Hoeveel kost...?"
   - Volgorde/Sequencing (10%): "In welke volgorde moet je...?", "Wat moet je eerst doen?"
   - Inferentie/Conclusie (15%): "Wat kun je concluderen uit...?", "Waarom is ... belangrijk?"
   - Woordenschat in context (25%): "Wat betekent het woord '...' in deze context?"

2. VRAAGFORMULERING:
   - Gebruik typische Staatsexamen formuleringen zoals:
     * "volgens de tekst" (volgens de tekst)
     * "In welke volgorde..." (volgorde vragen)
     * "Waarover kun je..." (scannen vragen)
     * "Wat is het doel van..." (hoofdidee)
   - Vragen moeten ALTIJD in het Nederlands zijn
   - Vermijd vage of dubbelzinnige formuleringen

3. ANTWOORDOPTIES:
   - Elke vraag heeft PRECIES 3 opties (A, B, C) of 4 opties (A, B, C, D)
   - Gebruik realistische afleidingsopties (distractors) die:
     * Deels waar lijken maar niet volledig correct zijn
     * Informatie uit andere delen van de tekst bevatten
     * Logisch klinken maar niet het beste antwoord zijn
   - Het correcte antwoord moet ALTIJD direct of indirect in de tekst te vinden zijn

4. MOEILIJKHEIDSGRAAD:
   - Mix van gemakkelijke (40%), middel (40%) en moeilijke (20%) vragen
   - Moeilijke vragen vereisen:
     * Het combineren van informatie uit verschillende paragrafen
     * Het lezen tussen de regels
     * Het begrijpen van impliciete betekenissen

5. OUTPUT FORMAAT:
Respond in JSON format:
{
  "questions": [
    {
      "question": "Vraag tekst in het Nederlands",
      "options": ["...", "...", "..."],
      "correctAnswerIndex": 0,
      "questionType": "Main Idea" | "Scanning" | "Sequencing" | "Inference" | "Vocabulary",
      "difficulty": "easy" | "medium" | "hard",
      "explanation": "Waarom dit het correcte antwoord is (in het Nederlands)"
    }
  ]
}

Zorg ervoor dat de vragen de tekst grondig testen en dat studenten de hele tekst moeten lezen om alle vragen correct te beantwoorden.`,
      },
    ],
    responseFormat: "json",
    maxOutputTokens: 4096,
    temperature: 0.8,
  });

  return JSON.parse(response);
}

/**
 * Extract vocabulary from Dutch text (B1 level important words)
 */
export async function extractVocabulary(dutchText: string, maxWords: number = 20) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Je bent een expert in Nederlands als tweede taal (NT2) op B1 niveau. Extraheer de ${maxWords} belangrijkste en meest nuttige woorden uit de volgende Nederlandse tekst voor studenten die zich voorbereiden op het Staatsexamen NT2 B1.

Tekst:
${dutchText}

=== BELANGRIJKE INSTRUCTIES ===

1. WOORDSELECTIE:
   - Kies woorden die ESSENTIEEL zijn voor het begrijpen van de tekst
   - Focus op B1-niveau woorden (niet te makkelijk, niet te moeilijk)
   - Geef voorrang aan:
     * Werkwoorden en zelfstandige naamwoorden
     * Woorden die vaak voorkomen in Staatsexamen teksten
     * Woorden die meerdere betekenissen kunnen hebben
   - Vermijd:
     * Basiswoorden die A1/A2 studenten al kennen (zoals "de", "het", "is")
     * Zeer zeldzame of technische woorden
     * Eigennamen

2. VERTALINGEN:
   - Geef nauwkeurige vertalingen in Arabisch, Engels, Turks en Nederlands
   - Voor Nederlands: geef een korte definitie of synoniem
   - Vertalingen moeten passen bij de context in de tekst

3. VOORBEELDZINNEN:
   - Gebruik de EXACTE zin uit de tekst waar het woord voorkomt
   - Als de zin te lang is (>100 karakters), verkort hem dan maar behoud de context

4. MOEILIJKHEIDSGRAAD:
   - easy: A2-B1 overgangswoorden
   - medium: Typische B1 woorden
   - hard: B1-B2 overgangswoorden

5. OUTPUT FORMAAT:
Respond in JSON format:
{
  "vocabulary": [
    {
      "dutch": "woord",
      "arabic": "الترجمة",
      "english": "translation",
      "turkish": "çeviri",
      "dutch_definition": "Nederlandse definitie of synoniem",
      "example": "Exacte zin uit de tekst",
      "difficulty": "easy" | "medium" | "hard",
      "word_type": "noun" | "verb" | "adjective" | "adverb" | "other"
    }
  ]
}

Zorg ervoor dat de geselecteerde woorden studenten echt helpen om de tekst beter te begrijpen en hun woordenschat uit te breiden.`,
      },
    ],
    responseFormat: "json",
    maxOutputTokens: 4096,
    temperature: 0.7,
  });

  return JSON.parse(response);
}

/**
 * Generate a title for Dutch text
 */
export async function generateTitle(dutchText: string): Promise<string> {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Generate a short, descriptive title (max 60 characters) for the following Dutch text. The title should be in Dutch and capture the main topic or theme.

Text: ${dutchText.substring(0, 500)}...

Respond with ONLY the title text, no quotes, no extra formatting.`,
      },
    ],
    responseFormat: "text",
    maxOutputTokens: 50,
  });

  // Clean up the response
  return response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
}
