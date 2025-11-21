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
    totalExams: "Totaal examens",
    completedExams: "Voltooide examens",
    averageScore: "Gemiddelde score",
    totalTime: "Totale tijd",
    currentStreak: "Huidige reeks",
    longestStreak: "Langste reeks",
    achievements: "Prestaties",
    
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
    generatingTitle: "Titel genereren met AI...",
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
    generatingTitle: "توليد العنوان بالذكاء الاصطناعي...",
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
    totalExams: "Total exams",
    completedExams: "Completed exams",
    averageScore: "Average score",
    totalTime: "Total time",
    currentStreak: "Current streak",
    longestStreak: "Longest streak",
    achievements: "Achievements",
    
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
    generatingTitle: "Generating title with AI...",
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
    myProgress: "İlerlemem",
    totalExams: "Toplam sınavlar",
    completedExams: "Tamamlanan sınavlar",
    averageScore: "Ortalama puan",
    totalTime: "Toplam süre",
    currentStreak: "Mevcut seri",
    longestStreak: "En uzun seri",
    achievements: "Başarılar",
    
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
  },
};

// Helper function to get translations for a specific language
export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}
