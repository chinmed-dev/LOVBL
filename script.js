// ========================================
// محرر التطبيقات - App Editor Logic
// ========================================

// تخزين البيانات في LocalStorage
const STORAGE_KEY = 'appEditorData';

// ========== DOM Elements ==========
const promptInput = document.getElementById('promptInput');
const charCount = document.getElementById('charCount');
const preview = document.getElementById('preview');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const refreshBtn = document.getElementById('refreshBtn');

// ========== Event Listeners ==========
promptInput.addEventListener('input', handleInput);
promptInput.addEventListener('keydown', handleKeydown);
saveBtn.addEventListener('click', saveToFile);
resetBtn.addEventListener('click', resetData);
refreshBtn.addEventListener('click', updatePreview);

// ========== Main Functions ==========

/**
 * معالج الإدخال - تحديث العداد والمعاينة
 */
function handleInput(e) {
    const text = e.target.value;
    charCount.textContent = text.length;
    
    // حفظ تلقائي
    saveToLocalStorage();
    
    // تحديث المعاينة
    updatePreview();
}

/**
 * اختصارات لوحة المفاتيح
 */
function handleKeydown(e) {
    // Ctrl/Cmd + S: حفظ
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveToFile();
    }
    
    // Ctrl/Cmd + R: إعادة تعيين
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetData();
    }
    
    // Ctrl/Cmd + E: تحديث
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        updatePreview();
    }
}

/**
 * تحديث المعاينة
 */
function updatePreview() {
    const text = promptInput.value.trim();
    
    if (!text) {
        preview.innerHTML = `
            <div class="empty-state">
                <p>🎨 ابدأ بكتابة وصف تطبيقك</p>
                <p class="secondary">سيظهر تصميم معاينة تطبيقك هنا</p>
            </div>
        `;
        return;
    }
    
    // استخراج البيانات من النص
    const appData = extractAppData(text);
    
    // عرض المعاينة
    preview.innerHTML = generatePreviewHTML(appData);
}

/**
 * استخراج بيانات التطبيق من وصف النص
 */
function extractAppData(text) {
    const data = {
        name: extractAppName(text),
        description: text,
        features: extractFeatures(text),
        technologies: extractTechnologies(text),
        difficulty: calculateDifficulty(text),
        estimatedTime: estimateTime(text),
        suggestions: generateSuggestions(text)
    };
    
    return data;
}

/**
 * استخراج اسم التطبيق
 */
function extractAppName(text) {
    const lines = text.split('\n');
    
    // البحث عن أول سطر يحتوي على كلمات مميزة
    for (const line of lines) {
        if (line.length > 5 && line.length < 100) {
            // إزالة الكلمات الشائعة
            let name = line
                .replace(/أنشئ|create|build|make|app|application|تطبيق/gi, '')
                .replace(/لي|لك|للمستخدم|for|the/gi, '')
                .trim();
            
            if (name.length > 3) {
                return name.substring(0, 50);
            }
        }
    }
    
    return 'تطبيق جديد';
}

/**
 * استخراج الميزات من النص
 */
function extractFeatures(text) {
    const features = [];
    
    // البحث عن النقاط (bullets)
    const bulletRegex = /[-•*]\s*([^-•*\n]+)/g;
    let match;
    
    while ((match = bulletRegex.exec(text)) !== null) {
        const feature = match[1].trim();
        if (feature.length > 3 && feature.length < 200) {
            features.push(feature);
        }
    }
    
    // إذا لم نجد نقاطاً، استخرج الجمل الطويلة
    if (features.length === 0) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        sentences.forEach(sentence => {
            const cleaned = sentence.trim();
            if (cleaned.length > 10 && cleaned.length < 200) {
                features.push(cleaned);
            }
        });
    }
    
    return features.slice(0, 8); // حد أقصى 8 ميزات
}

/**
 * استخراج التقنيات المستخدمة
 */
function extractTechnologies(text) {
    const techs = new Set();
    const techPatterns = {
        'React': /react|reactjs/gi,
        'Vue': /vue|vuejs/gi,
        'Angular': /angular/gi,
        'JavaScript': /javascript|js|node|nodejs/gi,
        'TypeScript': /typescript/gi,
        'Python': /python/gi,
        'PHP': /php/gi,
        'Java': /java(?!script)/gi,
        'C#': /c#|csharp/gi,
        'Firebase': /firebase|firestore/gi,
        'MongoDB': /mongodb/gi,
        'PostgreSQL': /postgresql|postgres/gi,
        'MySQL': /mysql/gi,
        'HTML': /html/gi,
        'CSS': /css/gi,
        'Tailwind': /tailwind/gi,
        'Bootstrap': /bootstrap/gi,
        'API REST': /rest api|restful/gi,
        'GraphQL': /graphql/gi,
        'Docker': /docker/gi,
        'AWS': /aws|amazon/gi,
        'GCP': /gcp|google cloud/gi,
        'Azure': /azure|microsoft/gi,
        'Flutter': /flutter/gi,
        'React Native': /react native/gi,
        'Kotlin': /kotlin/gi,
        'Swift': /swift/gi
    };
    
    for (const [tech, pattern] of Object.entries(techPatterns)) {
        if (pattern.test(text)) {
            techs.add(tech);
        }
    }
    
    // إضافة تقنيات افتراضية
    if (techs.size === 0) {
        techs.add('HTML/CSS');
        techs.add('JavaScript');
    }
    
    return Array.from(techs).slice(0, 6);
}

/**
 * حساب مستوى التعقيد
 */
function calculateDifficulty(text) {
    const text_lower = text.toLowerCase();
    let score = 0;
    
    // كلمات تزيد التعقيد
    const advancedKeywords = [
        'api', 'database', 'authentication', 'مصادقة',
        'real-time', 'socket', 'payment', 'دفع',
        'machine learning', 'ai', 'tls', 'encryption', 'تشفير',
        'microservices', 'cluster', 'distributed'
    ];
    
    advancedKeywords.forEach(keyword => {
        if (text_lower.includes(keyword)) score += 2;
    });
    
    // كلمات متوسطة
    const mediumKeywords = [
        'form', 'validation', 'filter', 'search', 'بحث',
        'dashboard', 'chart', 'graphs', 'export', 'import'
    ];
    
    mediumKeywords.forEach(keyword => {
        if (text_lower.includes(keyword)) score += 1;
    });
    
    // عدد الميزات
    const features = extractFeatures(text);
    score += features.length * 0.5;
    
    // تحديد المستوى
    if (score >= 10) return { level: 'متقدم', emoji: '🔴', color: '#ef4444' };
    if (score >= 5) return { level: 'متوسط', emoji: '🟡', color: '#f59e0b' };
    return { level: 'مبتدئ', emoji: '🟢', color: '#10b981' };
}

/**
 * تقدير الوقت المطلوب
 */
function estimateTime(text) {
    const difficulty = calculateDifficulty(text);
    const featureCount = extractFeatures(text).length;
    
    let hours = featureCount * 2;
    
    if (difficulty.level === 'مبتدئ') {
        hours = Math.max(4, hours);
    } else if (difficulty.level === 'متوسط') {
        hours = Math.max(20, hours);
    } else {
        hours = Math.max(40, hours);
    }
    
    const days = Math.ceil(hours / 8);
    
    return {
        hours: Math.round(hours),
        days: days,
        formatted: `${days} أيام (${Math.round(hours)} ساعة)`
    };
}

/**
 * توليد الاقتراحات
 */
function generateSuggestions(text) {
    const suggestions = [];
    const text_lower = text.toLowerCase();
    
    // اقتراحات بناءً على المحتوى
    if (!text_lower.includes('test')) {
        suggestions.push('أضف اختبارات محاسبية (Unit Tests)');
    }
    
    if (!text_lower.includes('documentation') && !text_lower.includes('توثيق')) {
        suggestions.push('أنشئ توثيقاً شاملة للـ API');
    }
    
    if (!text_lower.includes('security') && !text_lower.includes('تأمين')) {
        suggestions.push('اهتم بمسائل الأمان والحماية');
    }
    
    if (!text_lower.includes('cache') && !text_lower.includes('performance')) {
        suggestions.push('حسّن الأداء بـ Caching');
    }
    
    if (!text_lower.includes('responsive') && !text_lower.includes('mobile')) {
        suggestions.push('تأكد من الاستجابة على الأجهزة المختلفة');
    }
    
    if (!text_lower.includes('error') && !text_lower.includes('handling')) {
        suggestions.push('أضف معالجة شاملة للأخطاء');
    }
    
    return suggestions.slice(0, 4);
}

/**
 * توليد HTML المعاينة
 */
function generatePreviewHTML(appData) {
    const { name, features, technologies, difficulty, estimatedTime, suggestions } = appData;
    
    let html = '<div class="preview-content">';
    
    // اسم التطبيق
    html += `
        <div class="preview-section">
            <div class="section-title">
                📦 ${name}
            </div>
        </div>
    `;
    
    // الميزات
    if (features.length > 0) {
        html += `
            <div class="preview-section">
                <div class="section-title">✨ الميزات الأساسية</div>
                <ul class="section-list">
        `;
        features.forEach(feature => {
            html += `<li>${feature}</li>`;
        });
        html += `
                </ul>
            </div>
        `;
    }
    
    // التقنيات
    if (technologies.length > 0) {
        html += `
            <div class="preview-section">
                <div class="section-title">🛠️ التقنيات المقترحة</div>
                <div class="section-content">
        `;
        technologies.forEach(tech => {
            html += `<span class="tech-tag">${tech}</span>`;
        });
        html += `
                </div>
            </div>
        `;
    }
    
    // مستوى التعقيد
    html += `
        <div class="preview-section">
            <div class="section-title">
                ${difficulty.emoji} مستوى التعقيد: <strong>${difficulty.level}</strong>
            </div>
            <div class="section-content">
                الوقت المتوقع: <strong>${estimatedTime.formatted}</strong>
            </div>
        </div>
    `;
    
    // الاقتراحات
    if (suggestions.length > 0) {
        html += `
            <div class="preview-section">
                <div class="section-title">💡 الاقتراحات</div>
                <ul class="section-list">
        `;
        suggestions.forEach(suggestion => {
            html += `<li>${suggestion}</li>`;
        });
        html += `
                </ul>
            </div>
        `;
    }
    
    html += '</div>';
    
    return html;
}

/**
 * حفظ إلى الملف (Markdown)
 */
function saveToFile() {
    const text = promptInput.value.trim();
    
    if (!text) {
        alert('⚠️ الرجاء كتابة وصف التطبيق أولاً');
        return;
    }
    
    const appData = extractAppData(text);
    
    // توليد محتوى Markdown
    let markdown = `# 📱 ${appData.name}\n\n`;
    markdown += `## 📝 الوصف\n${appData.description}\n\n`;
    
    if (appData.features.length > 0) {
        markdown += `## ✨ الميزات\n`;
        appData.features.forEach(f => {
            markdown += `- ${f}\n`;
        });
        markdown += '\n';
    }
    
    if (appData.technologies.length > 0) {
        markdown += `## 🛠️ التقنيات\n`;
        appData.technologies.forEach(t => {
            markdown += `- ${t}\n`;
        });
        markdown += '\n';
    }
    
    markdown += `## 📊 المعلومات\n`;
    markdown += `- **المستوى**: ${appData.difficulty.level}\n`;
    markdown += `- **الوقت المتوقع**: ${appData.estimatedTime.formatted}\n\n`;
    
    if (appData.suggestions.length > 0) {
        markdown += `## 💡 الاقتراحات\n`;
        appData.suggestions.forEach(s => {
            markdown += `- ${s}\n`;
        });
    }
    
    // تحميل الملف
    downloadFile(markdown, `${appData.name}.md`);
    
    showNotification('✅ تم حفظ الملف بنجاح!');
}

/**
 * تحميل ملف
 */
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/markdown; charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * إعادة تعيين البيانات
 */
function resetData() {
    if (confirm('هل أنت متأكد من إعادة التعيين؟ سيتم حذف جميع البيانات.')) {
        promptInput.value = '';
        charCount.textContent = '0';
        localStorage.removeItem(STORAGE_KEY);
        updatePreview();
        showNotification('🔄 تم إعادة التعيين');
    }
}

/**
 * حفظ في LocalStorage
 */
function saveToLocalStorage() {
    const data = {
        content: promptInput.value,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * تحميل من LocalStorage
 */
function loadFromLocalStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            promptInput.value = data.content;
            charCount.textContent = data.content.length;
            updatePreview();
        } catch (e) {
            console.error('خطأ في تحميل البيانات:', e);
        }
    }
}

/**
 * عرض إشعار
 */
function showNotification(message) {
    // يمكن تحسين هذا لاحقاً بإضافة مكتبة إشعارات
    console.log(message);
}

// ========== Initialization ==========
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
});

// حفظ عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
});
