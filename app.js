/**
 * FocusFlow - تطبيق إدارة الوقت والتركيز
 * يحل مشكلة الإنتاجية وإدارة الوقت
 */

// ==================== البيانات ====================
const AppData = {
    tasks: JSON.parse(localStorage.getItem('ff_tasks')) || [],
    habits: JSON.parse(localStorage.getItem('ff_habits')) || [],
    settings: JSON.parse(localStorage.getItem('ff_settings')) || {
        focusDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLong: 4,
        notificationSound: 'bell',
        ambientSound: 'none'
    },
    stats: JSON.parse(localStorage.getItem('ff_stats')) || {
        totalFocusMinutes: 0,
        totalSessions: 0,
        tasksCompleted: 0,
        currentStreak: 0,
        lastActiveDate: null,
        weeklyData: [0, 0, 0, 0, 0, 0, 0]
    },
    rewards: JSON.parse(localStorage.getItem('ff_rewards')) || {
        points: 0,
        level: 1,
        achievements: [],
        history: []
    }
};

// حفظ البيانات
function saveData() {
    localStorage.setItem('ff_tasks', JSON.stringify(AppData.tasks));
    localStorage.setItem('ff_habits', JSON.stringify(AppData.habits));
    localStorage.setItem('ff_settings', JSON.stringify(AppData.settings));
    localStorage.setItem('ff_stats', JSON.stringify(AppData.stats));
    localStorage.setItem('ff_rewards', JSON.stringify(AppData.rewards));
}

// ==================== نظام المكافآت ====================
const REWARDS_CONFIG = {
    pointsPerHabit: 10,
    pointsPerTask: 15,
    pointsPerFocusSession: 20,
    pointsPerStreak: 5,
    levelThresholds: [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000],
    levelNames: ['مبتدئ', 'ممارس', 'منتظم', 'متحمس', 'محترف', 'خبير', 'متقن', 'سيد', 'أسطورة', 'خارق'],
    achievements: [
        { id: 'first_habit', name: 'أول عادة', description: 'أكمل أول عادة يومية', condition: () => AppData.stats.totalSessions >= 1 },
        { id: 'week_streak', name: 'أسبوع كامل', description: 'حافظ على سلسلة 7 أيام', condition: () => AppData.stats.currentStreak >= 7 },
        { id: 'month_streak', name: 'شهر الإنجاز', description: 'حافظ على سلسلة 30 يوم', condition: () => AppData.stats.currentStreak >= 30 },
        { id: 'task_master', name: 'سيد المهام', description: 'أكمل 50 مهمة', condition: () => AppData.stats.tasksCompleted >= 50 },
        { id: 'focus_master', name: 'تركيز عميق', description: 'أكمل 100 جلسة تركيز', condition: () => AppData.stats.totalSessions >= 100 },
        { id: 'habit_builder', name: 'بناء العادات', description: 'أنشئ 10 عادات مختلفة', condition: () => AppData.habits.length >= 10 },
        { id: 'early_bird', name: 'طائر باكر', description: 'أكمل 5 جلسات في يوم واحد', condition: () => AppData.stats.totalSessions >= 5 },
        { id: 'night_owl', name: 'بومة الليل', description: 'أكمل جلسة بعد منتصف الليل', condition: () => new Date().getHours() >= 0 && new Date().getHours() < 5 },
        { id: 'weekend_warrior', name: 'محارب نهاية الأسبوع', description: 'أكمل 10 جلسات في عطلة نهاية الأسبوع', condition: () => AppData.stats.totalSessions >= 10 },
        { id: 'perfect_week', name: 'أسبوع مثالي', description: 'أكمل جميع العادات لمدة أسبوع كامل', condition: () => AppData.rewards.achievements.includes('week_streak') }
    ]
};

function addPoints(points, reason) {
    AppData.rewards.points += points;
    AppData.rewards.history.push({
        points: points,
        reason: reason,
        timestamp: new Date().toISOString()
    });
    
    // التحقق من المستوى الجديد
    const newLevel = calculateLevel();
    if (newLevel > AppData.rewards.level) {
        AppData.rewards.level = newLevel;
        showLevelUpNotification(newLevel);
    }
    
    // التحقق من الإنجازات
    checkAchievements();
    
    saveData();
    updateRewardsUI();
}

function calculateLevel() {
    const points = AppData.rewards.points;
    let level = 1;
    
    for (let i = REWARDS_CONFIG.levelThresholds.length - 1; i >= 0; i--) {
        if (points >= REWARDS_CONFIG.levelThresholds[i]) {
            level = i + 1;
            break;
        }
    }
    
    return level;
}

function getLevelProgress() {
    const currentLevel = AppData.rewards.level;
    const currentPoints = AppData.rewards.points;
    const currentThreshold = REWARDS_CONFIG.levelThresholds[currentLevel - 1] || 0;
    const nextThreshold = REWARDS_CONFIG.levelThresholds[currentLevel] || currentThreshold + 1000;
    
    const progress = ((currentPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(progress, 100);
}

function getPointsToNextLevel() {
    const currentLevel = AppData.rewards.level;
    const currentPoints = AppData.rewards.points;
    const nextThreshold = REWARDS_CONFIG.levelThresholds[currentLevel] || currentPoints + 100;
    
    return nextThreshold - currentPoints;
}

function checkAchievements() {
    REWARDS_CONFIG.achievements.forEach(achievement => {
        if (!AppData.rewards.achievements.includes(achievement.id) && achievement.condition()) {
            AppData.rewards.achievements.push(achievement.id);
            showAchievementNotification(achievement);
        }
    });
}

function showLevelUpNotification(level) {
    const levelName = REWARDS_CONFIG.levelNames[level - 1] || `المستوى ${level}`;
    showNotification('ترقية المستوى!', `لقد وصلت إلى مستوى: ${levelName}`);
}

function showAchievementNotification(achievement) {
    showNotification('إنجاز جديد!', `${achievement.name}: ${achievement.description}`);
}

function updateRewardsUI() {
    // تحديث شريط النقاط في الشريط الجانبي
    const levelProgress = getLevelProgress();
    const pointsToNext = getPointsToNextLevel();
    const levelName = REWARDS_CONFIG.levelNames[AppData.rewards.level - 1] || `المستوى ${AppData.rewards.level}`;
    const levelIcon = getLevelIcon(AppData.rewards.level);
    
    document.getElementById('rewardsLevel').textContent = levelName;
    document.getElementById('rewardsLevelIcon').innerHTML = levelIcon;
    document.getElementById('rewardsPoints').textContent = `${AppData.rewards.points} نقطة`;
    document.getElementById('rewardsProgressBar').style.width = `${levelProgress}%`;
    document.getElementById('rewardsProgressText').textContent = `${Math.round(pointsToNext)} نقطة للمستوى التالي`;
    
    // تحديث صفحة المكافآت
    renderRewardsPage();
}

function renderRewardsPage() {
    const rewardsContent = document.getElementById('rewardsContent');
    
    // عرض المستوى الحالي
    const levelProgress = getLevelProgress();
    const levelName = REWARDS_CONFIG.levelNames[AppData.rewards.level - 1] || `المستوى ${AppData.rewards.level}`;
    const levelIcon = getLevelIcon(AppData.rewards.level);
    
    let html = `
        <div class="rewards-overview">
            <div class="level-card">
                <div class="level-badge">
                    <span class="level-icon">${levelIcon}</span>
                    <span class="level-number">${AppData.rewards.level}</span>
                </div>
                <div class="level-info">
                    <h3>${levelName}</h3>
                    <p>${AppData.rewards.points} نقطة</p>
                    <div class="level-progress">
                        <div class="level-progress-bar">
                            <div class="level-progress-fill" style="width: ${levelProgress}%"></div>
                        </div>
                        <span class="level-progress-text">${getPointsToNextLevel()} نقطة للمستوى التالي</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="achievements-section">
            <h3>الإنجازات</h3>
            <div class="achievements-grid">
    `;
    
    REWARDS_CONFIG.achievements.forEach(achievement => {
        const isUnlocked = AppData.rewards.achievements.includes(achievement.id);
        const achievementIcon = getAchievementIcon(achievement.id);
        html += `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievementIcon}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
                ${isUnlocked ? '<div class="achievement-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>' : ''}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <div class="rewards-history">
            <h3>سجل النقاط</h3>
            <div class="history-list">
    `;
    
    // عرض آخر 10 عمليات
    const recentHistory = AppData.rewards.history.slice(-10).reverse();
    recentHistory.forEach(entry => {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        html += `
            <div class="history-item">
                <span class="history-points">+${entry.points}</span>
                <span class="history-reason">${entry.reason}</span>
                <span class="history-time">${timeStr}</span>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    rewardsContent.innerHTML = html;
}

function getLevelIcon(level) {
    const icons = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10C8.55 2.04 4.86 7.66 4.5 12c-.37 4.43 1.27 9.95 7.5 10z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10C8.55 2.04 4.86 7.66 4.5 12c-.37 4.43 1.27 9.95 7.5 10z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'
    ];
    return icons[level - 1] || icons[0];
}

function getAchievementIcon(id) {
    const icons = {
        'first_habit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10C8.55 2.04 4.86 7.66 4.5 12c-.37 4.43 1.27 9.95 7.5 10z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>',
        'week_streak': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        'month_streak': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'task_master': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        'focus_master': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'habit_builder': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
        'early_bird': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        'night_owl': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        'weekend_warrior': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        'perfect_week': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'
    };
    return icons[id] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
}

// ==================== المؤقت ====================
let timerInterval = null;
let timerMode = 'focus'; // focus, short, long
let timeRemaining = AppData.settings.focusDuration * 60;
let isRunning = false;
let sessionsCount = 0;

const timerMinutes = document.getElementById('timerMinutes');
const timerSeconds = document.getElementById('timerSeconds');
const timerStatus = document.getElementById('timerStatus');
const timerRing = document.getElementById('timerRing');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

// تحديث عرض المؤقت
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerMinutes.textContent = minutes.toString().padStart(2, '0');
    timerSeconds.textContent = seconds.toString().padStart(2, '0');

    // تحديث الحلقة
    const totalTime = getModeTime() * 60;
    const progress = (timeRemaining / totalTime) * 565.48;
    timerRing.style.strokeDashoffset = 565.48 - progress;

    // تحديث عنوان الصفحة
    document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - FocusFlow`;
}

// الحصول على مدة الوضع الحالي
function getModeTime() {
    switch (timerMode) {
        case 'focus': return AppData.settings.focusDuration;
        case 'short': return AppData.settings.shortBreak;
        case 'long': return AppData.settings.longBreak;
        default: return AppData.settings.focusDuration;
    }
}

// بدء المؤقت
function startTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        resumeTimer();
    }
}

function resumeTimer() {
    isRunning = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    timerStatus.textContent = timerMode === 'focus' ? 'جاري التركيز...' : 'استراحة...';

    timerInterval = setInterval(() => {
        timeRemaining--;

        if (timeRemaining <= 0) {
            completeTimer();
        }

        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    timerStatus.textContent = 'متوقف مؤقتاً';
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeRemaining = getModeTime() * 60;
    updateTimerDisplay();
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    timerStatus.textContent = 'جاهز للتركيز';
}

function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;

    // تشغيل صوت الإشعار
    playNotification();

    if (timerMode === 'focus') {
        // تحديث الإحصائيات
        AppData.stats.totalFocusMinutes += AppData.settings.focusDuration;
        AppData.stats.totalSessions++;
        sessionsCount++;

        // تحديث بيانات الأسبوع
        const today = new Date().getDay();
        AppData.stats.weeklyData[today] += AppData.settings.focusDuration;

        // تحديث السلسلة
        updateStreak();
        
        // إضافة نقاط المكافأة
        addPoints(REWARDS_CONFIG.pointsPerFocusSession, 'إكمال جلسة تركيز');

        // التحقق من الاستراحة الطويلة
        if (sessionsCount >= AppData.settings.sessionsBeforeLong) {
            timerMode = 'long';
            sessionsCount = 0;
        } else {
            timerMode = 'short';
        }
    } else {
        timerMode = 'focus';
    }

    saveData();
    updateStats();
    updateModeButtons();
    resetTimer();

    // إشعار
    showNotification(
        timerMode === 'focus' ? 'انتهت الاستراحة!' : 'انتهت جلسة التركيز!',
        timerMode === 'focus' ? 'حان وقت العودة للتركيز' : 'أحسنت! خذ استراحة'
    );
}

// تغيير الوضع
function setMode(mode) {
    timerMode = mode;
    resetTimer();
    updateModeButtons();
}

function updateModeButtons() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === timerMode) {
            btn.classList.add('active');
        }
    });
}

// تحديث السلسلة
function updateStreak() {
    const today = new Date().toDateString();
    const lastActive = AppData.stats.lastActiveDate;

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive === yesterday.toDateString()) {
        AppData.stats.currentStreak++;
        addPoints(REWARDS_CONFIG.pointsPerStreak, 'الحفاظ على السلسلة');
    } else if (lastActive !== today) {
        AppData.stats.currentStreak = 1;
    }

    AppData.stats.lastActiveDate = today;
}

// ==================== المهام ====================
function addTask(task) {
    AppData.tasks.push({
        id: Date.now(),
        ...task,
        completed: false,
        createdAt: new Date().toISOString()
    });
    saveData();
    renderTasks();
    updateTaskSelect();
}

function toggleTask(id) {
    const task = AppData.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            AppData.stats.tasksCompleted++;
            addPoints(REWARDS_CONFIG.pointsPerTask, `إكمال مهمة: ${task.title}`);
        }
        saveData();
        renderTasks();
        updateStats();
    }
}

function deleteTask(id) {
    AppData.tasks = AppData.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
    updateTaskSelect();
}

function editTask(id, updates) {
    const task = AppData.tasks.find(t => t.id === id);
    if (task) {
        Object.assign(task, updates);
        saveData();
        renderTasks();
        updateTaskSelect();
    }
}

function renderTasks(filter = 'all') {
    const tasksList = document.getElementById('tasksList');
    let filteredTasks = AppData.tasks;

    if (filter === 'pending') {
        filteredTasks = AppData.tasks.filter(t => !t.completed);
    } else if (filter === 'completed') {
        filteredTasks = AppData.tasks.filter(t => t.completed);
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <div class="task-info">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            </div>
            <div class="task-meta">
                <span class="task-priority ${task.priority}">${getPriorityText(task.priority)}</span>
                <span class="task-estimate">${task.estimate} دقيقة</span>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit" onclick="openEditTaskModal(${task.id})" title="تعديل">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="task-action-btn delete" onclick="deleteTask(${task.id})" title="حذف">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    // تحديث الملخص
    const pendingCount = AppData.tasks.filter(t => !t.completed).length;
    document.getElementById('tasksSummary').textContent = `${pendingCount} مهمة قيد التنفيذ`;
}

function updateTaskSelect() {
    const select = document.getElementById('currentTaskSelect');
    const pendingTasks = AppData.tasks.filter(t => !t.completed);
    select.innerHTML = '<option value="">اختر مهمة...</option>' +
        pendingTasks.map(task => `<option value="${task.id}">${escapeHtml(task.title)}</option>`).join('');
}

function getPriorityText(priority) {
    const priorities = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    return priorities[priority] || 'متوسطة';
}

// فتح نافذة تعديل المهمة
function openEditTaskModal(taskId) {
    const task = AppData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskEstimate').value = task.estimate;
    
    document.getElementById('editTaskModal').classList.add('active');
}

// ==================== العادات ====================
function addHabit(habit) {
    AppData.habits.push({
        id: Date.now(),
        ...habit,
        completedDates: [],
        createdAt: new Date().toISOString()
    });
    saveData();
    renderHabits();
}

function toggleHabit(id) {
    const habit = AppData.habits.find(h => h.id === id);
    if (habit) {
        const today = new Date().toISOString().split('T')[0];
        const index = habit.completedDates.indexOf(today);

        if (index === -1) {
            habit.completedDates.push(today);
            addPoints(REWARDS_CONFIG.pointsPerHabit, `إكمال عادة: ${habit.name}`);
        } else {
            habit.completedDates.splice(index, 1);
        }

        saveData();
        renderHabits();
        
        // التحقق من المكافأة الأسبوعية عند إكمال عادة
        checkWeeklyReward();
    }
}

function deleteHabit(id) {
    if (confirm('هل أنت متأكد من حذف هذه العادة؟')) {
        AppData.habits = AppData.habits.filter(h => h.id !== id);
        saveData();
        renderHabits();
        showNotification('تم الحذف', 'تم حذف العادة بنجاح');
    }
}

function editHabit(id, updates) {
    const habit = AppData.habits.find(h => h.id === id);
    if (habit) {
        Object.assign(habit, updates);
        saveData();
        renderHabits();
    }
}

function openEditHabitModal(habitId) {
    const habit = AppData.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    document.getElementById('editHabitId').value = habit.id;
    document.getElementById('editHabitName').value = habit.name;
    document.getElementById('editHabitGoal').value = habit.goal;
    
    // تحديد اللون الحالي
    document.querySelectorAll('#editHabitModal .color-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.color === habit.color) {
            btn.classList.add('selected');
        }
    });
    
    document.getElementById('editHabitModal').classList.add('active');
}

function renderHabits() {
    const habitsGrid = document.getElementById('habitsGrid');
    const today = new Date().toISOString().split('T')[0];

    habitsGrid.innerHTML = AppData.habits.map(habit => {
        const isCompletedToday = habit.completedDates.includes(today);
        const streak = calculateStreak(habit.completedDates);
        const weekCount = getWeekCount(habit.completedDates);

        return `
            <div class="habit-card" data-habit-id="${habit.id}">
                <div class="habit-header">
                    <div class="habit-color" style="background: ${habit.color}"></div>
                    <span class="habit-name">${escapeHtml(habit.name)}</span>
                    <div class="habit-streak">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                        </svg>
                        ${streak}
                    </div>
                </div>
                <div class="habit-progress">
                    <div class="habit-progress-bar">
                        <div class="habit-progress-fill" style="width: ${weekCount}%; background: ${habit.color}"></div>
                    </div>
                    <span class="habit-progress-text">${weekCount}% هذا الأسبوع</span>
                </div>
                <div class="habit-actions">
                    <button class="habit-check ${isCompletedToday ? 'completed' : ''}" onclick="toggleHabit(${habit.id})">
                        ${isCompletedToday ? '✓ تم الإنجاز' : 'تحديد كمنجز'}
                    </button>
                    <div class="habit-action-buttons">
                        <button class="habit-action-btn" onclick="openEditHabitModal(${habit.id})" title="تعديل">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="habit-action-btn delete" onclick="deleteHabit(${habit.id})" title="حذف">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    renderCalendar();
}

function calculateStreak(dates) {
    if (dates.length === 0) return 0;

    const sorted = [...dates].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
        const current = new Date(sorted[i]);
        const next = new Date(sorted[i + 1]);
        const diff = (current - next) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function getWeekCount(dates) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeek = dates.filter(d => new Date(d) >= weekAgo).length;
    return Math.round((thisWeek / 7) * 100);
}

function renderCalendar() {
    const calendar = document.getElementById('habitsCalendar');
    const today = new Date();
    const days = [];

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }

    calendar.innerHTML = days.map(date => {
        const dayNumber = new Date(date).getDate();
        const completedCount = AppData.habits.filter(h => h.completedDates.includes(date)).length;
        const totalHabits = AppData.habits.length;

        let className = 'calendar-day';
        if (totalHabits > 0 && completedCount === totalHabits) {
            className += ' completed';
        } else if (completedCount > 0) {
            className += ' partial';
        }

        return `<div class="${className}">${dayNumber}</div>`;
    }).join('');
}

// ==================== الإحصائيات ====================
function updateStats() {
    document.getElementById('totalFocusHours').textContent =
        Math.round(AppData.stats.totalFocusMinutes / 60 * 10) / 10;
    document.getElementById('totalTasksCompleted').textContent = AppData.stats.tasksCompleted;
    document.getElementById('habitsStreak').textContent = AppData.stats.currentStreak;

    // حساب معدل الإنتاجية
    const completedTasks = AppData.tasks.filter(t => t.completed).length;
    const totalTasks = AppData.tasks.length;
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    document.getElementById('productivityScore').textContent = productivity + '%';

    // تحديث إحصائيات الصفحة الرئيسية
    document.getElementById('sessionsToday').textContent = AppData.stats.totalSessions;
    document.getElementById('focusTimeToday').textContent = AppData.stats.totalFocusMinutes;
    document.getElementById('currentStreak').textContent = AppData.stats.currentStreak;

    // تحديث شريط الهدف اليومي
    const goalHours = 4;
    const currentHours = AppData.stats.totalFocusMinutes / 60;
    const goalPercent = Math.min((currentHours / goalHours) * 100, 100);
    document.getElementById('dailyGoalBar').style.width = goalPercent + '%';
    document.getElementById('dailyGoalText').textContent =
        `${Math.round(currentHours * 10) / 10} / ${goalHours} ساعات`;

    // تحديث الرسم البياني
    renderWeeklyChart();
    
    // تحديث مستوى المكافآت
    document.getElementById('rewardsLevelDisplay').textContent = AppData.rewards.level;
}

function renderWeeklyChart() {
    const chart = document.getElementById('weeklyChart');
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const maxValue = Math.max(...AppData.stats.weeklyData, 1);

    chart.innerHTML = AppData.stats.weeklyData.map((value, index) => {
        const height = (value / maxValue) * 100;
        return `
            <div class="chart-bar">
                <div class="chart-bar-fill" style="height: ${height}%"></div>
                <span class="chart-bar-label">${days[index]}</span>
            </div>
        `;
    }).join('');
}

// ==================== الإعدادات ====================
function loadSettings() {
    document.getElementById('focusDuration').value = AppData.settings.focusDuration;
    document.getElementById('shortBreak').value = AppData.settings.shortBreak;
    document.getElementById('longBreak').value = AppData.settings.longBreak;
    document.getElementById('sessionsBeforeLong').value = AppData.settings.sessionsBeforeLong;
    document.getElementById('notificationSound').value = AppData.settings.notificationSound;
    
    // إعدادات المكافأة الأسبوعية
    document.getElementById('weeklyRewardType').value = AppData.settings.weeklyRewardType || 'none';
    document.getElementById('weeklyRewardPointsValue').value = AppData.settings.weeklyRewardPoints || 50;
    document.getElementById('weeklyRewardMessageText').value = AppData.settings.weeklyRewardMessage || '';
    
    // عرض إعدادات المكافأة المناسبة
    updateWeeklyRewardUI();
    
    // عرض خيار الصوت المخصص
    updateCustomSoundUI();
}

function saveSettings() {
    AppData.settings.focusDuration = parseInt(document.getElementById('focusDuration').value);
    AppData.settings.shortBreak = parseInt(document.getElementById('shortBreak').value);
    AppData.settings.longBreak = parseInt(document.getElementById('longBreak').value);
    AppData.settings.sessionsBeforeLong = parseInt(document.getElementById('sessionsBeforeLong').value);
    AppData.settings.notificationSound = document.getElementById('notificationSound').value;
    
    // حفظ إعدادات المكافأة الأسبوعية
    AppData.settings.weeklyRewardType = document.getElementById('weeklyRewardType').value;
    AppData.settings.weeklyRewardPoints = parseInt(document.getElementById('weeklyRewardPointsValue').value);
    AppData.settings.weeklyRewardMessage = document.getElementById('weeklyRewardMessageText').value;

    saveData();
    resetTimer();

    showNotification('تم الحفظ', 'تم تحديث الإعدادات بنجاح');
}

function updateWeeklyRewardUI() {
    const rewardType = document.getElementById('weeklyRewardType').value;
    document.getElementById('weeklyRewardPoints').style.display = rewardType === 'points' ? 'flex' : 'none';
    document.getElementById('weeklyRewardMessage').style.display = rewardType === 'message' ? 'flex' : 'none';
}

function updateCustomSoundUI() {
    const soundType = document.getElementById('notificationSound').value;
    document.getElementById('customSoundUpload').style.display = soundType === 'custom' ? 'flex' : 'none';
}

function checkWeeklyReward() {
    if (!AppData.settings.weeklyRewardType || AppData.settings.weeklyRewardType === 'none') return;
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    
    // التحقق فقط في نهاية الأسبوع (السبت)
    if (dayOfWeek !== 6) return;
    
    // التحقق من إكمال جميع العادات هذا الأسبوع
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const allHabitsCompleted = AppData.habits.every(habit => {
        const weekDates = [];
        for (let d = new Date(weekStart); d <= today; d.setDate(d.getDate() + 1)) {
            weekDates.push(d.toISOString().split('T')[0]);
        }
        return weekDates.every(date => habit.completedDates.includes(date));
    });
    
    if (allHabitsCompleted && AppData.habits.length > 0) {
        // منح المكافأة
        if (AppData.settings.weeklyRewardType === 'points') {
            const points = AppData.settings.weeklyRewardPoints || 50;
            addPoints(points, 'مكافأة إكمال العادات الأسبوعية');
            showNotification('مكافأة أسبوعية!', `لقد حصلت على ${points} نقطة إضافية لإكمال جميع العادات هذا الأسبوع`);
        } else if (AppData.settings.weeklyRewardType === 'message') {
            const message = AppData.settings.weeklyRewardMessage || 'أحسنت! أكملت جميع العادات هذا الأسبوع';
            showNotification('مكافأة أسبوعية!', message);
        }
    }
}

// ==================== الأصوات ====================
const NOTIFICATION_TONES = {
    bell: { freq: 800, type: 'sine', duration: 0.3 },
    chime: { freq: 600, type: 'sine', duration: 0.4 },
    gentle: { freq: 500, type: 'triangle', duration: 0.5 },
    alert: { freq: 1000, type: 'square', duration: 0.2 },
    melody: { freq: 700, type: 'sine', duration: 0.6 }
};

let customNotificationSound = null;

function playNotification() {
    if (AppData.settings.notificationSound === 'none') return;
    
    // إذا كان هناك صوت مخصص
    if (AppData.settings.notificationSound === 'custom' && customNotificationSound) {
        customNotificationSound.currentTime = 0;
        customNotificationSound.play().catch(() => {});
        return;
    }

    // تشغيل النغمة المحددة
    const tone = NOTIFICATION_TONES[AppData.settings.notificationSound] || NOTIFICATION_TONES.bell;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = tone.freq;
    oscillator.type = tone.type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + tone.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + tone.duration);
}

function loadCustomSound(file) {
    const url = URL.createObjectURL(file);
    customNotificationSound = new Audio(url);
    customNotificationSound.preload = 'auto';
    
    // حفظ مسار الملف
    const reader = new FileReader();
    reader.onload = (e) => {
        AppData.settings.customSoundData = e.target.result;
        saveData();
    };
    reader.readAsDataURL(file);
}

function initCustomSound() {
    if (AppData.settings.customSoundData) {
        customNotificationSound = new Audio(AppData.settings.customSoundData);
        customNotificationSound.preload = 'auto';
    }
}

// ==================== الإشعارات ====================
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '⏰' });
    }
}

// طلب إذن الإشعارات
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// ==================== التصدير والاستيراد ====================
function exportData() {
    const data = {
        tasks: AppData.tasks,
        habits: AppData.habits,
        settings: AppData.settings,
        stats: AppData.stats,
        rewards: AppData.rewards,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('تم التصدير', 'تم تصدير البيانات بنجاح');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                AppData.tasks = data.tasks || [];
                AppData.habits = data.habits || [];
                AppData.settings = data.settings || AppData.settings;
                AppData.stats = data.stats || AppData.stats;
                AppData.rewards = data.rewards || AppData.rewards;

                saveData();
                loadSettings();
                renderTasks();
                renderHabits();
                updateStats();
                updateRewardsUI();

                showNotification('تم الاستيراد', 'تم استيراد البيانات بنجاح');
            } catch (error) {
                showNotification('خطأ', 'الملف غير صالح');
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

function resetData() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        localStorage.clear();
        AppData.tasks = [];
        AppData.habits = [];
        AppData.stats = {
            totalFocusMinutes: 0,
            totalSessions: 0,
            tasksCompleted: 0,
            currentStreak: 0,
            lastActiveDate: null,
            weeklyData: [0, 0, 0, 0, 0, 0, 0]
        };
        AppData.rewards = {
            points: 0,
            level: 1,
            achievements: [],
            history: []
        };

        renderTasks();
        renderHabits();
        updateStats();
        updateRewardsUI();
        resetTimer();

        showNotification('تم المسح', 'تم مسح جميع البيانات');
    }
}

// ==================== الأدوات ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== Service Worker Registration ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('FocusFlow: Service Worker registered');
            })
            .catch(error => {
                console.log('FocusFlow: Service Worker registration failed');
            });
    });
}

// ==================== Hash-based Routing ====================
function handleHashRoute() {
    const hash = window.location.hash.slice(1); // Remove #
    if (!hash) return;
    
    const validPages = ['timer', 'tasks', 'habits', 'stats', 'settings', 'rewards'];
    if (validPages.includes(hash)) {
        // Activate the corresponding nav item and page
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === hash) {
                item.classList.add('active');
            }
        });
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`page-${hash}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
}

// Listen for hash changes
window.addEventListener('hashchange', handleHashRoute);

// ==================== تهيئة التطبيق ====================
document.addEventListener('DOMContentLoaded', () => {
    // التنقل بين الصفحات
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            
            // Update hash for deep linking
            window.location.hash = page;

            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${page}`).classList.add('active');
        });
    });

    // أزرار المؤقت
    startBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', () => {
        completeTimer();
    });

    // أوضاع المؤقت
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // إضافة مهمة
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        document.getElementById('taskModal').classList.add('active');
    });

    document.getElementById('closeTaskModal').addEventListener('click', () => {
        document.getElementById('taskModal').classList.remove('active');
    });

    document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addTask({
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            estimate: parseInt(document.getElementById('taskEstimate').value)
        });
        document.getElementById('taskForm').reset();
        document.getElementById('taskModal').classList.remove('active');
    });

    // تعديل مهمة
    document.getElementById('closeEditTaskModal').addEventListener('click', () => {
        document.getElementById('editTaskModal').classList.remove('active');
    });

    document.getElementById('editTaskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = parseInt(document.getElementById('editTaskId').value);
        editTask(taskId, {
            title: document.getElementById('editTaskTitle').value,
            description: document.getElementById('editTaskDescription').value,
            priority: document.getElementById('editTaskPriority').value,
            estimate: parseInt(document.getElementById('editTaskEstimate').value)
        });
        document.getElementById('editTaskModal').classList.remove('active');
    });

    // إضافة عادة
    document.getElementById('addHabitBtn').addEventListener('click', () => {
        document.getElementById('habitModal').classList.add('active');
    });

    document.getElementById('closeHabitModal').addEventListener('click', () => {
        document.getElementById('habitModal').classList.remove('active');
    });

    // منتقي الألوان للعادة الجديدة
    let selectedColor = '#3b82f6';
    document.querySelectorAll('#habitModal .color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#habitModal .color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedColor = btn.dataset.color;
        });
    });

    document.getElementById('habitForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addHabit({
            name: document.getElementById('habitName').value,
            color: selectedColor,
            goal: document.getElementById('habitGoal').value
        });
        document.getElementById('habitForm').reset();
        document.getElementById('habitModal').classList.remove('active');
    });

    // تعديل عادة
    let editSelectedColor = '#3b82f6';
    document.querySelectorAll('#editHabitModal .color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#editHabitModal .color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            editSelectedColor = btn.dataset.color;
        });
    });

    document.getElementById('closeEditHabitModal').addEventListener('click', () => {
        document.getElementById('editHabitModal').classList.remove('active');
    });

    document.getElementById('editHabitForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const habitId = parseInt(document.getElementById('editHabitId').value);
        const habit = AppData.habits.find(h => h.id === habitId);
        if (habit) {
            editHabit(habitId, {
                name: document.getElementById('editHabitName').value,
                color: editSelectedColor || habit.color,
                goal: document.getElementById('editHabitGoal').value
            });
        }
        document.getElementById('editHabitModal').classList.remove('active');
    });

    // فلاتر المهام
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });

    // الإعدادات
    document.querySelectorAll('#page-settings input, #page-settings select').forEach(input => {
        input.addEventListener('change', saveSettings);
    });
    
    // إعدادات الصوت المخصص
    document.getElementById('notificationSound').addEventListener('change', (e) => {
        updateCustomSoundUI();
        saveSettings();
    });
    
    document.getElementById('customSoundFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            loadCustomSound(file);
            showNotification('تم الرفع', 'تم تحميل الصوت المخصص بنجاح');
        }
    });
    
    document.getElementById('testSoundBtn').addEventListener('click', () => {
        playNotification();
    });
    
    // إعدادات المكافأة الأسبوعية
    document.getElementById('weeklyRewardType').addEventListener('change', (e) => {
        updateWeeklyRewardUI();
        saveSettings();
    });

    // التصدير والاستيراد
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importData').addEventListener('click', importData);
    document.getElementById('resetData').addEventListener('click', resetData);

    // القائمة الجانبية للموبايل
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // إغلاق النوافذ المنبثقة بالنقر خارجها
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // التهيئة الأولية
    loadSettings();
    renderTasks();
    renderHabits();
    updateStats();
    updateRewardsUI();
    updateTimerDisplay();
    updateTaskSelect();
    initCustomSound();
    
    // التحقق من المكافأة الأسبوعية
    checkWeeklyReward();
    
    // Handle initial hash route
    handleHashRoute();
});
