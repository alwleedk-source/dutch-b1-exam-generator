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
    // Use gemini-1.5-flash for fast responses
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
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
 * Generate exam questions from Dutch text
 */
export async function generateExamQuestions(dutchText: string) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Based on the following Dutch B1 text, generate 10 multiple-choice reading comprehension questions.

Text: ${dutchText}

Requirements:
- 10 questions total
- Each question has 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should test reading comprehension at B1 level
- Mix of question types: main idea, details, inference, vocabulary

Respond in JSON format:
{
  "questions": [
    {
      "question": "Question text in Dutch",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    }
  ]
}`,
      },
    ],
    responseFormat: "json",
    maxOutputTokens: 4096,
  });

  return JSON.parse(response);
}

/**
 * Extract vocabulary from Dutch text
 */
export async function extractVocabulary(dutchText: string) {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Extract 10-15 important B1-level Dutch words from this text that would be useful for language learners.

Text: ${dutchText}

For each word, provide:
- The Dutch word
- Arabic translation
- English translation
- Turkish translation
- An example sentence from the text
- Difficulty level (easy, medium, hard)

Respond in JSON format:
{
  "vocabulary": [
    {
      "dutch": "word",
      "arabic": "translation",
      "english": "translation",
      "turkish": "translation",
      "example": "sentence",
      "difficulty": "medium"
    }
  ]
}`,
      },
    ],
    responseFormat: "json",
    maxOutputTokens: 4096,
  });

  return JSON.parse(response);
}
