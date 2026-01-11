// ========================================
// COTE: ULTIMATUM - OAA Website Script
// ========================================

// State
let currentClass = null;
let currentStudent = null;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
    initLockScreen();
    initHomeScreen();
    initOAAApp();
    initBackButtons();
});

// ========================================
// TIME DISPLAY
// ========================================

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const lockTime = document.getElementById('lock-time');
    const lockDate = document.getElementById('lock-date');
    const homeTime = document.getElementById('home-time');

    if (lockTime) lockTime.textContent = timeStr;
    if (lockDate) lockDate.textContent = dateStr;
    if (homeTime) homeTime.textContent = timeStr;
}

// ========================================
// SCREEN NAVIGATION
// ========================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        target.classList.add('fade-in');
    }
}

// ========================================
// LOCK SCREEN
// ========================================

function initLockScreen() {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) {
        lockScreen.addEventListener('click', () => {
            showScreen('home-screen');
        });
    }
}

// ========================================
// HOME SCREEN
// ========================================

function initHomeScreen() {
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const appId = icon.dataset.app;
            if (appId === 'oaa') {
                showScreen('oaa-app');
                showOAAView('oaa-dashboard');
            } else if (appId === 'events') {
                showScreen('events-app');
            }
        });
    });
}

// ========================================
// BACK BUTTONS
// ========================================

function initBackButtons() {
    // App header back buttons (return to home)
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.back;
            showScreen(target);
        });
    });

    // In-app view navigation
    document.querySelectorAll('.back-link').forEach(link => {
        link.addEventListener('click', () => {
            const target = link.dataset.view;
            showOAAView(target);
        });
    });
}

// ========================================
// OAA APP
// ========================================

function showOAAView(viewId) {
    document.querySelectorAll('#oaa-app .app-view').forEach(view => {
        view.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        target.classList.add('fade-in');
    }
}

function initOAAApp() {
    renderClassCards();
}

function renderClassCards() {
    const container = document.getElementById('first-year-classes');
    if (!container) return;

    const classes = ['A', 'B', 'C', 'D'];
    container.innerHTML = '';

    classes.forEach(className => {
        const students = getStudentsByClass(1, className);
        const card = createClassCard(1, className, students);
        container.appendChild(card);
    });
}

function createClassCard(year, className, students) {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.addEventListener('click', () => {
        showClassView(year, className);
    });

    const previewStudents = students.slice(0, 3);
    const studentPreviews = previewStudents.map(s => createStudentPreview(s)).join('');
    const emptyMessage = students.length === 0
        ? '<p style="color: var(--text-muted); font-size: 0.9rem;">No students found</p>'
        : '';

    card.innerHTML = `
        <div class="class-card-header">
            <span class="class-card-title">Class ${className}</span>
            <span class="class-card-count">${students.length} Students</span>
        </div>
        <div class="class-card-students">
            ${studentPreviews}
            ${emptyMessage}
        </div>
        ${students.length > 3 ? `<span class="view-all-link">View all ${students.length} students →</span>` : ''}
    `;

    return card;
}

function createStudentPreview(student) {
    const initials = getInitials(student.name);
    const avatarHtml = student.image
        ? `<img class="student-avatar" src="${student.image}" alt="${student.name}">`
        : `<div class="student-avatar-placeholder">${initials}</div>`;

    return `
        <div class="student-preview">
            ${avatarHtml}
            <div class="student-preview-info">
                <div class="student-preview-name">${student.name}</div>
                <div class="student-preview-class">${student.year}${getYearSuffix(student.year)} Year - Class ${student.class}</div>
            </div>
            <div class="student-preview-id">${student.id}</div>
        </div>
    `;
}

function showClassView(year, className) {
    currentClass = { year, className };
    const students = getStudentsByClass(year, className);

    document.getElementById('class-title').textContent = `${year}${getYearSuffix(year)} Year - Class ${className}`;
    document.getElementById('student-count').textContent = `${students.length} Students`;

    const container = document.getElementById('student-list');
    container.innerHTML = '';

    if (students.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No students found</p>';
    } else {
        students.forEach(student => {
            const card = createStudentCard(student);
            container.appendChild(card);
        });
    }

    // Update back link
    const backLink = document.querySelector('#oaa-class .back-link');
    if (backLink) {
        backLink.dataset.view = 'oaa-dashboard';
    }

    showOAAView('oaa-class');
}

function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.addEventListener('click', () => {
        showStudentProfile(student);
    });

    const initials = getInitials(student.name);
    const avatarHtml = student.image
        ? `<img class="student-card-avatar" src="${student.image}" alt="${student.name}">`
        : `<div class="student-avatar-placeholder" style="width:50px;height:50px;font-size:1rem;">${initials}</div>`;

    card.innerHTML = `
        ${avatarHtml}
        <div class="student-card-info">
            <div class="student-card-name">${student.name}</div>
            <div class="student-card-class">${student.year}${getYearSuffix(student.year)} Year - Class ${student.class}</div>
        </div>
        <div class="student-card-id">${student.id}</div>
    `;

    return card;
}

function showStudentProfile(student) {
    currentStudent = student;

    document.getElementById('profile-name').textContent = student.name;
    document.getElementById('profile-class').textContent = `${student.year}${getYearSuffix(student.year)} Year - Class ${student.class}`;
    document.getElementById('profile-id').textContent = student.id;

    const profileImage = document.getElementById('profile-image');
    if (student.image) {
        profileImage.src = student.image;
        profileImage.style.display = 'block';
    } else {
        profileImage.src = '';
        profileImage.style.display = 'none';
    }

    // Calculate and display overall grade
    const overall = calculateOverallGrade(student.stats);
    document.getElementById('profile-overall').textContent = overall;

    // Render stats
    const statList = document.getElementById('stat-list');
    statList.innerHTML = '';

    const statNames = [
        'Academic Ability',
        'Intelligence',
        'Decision Making',
        'Physical Ability',
        'Cooperativeness'
    ];

    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];

    statKeys.forEach((key, index) => {
        const value = student.stats[key] || 50;
        const grade = getGradeFromValue(value);
        const statRow = document.createElement('div');
        statRow.className = 'stat-row';
        statRow.innerHTML = `
            <div class="stat-label">${statNames[index]}</div>
            <div class="stat-bar-container">
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${value}%"></div>
                </div>
                <div class="stat-value">${value}/100 <span class="stat-grade">${grade}</span></div>
            </div>
        `;
        statList.appendChild(statRow);
    });

    // Update back link to return to class view
    const backLink = document.querySelector('#oaa-profile .back-link');
    if (backLink) {
        backLink.dataset.view = 'oaa-class';
    }

    showOAAView('oaa-profile');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getStudentsByClass(year, className) {
    if (typeof studentData === 'undefined') return [];
    return studentData.filter(s => s.year === year && s.class === className);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getYearSuffix(year) {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
}

function getGradeFromValue(value) {
    if (value >= 90) return 'A+';
    if (value >= 85) return 'A';
    if (value >= 80) return 'A-';
    if (value >= 75) return 'B+';
    if (value >= 70) return 'B';
    if (value >= 65) return 'B-';
    if (value >= 60) return 'C+';
    if (value >= 55) return 'C';
    if (value >= 50) return 'C-';
    if (value >= 45) return 'D+';
    if (value >= 40) return 'D';
    if (value >= 35) return 'D-';
    return 'E';
}

function calculateOverallGrade(stats) {
    const values = [
        stats.academic || 50,
        stats.intelligence || 50,
        stats.decision || 50,
        stats.physical || 50,
        stats.cooperativeness || 50
    ];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return getGradeFromValue(average);
}
