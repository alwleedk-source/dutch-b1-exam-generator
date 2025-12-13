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

      // Fix common JSON issues from AI responses
      // Remove trailing commas before ] or }
      text = text.replace(/,\s*]/g, ']');
      text = text.replace(/,\s*}/g, '}');
      // Fix empty values with trailing commas like ["value", ]
      text = text.replace(/,\s*,/g, ',');
    }

    return text;
  } catch (error) {
    console.error("[Gemini AI] Error generating content:", error);
    throw error;
  }
}

/**
 * Generate content using Gemini 2.5 Pro for high-quality reasoning tasks
 * Used specifically for exam question generation where deep reasoning is needed
 */
export async function generateWithGeminiPro(options: GeminiGenerateOptions): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini AI is not initialized. Please set GEMINI_API_KEY environment variable.");
  }

  try {
    // Use gemini-2.5-pro for high-quality reasoning (exam questions)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 8192,
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

      // Fix common JSON issues from AI responses
      text = text.replace(/,\s*]/g, ']');
      text = text.replace(/,\s*}/g, '}');
      text = text.replace(/,\s*,/g, ',');
    }

    return text;
  } catch (error) {
    console.error("[Gemini AI Pro] Error generating content:", error);
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
- GEEN code blocks (\`\`\`html of \`\`\`)
- Begin DIRECT met <h1> tag
- Hoofdtitel: <h1>Titel</h1>
- Tussenkoppen: <h2>Tussenkop</h2>
- Paragrafen: <p>Tekst hier...</p>
- Voeg 3-6 tussenkoppen toe afhankelijk van de tekstlengte
- Zorg dat de tekst goed gestructureerd is met duidelijke secties

**KRITISCH: Geef ALLEEN de HTML terug, ZONDER code blocks, ZONDER uitleg, ZONDER opmerkingen. Begin DIRECT met <h1>.**`,
      },
    ],
    temperature: 0.3, // Lower temperature for more accurate corrections
    maxOutputTokens: 8192, // Increased for large texts
    responseFormat: "text",
  });

  let cleanedText = response.trim();

  // Strip code blocks if AI added them despite instructions
  if (cleanedText.startsWith('```html')) {
    cleanedText = cleanedText.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
    console.log('[cleanAndFormatText] Stripped code block wrapper from response');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/i, '').replace(/```\s*$/, '').trim();
    console.log('[cleanAndFormatText] Stripped code block wrapper from response');
  }

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
 * Uses Gemini 2.5 Pro for high-quality reasoning and distractor generation
 * Based on analysis of official NT2 Staatsexamen Lezen I 2023
 * Enhanced with professional exam psychology from Cambridge/ETS research
 */
export async function generateExamQuestions(dutchText: string, questionCount: number = 10) {
  const response = await generateWithGeminiPro({
    messages: [
      {
        role: "user",
        parts: `# PROFESSIONELE EXAMENMAKER - STAATSEXAMEN NT2 LEZEN I (B1)

Je bent een senior examenontwikkelaar bij het CvTE (College voor Toetsen en Examens) met 15+ jaar ervaring. Je maakt ${questionCount} meerkeuzevragen die ONONDERSCHEIDBAAR zijn van echte Staatsexamen vragen.

## TEKST VOOR ANALYSE
${dutchText}

---

# DEEL 1: PSYCHOLOGIE VAN EXAMENONTWERP

## 1.1 HOE STUDENTEN FOUTEN MAKEN (Cognitieve Valkuilen)

Bij het ontwerpen van distractors, DENK als een student die:
- Snel leest en details over het hoofd ziet
- Woorden in context verkeerd interpreteert
- Aannames maakt die niet in de tekst staan
- Informatie van verschillende alinea's verkeerd combineert
- Hoofdidee verwart met ondersteunende details
- Negaties (niet/geen) over het hoofd ziet

## 1.2 DE GOUDEN REGEL VAN DISTRACTORS

Een PERFECTE distractor:
✓ Gebruikt woorden die LETTERLIJK in de tekst staan
✓ Is grammaticaal correct en past bij de vraag
✓ Klinkt logisch voor iemand die de tekst niet goed leest
✓ Benut een typische student-fout
✓ Verschilt slechts 1-2 cruciale elementen van het juiste antwoord

---

# DEEL 2: 15 PROFESSIONELE DISTRACTOR-TECHNIEKEN

Gebruik MINSTENS 3 verschillende technieken per vraag:

### CATEGORIE A: TEKSTUELE MANIPULATIE

1. **VERKEERDE ALINEA**
   Student leest antwoord in alinea 2, maar vraag gaat over alinea 4.
   → Gebruik correcte informatie uit de VERKEERDE tekstlocatie.

2. **OMKERING VAN BETEKENIS**
   Tekst: "De kosten worden NIET vergoed"
   → Distractor: "De kosten worden vergoed"

3. **GEDEELTELIJKE WAARHEID**
   Juiste antwoord: "€25 per maand inclusief verzekering"
   → Distractor: "€25 per maand" (mist cruciaal detail)

4. **VERKEERDE KOPPELING**
   Tekst noemt: (A) Jan werkt bij bank, (B) Prijs is €50
   → Distractor combineert: "Jan betaalde €50"

5. **TEMPORELE VERWARRING**
   Tekst: "Vroeger was het gratis, nu kost het €10"
   → Distractor: "Het is gratis" (verouderde informatie)

### CATEGORIE B: LOGISCHE VALKUILEN

6. **SCHIJNBAAR LOGISCHE CONCLUSIE**
   Iets dat LOGISCH lijkt maar NIET in de tekst staat.
   → Benut de neiging van studenten om te assumeren.

7. **TE BREED / TE SMAL**
   Vraag over "voordelen voor studenten"
   → Distractor te breed: "voordelen voor iedereen"
   → Distractor te smal: "voordelen voor eerstejaars studenten"

8. **OORZAAK-GEVOLG OMKERING**
   Tekst: "Door de regen bleef hij thuis"
   → Distractor: "Hij bleef thuis, dus het regende"

### CATEGORIE C: TAALKUNDIGE TRUCS

9. **ÉÉN WOORD VERSCHIL**
   "alleen bij Ameda" vs "ook bij Ameda"
   "moet" vs "mag"
   "alle" vs "sommige"

10. **SYNONIEM VERWARRING**
    Gebruik een woord dat LIJKT op een woord in de tekst.
    Tekst: "verhogen" → Distractor met: "verlagen"

11. **NEGATIE VERWARRING**
    Bij "Welke uitspraak klopt NIET?"
    → Alle opties behalve één zijn WEL waar volgens tekst.

### CATEGORIE D: INHOUDELIJKE MISLEIDING

12. **VERKEERDE ATTRIBUTIE**
    Tekst: "De gemeente besloot..."
    → Distractor: "De rijksoverheid besloot..."

13. **DETAIL VS HOOFDIDEE**
    Vraag over hoofdidee → Distractor is ondersteunend detail
    Vraag over detail → Distractor is te algemeen

14. **UITZONDERING ALS REGEL**
    Tekst: "In de meeste gevallen... behalve bij..."
    → Distractor presenteert de uitzondering als regel.

15. **IMPLICIETE VS EXPLICIETE INFORMATIE**
    Student moet informatie AFLEIDEN, niet letterlijk lezen.
    → Distractor is alleen juist als je oppervlakkig leest.

---

# DEEL 3: VRAAGTYPEN EN VOLGORDE

## 3.1 DE 5 VAARDIGHEDEN (skillType exact zo schrijven!)

| skillType | Percentage | Positie in examen |
|-----------|------------|-------------------|
| zoeken | 40% | Eerste helft |
| woordenschat | 20% | Verspreid |
| volgorde | 15% | Midden |
| conclusie | 15% | Tweede helft |
| hoofdgedachte | 10% | LAATSTE 2 vragen |

## 3.2 OFFICIËLE VRAAGFORMULERINGEN

### ZOEKEN (specifieke informatie vinden):
- "In welk onderdeel kun je lezen dat...?"
- "Wat is waar over [onderwerp]?"
- "Welke uitspraak klopt (niet)?"
- "Hoeveel/Wanneer/Waar...?"

### WOORDENSCHAT (betekenis in context):
- "Wat wordt bedoeld met '[woord]' in deze tekst?"
- "Wat betekent '[uitdrukking]' hier?"

### VOLGORDE (stappen/procedures):
- "Wat moet je eerst doen voordat je...?"
- "In welke volgorde...?"

### CONCLUSIE (impliciete informatie):
- "Wat kun je concluderen uit...?"
- "Waarom [gebeurt iets] volgens de tekst?"
- "Wat is de reden dat...?"

### HOOFDGEDACHTE (doel/thema):
- "Wat is het doel van deze tekst?"
- "Voor wie is deze tekst bedoeld?"
- "Wat wil de schrijver bereiken?"

---

# DEEL 4: MOEILIJKHEIDSGRADEN

## EASY (50% van vragen)
- Antwoord staat LETTERLIJK in één zin
- Geen interpretatie nodig
- Distractors: verkeerde alinea, temporele verwarring

## MEDIUM (35% van vragen)
- Moet 2-3 zinnen combineren
- Lichte parafrasering nodig
- Distractors: gedeeltelijke waarheid, verkeerde koppeling

## HARD (15% van vragen)
- Vereist INFERENTIE (conclusie trekken)
- Informatie staat impliciet in tekst
- Distractors: schijnbaar logische conclusie, te breed/te smal

---

# DEEL 5: KWALITEITSCONTROLE

Voor ELKE vraag, controleer:

□ Heeft elk antwoordoptie ongeveer dezelfde lengte?
□ Is er grammaticale consistentie tussen vraag en opties?
□ Bevat elke distractor een element uit de tekst?
□ Is het verschil tussen goed en fout subtiel (1-2 woorden)?
□ Zijn de opties wederzijds exclusief?
□ Is er PRECIES één correct antwoord?
□ Vermijd ik "alle" / "geen van bovenstaande"?
□ Is het correcte antwoord WILLEKEURIG verdeeld (niet altijd A)?

---

# DEEL 6: OUTPUT FORMAAT

Genereer EXACT ${questionCount} vragen in JSON:

{
  "questions": [
    {
      "question": "Vraag in het Nederlands",
      "options": ["A", "B", "C"] of ["A", "B", "C", "D"],
      "correctAnswerIndex": 0-3,
      "skillType": "zoeken|woordenschat|volgorde|conclusie|hoofdgedachte",
      "difficulty": "easy|medium|hard",
      "explanation": "Waarom het correcte antwoord juist is (citeer tekstbewijs)",
      "evidence": "Exacte zin(nen) uit de tekst",
      "distractorAnalysis": {
        "optie0": "Waarom fout: [techniek gebruikt + waarom student dit zou kiezen]",
        "optie1": "Waarom fout: [techniek gebruikt + waarom student dit zou kiezen]",
        "optie2": "Waarom correct / Waarom fout: [uitleg]"
      },
      "cognitiveLevel": "herkenning|begrip|toepassing|analyse"
    }
  ]
}

---

# DEEL 7: LAATSTE INSTRUCTIES

1. **DENK als een echte student** - Welke fouten zou een B1-student maken?
2. **GEEN obvious foute opties** - Elke optie moet verleidelijk zijn
3. **VARIEER technieken** - Niet steeds dezelfde distractor-strategie
4. **CITEER de tekst** - Evidence moet exact uit de tekst komen
5. **RANDOMISEER antwoorden** - Correct antwoord: ~25% A, ~25% B, ~25% C, ~25% D

Begin nu met het maken van ${questionCount} professionele examenvragen.`,
      },
    ],
    responseFormat: "json",
    maxOutputTokens: 16384,
    temperature: 0.75,
  });

  return JSON.parse(response);
}

/**
 * Extract vocabulary from Dutch text (B1 level important words)
 */
export async function extractVocabulary(dutchText: string, maxWords?: number) {
  // Dynamic calculation: 15% of text length, min 25, max 45 (reduced for cost optimization)
  if (!maxWords) {
    const wordCount = dutchText.split(/\s+/).length;
    maxWords = Math.min(Math.max(Math.floor(wordCount * 0.15), 25), 45);
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
    maxOutputTokens: 8192, // Increased for large texts with many vocabulary words (up to 75)
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

**NT2 LEZEN I - 5 KERNVAARDIGHEDEN (gebruik EXACT deze skillType waarden):**

Verdeel de ${questionCount} vragen WILLEKEURIG over deze types:
- hoofdgedachte: Doel, thema, doelgroep van de tekst
- zoeken: Specifieke informatie vinden
- volgorde: Stappen, procedures, tijdsvolgorde
- conclusie: Impliciete informatie, redenen, gevolgen
- woordenschat: Betekenis van woorden in context

**VOLGORDE VAN VRAGEN:**
- Vragen over "Wat is het doel van deze tekst?" of algemene conclusies: ALTIJD in de LAATSTE 3 vragen
- Andere vragen: willekeurige volgorde

**OFFICIËLE VRAAGFORMULERINGEN:**
- HOOFDGEDACHTE: "Wat is het doel van deze tekst?", "Voor wie is deze tekst bedoeld?"
- ZOEKEN: "In welk onderdeel kun je lezen...?", "Wat is waar over...?", "Hoeveel/Wanneer/Waar...?"
- VOLGORDE: "Wat moet je eerst doen voordat je...?", "In welke volgorde...?"
- CONCLUSIE: "Wat kun je concluderen uit...?", "Waarom [gebeurt iets] volgens de tekst?"
- WOORDENSCHAT: "Wat wordt bedoeld met '[woord]' in deze tekst?"

**10 TECHNIEKEN VOOR SLIMME DISTRACTORS (ZEER BELANGRIJK!):**

Elke foute optie moet een van deze technieken gebruiken:
1. INFORMATIE UIT VERKEERDE PLEK - correcte info die andere vraag beantwoordt
2. OMKERING VAN INFORMATIE - tegenovergestelde van wat tekst zegt
3. LOGISCHE MAAR NIET-GENOEMDE CONCLUSIE - lijkt logisch maar staat niet in tekst
4. GEDEELTELIJKE INFORMATIE - slechts deel van juiste antwoord
5. VERKEERDE KOPPELING - twee correcte feiten verkeerd gecombineerd
6. HISTORISCHE VS HUIDIGE INFO - info die vroeger gold maar nu niet
7. VERKEERDE ATTRIBUTIE - info aan verkeerde persoon toegeschreven
8. ÉÉN WOORD VERSCHIL - cruciaal woord veranderd
9. NEGATIE VERWARRING - bij NIET/GEEN vragen: opties die WEL in tekst staan
10. TE ALGEMEEN/SPECIFIEK - optie te breed of te nauw voor vraag

**REGELS:**
- Elke distractor MOET element bevatten dat in tekst staat
- Verschil tussen goed en fout: slechts 1-2 woorden
- 3 of 4 opties per vraag (varieer!)
- **WILLEKEURIGE VERDELING: Verdeel correcte antwoorden WILLEKEURIG over A, B, C, D**

**MOEILIJKHEIDSGRAAD:**
- easy (60%): Antwoord staat letterlijk in tekst
- medium (30%): Vereist verbinden van informatie
- hard (10%): Vereist inferentie en kritisch denken

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
      "options": ["...", "...", "...", "..."],
      "correctAnswerIndex": 1,
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
