/**
 * Trap Translations for Smart Error Analysis
 * 15 distractor techniques with translations in 4 languages
 */

export type TrapType =
    | 'VERKEERDE_ALINEA'
    | 'OMKERING'
    | 'GEDEELTELIJKE_WAARHEID'
    | 'VERKEERDE_KOPPELING'
    | 'TEMPORELE_VERWARRING'
    | 'SCHIJNBAAR_LOGISCH'
    | 'TE_BREED_TE_SMAL'
    | 'OORZAAK_GEVOLG'
    | 'EEN_WOORD_VERSCHIL'
    | 'SYNONIEM_VERWARRING'
    | 'NEGATIE_VERWARRING'
    | 'VERKEERDE_ATTRIBUTIE'
    | 'DETAIL_VS_HOOFDIDEE'
    | 'UITZONDERING_ALS_REGEL'
    | 'IMPLICIET_VS_EXPLICIET';

export type SupportedLanguage = 'ar' | 'en' | 'tr' | 'nl';

interface TrapInfo {
    name: Record<SupportedLanguage, string>;
    description: Record<SupportedLanguage, string>;
    tip: Record<SupportedLanguage, string>;
    icon: string;
}

export const trapTranslations: Record<TrapType, TrapInfo> = {
    VERKEERDE_ALINEA: {
        name: {
            ar: 'معلومة من الفقرة الخطأ',
            en: 'Information from wrong paragraph',
            tr: 'Yanlış paragraftan bilgi',
            nl: 'Informatie uit de verkeerde alinea',
        },
        description: {
            ar: 'هذه الإجابة تحتوي معلومة صحيحة من النص، لكنها من فقرة مختلفة عن التي يسأل عنها السؤال.',
            en: 'This answer contains correct information from the text, but from a different paragraph than the question asks about.',
            tr: 'Bu cevap metinden doğru bilgi içeriyor, ancak sorunun sorduğu paragraftan farklı bir paragraftan.',
            nl: 'Dit antwoord bevat correcte informatie uit de tekst, maar uit een andere alinea dan waar de vraag over gaat.',
        },
        tip: {
            ar: 'تأكد دائماً أن الإجابة تأتي من نفس الفقرة أو القسم المذكور في السؤال.',
            en: 'Always verify that the answer comes from the same paragraph or section mentioned in the question.',
            tr: 'Cevabın soruda belirtilen paragraf veya bölümden geldiğinden her zaman emin olun.',
            nl: 'Controleer altijd of het antwoord uit dezelfde alinea of sectie komt als waar de vraag naar verwijst.',
        },
        icon: '📄',
    },

    OMKERING: {
        name: {
            ar: 'عكس المعنى',
            en: 'Meaning reversal',
            tr: 'Anlam tersine çevirme',
            nl: 'Omkering van betekenis',
        },
        description: {
            ar: 'هذه الإجابة تعكس ما يقوله النص (مثال: النص يقول "الأكبر" والإجابة تقول "الأصغر").',
            en: 'This answer reverses what the text says (example: text says "largest", answer says "smallest").',
            tr: 'Bu cevap metnin söylediklerini tersine çeviriyor (örnek: metin "en büyük" diyor, cevap "en küçük").',
            nl: 'Dit antwoord is het tegenovergestelde van wat de tekst zegt (voorbeeld: tekst zegt "grootste", antwoord zegt "kleinste").',
        },
        tip: {
            ar: 'انتبه للكلمات المتضادة مثل: كبير/صغير، أكثر/أقل، قبل/بعد.',
            en: 'Watch out for opposite words like: big/small, more/less, before/after.',
            tr: 'Zıt kelimelere dikkat edin: büyük/küçük, çok/az, önce/sonra.',
            nl: 'Let op tegenstelde woorden zoals: groot/klein, meer/minder, voor/na.',
        },
        icon: '🔄',
    },

    GEDEELTELIJKE_WAARHEID: {
        name: {
            ar: 'حقيقة جزئية',
            en: 'Partial truth',
            tr: 'Kısmi doğru',
            nl: 'Gedeeltelijke waarheid',
        },
        description: {
            ar: 'هذه الإجابة صحيحة جزئياً لكنها تفتقد لمعلومة مهمة مذكورة في النص.',
            en: 'This answer is partially correct but missing an important detail mentioned in the text.',
            tr: 'Bu cevap kısmen doğru ancak metinde belirtilen önemli bir ayrıntıyı kaçırıyor.',
            nl: 'Dit antwoord is gedeeltelijk correct maar mist een belangrijk detail dat in de tekst staat.',
        },
        tip: {
            ar: 'ابحث عن الإجابة الأكثر اكتمالاً التي تتضمن جميع التفاصيل المذكورة.',
            en: 'Look for the most complete answer that includes all mentioned details.',
            tr: 'Belirtilen tüm ayrıntıları içeren en eksiksiz cevabı arayın.',
            nl: 'Zoek naar het meest complete antwoord dat alle genoemde details bevat.',
        },
        icon: '½',
    },

    VERKEERDE_KOPPELING: {
        name: {
            ar: 'ربط خاطئ',
            en: 'Wrong connection',
            tr: 'Yanlış bağlantı',
            nl: 'Verkeerde koppeling',
        },
        description: {
            ar: 'هذه الإجابة تجمع معلومتين صحيحتين من النص بطريقة خاطئة.',
            en: 'This answer combines two correct pieces of information from the text in a wrong way.',
            tr: 'Bu cevap metinden iki doğru bilgiyi yanlış bir şekilde birleştiriyor.',
            nl: 'Dit antwoord combineert twee correcte feiten uit de tekst op een verkeerde manier.',
        },
        tip: {
            ar: 'تحقق من أن العلاقة بين المعلومات في الإجابة تتطابق مع النص.',
            en: 'Verify that the relationship between information in the answer matches the text.',
            tr: 'Cevaptaki bilgiler arasındaki ilişkinin metinle eşleştiğini doğrulayın.',
            nl: 'Controleer of de relatie tussen de informatie in het antwoord overeenkomt met de tekst.',
        },
        icon: '🔗',
    },

    TEMPORELE_VERWARRING: {
        name: {
            ar: 'خلط زمني',
            en: 'Time confusion',
            tr: 'Zaman karışıklığı',
            nl: 'Temporele verwarring',
        },
        description: {
            ar: 'هذه الإجابة تستخدم معلومة كانت صحيحة في الماضي لكنها لم تعد صحيحة الآن.',
            en: 'This answer uses information that was true in the past but is no longer true now.',
            tr: 'Bu cevap geçmişte doğru olan ancak artık doğru olmayan bilgiyi kullanıyor.',
            nl: 'Dit antwoord gebruikt informatie die vroeger waar was maar nu niet meer.',
        },
        tip: {
            ar: 'انتبه لكلمات مثل: سابقاً، الآن، من قبل، حالياً.',
            en: 'Pay attention to words like: previously, now, before, currently.',
            tr: 'Şu kelimelere dikkat edin: eskiden, şimdi, önceden, şu anda.',
            nl: 'Let op woorden zoals: vroeger, nu, voorheen, tegenwoordig.',
        },
        icon: '⏰',
    },

    SCHIJNBAAR_LOGISCH: {
        name: {
            ar: 'استنتاج منطقي كاذب',
            en: 'Seemingly logical conclusion',
            tr: 'Görünüşte mantıklı sonuç',
            nl: 'Schijnbaar logische conclusie',
        },
        description: {
            ar: 'هذه الإجابة تبدو منطقية لكنها ليست مذكورة في النص.',
            en: 'This answer seems logical but is not stated in the text.',
            tr: 'Bu cevap mantıklı görünüyor ama metinde belirtilmiyor.',
            nl: 'Dit antwoord lijkt logisch maar staat niet in de tekst.',
        },
        tip: {
            ar: 'لا تفترض! ابحث عن دليل مباشر في النص.',
            en: "Don't assume! Look for direct evidence in the text.",
            tr: 'Varsaymayın! Metinde doğrudan kanıt arayın.',
            nl: 'Neem niets aan! Zoek naar direct bewijs in de tekst.',
        },
        icon: '🤔',
    },

    TE_BREED_TE_SMAL: {
        name: {
            ar: 'واسع أو ضيق جداً',
            en: 'Too broad or too narrow',
            tr: 'Çok geniş veya çok dar',
            nl: 'Te breed of te smal',
        },
        description: {
            ar: 'هذه الإجابة إما عامة جداً أو محددة جداً مقارنة بما يذكره النص.',
            en: 'This answer is either too general or too specific compared to what the text states.',
            tr: 'Bu cevap metnin söylediklerine kıyasla ya çok genel ya da çok spesifik.',
            nl: 'Dit antwoord is te algemeen of te specifiek vergeleken met wat de tekst zegt.',
        },
        tip: {
            ar: 'تأكد أن نطاق الإجابة يتطابق مع نطاق المعلومة في النص.',
            en: 'Make sure the scope of the answer matches the scope of information in the text.',
            tr: 'Cevabın kapsamının metindeki bilginin kapsamıyla eşleştiğinden emin olun.',
            nl: 'Zorg dat de reikwijdte van het antwoord overeenkomt met de reikwijdte van de informatie in de tekst.',
        },
        icon: '📏',
    },

    OORZAAK_GEVOLG: {
        name: {
            ar: 'عكس السبب والنتيجة',
            en: 'Cause-effect reversal',
            tr: 'Neden-sonuç tersine çevirme',
            nl: 'Oorzaak-gevolg omkering',
        },
        description: {
            ar: 'هذه الإجابة تعكس العلاقة بين السبب والنتيجة.',
            en: 'This answer reverses the cause and effect relationship.',
            tr: 'Bu cevap neden ve sonuç ilişkisini tersine çeviriyor.',
            nl: 'Dit antwoord verwisselt de oorzaak en het gevolg.',
        },
        tip: {
            ar: 'اسأل نفسك: ما الذي حدث أولاً؟ وماذا كانت النتيجة؟',
            en: 'Ask yourself: What happened first? What was the result?',
            tr: 'Kendinize sorun: Önce ne oldu? Sonuç ne oldu?',
            nl: 'Vraag jezelf af: Wat gebeurde eerst? Wat was het gevolg?',
        },
        icon: '↔️',
    },

    EEN_WOORD_VERSCHIL: {
        name: {
            ar: 'فرق كلمة واحدة',
            en: 'One word difference',
            tr: 'Bir kelime farkı',
            nl: 'Eén woord verschil',
        },
        description: {
            ar: 'هذه الإجابة تختلف عن الصحيحة بكلمة واحدة فقط تغير المعنى تماماً.',
            en: 'This answer differs from the correct one by just one word that completely changes the meaning.',
            tr: 'Bu cevap, anlamı tamamen değiştiren sadece bir kelimeyle doğru cevaptan farklıdır.',
            nl: 'Dit antwoord verschilt maar één woord van het juiste antwoord, maar dat woord verandert de betekenis volledig.',
        },
        tip: {
            ar: 'انتبه لكلمات مثل: فقط/أيضاً، يجب/يمكن، كل/بعض.',
            en: 'Watch for words like: only/also, must/may, all/some.',
            tr: 'Şu kelimelere dikkat edin: sadece/ayrıca, gerekir/olabilir, hepsi/bazıları.',
            nl: 'Let op woorden zoals: alleen/ook, moet/mag, alle/sommige.',
        },
        icon: '🔤',
    },

    SYNONIEM_VERWARRING: {
        name: {
            ar: 'خلط الكلمات المتشابهة',
            en: 'Similar word confusion',
            tr: 'Benzer kelime karışıklığı',
            nl: 'Synoniem verwarring',
        },
        description: {
            ar: 'هذه الإجابة تستخدم كلمة تشبه كلمة في النص لكن معناها مختلف.',
            en: 'This answer uses a word that looks like a word in the text but has a different meaning.',
            tr: 'Bu cevap metindeki bir kelimeye benzeyen ama farklı anlamı olan bir kelime kullanıyor.',
            nl: 'Dit antwoord gebruikt een woord dat lijkt op een woord in de tekst maar een andere betekenis heeft.',
        },
        tip: {
            ar: 'اقرأ بعناية ولا تعتمد على التشابه الظاهري للكلمات.',
            en: 'Read carefully and do not rely on visual similarity of words.',
            tr: 'Dikkatlice okuyun ve kelimelerin görsel benzerliğine güvenmeyin.',
            nl: 'Lees zorgvuldig en vertrouw niet op de visuele gelijkenis van woorden.',
        },
        icon: '👀',
    },

    NEGATIE_VERWARRING: {
        name: {
            ar: 'خلط النفي',
            en: 'Negation confusion',
            tr: 'Olumsuzluk karışıklığı',
            nl: 'Negatie verwarring',
        },
        description: {
            ar: 'في سؤال "أي عبارة غير صحيحة"، هذه الإجابة صحيحة فعلاً حسب النص.',
            en: 'In a "which statement is NOT correct" question, this answer is actually correct according to the text.',
            tr: '"Hangi ifade doğru DEĞİL" sorusunda, bu cevap aslında metne göre doğru.',
            nl: 'Bij een "welke uitspraak klopt NIET" vraag is dit antwoord eigenlijk wel correct volgens de tekst.',
        },
        tip: {
            ar: 'في أسئلة "غير صحيح" أو "لا"، ابحث عن الإجابة الخاطئة وليس الصحيحة.',
            en: 'In "NOT correct" questions, look for the wrong answer, not the right one.',
            tr: '"Doğru DEĞİL" sorularında, doğru değil yanlış cevabı arayın.',
            nl: 'Bij "niet correct" vragen moet je zoeken naar het foute antwoord, niet het juiste.',
        },
        icon: '❌',
    },

    VERKEERDE_ATTRIBUTIE: {
        name: {
            ar: 'نسب خاطئ',
            en: 'Wrong attribution',
            tr: 'Yanlış atıf',
            nl: 'Verkeerde attributie',
        },
        description: {
            ar: 'هذه الإجابة تنسب المعلومة للشخص أو الجهة الخطأ.',
            en: 'This answer attributes the information to the wrong person or entity.',
            tr: 'Bu cevap bilgiyi yanlış kişiye veya kuruma atfediyor.',
            nl: 'Dit antwoord schrijft de informatie toe aan de verkeerde persoon of instantie.',
        },
        tip: {
            ar: 'تأكد من هوية من قال أو فعل الشيء في النص.',
            en: 'Verify who said or did something in the text.',
            tr: 'Metinde bir şeyi kimin söylediğini veya yaptığını doğrulayın.',
            nl: 'Controleer wie iets zei of deed in de tekst.',
        },
        icon: '👤',
    },

    DETAIL_VS_HOOFDIDEE: {
        name: {
            ar: 'تفصيل بدل فكرة رئيسية',
            en: 'Detail instead of main idea',
            tr: 'Ana fikir yerine ayrıntı',
            nl: 'Detail vs hoofdidee',
        },
        description: {
            ar: 'هذه الإجابة تعطي تفصيلاً صغيراً بدلاً من الفكرة الرئيسية (أو العكس).',
            en: 'This answer gives a small detail instead of the main idea (or vice versa).',
            tr: 'Bu cevap ana fikir yerine küçük bir ayrıntı veriyor (veya tam tersi).',
            nl: 'Dit antwoord geeft een klein detail in plaats van het hoofdidee (of andersom).',
        },
        tip: {
            ar: 'في أسئلة "ما هو الهدف"، ابحث عن الصورة الكبيرة وليس التفاصيل.',
            en: 'In "what is the goal" questions, look for the big picture, not details.',
            tr: '"Amaç nedir" sorularında, ayrıntıları değil büyük resmi arayın.',
            nl: 'Bij "wat is het doel" vragen, zoek naar het grote plaatje, niet naar details.',
        },
        icon: '🔍',
    },

    UITZONDERING_ALS_REGEL: {
        name: {
            ar: 'الاستثناء كقاعدة',
            en: 'Exception as rule',
            tr: 'Kural olarak istisna',
            nl: 'Uitzondering als regel',
        },
        description: {
            ar: 'هذه الإجابة تقدم الاستثناء المذكور في النص كأنه القاعدة العامة.',
            en: 'This answer presents an exception mentioned in the text as if it were the general rule.',
            tr: 'Bu cevap metinde belirtilen bir istisnayı genel kural gibi sunuyor.',
            nl: 'Dit antwoord presenteert de uitzondering die in de tekst staat als de algemene regel.',
        },
        tip: {
            ar: 'انتبه لكلمات مثل: عادةً، إلا، باستثناء، في معظم الحالات.',
            en: 'Watch for words like: usually, except, unless, in most cases.',
            tr: 'Şu kelimelere dikkat edin: genellikle, hariç, -dıkça, çoğu durumda.',
            nl: 'Let op woorden zoals: meestal, behalve, tenzij, in de meeste gevallen.',
        },
        icon: '⚠️',
    },

    IMPLICIET_VS_EXPLICIET: {
        name: {
            ar: 'ضمني مقابل صريح',
            en: 'Implicit vs explicit',
            tr: 'Örtük vs açık',
            nl: 'Impliciet vs expliciet',
        },
        description: {
            ar: 'هذه الإجابة تتطلب استنتاجاً من النص وليست مذكورة صراحةً.',
            en: 'This answer requires inference from the text and is not explicitly stated.',
            tr: 'Bu cevap metinden çıkarım gerektiriyor ve açıkça belirtilmiyor.',
            nl: 'Dit antwoord vereist een conclusie uit de tekst en staat niet expliciet vermeld.',
        },
        tip: {
            ar: 'لأسئلة "ما تستطيع استنتاجه"، ابحث عن ما يُفهم ضمنياً وليس ما يُقال صراحةً.',
            en: 'For "what can you conclude" questions, look for what is implied, not stated.',
            tr: '"Ne sonuç çıkarabilirsiniz" sorularında, söyleneni değil ima edileni arayın.',
            nl: 'Bij "wat kun je concluderen" vragen, zoek naar wat bedoeld wordt, niet wat er staat.',
        },
        icon: '💭',
    },
};

/**
 * Get trap info in user's language
 */
export function getTrapInfo(trapType: TrapType, language: SupportedLanguage): {
    name: string;
    description: string;
    tip: string;
    icon: string;
} {
    const trap = trapTranslations[trapType];
    return {
        name: trap.name[language] || trap.name.en,
        description: trap.description[language] || trap.description.en,
        tip: trap.tip[language] || trap.tip.en,
        icon: trap.icon,
    };
}

/**
 * Get all trap names for a language (for tips modal)
 */
export function getAllTrapNames(language: SupportedLanguage): Array<{
    type: TrapType;
    name: string;
    icon: string;
}> {
    return Object.entries(trapTranslations).map(([type, info]) => ({
        type: type as TrapType,
        name: info.name[language] || info.name.en,
        icon: info.icon,
    }));
}

/**
 * Exam strategy tips for Tips modal
 */
export const examTips: Record<SupportedLanguage, string[]> = {
    ar: [
        '📖 اقرأ السؤال أولاً، ثم ابحث عن الإجابة في الفقرة المحددة.',
        '🔍 تأكد أن الإجابة من نفس الفقرة التي يسأل عنها السؤال.',
        '⚠️ انتبه لكلمات مثل: فقط، كل، لا، يجب - قد تغير المعنى تماماً.',
        '⏰ في أسئلة الوقت، تأكد أن المعلومة حالية وليست قديمة.',
        '❌ في أسئلة "غير صحيح"، ثلاث إجابات صحيحة وواحدة خاطئة.',
        '🎯 في أسئلة الهدف، ابحث عن الصورة الكبيرة وليس التفاصيل.',
        '💡 إذا كنت غير متأكد، احذف الإجابات الخاطئة واضحة أولاً.',
    ],
    en: [
        '📖 Read the question first, then search for the answer in the specified paragraph.',
        '🔍 Make sure the answer comes from the same paragraph the question asks about.',
        '⚠️ Watch for words like: only, all, no, must - they can completely change meaning.',
        '⏰ In time-related questions, verify the information is current, not outdated.',
        '❌ In "NOT correct" questions, three answers are correct and one is wrong.',
        '🎯 In goal questions, look for the big picture, not small details.',
        '💡 If unsure, eliminate obviously wrong answers first.',
    ],
    tr: [
        '📖 Önce soruyu okuyun, sonra belirtilen paragrafta cevabı arayın.',
        '🔍 Cevabın sorunun sorduğu paragraftan geldiğinden emin olun.',
        '⚠️ Şu kelimelere dikkat edin: sadece, hepsi, hayır, gerekir - anlamı tamamen değiştirebilir.',
        '⏰ Zamanla ilgili sorularda bilginin güncel olduğunu doğrulayın.',
        '❌ "Doğru DEĞİL" sorularında üç cevap doğru, biri yanlıştır.',
        '🎯 Amaç sorularında küçük ayrıntıları değil büyük resmi arayın.',
        '💡 Emin değilseniz, önce açıkça yanlış cevapları eleyin.',
    ],
    nl: [
        '📖 Lees eerst de vraag, zoek dan het antwoord in de genoemde alinea.',
        '🔍 Controleer of het antwoord uit dezelfde alinea komt als waar de vraag over gaat.',
        '⚠️ Let op woorden zoals: alleen, alle, niet, moet - ze kunnen de betekenis volledig veranderen.',
        '⏰ Bij tijdgerelateerde vragen, controleer of de informatie actueel is.',
        '❌ Bij "NIET correct" vragen zijn drie antwoorden correct en één fout.',
        '🎯 Bij doelvragen zoek je naar het grote plaatje, niet naar details.',
        '💡 Als je twijfelt, elimineer dan eerst de duidelijk foute antwoorden.',
    ],
};

/**
 * Get exam tips in user's language
 */
export function getExamTips(language: SupportedLanguage): string[] {
    return examTips[language] || examTips.en;
}

/**
 * Try to match a distractor analysis string to a trap type
 * This is used when we get analysis from the AI and need to categorize it
 */
export function detectTrapType(analysisText: string): TrapType | null {
    const lowerText = analysisText.toLowerCase();

    const patterns: Array<{ type: TrapType; keywords: string[] }> = [
        { type: 'VERKEERDE_ALINEA', keywords: ['verkeerde alinea', 'wrong paragraph', 'andere alinea', 'different paragraph'] },
        { type: 'OMKERING', keywords: ['omkering', 'reversal', 'tegenovergestelde', 'opposite'] },
        { type: 'GEDEELTELIJKE_WAARHEID', keywords: ['gedeeltelijk', 'partial', 'onvolledig', 'incomplete'] },
        { type: 'VERKEERDE_KOPPELING', keywords: ['verkeerde koppeling', 'wrong connection', 'combineert', 'combines'] },
        { type: 'TEMPORELE_VERWARRING', keywords: ['vroeger', 'formerly', 'temporele', 'time', 'verouderd', 'outdated'] },
        { type: 'SCHIJNBAAR_LOGISCH', keywords: ['lijkt logisch', 'seems logical', 'niet in tekst', 'not in text'] },
        { type: 'TE_BREED_TE_SMAL', keywords: ['te breed', 'too broad', 'te smal', 'too narrow', 'te algemeen', 'too general'] },
        { type: 'OORZAAK_GEVOLG', keywords: ['oorzaak', 'cause', 'gevolg', 'effect', 'verwisselt'] },
        { type: 'EEN_WOORD_VERSCHIL', keywords: ['één woord', 'one word', 'alleen/ook', 'only/also', 'moet/mag', 'must/may'] },
        { type: 'SYNONIEM_VERWARRING', keywords: ['synoniem', 'synonym', 'lijkt op', 'looks like', 'similar word'] },
        { type: 'NEGATIE_VERWARRING', keywords: ['negatie', 'negation', 'niet/geen', 'not/no', 'klopt niet'] },
        { type: 'VERKEERDE_ATTRIBUTIE', keywords: ['verkeerde attributie', 'wrong attribution', 'verkeerde persoon', 'wrong person'] },
        { type: 'DETAIL_VS_HOOFDIDEE', keywords: ['detail', 'hoofdidee', 'main idea', 'te specifiek', 'big picture'] },
        { type: 'UITZONDERING_ALS_REGEL', keywords: ['uitzondering', 'exception', 'regel', 'rule', 'behalve', 'except'] },
        { type: 'IMPLICIET_VS_EXPLICIET', keywords: ['impliciet', 'implicit', 'expliciet', 'explicit', 'conclusie', 'conclude'] },
    ];

    for (const pattern of patterns) {
        for (const keyword of pattern.keywords) {
            if (lowerText.includes(keyword)) {
                return pattern.type;
            }
        }
    }

    return null;
}
