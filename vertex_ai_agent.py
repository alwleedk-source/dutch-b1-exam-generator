"""
Vertex AI Agent - Alternative to Google AI Studio
For production use with higher limits
"""

import os
from typing import Dict, List, Optional


class VertexAIAgent:
    """Agent using Vertex AI instead of AI Studio"""
    
    def __init__(self):
        """Initialize Vertex AI"""
        project_id = os.getenv("VERTEX_PROJECT_ID")
        location = os.getenv("VERTEX_LOCATION", "us-central1")
        
        if not project_id:
            raise ValueError("VERTEX_PROJECT_ID required for Vertex AI")
        
        try:
            import vertexai
            from vertexai.generative_models import GenerativeModel
            
            vertexai.init(project=project_id, location=location)
            self.model = GenerativeModel('gemini-2.0-flash-exp')
            self.enabled = True
            
            print(f"✅ Vertex AI initialized (Project: {project_id}, Location: {location})")
        
        except Exception as e:
            print(f"❌ Failed to initialize Vertex AI: {e}")
            self.enabled = False
    
    def generate_content(self, prompt: str) -> str:
        """Generate content using Vertex AI"""
        if not self.enabled:
            raise Exception("Vertex AI not enabled")
        
        response = self.model.generate_content(prompt)
        return response.text


def should_use_vertex() -> bool:
    """Check if Vertex AI should be used"""
    return os.getenv("USE_VERTEX_AI", "false").lower() == "true"
