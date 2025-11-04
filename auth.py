"""
Authentication module using Google OAuth 2.0
"""

import os
from typing import Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from itsdangerous import URLSafeTimedSerializer


class AuthManager:
    """Manage Google OAuth authentication"""
    
    def __init__(self, app):
        """Initialize OAuth"""
        self.app = app
        
        # Check if auth is disabled via environment variable
        disable_auth = os.getenv("DISABLE_AUTH", "false").lower() == "true"
        if disable_auth:
            print("⚠️ Warning: Authentication is disabled (DISABLE_AUTH=true)")
            self.oauth_enabled = False
            return
        
        # Get OAuth credentials from environment
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")
        
        if not self.client_id or not self.client_secret:
            print("⚠️ Warning: Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET")
            self.oauth_enabled = False
            return
        
        self.oauth_enabled = True
        
        # Session secret key
        self.secret_key = os.getenv("SESSION_SECRET_KEY", "your-secret-key-change-in-production")
        
        # Add session middleware
        app.add_middleware(
            SessionMiddleware,
            secret_key=self.secret_key,
            max_age=30 * 24 * 60 * 60,  # 30 days
            same_site='lax',             # Allow OAuth redirects
            https_only=True              # Important for production security
        )
        
        # Configure OAuth
        self.oauth = OAuth()
        self.oauth.register(
            name='google',
            client_id=self.client_id,
            client_secret=self.client_secret,
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={'scope': 'openid email profile'}
        )
        
        print("✅ Google OAuth configured successfully")
    
    def get_current_user(self, request: Request) -> Optional[dict]:
        """Get current logged-in user from session"""
        if not self.oauth_enabled:
            # If OAuth is not enabled, return a mock user for development
            return {
                'id': 1,
                'google_id': 'dev_user',
                'email': 'dev@example.com',
                'name': 'Development User',
                'picture': ''
            }
        
        return request.session.get('user')
    
    def require_auth(self, request: Request) -> dict:
        """Require authentication, raise 401 if not logged in"""
        user = self.get_current_user(request)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        return user
    
    async def login(self, request: Request):
        """Initiate Google OAuth login"""
        if not self.oauth_enabled:
            return RedirectResponse(url='/')
        
        redirect_uri = self.redirect_uri
        return await self.oauth.google.authorize_redirect(request, redirect_uri)
    
    async def callback(self, request: Request, db):
        """Handle OAuth callback"""
        if not self.oauth_enabled:
            return RedirectResponse(url='/')
        
        try:
            # Get access token
            token = await self.oauth.google.authorize_access_token(request)
            
            # Get user info
            user_info = token.get('userinfo')
            if not user_info:
                raise HTTPException(status_code=400, detail="Failed to get user info")
            
            # Create or update user in database
            user_id = db.create_or_update_user(
                google_id=user_info['sub'],
                email=user_info['email'],
                name=user_info.get('name', ''),
                picture=user_info.get('picture', '')
            )
            
            # Store user in session
            request.session['user'] = {
                'id': user_id,
                'google_id': user_info['sub'],
                'email': user_info['email'],
                'name': user_info.get('name', ''),
                'picture': user_info.get('picture', '')
            }
            
            # Redirect to home
            return RedirectResponse(url='/')
        
        except Exception as e:
            print(f"OAuth callback error: {e}")
            raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")
    
    def logout(self, request: Request):
        """Logout user"""
        try:
            request.session.clear()
        except:
            pass  # Session might not exist in dev mode
        return RedirectResponse(url='/login')


# Global auth manager instance
_auth_manager = None

def init_auth(app) -> AuthManager:
    """Initialize authentication"""
    global _auth_manager
    _auth_manager = AuthManager(app)
    return _auth_manager

def get_auth() -> AuthManager:
    """Get auth manager instance"""
    if _auth_manager is None:
        raise RuntimeError("Auth not initialized. Call init_auth() first.")
    return _auth_manager
