// Dutch B1 Exam Generator - Frontend JavaScript

// DOM Elements
const textInput = document.getElementById('textInput');
const numQuestionsSelect = document.getElementById('numQuestions');
const verifyQualityCheckbox = document.getElementById('verifyQuality');
const generateBtn = document.getElementById('generateBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const analysisSection = document.getElementById('analysisSection');
const resultsSection = document.getElementById('resultsSection');
const statusBar = document.getElementById('statusBar');
const charCount = document.getElementById('charCount');

// Action buttons
const copyBtn = document.getElementById('copyBtn');
const printBtn = document.getElementById('printBtn');
const newExamBtn = document.getElementById('newExamBtn');

// Content areas
const analysisContent = document.getElementById('analysisContent');
const originalText = document.getElementById('originalText');
const questionsContent = document.getElementById('questionsContent');
const answerKey = document.getElementById('answerKey');
const qualityScore = document.getElementById('qualityScore');
const qualityContent = document.getElementById('qualityContent');

// State
let currentExam = null;

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
    analyzeBtn.addEventListener('click', analyzeText);
    copyBtn.addEventListener('click', copyResults);
    printBtn.addEventListener('click', printResults);
    newExamBtn.addEventListener('click', resetForm);
}

// Update character count
function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = count;
    
    // Enable/disable buttons based on text length
    const isValid = count >= 50;
    generateBtn.disabled = !isValid;
    analyzeBtn.disabled = count < 20;
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
    analyzeBtn.disabled = true;
}

// Hide loading
function hideLoading() {
    loadingIndicator.classList.add('hidden');
    generateBtn.disabled = false;
    analyzeBtn.disabled = false;
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
    analysisSection.classList.add('hidden');
    
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
        showStatus('✅ تم توليد الامتحان بنجاح!', 'success');
        setTimeout(() => hideStatus(), 3000);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
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
    // Display original text
    originalText.textContent = exam.text || textInput.value;
    
    // Display analysis if available
    if (exam.analysis) {
        displayAnalysis(exam.analysis);
    }
    
    // Display questions
    const questions = exam.questions || [];
    questionsContent.innerHTML = questions.map((q, index) => {
        const difficultyClass = q.difficulty === 'easy' ? 'badge-easy' : 
                               q.difficulty === 'medium' ? 'badge-medium' : 'badge-hard';
        const difficultyText = q.difficulty === 'easy' ? 'سهل' : 
                              q.difficulty === 'medium' ? 'متوسط' : 'صعب';
        
        return `
            <div class="question-item">
                <div class="question-header">
                    <span class="question-number">السؤال ${q.id || index + 1}</span>
                    <div class="question-meta">
                        <span class="badge ${difficultyClass}">${difficultyText}</span>
                        <span class="badge" style="background: #E8F8F5; color: #16A085;">${q.type}</span>
                    </div>
                </div>
                
                <div class="question-text">${q.question_nl}</div>
                
                <div class="options">
                    ${q.options.map(opt => `
                        <div class="option ${opt.correct ? 'correct' : ''}">
                            <span class="option-label">${opt.id})</span>
                            ${opt.text}
                            ${opt.correct ? ' ✅' : ''}
                        </div>
                    `).join('')}
                </div>
                
                ${q.explanation ? `
                <div class="explanation">
                    <strong>💡 الشرح:</strong> ${q.explanation}
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Display answer key
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
    
    // Display quality score if available
    if (exam.verification) {
        const verification = exam.verification;
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
    } else {
        qualityScore.classList.add('hidden');
    }
    
    resultsSection.classList.remove('hidden');
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
    
    resultsSection.classList.add('hidden');
    analysisSection.classList.add('hidden');
    hideStatus();
    updateCharCount();
    
    textInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
