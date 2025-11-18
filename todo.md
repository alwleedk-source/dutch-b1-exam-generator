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
