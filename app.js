// ==================== GrindHub: Professional DSA Problem Tracker (Pure Black 000) ====================

// --- Storage Keys ---
const PROFILE_KEY = 'dsa_user_profile_v1';
const SOLVED_KEY = 'dsa_tracker_solved_questions_v1';
const STARRED_KEY = 'dsa_tracker_starred_v1';
const VISITED_KEY = 'dsa_tracker_has_visited_v1';
const ACTIVITY_LOG_KEY = 'dsa_tracker_activity_log_v1';

const PRESET_COLORS = [
    { name: "Blue", hex: "#3b82f6", glow: "rgba(59, 130, 246, 0.25)" },
    { name: "Green", hex: "#10b981", glow: "rgba(16, 185, 129, 0.25)" },
    { name: "Purple", hex: "#8b5cf6", glow: "rgba(139, 92, 246, 0.25)" },
    { name: "Cyan", hex: "#06b6d4", glow: "rgba(6, 182, 212, 0.25)" },
    { name: "Amber", hex: "#f59e0b", glow: "rgba(245, 158, 11, 0.25)" },
    { name: "Coral", hex: "#f43f5e", glow: "rgba(244, 63, 94, 0.25)" }
];

const DEFAULT_PROFILE = {
    name: "Coder",
    color: "#3b82f6",
    github: "",
    codolioUrl: ""
};

// --- Application State ---
let userProfile = loadUserProfile();
let solvedSet = loadSolvedQuestions();
let starredSet = loadStarredQuestions();

let currentTopic = null; // null => Home Roadmap View, string => Topic Questions View
let roadmapSearchQuery = '';

let topicFilters = {
    search: '',
    status: 'all', // 'all' | 'unsolved' | 'solved' | 'starred'
    diff: 'all',   // 'all' | 'Easy' | 'Medium' | 'Hard'
    platform: 'all'
};

// ==================== Helpers ====================
function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getInitial(name) {
    if (!name || !name.trim()) return 'C';
    return name.trim().charAt(0).toUpperCase();
}

function getTopicKeys() {
    return (typeof questionsData !== 'undefined') ? Object.keys(questionsData) : [];
}

function topicPill(topicKey) {
    if (!topicKey) return '';
    const cls = (typeof TOPIC_COLORS !== 'undefined' && TOPIC_COLORS[topicKey]) ? TOPIC_COLORS[topicKey] : 'text-blue-400 bg-blue-950/40 border-blue-900/50';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cls}">${topicKey}</span>`;
}

function platformPill(platform) {
    const cls = (typeof PLATFORM_COLORS !== 'undefined' && PLATFORM_COLORS[platform]) ? PLATFORM_COLORS[platform] : 'text-neutral-400 bg-[#0f0f0f] border-[#1c1c1c]';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border flex-shrink-0 ${cls}">${platform || 'Other'}</span>`;
}

function difficultyBadgeClasses(difficulty) {
    if (difficulty === 'Easy') return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
    if (difficulty === 'Medium') return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
    return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
}

function escJs(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ==================== User Profile ====================
function loadUserProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return Object.assign({}, DEFAULT_PROFILE, parsed);
            }
        }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
}

function saveUserProfile(profile) {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {}
}

function applyThemeAccent(hexColor) {
    if (!hexColor) return;
    document.documentElement.style.setProperty('--pro-accent', hexColor);
    document.documentElement.style.setProperty('--border-hover', hexColor);
}

function updateProfileUI() {
    const profileName = (userProfile.name || 'Coder').trim();
    applyThemeAccent(userProfile.color || '#3b82f6');

    const avatarEl = document.getElementById('active-profile-avatar');
    const nameEl = document.getElementById('active-profile-name');
    if (avatarEl) {
        avatarEl.textContent = getInitial(profileName);
        avatarEl.style.backgroundColor = userProfile.color || '#3b82f6';
    }
    if (nameEl) nameEl.textContent = profileName;

    const welcomeEl = document.getElementById('dashboard-welcome-heading');
    if (welcomeEl) {
        welcomeEl.innerHTML = `Welcome back, <span id="dashboard-user-name" onclick="openProfileModal()" title="Edit Profile" class="text-blue-400 cursor-pointer hover:underline font-bold">${escAttr(profileName)}</span>`;
    }
    const dashNameEl = document.getElementById('dashboard-user-name');
    if (dashNameEl) {
        dashNameEl.textContent = profileName;
        dashNameEl.onclick = openProfileModal;
    }

    const githubLink = document.getElementById('nav-github-link');
    if (githubLink) {
        const gh = (userProfile.github || '').trim();
        if (gh) {
            githubLink.href = gh.startsWith('http') ? gh : `https://github.com/${gh}`;
            githubLink.classList.remove('hidden');
            githubLink.classList.add('inline-flex');
        } else {
            githubLink.classList.add('hidden');
            githubLink.classList.remove('inline-flex');
        }
    }

    const codolioLink = document.getElementById('nav-codolio-link');
    if (codolioLink) {
        const cod = (userProfile.codolioUrl || '').trim();
        if (cod) {
            codolioLink.href = cod.startsWith('http') ? cod : `https://${cod}`;
            codolioLink.classList.remove('hidden');
            codolioLink.classList.add('inline-flex');
        } else {
            codolioLink.classList.add('hidden');
            codolioLink.classList.remove('inline-flex');
        }
    }
}

function openProfileModal() {
    closeWelcomeModal();
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const nameInput = document.getElementById('profile-modal-name');
    const colorInput = document.getElementById('profile-modal-color');
    const githubInput = document.getElementById('profile-modal-github');
    const codolioInput = document.getElementById('profile-modal-codolio');

    if (nameInput) nameInput.value = userProfile.name || 'Coder';
    if (colorInput) colorInput.value = userProfile.color || '#3b82f6';
    if (githubInput) githubInput.value = userProfile.github || '';
    if (codolioInput) codolioInput.value = userProfile.codolioUrl || '';

    renderColorOptions('profile-color-options', userProfile.color || '#3b82f6', (selected) => {
        if (colorInput) colorInput.value = selected;
    });

    if (nameInput) {
        setTimeout(() => nameInput.focus(), 100);
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function saveProfileModal() {
    const nameInput = document.getElementById('profile-modal-name');
    const colorInput = document.getElementById('profile-modal-color');
    const githubInput = document.getElementById('profile-modal-github');
    const codolioInput = document.getElementById('profile-modal-codolio');

    userProfile.name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Coder';
    userProfile.color = (colorInput && colorInput.value.trim()) ? colorInput.value.trim() : '#3b82f6';
    userProfile.github = githubInput ? githubInput.value.trim() : '';
    userProfile.codolioUrl = codolioInput ? codolioInput.value.trim() : '';

    saveUserProfile(userProfile);
    try {
        localStorage.setItem(VISITED_KEY, 'true');
    } catch (e) {}

    updateProfileUI();
    closeProfileModal();
    showToast("Profile Saved");
}

function renderColorOptions(containerId, activeColor, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    PRESET_COLORS.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = c.name;
        btn.className = `w-6 h-6 rounded-full transition transform cursor-pointer ${c.hex.toLowerCase() === activeColor.toLowerCase() ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#000000]' : 'opacity-70 hover:opacity-100'}`;
        btn.style.backgroundColor = c.hex;
        btn.onclick = () => {
            renderColorOptions(containerId, c.hex, onSelect);
            onSelect(c.hex);
        };
        container.appendChild(btn);
    });
}

// ==================== First-Time Onboarding ====================
function checkFirstTimeUser() {
    try {
        const hasVisited = localStorage.getItem(VISITED_KEY);
        if (hasVisited === 'true') return;

        const rawProfile = localStorage.getItem(PROFILE_KEY);
        if (rawProfile) {
            const p = JSON.parse(rawProfile);
            if (p && p.name && p.name.trim() !== '' && p.name !== 'Coder') {
                localStorage.setItem(VISITED_KEY, 'true');
                return;
            }
        }

        setTimeout(() => {
            openWelcomeModal();
        }, 350);
    } catch (e) {}
}

function openWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const nameInput = document.getElementById('welcome-modal-name');
    if (nameInput) {
        nameInput.value = '';
        setTimeout(() => nameInput.focus(), 100);
    }
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    try {
        localStorage.setItem(VISITED_KEY, 'true');
    } catch (e) {}
}

function submitWelcomeModal() {
    const nameInput = document.getElementById('welcome-modal-name');
    const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Coder';

    userProfile.name = name;
    saveUserProfile(userProfile);
    try {
        localStorage.setItem(VISITED_KEY, 'true');
    } catch (e) {}

    updateProfileUI();
    closeWelcomeModal();
    showToast(`Welcome, ${name}`);
}

// ==================== Solved & Starred Storage ====================
function loadSolvedQuestions() {
    try {
        const raw = localStorage.getItem(SOLVED_KEY);
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) return new Set(arr);
        }
    } catch (e) {}
    return new Set();
}

function saveSolvedQuestions() {
    try {
        localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(solvedSet)));
    } catch (e) {}
}

function loadStarredQuestions() {
    try {
        const raw = localStorage.getItem(STARRED_KEY);
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) return new Set(arr);
        }
    } catch (e) {}
    return new Set();
}

function saveStarredQuestions() {
    try {
        localStorage.setItem(STARRED_KEY, JSON.stringify(Array.from(starredSet)));
    } catch (e) {}
}

function toggleQuestionSolved(idKey, ev) {
    if (solvedSet.has(idKey)) {
        solvedSet.delete(idKey);
        saveSolvedQuestions();
        updateSingleQuestionCheckboxUI(idKey, false);
    } else {
        solvedSet.add(idKey);
        saveSolvedQuestions();
        updateSingleQuestionCheckboxUI(idKey, true);
        logActivity();
    }
    updateDashboardSummaries();
    updatePlatformLegend();
    renderTopicMastery();
    if (currentTopic) {
        updateTopicHeaderStats(currentTopic);
    }
}

// ==================== Activity Log (for heatmap & streaks) ====================
function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function loadActivityLog() {
    try {
        const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
        if (raw) {
            const obj = JSON.parse(raw);
            if (obj && typeof obj === 'object') return obj;
        }
    } catch (e) {}
    return {};
}

function saveActivityLog(log) {
    try {
        localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
    } catch (e) {}
}

function logActivity() {
    const log = loadActivityLog();
    const key = todayKey();
    log[key] = (log[key] || 0) + 1;
    saveActivityLog(log);
    renderActivityHeatmap();
}

function computeStreaks(log) {
    const oneDay = 24 * 60 * 60 * 1000;
    let current = 0;
    let cursor = new Date();
    // If nothing logged today, streak can still count from yesterday backward
    if (!log[todayKey(cursor)]) {
        cursor = new Date(cursor.getTime() - oneDay);
    }
    while (log[todayKey(cursor)]) {
        current++;
        cursor = new Date(cursor.getTime() - oneDay);
    }

    // Best streak: scan all logged dates
    const dates = Object.keys(log).sort();
    let best = 0, run = 0, prev = null;
    dates.forEach(dateStr => {
        const d = new Date(dateStr + 'T00:00:00');
        if (prev !== null && (d - prev) === oneDay) {
            run++;
        } else {
            run = 1;
        }
        if (run > best) best = run;
        prev = d;
    });

    return { current, best: Math.max(best, current) };
}

function renderActivityHeatmap() {
    const container = document.getElementById('activity-heatmap');
    if (!container) return;
    const log = loadActivityLog();

    const WEEKS = 12;
    const totalDays = WEEKS * 7;
    const oneDay = 24 * 60 * 60 * 1000;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // align end of grid to end of current week (Saturday)
    const endOffset = 6 - today.getDay();
    const gridEnd = new Date(today.getTime() + endOffset * oneDay);
    const gridStart = new Date(gridEnd.getTime() - (totalDays - 1) * oneDay);

    let maxCount = 0;
    for (let i = 0; i < totalDays; i++) {
        const d = new Date(gridStart.getTime() + i * oneDay);
        const c = log[todayKey(d)] || 0;
        if (c > maxCount) maxCount = c;
    }

    function levelFor(count) {
        if (count === 0) return 0;
        if (maxCount <= 1) return count > 0 ? 4 : 0;
        const ratio = count / maxCount;
        if (ratio > 0.75) return 4;
        if (ratio > 0.5) return 3;
        if (ratio > 0.25) return 2;
        return 1;
    }

    let html = '<div class="heatmap-grid">';
    for (let i = 0; i < totalDays; i++) {
        const d = new Date(gridStart.getTime() + i * oneDay);
        const key = todayKey(d);
        const count = log[key] || 0;
        const level = d > today ? -1 : levelFor(count);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (level === -1) {
            html += `<span class="heat-cell" style="visibility:hidden;"></span>`;
        } else {
            const title = count > 0 ? `${count} solved on ${label}` : `No activity on ${label}`;
            html += `<span class="heat-cell" data-level="${level}" title="${title}"></span>`;
        }
    }
    html += '</div>';
    container.innerHTML = html;

    const streaks = computeStreaks(log);
    const curEl = document.getElementById('streak-current');
    const bestEl = document.getElementById('streak-best');
    if (curEl) curEl.textContent = streaks.current;
    if (bestEl) bestEl.textContent = streaks.best;
}

// ==================== Topic Mastery Widget ====================
function renderTopicMastery() {
    const container = document.getElementById('mastery-list');
    if (!container || typeof questionsData === 'undefined') return;

    const rows = getTopicKeys().map(topic => {
        const easy = questionsData[topic].Easy || [];
        const med = questionsData[topic].Medium || [];
        const hard = questionsData[topic].Hard || [];
        const all = [...easy, ...med, ...hard];
        const total = all.length;
        const solved = all.filter(q => solvedSet.has(q.id)).length;
        const pct = total ? Math.round((solved / total) * 100) : 0;
        return { topic, solved, total, pct };
    }).filter(r => r.total > 0);

    // Weakest (lowest %) first, so the user sees where to focus
    rows.sort((a, b) => a.pct - b.pct);
    const top = rows.slice(0, 6);

    const barColor = (pct) => {
        if (pct === 0) return '#3f3f46';
        if (pct < 34) return '#f43f5e';
        if (pct < 67) return '#f59e0b';
        return '#10b981';
    };

    container.innerHTML = top.map(r => `
        <div>
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-neutral-300 truncate pr-2">${r.topic}</span>
                <span class="text-[11px] font-mono text-neutral-500 flex-shrink-0">${r.solved}/${r.total}</span>
            </div>
            <div class="mastery-row">
                <div class="mastery-track">
                    <div class="mastery-fill" style="width: ${r.pct}%; background-color: ${barColor(r.pct)};"></div>
                </div>
                <span class="text-[10px] font-mono text-neutral-500 w-8 text-right flex-shrink-0">${r.pct}%</span>
            </div>
        </div>
    `).join('');
}

function toggleQuestionStarred(idKey, ev) {
    if (ev) ev.stopPropagation();
    if (starredSet.has(idKey)) {
        starredSet.delete(idKey);
        saveStarredQuestions();
        updateSingleQuestionStarUI(idKey, false);
    } else {
        starredSet.add(idKey);
        saveStarredQuestions();
        updateSingleQuestionStarUI(idKey, true);
    }
    if (topicFilters.status === 'starred' && currentTopic) {
        renderTopicQuestions(currentTopic);
    }
}

function updateSingleQuestionCheckboxUI(idKey, isSolved) {
    document.querySelectorAll(`input[data-qid="${CSS.escape(idKey)}"]`).forEach(input => {
        input.checked = isSolved;
        const row = input.closest('.question-row');
        if (row) {
            if (isSolved) {
                row.classList.add('is-solved');
            } else {
                row.classList.remove('is-solved');
            }
        }
    });
}

function updateSingleQuestionStarUI(idKey, isStarred) {
    document.querySelectorAll(`button[data-starid="${CSS.escape(idKey)}"]`).forEach(btn => {
        if (isStarred) {
            btn.classList.add('starred');
            btn.textContent = '★';
            btn.title = 'Remove bookmark';
        } else {
            btn.classList.remove('starred');
            btn.textContent = '☆';
            btn.title = 'Bookmark problem';
        }
    });
}

// ==================== Toast Notifications ====================
let toastTimer = null;
function showToast(msg) {
    const toast = document.getElementById('toast-container');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = msg;
    toast.classList.remove('translate-y-8', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-8', 'opacity-0');
    }, 2000);
}

// ==================== Overall Stats ====================
function updateDashboardSummaries() {
    let totalQuestions = 0;
    let solvedCount = 0;
    let solvedEasy = 0;
    let solvedMed = 0;
    let solvedHard = 0;

    if (typeof questionsData !== 'undefined') {
        for (const topic in questionsData) {
            (questionsData[topic].Easy || []).forEach(q => {
                totalQuestions++;
                if (solvedSet.has(q.id)) { solvedCount++; solvedEasy++; }
            });
            (questionsData[topic].Medium || []).forEach(q => {
                totalQuestions++;
                if (solvedSet.has(q.id)) { solvedCount++; solvedMed++; }
            });
            (questionsData[topic].Hard || []).forEach(q => {
                totalQuestions++;
                if (solvedSet.has(q.id)) { solvedCount++; solvedHard++; }
            });
        }
    }

    const pct = totalQuestions ? Math.round((solvedCount / totalQuestions) * 100) : 0;
    const remaining = Math.max(0, totalQuestions - solvedCount);

    const dashSolved = document.getElementById('dash-stat-solved');
    const dashProg = document.getElementById('dash-stat-progress');
    const dashBar = document.getElementById('dash-stat-bar');
    if (dashSolved) dashSolved.textContent = solvedCount.toLocaleString();
    if (dashProg) dashProg.textContent = `${pct}% Completed (${solvedCount}/${totalQuestions})`;
    if (dashBar) dashBar.style.width = `${pct}%`;

    const dashEasy = document.getElementById('dash-solved-easy');
    const dashMed = document.getElementById('dash-solved-med');
    const dashHard = document.getElementById('dash-solved-hard');
    if (dashEasy) dashEasy.textContent = `E: ${solvedEasy}`;
    if (dashMed) dashMed.textContent = `M: ${solvedMed}`;
    if (dashHard) dashHard.textContent = `H: ${solvedHard}`;

    const dashRemaining = document.getElementById('dash-stat-remaining');
    if (dashRemaining) dashRemaining.textContent = `${remaining.toLocaleString()} Unsolved`;
}

function updatePlatformLegend() {
    const legend = document.getElementById('platform-legend');
    if (!legend || typeof questionsData === 'undefined') return;

    const platformCounts = {};
    const platformSolved = {};

    for (const topic in questionsData) {
        ['Easy', 'Medium', 'Hard'].forEach(diff => {
            (questionsData[topic][diff] || []).forEach(q => {
                const p = q.platform || 'Other';
                platformCounts[p] = (platformCounts[p] || 0) + 1;
                if (solvedSet.has(q.id)) {
                    platformSolved[p] = (platformSolved[p] || 0) + 1;
                }
            });
        });
    }

    legend.innerHTML = Object.keys(platformCounts).sort().map(p => {
        const count = platformCounts[p];
        const pSol = platformSolved[p] || 0;
        const cls = (typeof PLATFORM_COLORS !== 'undefined' && PLATFORM_COLORS[p]) ? PLATFORM_COLORS[p] : 'text-neutral-400 bg-[#0f0f0f] border-[#1c1c1c]';
        return `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${cls}">
            <span>${p}</span>
            <span class="text-neutral-400 font-mono text-[11px]">${pSol}/${count}</span>
        </span>`;
    }).join('');
}

// ==================== VIEW 1: HOME ROADMAP GRID ====================
function renderRoadmapGrid() {
    const grid = document.getElementById('roadmap-grid');
    if (!grid || typeof questionsData === 'undefined') return;

    const topics = getTopicKeys();
    const query = roadmapSearchQuery.toLowerCase();

    let html = '';

    topics.forEach((topic, idx) => {
        if (query && !topic.toLowerCase().includes(query)) {
            return;
        }

        const easyList = questionsData[topic].Easy || [];
        const medList = questionsData[topic].Medium || [];
        const hardList = questionsData[topic].Hard || [];
        const totalInTopic = easyList.length + medList.length + hardList.length;

        let solvedInTopic = 0;
        let easySolved = 0;
        let medSolved = 0;
        let hardSolved = 0;

        easyList.forEach(q => { if (solvedSet.has(q.id)) { solvedInTopic++; easySolved++; } });
        medList.forEach(q => { if (solvedSet.has(q.id)) { solvedInTopic++; medSolved++; } });
        hardList.forEach(q => { if (solvedSet.has(q.id)) { solvedInTopic++; hardSolved++; } });

        const pct = totalInTopic ? Math.round((solvedInTopic / totalInTopic) * 100) : 0;
        const isCompleted = totalInTopic > 0 && solvedInTopic === totalInTopic;

        html += `
        <div onclick="openTopicPage('${escJs(topic)}')" class="roadmap-card group">
            <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-xs font-mono text-neutral-500 font-semibold">#${idx + 1}</span>
                    ${topicPill(topic)}
                </div>
                <h3 class="text-base font-bold text-white group-hover:text-blue-400 transition mb-1">
                    ${topic}
                </h3>
                <div class="flex items-center gap-2 text-xs text-neutral-400 font-mono mt-1">
                    <span class="text-emerald-400">E: ${easySolved}/${easyList.length}</span>
                    <span class="text-neutral-700">•</span>
                    <span class="text-amber-400">M: ${medSolved}/${medList.length}</span>
                    <span class="text-neutral-700">•</span>
                    <span class="text-rose-400">H: ${hardSolved}/${hardList.length}</span>
                </div>
            </div>

            <div class="mt-4 pt-3 border-t border-[#1c1c1c]">
                <div class="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span class="text-neutral-400">${solvedInTopic}/${totalInTopic} Solved</span>
                    <span class="${isCompleted ? 'text-emerald-400 font-bold' : 'text-blue-400 font-semibold'}">${pct}%</span>
                </div>
                <div class="w-full bg-[#000000] rounded-full h-1.5 overflow-hidden border border-[#1c1c1c] mb-3">
                    <div class="${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'} h-1.5 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                </div>

                <div class="flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition">
                    <span>Solve Questions</span>
                    <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                </div>
            </div>
        </div>`;
    });

    if (!html) {
        html = `
        <div class="col-span-full pro-card p-8 text-center text-neutral-400">
            <p class="font-semibold text-base text-white">No topics matching "${escAttr(roadmapSearchQuery)}"</p>
            <button onclick="clearRoadmapSearch()" class="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition cursor-pointer">
                Clear Search
            </button>
        </div>`;
    }

    grid.innerHTML = html;
}

function onRoadmapSearchChanged() {
    const input = document.getElementById('roadmap-topic-search');
    roadmapSearchQuery = input ? input.value.trim() : '';
    renderRoadmapGrid();
}

function clearRoadmapSearch() {
    const input = document.getElementById('roadmap-topic-search');
    if (input) input.value = '';
    roadmapSearchQuery = '';
    renderRoadmapGrid();
}

// ==================== VIEW 2: TOPIC QUESTIONS PAGE ====================
function openTopicPage(topicName) {
    if (!questionsData || !questionsData[topicName]) return;

    currentTopic = topicName;
    window.location.hash = `topic=${encodeURIComponent(topicName)}`;

    const homeView = document.getElementById('home-view');
    const topicView = document.getElementById('topic-view');

    if (homeView) homeView.classList.add('hidden');
    if (topicView) {
        topicView.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Reset topic filters
    topicFilters = {
        search: '',
        status: 'all',
        diff: 'all',
        platform: 'all'
    };
    const searchInput = document.getElementById('topic-question-search');
    const platSelect = document.getElementById('topic-platform-select');
    if (searchInput) searchInput.value = '';
    if (platSelect) platSelect.value = 'all';

    setTopicStatusFilter('all');
    setTopicDiffFilter('all');

    updateTopicHeaderStats(topicName);
    updateAdjacentTopicButtons(topicName);
    renderTopicQuestions(topicName);
}

function navigateToHome() {
    currentTopic = null;
    window.location.hash = '';

    const homeView = document.getElementById('home-view');
    const topicView = document.getElementById('topic-view');

    if (topicView) topicView.classList.add('hidden');
    if (homeView) {
        homeView.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateDashboardSummaries();
    renderRoadmapGrid();
    renderActivityHeatmap();
    renderTopicMastery();
}

function updateTopicHeaderStats(topicName) {
    const titleEl = document.getElementById('topic-page-title');
    const badgeEl = document.getElementById('topic-page-badge');
    const solvedCountEl = document.getElementById('topic-page-solved-count');
    const pctEl = document.getElementById('topic-page-pct');
    const barLabelEl = document.getElementById('topic-page-stat-bar-label');
    const barEl = document.getElementById('topic-page-progress-bar');
    const easyEl = document.getElementById('topic-page-easy-count');
    const medEl = document.getElementById('topic-page-med-count');
    const hardEl = document.getElementById('topic-page-hard-count');

    if (!questionsData[topicName]) return;

    const easyList = questionsData[topicName].Easy || [];
    const medList = questionsData[topicName].Medium || [];
    const hardList = questionsData[topicName].Hard || [];
    const total = easyList.length + medList.length + hardList.length;

    let solved = 0, eSol = 0, mSol = 0, hSol = 0;
    easyList.forEach(q => { if (solvedSet.has(q.id)) { solved++; eSol++; } });
    medList.forEach(q => { if (solvedSet.has(q.id)) { solved++; mSol++; } });
    hardList.forEach(q => { if (solvedSet.has(q.id)) { solved++; hSol++; } });

    const pct = total ? Math.round((solved / total) * 100) : 0;

    if (titleEl) titleEl.textContent = topicName;
    if (badgeEl) badgeEl.innerHTML = topicPill(topicName);
    if (solvedCountEl) solvedCountEl.textContent = `${solved} / ${total} Solved`;
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (barLabelEl) barLabelEl.textContent = `${pct}% Completed (${solved}/${total})`;
    if (barEl) barEl.style.width = `${pct}%`;

    if (easyEl) easyEl.textContent = `Easy: ${eSol}/${easyList.length}`;
    if (medEl) medEl.textContent = `Med: ${mSol}/${medList.length}`;
    if (hardEl) hardEl.textContent = `Hard: ${hSol}/${hardList.length}`;
}

function updateAdjacentTopicButtons(topicName) {
    const topics = getTopicKeys();
    const idx = topics.indexOf(topicName);
    const prevBtn = document.getElementById('topic-prev-btn');
    const nextBtn = document.getElementById('topic-next-btn');
    const prevLabel = document.getElementById('topic-prev-label');
    const nextLabel = document.getElementById('topic-next-label');

    if (idx > 0) {
        if (prevBtn) prevBtn.classList.remove('invisible');
        if (prevLabel) prevLabel.textContent = `← ${topics[idx - 1]}`;
    } else {
        if (prevBtn) prevBtn.classList.add('invisible');
    }

    if (idx < topics.length - 1) {
        if (nextBtn) nextBtn.classList.remove('invisible');
        if (nextLabel) nextLabel.textContent = `${topics[idx + 1]} →`;
    } else {
        if (nextBtn) nextBtn.classList.add('invisible');
    }
}

function navigateAdjacentTopic(offset) {
    if (!currentTopic) return;
    const topics = getTopicKeys();
    const idx = topics.indexOf(currentTopic);
    const targetIdx = idx + offset;
    if (targetIdx >= 0 && targetIdx < topics.length) {
        openTopicPage(topics[targetIdx]);
    }
}

// Topic Filter Controls
function setTopicStatusFilter(status) {
    topicFilters.status = status;
    ['all', 'unsolved', 'solved', 'starred'].forEach(s => {
        const btn = document.getElementById(`topic-filter-status-${s}`);
        if (btn) {
            if (s === status) {
                btn.className = 'px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer bg-blue-600 text-white';
            } else {
                btn.className = 'px-2.5 py-1 text-xs font-semibold rounded text-neutral-400 hover:text-white transition cursor-pointer';
            }
        }
    });
    if (currentTopic) renderTopicQuestions(currentTopic);
}

function setTopicDiffFilter(diff) {
    topicFilters.diff = diff;
    ['all', 'Easy', 'Medium', 'Hard'].forEach(d => {
        const btn = document.getElementById(`topic-filter-diff-${d}`);
        if (btn) {
            if (d === diff) {
                btn.className = 'px-2 py-0.5 text-xs font-semibold rounded transition cursor-pointer bg-blue-600 text-white';
            } else {
                btn.className = 'px-2 py-0.5 text-xs font-semibold rounded text-neutral-400 hover:text-white transition cursor-pointer';
            }
        }
    });
    if (currentTopic) renderTopicQuestions(currentTopic);
}

function onTopicFilterChanged() {
    const searchInput = document.getElementById('topic-question-search');
    const platSelect = document.getElementById('topic-platform-select');
    topicFilters.search = searchInput ? searchInput.value.trim() : '';
    topicFilters.platform = platSelect ? platSelect.value : 'all';
    if (currentTopic) renderTopicQuestions(currentTopic);
}

function renderTopicQuestions(topicName) {
    const container = document.getElementById('topic-questions-container');
    if (!container || !questionsData || !questionsData[topicName]) return;

    const query = topicFilters.search.toLowerCase();
    const statusFilter = topicFilters.status;
    const diffFilter = topicFilters.diff;
    const platFilter = topicFilters.platform;

    const filterList = (list, dName) => {
        if (diffFilter !== 'all' && diffFilter !== dName) return [];
        return (list || []).filter(q => {
            const isSolved = solvedSet.has(q.id);
            const isStarred = starredSet.has(q.id);

            if (statusFilter === 'solved' && !isSolved) return false;
            if (statusFilter === 'unsolved' && isSolved) return false;
            if (statusFilter === 'starred' && !isStarred) return false;

            if (platFilter !== 'all' && (q.platform || '') !== platFilter) return false;

            if (query) {
                const matchTitle = q.title.toLowerCase().includes(query);
                const matchPlat = (q.platform || '').toLowerCase().includes(query);
                if (!matchTitle && !matchPlat) return false;
            }

            return true;
        });
    };

    const easyFiltered = filterList(questionsData[topicName].Easy, 'Easy');
    const medFiltered = filterList(questionsData[topicName].Medium, 'Medium');
    const hardFiltered = filterList(questionsData[topicName].Hard, 'Hard');

    const totalVisible = easyFiltered.length + medFiltered.length + hardFiltered.length;

    let html = '';
    html += renderDifficultyBlock('Easy', easyFiltered, 1);
    html += renderDifficultyBlock('Medium', medFiltered, easyFiltered.length + 1);
    html += renderDifficultyBlock('Hard', hardFiltered, easyFiltered.length + medFiltered.length + 1);

    if (totalVisible === 0) {
        html = `
        <div class="pro-card p-8 rounded-lg border border-[#1c1c1c] text-center text-neutral-400">
            <p class="font-semibold text-base text-white">No questions found matching your filter</p>
            <p class="text-xs text-neutral-400 mt-1">Try changing or resetting your search and filter criteria.</p>
            <button onclick="clearTopicFilters()" class="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition cursor-pointer">
                Clear Filters
            </button>
        </div>`;
    }

    container.innerHTML = html;
}

function clearTopicFilters() {
    const searchInput = document.getElementById('topic-question-search');
    const platSelect = document.getElementById('topic-platform-select');
    if (searchInput) searchInput.value = '';
    if (platSelect) platSelect.value = 'all';
    topicFilters.search = '';
    topicFilters.platform = 'all';
    setTopicStatusFilter('all');
    setTopicDiffFilter('all');
}

function renderDifficultyBlock(difficulty, list, startIndex = 1) {
    if (!list || list.length === 0) return '';
    const badgeCls = difficultyBadgeClasses(difficulty);

    const itemsHtml = list.map((q, idx) => {
        const isSolved = solvedSet.has(q.id);
        const isStarred = starredSet.has(q.id);
        const urlAttr = escAttr(q.url);
        const idAttr = escAttr(q.id);
        const questionNum = startIndex + idx;

        return `
        <div class="question-row flex items-center justify-between p-2.5 rounded-md border border-[#1c1c1c] bg-[#080808] transition ${isSolved ? 'is-solved' : ''}">
            <div class="flex items-center gap-2.5 min-w-0 flex-grow pr-3">
                <input type="checkbox" class="pro-checkbox" data-qid="${idAttr}" ${isSolved ? 'checked' : ''} onchange="toggleQuestionSolved('${escJs(q.id)}', event)">
                
                <button type="button" data-starid="${idAttr}" onclick="toggleQuestionStarred('${escJs(q.id)}', event)" class="star-btn ${isStarred ? 'starred' : ''} focus:outline-none" title="${isStarred ? 'Remove bookmark' : 'Bookmark'}">
                    ${isStarred ? '★' : '☆'}
                </button>

                <span class="text-xs font-mono text-neutral-500 flex-shrink-0 w-6 text-right">${questionNum}.</span>

                <a href="${urlAttr}" target="_blank" rel="noopener noreferrer" class="q-title-link text-[13.5px] font-medium text-white hover:text-blue-400 transition truncate hover:underline" title="${escAttr(q.title)}">
                    ${escAttr(q.title)}
                </a>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                ${platformPill(q.platform)}
                <a href="${urlAttr}" target="_blank" rel="noopener noreferrer" class="text-neutral-400 hover:text-white p-1 transition" title="Open external problem link">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </a>
            </div>
        </div>`;
    }).join('');

    return `
    <div class="pro-card p-4 border border-[#1c1c1c] rounded-lg">
        <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${badgeCls}">${difficulty}</span>
            <span class="text-xs font-mono text-neutral-400 font-medium">(${list.length} problems)</span>
        </div>
        <div class="space-y-1.5">
            ${itemsHtml}
        </div>
    </div>`;
}

// ==================== Hash Routing ====================
function handleHashRoute() {
    const hash = window.location.hash.slice(1); // remove '#'
    if (hash.startsWith('topic=')) {
        const topicName = decodeURIComponent(hash.slice(6));
        if (questionsData && questionsData[topicName]) {
            openTopicPage(topicName);
            return;
        }
    }
    navigateToHome();
}

window.addEventListener('hashchange', handleHashRoute);

// Keyboard shortcuts: '/' to focus search, 'Escape' to go back or close modals
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = currentTopic ? document.getElementById('topic-question-search') : document.getElementById('roadmap-topic-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    } else if (e.key === 'Escape') {
        const profileModal = document.getElementById('profile-modal');
        const welcomeModal = document.getElementById('welcome-modal');
        if (profileModal && !profileModal.classList.contains('hidden')) {
            closeProfileModal();
        } else if (welcomeModal && !welcomeModal.classList.contains('hidden')) {
            closeWelcomeModal();
        } else if (currentTopic) {
            navigateToHome();
        }
    }
});

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
    updateDashboardSummaries();
    updatePlatformLegend();
    renderRoadmapGrid();
    renderActivityHeatmap();
    renderTopicMastery();
    handleHashRoute();
    checkFirstTimeUser();
});
