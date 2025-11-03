"""
File Processor for Images and PDFs
Extracts text from uploaded files and deletes them after processing
"""

import os
import tempfile
from typing import Optional
from PIL import Image
import pytesseract
import pdf2image
from pdf2image import convert_from_path


class FileProcessor:
    """Process uploaded images and PDFs to extract text"""
    
    def __init__(self):
        """Initialize file processor"""
        # Tesseract configuration for Dutch
        self.tesseract_config = '--oem 3 --psm 6 -l nld+eng'
    
    def process_file(self, file_path: str, file_type: str) -> str:
        """
        Process uploaded file and extract text
        
        Args:
            file_path: Path to the uploaded file
            file_type: Type of file ('image' or 'pdf')
            
        Returns:
            Extracted text
        """
        try:
            if file_type == 'image':
                text = self._process_image(file_path)
            elif file_type == 'pdf':
                text = self._process_pdf(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            # Clean up: delete the file after processing
            self._cleanup_file(file_path)
            
            return text
        
        except Exception as e:
            # Always cleanup even if processing fails
            self._cleanup_file(file_path)
            raise e
    
    def _process_image(self, image_path: str) -> str:
        """Extract text from image using OCR"""
        try:
            # Open image
            image = Image.open(image_path)
            
            # Perform OCR
            text = pytesseract.image_to_string(
                image, 
                config=self.tesseract_config
            )
            
            # Clean and return text
            return self._clean_text(text)
        
        except Exception as e:
            raise Exception(f"Failed to process image: {str(e)}")
    
    def _process_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF"""
        try:
            # Convert PDF pages to images
            images = convert_from_path(pdf_path, dpi=300)
            
            # Extract text from each page
            all_text = []
            for i, image in enumerate(images):
                print(f"Processing PDF page {i+1}/{len(images)}...")
                text = pytesseract.image_to_string(
                    image,
                    config=self.tesseract_config
                )
                all_text.append(text)
            
            # Combine all pages
            combined_text = "\n\n".join(all_text)
            
            # Clean and return text
            return self._clean_text(combined_text)
        
        except Exception as e:
            raise Exception(f"Failed to process PDF: {str(e)}")
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove excessive whitespace
        lines = [line.strip() for line in text.split('\n')]
        lines = [line for line in lines if line]  # Remove empty lines
        
        # Join lines
        cleaned = '\n'.join(lines)
        
        return cleaned.strip()
    
    def _cleanup_file(self, file_path: str):
        """Delete file after processing"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"✅ File deleted: {file_path}")
        except Exception as e:
            print(f"⚠️ Failed to delete file {file_path}: {e}")
    
    def save_uploaded_file(self, file_data: bytes, filename: str) -> str:
        """
        Save uploaded file temporarily
        
        Args:
            file_data: File content as bytes
            filename: Original filename
            
        Returns:
            Path to saved file
        """
        # Create temp directory if it doesn't exist
        temp_dir = tempfile.gettempdir()
        
        # Generate unique filename
        temp_path = os.path.join(temp_dir, f"upload_{os.getpid()}_{filename}")
        
        # Save file
        with open(temp_path, 'wb') as f:
            f.write(file_data)
        
        return temp_path
    
    def detect_file_type(self, filename: str) -> str:
        """
        Detect file type from filename
        
        Args:
            filename: Name of the file
            
        Returns:
            'image' or 'pdf'
        """
        ext = filename.lower().split('.')[-1]
        
        if ext in ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp']:
            return 'image'
        elif ext == 'pdf':
            return 'pdf'
        else:
            raise ValueError(f"Unsupported file extension: {ext}")


# Singleton instance
_processor_instance = None

def get_file_processor() -> FileProcessor:
    """Get file processor singleton"""
    global _processor_instance
    if _processor_instance is None:
        _processor_instance = FileProcessor()
    return _processor_instance
