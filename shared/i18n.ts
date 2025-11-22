// Multi-language support for Dutch B1 Exam App
// Languages: Nederlands (nl), العربية (ar), English (en), Türkçe (tr)

export type Language = "nl" | "ar" | "en" | "tr";

export interface Translations {
  // Navigation
  home: string;
  dashboard: string;
  myExams: string;
  publicExams: string;
  progress: string;
  vocabulary: string;
  admin: string;
  
  // Auth
  login: string;
  logout: string;
  welcome: string;
  welcomeBack: string;
  
  // Landing page
  appTitle: string;
  appSubtitle: string;
  getStarted: string;
  learnMore: string;
  features: string;
  howItWorks: string;
  
  // Features
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;
  
  // Text creation
  createNewExam: string;
  browsePublicExams: string;
  pasteText: string;
  uploadFile: string;
  scanImage: string;
  dutchTextPlaceholder: string;
  textTooShort: string;
  validateText: string;
  translating: string;
  
  // Validation
  validatingText: string;
  textValidated: string;
  textIsValid: string;
  textIsNotDutch: string;
  levelDetected: string;
  levelWarning: string;
  wordCount: string;
  estimatedTime: string;
  
  // Exam
  startExam: string;
  submitExam: string;
  question: string;
  of: string;
  timeSpent: string;
  score: string;
  correctAnswers: string;
  examCompleted: string;
  examInProgress: string;
  viewResults: string;
  retake: string;
  studyText: string;
  noExamsYet: string;
  createFirstExam: string;
  examHistory: string;
  allExams: string;
  readText: string;
  attempts: string;
  added: string;
  
  // Progress
  myProgress: string;
  totalExams: string;
  completedExams: string;
  averageScore: string;
  totalTime: string;
  currentStreak: string;
  longestStreak: string;
  achievements: string;
  totalQuestions: string;
  correctlyAnswered: string;
  performanceByType: string;
  performanceByTypeDesc: string;
  personalizedTips: string;
  
  // Vocabulary
  myVocabulary: string;
  newWords: string;
  learning: string;
  mastered: string;
  reviewNow: string;
  
  // Reporting
  reportIssue: string;
  levelIssue: string;
  contentIssue: string;
  tooEasy: string;
  tooHard: string;
  inappropriate: string;
  spam: string;
  notDutch: string;
  other: string;
  reportSubmitted: string;
  
  // Admin
  userManagement: string;
  textModeration: string;
  reportManagement: string;
  statistics: string;
  approve: string;
  reject: string;
  pending: string;
  approved: string;
  rejected: string;
  
  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  back: string;
  next: string;
  continue: string;
  loading: string;
  error: string;
  success: string;
  confirm: string;
  close: string;
  checkingDuplicate: string;
  generatingTitle: string;
  creatingQuestions: string;
  almostDone: string;
  examCreatedSuccessfully: string;
  failedToCreateExam: string;
  print: string;
  dutchText: string;
  hoverForTranslation: string;
  wordSaved: string;
  notAuthenticated: string;
  pleaseLogin: string;
  pleaseLoginToAccess: string;
  loginWithGoogle: string;
  dontHaveAccount: string;
  signUpAutomatically: string;
  textNotFound: string;
  textNotFoundDesc: string;
  goToDashboard: string;
  words: string;
  minRead: string;
  
  // Progress bar for exam generation
  processingWithAI: string;
  processingWithGemini: string;
  progressLabel: string;
  processingStatus: string;
  completedStatus: string;
  unifiedProcessing: string;
  unifiedProcessingDesc: string;
  
  // Processing steps
  stepCleanText: string;
  stepGenerateTitle: string;
  stepCreateQuestions: string;
  stepExtractVocabulary: string;
  stepFormatText: string;
  
  // Vocabulary page
  yourVocabulary: string;
  wordsLearned: string;
  noVocabularyYet: string;
  completeExamsToStart: string;
  vocabMastered: string;
  vocabLearning: string;
  vocabDue: string;
  searchWord: string;
  filterAll: string;
  filterLearning: string;
  filterMastered: string;
  filterDue: string;
  sortNewest: string;
  sortAlphabetical: string;
  sortMastery: string;
  sortNextReview: string;
  masteryLevel: string;
  reviewNow: string;
  practice: string;
  noResults: string;
  tryDifferentFilter: string;
  filterArchived: string;
  wordDeleted: string;
  wordArchived: string;
  wordUnarchived: string;
  markedAsMastered: string;
  wordSavedToVocabulary: string;
  failedToSaveWord: string;
  archive: string;
  restore: string;
  delete: string;
  mastered: string;
  confirmDelete: string;
  confirmArchive: string;
  skip: string;
  dontShowAgain: string;
  
  // Practice mode
  flashcards: string;
  multipleChoice: string;
  listen: string;
  clickToReveal: string;
  howWellRemembered: string;
  hard: string;
  medium: string;
  easy: string;
  previous: string;
  next: string;
  reset: string;
  selectCorrectTranslation: string;
  practiceComplete: string;
  audioError: string;
  correct: string;
  incorrect: string;
  
  // Review mode
  reviewMode: string;
  simpleReview: string;
  startPractice: string;
  showDefinition: string;
  hideDefinition: string;
  close: string;
  
  // Exam Results page
  examNotFound: string;
  examNotFoundDesc: string;
  examNotCompleted: string;
  examNotCompletedDesc: string;
  takeExam: string;
  loadingResults: string;
  passed: string;
  failed: string;
  needsImprovement: string;
  excellent: string;
  performanceAnalysis: string;
  recommendations: string;
  reviewAnswers: string;
  
  // Exam Review page
  examReview: string;
  yourAnswer: string;
  correctAnswer: string;
  correct: string;
  incorrect: string;
  
  // Progress page
  noProgressYet: string;
  takeFirstExam: string;
  
  // Leaderboard page
  leaderboard: string;
  topScorers: string;
  rank: string;
  player: string;
  
  // Not Found page
  pageNotFound: string;
  pageNotFoundDesc: string;
  goHome: string;
}

export const translations: Record<Language, Translations> = {
  nl: {
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    myExams: "Mijn Examens",
    publicExams: "Openbare Examens",
    progress: "Voortgang",
    vocabulary: "Woordenschat",
    admin: "Beheer",
    
    // Auth
    login: "Inloggen",
    logout: "Uitloggen",
    welcome: "Welkom",
    welcomeBack: "Welkom terug",
    
    // Landing page
    appTitle: "Dutch B1 Exam Generator",
    appSubtitle: "Beheers Nederlands B1 Lezen met AI-gestuurde Oefenexamens",
    getStarted: "Begin Nu",
    learnMore: "Meer Info",
    features: "Functies",
    howItWorks: "Hoe Het Werkt",
    
    // Features
    feature1Title: "AI-Gestuurde Examens",
    feature1Desc: "Automatisch gegenereerde leestoetsen op B1-niveau",
    feature2Title: "4 Talen",
    feature2Desc: "Interface in Nederlands, Arabisch, Engels en Turks",
    feature3Title: "Voortgang Bijhouden",
    feature3Desc: "Volg je scores, woordenschat en studietijd",
    feature4Title: "Woordenschat Leren",
    feature4Desc: "Leer nieuwe woorden met audio en vertalingen",
    
    // Text creation
    createNewExam: "Examen Aanmaken",
    browsePublicExams: "Openbare Examens Bekijken",
    pasteText: "Tekst Plakken",
    uploadFile: "Bestand Uploaden",
    scanImage: "Afbeelding Scannen",
    dutchTextPlaceholder: "Plak hier je Nederlandse tekst...",
    textTooShort: "Tekst moet minimaal 50 tekens bevatten",
    validateText: "Tekst Valideren",
    translating: "Vertalen...",
    
    // Validation
    validatingText: "Tekst valideren...",
    textValidated: "Tekst gevalideerd",
    textIsValid: "Tekst is geldig Nederlands",
    textIsNotDutch: "Tekst is geen Nederlands",
    levelDetected: "Niveau gedetecteerd",
    levelWarning: "Let op: Deze tekst is niet B1-niveau",
    wordCount: "Aantal woorden",
    estimatedTime: "Geschatte leestijd",
    
    // Exam
    startExam: "Examen Starten",
    submitExam: "Examen Indienen",
    question: "Vraag",
    of: "van",
    timeSpent: "Tijd besteed",
    score: "Score",
    correctAnswers: "Goede antwoorden",
    examCompleted: "Examen voltooid",
    examInProgress: "Examen bezig",
    viewResults: "Resultaten Bekijken",
    retake: "Opnieuw Doen",
    studyText: "Tekst Bestuderen",
    noExamsYet: "Nog Geen Examens",
    createFirstExam: "Maak Je Eerste Examen",
    examHistory: "Examengeschiedenis",
    allExams: "Alle Examens",
    readText: "Tekst Lezen",
    attempts: "pogingen",
    added: "Toegevoegd",
    
    // Progress
    myProgress: "Mijn Voortgang",
    totalExams: "Totaal Examens",
    completedExams: "Examens Afgerond",
    averageScore: "Gemiddelde Score",
    totalTime: "Totale Tijd",
    currentStreak: "Huidige Reeks",
    longestStreak: "Langste Reeks",
    achievements: "Prestaties",
    totalQuestions: "Totaal Vragen",
    correctlyAnswered: "Goed Beantwoord",
    performanceByType: "Prestaties per Vraagtype",
    performanceByTypeDesc: "Zie waar je sterk bent en waar je kunt verbeteren",
    personalizedTips: "Gepersonaliseerde tips om je Nederlands te verbeteren",
    
    // Vocabulary
    myVocabulary: "Mijn Woordenschat",
    newWords: "Nieuwe woorden",
    learning: "Aan het leren",
    mastered: "Beheerst",
    reviewNow: "Nu herhalen",
    
    // Reporting
    reportIssue: "Probleem Melden",
    levelIssue: "Niveauprobleem",
    contentIssue: "Inhoudsprobleem",
    tooEasy: "Te makkelijk",
    tooHard: "Te moeilijk",
    inappropriate: "Ongepast",
    spam: "Spam",
    notDutch: "Geen Nederlands",
    other: "Anders",
    reportSubmitted: "Melding ingediend",
    
    // Admin
    userManagement: "Gebruikersbeheer",
    textModeration: "Tekstmoderatie",
    reportManagement: "Meldingenbeheer",
    statistics: "Statistieken",
    approve: "Goedkeuren",
    reject: "Afwijzen",
    pending: "In behandeling",
    approved: "Goedgekeurd",
    rejected: "Afgewezen",
    
    // Common
    save: "Opslaan",
    cancel: "Annuleren",
    delete: "Verwijderen",
    edit: "Bewerken",
    back: "Terug",
    next: "Volgende",
    continue: "Doorgaan",
    loading: "Laden...",
    error: "Fout",
    success: "Succes",
    confirm: "Bevestigen",
    close: "Sluiten",
    checkingDuplicate: "Controleren op dubbele tekst...",
    generatingTitle: "Titel genereren...",
    creatingQuestions: "Examenvragen maken...",
    almostDone: "Bijna klaar...",
    examCreatedSuccessfully: "Examen succesvol aangemaakt!",
    failedToCreateExam: "Examen maken mislukt",
    print: "Afdrukken",
    dutchText: "Nederlandse Tekst",
    hoverForTranslation: "Beweeg over gemarkeerde woorden voor vertaling. Dubbelklik om op te slaan.",
    wordSaved: "Woord opgeslagen!",
    notAuthenticated: "Niet Ingelogd",
    pleaseLogin: "Log in om Studiemodus te gebruiken",
    pleaseLoginToAccess: "Log in om deze pagina te openen",
    loginWithGoogle: "Inloggen met Google",
    dontHaveAccount: "Geen account?",
    signUpAutomatically: "Automatisch aanmelden bij eerste login",
    textNotFound: "Tekst Niet Gevonden",
    textNotFoundDesc: "De gevraagde tekst kon niet worden gevonden",
    goToDashboard: "Naar Dashboard",
    words: "woorden",
    minRead: "min lezen",
    
    // Progress bar for exam generation
    processingWithAI: "Tekst verwerken...",
    processingWithGemini: "De tekst wordt volledig verwerkt",
    progressLabel: "Voortgang",
    processingStatus: "Bezig met verwerken...",
    completedStatus: "✓ Voltooid",
    unifiedProcessing: "Slimme geïntegreerde verwerking",
    unifiedProcessingDesc: "Alle stappen worden in één aanroep verwerkt om tijd te besparen en de beste kwaliteit te garanderen",
    
    // Processing steps
    stepCleanText: "Tekst opschonen en corrigeren",
    stepGenerateTitle: "Slimme titel genereren",
    stepCreateQuestions: "10 begripsvragen maken",
    stepExtractVocabulary: "Belangrijke woordenschat extraheren",
    stepFormatText: "Definitieve tekst formatteren",
    
    // Vocabulary page
    yourVocabulary: "Jouw Woordenschat",
    wordsLearned: "woorden geleerd",
    noVocabularyYet: "Nog geen woordenschat",
    completeExamsToStart: "Voltooi examens om woorden te beginnen leren",
    vocabMastered: "Beheerst",
    vocabLearning: "Aan het leren",
    vocabDue: "Te herzien",
    searchWord: "Zoek een woord...",
    filterAll: "Alles",
    filterLearning: "Aan het leren",
    filterMastered: "Beheerst",
    filterDue: "Te herzien",
    sortNewest: "Nieuwste",
    sortAlphabetical: "Alfabetisch",
    sortMastery: "Beheersing",
    sortNextReview: "Volgende herziening",
    masteryLevel: "Beheersingsniveau",
    reviewNow: "Nu herzien",
    practice: "Oefenen",
    noResults: "Geen resultaten",
    tryDifferentFilter: "Probeer andere zoek- of filtercriteria",
    filterArchived: "Gearchiveerd",
    wordDeleted: "Woord verwijderd",
    wordArchived: "Woord gearchiveerd",
    wordUnarchived: "Woord hersteld",
    markedAsMastered: "Gemarkeerd als beheerst",
    wordSavedToVocabulary: "Woord opgeslagen in woordenschat!",
    failedToSaveWord: "Opslaan mislukt",
    archive: "Archiveren",
    restore: "Herstellen",
    delete: "Verwijderen",
    mastered: "Beheerst",
    confirmDelete: "Weet je zeker dat je dit woord wilt verwijderen?",
    confirmArchive: "Dit woord archiveren? Het verschijnt niet vaak in oefeningen.",
    skip: "Overslaan",
    dontShowAgain: "Niet meer tonen",
    
    // Practice mode
    flashcards: "Flashcards",
    multipleChoice: "Meerkeuzevragen",
    listen: "Luisteren",
    clickToReveal: "Klik om antwoord te onthullen",
    howWellRemembered: "Hoe goed herinner je het?",
    hard: "Moeilijk",
    medium: "Gemiddeld",
    easy: "Makkelijk",
    previous: "Vorige",
    next: "Volgende",
    reset: "Opnieuw",
    selectCorrectTranslation: "Selecteer de juiste vertaling:",
    practiceComplete: "Oefening voltooid",
    audioError: "Kan audio niet afspelen",
    correct: "Correct",
    incorrect: "Onjuist",
    
    // Review mode
    reviewMode: "Herzienmodus",
    simpleReview: "Eenvoudige Herziening",
    startPractice: "Start Oefening",
    showDefinition: "Toon Nederlandse Definitie",
    hideDefinition: "Verberg Definitie",
    close: "Sluiten",
    
    // Exam Results page
    examNotFound: "Examen Niet Gevonden",
    examNotFoundDesc: "Dit examen bestaat niet of is verwijderd.",
    examNotCompleted: "Examen Niet Voltooid",
    examNotCompletedDesc: "Je moet dit examen eerst voltooien om de resultaten te zien.",
    takeExam: "Examen Maken",
    loadingResults: "Resultaten laden...",
    passed: "Geslaagd",
    failed: "Niet Geslaagd",
    needsImprovement: "Verbetering Nodig",
    excellent: "Uitstekend",
    performanceAnalysis: "Prestatie-analyse",
    recommendations: "Aanbevelingen",
    reviewAnswers: "Antwoorden Bekijken",
    
    // Exam Review page
    examReview: "Examen Beoordeling",
    yourAnswer: "Jouw Antwoord",
    correctAnswer: "Correct Antwoord",
    correct: "Correct",
    incorrect: "Onjuist",
    
    // Progress page
    noProgressYet: "Nog geen voortgang",
    takeFirstExam: "Maak je eerste examen om je voortgang bij te houden",
    
    // Leaderboard page
    leaderboard: "Klassement",
    topScorers: "Top Scorers",
    rank: "Rang",
    player: "Speler",
    
    // Not Found page
    pageNotFound: "Pagina Niet Gevonden",
    pageNotFoundDesc: "De pagina die je zoekt bestaat niet.",
    goHome: "Naar Home",
  },
  
  ar: {
    // Navigation
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    myExams: "امتحاناتي",
    publicExams: "الامتحانات العامة",
    progress: "التقدم",
    vocabulary: "المفردات",
    admin: "الإدارة",
    
    // Auth
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    welcome: "مرحباً",
    welcomeBack: "مرحباً بعودتك",
    
    // Landing page
    appTitle: "مولد امتحانات الهولندية B1",
    appSubtitle: "أتقن القراءة الهولندية B1 مع امتحانات تدريبية مدعومة بالذكاء الاصطناعي",
    getStarted: "ابدأ الآن",
    learnMore: "معرفة المزيد",
    features: "الميزات",
    howItWorks: "كيف يعمل",
    
    // Features
    feature1Title: "امتحانات بالذكاء الاصطناعي",
    feature1Desc: "اختبارات قراءة مستوى B1 يتم إنشاؤها تلقائياً",
    feature2Title: "4 لغات",
    feature2Desc: "واجهة بالهولندية والعربية والإنجليزية والتركية",
    feature3Title: "تتبع التقدم",
    feature3Desc: "تتبع درجاتك ومفرداتك ووقت الدراسة",
    feature4Title: "تعلم المفردات",
    feature4Desc: "تعلم كلمات جديدة مع الصوت والترجمات",
    
    // Text creation
    createNewExam: "إنشاء امتحان جديد",
    browsePublicExams: "تصفح الامتحانات العامة",
    pasteText: "لصق النص",
    uploadFile: "رفع ملف",
    scanImage: "مسح صورة",
    dutchTextPlaceholder: "الصق النص الهولندي هنا...",
    textTooShort: "يجب أن يحتوي النص على 50 حرفاً على الأقل",
    validateText: "التحقق من النص",
    translating: "جاري الترجمة...",
    
    // Validation
    validatingText: "جاري التحقق من النص...",
    textValidated: "تم التحقق من النص",
    textIsValid: "النص هولندي صحيح",
    textIsNotDutch: "النص ليس هولندياً",
    levelDetected: "المستوى المكتشف",
    levelWarning: "تنبيه: هذا النص ليس بمستوى B1",
    wordCount: "عدد الكلمات",
    estimatedTime: "وقت القراءة المقدر",
    
    // Exam
    startExam: "بدء الامتحان",
    submitExam: "تقديم الامتحان",
    question: "سؤال",
    of: "من",
    timeSpent: "الوقت المستغرق",
    score: "النتيجة",
    correctAnswers: "الإجابات الصحيحة",
    examCompleted: "اكتمل الامتحان",
    examInProgress: "الامتحان قيد التقدم",
    viewResults: "عرض النتائج",
    retake: "إعادة الامتحان",
    studyText: "دراسة النص",
    noExamsYet: "لا توجد امتحانات بعد",
    createFirstExam: "أنشئ امتحانك الأول",
    examHistory: "سجل الامتحانات",
    allExams: "جميع الامتحانات",
    readText: "قراءة النص",
    attempts: "محاولات",
    added: "أضيف",
    
    // Progress
    myProgress: "تقدمي",
    totalExams: "إجمالي الامتحانات",
    completedExams: "الامتحانات المكتملة",
    averageScore: "متوسط الدرجات",
    totalTime: "الوقت الإجمالي",
    currentStreak: "السلسلة الحالية",
    longestStreak: "أطول سلسلة",
    achievements: "الإنجازات",
    totalQuestions: "إجمالي الأسئلة",
    correctlyAnswered: "الإجابات الصحيحة",
    performanceByType: "الأداء حسب نوع السؤال",
    performanceByTypeDesc: "انظر أين أنت قوي وأين يمكنك التحسين",
    personalizedTips: "نصائح مخصصة لتحسين الهولندية",
    
    // Vocabulary
    myVocabulary: "مفرداتي",
    newWords: "كلمات جديدة",
    learning: "قيد التعلم",
    mastered: "متقن",
    reviewNow: "مراجعة الآن",
    
    // Reporting
    reportIssue: "الإبلاغ عن مشكلة",
    levelIssue: "مشكلة في المستوى",
    contentIssue: "مشكلة في المحتوى",
    tooEasy: "سهل جداً",
    tooHard: "صعب جداً",
    inappropriate: "غير لائق",
    spam: "بريد مزعج",
    notDutch: "ليس هولندياً",
    other: "أخرى",
    reportSubmitted: "تم إرسال البلاغ",
    
    // Admin
    userManagement: "إدارة المستخدمين",
    textModeration: "إشراف النصوص",
    reportManagement: "إدارة البلاغات",
    statistics: "الإحصائيات",
    approve: "موافقة",
    reject: "رفض",
    pending: "قيد الانتظار",
    approved: "موافق عليه",
    rejected: "مرفوض",
    
    // Common
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    back: "رجوع",
    next: "التالي",
    continue: "متابعة",
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجاح",
    confirm: "تأكيد",
    close: "إغلاق",
    checkingDuplicate: "التحقق من النص المكرر...",
    generatingTitle: "توليد العنوان...",
    creatingQuestions: "إنشاء أسئلة الامتحان...",
    almostDone: "انتهى تقريباً...",
    examCreatedSuccessfully: "تم إنشاء الامتحان بنجاح!",
    failedToCreateExam: "فشل إنشاء الامتحان",
    print: "طباعة",
    dutchText: "النص الهولندي",
    hoverForTranslation: "مرر الماوس فوق الكلمات المميزة للترجمة. انقر مرتين للحفظ.",
    wordSaved: "تم حفظ الكلمة!",
    notAuthenticated: "غير مسجل الدخول",
    pleaseLogin: "يرجى تسجيل الدخول لاستخدام وضع الدراسة",
    pleaseLoginToAccess: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة",
    loginWithGoogle: "تسجيل الدخول بواسطة Google",
    dontHaveAccount: "ليس لديك حساب؟",
    signUpAutomatically: "سيتم إنشاء حساب تلقائياً عند تسجيل الدخول لأول مرة",
    textNotFound: "النص غير موجود",
    textNotFoundDesc: "لم يتم العثور على النص المطلوب",
    goToDashboard: "الذهاب إلى لوحة التحكم",
    words: "كلمات",
    minRead: "دقيقة قراءة",
    
    // Progress bar for exam generation
    processingWithAI: "جاري معالجة النص...",
    processingWithGemini: "يتم معالجة النص بشكل كامل",
    progressLabel: "التقدم",
    processingStatus: "جاري المعالجة...",
    completedStatus: "✓ تم",
    unifiedProcessing: "معالجة ذكية موحدة",
    unifiedProcessingDesc: "يتم معالجة جميع الخطوات في استدعاء واحد لتوفير الوقت وضمان أفضل جودة",
    
    // Processing steps
    stepCleanText: "تنظيف وتصحيح النص",
    stepGenerateTitle: "توليد عنوان ذكي",
    stepCreateQuestions: "إنشاء 10 أسئلة فهم",
    stepExtractVocabulary: "استخراج المفردات المهمة",
    stepFormatText: "تنسيق النص النهائي",
     // Vocabulary page
    yourVocabulary: "مفرداتك",
    wordsLearned: "كلمات تعلمتها",
    noVocabularyYet: "لا توجد مفردات بعد",
    completeExamsToStart: "أكمل الامتحانات للبدء في تعلم الكلمات",
    vocabMastered: "متقنة",
    vocabLearning: "قيد التعلم",
    vocabDue: "مستحقة للمراجعة",
    searchWord: "بحث عن كلمة...",
    filterAll: "الكل",
    filterLearning: "قيد التعلم",
    filterMastered: "متقنة",
    filterDue: "مستحقة للمراجعة",
    sortNewest: "الأحدث",
    sortAlphabetical: "أبجدي",
    sortMastery: "الإتقان",
    sortNextReview: "المراجعة القادمة",
    masteryLevel: "مستوى الإتقان",
    reviewNow: "مراجعة الآن",
    practice: "تدريب",
    noResults: "لا توجد نتائج",
    tryDifferentFilter: "جرب تغيير معايير البحث أو الفلترة",
    filterArchived: "مؤرشفة",
    wordDeleted: "تم حذف الكلمة",
    wordArchived: "تم أرشفة الكلمة",
    wordUnarchived: "تم استعادة الكلمة",
    markedAsMastered: "تم وضع علامة متقنة",
    wordSavedToVocabulary: "تم حفظ الكلمة في مفرداتك!",
    failedToSaveWord: "فشل حفظ الكلمة",
    archive: "أرشفة",
    restore: "استعادة",
    delete: "حذف",
    mastered: "متقنة",
    confirmDelete: "هل أنت متأكد من حذف هذه الكلمة؟",
    confirmArchive: "أرشفة هذه الكلمة؟ لن تظهر كثيراً في التدريب.",
    skip: "تخطي",
    dontShowAgain: "لا تظهر مرة أخرى",
    
    // Practice mode
    flashcards: "بطاقات تعليمية",
    multipleChoice: "اختيار من متعدد",
    listen: "استمع",
    clickToReveal: "اضغط لإظهار الإجابة",
    howWellRemembered: "كيف كان تذكرك؟",
    hard: "صعب",
    medium: "متوسط",
    easy: "سهل",
    previous: "السابق",
    next: "التالي",
    reset: "إعادة",
    selectCorrectTranslation: "اختر الترجمة الصحيحة:",
    practiceComplete: "اكتمل التدريب",
    audioError: "فشل تشغيل الصوت",
    correct: "صحيح",
    incorrect: "خطأ",
    
    // Review mode
    reviewMode: "وضع المراجعة",
    simpleReview: "مراجعة بسيطة",
    startPractice: "بدء التدريب",
    showDefinition: "إظهار الشرح بالهولندية",
    hideDefinition: "إخفاء الشرح",
    close: "إغلاق",
    
    // Exam Results page
    examNotFound: "الامتحان غير موجود",
    examNotFoundDesc: "هذا الامتحان غير موجود أو تم حذفه.",
    examNotCompleted: "الامتحان غير مكتمل",
    examNotCompletedDesc: "يجب إكمال هذا الامتحان أولاً لرؤية النتائج.",
    takeExam: "بدء الامتحان",
    loadingResults: "جاري تحميل النتائج...",
    passed: "ناجح",
    failed: "راسب",
    needsImprovement: "يحتاج تحسين",
    excellent: "ممتاز",
    performanceAnalysis: "تحليل الأداء",
    recommendations: "التوصيات",
    reviewAnswers: "مراجعة الإجابات",
    
    // Exam Review page
    examReview: "مراجعة الامتحان",
    yourAnswer: "إجابتك",
    correctAnswer: "الإجابة الصحيحة",
    correct: "صحيح",
    incorrect: "خطأ",
    
    // Progress page
    noProgressYet: "لا يوجد تقدم بعد",
    takeFirstExam: "خذ امتحانك الأول لتتبع تقدمك",
    
    // Leaderboard page
    leaderboard: "لوحة المتصدرين",
    topScorers: "أعلى النقاط",
    rank: "الترتيب",
    player: "اللاعب",
    
    // Not Found page
    pageNotFound: "الصفحة غير موجودة",
    pageNotFoundDesc: "الصفحة التي تبحث عنها غير موجودة.",
    goHome: "العودة للرئيسية",
  },
  
  en: {
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    myExams: "My Exams",
    publicExams: "Public Exams",
    progress: "Progress",
    vocabulary: "Vocabulary",
    admin: "Admin",
    
    // Auth
    login: "Login",
    logout: "Logout",
    welcome: "Welcome",
    welcomeBack: "Welcome back",
    
    // Landing page
    appTitle: "Dutch B1 Exam Generator",
    appSubtitle: "Master Dutch B1 Reading with AI-Powered Practice Exams",
    getStarted: "Get Started",
    learnMore: "Learn More",
    features: "Features",
    howItWorks: "How It Works",
    
    // Features
    feature1Title: "AI-Powered Exams",
    feature1Desc: "Automatically generated B1-level reading comprehension tests",
    feature2Title: "4 Languages",
    feature2Desc: "Interface in Dutch, Arabic, English, and Turkish",
    feature3Title: "Track Progress",
    feature3Desc: "Monitor your scores, vocabulary, and study time",
    feature4Title: "Learn Vocabulary",
    feature4Desc: "Learn new words with audio and translations",
    
    // Text creation
    createNewExam: "Create New Exam",
    browsePublicExams: "Browse Public Exams",
    pasteText: "Paste Text",
    uploadFile: "Upload File",
    scanImage: "Scan Image",
    dutchTextPlaceholder: "Paste your Dutch text here...",
    textTooShort: "Text must be at least 50 characters",
    validateText: "Validate Text",
    translating: "Translating...",
    
    // Validation
    validatingText: "Validating text...",
    textValidated: "Text validated",
    textIsValid: "Text is valid Dutch",
    textIsNotDutch: "Text is not Dutch",
    levelDetected: "Level detected",
    levelWarning: "Warning: This text is not B1 level",
    wordCount: "Word count",
    estimatedTime: "Estimated reading time",
    
    // Exam
    startExam: "Start Exam",
    submitExam: "Submit Exam",
    question: "Question",
    of: "of",
    timeSpent: "Time spent",
    score: "Score",
    correctAnswers: "Correct answers",
    examCompleted: "Exam completed",
    examInProgress: "Exam in progress",
    viewResults: "View Results",
    retake: "Retake",
    studyText: "Study Text",
    noExamsYet: "No Exams Yet",
    createFirstExam: "Create Your First Exam",
    examHistory: "Exam History",
    allExams: "All Exams",
    readText: "Read Text",
    attempts: "attempts",
    added: "Added",
    
    // Progress
    myProgress: "My Progress",
    totalExams: "Total Exams",
    completedExams: "Completed Exams",
    averageScore: "Average Score",
    totalTime: "Total Time",
    currentStreak: "Current Streak",
    longestStreak: "Longest Streak",
    achievements: "Achievements",
    totalQuestions: "Total Questions",
    correctlyAnswered: "Correctly Answered",
    performanceByType: "Performance by Question Type",
    performanceByTypeDesc: "See where you're strong and where you can improve",
    personalizedTips: "Personalized tips to improve your Dutch",
    
    // Vocabulary
    myVocabulary: "My Vocabulary",
    newWords: "New words",
    learning: "Learning",
    mastered: "Mastered",
    reviewNow: "Review now",
    
    // Reporting
    reportIssue: "Report Issue",
    levelIssue: "Level Issue",
    contentIssue: "Content Issue",
    tooEasy: "Too easy",
    tooHard: "Too hard",
    inappropriate: "Inappropriate",
    spam: "Spam",
    notDutch: "Not Dutch",
    other: "Other",
    reportSubmitted: "Report submitted",
    
    // Admin
    userManagement: "User Management",
    textModeration: "Text Moderation",
    reportManagement: "Report Management",
    statistics: "Statistics",
    approve: "Approve",
    reject: "Reject",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    continue: "Continue",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    close: "Close",
    checkingDuplicate: "Checking for duplicate text...",
    generatingTitle: "Generating title...",
    creatingQuestions: "Creating exam questions...",
    almostDone: "Almost done...",
    examCreatedSuccessfully: "Exam created successfully!",
    failedToCreateExam: "Failed to create exam",
    print: "Print",
    dutchText: "Dutch Text",
    hoverForTranslation: "Hover over highlighted words for translation. Double-click to save.",
    wordSaved: "Word saved!",
    notAuthenticated: "Not Authenticated",
    pleaseLogin: "Please log in to use Study Mode",
    pleaseLoginToAccess: "Please log in to access this page",
    loginWithGoogle: "Login with Google",
    dontHaveAccount: "Don't have an account?",
    signUpAutomatically: "Sign up automatically when you log in for the first time",
    textNotFound: "Text Not Found",
    textNotFoundDesc: "The requested text could not be found",
    goToDashboard: "Go to Dashboard",
    words: "words",
    minRead: "min read",
    
    // Progress bar for exam generation
    processingWithAI: "Processing text...",
    processingWithGemini: "Processing the text completely",
    progressLabel: "Progress",
    processingStatus: "Processing...",
    completedStatus: "✓ Done",
    unifiedProcessing: "Smart unified processing",
    unifiedProcessingDesc: "All steps are processed in a single call to save time and ensure best quality",
    
    // Processing steps
    stepCleanText: "Clean and correct text",
    stepGenerateTitle: "Generate smart title",
    stepCreateQuestions: "Create 10 comprehension questions",
    stepExtractVocabulary: "Extract important vocabulary",
    stepFormatText: "Format final text",
       // Vocabulary page
    yourVocabulary: "Your Vocabulary",
    wordsLearned: "words learned",
    noVocabularyYet: "No vocabulary yet",
    completeExamsToStart: "Complete exams to start learning words",
    vocabMastered: "Mastered",
    vocabLearning: "Learning",
    vocabDue: "Due for Review",
    searchWord: "Search for a word...",
    filterAll: "All",
    filterLearning: "Learning",
    filterMastered: "Mastered",
    filterDue: "Due for Review",
    sortNewest: "Newest",
    sortAlphabetical: "Alphabetical",
    sortMastery: "Mastery",
    sortNextReview: "Next Review",
    masteryLevel: "Mastery Level",
    reviewNow: "Review Now",
    practice: "Practice",
    noResults: "No results",
    tryDifferentFilter: "Try different search or filter criteria",
    filterArchived: "Archived",
    wordDeleted: "Word deleted",
    wordArchived: "Word archived",
    wordUnarchived: "Word restored",
    markedAsMastered: "Marked as mastered",
    wordSavedToVocabulary: "Word saved to vocabulary!",
    failedToSaveWord: "Failed to save word",
    archive: "Archive",
    restore: "Restore",
    delete: "Delete",
    mastered: "Mastered",
    confirmDelete: "Are you sure you want to delete this word?",
    confirmArchive: "Archive this word? It won't appear in practice often.",
    skip: "Skip",
    dontShowAgain: "Don't show again",
    
    // Practice mode
    flashcards: "Flashcards",
    multipleChoice: "Multiple Choice",
    listen: "Listen",
    clickToReveal: "Click to reveal answer",
    howWellRemembered: "How well did you remember?",
    hard: "Hard",
    medium: "Medium",
    easy: "Easy",
    previous: "Previous",
    next: "Next",
    reset: "Reset",
    selectCorrectTranslation: "Select the correct translation:",
    practiceComplete: "Practice complete",
    audioError: "Failed to play audio",
    correct: "Correct",
    incorrect: "Incorrect",
    
    // Review mode
    reviewMode: "Review Mode",
    simpleReview: "Simple Review",
    startPractice: "Start Practice",
    showDefinition: "Show Dutch Definition",
    hideDefinition: "Hide Definition",
    close: "Close",
    
    // Exam Results page
    examNotFound: "Exam Not Found",
    examNotFoundDesc: "This exam does not exist or has been deleted.",
    examNotCompleted: "Exam Not Completed",
    examNotCompletedDesc: "You need to complete this exam first to see the results.",
    takeExam: "Take Exam",
    loadingResults: "Loading results...",
    passed: "Passed",
    failed: "Failed",
    needsImprovement: "Needs Improvement",
    excellent: "Excellent",
    performanceAnalysis: "Performance Analysis",
    recommendations: "Recommendations",
    reviewAnswers: "Review Answers",
    
    // Exam Review page
    examReview: "Exam Review",
    yourAnswer: "Your Answer",
    correctAnswer: "Correct Answer",
    correct: "Correct",
    incorrect: "Incorrect",
    
    // Progress page
    noProgressYet: "No progress yet",
    takeFirstExam: "Take your first exam to track your progress",
    
    // Leaderboard page
    leaderboard: "Leaderboard",
    topScorers: "Top Scorers",
    rank: "Rank",
    player: "Player",
    
    // Not Found page
    pageNotFound: "Page Not Found",
    pageNotFoundDesc: "The page you're looking for doesn't exist.",
    goHome: "Go Home",
  },
  
  tr: {
    // Navigation
    home: "Ana Sayfa",
    dashboard: "Kontrol Paneli",
    myExams: "Sınavlarım",
    publicExams: "Genel Sınavlar",
    progress: "İlerleme",
    vocabulary: "Kelime Bilgisi",
    admin: "Yönetim",
    
    // Auth
    login: "Giriş Yap",
    logout: "Çıkış Yap",
    welcome: "Hoş geldiniz",
    welcomeBack: "Tekrar hoş geldiniz",
    
    // Landing page
    appTitle: "Hollandaca B1 Sınav Oluşturucu",
    appSubtitle: "Yapay Zeka Destekli Alıştırma Sınavlarıyla Hollandaca B1 Okumada Ustalaşın",
    getStarted: "Başlayın",
    learnMore: "Daha Fazla Bilgi",
    features: "Özellikler",
    howItWorks: "Nasıl Çalışır",
    
    // Features
    feature1Title: "Yapay Zeka Destekli Sınavlar",
    feature1Desc: "Otomatik oluşturulan B1 seviyesi okuma anlama testleri",
    feature2Title: "4 Dil",
    feature2Desc: "Hollandaca, Arapça, İngilizce ve Türkçe arayüz",
    feature3Title: "İlerlemeyi Takip Edin",
    feature3Desc: "Puanlarınızı, kelime bilginizi ve çalışma sürenizi izleyin",
    feature4Title: "Kelime Öğrenin",
    feature4Desc: "Ses ve çevirilerle yeni kelimeler öğrenin",
    
    // Text creation
    createNewExam: "Yeni Sınav Oluştur",
    browsePublicExams: "Genel Sınavlara Göz At",
    pasteText: "Metin Yapıştır",
    uploadFile: "Dosya Yükle",
    scanImage: "Görüntü Tara",
    dutchTextPlaceholder: "Hollandaca metninizi buraya yapıştırın...",
    textTooShort: "Metin en az 50 karakter olmalıdır",
    validateText: "Metni Doğrula",
    translating: "Çevriliyor...",
    
    // Validation
    validatingText: "Metin doğrulanıyor...",
    textValidated: "Metin doğrulandı",
    textIsValid: "Metin geçerli Hollandaca",
    textIsNotDutch: "Metin Hollandaca değil",
    levelDetected: "Seviye tespit edildi",
    levelWarning: "Uyarı: Bu metin B1 seviyesinde değil",
    wordCount: "Kelime sayısı",
    estimatedTime: "Tahmini okuma süresi",
    
    // Exam
    startExam: "Sınava Başla",
    submitExam: "Sınavı Gönder",
    question: "Soru",
    of: "/",
    timeSpent: "Harcanan süre",
    score: "Puan",
    correctAnswers: "Doğru cevaplar",
    examCompleted: "Sınav tamamlandı",
    examInProgress: "Sınav devam ediyor",
    viewResults: "Sonuçları Görüntüle",
    retake: "Tekrar Dene",
    studyText: "Metni Çalış",
    noExamsYet: "Henüz Sınav Yok",
    createFirstExam: "İlk Sınavınızı Oluşturun",
    examHistory: "Sınav Geçmişi",
    allExams: "Tüm Sınavlar",
    readText: "Metni Oku",
    attempts: "deneme",
    added: "Eklendi",
    
    // Progress
    myProgress: "İlerleme",
    totalExams: "Toplam Sınavlar",
    completedExams: "Tamamlanan Sınavlar",
    averageScore: "Ortalama Puan",
    totalTime: "Toplam Süre",
    currentStreak: "Mevcut Seri",
    longestStreak: "En Uzun Seri",
    achievements: "Başarılar",
    totalQuestions: "Toplam Sorular",
    correctlyAnswered: "Doğru Cevaplanan",
    performanceByType: "Soru Türüne Göre Performans",
    performanceByTypeDesc: "Güçlü olduğunuz ve geliştirebileceğiniz alanları görün",
    personalizedTips: "Hollandcanızı geliştirmek için kişiselleştirilmiş ipuçları",
    
    // Vocabulary
    myVocabulary: "Kelime Bilgim",
    newWords: "Yeni kelimeler",
    learning: "Öğreniliyor",
    mastered: "Öğrenildi",
    reviewNow: "Şimdi gözden geçir",
    
    // Reporting
    reportIssue: "Sorun Bildir",
    levelIssue: "Seviye Sorunu",
    contentIssue: "İçerik Sorunu",
    tooEasy: "Çok kolay",
    tooHard: "Çok zor",
    inappropriate: "Uygunsuz",
    spam: "Spam",
    notDutch: "Hollandaca değil",
    other: "Diğer",
    reportSubmitted: "Rapor gönderildi",
    
    // Admin
    userManagement: "Kullanıcı Yönetimi",
    textModeration: "Metin Moderasyonu",
    reportManagement: "Rapor Yönetimi",
    statistics: "İstatistikler",
    approve: "Onayla",
    reject: "Reddet",
    pending: "Beklemede",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    
    // Common
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    back: "Geri",
    next: "İleri",
    continue: "Devam Et",
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    confirm: "Onayla",
    close: "Kapat",
    checkingDuplicate: "Yinelenen metin kontrol ediliyor...",
    generatingTitle: "Yapay zeka ile başlık oluşturuluyor...",
    creatingQuestions: "Sınav soruları oluşturuluyor...",
    almostDone: "Neredeyse bitti...",
    examCreatedSuccessfully: "Sınav başarıyla oluşturuldu!",
    failedToCreateExam: "Sınav oluşturulamadı",
    print: "Yazdır",
    dutchText: "Hollandaca Metin",
    hoverForTranslation: "Çeviri için vurgulanan kelimelerin üzerine gelin. Kaydetmek için çift tıklayın.",
    wordSaved: "Kelime kaydedildi!",
    notAuthenticated: "Kimlik Doğrulanmadı",
    pleaseLogin: "Çalışma Modunu kullanmak için lütfen giriş yapın",
    pleaseLoginToAccess: "Bu sayfaya erişmek için lütfen giriş yapın",
    loginWithGoogle: "Google ile Giriş Yap",
    dontHaveAccount: "Hesabınız yok mu?",
    signUpAutomatically: "İlk kez giriş yaptığınızda otomatik olarak kaydolun",
    textNotFound: "Metin Bulunamadı",
    textNotFoundDesc: "İstenen metin bulunamadı",
    goToDashboard: "Kontrol Paneline Git",
    words: "kelime",
    minRead: "dakika okuma",
    
    // Progress bar for exam generation
    processingWithAI: "Metin işleniyor...",
    processingWithGemini: "Metin tamamen işleniyor",
    progressLabel: "İlerleme",
    processingStatus: "İşleniyor...",
    completedStatus: "✓ Tamamlandı",
    unifiedProcessing: "Akıllı birleşik işleme",
    unifiedProcessingDesc: "Zaman kazanmak ve en iyi kaliteyi sağlamak için tüm adımlar tek bir çağrıda işlenir",
    
    // Processing steps
    stepCleanText: "Metni temizle ve düzelt",
    stepGenerateTitle: "Akıllı başlık oluştur",
    stepCreateQuestions: "10 anlama sorusu oluştur",
    stepExtractVocabulary: "Önemli kelimeleri çıkar",
    stepFormatText: "Son metni biçimlendir",
    
     // Vocabulary page
    yourVocabulary: "Kelime Hazneniz",
    wordsLearned: "kelime öğrenildi",
    noVocabularyYet: "Henüz kelime yok",
    completeExamsToStart: "Kelime öğrenmeye başlamak için sınavları tamamlayın",
    vocabMastered: "Uzmanlaştı",
    vocabLearning: "Öğreniyor",
    vocabDue: "Gözden Geçirilecek",
    searchWord: "Kelime ara...",
    filterAll: "Tümü",
    filterLearning: "Öğreniyor",
    filterMastered: "Uzmanlaştı",
    filterDue: "Gözden Geçirilecek",
    sortNewest: "En Yeni",
    sortAlphabetical: "Alfabetik",
    sortMastery: "Ustalık",
    sortNextReview: "Sonraki İnceleme",
    masteryLevel: "Ustalık Seviyesi",
    reviewNow: "Şimdi Gözden Geçir",
    practice: "Pratik Yap",
    noResults: "Sonuç yok",
    tryDifferentFilter: "Farklı arama veya filtre kriterleri deneyin",
    filterArchived: "Arşivlendi",
    wordDeleted: "Kelime silindi",
    wordArchived: "Kelime arşivlendi",
    wordUnarchived: "Kelime geri yüklendi",
    markedAsMastered: "Uzmanlaştı olarak işaretlendi",
    wordSavedToVocabulary: "Kelime kelime dağarcığına kaydedildi!",
    failedToSaveWord: "Kelime kaydedilemedi",
    archive: "Arşivle",
    restore: "Geri Yükle",
    delete: "Sil",
    mastered: "Uzmanlaştı",
    confirmDelete: "Bu kelimeyi silmek istediğinizden emin misiniz?",
    confirmArchive: "Bu kelimeyi arşivle? Pratikte sık görünmeyecek.",
    skip: "Atla",
    dontShowAgain: "Bir daha gösterme",
    
    // Practice mode
    flashcards: "Flashcards",
    multipleChoice: "Çoktan Seçmeli",
    listen: "Dinle",
    clickToReveal: "Cevabı görmek için tıklayın",
    howWellRemembered: "Ne kadar iyi hatırladınız?",
    hard: "Zor",
    medium: "Orta",
    easy: "Kolay",
    previous: "Önceki",
    next: "Sonraki",
    reset: "Sıfırla",
    selectCorrectTranslation: "Doğru çeviriyi seçin:",
    practiceComplete: "Pratik tamamlandı",
    audioError: "Ses çalınamadı",
    correct: "Doğru",
    incorrect: "Yanlış",
    
    // Review mode
    reviewMode: "Gözden Geçirme Modu",
    simpleReview: "Basit Gözden Geçirme",
    startPractice: "Pratik Başlat",
    showDefinition: "Hollandaca Tanımı Göster",
    hideDefinition: "Tanımı Gizle",
    close: "Kapat",
    
    // Exam Results page
    examNotFound: "Sınav Bulunamadı",
    examNotFoundDesc: "Bu sınav mevcut değil veya silinmiş.",
    examNotCompleted: "Sınav Tamamlanmadı",
    examNotCompletedDesc: "Sonuçları görmek için önce bu sınavı tamamlamanız gerekiyor.",
    takeExam: "Sınava Başla",
    loadingResults: "Sonuçlar yükleniyor...",
    passed: "Geçti",
    failed: "Kaldı",
    needsImprovement: "Geliştirilmeli",
    excellent: "Mükemmel",
    performanceAnalysis: "Performans Analizi",
    recommendations: "Öneriler",
    reviewAnswers: "Cevapları İncele",
    
    // Exam Review page
    examReview: "Sınav İncelemesi",
    yourAnswer: "Cevabınız",
    correctAnswer: "Doğru Cevap",
    correct: "Doğru",
    incorrect: "Yanlış",
    
    // Progress page
    noProgressYet: "Henüz ilerleme yok",
    takeFirstExam: "İlerlemenizi takip etmek için ilk sınavınızı yapın",
    
    // Leaderboard page
    leaderboard: "Lider Tablosu",
    topScorers: "En Yüksek Puanlar",
    rank: "Sıra",
    player: "Oyuncu",
    
    // Not Found page
    pageNotFound: "Sayfa Bulunamadı",
    pageNotFoundDesc: "Aradığınız sayfa mevcut değil.",
    goHome: "Ana Sayfaya Dön",
  },
};

// Helper function to get translations for a specific language
export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}
