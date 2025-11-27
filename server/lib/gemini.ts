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

1. **PDF Headers/Footers VERWIJDEREN** (ZEER BELANGRIJK!):
   - Verwijder copyright notices (bijv. "© CvTE - Tekstboekje Lezen I - 2022 Openbaar examen")
   - Verwijder paginanummers (bijv. "Pagina 1 van 5", "1", "2", etc.)
   - Verwijder datums en tijdstempels (bijv. "2022", "01-01-2022")
   - Verwijder website URLs en email adressen in headers/footers
   - Verwijder herhalende tekst die op elke pagina voorkomt
   - Verwijder "Openbaar examen", "Staatsexamen", "Examen NT2" en soortgelijke exam-gerelateerde footers

2. **OCR-fouten** (als de tekst uit een afbeelding komt):
   - Vreemde tekens en symbolen (|, \\, £, *, +, <, >, {, }, [, ], ~, etc.)
   - Verkeerd herkende letters (bijv. "rn" → "m", "l" → "I")
   - Ontbrekende of extra spaties
   - Zinnen die door elkaar lopen

3. **Spelfouten en grammatica**:
   - Typfouten
   - Verkeerde werkwoordsvormen
   - Ontbrekende of verkeerde leestekens

4. **Opmaak en structuur**:
   - Paragrafen die beter gescheiden moeten worden
   - Zinnen die te lang of onduidelijk zijn
   - Ontbrekende hoofdletters

**Instructies:**
- Verwijder EERST alle PDF headers/footers (dit is de belangrijkste stap!)
- Corrigeer ALLE fouten die je vindt
- Verwijder ALLE vreemde symbolen en tekens
- Verbeter de leesbaarheid en structuur
- Behoud de originele betekenis en inhoud
- Behoud de paragraafstructuur (maar verbeter deze indien nodig)
- Zorg dat de tekst grammaticaal correct en professioneel is

**Originele tekst:**
${text}

**BELANGRIJK - Output Format (HTML ONLY!):**
- Gebruik ALLEEN HTML tags: <h1>, <h2>, <p>
- GEEN Markdown (##, **, etc.)
- Hoofdtitel: <h1>Titel</h1>
- Tussenkoppen: <h2>Tussenkop</h2>
- Paragrafen: <p>Tekst hier...</p>
- Voeg 3-6 tussenkoppen toe afhankelijk van de tekstlengte
- Zorg dat de tekst goed gestructureerd is met duidelijke secties

**Geef ALLEEN de gecorrigeerde tekst in PURE HTML formaat terug (met <h1>, <h2>, <p> tags), zonder uitleg of opmerkingen.**`,
      },
    ],
    temperature: 0.3, // Lower temperature for more accurate corrections
    maxOutputTokens: 8192, // Increased for large texts
    responseFormat: "text",
  });

  const cleanedText = response.trim();
  
  // Validate that the text was actually cleaned (check for common PDF footers)
  const pdfFooterPatterns = [
    /©\s*CvTE/i,
    /Tekstboekje\s+Lezen/i,
    /Openbaar\s+examen/i,
    /Staatsexamen/i,
    /Examen\s+NT2/i,
  ];
  
  const hasFooters = pdfFooterPatterns.some(pattern => pattern.test(cleanedText));
  
  if (hasFooters) {
    console.warn('[cleanAndFormatText] Warning: Text still contains PDF footers after cleaning');
    console.warn('[cleanAndFormatText] This may indicate the AI failed to clean properly');
  }
  
  // Validate HTML format
  if (!cleanedText.includes('<h1>') && !cleanedText.includes('<h2>') && !cleanedText.includes('<p>')) {
    console.warn('[cleanAndFormatText] Warning: Text does not contain HTML tags');
    console.warn('[cleanAndFormatText] AI may have returned Markdown or plain text instead');
  }
  
  return cleanedText;
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

=== OFFICIËLE NT2 LEZEN I - 5 KERNVAARDIGHEDEN ===

Elke vraag moet PRECIES één van deze 5 vaardigheden testen:

1. **HOOFDGEDACHTE (Main Idea)** - 15-20% van de vragen
   Wat het test: Begrip van het algemene doel, thema of hoofdboodschap
   Voorbeeldvragen:
   - "Wat is het doel van deze tekst?"
   - "Voor wie is deze tekst bedoeld?"
   - "Waar gaat de tekst over?"
   - "Wat is de hoofdgedachte?"
   Kenmerken:
   - Vereist begrip van de tekst als geheel
   - Niet over specifieke details
   - Test globaal begrip

2. **ZOEKEN (Search/Scanning)** - 30-35% van de vragen
   Wat het test: Vermogen om snel specifieke informatie te vinden
   Voorbeeldvragen:
   - "Hoeveel kost...?"
   - "Wanneer begint...?"
   - "Waar kun je meer informatie vinden?"
   - "Wat is het telefoonnummer van...?"
   - "Welke voorwaarde geldt?"
   Kenmerken:
   - Antwoord staat expliciet in de tekst
   - Vereist scannen op zoekwoorden
   - Test informatiezoekvaardigheden

3. **VOLGORDE (Sequence/Order)** - 10-15% van de vragen
   Wat het test: Begrip van de volgorde van stappen, gebeurtenissen of procedures
   Voorbeeldvragen:
   - "In welke volgorde moet je...?"
   - "Wat moet je eerst doen?"
   - "Wat gebeurt er na...?"
   - "Welke stap komt voor...?"
   Kenmerken:
   - Test logisch denken
   - Vaak in instructieteksten
   - Vereist begrip van procesverloop

4. **CONCLUSIE (Inference/Conclusion)** - 20-25% van de vragen
   Wat het test: Vermogen om conclusies te trekken en impliciete informatie te begrijpen
   Voorbeeldvragen:
   - "Wat kun je concluderen uit...?"
   - "Waarom is ... belangrijk?"
   - "Wat bedoelt de schrijver met...?"
   - "Wat is de reden dat...?"
   Kenmerken:
   - Antwoord niet direct vermeld
   - Vereist "tussen de regels lezen"
   - Test kritisch denken

5. **WOORDENSCHAT (Vocabulary in Context)** - 15-20% van de vragen
   Wat het test: Begrip van woordbetekenissen op basis van context
   Voorbeeldvragen:
   - "Wat betekent het woord '...' in deze context?"
   - "Welk woord heeft dezelfde betekenis als '...'?"
   - "Wat wordt bedoeld met '...'?"
   Kenmerken:
   - Test contextueel begrip
   - Niet over woordenboekdefinities
   - Vereist begrip van hoe woorden in zinnen functioneren

VERDELING VAN ${questionCount} VRAGEN:
- Als ${questionCount} = 4-5: 1 Hoofdgedachte, 2 Zoeken, 1 Volgorde/Conclusie, 1 Woordenschat
- Als ${questionCount} = 6-8: 1-2 Hoofdgedachte, 2-3 Zoeken, 1 Volgorde, 2 Conclusie, 1 Woordenschat
- Als ${questionCount} = 9-12: 2 Hoofdgedachte, 3-4 Zoeken, 1-2 Volgorde, 2-3 Conclusie, 2 Woordenschat
- Als ${questionCount} = 13-15: 2-3 Hoofdgedachte, 4-5 Zoeken, 2 Volgorde, 3-4 Conclusie, 2-3 Woordenschat

ZORG ERVOOR dat elke vraag EXACT één skillType heeft en volg de percentages!

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
      "skillType": "hoofdgedachte" | "zoeken" | "volgorde" | "conclusie" | "woordenschat",
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
export async function extractVocabulary(dutchText: string, maxWords?: number) {
  // Dynamic calculation: 15% of text length, min 25, max 75
  if (!maxWords) {
    const wordCount = dutchText.split(/\s+/).length;
    maxWords = Math.min(Math.max(Math.floor(wordCount * 0.15), 25), 75);
  }
  
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

=== TAAK 1: TEKST OPSCHONEN EN FORMATTEREN ===

**VERPLICHT: Voer ALTIJD de volgende stappen uit, zelfs als de tekst geen fouten bevat:**

**STAP 1: Verwijder ongewenste elementen**
- PDF/document metadata:
  * Copyright notices (bijv. "© CvTE", "© 2022", "All rights reserved")
  * Document references (bijv. "Tekstboekje Lezen I", "Openbaar examen")
  * Page numbers (bijv. "16", "Pagina 1")
  * Headers en footers die zich herhalen
  * Datum- en tijdstempels
  * Auteursinformatie die niet deel uitmaakt van de hoofdtekst
- Herhaalde teksten aan begin/einde van secties
- Losse cijfers of symbolen zonder context
- Navigatie-elementen (bijv. "Terug", "Volgende pagina")

**STAP 2: Converteer naar schone HTML**
- Gebruik <h1> voor de hoofdtitel van de tekst
- Gebruik <h2> voor belangrijke secties en subtitels (bijv. "## Contact")
- Gebruik <h3> voor subsecties indien nodig
- Gebruik <p> voor alle paragrafen
- Gebruik <strong> voor vetgedrukte tekst
- Gebruik <ul> en <li> voor opsommingen
- Gebruik <table>, <tr>, <td> voor tabellen
- VERWIJDER alle Markdown formatting (##, **, *, etc.)
- Zorg dat ALLE tekst in HTML tags zit (geen losse tekst)

**STAP 3: Corrigeer fouten**
- OCR-fouten:
  * Vreemde tekens en symbolen (|, \\, £, *, +, <, >, {, }, [, ], ~, etc.)
  * Verkeerd herkende letters (bijv. "rn" → "m", "l" → "I")
  * Ontbrekende of extra spaties
  * Zinnen die door elkaar lopen
- Spelfouten en grammatica:
  * Typfouten
  * Verkeerde werkwoordsvormen
  * Ontbrekende of verkeerde leestekens
- Structuur:
  * Paragrafen die beter gescheiden moeten worden
  * Zinnen die te lang of onduidelijk zijn
  * Ontbrekende hoofdletters

**BELANGRIJK:**
- Voer ALLE drie stappen ALTIJD uit
- Behoud de originele betekenis en inhoud
- Zorg dat de tekst grammaticaal correct en professioneel is
- De output moet ALTIJD proper HTML zijn, nooit plain text of Markdown

=== TAAK 2: TITEL GENEREREN ===

Genereer een korte, beschrijvende titel (max 60 karakters) die het hoofdonderwerp of thema van de tekst weergeeft.

=== TAAK 3: EXAMENVRAGEN MAKEN ===

Genereer ${questionCount} meerkeuzevragen op basis van de OPGESCHOONDE tekst (Staatsexamen NT2 Lezen I B1 stijl).

**NT2 LEZEN I - 5 KERNVAARDIGHEDEN:**

Elke vraag moet PRECIES één van deze 5 vaardigheden testen:

1. HOOFDGEDACHTE (15-20%): "Wat is het doel van de tekst?", "Voor wie is deze tekst?"
2. ZOEKEN (30-35%): "Hoeveel...?", "Wanneer...?", "Waar kun je informatie vinden?"
3. VOLGORDE (10-15%): "In welke volgorde...?", "Wat moet je eerst doen?"
4. CONCLUSIE (20-25%): "Wat kun je concluderen...?", "Waarom is ... belangrijk?"
5. WOORDENSCHAT (15-20%): "Wat betekent '...' in deze context?"

VERDELING VAN ${questionCount} VRAGEN:
- 4-5 vragen: 1 Hoofdgedachte, 2 Zoeken, 1 Volgorde/Conclusie, 1 Woordenschat
- 6-8 vragen: 1-2 Hoofdgedachte, 2-3 Zoeken, 1 Volgorde, 2 Conclusie, 1 Woordenschat
- 9-12 vragen: 2 Hoofdgedachte, 3-4 Zoeken, 1-2 Volgorde, 2-3 Conclusie, 2 Woordenschat
- 13-15 vragen: 2-3 Hoofdgedachte, 4-5 Zoeken, 2 Volgorde, 3-4 Conclusie, 2-3 Woordenschat

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
      "skillType": "hoofdgedachte" | "zoeken" | "volgorde" | "conclusie" | "woordenschat",
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
    maxOutputTokens: 16384, // Increased for large texts with full HTML formatting
    temperature: 0.7, // Balanced for quality
  });

  return JSON.parse(response);
}
