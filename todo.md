# Dutch B1 Exam Generator - TODO

## Phase 1: Project Setup ✅
- [x] Initialize project with web-db-user template
- [x] Create project structure
- [x] Setup dev environment

## Phase 2: Database Schema ✅
- [x] Design complete database schema
- [x] Create texts table (Dutch B1 texts)
- [x] Create exams table (user exam attempts)
- [x] Create vocabulary table (extracted words)
- [x] Create user_vocabulary table (user progress)
- [x] Create reports table (content/level issues)
- [x] Create translations table (cached translations)
- [x] Create achievements table (gamification)
- [x] Push schema to database

## Phase 3: Backend APIs ✅
- [x] Text management procedures (create, list, validate)
- [x] Text validation (Dutch language check)
- [x] Text level validation (B1 check - warn if A2/B2)
- [x] Translation API (Gemini - Dutch to AR/EN/TR)
- [ ] TTS integration (Google TTS + R2 storage) - will add when needed
- [x] Exam generation (AI-powered questions)
- [x] Exam submission and scoring
- [x] Vocabulary extraction and management
- [x] User progress tracking
- [x] Reporting system (2 options: level/content issues)
- [x] Admin dashboard APIs

## Phase 4: Modern UI/UX
- [ ] Multi-language interface (NL, AR, EN, TR)
- [ ] Landing page with modern design
- [ ] User dashboard
- [ ] Text input methods (paste, upload, scan)
- [ ] Exam taking interface
- [ ] Vocabulary learning interface
- [ ] Progress visualization page
- [ ] Simple reporting UI (2 buttons)
- [ ] Responsive design (mobile-first)
- [ ] Dark/Light theme toggle
- [ ] Loading states and animations

## Phase 5: AI Integration
- [ ] Gemini API for text validation
- [ ] Gemini API for CEFR level detection
- [ ] Gemini API for translations
- [ ] Gemini API for exam question generation
- [ ] Gemini API for vocabulary extraction
- [ ] Error handling for AI failures

## Phase 6: Progress & Analytics
- [ ] Exam completion tracking
- [ ] Score tracking and statistics
- [ ] Vocabulary learning progress
- [ ] Time spent tracking
- [ ] Charts implementation (Chart.js)
- [ ] Achievement system
- [ ] Streak tracking

## Phase 7: Admin Dashboard
- [ ] User management (list, view, roles)
- [ ] Text management (approve, edit, delete)
- [ ] Report management (review, resolve)
- [ ] Statistics dashboard
- [ ] Content moderation tools

## Phase 8: Testing
- [ ] Write vitest tests for auth
- [ ] Write vitest tests for text validation
- [ ] Write vitest tests for exam generation
- [ ] Write vitest tests for translations
- [ ] Test multi-language interface
- [ ] Test admin dashboard
- [ ] Test progress tracking
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

## Phase 9: Deployment
- [ ] Environment variables setup
- [ ] Database migration
- [ ] Deploy to production
- [ ] Test production deployment
- [ ] Documentation
- [ ] User guide

## Additional Features (Future)
- [ ] Offline mode with Service Workers
- [ ] Spaced repetition for vocabulary
- [ ] Gamification elements
- [ ] Social features (leaderboards)
- [ ] Export progress reports
- [ ] Email notifications
- [ ] Mobile app (PWA)


## Phase 10: Google OAuth Migration ✅
- [x] Remove Manus Auth dependency
- [x] Install Passport.js and passport-google-oauth20
- [x] Create Google OAuth strategy
- [x] Update auth routes (/auth/google, /auth/callback, /auth/logout)
- [x] Update session management
- [x] Update frontend login/logout flow
- [ ] Test Google OAuth flow (needs environment variables)

## Phase 11: Environment Variables Setup ✅
- [x] Add DATABASE_URL (PostgreSQL/Neon)
- [x] Add DISABLE_AUTH flag
- [x] Add GEMINI_API_KEY
- [x] Add GOOGLE_CLIENT_ID
- [x] Add GOOGLE_CLIENT_SECRET
- [x] Add GOOGLE_REDIRECT_URI
- [x] Add R2 credentials (ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, PUBLIC_URL)
- [x] Update LLM integration to use Gemini instead of built-in
- [x] Update storage to use Cloudflare R2
- [ ] User needs to add secrets manually in Settings → Secrets


## Bug Fixes
- [x] Fix getLoginUrl() to use Google OAuth instead of Manus OAuth
- [x] Fix useAuth hook to handle login URL safely
- [x] Fix MinHash CommonJS/ESM compatibility issue (replaced with custom implementation)


## Phase 12: Complete Core Pages ✅
- [x] Build Create Exam page (text input, validation, translation)
- [x] Build Take Exam page (interactive quiz interface)
- [x] Build Progress page (stats, charts, achievements)
- [x] Build Vocabulary page (word list, practice)
- [ ] Test all pages end-to-end


## Phase 13: Dashboard & Admin Panel ✅
- [x] Build Dashboard page (overview, recent exams, quick stats)
- [x] Build Admin Panel (user management, text moderation)
- [x] Add admin-only routes protection
- [ ] Test admin features


## Phase 14: Complete Create Exam Page ✅
- [x] Build full Create Exam form with text input
- [x] Add AI validation (Dutch language check)
- [x] Add CEFR level detection (B1 check)
- [ ] Add live translation preview (4 languages) - skipped (backend not ready)
- [x] Add exam generation button
- [ ] Test create exam flow

## Phase 15: Text-to-Speech Integration
- [ ] Add TTS for vocabulary words (postponed)
- [ ] Integrate Google TTS API (postponed)
- [ ] Store audio files in Cloudflare R2 (postponed)
- [ ] Add audio playback UI in vocabulary page (postponed)
- [ ] Test TTS functionality (postponed)

## Phase 16: Leaderboard Feature ✅
- [x] Create leaderboard page
- [x] Add top scores query
- [x] Display user rankings
- [x] Add filters (weekly/monthly/all-time)
- [ ] Test leaderboard


## Phase 17: Text-to-Speech Integration ✅
- [x] Add Google TTS API integration
- [x] Create TTS procedure in backend
- [x] Store audio files in Cloudflare R2
- [x] Add audio playback UI in vocabulary page
- [x] Add pronunciation button for each word
- [ ] Test TTS functionality

## Phase 18: Advanced Achievements System ✅
- [x] Design achievement badges
- [x] Create achievement unlock logic
- [ ] Add achievement notifications (deferred)
- [x] Display achievements in profile
- [x] Add progress bars for achievements
- [ ] Test achievement system

## Phase 19: Study Mode ✅
- [x] Create Study Mode page
- [ ] Add line-by-line translation view (deferred)
- [x] Add vocabulary highlighting
- [x] Add note-taking functionality
- [ ] Add bookmarking system (deferred)
- [ ] Test Study Mode


## Phase 20: Spaced Repetition System ✅
- [x] Implement SM-2 algorithm for vocabulary review
- [x] Add review scheduling logic
- [x] Create review queue system
- [x] Add practice session page
- [x] Track review performance
- [x] Update vocabulary mastery based on reviews
- [ ] Test SRS functionality

## Phase 21: Community Features (IN PROGRESS)
- [ ] Create community forum/discussion board
- [ ] Add text sharing functionality
- [ ] Implement rating and review system
- [ ] Add comments on shared texts
- [ ] Create user profiles with contributions
- [ ] Add moderation tools
- [ ] Test community features

## Phase 22: Mobile PWA Support (IN PROGRESS)
- [ ] Create service worker for offline support
- [ ] Add web app manifest
- [ ] Implement push notifications
- [ ] Add install prompt
- [ ] Optimize for mobile screens
- [ ] Test PWA functionality
- [ ] Add offline data sync


## Phase 23: OCR & Duplicate Detection ✅
- [x] Add OCR support for image upload (extract Dutch text)
- [x] Implement 5000 character limit validation
- [x] Add MinHash algorithm for text similarity detection
- [x] Store MinHash signature in database
- [x] Check for duplicate texts (≥80% similarity)
- [x] Show warning with links to similar texts
- [x] Update Create Exam UI for image upload
- [x] Add terms acceptance checkbox (all texts are public)
- [ ] Make all texts public (remove user-specific filters) - deferred
- [ ] Test OCR and duplicate detection


## Phase 24: PostgreSQL Migration ✅
- [x] Install postgres driver (replace mysql2)
- [x] Update Drizzle config for PostgreSQL
- [x] Convert schema from MySQL to PostgreSQL syntax
- [x] Fix all TypeScript errors
- [ ] Test database connection (will test on Railway)
- [ ] Push to GitHub


## Phase 25: PostgreSQL snake_case Fix ✅
- [x] Convert all column names from camelCase to snake_case in schema
- [x] Update Drizzle schema with snake_case naming
- [x] Regenerate types
- [x] Update all database queries
- [x] Fix all TypeScript errors (frontend & backend)
- [x] Test locally
- [ ] Push to GitHub and Railway


## Phase 26: Railway Deployment Investigation
- [ ] Check Railway project connection to GitHub
- [ ] Verify Railway watches correct branch (master vs main)
- [ ] Check if Railway has auto-deploy enabled
- [ ] Verify build command and start command
- [ ] Manually trigger deployment if needed
- [ ] Test deployed application


## Phase 27: Clean Repository for Railway Deployment
- [ ] Remove old Python/Flask application files
- [ ] Keep only new React/Express application
- [ ] Push clean repository to GitHub
- [ ] Verify Railway builds new application
- [ ] Test deployment


## Phase 28: Fix Authentication & Add Markdown Formatting
- [ ] Investigate authentication error logs
- [ ] Fix Google OAuth callback issue
- [ ] Install markdown-it package
- [ ] Configure markdown-it for text formatting
- [ ] Test authentication flow
- [ ] Test markdown rendering
- [ ] Deploy to Railway


## Phase 29: Fix Session Cookie Issue on Railway
- [ ] Add detailed logging for session creation
- [ ] Debug cookie settings (secure, sameSite, domain)
- [ ] Fix Railway HTTPS proxy trust settings
- [ ] Test cookie persistence across requests
- [ ] Verify authentication flow works end-to-end
- [ ] Deploy and confirm fix


## Phase 30: Fix Database Schema Mismatches ✅
- [x] Identify missing columns (scorePercentage, questions, answers, etc.)
- [x] Add missing columns to database (score_percentage, total_questions, correct_answers, started_at, completed_at, ease_factor, interval, repetitions)
- [x] Update Drizzle schema to use snake_case
- [x] Fix all references in server/db.ts, server/routers.ts
- [x] Fix all references in client Dashboard.tsx
- [x] Push fixes to GitHub
- [ ] Add VITE_APP_LOGO environment variable in Railway
- [ ] Test all tRPC queries after deployment


## Phase 31: Fix ALL Remaining camelCase Columns ✅
- [x] Find all camelCase columns in schema.ts (correctCount, incorrectCount, dutch_text, word_count, etc.)
- [x] Update schema.ts to use snake_case for ALL columns
  - texts table: dutch_text, word_count, estimated_reading_minutes, is_valid_dutch, detected_level, level_confidence, is_b1_level, created_by, moderated_by, moderation_note, moderated_at
  - user_vocabulary table: correct_count, incorrect_count
- [x] Update all code references in server/db.ts, server/routers.ts using sed
- [x] Update all code references in client pages using sed
- [x] Fix all TypeScript errors
- [x] Push fixes to GitHub


## Phase 32: Redesign Create Exam Page (Main Page) ✅
- [x] Make Create Exam page the main landing page after login (redirect from Dashboard)
- [x] Redesign layout - make it prominent and clear, not marginal
- [x] Implement rich text editor with:
  - Large, clear Dutch Text input field
  - Visual editor that accepts formatted text (paste from Word, etc.)
  - Automatic text cleaning (remove HTML tags, formatting codes, etc.)
  - TipTap editor for rich text (NOT markdown-it)
  - Smart paste handling with DOMPurify
- [x] Add AI-powered title generation:
  - If user doesn't provide title, AI generates one from the text (using Gemini)
  - Title is generated server-side during text.create
- [x] Update routing to make this the default page
- [x] Test text cleaning and formatting (vitest tests pass)
- [ ] Deploy to Railway


## Phase 33: Fix Navigation After CreateExam Redesign
- [x] Add header navigation to CreateExam page with links to:
  - Progress page
  - Vocabulary page
  - My Exams page (user's exam history)
  - Public Exams page (all available exams)
  - User profile/logout
- [x] Create "My Exams" page to show:
  - User's completed exams with scores
  - Exam history and progress
  - Option to retake exams
- [x] Create "Public Exams" page to show:
  - All available exams from all users
  - Exam details (title, text preview, difficulty)
- [x] Add listPublicTexts API endpoint
- [x] Add routes to App.tsx
- [x] Ensure all existing pages (Progress, Vocabulary) are still accessible
- [ ] Test navigation flow
- [ ] Deploy to Railway


## Phase 34: Fix Missing Navigation and Database Errors
- [x] Create shared AppHeader component
- [x] Add header navigation to Progress page
- [x] Add header navigation to Vocabulary page
- [x] Fix database table name: userVocabulary → user_vocabulary in schema
- [x] Fix all duplicate index names in schema (texts, exams, vocabulary, reports, achievements)
- [ ] Test all pages have consistent navigation
- [ ] Deploy to Railway


## Phase 35: Complete Translations for All Languages
- [x] Review translations file and identify missing text
- [x] Add translations for new navigation items (My Exams, Public Exams)
- [x] Add translations for all UI elements in new pages (viewResults, retake, studyText, etc.)
- [x] Ensure all hardcoded English text is replaced with translation keys in MyExams and PublicExams
- [x] Add translations for all 4 languages (Dutch, Arabic, English, Turkish)
- [ ] Test language switching
- [ ] Deploy to Railway


## Phase 36: Fix Language Switching
- [x] Check AppHeader - ensure it uses translation keys
- [x] Check CreateExam page - ensure it uses translation keys
- [x] Fixed hardcoded "My Exams" and "Public Exams" in AppHeader
- [x] Fixed hardcoded "My Exams" and "Public Exams" in CreateExam
- [ ] Test language switching in browser
- [ ] Deploy to Railway


## Phase 37: Fix Translation and Gemini API
- [x] Update Dutch translation for "Create New Exam" to "Examen Aanmaken"
- [x] Fix Gemini API model name error (gemini-1.5-flash → gemini-2.0-flash)
- [ ] Test exam creation
- [ ] Deploy to Railway


## Phase 38: Fix Text Creation Flow & Add Admin Dashboard
- [x] Fix text.create to only save to DB after Gemini successfully generates exam
- [x] Add duplicate text detection before calling Gemini (save API costs)
- [x] Add checkDuplicateText function to db.ts
- [x] Update CreateExam.tsx to handle new flow (direct redirect to exam)
- [x] Admin Dashboard page already exists (/admin)
- [x] Add getStats API for admin dashboard
- [x] Update AdminDashboard to use AppHeader
- [x] Admin-only route protection already exists (adminProcedure)
- [ ] Test admin features
- [ ] Deploy to Railway


## Phase 39: Loading State & Admin Notifications
- [x] Add loading state component for exam creation with progress messages
- [x] Update CreateExam to show loading progress (checking text → generating title → creating questions)
- [x] Add 6 new translation keys for loading messages (all 4 languages)
- [x] Add email notification when new text is submitted for review
- [x] Use notifyOwner helper to send notification to admin in text.create
- [ ] Test loading state
- [ ] Test email notifications
- [ ] Deploy to Railway


## Phase 40: Staatsexamen-Style Exam Display & Formatting
- [x] Redesign TakeExam page to show full text at top (no sidebar)
- [x] Display questions below the text (like Staatsexamen format)
- [x] Add full text display with auto-column detection (2 columns for long texts)
- [x] Add RadioGroup for better answer selection UX
- [x] Add progress tracking in sticky header
- [x] Implement smart text formatting preservation:
  - Added preserveFormatting option to RichTextEditor
  - Preserve paragraph breaks and headers when enabled
  - Keep original formatting when pasted (removes only dangerous tags)
- [x] Increase character limit from 5000 to 6000 in:
  - Text extraction API (ocr.ts)
- [x] Set waleed.qodami@gmail.com as admin in database
- [x] Update getExamById to include text title and content
- [ ] Test exam display with different text formats
- [ ] Deploy to Railway


## Phase 41: Print-Friendly View
- [x] Add print button to TakeExam page header (with Printer icon)
- [x] Add print-friendly CSS (@media print)
  - Remove header, buttons, and interactive elements
  - Use black text on white background
  - Optimize layout for A4 paper
  - Show text and questions only
- [ ] Test printing
- [ ] Deploy to Railway
