"""
FastAPI Backend for Dutch B1 Exam Generator
Complete platform with authentication, database, and file upload
"""

import os
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import uvicorn

from agent import DutchB1ExamAgent
from translator import DutchToArabicTranslator
from text_formatter import DutchTextFormatter
from database import get_db, Database
from auth import init_auth, get_auth, AuthManager
from file_processor import get_file_processor, FileProcessor
from title_generator import get_title_generator, TitleGenerator
from daily_limit import DailyLimitManager
from public_exams import PublicExamsManager


# Initialize FastAPI app
app = FastAPI(
    title="Dutch B1 Exam Generator",
    description="AI-powered Dutch reading comprehension exam generator for B1 level",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize authentication
auth_manager = init_auth(app)

# Initialize database
try:
    db = get_db()
    print("✅ Database initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize database: {e}")
    db = None

# Initialize agent
try:
    agent = DutchB1ExamAgent()
    print("✅ Agent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize agent: {e}")
    agent = None

# Initialize translator
try:
    translator = DutchToArabicTranslator()
    print("✅ Translator initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize translator: {e}")
    translator = None

# Initialize text formatter
try:
    formatter = DutchTextFormatter()
    print("✅ Text formatter initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize formatter: {e}")
    formatter = None

# Initialize daily limit manager
try:
    daily_limit_manager = DailyLimitManager(db) if db else None
    if daily_limit_manager:
        print("✅ Daily limit manager initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize daily limit manager: {e}")
    daily_limit_manager = None

# Initialize public exams manager
try:
    public_exams_manager = PublicExamsManager(db) if db else None
    if public_exams_manager:
        print("✅ Public exams manager initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize public exams manager: {e}")
    public_exams_manager = None

# Initialize file processor
try:
    file_processor = get_file_processor()
    print("✅ File processor initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize file processor: {e}")
    file_processor = None

# Initialize title generator
try:
    title_generator = get_title_generator()
    print("✅ Title generator initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize title generator: {e}")
    title_generator = None


# Request models
class GenerateExamRequest(BaseModel):
    text: str = Field(..., min_length=50, description="Dutch text for exam generation")
    num_questions: int = Field(default=7, ge=5, le=15, description="Number of questions")
    enable_verification: bool = Field(default=False, description="Enable quality verification")
    enable_formatting: bool = Field(default=True, description="Enable text formatting")
    enable_translation: bool = Field(default=True, description="Enable word translation")


class SaveExamRequest(BaseModel):
    title: Optional[str] = None
    text: str  # Original text
    questions: List[dict]
    word_translations: Optional[dict] = {}
    verification: Optional[dict] = None


class SaveWordRequest(BaseModel):
    word: str = Field(..., min_length=1, description="Dutch word")
    translation: str = Field(..., min_length=1, description="Arabic translation")
    context: Optional[str] = Field(None, description="Context sentence")
    exam_id: Optional[int] = Field(None, description="Related exam ID")


class UpdateExamTitleRequest(BaseModel):
    custom_title: Optional[str] = None


class TranslateRequest(BaseModel):
    text: str = Field(..., description="Dutch text to translate")


# Authentication routes
@app.get("/auth/login")
async def login(request: Request):
    """Initiate Google OAuth login"""
    return await auth_manager.login(request)


@app.get("/auth/callback")
async def auth_callback(request: Request):
    """Handle OAuth callback"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    return await auth_manager.callback(request, db)


@app.get("/auth/logout")
async def logout(request: Request):
    """Logout user"""
    return auth_manager.logout(request)


@app.get("/api/user")
async def get_current_user(request: Request):
    """Get current logged-in user"""
    user = auth_manager.get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


# File upload routes
@app.post("/api/upload-file")
async def upload_file(request: Request, file: UploadFile = File(...)):
    """Upload image or PDF and extract text"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not file_processor:
        raise HTTPException(status_code=500, detail="File processor not available")
    
    try:
        # Read file content
        content = await file.read()
        
        # Detect file type
        file_type = file_processor.detect_file_type(file.filename)
        
        # Save temporarily
        temp_path = file_processor.save_uploaded_file(content, file.filename)
        
        # Process and extract text
        extracted_text = file_processor.process_file(temp_path, file_type)
        
        return {
            "success": True,
            "text": extracted_text,
            "filename": file.filename,
            "file_type": file_type
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")


# Exam generation routes
@app.post("/api/generate-exam")
async def generate_exam(request: Request, exam_request: GenerateExamRequest):
    """Generate exam from text"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not initialized. Check GEMINI_API_KEY.")
    
    # Check daily limit
    if daily_limit_manager:
        limit_check = daily_limit_manager.check_and_update_limit(user['id'])
        if not limit_check['can_generate']:
            raise HTTPException(
                status_code=429,
                detail=limit_check['message']
            )
        print(f"✅ Daily limit check passed: {limit_check['current']}/{limit_check['limit']}")
    
    # Check character limit (5000 chars)
    if len(exam_request.text) > 5000:
        raise HTTPException(
            status_code=400,
            detail="النص طويل جداً! الحد الأقصى هو 5000 حرف."
        )
    
    try:
        # Format text if enabled
        formatted_text = exam_request.text
        if exam_request.enable_formatting and formatter:
            try:
                formatting_result = formatter.format_text(exam_request.text)
                # Extract the formatted_text from the result dictionary
                formatted_text = formatting_result.get('formatted_text', exam_request.text)
                print(f"✅ Text formatted successfully: {formatting_result.get('structure_type', 'unknown')}")
            except Exception as e:
                print(f"Warning: Text formatting failed: {e}")
                formatted_text = exam_request.text
        
        # Check text length and use appropriate method
        word_count = len(exam_request.text.split())
        print(f"📊 Text length: {word_count} words")
        
        # Generate exam with or without verification
        if exam_request.enable_verification:
            result = agent.generate_exam_with_verification(
                text=exam_request.text,
                num_questions=exam_request.num_questions
            )
        else:
            # Use long text processing for texts > 1500 words
            if word_count > 1500:
                print(f"📚 Using long text processing (chunking)")
                result = agent.generate_exam_for_long_text(
                    text=exam_request.text,
                    num_questions=exam_request.num_questions
                )
            else:
                print(f"✅ Using normal processing")
                result = agent.generate_questions_with_fallback(
                    text=exam_request.text,
                    num_questions=exam_request.num_questions
                )
        
        # Add formatted text to result
        result['formatted_text'] = formatted_text
        
        # Translate words if enabled
        if exam_request.enable_translation and translator:
            try:
                word_translations = translator.translate_text_with_words(exam_request.text)['word_translations']
                result['word_translations'] = word_translations
            except Exception as e:
                print(f"Warning: Translation failed: {e}")
                result['word_translations'] = {}
        else:
            result['word_translations'] = {}
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/save-exam")
async def save_exam(request: Request, save_request: SaveExamRequest):
    """Save exam to database"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Generate title if not provided
        title = save_request.title
        if not title and title_generator:
            try:
                title = title_generator.generate_title(save_request.text)
            except Exception as e:
                print(f"Warning: Title generation failed: {e}")
                title = save_request.text[:50] + "..."
        elif not title:
            title = save_request.text[:50] + "..."
        
        # Save to database
        exam_id = db.save_exam(
            user_id=user['id'],
            title=title,
            original_text=save_request.text,
            formatted_text=save_request.text,  # Same as original for now
            questions=save_request.questions,
            word_translations=save_request.word_translations or {},
            num_questions=len(save_request.questions)
        )
        
        return {
            "success": True,
            "exam_id": exam_id,
            "title": title
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/exam/{exam_id}")
async def get_exam(request: Request, exam_id: int):
    """Get a specific exam by ID"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        exam = db.get_exam(exam_id, user['id'])
        
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        return exam
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/exams")
async def get_exams(request: Request, limit: int = 50, offset: int = 0):
    """Get user's exams"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        exams = db.get_user_exams(user['id'], limit=limit, offset=offset)
        total = db.get_user_exam_count(user['id'])
        
        return {
            "exams": exams,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/exams/{exam_id}")
async def get_exam(request: Request, exam_id: int):
    """Get specific exam"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        exam = db.get_exam(exam_id, user['id'])
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        return exam
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/exams/{exam_id}")
async def delete_exam(request: Request, exam_id: int):
    """Delete exam"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        success = db.delete_exam(exam_id, user['id'])
        if not success:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        return {"success": True}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Vocabulary routes
@app.post("/api/vocabulary")
async def save_word(request: Request, word_request: SaveWordRequest):
    """Save a word to vocabulary"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        word_id = db.save_word(
            user_id=user['id'],
            word=word_request.word,
            translation=word_request.translation,
            context=word_request.context,
            exam_id=word_request.exam_id
        )
        
        return {"success": True, "word_id": word_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vocabulary")
async def get_vocabulary(request: Request, limit: int = 100, offset: int = 0):
    """Get user's vocabulary list"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        words = db.get_user_vocabulary(user['id'], limit, offset)
        count = db.get_user_vocabulary_count(user['id'])
        
        return {
            "words": words,
            "total": count,
            "limit": limit,
            "offset": offset
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/vocabulary/{word_id}")
async def delete_word(request: Request, word_id: int):
    """Delete a word from vocabulary"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        success = db.delete_word(word_id, user['id'])
        if not success:
            raise HTTPException(status_code=404, detail="Word not found")
        
        return {"success": True}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vocabulary/search")
async def search_vocabulary(request: Request, q: str):
    """Search vocabulary"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        words = db.search_vocabulary(user['id'], q)
        return {"words": words}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Translation route (kept for backward compatibility)
@app.post("/api/translate")
async def translate_text(request: Request, translate_request: TranslateRequest):
    """Translate Dutch text to Arabic"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not translator:
        raise HTTPException(status_code=500, detail="Translator not initialized")
    
    try:
        translations = translator.translate_text_with_words(translate_request.text)['word_translations']
        return translations
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent_ready": agent is not None,
        "translator_ready": translator is not None,
        "formatter_ready": formatter is not None,
        "database_ready": db is not None,
        "file_processor_ready": file_processor is not None,
        "gemini_configured": os.getenv("GEMINI_API_KEY") is not None
    }


# Static files and HTML routes
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve main page (requires authentication)"""
    user = auth_manager.get_current_user(request)
    if not user:
        return RedirectResponse(url="/login")
    
    with open("static/index_v3.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/login", response_class=HTMLResponse)
async def login_page():
    """Serve login page"""
    with open("static/login_v2.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/exams", response_class=HTMLResponse)
async def exams_page(request: Request):
    """Serve exams list page (requires authentication)"""
    user = auth_manager.get_current_user(request)
    if not user:
        return RedirectResponse(url="/login")
    
    with open("static/exams.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/exam_view.html", response_class=HTMLResponse)
async def exam_view_page(request: Request):
    """Serve exam view page (requires authentication)"""
    user = auth_manager.get_current_user(request)
    if not user:
        return RedirectResponse(url="/login")
    
    with open("static/exam_view.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/vocabulary", response_class=HTMLResponse)
async def vocabulary_page(request: Request):
    """Serve vocabulary list page (requires authentication)"""
    user = auth_manager.get_current_user(request)
    if not user:
        return RedirectResponse(url="/login")
    
    with open("static/vocabulary.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/public-exams", response_class=HTMLResponse)
async def public_exams_page(request: Request):
    """Serve public exams page (requires authentication)"""
    user = auth_manager.get_current_user(request)
    if not user:
        return RedirectResponse(url="/login")
    
    with open("static/public_exams.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/api/daily-limit")
async def get_daily_limit(request: Request):
    """الحصول على الحد اليومي المتبقي"""
    # Require authentication
    user = auth_manager.require_auth(request)
    
    if not daily_limit_manager:
        return JSONResponse({
            "remaining": 5,
            "current": 0,
            "limit": 5
        })
    
    try:
        limit_info = daily_limit_manager.get_remaining_exams(user['id'])
        return JSONResponse(limit_info)
    except Exception as e:
        print(f"Error getting daily limit: {e}")
        return JSONResponse({
            "remaining": 5,
            "current": 0,
            "limit": 5
        })


# Public Exams API
@app.post("/api/exam/{exam_id}/toggle-public")
async def toggle_exam_public(request: Request, exam_id: int):
    """تغيير حالة الامتحان (عام/خاص)"""
    user = auth_manager.require_auth(request)
    
    if not public_exams_manager or not db:
        raise HTTPException(status_code=500, detail="Service not available")
    
    try:
        # Get current exam to check ownership and current status
        exam = db.get_exam(exam_id, user['id'])
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found or access denied")
        
        # Toggle status
        new_status = not exam.get('is_public', False)
        success = public_exams_manager.toggle_exam_public(exam_id, user['id'], new_status)
        
        if success:
            return JSONResponse({
                "success": True,
                "is_public": new_status,
                "message": "تم تغيير حالة الامتحان بنجاح"
            })
        else:
            raise HTTPException(status_code=400, detail="Failed to update exam")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error toggling exam public status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/public-exams")
async def get_public_exams(request: Request, limit: int = 50, offset: int = 0):
    """الحصول على قائمة الامتحانات العامة"""
    # Authentication optional - anyone can view public exams
    user = auth_manager.get_current_user(request)
    
    if not public_exams_manager:
        raise HTTPException(status_code=500, detail="Service not available")
    
    try:
        exams = public_exams_manager.get_public_exams(limit, offset)
        total = public_exams_manager.get_public_exam_count()
        
        return JSONResponse({
            "exams": exams,
            "total": total,
            "limit": limit,
            "offset": offset
        })
    except Exception as e:
        print(f"Error getting public exams: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/public-exam/{exam_id}")
async def get_public_exam(request: Request, exam_id: int):
    """الحصول على امتحان عام محدد"""
    # Authentication optional - anyone can view public exams
    user = auth_manager.get_current_user(request)
    
    if not public_exams_manager:
        raise HTTPException(status_code=500, detail="Service not available")
    
    try:
        exam = public_exams_manager.get_public_exam_by_id(exam_id)
        if not exam:
            raise HTTPException(status_code=404, detail="Public exam not found")
        
        return JSONResponse(exam)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting public exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Serve CSS and JS with correct content type
@app.get("/style.css")
async def serve_css():
    with open("static/style_v3.css", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read(), media_type="text/css")


@app.get("/app.js")
async def serve_js():
    with open("static/app_v2.js", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read(), media_type="application/javascript")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
