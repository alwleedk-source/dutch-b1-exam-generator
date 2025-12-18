/**
 * Import Script: Plantenoppas Exam
 * Inserts text, vocabulary, and links them together
 * 
 * Run with: DATABASE_URL="postgres://..." tsx scripts/import_plantenoppas.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { texts, vocabulary, textVocabulary } from '../drizzle/schema';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:XM3owiG3l2zxMKkynlhDAFwGHjA3tDmmTlhi8F3IztP3Fym4gKR0MVx5yGpnuDxS@91.98.165.4:5432/postgres';

const client = postgres(DATABASE_URL);
const db = drizzle(client);

// Text data
const textData = {
    title: "Plantenoppas tijdens vakantie",
    dutch_text: `Op vakantie? Vergeet de planten niet!

Gaat u binnenkort op vakantie? En heeft u veel planten in huis? Dan is het verstandig om op tijd te bedenken wie er voor uw planten gaat zorgen. U kunt natuurlijk de buren vragen, of familie. Maar wat als zij ook op vakantie zijn?

Een goede oplossing is de 'plantenoppas'. Dit is iemand die bij u thuis komt om de planten water te geven. U kunt een plantenoppas vinden via internet of via een advertentie in de krant. Vaak zijn het studenten of ouderen die dit werk doen om wat extra geld te verdienen.

Het is belangrijk om van tevoren duidelijke afspraken te maken. Hoe vaak moet de oppas komen? Hoeveel water hebben de planten nodig? En wat te doen bij problemen, zoals een plant die ziek wordt? Zorg er ook voor dat de oppas weet waar alles staat, zoals de gieter en de plantenvoeding.

Naast het water geven, kan de plantenoppas ook andere taken uitvoeren. Denk bijvoorbeeld aan het post uit de brievenbus halen of de gordijnen open en dicht doen. Dit geeft een bewoonde indruk en verkleint de kans op inbraak.

De kosten voor een plantenoppas variëren. Meestal betaalt u een bedrag per bezoek, of een vast bedrag voor de hele vakantieperiode. Het is verstandig om van tevoren een prijs af te spreken.

Dus, gaat u op vakantie? Zorg dan goed voor uw planten en regel op tijd een oppas. Zo kunt u met een gerust hart genieten van uw welverdiende rust!`,
    formatted_html: `<h1>Plantenoppas tijdens vakantie</h1>
<p><strong>Op vakantie? Vergeet de planten niet!</strong></p>
<p>Gaat u binnenkort op vakantie? En heeft u veel planten in huis? Dan is het verstandig om op tijd te bedenken wie er voor uw planten gaat zorgen. U kunt natuurlijk de buren vragen, of familie. Maar wat als zij ook op vakantie zijn?</p>
<h2>De plantenoppas</h2>
<p>Een goede oplossing is de 'plantenoppas'. Dit is iemand die bij u thuis komt om de planten water te geven. U kunt een plantenoppas vinden via internet of via een advertentie in de krant. Vaak zijn het studenten of ouderen die dit werk doen om wat extra geld te verdienen.</p>
<h2>Duidelijke afspraken</h2>
<p>Het is belangrijk om van tevoren duidelijke afspraken te maken. Hoe vaak moet de oppas komen? Hoeveel water hebben de planten nodig? En wat te doen bij problemen, zoals een plant die ziek wordt? Zorg er ook voor dat de oppas weet waar alles staat, zoals de gieter en de plantenvoeding.</p>
<h2>Extra taken</h2>
<p>Naast het water geven, kan de plantenoppas ook andere taken uitvoeren. Denk bijvoorbeeld aan het post uit de brievenbus halen of de gordijnen open en dicht doen. Dit geeft een bewoonde indruk en verkleint de kans op inbraak.</p>
<h2>Kosten</h2>
<p>De kosten voor een plantenoppas variëren. Meestal betaalt u een bedrag per bezoek, of een vast bedrag voor de hele vakantieperiode. Het is verstandig om van tevoren een prijs af te spreken.</p>
<p>Dus, gaat u op vakantie? Zorg dan goed voor uw planten en regel op tijd een oppas. Zo kunt u met een gerust hart genieten van uw welverdiende rust!</p>`,
    word_count: 250,
    estimated_reading_minutes: 3,
    is_valid_dutch: true,
    is_b1_level: true,
    detected_level: 'B1',
    level_confidence: 95,
    status: 'approved',
    created_by: 1,
    source: 'import',
};

// Vocabulary data
const vocabularyData = [
    { dutch: "verstandig", context: "decision-making", arabic: "حكيم / عاقل", english: "wise, sensible", turkish: "akıllıca", dutch_definition: "slim, wijs, met gezond verstand", example: "Dan is het verstandig om op tijd te bedenken wie er voor uw planten gaat zorgen.", difficulty: "medium", word_type: "adjective" },
    { dutch: "plantenoppas", context: "plant care", arabic: "جليس النباتات", english: "plant sitter", turkish: "bitki bakıcısı", dutch_definition: "iemand die voor je planten zorgt als je weg bent", example: "Een goede oplossing is de 'plantenoppas'.", difficulty: "easy", word_type: "noun" },
    { dutch: "advertentie", context: "media", arabic: "إعلان", english: "advertisement", turkish: "ilan", dutch_definition: "een bericht om iets te verkopen of te zoeken", example: "U kunt een plantenoppas vinden via internet of via een advertentie in de krant.", difficulty: "easy", word_type: "noun" },
    { dutch: "van tevoren", context: "time", arabic: "مسبقاً", english: "in advance, beforehand", turkish: "önceden", dutch_definition: "eerder, vooraf", example: "Het is belangrijk om van tevoren duidelijke afspraken te maken.", difficulty: "medium", word_type: "adverb" },
    { dutch: "afspraken", context: "agreement", arabic: "اتفاقات / مواعيد", english: "agreements, appointments", turkish: "anlaşmalar", dutch_definition: "dingen die je samen afspreekt", example: "Het is belangrijk om van tevoren duidelijke afspraken te maken.", difficulty: "easy", word_type: "noun" },
    { dutch: "gieter", context: "gardening", arabic: "إبريق الري", english: "watering can", turkish: "sulama kabı", dutch_definition: "een kan om planten water te geven", example: "Zorg er ook voor dat de oppas weet waar alles staat, zoals de gieter en de plantenvoeding.", difficulty: "medium", word_type: "noun" },
    { dutch: "plantenvoeding", context: "gardening", arabic: "سماد النباتات", english: "plant food, fertilizer", turkish: "bitki gübresi", dutch_definition: "voedingsstoffen voor planten", example: "Zorg er ook voor dat de oppas weet waar alles staat, zoals de gieter en de plantenvoeding.", difficulty: "medium", word_type: "noun" },
    { dutch: "brievenbus", context: "mail", arabic: "صندوق البريد", english: "mailbox", turkish: "posta kutusu", dutch_definition: "een bus waar de post in komt", example: "Denk bijvoorbeeld aan het post uit de brievenbus halen.", difficulty: "easy", word_type: "noun" },
    { dutch: "gordijnen", context: "home", arabic: "ستائر", english: "curtains", turkish: "perdeler", dutch_definition: "stof voor de ramen", example: "de gordijnen open en dicht doen", difficulty: "easy", word_type: "noun" },
    { dutch: "bewoonde indruk", context: "security", arabic: "انطباع بأن البيت مسكون", english: "lived-in impression", turkish: "yaşanıyor izlenimi", dutch_definition: "het lijkt alsof er iemand woont", example: "Dit geeft een bewoonde indruk en verkleint de kans op inbraak.", difficulty: "hard", word_type: "noun" },
    { dutch: "verkleint", context: "reduction", arabic: "يقلل", english: "reduces, decreases", turkish: "azaltır", dutch_definition: "kleiner maken", example: "Dit geeft een bewoonde indruk en verkleint de kans op inbraak.", difficulty: "medium", word_type: "verb" },
    { dutch: "inbraak", context: "security", arabic: "سرقة / اقتحام", english: "burglary, break-in", turkish: "hırsızlık", dutch_definition: "als iemand illegaal je huis binnengaat om te stelen", example: "verkleint de kans op inbraak", difficulty: "medium", word_type: "noun" },
    { dutch: "variëren", context: "variation", arabic: "تتفاوت / تختلف", english: "vary", turkish: "değişmek", dutch_definition: "verschillen, niet altijd hetzelfde zijn", example: "De kosten voor een plantenoppas variëren.", difficulty: "medium", word_type: "verb" },
    { dutch: "vakantieperiode", context: "time", arabic: "فترة الإجازة", english: "holiday period", turkish: "tatil dönemi", dutch_definition: "de tijd dat je op vakantie bent", example: "een vast bedrag voor de hele vakantieperiode", difficulty: "easy", word_type: "noun" },
    { dutch: "met een gerust hart", context: "emotions", arabic: "بقلب مطمئن", english: "with peace of mind", turkish: "gönül rahatlığıyla", dutch_definition: "zonder zorgen, rustig", example: "Zo kunt u met een gerust hart genieten van uw welverdiende rust!", difficulty: "hard", word_type: "other" },
    { dutch: "welverdiende", context: "reward", arabic: "المستحق", english: "well-deserved", turkish: "hak edilmiş", dutch_definition: "wat je verdient na hard werken", example: "Zo kunt u met een gerust hart genieten van uw welverdiende rust!", difficulty: "hard", word_type: "adjective" },
];

// Questions data (for reference - stored in exams table when user starts exam)
const questions = [
    {
        question: "Wat is het doel van deze tekst?",
        options: [
            "Informeren over het verzorgen van planten tijdens de vakantie.",
            "Waarschuwen voor de gevaren van inbraak tijdens de vakantie.",
            "Reclame maken voor een specifiek plantenoppasbedrijf.",
            "Uitleggen hoe je zelf een plantenoppas kunt worden."
        ],
        correctAnswerIndex: 0,
        skillType: "hoofdgedachte",
        difficulty: "easy",
        explanation: "De tekst geeft informatie over hoe je voor je planten kunt zorgen tijdens vakantie door een plantenoppas te regelen.",
        evidence: "Gaat u binnenkort op vakantie? En heeft u veel planten in huis? Dan is het verstandig om op tijd te bedenken wie er voor uw planten gaat zorgen.",
        distractorAnalysis: {
            optie0: "CORRECT: Dit is het hoofddoel van de tekst.",
            optie1: "DETAIL_VS_HOOFDIDEE: Inbraak wordt genoemd als bijkomend voordeel.",
            optie2: "SCHIJNBAAR_LOGISCH: De tekst maakt geen reclame voor een bedrijf.",
            optie3: "OMKERING: De tekst is voor wie een oppas ZOEKT, niet wie oppas wil WORDEN."
        },
        cognitiveLevel: "begrip"
    },
    {
        question: "Wie kunnen er als plantenoppas fungeren volgens de tekst?",
        options: [
            "Alleen professionele tuinmannen.",
            "Buren, familie, studenten of ouderen.",
            "Alleen mensen die je via internet vindt.",
            "Alleen mensen die reageren op een advertentie."
        ],
        correctAnswerIndex: 1,
        skillType: "zoeken",
        difficulty: "easy",
        explanation: "De tekst noemt buren, familie, studenten en ouderen als mogelijke plantenoppassen.",
        evidence: "U kunt natuurlijk de buren vragen, of familie. Vaak zijn het studenten of ouderen die dit werk doen.",
        distractorAnalysis: {
            optie0: "SCHIJNBAAR_LOGISCH: Tuinmannen zijn niet genoemd.",
            optie1: "CORRECT: De tekst noemt deze groepen.",
            optie2: "GEDEELTELIJKE_WAARHEID: Internet is één optie, niet de enige.",
            optie3: "GEDEELTELIJKE_WAARHEID: Advertentie is één optie, niet de enige."
        },
        cognitiveLevel: "herkenning"
    },
    {
        question: "Wat is een belangrijk punt om af te spreken met de plantenoppas?",
        options: [
            "Hoeveel de oppas per uur verdient.",
            "Welke planten het duurst zijn.",
            "Hoe vaak de oppas moet komen en hoeveel water de planten nodig hebben.",
            "Waar de sleutel van de achterdeur ligt."
        ],
        correctAnswerIndex: 2,
        skillType: "zoeken",
        difficulty: "medium",
        explanation: "De tekst noemt expliciet deze afspraken.",
        evidence: "Hoe vaak moet de oppas komen? Hoeveel water hebben de planten nodig?",
        distractorAnalysis: {
            optie0: "VERKEERDE_KOPPELING: 'Per uur' staat niet in de tekst.",
            optie1: "SCHIJNBAAR_LOGISCH: Dit wordt niet genoemd.",
            optie2: "CORRECT: Dit staat letterlijk in de tekst.",
            optie3: "SCHIJNBAAR_LOGISCH: Sleutels worden niet genoemd."
        },
        cognitiveLevel: "herkenning"
    },
    {
        question: "Wat kan een plantenoppas nog meer doen behalve water geven?",
        options: [
            "De hond uitlaten en de kat eten geven.",
            "De post uit de brievenbus halen en de gordijnen bedienen.",
            "Het huis schoonmaken en de afwas doen.",
            "De tuin onderhouden en het gras maaien."
        ],
        correctAnswerIndex: 1,
        skillType: "zoeken",
        difficulty: "easy",
        explanation: "De tekst noemt post halen en gordijnen bedienen.",
        evidence: "het post uit de brievenbus halen of de gordijnen open en dicht doen",
        distractorAnalysis: {
            optie0: "SCHIJNBAAR_LOGISCH: Huisdieren worden niet genoemd.",
            optie1: "CORRECT: Dit staat letterlijk in de tekst.",
            optie2: "SCHIJNBAAR_LOGISCH: Schoonmaken wordt niet genoemd.",
            optie3: "VERKEERDE_KOPPELING: De tekst gaat over kamerplanten."
        },
        cognitiveLevel: "herkenning"
    },
    {
        question: "Hoe worden de kosten voor een plantenoppas meestal berekend?",
        options: [
            "Per uur dat de oppas aanwezig is.",
            "Een vast bedrag per plant.",
            "Een percentage van de vakantiekosten.",
            "Een bedrag per bezoek of een vast bedrag voor de hele periode."
        ],
        correctAnswerIndex: 3,
        skillType: "zoeken",
        difficulty: "easy",
        explanation: "De tekst beschrijft twee betalingsopties.",
        evidence: "Meestal betaalt u een bedrag per bezoek, of een vast bedrag voor de hele vakantieperiode.",
        distractorAnalysis: {
            optie0: "EEN_WOORD_VERSCHIL: 'Per uur' vs 'per bezoek'.",
            optie1: "SCHIJNBAAR_LOGISCH: Per plant wordt niet genoemd.",
            optie2: "SCHIJNBAAR_LOGISCH: Dit staat niet in de tekst.",
            optie3: "CORRECT: Dit staat letterlijk in de tekst."
        },
        cognitiveLevel: "herkenning"
    }
];

async function main() {
    console.log('🚀 Starting import...\n');

    try {
        // 1. Insert text
        console.log('📝 Inserting text...');
        const [insertedText] = await db.insert(texts).values({
            dutch_text: textData.dutch_text,
            title: textData.title,
            formatted_html: textData.formatted_html,
            word_count: textData.word_count,
            estimated_reading_minutes: textData.estimated_reading_minutes,
            is_valid_dutch: textData.is_valid_dutch,
            is_b1_level: textData.is_b1_level,
            detected_level: textData.detected_level,
            level_confidence: textData.level_confidence,
            status: textData.status,
            created_by: textData.created_by,
            source: textData.source,
        }).returning();

        console.log(`✅ Text inserted with ID: ${insertedText.id}`);
        const textId = insertedText.id;

        // 2. Insert vocabulary
        console.log('\n📚 Inserting vocabulary...');
        const insertedVocabIds: number[] = [];

        for (const vocab of vocabularyData) {
            const [insertedVocab] = await db.insert(vocabulary).values({
                dutchWord: vocab.dutch,
                context: vocab.context,
                dutchDefinition: vocab.dutch_definition,
                wordType: vocab.word_type,
                arabicTranslation: vocab.arabic,
                englishTranslation: vocab.english,
                turkishTranslation: vocab.turkish,
                exampleSentence: vocab.example,
                difficulty: vocab.difficulty,
                sourceTextId: textId,
            }).returning();

            insertedVocabIds.push(insertedVocab.id);
            console.log(`  ✓ ${vocab.dutch}`);
        }

        // 3. Link vocabulary to text
        console.log('\n🔗 Linking vocabulary to text...');
        for (const vocabId of insertedVocabIds) {
            await db.insert(textVocabulary).values({
                text_id: textId,
                vocabulary_id: vocabId,
            });
        }
        console.log(`  ✓ Linked ${insertedVocabIds.length} vocabulary items to text`);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('✅ IMPORT COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log(`📄 Text ID: ${textId}`);
        console.log(`📄 Title: ${textData.title}`);
        console.log(`📚 Vocabulary: ${insertedVocabIds.length} words`);
        console.log(`❓ Questions: ${questions.length} (generated on exam start)`);
        console.log('\n🎯 The text is now available in Public Exams!');
        console.log('   Questions will be generated when a user starts the exam.');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await client.end();
    }
}

main().catch(console.error);
