# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-nld \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
# Use PORT environment variable from Railway, default to 8000
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
