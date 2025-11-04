// Dutch B1 Exam Generator - Fixed Version
// With proper text direction, formatting, translations, and options

// DOM Elements
const textInput = document.getElementById('textInput');
const numQuestionsSelect = document.getElementById('numQuestions');
const verifyQualityCheckbox = document.getElementById('verifyQuality');
const generateBtn = document.getElementById('generateBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const statusBadge = document.getElementById('statusBadge');
const charCount = document.getElementById('charCount');

// Action buttons
const copyBtn = document.getElementById('copyBtn');
const printBtn = document.getElementById('printBtn');
const newExamBtn = document.getElementById('newExamBtn');

// Mode buttons
const studyModeBtn = document.getElementById('studyModeBtn');
const testModeBtn = document.getElementById('testModeBtn');
const submitTestBtn = document.getElementById('submitTestBtn');

// Content areas
const originalText = document.getElementById('originalText');
const questionsContent = document.getElementById('questionsContent');
const answerKey = document.getElementById('answerKey');
const answerKeySection = document.getElementById('answerKeySection');
const qualityScore = document.getElementById('qualityScore');
const qualityContent = document.getElementById('qualityContent');
const testResult = document.getElementById('testResult');
const translationLoading = document.getElementById('translationLoading');

// State
let currentExam = null;
let currentMode = 'test';
let userAnswers = {};
let wordTranslations = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    setupEventListeners();
    updateCharCount();
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
        const generateBtn = document.getElementById('generateBtn');
        
        if (remainingEl) {
            remainingEl.textContent = data.remaining;
        }
        
        // Show warning if limit reached
        if (data.remaining === 0 && dailyLimitWarning) {
            dailyLimitWarning.classList.remove('hidden');
            dailyLimitWarning.classList.add('flex');
            textWarnings.classList.remove('hidden');
            generateBtn.disabled = true;
            generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } catch (error) {
        console.error('Error loading daily limit:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    textInput.addEventListener('input', updateCharCount);
    generateBtn.addEventListener('click', generateExam);
    copyBtn.addEventListener('click', copyResults);
    printBtn.addEventListener('click', printResults);
    newExamBtn.addEventListener('click', resetForm);
    studyModeBtn.addEventListener('click', () => switchMode('study'));
    testModeBtn.addEventListener('click', () => switchMode('test'));
    submitTestBtn.addEventListener('click', submitTest);
}

// Switch between study and test modes
function switchMode(mode) {
    currentMode = mode;
    userAnswers = {};
    
    if (mode === 'study') {
        studyModeBtn.classList.add('active');
        testModeBtn.classList.remove('active');
        answerKeySection.classList.remove('hidden');
        submitTestBtn.classList.add('hidden');
        testResult.classList.add('hidden');
    } else {
        studyModeBtn.classList.remove('active');
        testModeBtn.classList.add('active');
        answerKeySection.classList.add('hidden');
        submitTestBtn.classList.remove('hidden');
        testResult.classList.add('hidden');
    }
    
    if (currentExam) {
        displayQuestions(currentExam.questions);
    }
}

// Update character count and show warnings
function updateCharCount() {
    const text = textInput.value;
    const charCountNum = text.length;
    const wordCountNum = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    // Update counts
    const charCountEl = document.getElementById('charCount');
    const wordCountEl = document.getElementById('wordCount');
    if (charCountEl) charCountEl.textContent = charCountNum;
    if (wordCountEl) wordCountEl.textContent = wordCountNum;
    
    // Show/hide warnings
    const textWarnings = document.getElementById('textWarnings');
    const charLimitWarning = document.getElementById('charLimitWarning');
    const charMinWarning = document.getElementById('charMinWarning');
    const generateBtn = document.getElementById('generateBtn');
    
    let hasWarning = false;
    
    // Character limit warning (5000 chars)
    if (charCountNum > 5000) {
        charLimitWarning.classList.remove('hidden');
        charLimitWarning.classList.add('flex');
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        hasWarning = true;
    } else {
        charLimitWarning.classList.add('hidden');
        charLimitWarning.classList.remove('flex');
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    // Minimum words warning (150 words recommended)
    if (wordCountNum > 0 && wordCountNum < 150) {
        charMinWarning.classList.remove('hidden');
        charMinWarning.classList.add('flex');
        hasWarning = true;
    } else {
        charMinWarning.classList.add('hidden');
        charMinWarning.classList.remove('flex');
    }
    
    // Show/hide warnings container
    if (hasWarning) {
        textWarnings.classList.remove('hidden');
    } else {
        textWarnings.classList.add('hidden');
    }
}

// Check API health
async function checkHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        
        if (data.status === 'healthy' && data.agent_ready && data.gemini_configured) {
            showStatus('✅ النظام جاهز', 'success');
            setTimeout(() => hideStatus(), 3000);
        } else {
            showStatus('⚠️ تحذير: قد لا يعمل النظام بشكل صحيح', 'error');
        }
    } catch (error) {
        showStatus('❌ خطأ في الاتصال بالخادم', 'error');
    }
}

// Show status message
function showStatus(message, type = 'warning') {
    if (!statusBadge) return;
    
    const colors = {
        'success': 'bg-green-100 text-green-800',
        'error': 'bg-red-100 text-red-800',
        'warning': 'bg-yellow-100 text-yellow-800'
    };
    
    statusBadge.className = `inline-flex items-center mt-6 px-4 py-2 rounded-full text-sm font-medium ${colors[type] || colors.warning}`;
    statusBadge.textContent = message;
}

// Hide status message
function hideStatus() {
    if (!statusBadge) return;
    statusBadge.className = 'inline-flex items-center mt-6 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium';
    statusBadge.innerHTML = '<svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>النظام جاهز';
}

// Show loading
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    generateBtn.disabled = true;
}

// Hide loading
function hideLoading() {
    loadingIndicator.classList.add('hidden');
    generateBtn.disabled = false;
}

// Generate exam
async function generateExam() {
    const text = textInput.value.trim();
    const numQuestions = parseInt(numQuestionsSelect.value);
    const verifyQuality = verifyQualityCheckbox.checked;
    
    if (text.length < 50) {
        showStatus('❌ النص قصير جداً. يجب أن يكون 50 حرفاً على الأقل', 'error');
        return;
    }
    
    showLoading();
    hideStatus();
    resultsSection.classList.add('hidden');
    
    try {
        const response = await fetch('/api/generate-exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                num_questions: numQuestions,
                verify_quality: verifyQuality
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
            showStatus('✅ تم توليد الامتحان لكن فشل الحفظ!', 'error');
            displayExam(exam);
            await loadTranslations(exam.text || text);
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Load translations
async function loadTranslations(text) {
    if (!translationLoading) return;
    
    translationLoading.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            wordTranslations = await response.json();
            applyTranslations();
        }
    } catch (error) {
        console.error('Translation error:', error);
    } finally {
        translationLoading.classList.add('hidden');
    }
}

// Apply translations to text
function applyTranslations() {
    if (!originalText || !wordTranslations || Object.keys(wordTranslations).length === 0) return;
    
    let html = originalText.textContent;
    
    // Sort words by length (longest first) to avoid partial matches
    const words = Object.keys(wordTranslations).sort((a, b) => b.length - a.length);
    
    words.forEach(word => {
        const translation = wordTranslations[word];
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        html = html.replace(regex, `<span class="translatable-word" data-translation="${translation}">$1</span>`);
    });
    
    originalText.innerHTML = html;
    
    // Add hover event listeners
    document.querySelectorAll('.translatable-word').forEach(el => {
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
    });
}

// Show tooltip
function showTooltip(e) {
    const translation = e.target.dataset.translation;
    if (!translation) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'translation-tooltip';
    tooltip.textContent = translation;
    tooltip.style.position = 'absolute';
    tooltip.style.background = '#2C3E50';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '14px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - 40) + 'px';
    
    document.body.appendChild(tooltip);
    e.target._tooltip = tooltip;
}

// Hide tooltip
function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        delete e.target._tooltip;
    }
}

// Display exam
function displayExam(exam) {
    // Format and display original text with proper direction
    displayOriginalText(exam.text || textInput.value);
    
    // Display questions
    displayQuestions(exam.questions || []);
    
    // Display answer key
    displayAnswerKey(exam.questions || []);
    
    // Display quality score
    if (exam.verification) {
        displayQualityScore(exam.verification);
    } else {
        qualityScore.classList.add('hidden');
    }
    
    resultsSection.classList.remove('hidden');
    
    // Set test mode as default
    switchMode('test');
}

// Display original text with formatting
function displayOriginalText(text) {
    // Split text into lines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    // Book-style formatting
    let html = `
        <div dir="ltr" style="
            text-align: left;
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.9;
            padding: 2rem;
            background: white;
            max-width: 800px;
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
        ">
    `;
    
    let currentParagraph = [];
    
    lines.forEach((line, index) => {
        // Detect titles
        const isTitle = (
            line.length < 80 && 
            (line.endsWith(':') || 
             line.split(' ').length < 8 || 
             /^[A-Z][a-z]/.test(line))
        );
        
        if (isTitle) {
            // Flush paragraph
            if (currentParagraph.length > 0) {
                html += `
                    <p style="
                        margin: 1.5rem 0;
                        color: #2C3E50;
                        text-align: justify;
                        font-size: 1.1rem;
                        text-indent: 2em;
                        line-height: 1.9;
                    ">${currentParagraph.join(' ')}</p>
                `;
                currentParagraph = [];
            }
            // Add title
            html += `
                <h3 style="
                    font-size: 1.8rem;
                    font-weight: bold;
                    margin: 2rem 0 1rem 0;
                    color: #1a1a1a;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 0.5rem;
                ">${line}</h3>
            `;
        } else {
            currentParagraph.push(line);
            
            // Check if we should flush (empty line ahead or last line)
            const nextLine = lines[index + 1];
            const shouldFlush = !nextLine || index === lines.length - 1;
            
            if (shouldFlush && currentParagraph.length > 0) {
                html += `
                    <p style="
                        margin: 1.5rem 0;
                        color: #2C3E50;
                        text-align: justify;
                        font-size: 1.1rem;
                        text-indent: 2em;
                        line-height: 1.9;
                    ">${currentParagraph.join(' ')}</p>
                `;
                currentParagraph = [];
            }
        }
    });
    
    html += '</div>';
    
    originalText.innerHTML = html;
}

// Display questions with options
function displayQuestions(questions) {
    const isTestMode = currentMode === 'test';
    
    let html = '<div dir="rtl" style="text-align: right;">';
    
    questions.forEach((q, index) => {
        html += `
            <div class="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-lg font-bold text-gray-800">السؤال ${index + 1}</span>
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${q.type || 'اختيار من متعدد'}</span>
                </div>
                
                <div dir="ltr" class="text-left mb-4 text-gray-800 font-bold text-lg">
                    ${q.question_nl}
                </div>
                
                <div class="space-y-3">
                    ${q.options.map((opt, optIndex) => {
                        const isCorrect = opt.correct;
                        const showAnswer = !isTestMode && isCorrect;
                        const optionId = `q${index}_opt${optIndex}`;
                        
                        return `
                            <label class="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${showAnswer ? 'border-green-500 bg-green-50' : 'border-gray-200'}">
                                <input type="radio" name="question_${index}" value="${optIndex}" class="w-5 h-5 text-blue-600" ${isTestMode ? '' : 'disabled'}>
                                <span dir="ltr" class="mr-3 text-left flex-1">${opt.text}</span>
                                ${showAnswer ? '<span class="text-green-600 font-bold">✓</span>' : ''}
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    questionsContent.innerHTML = html;
}

// Display answer key
function displayAnswerKey(questions) {
    let html = '<div class="space-y-2">';
    
    questions.forEach((q, index) => {
        const correctOption = q.options.find(opt => opt.correct);
        const correctIndex = q.options.indexOf(correctOption);
        
        html += `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium">السؤال ${index + 1}</span>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                    الخيار ${correctIndex + 1}
                </span>
            </div>
        `;
    });
    
    html += '</div>';
    
    answerKey.innerHTML = html;
}

// Display quality score
function displayQualityScore(verification) {
    if (!verification) return;
    
    const score = verification.score || 0;
    const scoreClass = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
    
    qualityContent.innerHTML = `
        <div class="text-center mb-4">
            <div class="text-5xl font-bold ${scoreClass}">${score}%</div>
            <div class="text-gray-600 mt-2">درجة الجودة</div>
        </div>
        ${verification.issues_found && verification.issues_found.length > 0 ? `
            <div class="mt-4">
                <h4 class="font-bold mb-2">ملاحظات:</h4>
                <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
                    ${verification.issues_found.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;
    
    qualityScore.classList.remove('hidden');
}

// Submit test
function submitTest() {
    if (!currentExam || !currentExam.questions) return;
    
    // Collect user answers
    const answers = [];
    let correctCount = 0;
    
    currentExam.questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="question_${index}"]:checked`);
        const selectedIndex = selected ? parseInt(selected.value) : -1;
        const correctIndex = q.options.findIndex(opt => opt.correct);
        const isCorrect = selectedIndex === correctIndex;
        
        if (isCorrect) correctCount++;
        
        answers.push({
            questionIndex: index,
            selectedIndex,
            correctIndex,
            isCorrect
        });
    });
    
    // Calculate score
    const totalQuestions = currentExam.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Display results
    const scoreClass = scorePercentage >= 70 ? 'text-green-600' : scorePercentage >= 50 ? 'text-yellow-600' : 'text-red-600';
    
    testResult.innerHTML = `
        <div class="bg-white rounded-xl p-8 text-center">
            <div class="text-6xl font-bold ${scoreClass} mb-4">${scorePercentage}%</div>
            <div class="text-2xl font-bold mb-2">النتيجة: ${correctCount} من ${totalQuestions}</div>
            <div class="text-gray-600 mb-6">
                ${scorePercentage >= 70 ? '🎉 ممتاز!' : scorePercentage >= 50 ? '👍 جيد' : '📚 يحتاج لمزيد من الدراسة'}
            </div>
            <button onclick="switchMode('study')" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                عرض الإجابات الصحيحة
            </button>
        </div>
    `;
    
    testResult.classList.remove('hidden');
    submitTestBtn.classList.add('hidden');
    testResult.scrollIntoView({ behavior: 'smooth' });
}

// Copy results
function copyResults() {
    alert('سيتم إضافة هذه الميزة قريباً');
}

// Print results
function printResults() {
    window.print();
}

// Reset form
function resetForm() {
    textInput.value = '';
    updateCharCount();
    resultsSection.classList.add('hidden');
    currentExam = null;
    wordTranslations = {};
}


// Save exam
async function saveExam(exam, originalText) {
    try {
        const response = await fetch('/api/save-exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: originalText,
                questions: exam.questions,
                word_translations: wordTranslations,
                verification: exam.verification
            })
        });
        
        if (!response.ok) {
            console.error('Failed to save exam');
            return null;
        }
        
        const result = await response.json();
        return result.exam_id;
    } catch (error) {
        console.error('Error saving exam:', error);
        return null;
    }
}
