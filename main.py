"""
FastAPI Backend for Dutch B1 Exam Generator
"""

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn

from agent import DutchB1ExamAgent


# Initialize FastAPI app
app = FastAPI(
    title="Dutch B1 Exam Generator",
    description="AI-powered Dutch reading comprehension exam generator for B1 level",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent
try:
    agent = DutchB1ExamAgent()
    print("✅ Agent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize agent: {e}")
    agent = None


# Request models
class ExamRequest(BaseModel):
    text: str = Field(..., description="Dutch text to generate exam from", min_length=50)
    num_questions: int = Field(7, description="Number of questions to generate", ge=3, le=15)
    verify_quality: bool = Field(True, description="Enable quality verification")


class HealthResponse(BaseModel):
    status: str
    agent_ready: bool
    gemini_configured: bool


# Routes
@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML page"""
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="""
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dutch B1 Exam Generator</title>
        </head>
        <body>
            <h1>🚀 Dutch B1 Exam Generator</h1>
            <p>Backend is running! Please add the frontend files.</p>
            <p>API Documentation: <a href="/docs">/docs</a></p>
        </body>
        </html>
        """)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    gemini_key = os.getenv("GEMINI_API_KEY")
    return {
        "status": "healthy",
        "agent_ready": agent is not None,
        "gemini_configured": gemini_key is not None and len(gemini_key) > 0
    }


@app.post("/api/generate-exam")
async def generate_exam(request: ExamRequest):
    """
    Generate a Dutch B1 reading comprehension exam
    
    Args:
        request: ExamRequest containing text and parameters
        
    Returns:
        Generated exam with questions
    """
    if agent is None:
        raise HTTPException(
            status_code=503,
            detail="Agent not initialized. Please check GEMINI_API_KEY environment variable."
        )
    
    try:
        # Validate text length
        if len(request.text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Text is too short. Please provide at least 50 characters."
            )
        
        # Generate exam
        if request.verify_quality:
            exam = agent.generate_exam_with_verification(
                text=request.text,
                num_questions=request.num_questions
            )
        else:
            exam = agent.generate_questions(
                text=request.text,
                num_questions=request.num_questions
            )
        
        return JSONResponse(content=exam)
        
    except Exception as e:
        print(f"Error generating exam: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate exam: {str(e)}"
        )


@app.post("/api/analyze-text")
async def analyze_text(request: dict):
    """
    Analyze Dutch text to determine its characteristics
    
    Args:
        request: Dictionary with 'text' key
        
    Returns:
        Text analysis
    """
    if agent is None:
        raise HTTPException(
            status_code=503,
            detail="Agent not initialized. Please check GEMINI_API_KEY environment variable."
        )
    
    text = request.get("text", "")
    if not text or len(text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Text is too short for analysis."
        )
    
    try:
        analysis = agent.analyze_text(text)
        return JSONResponse(content=analysis)
    except Exception as e:
        print(f"Error analyzing text: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze text: {str(e)}"
        )


@app.get("/api/info")
async def get_info():
    """Get information about the exam generator"""
    return {
        "name": "Dutch B1 Exam Generator",
        "version": "1.0.0",
        "description": "AI-powered tool for generating Dutch reading comprehension exams at B1 level",
        "exam_types": [
            {
                "type": "Globalverstehen",
                "description": "General understanding questions",
                "difficulty": "easy"
            },
            {
                "type": "Detailverstehen",
                "description": "Detail comprehension questions",
                "difficulty": "medium"
            },
            {
                "type": "Woordbetekenis",
                "description": "Word meaning questions",
                "difficulty": "medium"
            },
            {
                "type": "Tekstdoel",
                "description": "Text purpose questions",
                "difficulty": "hard"
            },
            {
                "type": "Inferentie",
                "description": "Inference questions",
                "difficulty": "hard"
            }
        ],
        "supported_text_types": [
            "Formal letters (gemeente)",
            "Advertisements",
            "Workplace notices",
            "Informational texts"
        ]
    }


# Mount static files (if directory exists)
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except RuntimeError:
    print("⚠️ Static directory not found. Serving basic HTML only.")


# Run server
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
