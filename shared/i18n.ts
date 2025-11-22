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
  yourResult: string;
  examPassedMessage: string;
  examFailedMessage: string;
  total: string;
  examNotFound: string;
  examNotFoundDesc: string;
  loadingResults: string;
  examNotCompleted: string;
  examNotCompletedDesc: string;
  takeExam: string;
  
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
  correct: string;
  incorrect: string;
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
  remaining: string;
  characters: string;
  
  // Homepage - New comprehensive translations
  staatsexamenPrep: string;
  officialExamFormat: string;
  masterDutchReading: string;
  comprehensivePreparation: string;
  whyChooseUs: string;
  keyFeatures: string;
  
  // Features - Detailed
  feature5Title: string;
  feature5Desc: string;
  feature6Title: string;
  feature6Desc: string;
  feature7Title: string;
  feature7Desc: string;
  feature8Title: string;
  feature8Desc: string;
  
  // Benefits
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Title: string;
  benefit3Desc: string;
  benefit4Title: string;
  benefit4Desc: string;
  benefit5Title: string;
  benefit5Desc: string;
  benefit6Title: string;
  benefit6Desc: string;
  
  // How it works - Detailed steps
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  
  // CTA
  readyToStart: string;
  joinLearners: string;
  startLearningNow: string;
  
  // Stats
  languagesSupported: string;
  aiPowered: string;
  levelFocus: string;
  
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
  reset: string;
  selectCorrectTranslation: string;
  practiceComplete: string;
  audioError: string;
  
  // Review mode
  reviewMode: string;
  simpleReview: string;
  startPractice: string;
  showDefinition: string;
  hideDefinition: string;
  
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
  
  // Exam Timer
  practiceMode: string;
  examMode: string;
  timeRemaining: string;
  timeUp: string;
  timeWarning: string;
  minutesRemaining: string;
  chooseMode: string;
  practiceModeDesc: string;
  examModeDesc: string;
  timerStarted: string;
  timerPaused: string;
  pauseTimer: string;
  resumeTimer: string;
  
  // Forum
  forumTitle: string;
  forumDescription: string;
  createNewTopic: string;
  backToForum: string;
  topics: string;
  noTopicsYet: string;
  createFirstTopic: string;
  replies: string;
  postReply: string;
  writeYourReply: string;
  posting: string;
  replyPosted: string;
  replyCannotBeEmpty: string;
  topicNotFound: string;
  loginToReply: string;
  loginToCreateTopic: string;
  createTopic: string;
  topicTitle: string;
  enterTopicTitle: string;
  content: string;
  writeYourTopic: string;
  creating: string;
  topicCreated: string;
  fillAllFields: string;
  category: string;
  selectCategory: string;
  characters: string;
  forumLoginPrompt: string;
  topicDeleted: string;
  postDeleted: string;
  notifications: string;
  noNotifications: string;
  markAllRead: string;
  someone: string;
  repliedToYourTopic: string;
  upvotedYourTopic: string;
  upvotedYourPost: string;
  
  // Moderator
  moderatorPanel: string;
  moderatorPanelDesc: string;
  moderatorAccessRequired: string;
  reportsManagement: string;
  reportsManagementDesc: string;
  userManagement: string;
  userManagementDesc: string;
  reportResolved: string;
  pending: string;
  resolved: string;
  all: string;
  noReports: string;
  reportedBy: string;
  unknown: string;
  viewTopic: string;
  resolve: string;
  pin: string;
  unpin: string;
  lock: string;
  unlock: string;
  hide: string;
  unhide: string;
  hidden: string;
  report: string;
  reportContent: string;
  reportDescription: string;
  reportSubmitted: string;
  selectReportReason: string;
  reason: string;
  selectReason: string;
  spam: string;
  harassment: string;
  inappropriate: string;
  misinformation: string;
  other: string;
  topicPinToggled: string;
  topicLockToggled: string;
  topicHideToggled: string;
  moderatorTools: string;
  moderatorToolPin: string;
  moderatorToolLock: string;
  moderatorToolHide: string;
  moderatorToolDelete: string;
  moderatorToolReports: string;
  moderatorToolBan: string;
  moderatorToolModerators: string;
  reportReasonSpam: string;
  reportReasonHarassment: string;
  reportReasonInappropriate: string;
  reportReasonMisinformation: string;
  reportReasonOther: string;
  
  // User Management
  adminAccessRequired: string;
  backToModeratorPanel: string;
  noUsers: string;
  status: string;
  joined: string;
  actions: string;
  admin: string;
  moderator: string;
  banned: string;
  unban: string;
  ban: string;
  removeModerator: string;
  addModerator: string;
  banUser: string;
  banUserDescription: string;
  reason: string;
  enterBanReason: string;
  cancel: string;
  userBanned: string;
  userUnbanned: string;
  moderatorAdded: string;
  moderatorRemoved: string;
  banReasonRequired: string;
  
  // Forum categories
  category_exams_tips: string;
  category_exams_tips_desc: string;
  category_experiences: string;
  category_experiences_desc: string;
  category_questions: string;
  category_questions_desc: string;
  "forum.category.exams_tips": string;
  "forum.category.exams_tips_desc": string;
  "forum.category.experiences": string;
  "forum.category.experiences_desc": string;
  "forum.category.questions": string;
  "forum.category.questions_desc": string;
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
    yourResult: "Jouw Resultaat",
    examPassedMessage: "Goed gedaan! Blijf oefenen om je vaardigheden te verbeteren",
    examFailedMessage: "Blijf oefenen, je bent op de goede weg!",
    total: "Totaal",
    examNotFound: "Examen Niet Gevonden",
    examNotFoundDesc: "Het gevraagde examen kon niet worden gevonden",
    loadingResults: "Resultaten laden...",
    examNotCompleted: "Examen Niet Voltooid",
    examNotCompletedDesc: "Dit examen is nog niet voltooid",
    takeExam: "Examen Maken",
    
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
    correct: "Correct",
    incorrect: "Onjuist",
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
    remaining: "Resterend",
    characters: "tekens",
    
    // Homepage - New comprehensive translations
    staatsexamenPrep: "Staatsexamen Voorbereiding",
    officialExamFormat: "Officieel Examenformaat",
    masterDutchReading: "Beheers Nederlands Lezen voor het Staatsexamen",
    comprehensivePreparation: "Oefen met vragen op hetzelfde niveau en in dezelfde stijl als het officiële Staatsexamen",
    whyChooseUs: "Waarom voor ons kiezen?",
    keyFeatures: "Belangrijkste Kenmerken",
    
    // Features - Detailed
    feature5Title: "Staatsexamen-stijl Vragen",
    feature5Desc: "Oefen met vragen die exact hetzelfde formaat hebben als het officiële staatsexamen",
    feature6Title: "Onbeperkte Oefenteksten",
    feature6Desc: "Voeg je eigen Nederlandse teksten toe (tot 10.100 tekens) en genereer direct examens",
    feature7Title: "Gedetailleerde Uitleg",
    feature7Desc: "Krijg uitgebreide uitleg bij elk antwoord om je begrip te verbeteren",
    feature8Title: "B1 Woordenboek & Vertaling",
    feature8Desc: "Klik op elk woord voor directe vertaling en voeg toe aan je persoonlijke B1 woordenboek",
    
    // Benefits
    benefit1Title: "Verbeter je Leesvaardigheid",
    benefit1Desc: "Train jezelf om Nederlandse teksten sneller en beter te begrijpen",
    benefit2Title: "Bereid je voor op het Staatsexamen",
    benefit2Desc: "Oefen met vragen die identiek zijn aan het officiële inburgeringsexamen",
    benefit3Title: "Tijdmanagement Training",
    benefit3Desc: "Oefen met realistische tijdslimieten zoals het officiële examen (2.8 minuten per vraag)",
    benefit4Title: "Volg je Voortgang",
    benefit4Desc: "Zie je scores verbeteren en identificeer je sterke en zwakke punten",
    benefit5Title: "Meertalige Ondersteuning",
    benefit5Desc: "Interface beschikbaar in Nederlands, Arabisch, Engels en Turks",
    benefit6Title: "Woordenschat Memorisatie",
    benefit6Desc: "Bouw je B1 woordenschat op met spaced repetition systeem en persoonlijk woordenboek",
    
    // How it works - Detailed steps
    step1Title: "Voeg Nederlandse Tekst Toe",
    step1Desc: "Plak, upload of scan elke Nederlandse tekst op B1-niveau (2.000-10.100 tekens)",
    step2Title: "AI Genereert Vragen",
    step2Desc: "Ons systeem maakt automatisch begripsvragen in staatsexamen-stijl",
    step3Title: "Doe het Examen",
    step3Desc: "Beantwoord de vragen en krijg direct feedback met gedetailleerde uitleg",
    step4Title: "Leer en Verbeter",
    step4Desc: "Bekijk je resultaten, leer nieuwe woorden en volg je voortgang in de tijd",
    
    // CTA
    readyToStart: "Klaar om te beginnen?",
    joinLearners: "Sluit je aan bij duizenden leerlingen die zich voorbereiden op hun Nederlands inburgeringsexamen",
    startLearningNow: "Begin Nu met Leren",
    
    // Stats
    languagesSupported: "Talen",
    aiPowered: "AI-Aangedreven",
    levelFocus: "Niveau Focus",
    
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
    reset: "Opnieuw",
    selectCorrectTranslation: "Selecteer de juiste vertaling:",
    practiceComplete: "Oefening voltooid",
    audioError: "Kan audio niet afspelen",
    
    // Review mode
    reviewMode: "Herzienmodus",
    simpleReview: "Eenvoudige Herziening",
    startPractice: "Start Oefening",
    showDefinition: "Toon Nederlandse Definitie",
    hideDefinition: "Verberg Definitie",
    
    // Exam Results page (additional fields)
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
    
    // Exam Timer
    practiceMode: "Oefenmodus",
    examMode: "Examenmodus",
    timeRemaining: "Resterende tijd",
    timeUp: "Tijd is op!",
    timeWarning: "Waarschuwing: Nog maar 5 minuten!",
    minutesRemaining: "minuten resterend",
    chooseMode: "Kies je modus",
    practiceModeDesc: "Geen tijdslimiet - neem de tijd om te leren",
    examModeDesc: "Realistische tijdslimiet zoals het officiële examen",
    timerStarted: "Timer gestart",
    timerPaused: "Timer gepauzeerd",
    pauseTimer: "Pauzeer Timer",
    resumeTimer: "Hervat Timer",
    
    // Forum
    forumTitle: "Community Forum",
    forumDescription: "Discussieer, deel ervaringen en stel vragen",
    createNewTopic: "Nieuw Onderwerp",
    backToForum: "Terug naar Forum",
    topics: "Onderwerpen",
    noTopicsYet: "Nog geen onderwerpen. Wees de eerste om een discussie te starten!",
    createFirstTopic: "Maak Eerste Onderwerp",
    replies: "Reacties",
    postReply: "Plaats Reactie",
    writeYourReply: "Schrijf je reactie...",
    posting: "Plaatsen...",
    replyPosted: "Reactie succesvol geplaatst!",
    replyCannotBeEmpty: "Reactie kan niet leeg zijn",
    topicNotFound: "Onderwerp niet gevonden",
    loginToReply: "Log in om te reageren",
    loginToCreateTopic: "Log in om een onderwerp aan te maken",
    createTopic: "Maak Onderwerp",
    topicTitle: "Onderwerp Titel",
    enterTopicTitle: "Voer een beschrijvende titel in...",
    content: "Inhoud",
    writeYourTopic: "Schrijf je onderwerp...",
    creating: "Aanmaken...",
    topicCreated: "Onderwerp succesvol aangemaakt!",
    fillAllFields: "Vul alle velden in",
    category: "Categorie",
    selectCategory: "Selecteer een categorie",
    characters: "tekens",
    forumLoginPrompt: "Log in om onderwerpen aan te maken en deel te nemen aan discussies",
    topicDeleted: "Onderwerp verwijderd",
    postDeleted: "Reactie verwijderd",
    notifications: "Meldingen",
    noNotifications: "Geen meldingen",
    markAllRead: "Alles als gelezen markeren",
    someone: "Iemand",
    repliedToYourTopic: "heeft op je onderwerp gereageerd",
    upvotedYourTopic: "heeft je onderwerp geliket",
    upvotedYourPost: "heeft je reactie geliket",
    
    // Moderator
    moderatorPanel: "Moderatorpaneel",
    moderatorPanelDesc: "Beheer foruminhoud en gebruikers",
    moderatorAccessRequired: "Moderatortoegang vereist",
    reportsManagement: "Meldingenbeheer",
    reportsManagementDesc: "Bekijk en los gebruikersmeldingen op",
    reportResolved: "Melding opgelost",
    resolved: "Opgelost",
    all: "Alle",
    noReports: "Geen meldingen gevonden",
    reportedBy: "Gemeld door",
    unknown: "Onbekend",
    viewTopic: "Bekijk onderwerp",
    resolve: "Oplossen",
    pin: "Vastpinnen",
    unpin: "Losmaken",
    lock: "Vergrendelen",
    unlock: "Ontgrendelen",
    hide: "Verbergen",
    unhide: "Tonen",
    hidden: "Verborgen",
    report: "Rapporteren",
    reportContent: "Inhoud rapporteren",
    reportDescription: "Selecteer een reden voor het rapporteren van deze inhoud.",
    selectReportReason: "Selecteer een reden",
    reason: "Reden",
    selectReason: "Selecteer een reden",
    harassment: "Intimidatie",
    misinformation: "Desinformatie",
    topicPinToggled: "Onderwerp vastpinnen gewijzigd",
    topicLockToggled: "Onderwerp vergrendeling gewijzigd",
    topicHideToggled: "Onderwerp zichtbaarheid gewijzigd",
    moderatorTools: "Moderatortools",
    moderatorToolPin: "Pin/ontpin onderwerpen om ze bovenaan te houden",
    moderatorToolLock: "Vergrendel/ontgrendel onderwerpen om nieuwe reacties te voorkomen",
    moderatorToolHide: "Verberg/toon onderwerpen om ze uit het publieke zicht te verwijderen",
    moderatorToolDelete: "Verwijder onderwerpen en berichten op elk moment",
    moderatorToolReports: "Bekijk en los gebruikersmeldingen op",
    moderatorToolBan: "Ban/ontban gebruikers (alleen admin)",
    moderatorToolModerators: "Voeg moderators toe/verwijder ze (alleen admin)",
    reportReasonSpam: "Spam",
    reportReasonHarassment: "Intimidatie",
    reportReasonInappropriate: "Ongepaste inhoud",
    reportReasonMisinformation: "Desinformatie",
    reportReasonOther: "Overig",
    
    // User Management
    adminAccessRequired: "Admin toegang vereist",
    backToModeratorPanel: "Terug naar Moderatorpaneel",
    noUsers: "Geen gebruikers gevonden",
    status: "Status",
    joined: "Lid sinds",
    actions: "Acties",
    admin: "Admin",
    moderator: "Moderator",
    banned: "Verbannen",
    unban: "Ontbannen",
    ban: "Verbannen",
    removeModerator: "Moderator verwijderen",
    addModerator: "Moderator toevoegen",
    banUser: "Gebruiker verbannen",
    banUserDescription: "Geef een reden op voor het verbannen van deze gebruiker.",
    enterBanReason: "Voer verbanningsreden in...",
    userBanned: "Gebruiker succesvol verbannen",
    userUnbanned: "Gebruiker succesvol ontbannen",
    moderatorAdded: "Moderator succesvol toegevoegd",
    moderatorRemoved: "Moderator succesvol verwijderd",
    banReasonRequired: "Verbanningsreden is verplicht",
    
    // Forum categories
    category_exams_tips: "Examens & Tips",
    category_exams_tips_desc: "Deel tips en strategieën voor het B1 examen",
    category_experiences: "Persoonlijke Ervaringen",
    category_experiences_desc: "Deel je ervaringen met het leren van Nederlands",
    category_questions: "Vragen & Antwoorden",
    category_questions_desc: "Stel vragen en help anderen",
    "forum.category.exams_tips": "Examens & Tips",
    "forum.category.exams_tips_desc": "Deel tips en strategieën voor het B1 examen",
    "forum.category.experiences": "Persoonlijke Ervaringen",
    "forum.category.experiences_desc": "Deel je ervaringen met het leren van Nederlands",
    "forum.category.questions": "Vragen & Antwoorden",
    "forum.category.questions_desc": "Stel vragen en help anderen",
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
    yourResult: "نتيجتك",
    examPassedMessage: "أحسنت! استمر في التدريب لتحسين مهاراتك",
    examFailedMessage: "استمر في التدريب، أنت على الطريق الصحيح!",
    total: "الإجمالي",
    examNotFound: "الامتحان غير موجود",
    examNotFoundDesc: "لم يتم العثور على الامتحان المطلوب",
    loadingResults: "جاري تحميل النتائج...",
    examNotCompleted: "الامتحان غير مكتمل",
    examNotCompletedDesc: "هذا الامتحان لم يكتمل بعد",
    takeExam: "بدء الامتحان",
    
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
    correct: "صحيح",
    incorrect: "خطأ",
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
    remaining: "متبقي",
    characters: "حرف",
    
    // Homepage - New comprehensive translations
    staatsexamenPrep: "التحضير لامتحان Staatsexamen",
    officialExamFormat: "نفس صيغة الامتحان الرسمي",
    masterDutchReading: "أتقن قراءة الهولندية لامتحان Staatsexamen",
    comprehensivePreparation: "تدرّب على أسئلة بنفس مستوى الصعوبة والطريقة مثل امتحان Staatsexamen الرسمي",
    whyChooseUs: "لماذا تختارنا؟",
    keyFeatures: "الميزات الرئيسية",
    
    // Features - Detailed
    feature5Title: "أسئلة بنفس نمط Staatsexamen",
    feature5Desc: "تدرّب على أسئلة بنفس الصيغة التي تأتي في الامتحان الرسمي",
    feature6Title: "نصوص تدريب غير محدودة",
    feature6Desc: "أضف نصوصك الهولندية الخاصة (حتى 10,100 حرف) واحصل على امتحانات فورية",
    feature7Title: "شرح تفصيلي",
    feature7Desc: "احصل على شرح مفصّل لكل إجابة لتحسين فهمك",
    feature8Title: "قاموس B1 والترجمة",
    feature8Desc: "اضغط على أي كلمة للحصول على الترجمة الفورية وأضفها إلى قاموسك الشخصي لمستوى B1",
    
    // Benefits
    benefit1Title: "حسّن مهارة القراءة",
    benefit1Desc: "درّب نفسل على فهم النصوص الهولندية بشكل أسرع وأفضل",
    benefit2Title: "استعد لامتحان Staatsexamen",
    benefit2Desc: "تدرّب على أسئلة مطابقة تماماً لامتحان الاندماج الرسمي",
    benefit3Title: "التدرب على إدارة الوقت",
    benefit3Desc: "تدرّب مع حدود زمنية واقعية مثل الامتحان الرسمي (2.8 دقيقة لكل سؤال)",
    benefit4Title: "تابع تقدّمك",
    benefit4Desc: "شاهد تحسّن درجاتك وحدّد نقاط قوتك وضعفك",
    benefit5Title: "دعم متعدد اللغات",
    benefit5Desc: "الواجهة متوفرة بالهولندية، العربية، الإنجليزية والتركية",
    benefit6Title: "حفظ المفردات",
    benefit6Desc: "ابنِ مفرداتك لمستوى B1 مع نظام التكرار المتباعد وقاموسك الشخصي",
    
    // How it works - Detailed steps
    step1Title: "أضف نصاً هولندياً",
    step1Desc: "الصق أو ارفع أو امسح أي نص هولندي بمستوى B1 (2,000-10,100 حرف)",
    step2Title: "الذكاء الاصطناعي يولد الأسئلة",
    step2Desc: "نظامنا ينشئ تلقائياً أسئلة فهم بنمط Staatsexamen",
    step3Title: "قم بحل الامتحان",
    step3Desc: "أجب على الأسئلة واحصل على ملاحظات فورية مع شرح مفصّل",
    step4Title: "تعلّم وتحسّن",
    step4Desc: "اطلع على نتائجك، تعلّم كلمات جديدة وتابع تقدّمك بمرور الوقت",
    
    // CTA
    readyToStart: "هل أنت جاهز للبدء؟",
    joinLearners: "انضم إلى آلاف المتعلمين الذين يستعدون لامتحان الاندماج الهولندي",
    startLearningNow: "ابدأ التعلّم الآن",
    
    // Stats
    languagesSupported: "لغات",
    aiPowered: "مدعوم بالذكاء الاصطناعي",
    levelFocus: "التركيز على المستوى",
    
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
    reset: "إعادة",
    selectCorrectTranslation: "اختر الترجمة الصحيحة:",
    practiceComplete: "اكتمل التدريب",
    audioError: "فشل تشغيل الصوت",
    
    // Review mode
    reviewMode: "وضع المراجعة",
    simpleReview: "مراجعة بسيطة",
    startPractice: "بدء التدريب",
    showDefinition: "إظهار الشرح بالهولندية",
    hideDefinition: "إخفاء التعريف",
    
    // Exam Results page (additional fields)
    passed: "ناجح",
    failed: "راسب",   needsImprovement: "يحتاج تحسين",
    excellent: "ممتاز",
    performanceAnalysis: "تحليل الأداء",
    recommendations: "التوصيات",
    reviewAnswers: "مراجعة الإجابات",
    
    // Exam Review page
    examReview: "مراجعة الامتحان",
    yourAnswer: "إجابتك",
    correctAnswer: "الإجابة الصحيحة",
    
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
    
    // Exam Timer
    practiceMode: "وضع التدريب",
    examMode: "وضع الامتحان",
    timeRemaining: "الوقت المتبقي",
    timeUp: "انتهى الوقت!",
    timeWarning: "تحذير: لم يتبق سوى 5 دقائق!",
    minutesRemaining: "دقيقة متبقية",
    chooseMode: "اختر الوضع",
    practiceModeDesc: "بدون حد زمني - خذ وقتك للتعلّم",
    examModeDesc: "حد زمني واقعي مثل الامتحان الرسمي",
    timerStarted: "بدأ المؤقت",
    timerPaused: "تم إيقاف المؤقت",
    pauseTimer: "إيقاف المؤقت",
    resumeTimer: "استئناف المؤقت",
    
    // Forum
    forumTitle: "مجتمع المنتدى",
    forumDescription: "ناقش وشارك التجارب واطرح الأسئلة",
    createNewTopic: "موضوع جديد",
    backToForum: "العودة للمنتدى",
    topics: "مواضيع",
    noTopicsYet: "لا توجد مواضيع بعد. كن أول من يبدأ نقاشًا!",
    createFirstTopic: "أنشئ أول موضوع",
    replies: "الردود",
    postReply: "نشر رد",
    writeYourReply: "اكتب ردك...",
    posting: "جاري النشر...",
    replyPosted: "تم نشر الرد بنجاح!",
    replyCannotBeEmpty: "لا يمكن أن يكون الرد فارغًا",
    topicNotFound: "الموضوع غير موجود",
    loginToReply: "سجل الدخول للرد",
    loginToCreateTopic: "سجل الدخول لإنشاء موضوع",
    createTopic: "إنشاء موضوع",
    topicTitle: "عنوان الموضوع",
    enterTopicTitle: "أدخل عنوانًا وصفيًا...",
    content: "المحتوى",
    writeYourTopic: "اكتب موضوعك...",
    creating: "جاري الإنشاء...",
    topicCreated: "تم إنشاء الموضوع بنجاح!",
    fillAllFields: "املأ جميع الحقول",
    category: "الفئة",
    selectCategory: "اختر فئة",
    characters: "حرف",
    forumLoginPrompt: "سجل الدخول لإنشاء مواضيع والمشاركة في النقاشات",
    topicDeleted: "تم حذف الموضوع",
    postDeleted: "تم حذف الرد",
    notifications: "التنبيهات",
    noNotifications: "لا توجد تنبيهات",
    markAllRead: "تحديد الكل كمقروء",
    someone: "شخص ما",
    repliedToYourTopic: "رد على موضوعك",
    upvotedYourTopic: "أعجب بموضوعك",
    upvotedYourPost: "أعجب بردك",
    
    // Moderator
    moderatorPanel: "لوحة المشرفين",
    moderatorPanelDesc: "إدارة محتوى المجتمع والمستخدمين",
    moderatorAccessRequired: "يتطلب وصول مشرف",
    reportsManagement: "إدارة التبليغات",
    reportsManagementDesc: "مراجعة وحل التبليغات",
    reportResolved: "تم حل التبليغ",
    resolved: "تم الحل",
    all: "الكل",
    noReports: "لا توجد تبليغات",
    reportedBy: "بلغ بواسطة",
    unknown: "غير معروف",
    viewTopic: "عرض الموضوع",
    resolve: "حل",
    pin: "تثبيت",
    unpin: "إلغاء التثبيت",
    lock: "إغلاق",
    unlock: "فتح",
    hide: "إخفاء",
    unhide: "إظهار",
    hidden: "مخفي",
    report: "تبليغ",
    reportContent: "تبليغ عن محتوى",
    reportDescription: "يرجى اختيار سبب التبليغ عن هذا المحتوى.",
    selectReportReason: "يرجى اختيار سبب",
    reason: "السبب",
    selectReason: "اختر سبباً",
    harassment: "مضايقة",
    misinformation: "معلومات مضللة",
    topicPinToggled: "تم تغيير تثبيت الموضوع",
    topicLockToggled: "تم تغيير إغلاق الموضوع",
    topicHideToggled: "تم تغيير إظهار الموضوع",
    moderatorTools: "أدوات المشرف",
    moderatorToolPin: "تثبيت/إلغاء تثبيت المواضيع لإبقائها في الأعلى",
    moderatorToolLock: "إغلاق/فتح المواضيع لمنع الردود الجديدة",
    moderatorToolHide: "إخفاء/إظهار المواضيع لإزالتها من العرض العام",
    moderatorToolDelete: "حذف المواضيع والردود في أي وقت",
    moderatorToolReports: "مراجعة وحل التبليغات",
    moderatorToolBan: "حظر/إلغاء حظر المستخدمين (الإداريون فقط)",
    moderatorToolModerators: "إضافة/إزالة المشرفين (الإداريون فقط)",
    reportReasonSpam: "رسائل مزعجة",
    reportReasonHarassment: "مضايقة",
    reportReasonInappropriate: "محتوى غير لائق",
    reportReasonMisinformation: "معلومات خاطئة",
    reportReasonOther: "أخرى",
    
    // User Management
    adminAccessRequired: "يتطلب صلاحية إداري",
    backToModeratorPanel: "العودة إلى لوحة المشرفين",
    noUsers: "لا يوجد مستخدمون",
    status: "الحالة",
    joined: "تاريخ الانضمام",
    actions: "الإجراءات",
    admin: "إداري",
    moderator: "مشرف",
    banned: "محظور",
    unban: "إلغاء الحظر",
    ban: "حظر",
    removeModerator: "إزالة مشرف",
    addModerator: "إضافة مشرف",
    banUser: "حظر مستخدم",
    banUserDescription: "يرجى تقديم سبب لحظر هذا المستخدم.",
    enterBanReason: "أدخل سبب الحظر...",
    userBanned: "تم حظر المستخدم بنجاح",
    userUnbanned: "تم إلغاء حظر المستخدم بنجاح",
    moderatorAdded: "تم إضافة المشرف بنجاح",
    moderatorRemoved: "تم إزالة المشرف بنجاح",
    banReasonRequired: "سبب الحظر مطلوب",
    
    // Forum categories
    category_exams_tips: "نصائح وإرشادات الامتحان",
    category_exams_tips_desc: "شارك نصائح واستراتيجيات لامتحان B1",
    category_experiences: "تجارب شخصية",
    category_experiences_desc: "شارك تجربتك في تعلم الهولندية",
    category_questions: "أسئلة وأجوبة",
    category_questions_desc: "اطرح الأسئلة وساعد الآخرين",
    "forum.category.exams_tips": "نصائح وإرشادات الامتحان",
    "forum.category.exams_tips_desc": "شارك نصائح واستراتيجيات لامتحان B1",
    "forum.category.experiences": "تجارب شخصية",
    "forum.category.experiences_desc": "شارك تجربتك في تعلم الهولندية",
    "forum.category.questions": "أسئلة وأجوبة",
    "forum.category.questions_desc": "اطرح الأسئلة وساعد الآخرين",
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
    yourResult: "Your Result",
    examPassedMessage: "Well done! Keep practicing to improve your skills",
    examFailedMessage: "Keep practicing, you're on the right track!",
    total: "Total",
    examNotFound: "Exam Not Found",
    examNotFoundDesc: "The requested exam could not be found",
    loadingResults: "Loading results...",
    examNotCompleted: "Exam Not Completed",
    examNotCompletedDesc: "This exam has not been completed yet",
    takeExam: "Take Exam",
    
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
    correct: "Correct",
    incorrect: "Incorrect",
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
    remaining: "Remaining",
    characters: "characters",
    
    // Homepage - New comprehensive translations
    staatsexamenPrep: "Staatsexamen Preparation",
    officialExamFormat: "Official Exam Format",
    masterDutchReading: "Master Dutch Reading for Staatsexamen",
    comprehensivePreparation: "Practice with questions at the same difficulty level and format as the official Staatsexamen",
    whyChooseUs: "Why Choose Us?",
    keyFeatures: "Key Features",
    
    // Features - Detailed
    feature5Title: "Staatsexamen-Style Questions",
    feature5Desc: "Practice with questions that match the exact format of the official staatsexamen",
    feature6Title: "Unlimited Practice Texts",
    feature6Desc: "Add your own Dutch texts (up to 10,100 characters) and generate instant exams",
    feature7Title: "Detailed Explanations",
    feature7Desc: "Get comprehensive explanations for each answer to improve your understanding",
    feature8Title: "B1 Dictionary & Translation",
    feature8Desc: "Click any word for instant translation and add it to your personal B1 dictionary",
    
    // Benefits
    benefit1Title: "Improve Reading Skills",
    benefit1Desc: "Train yourself to understand Dutch texts faster and better",
    benefit2Title: "Prepare for Staatsexamen",
    benefit2Desc: "Practice with questions identical to the official integration exam",
    benefit3Title: "Time Management Training",
    benefit3Desc: "Practice with realistic time limits like the official exam (2.8 minutes per question)",
    benefit4Title: "Track Your Progress",
    benefit4Desc: "See your scores improve and identify your strengths and weaknesses",
    benefit5Title: "Multilingual Support",
    benefit5Desc: "Interface available in Dutch, Arabic, English, and Turkish",
    benefit6Title: "Vocabulary Memorization",
    benefit6Desc: "Build your B1 vocabulary with spaced repetition system and personal dictionary",
    
    // How it works - Detailed steps
    step1Title: "Add Dutch Text",
    step1Desc: "Paste, upload, or scan any Dutch text at B1 level (2,000-10,100 characters)",
    step2Title: "AI Generates Questions",
    step2Desc: "Our system automatically creates comprehension questions in staatsexamen style",
    step3Title: "Take the Exam",
    step3Desc: "Answer the questions and get instant feedback with detailed explanations",
    step4Title: "Learn and Improve",
    step4Desc: "Review your results, learn new words, and track your progress over time",
    
    // CTA
    readyToStart: "Ready to Get Started?",
    joinLearners: "Join thousands of learners preparing for their Dutch integration exam",
    startLearningNow: "Start Learning Now",
    
    // Stats
    languagesSupported: "Languages",
    aiPowered: "AI-Powered",
    levelFocus: "Level Focus",
    
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
    reset: "Reset",
    selectCorrectTranslation: "Select the correct translation:",
    practiceComplete: "Practice complete",
    audioError: "Failed to play audio",
    
    // Review mode
    reviewMode: "Review Mode",
    simpleReview: "Simple Review",
    startPractice: "Start Practice",
    showDefinition: "Show Dutch Definition",
    hideDefinition: "Hide Definition",
    
    // Exam Results page (additional fields)
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
    
    // Exam Timer
    practiceMode: "Practice Mode",
    examMode: "Exam Mode",
    timeRemaining: "Time Remaining",
    timeUp: "Time's Up!",
    timeWarning: "Warning: Only 5 minutes left!",
    minutesRemaining: "minutes remaining",
    chooseMode: "Choose Your Mode",
    practiceModeDesc: "No time limit - take your time to learn",
    examModeDesc: "Realistic time limit like the official exam",
    timerStarted: "Timer started",
    timerPaused: "Timer paused",
    pauseTimer: "Pause Timer",
    resumeTimer: "Resume Timer",
    
    // Forum
    forumTitle: "Community Forum",
    forumDescription: "Discuss, share experiences and ask questions",
    createNewTopic: "New Topic",
    backToForum: "Back to Forum",
    topics: "Topics",
    noTopicsYet: "No topics yet. Be the first to start a discussion!",
    createFirstTopic: "Create First Topic",
    replies: "Replies",
    postReply: "Post Reply",
    writeYourReply: "Write your reply...",
    posting: "Posting...",
    replyPosted: "Reply posted successfully!",
    replyCannotBeEmpty: "Reply cannot be empty",
    topicNotFound: "Topic not found",
    loginToReply: "Log in to reply",
    loginToCreateTopic: "Log in to create a topic",
    createTopic: "Create Topic",
    topicTitle: "Topic Title",
    enterTopicTitle: "Enter a descriptive title...",
    content: "Content",
    writeYourTopic: "Write your topic...",
    creating: "Creating...",
    topicCreated: "Topic created successfully!",
    fillAllFields: "Fill all fields",
    category: "Category",
    selectCategory: "Select a category",
    characters: "characters",
    forumLoginPrompt: "Log in to create topics and participate in discussions",
    topicDeleted: "Topic deleted",
    postDeleted: "Post deleted",
    notifications: "Notifications",
    noNotifications: "No notifications",
    markAllRead: "Mark all read",
    someone: "Someone",
    repliedToYourTopic: "replied to your topic",
    upvotedYourTopic: "upvoted your topic",
    upvotedYourPost: "upvoted your post",
    
    // Moderator
    moderatorPanel: "Moderator Panel",
    moderatorPanelDesc: "Manage forum content and users",
    moderatorAccessRequired: "Moderator access required",
    reportsManagement: "Reports Management",
    reportsManagementDesc: "Review and resolve user reports",
    reportResolved: "Report resolved",
    resolved: "Resolved",
    all: "All",
    noReports: "No reports found",
    reportedBy: "Reported by",
    unknown: "Unknown",
    viewTopic: "View topic",
    resolve: "Resolve",
    pin: "Pin",
    unpin: "Unpin",
    lock: "Lock",
    unlock: "Unlock",
    hide: "Hide",
    unhide: "Unhide",
    hidden: "Hidden",
    report: "Report",
    reportContent: "Report Content",
    reportDescription: "Please select a reason for reporting this content.",
    selectReportReason: "Please select a reason",
    reason: "Reason",
    selectReason: "Select a reason",
    harassment: "Harassment",
    misinformation: "Misinformation",
    topicPinToggled: "Topic pin toggled",
    topicLockToggled: "Topic lock toggled",
    topicHideToggled: "Topic visibility toggled",
    moderatorTools: "Moderator Tools",
    moderatorToolPin: "Pin/Unpin topics to keep them at the top",
    moderatorToolLock: "Lock/Unlock topics to prevent new replies",
    moderatorToolHide: "Hide/Unhide topics to remove from public view",
    moderatorToolDelete: "Delete topics and posts at any time",
    moderatorToolReports: "Review and resolve user reports",
    moderatorToolBan: "Ban/Unban users (Admin only)",
    moderatorToolModerators: "Add/Remove moderators (Admin only)",
    reportReasonSpam: "Spam",
    reportReasonHarassment: "Harassment",
    reportReasonInappropriate: "Inappropriate content",
    reportReasonMisinformation: "Misinformation",
    reportReasonOther: "Other",
    
    // User Management
    adminAccessRequired: "Admin access required",
    backToModeratorPanel: "Back to Moderator Panel",
    noUsers: "No users found",
    status: "Status",
    joined: "Joined",
    actions: "Actions",
    admin: "Admin",
    moderator: "Moderator",
    banned: "Banned",
    unban: "Unban",
    ban: "Ban",
    removeModerator: "Remove Moderator",
    addModerator: "Add Moderator",
    banUser: "Ban User",
    banUserDescription: "Please provide a reason for banning this user.",
    enterBanReason: "Enter ban reason...",
    userBanned: "User banned successfully",
    userUnbanned: "User unbanned successfully",
    moderatorAdded: "Moderator added successfully",
    moderatorRemoved: "Moderator removed successfully",
    banReasonRequired: "Ban reason is required",
    
    // Forum categories
    category_exams_tips: "Exams & Tips",
    category_exams_tips_desc: "Share tips and strategies for the B1 exam",
    category_experiences: "Personal Experiences",
    category_experiences_desc: "Share your experience learning Dutch",
    category_questions: "Questions & Answers",
    category_questions_desc: "Ask questions and help others",
    "forum.category.exams_tips": "Exams & Tips",
    "forum.category.exams_tips_desc": "Share tips and strategies for the B1 exam",
    "forum.category.experiences": "Personal Experiences",
    "forum.category.experiences_desc": "Share your experience learning Dutch",
    "forum.category.questions": "Questions & Answers",
    "forum.category.questions_desc": "Ask questions and help others",
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
    yourResult: "Sonucunuz",
    examPassedMessage: "Aferin! Becerilerinizi geliştirmek için pratik yapmaya devam edin",
    examFailedMessage: "Pratik yapmaya devam edin, doğru yoldasınız!",
    total: "Toplam",
    examNotFound: "Sınav Bulunamadı",
    examNotFoundDesc: "İstenen sınav bulunamadı",
    loadingResults: "Sonuçlar yükleniyor...",
    examNotCompleted: "Sınav Tamamlanmadı",
    examNotCompletedDesc: "Bu sınav henüz tamamlanmadı",
    takeExam: "Sınava Başla",
    
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
    correct: "Doğru",
    incorrect: "Yanlış",
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
    remaining: "Kalan",
    characters: "karakter",
    
    // Homepage - New comprehensive translations
    staatsexamenPrep: "Staatsexamen Hazırlığı",
    officialExamFormat: "Resmi Sınav Formatı",
    masterDutchReading: "Staatsexamen için Hollandaca Okumada Ustalaş",
    comprehensivePreparation: "Resmi Staatsexamen ile aynı zorluk seviyesi ve formatta sorularla pratik yapın",
    whyChooseUs: "Neden Bizi Seçmelisiniz?",
    keyFeatures: "Temel Özellikler",
    
    // Features - Detailed
    feature5Title: "Staatsexamen Tarzı Sorular",
    feature5Desc: "Resmi staatsexamen ile aynı formatta sorularla pratik yapın",
    feature6Title: "Sınırsız Alıştırma Metinleri",
    feature6Desc: "Kendi Hollandaca metinlerinizi ekleyin (10.100 karaktere kadar) ve anında sınavlar oluşturun",
    feature7Title: "Ayrıntılı Açıklamalar",
    feature7Desc: "Anlayışınızı geliştirmek için her yanıt için kapsamlı açıklamalar alın",
    feature8Title: "B1 Sözlük & Çeviri",
    feature8Desc: "Anlık çeviri için herhangi bir kelimeye tıklayın ve kişisel B1 sözlüğünüze ekleyin",
    
    // Benefits
    benefit1Title: "Okuma Becerilerini Geliştir",
    benefit1Desc: "Hollandaca metinleri daha hızlı ve daha iyi anlamak için kendinizi eğitin",
    benefit2Title: "Staatsexamen'e Hazırlan",
    benefit2Desc: "Resmi entegrasyon sınavıyla aynı sorularla pratik yapın",
    benefit3Title: "Zaman Yönetimi Eğitimi",
    benefit3Desc: "Resmi sınav gibi gerçekçi zaman sınırlarıyla pratik yapın (soru başına 2.8 dakika)",
    benefit4Title: "İlerlemenizi Takip Edin",
    benefit4Desc: "Puanlarınızın iyileştiğini görün ve güçlü ve zayıf yönlerinizi belirleyin",
    benefit5Title: "Çok Dilli Destek",
    benefit5Desc: "Arayüz Hollandaca, Arapça, İngilizce ve Türkçe olarak kullanılabilir",
    benefit6Title: "Kelime Ezberlemesi",
    benefit6Desc: "Aralıklı tekrar sistemi ve kişisel sözlük ile B1 kelime bilginizi geliştirin",
    
    // How it works - Detailed steps
    step1Title: "Hollandaca Metin Ekle",
    step1Desc: "B1 seviyesinde herhangi bir Hollandaca metni yapıştırın, yükleyin veya tarayın (2.000-10.100 karakter)",
    step2Title: "Yapay Zeka Sorular Oluşturur",
    step2Desc: "Sistemimiz otomatik olarak staatsexamen tarzında anlaşılma soruları oluşturur",
    step3Title: "Sınavı Çöz",
    step3Desc: "Soruları yanıtlayın ve ayrıntılı açıklamalarla anında geri bildirim alın",
    step4Title: "Öğren ve Geliş",
    step4Desc: "Sonuçlarınızı inceleyin, yeni kelimeler öğrenin ve zaman içinde ilerlemenizi takip edin",
    
    // CTA
    readyToStart: "Başlamaya Hazır mısınız?",
    joinLearners: "Hollanda entegrasyon sınavına hazırlanan binlerce öğrenciye katılın",
    startLearningNow: "Şimdi Öğrenmeye Başla",
    
    // Stats
    languagesSupported: "Diller",
    aiPowered: "Yapay Zeka Destekli",
    levelFocus: "Seviye Odak",
    
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
    reset: "Sıfırla",
    selectCorrectTranslation: "Doğru çeviriyi seçin:",
    practiceComplete: "Pratik tamamlandı",
    audioError: "Ses çalınamadı",
    
    // Review mode
    reviewMode: "Gözden Geçirme Modu",
    simpleReview: "Basit Gözden Geçirme",
    startPractice: "Pratik Başlat",
    showDefinition: "Hollandaca Tanımı Göster",
    hideDefinition: "Tanımı Gizle",
    
    // Exam Results page (additional fields)
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
    
    // Exam Timer
    practiceMode: "Alıştırma Modu",
    examMode: "Sınav Modu",
    timeRemaining: "Kalan Süre",
    timeUp: "Süre Doldu!",
    timeWarning: "Uyarı: Sadece 5 dakika kaldı!",
    minutesRemaining: "dakika kaldı",
    chooseMode: "Modunuzu Seçin",
    practiceModeDesc: "Zaman sınırı yok - öğrenmek için zamanınızı ayırın",
    examModeDesc: "Resmi sınav gibi gerçekçi zaman sınırı",
    timerStarted: "Zamanlayıcı başlatıldı",
    timerPaused: "Zamanlayıcı duraklatıldı",
    pauseTimer: "Zamanlayıcıyı Duraklat",
    resumeTimer: "Zamanlayıcıyı Devam Ettir",
    
    // Forum
    forumTitle: "Topluluk Forumu",
    forumDescription: "Tartışın, deneyimleri paylaşın ve sorular sorun",
    createNewTopic: "Yeni Konu",
    backToForum: "Foruma Dön",
    topics: "Konular",
    noTopicsYet: "Henüz konu yok. Tartışmayı başlatan ilk kişi olun!",
    createFirstTopic: "İlk Konuyu Oluştur",
    replies: "Yanıtlar",
    postReply: "Yanıt Gönder",
    writeYourReply: "Yanıtınızı yazın...",
    posting: "Gönderiliyor...",
    replyPosted: "Yanıt başarıyla gönderildi!",
    replyCannotBeEmpty: "Yanıt boş olamaz",
    topicNotFound: "Konu bulunamadı",
    loginToReply: "Yanıtlamak için giriş yapın",
    loginToCreateTopic: "Konu oluşturmak için giriş yapın",
    createTopic: "Konu Oluştur",
    topicTitle: "Konu Başlığı",
    enterTopicTitle: "Açıklayıcı bir başlık girin...",
    content: "İçerik",
    writeYourTopic: "Konunuzu yazın...",
    creating: "Oluşturuluyor...",
    topicCreated: "Konu başarıyla oluşturuldu!",
    fillAllFields: "Tüm alanları doldurun",
    category: "Kategori",
    selectCategory: "Bir kategori seçin",
    characters: "karakter",
    forumLoginPrompt: "Konu oluşturmak ve tartışmalara katılmak için giriş yapın",
    topicDeleted: "Konu silindi",
    postDeleted: "Yanıt silindi",
    notifications: "Bildirimler",
    noNotifications: "Bildirim yok",
    markAllRead: "Tümünü okundu işaretle",
    someone: "Birisi",
    repliedToYourTopic: "konunuza yanıt verdi",
    upvotedYourTopic: "konunuzu beğendi",
    upvotedYourPost: "yanıtınızı beğendi",
    
    // Moderator
    moderatorPanel: "Moderator Paneli",
    moderatorPanelDesc: "Forum içeriğini ve kullanıcıları yönetin",
    moderatorAccessRequired: "Moderator erişimi gerekli",
    reportsManagement: "Rapor Yönetimi",
    reportsManagementDesc: "Kullanıcı raporlarını inceleyin ve çözün",
    reportResolved: "Rapor çözüldü",
    resolved: "Çözüldü",
    all: "Tümü",
    noReports: "Rapor bulunamadı",
    reportedBy: "Raporlayan",
    unknown: "Bilinmeyen",
    viewTopic: "Konuyu görüntüle",
    resolve: "Çöz",
    pin: "Sabitle",
    unpin: "Sabitlemeyi kaldır",
    lock: "Kilitle",
    unlock: "Kilidi aç",
    hide: "Gizle",
    unhide: "Göster",
    hidden: "Gizli",
    report: "Rapor Et",
    reportContent: "İçeriği Rapor Et",
    reportDescription: "Lütfen bu içeriği raporlamak için bir neden seçin.",
    selectReportReason: "Lütfen bir neden seçin",
    reason: "Neden",
    selectReason: "Bir neden seçin",
    harassment: "Taciz",
    misinformation: "Yanlış Bilgi",
    topicPinToggled: "Konu sabitleme değiştirildi",
    topicLockToggled: "Konu kilitleme değiştirildi",
    topicHideToggled: "Konu görünürlüğü değiştirildi",
    moderatorTools: "Moderator Araçları",
    moderatorToolPin: "Konuları üstte tutmak için sabitleyin/sabitliği kaldırın",
    moderatorToolLock: "Yeni yanıtları önlemek için konuları kilitleyin/kilidi açın",
    moderatorToolHide: "Herkese açık görünümden kaldırmak için konuları gizleyin/gösterin",
    moderatorToolDelete: "Konuları ve gönderileri istediğiniz zaman silin",
    moderatorToolReports: "Kullanıcı raporlarını inceleyin ve çözün",
    moderatorToolBan: "Kullanıcıları yasaklayın/yasak kaldırın (Sadece Admin)",
    moderatorToolModerators: "Moderatorleri ekleyin/kaldırın (Sadece Admin)",
    reportReasonSpam: "Spam",
    reportReasonHarassment: "Taciz",
    reportReasonInappropriate: "Uygunsuz içerik",
    reportReasonMisinformation: "Yanlış bilgi",
    reportReasonOther: "Diğer",
    
    // User Management
    adminAccessRequired: "Admin erişimi gerekli",
    backToModeratorPanel: "Moderator Paneline Dön",
    noUsers: "Kullanıcı bulunamadı",
    status: "Durum",
    joined: "Katıldı",
    actions: "İşlemler",
    admin: "Admin",
    moderator: "Moderator",
    banned: "Yasaklı",
    unban: "Yasak Kaldır",
    ban: "Yasakla",
    removeModerator: "Moderatoru Kaldır",
    addModerator: "Moderator Ekle",
    banUser: "Kullanıcıyı Yasakla",
    banUserDescription: "Lütfen bu kullanıcıyı yasaklama nedeni belirtin.",
    enterBanReason: "Yasaklama nedenini girin...",
    userBanned: "Kullanıcı başarıyla yasaklandı",
    userUnbanned: "Kullanıcı yasağı başarıyla kaldırıldı",
    moderatorAdded: "Moderator başarıyla eklendi",
    moderatorRemoved: "Moderator başarıyla kaldırıldı",
    banReasonRequired: "Yasaklama nedeni gerekli",
    
    // Forum categories
    category_exams_tips: "Sınavlar ve İpuçları",
    category_exams_tips_desc: "B1 sınavı için ipuçları ve stratejileri paylaşın",
    category_experiences: "Kişisel Deneyimler",
    category_experiences_desc: "Hollandaca öğrenme deneyiminizi paylaşın",
    category_questions: "Sorular ve Cevaplar",
    category_questions_desc: "Sorular sorun ve başkalarına yardım edin",
    "forum.category.exams_tips": "Sınavlar ve İpuçları",
    "forum.category.exams_tips_desc": "B1 sınavı için ipuçları ve stratejileri paylaşın",
    "forum.category.experiences": "Kişisel Deneyimler",
    "forum.category.experiences_desc": "Hollandaca öğrenme deneyiminizi paylaşın",
    "forum.category.questions": "Sorular ve Cevaplar",
    "forum.category.questions_desc": "Sorular sorun ve başkalarına yardım edin",
  },
};

// Helper function to get translations for a specific language
export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}
