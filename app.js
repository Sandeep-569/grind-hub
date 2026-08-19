// ==================== GrindHub: Professional DSA Problem Tracker ====================

// --- Storage Keys ---
const PROFILE_KEY = 'dsa_user_profile_v1';
const SOLVED_KEY = 'dsa_tracker_solved_questions_v1';
const STARRED_KEY = 'dsa_tracker_starred_v1';
const VISITED_KEY = 'dsa_tracker_has_visited_v1';

const PRESET_COLORS = [
    { name: "Blue", hex: "#3b82f6", glow: "rgba(59, 130, 246, 0.25)" },
    { name: "Indigo", hex: "#6366f1", glow: "rgba(99, 102, 241, 0.25)" },
    { name: "Emerald", hex: "#10b981", glow: "rgba(16, 185, 129, 0.25)" },
    { name: "Cyan", hex: "#06b6d4", glow: "rgba(6, 182, 212, 0.25)" },
    { name: "Violet", hex: "#8b5cf6", glow: "rgba(139, 92, 246, 0.25)" },
    { name: "Rose", hex: "#f43f5e", glow: "rgba(244, 63, 94, 0.25)" },
    { name: "Amber", hex: "#f59e0b", glow: "rgba(245, 158, 11, 0.25)" },
    { name: "Slate", hex: "#64748b", glow: "rgba(100, 116, 139, 0.25)" }
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
let openAccordions = new Set();

let vaultFilters = {
    search: '',
    status: 'all', // 'all' | 'unsolved' | 'solved' | 'starred'
    diff: 'all',   // 'all' | 'Easy' | 'Medium' | 'Hard'
    platform: 'all'
};

// ==================== View Controller ====================
function hideAllViews() {
    ['dashboard-view', 'questions-view'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('block');
        }
    });
}

function showDashboard() {
    hideAllViews();
    const dash = document.getElementById('dashboard-view');
    if (dash) {
        dash.classList.remove('hidden');
        dash.classList.add('block');
    }
    updateDashboardSummaries();
    renderDashboardTopicGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showQuestionsView() {
    hideAllViews();
    const qView = document.getElementById('questions-view');
    if (qView) {
        qView.classList.remove('hidden');
        qView.classList.add('block');
    }
    renderTopicQuickJumpBar();
    renderQuestions();
    updateQuestionsViewProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToTopicQuestions(topicKey) {
    showQuestionsView();
    setTimeout(() => {
        const sectionId = `topic-${slugify(topicKey)}`;
        const sectionEl = document.getElementById(sectionId);
        const contentEl = document.getElementById(`content-${sectionId}`);
        if (sectionEl && contentEl) {
            if (contentEl.classList.contains('hidden')) toggleAccordion(sectionId);
            sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            sectionEl.classList.add('ring-1', 'ring-blue-500');
            setTimeout(() => sectionEl.classList.remove('ring-1', 'ring-blue-500'), 1500);
        }
    }, 100);
}

// ==================== Helpers ====================
function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getInitial(name) {
    if (!name || !name.trim()) return 'C';
    return name.trim().charAt(0).toUpperCase();
}

function topicPill(topicKey) {
    if (!topicKey) return '';
    const cls = (typeof TOPIC_COLORS !== 'undefined' && TOPIC_COLORS[topicKey]) ? TOPIC_COLORS[topicKey] : 'text-blue-400 bg-blue-950/40 border-blue-500/30';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${cls}">${topicKey}</span>`;
}

function platformPill(platform) {
    const cls = (typeof PLATFORM_COLORS !== 'undefined' && PLATFORM_COLORS[platform]) ? PLATFORM_COLORS[platform] : 'text-slate-300 bg-slate-800 border-slate-700';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${cls}">${platform || 'Other'}</span>`;
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
    const preset = PRESET_COLORS.find(p => p.hex.toLowerCase() === hexColor.toLowerCase());
    const glow = preset ? preset.glow : 'rgba(59, 130, 246, 0.25)';
    document.documentElement.style.setProperty('--pro-accent', hexColor);
    document.documentElement.style.setProperty('--pro-glow', glow);
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
        btn.className = `w-6 h-6 rounded-full transition transform cursor-pointer ${c.hex.toLowerCase() === activeColor.toLowerCase() ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'}`;
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

function toggleQuestionSolved(urlKey, ev) {
    if (solvedSet.has(urlKey)) {
        solvedSet.delete(urlKey);
        saveSolvedQuestions();
        updateSingleQuestionCheckboxUI(urlKey, false);
    } else {
        solvedSet.add(urlKey);
        saveSolvedQuestions();
        updateSingleQuestionCheckboxUI(urlKey, true);
    }
    updateDashboardSummaries();
    updateQuestionsViewProgress();
}

function toggleQuestionStarred(urlKey, ev) {
    if (ev) ev.stopPropagation();
    if (starredSet.has(urlKey)) {
        starredSet.delete(urlKey);
        saveStarredQuestions();
        updateSingleQuestionStarUI(urlKey, false);
    } else {
        starredSet.add(urlKey);
        saveStarredQuestions();
        updateSingleQuestionStarUI(urlKey, true);
    }
    if (vaultFilters.status === 'starred') {
        renderQuestions();
    }
}

function updateSingleQuestionCheckboxUI(urlKey, isSolved) {
    document.querySelectorAll(`input[data-qurl="${CSS.escape(urlKey)}"]`).forEach(input => {
        input.checked = isSolved;
        const row = input.closest('.question-row');
        if (row) {
            if (isSolved) {
                row.classList.add('opacity-50');
                const link = row.querySelector('.q-title-link');
                if (link) link.classList.add('line-through', 'text-slate-400');
            } else {
                row.classList.remove('opacity-50');
                const link = row.querySelector('.q-title-link');
                if (link) link.classList.remove('line-through', 'text-slate-400');
            }
        }
    });
}

function updateSingleQuestionStarUI(urlKey, isStarred) {
    document.querySelectorAll(`button[data-starurl="${CSS.escape(urlKey)}"]`).forEach(btn => {
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

function resetQuestionProgress() {
    if (confirm("Reset all problem progress? This will uncheck all solved problems.")) {
        solvedSet.clear();
        saveSolvedQuestions();
        renderQuestions();
        updateDashboardSummaries();
        renderDashboardTopicGrid();
        showToast("All progress reset");
    }
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

// ==================== Dashboard Summaries & Stats ====================
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
                if (solvedSet.has(q.url)) { solvedCount++; solvedEasy++; }
            });
            (questionsData[topic].Medium || []).forEach(q => {
                totalQuestions++;
                if (solvedSet.has(q.url)) { solvedCount++; solvedMed++; }
            });
            (questionsData[topic].Hard || []).forEach(q => {
                totalQuestions++;
                if (solvedSet.has(q.url)) { solvedCount++; solvedHard++; }
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

// ==================== 23-Topic Dashboard Grid Renderer ====================
function renderDashboardTopicGrid() {
    const grid = document.getElementById('dashboard-topics-grid');
    if (!grid || typeof questionsData === 'undefined') return;

    let html = '';
    for (const topic in questionsData) {
        let total = 0;
        let solved = 0;
        let easyCount = (questionsData[topic].Easy || []).length;
        let medCount = (questionsData[topic].Medium || []).length;
        let hardCount = (questionsData[topic].Hard || []).length;

        ['Easy', 'Medium', 'Hard'].forEach(diff => {
            (questionsData[topic][diff] || []).forEach(q => {
                total++;
                if (solvedSet.has(q.url)) solved++;
            });
        });

        const pct = total ? Math.round((solved / total) * 100) : 0;
        const colorCls = (typeof TOPIC_COLORS !== 'undefined' && TOPIC_COLORS[topic]) ? TOPIC_COLORS[topic] : 'text-blue-400 bg-blue-950/40 border-blue-500/30';

        html += `
        <div onclick="goToTopicQuestions('${escJs(topic)}')" class="topic-roadmap-card p-4 sm:p-5 cursor-pointer flex flex-col justify-between group">
            <div>
                <div class="flex items-center justify-between mb-2.5">
                    <h3 class="font-bold text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors">${topic}</h3>
                    <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded border ${colorCls}">
                        ${solved}/${total}
                    </span>
                </div>

                <div class="flex items-center gap-2 mb-3 text-[11px] font-mono">
                    <span class="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/50">E: ${easyCount}</span>
                    <span class="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/50">M: ${medCount}</span>
                    <span class="text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/50">H: ${hardCount}</span>
                </div>
            </div>

            <div>
                <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800 mb-2">
                    <div class="bg-blue-500 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span class="font-mono">${pct}%</span>
                    <span class="text-blue-400 group-hover:text-blue-300 font-semibold flex items-center gap-1">
                        <span>Solve</span>
                        <svg class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </span>
                </div>
            </div>
        </div>`;
    }

    grid.innerHTML = html;
}

// ==================== Topic Quick-Jump Bar ====================
function renderTopicQuickJumpBar() {
    const bar = document.getElementById('topic-quick-jump-bar');
    if (!bar || typeof questionsData === 'undefined') return;

    let html = '';
    for (const topic in questionsData) {
        html += `
        <button type="button" onclick="goToTopicQuestions('${escJs(topic)}')" class="topic-jump-pill px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer flex-shrink-0">
            ${topic}
        </button>`;
    }
    bar.innerHTML = html;
}

// ==================== Questions View Progress ====================
function updateQuestionsViewProgress() {
    let total = 0;
    let solved = 0;
    const platformCounts = {};
    const platformSolved = {};

    if (typeof questionsData !== 'undefined') {
        for (const topic in questionsData) {
            ['Easy', 'Medium', 'Hard'].forEach(diff => {
                const list = questionsData[topic][diff] || [];
                total += list.length;
                list.forEach(q => {
                    const p = q.platform || 'Other';
                    platformCounts[p] = (platformCounts[p] || 0) + 1;
                    if (solvedSet.has(q.url)) {
                        solved++;
                        platformSolved[p] = (platformSolved[p] || 0) + 1;
                    }
                });
            });
        }
    }

    const pct = total ? Math.round((solved / total) * 100) : 0;
    const bar = document.getElementById('questions-progress-bar');
    const label = document.getElementById('questions-progress-label');
    const pctBadge = document.getElementById('questions-stat-pct');

    if (bar) bar.style.width = `${pct}%`;
    if (label) label.textContent = `${solved.toLocaleString()} of ${total.toLocaleString()} problems completed`;
    if (pctBadge) pctBadge.textContent = `${pct}% Completed`;

    const legend = document.getElementById('platform-legend');
    if (legend) {
        legend.innerHTML = Object.keys(platformCounts).sort().map(p => {
            const count = platformCounts[p];
            const pSol = platformSolved[p] || 0;
            const cls = (typeof PLATFORM_COLORS !== 'undefined' && PLATFORM_COLORS[p]) ? PLATFORM_COLORS[p] : 'text-slate-300 bg-slate-800 border-slate-700';
            return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${cls}">
                <span>${p}</span>
                <span class="text-slate-400 font-mono text-[11px]">${pSol}/${count}</span>
            </span>`;
        }).join('');
    }
}

// ==================== Vault Filtering Engine ====================
function setVaultStatusFilter(status) {
    vaultFilters.status = status;
    ['all', 'unsolved', 'solved', 'starred'].forEach(s => {
        const btn = document.getElementById(`filter-status-${s}`);
        if (btn) {
            if (s === status) {
                btn.className = 'px-3 py-1.5 text-xs font-semibold rounded transition cursor-pointer bg-blue-600 text-white';
            } else {
                btn.className = 'px-3 py-1.5 text-xs font-semibold rounded text-slate-400 hover:text-white transition cursor-pointer';
            }
        }
    });
    renderQuestions();
}

function setVaultDiffFilter(diff) {
    vaultFilters.diff = diff;
    ['all', 'Easy', 'Medium', 'Hard'].forEach(d => {
        const btn = document.getElementById(`filter-diff-${d}`);
        if (btn) {
            if (d === diff) {
                btn.className = 'px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer bg-blue-600 text-white';
            } else {
                btn.className = 'px-2.5 py-1 text-xs font-semibold rounded text-slate-400 hover:text-white transition cursor-pointer';
            }
        }
    });
    renderQuestions();
}

function onVaultFilterChanged() {
    const searchInput = document.getElementById('question-search');
    const platSelect = document.getElementById('vault-platform-select');
    vaultFilters.search = searchInput ? searchInput.value.trim() : '';
    vaultFilters.platform = platSelect ? platSelect.value : 'all';
    renderQuestions();
}

// ==================== Questions Accordion Rendering ====================
function toggleAccordion(sectionId) {
    const content = document.getElementById(`content-${sectionId}`);
    const icon = document.getElementById(`icon-${sectionId}`);
    if (!content) return;

    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
        openAccordions.add(sectionId);
    } else {
        content.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
        openAccordions.delete(sectionId);
    }
}

function toggleAllAccordions(expand) {
    if (typeof questionsData === 'undefined') return;
    for (const topic in questionsData) {
        const sectionId = `topic-${slugify(topic)}`;
        const content = document.getElementById(`content-${sectionId}`);
        const icon = document.getElementById(`icon-${sectionId}`);
        if (content) {
            if (expand) {
                content.classList.remove('hidden');
                if (icon) icon.classList.add('rotate-180');
                openAccordions.add(sectionId);
            } else {
                content.classList.add('hidden');
                if (icon) icon.classList.remove('rotate-180');
                openAccordions.delete(sectionId);
            }
        }
    }
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    if (!container || typeof questionsData === 'undefined') return;

    const query = vaultFilters.search.toLowerCase();
    const statusFilter = vaultFilters.status;
    const diffFilter = vaultFilters.diff;
    const platFilter = vaultFilters.platform;

    let html = '';
    let totalMatchingQuestions = 0;

    for (const topic in questionsData) {
        const sectionId = `topic-${slugify(topic)}`;
        let totalInTopic = 0;
        let solvedInTopic = 0;

        const filterList = (list, dName) => {
            if (diffFilter !== 'all' && diffFilter !== dName) return [];
            return (list || []).filter(q => {
                const isSolved = solvedSet.has(q.url);
                const isStarred = starredSet.has(q.url);

                if (statusFilter === 'solved' && !isSolved) return false;
                if (statusFilter === 'unsolved' && isSolved) return false;
                if (statusFilter === 'starred' && !isStarred) return false;

                if (platFilter !== 'all' && (q.platform || '') !== platFilter) return false;

                if (query) {
                    const matchTitle = q.title.toLowerCase().includes(query);
                    const matchPlat = (q.platform || '').toLowerCase().includes(query);
                    const matchTopic = topic.toLowerCase().includes(query);
                    if (!matchTitle && !matchPlat && !matchTopic) return false;
                }

                return true;
            });
        };

        const easyFiltered = filterList(questionsData[topic].Easy, 'Easy');
        const medFiltered = filterList(questionsData[topic].Medium, 'Medium');
        const hardFiltered = filterList(questionsData[topic].Hard, 'Hard');

        const visibleCount = easyFiltered.length + medFiltered.length + hardFiltered.length;
        totalMatchingQuestions += visibleCount;

        ['Easy', 'Medium', 'Hard'].forEach(diff => {
            (questionsData[topic][diff] || []).forEach(q => {
                totalInTopic++;
                if (solvedSet.has(q.url)) solvedInTopic++;
            });
        });

        const topicPct = totalInTopic ? Math.round((solvedInTopic / totalInTopic) * 100) : 0;
        const isOpen = (query || statusFilter !== 'all' || diffFilter !== 'all' || platFilter !== 'all') ? true : openAccordions.has(sectionId);

        if (visibleCount === 0 && (query || statusFilter !== 'all' || diffFilter !== 'all' || platFilter !== 'all')) {
            continue;
        }

        html += `
        <div id="${sectionId}" class="rounded-xl pro-card border border-slate-800 overflow-hidden mb-3">
            <button type="button" onclick="toggleAccordion('${sectionId}')" class="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left cursor-pointer focus:outline-none hover:bg-slate-850 transition">
                <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="font-bold text-sm sm:text-base text-slate-100">${topic}</span>
                    ${topicPill(topic)}
                    <span class="text-xs font-mono font-semibold text-slate-400">
                        ${solvedInTopic}/${totalInTopic} (${topicPct}%)
                    </span>
                    ${visibleCount !== totalInTopic ? `<span class="text-[11px] font-mono text-slate-500">Showing ${visibleCount}</span>` : ''}
                </div>
                <div class="flex items-center gap-2">
                    <svg id="icon-${sectionId}" class="w-4 h-4 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </button>

            <div id="content-${sectionId}" class="${isOpen ? '' : 'hidden'} border-t border-slate-800 p-3 sm:p-4 bg-slate-950/40 space-y-4">
                ${renderDifficultyBlock('Easy', easyFiltered, sectionId)}
                ${renderDifficultyBlock('Medium', medFiltered, sectionId)}
                ${renderDifficultyBlock('Hard', hardFiltered, sectionId)}
            </div>
        </div>`;
    }

    if (!html) {
        html = `
        <div class="pro-card p-8 rounded-xl border border-slate-800 text-center text-slate-400">
            <p class="font-bold text-base text-white">No problems found</p>
            <p class="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
            <button onclick="clearAllVaultFilters()" class="mt-3 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer">
                Clear Filters
            </button>
        </div>`;
    }

    container.innerHTML = html;
}

function clearAllVaultFilters() {
    const searchInput = document.getElementById('question-search');
    const platSelect = document.getElementById('vault-platform-select');
    if (searchInput) searchInput.value = '';
    if (platSelect) platSelect.value = 'all';
    vaultFilters.search = '';
    vaultFilters.platform = 'all';
    setVaultStatusFilter('all');
    setVaultDiffFilter('all');
}

function renderDifficultyBlock(difficulty, list, sectionId) {
    if (!list || list.length === 0) return '';
    const badgeCls = difficultyBadgeClasses(difficulty);

    const itemsHtml = list.map(q => {
        const isSolved = solvedSet.has(q.url);
        const isStarred = starredSet.has(q.url);
        const urlAttr = escAttr(q.url);
        return `
        <div class="question-row flex items-center justify-between p-2.5 sm:px-3 rounded-lg border border-slate-800 bg-slate-900/60 transition ${isSolved ? 'opacity-50' : ''}">
            <div class="flex items-center gap-3 min-w-0 flex-grow pr-2">
                <input type="checkbox" class="pro-checkbox" data-qurl="${urlAttr}" ${isSolved ? 'checked' : ''} onchange="toggleQuestionSolved('${escJs(q.url)}', event)">
                
                <button type="button" data-starurl="${urlAttr}" onclick="toggleQuestionStarred('${escJs(q.url)}', event)" class="star-btn ${isStarred ? 'starred' : ''} focus:outline-none" title="${isStarred ? 'Remove bookmark' : 'Bookmark'}">
                    ${isStarred ? '★' : '☆'}
                </button>

                <a href="${urlAttr}" target="_blank" rel="noopener noreferrer" class="q-title-link text-xs sm:text-sm font-medium text-slate-200 hover:text-blue-400 transition truncate hover:underline ${isSolved ? 'line-through text-slate-500' : ''}">
                    ${escAttr(q.title)}
                </a>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                ${platformPill(q.platform)}
                <a href="${urlAttr}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-white p-1 transition" title="Open external link">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </a>
            </div>
        </div>`;
    }).join('');

    return `
    <div>
        <div class="flex items-center gap-2 mb-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeCls}">${difficulty}</span>
            <span class="text-[11px] font-mono text-slate-400">(${list.length})</span>
        </div>
        <div class="space-y-1.5">
            ${itemsHtml}
        </div>
    </div>`;
}

// ==================== Random Problem Picker ====================
function pickRandomQuestion() {
    if (typeof questionsData === 'undefined') return;
    const unsolvedList = [];
    const allList = [];

    for (const topic in questionsData) {
        ['Easy', 'Medium', 'Hard'].forEach(diff => {
            (questionsData[topic][diff] || []).forEach(q => {
                allList.push({ ...q, topic, diff });
                if (!solvedSet.has(q.url)) {
                    unsolvedList.push({ ...q, topic, diff });
                }
            });
        });
    }

    const pool = unsolvedList.length > 0 ? unsolvedList : allList;
    if (pool.length === 0) return;

    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    goToTopicQuestions(randomPick.topic);

    showToast(`Selected: ${randomPick.title} (${randomPick.diff})`);
}

// ==================== Global Search Dropdown ====================
function handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('global-search-results');
    if (!resultsContainer) return;

    const q = query.trim().toLowerCase();
    if (!q) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        return;
    }

    const matches = [];
    if (typeof questionsData !== 'undefined') {
        for (const topic in questionsData) {
            ['Easy', 'Medium', 'Hard'].forEach(diff => {
                (questionsData[topic][diff] || []).forEach(item => {
                    if (
                        item.title.toLowerCase().includes(q) ||
                        (item.platform || '').toLowerCase().includes(q) ||
                        topic.toLowerCase().includes(q)
                    ) {
                        matches.push({ ...item, topic, diff });
                    }
                });
            });
        }
    }

    if (matches.length === 0) {
        resultsContainer.innerHTML = `<div class="p-4 text-xs text-slate-400 text-center font-medium">No problems found matching "${escAttr(query)}"</div>`;
        resultsContainer.classList.remove('hidden');
        return;
    }

    const maxShown = 30;
    const listHtml = matches.slice(0, maxShown).map(item => {
        const isSolved = solvedSet.has(item.url);
        const badgeCls = difficultyBadgeClasses(item.diff);
        return `
        <div class="p-3 border-b border-slate-800 hover:bg-slate-800/60 transition flex items-center justify-between gap-3">
            <div class="min-w-0 flex-grow">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${badgeCls}">${item.diff}</span>
                    ${platformPill(item.platform)}
                    ${topicPill(item.topic)}
                </div>
                <a href="${escAttr(item.url)}" target="_blank" rel="noopener noreferrer" class="text-xs sm:text-sm font-medium text-white hover:text-blue-400 transition truncate block ${isSolved ? 'line-through text-slate-400' : ''}">
                    ${escAttr(item.title)}
                </a>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button type="button" onclick="goToTopicQuestions('${escJs(item.topic)}'); document.getElementById('global-search-results').classList.add('hidden');" class="text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 cursor-pointer transition">
                    Jump
                </button>
            </div>
        </div>`;
    }).join('');

    resultsContainer.innerHTML = `
        <div class="p-2.5 bg-slate-900 border-b border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Found ${matches.length} matching problems</span>
        </div>
        ${listHtml}
        ${matches.length > maxShown ? `<div class="p-2.5 text-center text-xs text-slate-500 font-mono">Showing first ${maxShown} results</div>` : ''}
    `;
    resultsContainer.classList.remove('hidden');
}

// Close search dropdown on click outside
document.addEventListener('click', (e) => {
    const searchContainer = document.getElementById('global-search-results');
    const searchInput = document.getElementById('global-question-search');
    if (searchContainer && !searchContainer.contains(e.target) && e.target !== searchInput) {
        searchContainer.classList.add('hidden');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('global-question-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-question-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    } else if (e.key === 'Escape') {
        const searchContainer = document.getElementById('global-search-results');
        if (searchContainer) searchContainer.classList.add('hidden');
        closeProfileModal();
        closeWelcomeModal();
    }
});

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
    updateDashboardSummaries();
    renderDashboardTopicGrid();
    checkFirstTimeUser();
});
