// Dutch B1 Exam Generator v2 - Frontend JavaScript
// With Test Mode and Word Translation on Hover

// DOM Elements
const textInput = document.getElementById('textInput');
const numQuestionsSelect = document.getElementById('numQuestions');
const verifyQualityCheckbox = document.getElementById('verifyQuality');
const generateBtn = document.getElementById('generateBtn');

const loadingIndicator = document.getElementById('loadingIndicator');

const resultsSection = document.getElementById('resultsSection');
const statusBar = document.getElementById('statusBar');
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
const analysisContent = document.getElementById('analysisContent');
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
let currentMode = 'study'; // 'study' or 'test'
let userAnswers = {};
let wordTranslations = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    setupEventListeners();
    updateCharCount();
});

// Setup Event Listeners
function setupEventListeners() {
    textInput.addEventListener('input', updateCharCount);
    generateBtn.addEventListener('click', generateExam);

    copyBtn.addEventListener('click', copyResults);
    printBtn.addEventListener('click', printResults);
    newExamBtn.addEventListener('click', resetForm);
    
    // Mode switching
    studyModeBtn.addEventListener('click', () => switchMode('study'));
    testModeBtn.addEventListener('click', () => switchMode('test'));
    submitTestBtn.addEventListener('click', submitTest);
}

// Switch between study and test modes
function switchMode(mode) {
    currentMode = mode;
    userAnswers = {};
    
    // Update button states
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
    
    // Re-render questions
    if (currentExam) {
        displayQuestions(currentExam.questions);
    }
}

// Update character count
function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = count;
    
    const isValid = count >= 50;
;

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
            showStatus('⚠️ تحذير: قد لا يعمل النظام بشكل صحيح. تحقق من إعدادات GEMINI_API_KEY', 'error');
        }
    } catch (error) {
        showStatus('❌ خطأ في الاتصال بالخادم', 'error');
    }
}

// Show status message
function showStatus(message, type = 'warning') {
    statusBar.className = `status-bar ${type}`;
    document.getElementById('statusText').textContent = message;
    statusBar.classList.remove('hidden');
}

// Hide status message
function hideStatus() {
    statusBar.classList.add('hidden');
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

// Analyze text
async function analyzeText() {
    const text = textInput.value.trim();
    
    if (text.length < 20) {
        showStatus('❌ النص قصير جداً. يجب أن يكون 20 حرفاً على الأقل', 'error');
        return;
    }
    
    showLoading();
    hideStatus();
    
    try {
        const response = await fetch('/api/analyze-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            throw new Error('فشل تحليل النص');
        }
        
        const analysis = await response.json();
        displayAnalysis(analysis);
        showStatus('✅ تم تحليل النص بنجاح', 'success');
        setTimeout(() => hideStatus(), 3000);
        
    } catch (error) {
        console.error('Error:', error);
        showStatus('❌ حدث خطأ أثناء تحليل النص', 'error');
    } finally {
        hideLoading();
    }
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
        
        displayExam(exam);
        
        // Load translations for the text
        await loadTranslations(exam.text || text);
        
        showStatus('✅ تم توليد الامتحان بنجاح!', 'success');
        setTimeout(() => hideStatus(), 3000);
        
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Load translations for text
async function loadTranslations(text) {
    translationLoading.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/translate-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            throw new Error('فشل تحميل الترجمات');
        }
        
        const data = await response.json();
        wordTranslations = data.word_translations || {};
        
        // Re-render text with translations
        displayTextWithTranslations(text);
        
    } catch (error) {
        console.error('Translation error:', error);
        // Display text without translations
        originalText.textContent = text;
    } finally {
        translationLoading.classList.add('hidden');
    }
}

// Display text with word translations on hover
function displayTextWithTranslations(text) {
    if (Object.keys(wordTranslations).length === 0) {
        originalText.textContent = text;
        return;
    }
    
    // Split text into words
    const words = text.split(/(\s+|[.,!?;:])/);
    
    let html = '';
    words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
        
        if (wordTranslations[cleanWord]) {
            // Word has translation - make it hoverable
            html += `<span class="word-tooltip">${word}<span class="tooltip-text">${wordTranslations[cleanWord]}</span></span>`;
        } else {
            // No translation - display as is
            html += word;
        }
    });
    
    originalText.innerHTML = html;
}

// Display analysis
function displayAnalysis(analysis) {
    analysisContent.innerHTML = `
        <div class="analysis-item">
            <strong>نوع النص:</strong> ${analysis.text_type || 'غير محدد'}
        </div>
        <div class="analysis-item">
            <strong>الموضوع الرئيسي:</strong> ${analysis.main_topic || 'غير محدد'}
        </div>
        <div class="analysis-item">
            <strong>مستوى الصعوبة:</strong> ${analysis.difficulty_level || 'B1'}
        </div>
        <div class="analysis-item">
            <strong>الطابع:</strong> ${analysis.tone || 'محايد'}
        </div>
        ${analysis.key_ideas && analysis.key_ideas.length > 0 ? `
        <div class="analysis-item">
            <strong>الأفكار الرئيسية:</strong>
            <ul>
                ${analysis.key_ideas.map(idea => `<li>${idea}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        ${analysis.key_words && analysis.key_words.length > 0 ? `
        <div class="analysis-item">
            <strong>الكلمات المفتاحية:</strong> ${analysis.key_words.join(', ')}
        </div>
        ` : ''}
    `;
    
    analysisSection.classList.remove('hidden');
}

// Display exam
function displayExam(exam) {
    // Display original text (will be updated with translations)
    originalText.textContent = exam.text || textInput.value;
    
    // Display analysis if available
    if (exam.analysis) {
        displayAnalysis(exam.analysis);
    }
    
    // Display questions
    displayQuestions(exam.questions || []);
    
    // Display answer key (only in study mode)
    displayAnswerKey(exam.questions || []);
    
    // Display quality score if available
    if (exam.verification) {
        displayQualityScore(exam.verification);
    } else {
        qualityScore.classList.add('hidden');
    }
    
    resultsSection.classList.remove('hidden');
}

// Display questions based on current mode
function displayQuestions(questions) {
    const isTestMode = currentMode === 'test';
    
    questionsContent.innerHTML = questions.map((q, index) => {
        const difficultyClass = q.difficulty === 'easy' ? 'badge-easy' : 
                               q.difficulty === 'medium' ? 'badge-medium' : 'badge-hard';
        const difficultyText = q.difficulty === 'easy' ? 'سهل' : 
                              q.difficulty === 'medium' ? 'متوسط' : 'صعب';
        
        const questionClass = isTestMode ? 'question-interactive' : '';
        
        return `
            <div class="question-item ${questionClass}" data-question-id="${q.id}">
                <div class="question-header">
                    <span class="question-number">السؤال ${q.id || index + 1}</span>
                    <div class="question-meta">
                        <span class="badge ${difficultyClass}">${difficultyText}</span>
                        <span class="badge" style="background: #E8F8F5; color: #16A085;">${q.type}</span>
                    </div>
                </div>
                
                <div class="question-text">${q.question_nl}</div>
                
                <div class="options">
                    ${q.options.map(opt => {
                        // In test mode: NEVER show correct answer
                        // In study mode: show correct answer
                        const showCorrect = !isTestMode && opt.correct;
                        const optionClass = showCorrect ? 'correct' : '';
                        const checkmark = showCorrect ? ' ✅' : '';
                        
                        return `
                            <div class="option ${optionClass}" 
                                 data-option-id="${opt.id}"
                                 data-correct="${opt.correct ? 'true' : 'false'}"
                                 ${isTestMode ? 'onclick="selectOption(this)"' : ''}>
                                <span class="option-label">${opt.id})</span>
                                ${opt.text}${checkmark}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${!isTestMode && q.explanation ? `
                <div class="explanation">
                    <strong>💡 الشرح:</strong> ${q.explanation}
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Select option in test mode
function selectOption(element) {
    if (currentMode !== 'test') return;
    
    const questionItem = element.closest('.question-item');
    const questionId = questionItem.dataset.questionId;
    const optionId = element.dataset.optionId;
    
    // Remove previous selection
    questionItem.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selection to clicked option
    element.classList.add('selected');
    
    // Store user answer
    userAnswers[questionId] = optionId;
}

// Submit test and show results
function submitTest() {
    if (Object.keys(userAnswers).length === 0) {
        showStatus('❌ يرجى الإجابة على الأسئلة أولاً', 'error');
        return;
    }
    
    const questions = currentExam.questions;
    let correctCount = 0;
    
    // Check answers and update display
    questions.forEach(q => {
        const questionItem = document.querySelector(`[data-question-id="${q.id}"]`);
        const userAnswer = userAnswers[q.id];
        const correctOption = q.options.find(opt => opt.correct);
        
        if (userAnswer === correctOption.id) {
            correctCount++;
            // Mark as correct
            const selectedOption = questionItem.querySelector(`[data-option-id="${userAnswer}"]`);
            selectedOption.classList.add('correct-answer');
        } else {
            // Mark user's answer as wrong
            if (userAnswer) {
                const selectedOption = questionItem.querySelector(`[data-option-id="${userAnswer}"]`);
                selectedOption.classList.add('wrong-answer');
            }
            // Show correct answer
            const correctOptionElement = questionItem.querySelector(`[data-option-id="${correctOption.id}"]`);
            correctOptionElement.classList.add('correct-answer');
        }
        
        // Show explanation
        if (q.explanation) {
            const explanationHtml = `
                <div class="explanation">
                    <strong>💡 الشرح:</strong> ${q.explanation}
                </div>
            `;
            questionItem.insertAdjacentHTML('beforeend', explanationHtml);
        }
    });
    
    // Calculate percentage
    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Display result
    let resultClass = '';
    let resultEmoji = '';
    let resultMessage = '';
    
    if (percentage >= 80) {
        resultClass = 'success';
        resultEmoji = '🎉';
        resultMessage = 'ممتاز! أداء رائع!';
    } else if (percentage >= 60) {
        resultClass = 'warning';
        resultEmoji = '👍';
        resultMessage = 'جيد! استمر في التحسين';
    } else {
        resultClass = 'danger';
        resultEmoji = '💪';
        resultMessage = 'تحتاج إلى مزيد من الممارسة';
    }
    
    testResult.innerHTML = `
        <h3>${resultEmoji} نتيجة الاختبار</h3>
        <div class="score">${correctCount} / ${totalQuestions}</div>
        <div class="percentage">${percentage}%</div>
        <p style="margin-top: 15px; font-size: 1.2rem;">${resultMessage}</p>
    `;
    testResult.classList.remove('hidden');
    
    // Hide submit button
    submitTestBtn.classList.add('hidden');
    
    // Scroll to result
    testResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Display answer key
function displayAnswerKey(questions) {
    const answers = questions.map(q => {
        const correctOption = q.options.find(opt => opt.correct);
        return {
            number: q.id,
            answer: correctOption ? correctOption.id : '?'
        };
    });
    
    answerKey.innerHTML = `
        <div class="answer-grid">
            ${answers.map(a => `
                <div class="answer-item">
                    <strong>السؤال ${a.number}</strong>
                    <div class="answer-value">${a.answer}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Display quality score
function displayQualityScore(verification) {
    qualityContent.innerHTML = `
        <div class="quality-item">
            <strong>الدرجة:</strong> ${verification.quality_score || 'N/A'}
        </div>
        ${verification.issues_found && verification.issues_found.length > 0 ? `
        <div class="quality-item">
            <strong>الملاحظات:</strong>
            <ul>
                ${verification.issues_found.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        ${verification.suggestions && verification.suggestions.length > 0 ? `
        <div class="quality-item">
            <strong>الاقتراحات:</strong>
            <ul>
                ${verification.suggestions.map(sug => `<li>${sug}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        <div class="quality-item">
            <strong>الحالة:</strong> ${verification.approved ? '✅ معتمد' : '⚠️ يحتاج مراجعة'}
        </div>
    `;
    qualityScore.classList.remove('hidden');
}

// Copy results to clipboard
function copyResults() {
    if (!currentExam) return;
    
    let text = `📝 امتحان القراءة B1\n\n`;
    text += `📖 النص:\n${currentExam.text}\n\n`;
    text += `❓ الأسئلة:\n\n`;
    
    currentExam.questions.forEach((q, index) => {
        text += `${index + 1}. ${q.question_nl}\n`;
        q.options.forEach(opt => {
            text += `   ${opt.id}) ${opt.text}${opt.correct ? ' ✅' : ''}\n`;
        });
        text += `\n`;
    });
    
    text += `\n🔑 مفتاح الإجابات:\n`;
    currentExam.questions.forEach(q => {
        const correct = q.options.find(opt => opt.correct);
        text += `السؤال ${q.id}: ${correct ? correct.id : '?'}\n`;
    });
    
    navigator.clipboard.writeText(text).then(() => {
        showStatus('✅ تم نسخ النتائج إلى الحافظة', 'success');
        setTimeout(() => hideStatus(), 2000);
    }).catch(() => {
        showStatus('❌ فشل النسخ', 'error');
    });
}

// Print results
function printResults() {
    window.print();
}

// Reset form
function resetForm() {
    textInput.value = '';
    numQuestionsSelect.value = '7';
    verifyQualityCheckbox.checked = true;
    currentExam = null;
    userAnswers = {};
    wordTranslations = {};
    currentMode = 'study';
    
    studyModeBtn.classList.add('active');
    testModeBtn.classList.remove('active');
    
    resultsSection.classList.add('hidden');
    hideStatus();
    updateCharCount();
    
    textInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
