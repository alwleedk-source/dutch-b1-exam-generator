// Simplified app.js for index_v3.html
// Only includes functionality for elements that exist in index_v3.html

// DOM Elements that exist in index_v3.html
const textInput = document.getElementById('textInput');
const numQuestionsSelect = document.getElementById('numQuestions');
const generateBtn = document.getElementById('generateBtn');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');

// State
let currentExam = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDailyLimit();
});

// Load daily limit info
async function loadDailyLimit() {
    try {
        const response = await fetch('/api/daily-limit');
        if (!response.ok) {
            console.warn('Failed to load daily limit');
            return;
        }
        
        const data = await response.json();
        const remainingEl = document.getElementById('remainingExams');
        const dailyLimitWarning = document.getElementById('dailyLimitWarning');
        const textWarnings = document.getElementById('textWarnings');
        
        if (remainingEl) {
            remainingEl.textContent = data.remaining;
        }
        
        // Show warning if limit reached
        if (data.remaining === 0) {
            if (dailyLimitWarning) {
                dailyLimitWarning.classList.remove('hidden');
                dailyLimitWarning.classList.add('flex');
            }
            if (textWarnings) {
                textWarnings.classList.remove('hidden');
            }
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    } catch (error) {
        console.error('Error loading daily limit:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    if (generateBtn) {
        generateBtn.addEventListener('click', generateExam);
    }
}

// Generate exam
async function generateExam() {
    const text = textInput ? textInput.value.trim() : '';
    const numQuestions = numQuestionsSelect ? parseInt(numQuestionsSelect.value) : 5;
    
    if (text.length < 50) {
        alert('❌ النص قصير جداً. يجب أن يكون 50 حرفاً على الأقل');
        return;
    }
    
    // Show loading state
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> جاري التوليد...';
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    try {
        const response = await fetch('/api/generate-exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                num_questions: numQuestions,
                verify_quality: false  // Default to false since checkbox doesn't exist
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'فشل توليد الامتحان');
        }
        
        const exam = await response.json();
        currentExam = exam;
        
        // Auto-save exam
        const examId = await saveExam(exam, text);
        
        // Reload daily limit
        await loadDailyLimit();
        
        if (examId) {
            // Redirect to exam view page
            window.location.href = `/exam_view.html?id=${examId}`;
        } else {
            alert('✅ تم توليد الامتحان لكن فشل الحفظ!');
        }
        
    } catch (error) {
        console.error('Error generating exam:', error);
        alert(`❌ خطأ: ${error.message}`);
    } finally {
        // Reset button
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i data-lucide="sparkles" class="w-5 h-5"></i> توليد الامتحان';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
}

// Save exam to database
async function saveExam(exam, originalText) {
    try {
        const response = await fetch('/api/save-exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: originalText,
                questions: exam.questions || [],
                word_translations: exam.word_translations || {},
                verification: exam.verification || null
            })
        });
        
        if (!response.ok) {
            console.error('Failed to save exam');
            return null;
        }
        
        const data = await response.json();
        return data.exam_id;
    } catch (error) {
        console.error('Error saving exam:', error);
        return null;
    }
}
