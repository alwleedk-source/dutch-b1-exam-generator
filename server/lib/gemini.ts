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
 * Clean, correct, and format any Dutch text using Gemini AI
 * Works for OCR text, pasted text, or manually typed text
 * Gemini analyzes the text and decides what needs to be fixed
 */
export async function cleanAndFormatText(text: string): Promise<string> {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Je bent een expert in het analyseren en corrigeren van Nederlandse teksten.

Taak: Lees de volgende Nederlandse tekst zorgvuldig en analyseer deze op:

1. **OCR-fouten** (als de tekst uit een afbeelding komt):
   - Vreemde tekens en symbolen (|, \\, £, *, +, <, >, {, }, [, ], ~, etc.)
   - Verkeerd herkende letters (bijv. "rn" → "m", "l" → "I")
   - Ontbrekende of extra spaties
   - Zinnen die door elkaar lopen

2. **Spelfouten en grammatica**:
   - Typfouten
   - Verkeerde werkwoordsvormen
   - Ontbrekende of verkeerde leestekens

3. **Opmaak en structuur**:
   - Paragrafen die beter gescheiden moeten worden
   - Zinnen die te lang of onduidelijk zijn
   - Ontbrekende hoofdletters

**Instructies:**
- Corrigeer ALLE fouten die je vindt
- Verwijder ALLE vreemde symbolen en tekens
- Verbeter de leesbaarheid en structuur
- Behoud de originele betekenis en inhoud
- Behoud de paragraafstructuur (maar verbeter deze indien nodig)
- Zorg dat de tekst grammaticaal correct en professioneel is
- Als de tekst al perfect is, geef deze dan ongewijzigd terug

**Originele tekst:**
${text}

**Geef ALLEEN de gecorrigeerde en opgemaakte tekst terug, zonder uitleg, opmerkingen of markdown formatting.**`,
      },
    ],
    temperature: 0.3, // Lower temperature for more accurate corrections
    maxOutputTokens: 4096,
    responseFormat: "text",
  });

  return response.trim();
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
 * Clean Dutch text by removing headers, footers, and unrelated content
 */
export async function cleanDutchText(text: string): Promise<string> {
  try {
    const response = await generateWithGemini({
      messages: [
        {
          role: "user",
          parts: `Je bent een expert in het analyseren en opschonen van Nederlandse teksten.

Analyseer de volgende tekst en verwijder:
1. Kopteksten (headers) zoals paginanummers, datums, website namen
2. Voetteksten (footers) zoals copyright, contact informatie
3. Navigatie elementen
4. Advertenties of niet-gerelateerde content
5. Metadata (auteur, publicatiedatum, etc. aan het begin of einde)

Behoud ALLEEN de hoofdinhoud van de tekst - de eigenlijke artikel, verhaal, of informatie.

Tekst:
${text}

Respond ALLEEN met de opgeschoonde tekst, zonder uitleg of markdown formatting.`,
        },
      ],
      responseFormat: "text",
      temperature: 0.3,
    });

    return response.trim();
  } catch (error) {
    console.error("[Gemini AI] Error cleaning text:", error);
    // Return original text if cleaning fails
    return text;
  }
}

/**
 * Generate exam questions from Dutch text (Staatsexamen NT2 style)
 */
export async function generateExamQuestions(dutchText: string, questionCount: number = 10) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Je bent een expert in het maken van Staatsexamen NT2 Lezen I (B1) vragen. Genereer ${questionCount} meerkeuzevragen op basis van de volgende Nederlandse tekst, volgens de officiële NT2 examennormen.

Tekst:
${dutchText}

=== OFFICIËLE NT2 EXAMENNORMEN ===

1. VRAAGTYPEN EN VERDELING (volg deze percentages nauwkeurig):
   - Directe detailvragen (60%): Informatie die expliciet in de tekst staat
     * "Hoeveel...?", "Wanneer...?", "Wat is de functie van...?"
     * "Waarover kun je meer informatie vinden?"
   - Inferentievragen (30%): Vereisen begrip en verbinding van informatie
     * "Waarom is het belangrijk dat...?"
     * "Wat kun je concluderen uit...?"
     * "Wat is het doel van...?"
   - Analytische vragen (10%): Vereisen kritisch denken
     * "Wat vindt [persoon] van...?"
     * "Wat is het verschil tussen...?"
     * "Welk argument wordt genoemd?"

2. VRAAGFORMULERING (gebruik officiële NT2 formuleringen):
   - "Wat is...?", "Waarom...?", "Hoeveel...?"
   - "Welke uitspraak klopt?"
   - "Wat wordt er gezegd over...?"
   - "Volgens de tekst..."
   - Vragen moeten helder en ondubbelzinnig zijn
   - Gebruik woorden uit de tekst zelf

3. ANTWOORDOPTIES (4 opties per vraag: A, B, C, D):
   - Eén correct antwoord: direct ondersteund door de tekst
   - Drie plausibele distractors:
     * Type 1: Gedeeltelijk correct maar onvolledig
     * Type 2: Bevat informatie uit de tekst maar beantwoordt verkeerde vraag
     * Type 3: Logisch maar niet vermeld in de tekst
   - Alle opties moeten vergelijkbare lengte hebben
   - Geen overduidelijk foute opties
   - Geen patronen (bijv. altijd C correct)

4. MOEILIJKHEIDSGRAAD:
   - Gemakkelijk (60%): Antwoord staat duidelijk in de tekst
   - Middel (30%): Vereist begrip en verbinding van informatie
   - Moeilijk (10%): Vereist kritisch denken en analyse

5. TEKSTDEKKING:
   - Verdeel vragen gelijkmatig over de hele tekst
   - Elke sectie/paragraaf moet getest worden
   - Geen twee vragen over exact dezelfde informatie

6. B1 NIVEAU:
   - Gebruik vocabulaire passend bij B1
   - Geen te complexe zinnen
   - Bekende onderwerpen (werk, onderwijs, dagelijks leven)

7. OUTPUT FORMAAT:
Respond in JSON format:
{
  "questions": [
    {
      "question": "Vraag tekst in het Nederlands",
      "options": ["Optie A", "Optie B", "Optie C", "Optie D"],
      "correctAnswerIndex": 0,
      "questionType": "detail" | "inference" | "analytical",
      "difficulty": "easy" | "medium" | "hard",
      "explanation": "Waarom dit het correcte antwoord is",
      "evidence": "De exacte zin uit de tekst die het antwoord bewijst"
    }
  ]
}

ZORG ERVOOR:
- Vragen testen begrip van de hele tekst
- Elke vraag heeft PRECIES 4 opties
- Antwoorden zijn duidelijk correct of incorrect
- Volg de officiële NT2 Lezen I examennormen nauwkeurig`,
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
export async function extractVocabulary(dutchText: string, maxWords: number = 25) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Je bent een expert in Nederlands als tweede taal (NT2) op B1 niveau. Extraheer de ${maxWords} belangrijkste en MOEILIJKSTE woorden uit de volgende Nederlandse tekst voor studenten die zich voorbereiden op het Staatsexamen NT2 B1.

Tekst:
${dutchText}

=== BELANGRIJKE INSTRUCTIES ===

1. WOORDSELECTIE (PRIORITEIT OP MOEILIJKE WOORDEN):
   - Kies woorden die ESSENTIEEL en UITDAGEND zijn voor B1 studenten
   - Focus op B1-B2 niveau woorden (liever iets moeilijker dan te makkelijk)
   - Geef HOOGSTE voorrang aan:
     * Moeilijke werkwoorden (vooral onregelmatige werkwoorden)
     * Abstracte zelfstandige naamwoorden
     * Bijvoeglijke naamwoorden die nuance toevoegen
     * Woorden die meerdere betekenissen hebben (context-afhankelijk)
     * Uitdrukkingen en idiomatische woorden
   - Geef TWEEDE voorrang aan:
     * Werkwoorden en zelfstandige naamwoorden die vaak voorkomen in Staatsexamen teksten
     * Woorden die cruciaal zijn voor tekstbegrip
   - VERMIJD ABSOLUUT:
     * Basiswoorden die A1/A2 studenten al kennen (zoals "de", "het", "is", "hebben", "zijn", "gaan")
     * Te makkelijke woorden (zoals "huis", "dag", "eten")
     * Zeer zeldzame of technische woorden
     * Eigennamen

2. CONTEXT EN VERTALINGEN:
   - Bepaal de CONTEXT van het woord in deze tekst (bijv. "financial", "furniture", "medical", "education")
   - Context moet kort en duidelijk zijn (1-2 woorden in het Engels)
   - Geef nauwkeurige vertalingen in Arabisch, Engels, Turks en Nederlands
   - Voor Nederlands: geef een korte definitie of synoniem
   - Vertalingen moeten passen bij de SPECIFIEKE context in deze tekst
   - Voorbeeld: "bank" in financiële context = "بنك", in meubelcontext = "مقعد"

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
      "context": "context_category",
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

/**
 * Process Dutch text completely in ONE API call - saves 80% tokens!
 * Combines: cleaning, title generation, questions, and vocabulary extraction
 */
export async function processTextComplete(dutchText: string, questionCount: number = 10, maxWords: number = 25) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Je bent een expert in Nederlands als tweede taal (NT2) en Staatsexamen NT2 B1 voorbereiding.

Voer de volgende taken uit op de gegeven Nederlandse tekst:

=== TAAK 1: TEKST OPSCHONEN EN CORRIGEREN ===

Analyseer de tekst op:
1. **OCR-fouten** (als de tekst uit een afbeelding komt):
   - Vreemde tekens en symbolen (|, \\, £, *, +, <, >, {, }, [, ], ~, etc.)
   - Verkeerd herkende letters (bijv. "rn" → "m", "l" → "I")
   - Ontbrekende of extra spaties
   - Zinnen die door elkaar lopen

2. **Spelfouten en grammatica**:
   - Typfouten
   - Verkeerde werkwoordsvormen
   - Ontbrekende of verkeerde leestekens

3. **Opmaak en structuur**:
   - Paragrafen die beter gescheiden moeten worden
   - Zinnen die te lang of onduidelijk zijn
   - Ontbrekende hoofdletters

**Instructies:**
- Corrigeer ALLE fouten die je vindt
- Verwijder ALLE vreemde symbolen en tekens
- Verbeter de leesbaarheid en structuur
- Behoud de originele betekenis en inhoud
- Behoud de paragraafstructuur (maar verbeter deze indien nodig)
- Zorg dat de tekst grammaticaal correct en professioneel is
- Als de tekst al perfect is, geef deze dan ongewijzigd terug

=== TAAK 2: TITEL GENEREREN ===

Genereer een korte, beschrijvende titel (max 60 karakters) die het hoofdonderwerp of thema van de tekst weergeeft.

=== TAAK 3: EXAMENVRAGEN MAKEN ===

Genereer ${questionCount} meerkeuzevragen op basis van de OPGESCHOONDE tekst (Staatsexamen NT2 Lezen I B1 stijl).

**VRAAGTYPEN EN VERDELING (volg officiële NT2 normen):**
- Directe detailvragen (60%): Informatie die expliciet in de tekst staat
  * "Hoeveel...?", "Wanneer...?", "Wat is de functie van...?"
  * "Waarover kun je meer informatie vinden?"
- Inferentievragen (30%): Vereisen begrip en verbinding van informatie
  * "Waarom is het belangrijk dat...?"
  * "Wat kun je concluderen uit...?"
  * "Wat is het doel van...?"
- Analytische vragen (10%): Vereisen kritisch denken
  * "Wat vindt [persoon] van...?"
  * "Wat is het verschil tussen...?"

**VRAAGFORMULERING (gebruik officiële NT2 formuleringen):**
- "Wat is...?", "Waarom...?", "Hoeveel...?"
- "Welke uitspraak klopt?"
- "Wat wordt er gezegd over...?"
- "Volgens de tekst..."
- Vragen moeten helder en ondubbelzinnig zijn
- Gebruik woorden uit de tekst zelf

**ANTWOORDOPTIES (ALTIJD 4 opties: A, B, C, D):**
- Eén correct antwoord: direct ondersteund door de tekst
- Drie plausibele distractors:
  * Type 1: Gedeeltelijk correct maar onvolledig
  * Type 2: Bevat informatie uit de tekst maar beantwoordt verkeerde vraag
  * Type 3: Logisch maar niet vermeld in de tekst
- Alle opties moeten vergelijkbare lengte hebben
- Geen overduidelijk foute opties

**MOEILIJKHEIDSGRAAD:**
- Gemakkelijk (60%): Antwoord staat duidelijk in de tekst
- Middel (30%): Vereist begrip en verbinding van informatie
- Moeilijk (10%): Vereist kritisch denken en analyse

**TEKSTDEKKING:**
- Verdeel vragen gelijkmatig over de hele tekst
- Test elke sectie/paragraaf
- Geen twee vragen over exact dezelfde informatie

=== TAAK 4: WOORDENSCHAT EXTRAHEREN ===

Extraheer de ${maxWords} belangrijkste en MOEILIJKSTE woorden uit de OPGESCHOONDE tekst voor B1 studenten.

**WOORDSELECTIE (PRIORITEIT OP MOEILIJKE WOORDEN):**
- Kies woorden die ESSENTIEEL en UITDAGEND zijn voor B1 studenten
- Focus op B1-B2 niveau woorden (liever iets moeilijker dan te makkelijk)
- Geef HOOGSTE voorrang aan:
  * Moeilijke werkwoorden (vooral onregelmatige werkwoorden)
  * Abstracte zelfstandige naamwoorden
  * Bijvoeglijke naamwoorden die nuance toevoegen
  * Woorden die meerdere betekenissen hebben (context-afhankelijk)
  * Uitdrukkingen en idiomatische woorden
- Geef TWEEDE voorrang aan:
  * Werkwoorden en zelfstandige naamwoorden die vaak voorkomen in Staatsexamen teksten
  * Woorden die cruciaal zijn voor tekstbegrip
- VERMIJD ABSOLUUT:
  * Basiswoorden die A1/A2 studenten al kennen (zoals "de", "het", "is", "hebben", "zijn", "gaan")
  * Te makkelijke woorden (zoals "huis", "dag", "eten")
  * Zeer zeldzame of technische woorden
  * Eigennamen

**CONTEXT EN VERTALINGEN:**
- Bepaal de CONTEXT van het woord in deze tekst (bijv. "financial", "furniture", "medical", "education")
- Context moet kort en duidelijk zijn (1-2 woorden in het Engels)
- Geef nauwkeurige vertalingen in Arabisch, Engels, Turks en Nederlands
- Voor Nederlands: geef een korte definitie of synoniem
- Vertalingen moeten passen bij de SPECIFIEKE context in deze tekst

**VOORBEELDZINNEN:**
- Gebruik de EXACTE zin uit de OPGESCHOONDE tekst waar het woord voorkomt
- Als de zin te lang is (>100 karakters), verkort hem dan maar behoud de context

**MOEILIJKHEIDSGRAAD:**
- easy: A2-B1 overgangswoorden
- medium: Typische B1 woorden
- hard: B1-B2 overgangswoorden

=== ORIGINELE TEKST ===

${dutchText}

=== OUTPUT FORMAAT ===

Respond in JSON format:
{
  "cleanedText": "De opgeschoonde en gecorrigeerde tekst",
  "title": "Korte titel (max 60 karakters)",
  "questions": [
    {
      "question": "Vraag tekst in het Nederlands",
      "options": ["...", "...", "..."],
      "correctAnswerIndex": 0,
      "questionType": "Main Idea" | "Scanning" | "Sequencing" | "Inference" | "Vocabulary",
      "difficulty": "easy" | "medium" | "hard",
      "explanation": "Waarom dit het correcte antwoord is (in het Nederlands)",
      "evidence": "De exacte zin of alinea uit de tekst die het correcte antwoord bewijst"
    }
  ],
  "vocabulary": [
    {
      "dutch": "woord",
      "context": "context_category",
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

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just the raw JSON object.`,
      },
    ],
    responseFormat: "json",
    maxOutputTokens: 8192, // Larger output for complete processing
    temperature: 0.7, // Balanced for quality
  });

  return JSON.parse(response);
}
