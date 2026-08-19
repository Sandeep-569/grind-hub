// ==================== GrindHub Core Application Logic ====================

// --- View Controller Logic ---
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
    checkFirstTimeUser();
}

function showQuestionsView() {
    hideAllViews();
    const qView = document.getElementById('questions-view');
    if (qView) {
        qView.classList.remove('hidden');
        qView.classList.add('block');
    }
    renderQuestions();
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
            sectionEl.classList.add('ring-2', 'ring-emerald-400');
            setTimeout(() => sectionEl.classList.remove('ring-2', 'ring-emerald-400'), 1600);
        }
    }, 50);
}

// --- Helpers ---
function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function topicPill(topicKey) {
    if (!topicKey) return '';
    const cls = TOPIC_COLORS[topicKey] || TOPIC_COLORS['_default'];
    return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${cls}">${topicKey}</span>`;
}

function platformPill(platform) {
    const cls = PLATFORM_COLORS[platform] || 'text-slate-300 bg-slate-400/10 border-slate-400/30';
    return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${cls}">${platform}</span>`;
}

function difficultyBadgeClasses(difficulty) {
    if (difficulty === 'Easy') return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (difficulty === 'Medium') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
}

function escJs(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ==================== User Profile & Custom Links ====================
const PROFILE_KEY = 'dsa_user_profile_v1';
const SOLVED_KEY = 'dsa_tracker_solved_questions_v1';

const PRESET_COLORS = [
    { name: "Indigo", hex: "#6366f1" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Sky", hex: "#0ea5e9" },
    { name: "Teal", hex: "#14b8a6" }
];

const DEFAULT_PLATFORM_URLS = {
    "LeetCode": "https://leetcode.com",
    "HackerRank": "https://www.hackerrank.com",
    "Codeforces": "https://codeforces.com",
    "CodeChef": "https://www.codechef.com",
    "GeeksforGeeks": "https://www.geeksforgeeks.org",
    "CodeStudio": "https://www.naukri.com/code360/",
    "InterviewBit": "https://www.interviewbit.com",
    "AtCoder": "https://atcoder.jp"
};

const DEFAULT_PROFILE = {
    name: "Coder",
    color: "#6366f1",
    github: "",
    handles: {
        "LeetCode": "https://leetcode.com",
        "HackerRank": "https://www.hackerrank.com",
        "Codeforces": "https://codeforces.com",
        "CodeChef": "https://www.codechef.com",
        "GeeksforGeeks": "https://www.geeksforgeeks.org",
        "CodeStudio": "https://www.naukri.com/code360/",
        "InterviewBit": "https://www.interviewbit.com",
        "AtCoder": "https://atcoder.jp"
    }
};

let userProfile = loadUserProfile();

function loadUserProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                // If handles contains old personal urls, clean them to default
                if (parsed.handles) {
                    for (const p in parsed.handles) {
                        if (typeof parsed.handles[p] === 'string' && (parsed.handles[p].includes('codedbysandeep') || parsed.handles[p].includes('auth.geeksforgeeks.org/'))) {
                            parsed.handles[p] = DEFAULT_PLATFORM_URLS[p] || parsed.handles[p];
                        }
                    }
                }
                const merged = Object.assign({}, DEFAULT_PROFILE, parsed);
                return merged;
            }
        }
    } catch (e) {}

    saveUserProfile(DEFAULT_PROFILE);
    return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
}

function saveUserProfile(profile) {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {}
}

function updateProfileUI() {
    const avatarEl = document.getElementById('active-profile-avatar');
    const nameEl = document.getElementById('active-profile-name');
    if (avatarEl) {
        avatarEl.textContent = (userProfile.name || 'U').charAt(0).toUpperCase();
        avatarEl.style.backgroundColor = userProfile.color || '#6366f1';
    }
    if (nameEl) nameEl.textContent = userProfile.name || 'User';

    const welcomeEl = document.getElementById('dashboard-welcome-heading');
    if (welcomeEl) {
        welcomeEl.innerHTML = `Welcome back, <span class="text-white">${escAttr(userProfile.name || 'Coder')}</span>! 🚀`;
    }

    const githubLink = document.getElementById('profile-github-link');
    if (githubLink) {
        const gh = (userProfile.github || '').trim();
        if (gh) {
            githubLink.href = gh.startsWith('http') ? gh : `https://github.com/${gh}`;
            githubLink.classList.remove('hidden');
        } else {
            githubLink.classList.add('hidden');
        }
    }

    // Update Coding Profile Cards on Dashboard
    const handles = userProfile.handles || {};
    const platformToCard = {
        "LeetCode": { sel: '[data-platform="LeetCode"]', default: "https://leetcode.com" },
        "HackerRank": { sel: '[data-platform="HackerRank"]', default: "https://www.hackerrank.com" },
        "Codeforces": { sel: '[data-platform="Codeforces"]', default: "https://codeforces.com" },
        "CodeChef": { sel: '[data-platform="CodeChef"]', default: "https://www.codechef.com" },
        "GeeksforGeeks": { sel: '[data-platform="GeeksforGeeks"]', default: "https://www.geeksforgeeks.org" },
        "CodeStudio": { sel: '[data-platform="CodeStudio"]', default: "https://www.naukri.com/code360/" },
        "InterviewBit": { sel: '[data-platform="InterviewBit"]', default: "https://www.interviewbit.com" },
        "AtCoder": { sel: '[data-platform="AtCoder"]', default: "https://atcoder.jp" }
    };

    for (const [pName, cfg] of Object.entries(platformToCard)) {
        const card = document.querySelector(cfg.sel);
        if (card) {
            const url = (handles[pName] || '').trim() || cfg.default;
            card.href = url;
        }
    }
}

function renderColorOptions() {
    const container = document.getElementById('color-options-container');
    if (!container) return;
    container.innerHTML = PRESET_COLORS.map(c => `
        <button type="button" onclick="selectProfileColor('${c.hex}')"
            class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${userProfile.color === c.hex ? 'border-white scale-110' : 'border-transparent'}"
            style="background-color: ${c.hex};" title="${c.name}">
        </button>
    `).join('');
}

function selectProfileColor(hex) {
    const colorInput = document.getElementById('profile-modal-color');
    if (colorInput) colorInput.value = hex;
    userProfile.color = hex;
    renderColorOptions();
}

function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    const nameInput = document.getElementById('profile-modal-name');
    const colorInput = document.getElementById('profile-modal-color');
    const githubInput = document.getElementById('profile-modal-github');

    nameInput.value = userProfile.name || '';
    colorInput.value = userProfile.color || '#6366f1';
    githubInput.value = userProfile.github || '';

    document.getElementById('handle-leetcode').value = userProfile.handles?.LeetCode || '';
    document.getElementById('handle-hackerrank').value = userProfile.handles?.HackerRank || '';
    document.getElementById('handle-codeforces').value = userProfile.handles?.Codeforces || '';
    document.getElementById('handle-codechef').value = userProfile.handles?.CodeChef || '';
    document.getElementById('handle-geeksforgeeks').value = userProfile.handles?.GeeksforGeeks || '';
    document.getElementById('handle-codestudio').value = userProfile.handles?.CodeStudio || '';
    document.getElementById('handle-interviewbit').value = userProfile.handles?.InterviewBit || '';
    document.getElementById('handle-atcoder').value = userProfile.handles?.AtCoder || '';

    renderColorOptions();
    modal.classList.remove('hidden');
    nameInput.focus();
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
}

function saveProfileModal() {
    const nameInput = document.getElementById('profile-modal-name');
    const name = nameInput.value.trim();
    if (!name) {
        alert('Please enter a profile name.');
        nameInput.focus();
        return;
    }

    const color = document.getElementById('profile-modal-color').value || '#6366f1';
    const github = document.getElementById('profile-modal-github').value.trim();

    const handles = {
        "LeetCode": document.getElementById('handle-leetcode').value.trim() || 'https://leetcode.com',
        "HackerRank": document.getElementById('handle-hackerrank').value.trim() || 'https://hackerrank.com',
        "Codeforces": document.getElementById('handle-codeforces').value.trim() || 'https://codeforces.com',
        "CodeChef": document.getElementById('handle-codechef').value.trim() || 'https://codechef.com',
        "GeeksforGeeks": document.getElementById('handle-geeksforgeeks').value.trim() || 'https://geeksforgeeks.org',
        "CodeStudio": document.getElementById('handle-codestudio').value.trim() || 'https://www.naukri.com/code360/',
        "InterviewBit": document.getElementById('handle-interviewbit').value.trim() || 'https://interviewbit.com',
        "AtCoder": document.getElementById('handle-atcoder').value.trim() || 'https://atcoder.jp'
    };

    userProfile = {
        name: name,
        color: color,
        github: github,
        handles: handles
    };

    saveUserProfile(userProfile);
    closeProfileModal();
    updateProfileUI();
    showToast('Profile updated successfully! 👤');
}

// ==================== Resilient Storage & Auto-Migration ====================

function normalizeUrl(url) {
    if (!url) return '';
    return String(url).trim().replace(/\/+$/, '').toLowerCase();
}

let normalizedSolvedCache = null;
function getNormalizedSolvedCache() {
    if (!normalizedSolvedCache) {
        normalizedSolvedCache = new Set();
        solvedQuestions.forEach(u => {
            const norm = normalizeUrl(u);
            if (norm) normalizedSolvedCache.add(norm);
        });
    }
    return normalizedSolvedCache;
}

function isQuestionSolved(url) {
    if (!url) return false;
    if (solvedQuestions.has(url)) return true;
    return getNormalizedSolvedCache().has(normalizeUrl(url));
}

// Auto-discover and merge any legacy or updated localStorage keys
function loadSolvedQuestions() {
    const solved = new Set();
    try {
        // 1. Scan all localStorage keys for past progress across any profile or schema versions
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('dsa_tracker_solved_questions') || k.startsWith('dsa_solved_') || k === SOLVED_KEY)) {
                try {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const arr = JSON.parse(raw);
                        if (Array.isArray(arr)) {
                            arr.forEach(u => {
                                if (u && typeof u === 'string' && u.trim()) {
                                    solved.add(u.trim());
                                }
                            });
                        }
                    }
                } catch (err) {}
            }
        }
    } catch (e) {}

    // Persist consolidated clean state back
    saveSolvedQuestions(solved);
    return solved;
}

function saveSolvedQuestions(set) {
    try {
        const arr = Array.from(set);
        localStorage.setItem(SOLVED_KEY, JSON.stringify(arr));
        // Backward-compatibility mirror
        localStorage.setItem('dsa_tracker_solved_questions_profile-sandeep', JSON.stringify(arr));
    } catch (e) {
        console.warn('LocalStorage write error:', e);
    }
}

let solvedQuestions = loadSolvedQuestions();

function toggleQuestionSolved(url, checkboxEl) {
    const checked = checkboxEl.checked;
    const norm = normalizeUrl(url);

    if (checked) {
        solvedQuestions.add(url);
        getNormalizedSolvedCache().add(norm);
    } else {
        solvedQuestions.delete(url);
        Array.from(solvedQuestions).forEach(u => {
            if (normalizeUrl(u) === norm) solvedQuestions.delete(u);
        });
        getNormalizedSolvedCache().delete(norm);
    }

    saveSolvedQuestions(solvedQuestions);

    const li = checkboxEl.closest('.question-item');
    if (li) {
        const link = li.querySelector('a span.q-title');
        if (link) {
            link.classList.toggle('line-through', checked);
            link.classList.toggle('text-slate-500', checked);
        }
    }

    updateQuestionsProgressUI();
    updateDashboardSummaries();
    showToast(checked ? 'Problem marked as solved! 🎯' : 'Problem marked as unsolved');
}

function resetQuestionProgress() {
    if (!confirm(`Are you sure you want to reset all solved checkmarks for "${userProfile.name}"? This action cannot be undone unless you have an exported JSON backup.`)) return;
    solvedQuestions.clear();
    normalizedSolvedCache = null;
    saveSolvedQuestions(solvedQuestions);
    renderQuestions();
    updateDashboardSummaries();
    showToast('All progress reset');
}

// ==================== Data Export & Import (Backup & Restore) ====================
function exportUserData() {
    const backup = {
        app: "GrindHub DSA Tracker",
        version: 1,
        exportedAt: new Date().toISOString(),
        profile: userProfile,
        solvedQuestions: Array.from(solvedQuestions),
        totalSolved: solvedQuestions.size
    };

    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateSlug = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `grindhub-backup-${dateSlug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Progress backup downloaded! 📥');
}

function triggerImportUserData() {
    const input = document.getElementById('import-file-input');
    if (input) input.click();
}

function handleImportUserData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            let importedCount = 0;

            if (data.profile && typeof data.profile === 'object') {
                userProfile = Object.assign({}, DEFAULT_PROFILE, data.profile);
                saveUserProfile(userProfile);
                updateProfileUI();
            }

            if (Array.isArray(data.solvedQuestions)) {
                data.solvedQuestions.forEach(u => {
                    if (u && typeof u === 'string') {
                        solvedQuestions.add(u.trim());
                        importedCount++;
                    }
                });
                normalizedSolvedCache = null;
                saveSolvedQuestions(solvedQuestions);
            }

            renderQuestions();
            updateQuestionsProgressUI();
            updateDashboardSummaries();
            closeProfileModal();
            showToast(`Successfully imported ${importedCount} solved questions! 🎉`);
        } catch (err) {
            alert('Could not read backup file. Please ensure it is a valid JSON backup exported from GrindHub.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ==================== Floating Toast UI ====================
let toastTimer = null;
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const textEl = document.getElementById('toast-text');
    if (!container || !textEl) return;

    textEl.textContent = msg;
    container.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');
    container.classList.add('translate-y-0', 'opacity-100');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        container.classList.remove('translate-y-0', 'opacity-100');
        container.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
    }, 2000);
}

// --- Rendering: Unified Question Bank (Questions View) ---
function formatProblemName(url) {
    let path = url.split('/');
    let slug = path[path.length - 1] === "" ? path[path.length - 2] : path[path.length - 1];
    if (!slug) return url;
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function toggleAccordion(sectionId) {
    const content = document.getElementById(`content-${sectionId}`);
    const icon = document.getElementById(`icon-${sectionId}`);
    if (!content) return;
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}

function renderTopicAccordion(topic, difficulties) {
    const sectionId = `topic-${slugify(topic)}`;
    const allItems = [...difficulties.Easy, ...difficulties.Medium, ...difficulties.Hard];
    const total = allItems.length;
    const solvedCount = allItems.filter(it => isQuestionSolved(it.url)).length;
    const pill = topicPill(topic);

    let html = `
        <div id="${sectionId}" class="topic-block mb-3 border border-slate-700 rounded-lg bg-slate-800 overflow-hidden transition-all" data-topic="${topic.toLowerCase()}">
            <button onclick="toggleAccordion('${sectionId}')" class="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors focus:outline-none">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-white">${topic}</span>
                    ${pill}
                    <span class="text-xs text-slate-500" id="count-${sectionId}">${solvedCount}/${total} solved</span>
                </div>
                <svg id="icon-${sectionId}" class="w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="content-${sectionId}" class="hidden border-t border-slate-700 p-4 bg-slate-900/30">
    `;

    ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
        const list = difficulties[difficulty];
        if (!list || list.length === 0) return;
        const badgeCls = difficultyBadgeClasses(difficulty);

        html += `
            <div class="mb-4 last:mb-0">
                <div class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border mb-2 ${badgeCls}">
                    ${difficulty} <span class="ml-1 opacity-70">(${list.length})</span>
                </div>
                <ul class="space-y-1.5 ml-1 border-l-2 border-slate-700 pl-3">
        `;

        list.forEach(entry => {
            const isSolved = isQuestionSolved(entry.url);
            html += `
                <li class="question-item flex items-center gap-2" data-title="${escAttr(entry.title.toLowerCase())}" data-platform="${entry.platform.toLowerCase()}">
                    <input type="checkbox" ${isSolved ? 'checked' : ''} onclick="toggleQuestionSolved('${escJs(entry.url)}', this)"
                        class="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 flex-shrink-0 cursor-pointer">
                    <a href="${escAttr(entry.url)}" target="_blank" rel="noopener" class="text-sm text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 group transition-colors min-w-0 flex-grow">
                        ${platformPill(entry.platform)}
                        <span class="q-title truncate ${isSolved ? 'line-through text-slate-500' : ''}">${escAttr(entry.title)}</span>
                    </a>
                </li>
            `;
        });

        html += `
                </ul>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;
    return html;
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    let html = '';
    for (const [topic, difficulties] of Object.entries(questionsData)) {
        html += renderTopicAccordion(topic, difficulties);
    }
    container.innerHTML = html;

    // Platform legend
    const legend = document.getElementById('platform-legend');
    if (legend) {
        legend.innerHTML = Object.keys(PLATFORM_COLORS).map(p => platformPill(p)).join('');
    }

    updateQuestionsProgressUI();
}

// ==================== Global Fast Question Search (dashboard) ====================

let globalSearchIndex = null;
function buildGlobalSearchIndex() {
    const idx = [];
    for (const [topic, diffs] of Object.entries(questionsData)) {
        ['Easy', 'Medium', 'Hard'].forEach(diff => {
            diffs[diff].forEach(it => {
                idx.push({ title: it.title, url: it.url, platform: it.platform, topic, diff });
            });
        });
    }
    globalSearchIndex = idx;
}

function handleGlobalSearch(q) {
    const resultsEl = document.getElementById('global-search-results');
    q = q.trim().toLowerCase();
    if (!q) { resultsEl.classList.add('hidden'); resultsEl.innerHTML = ''; return; }
    if (!globalSearchIndex) buildGlobalSearchIndex();

    const matches = globalSearchIndex.filter(it => it.title.toLowerCase().includes(q)).slice(0, 20);
    if (matches.length === 0) {
        resultsEl.innerHTML = '<div class="p-3 text-sm text-slate-400">No questions found matching your search.</div>';
    } else {
        resultsEl.innerHTML = matches.map(it => {
            const isSolved = isQuestionSolved(it.url);
            const badgeCls = difficultyBadgeClasses(it.diff);
            return `
                <div class="p-2.5 hover:bg-slate-750 flex items-center justify-between gap-3 border-b border-slate-700/50 last:border-0">
                    <a href="${escAttr(it.url)}" target="_blank" rel="noopener" class="flex items-center gap-2 min-w-0 flex-grow text-slate-200 hover:text-emerald-400 text-sm">
                        ${platformPill(it.platform)}
                        <span class="truncate ${isSolved ? 'line-through text-slate-500' : ''}">${escAttr(it.title)}</span>
                    </a>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-[10px] px-1.5 py-0.5 rounded border ${badgeCls}">${it.diff}</span>
                        <button onclick="goToTopicQuestions('${escJs(it.topic)}')" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">${escAttr(it.topic)} →</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    resultsEl.classList.remove('hidden');
}

// --- Questions Progress Stats & Progress Bar ---
function updateQuestionsProgressUI() {
    let total = 0, solved = 0;
    for (const topic in questionsData) {
        ['Easy', 'Medium', 'Hard'].forEach(d => {
            questionsData[topic][d].forEach(it => {
                total++;
                if (isQuestionSolved(it.url)) solved++;
            });
        });
    }
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

    const label = document.getElementById('questions-progress-label');
    if (label) label.textContent = `${solved} / ${total} solved (${pct}%)`;
    const bar = document.getElementById('questions-progress-bar');
    if (bar) bar.style.width = `${pct}%`;

    // update each topic's solved/total count badge
    for (const topic in questionsData) {
        const sectionId = `topic-${slugify(topic)}`;
        const countEl = document.getElementById(`count-${sectionId}`);
        if (!countEl) continue;
        const allItems = [...questionsData[topic].Easy, ...questionsData[topic].Medium, ...questionsData[topic].Hard];
        const topicSolved = allItems.filter(it => isQuestionSolved(it.url)).length;
        countEl.textContent = `${topicSolved}/${allItems.length} solved`;
    }
}

// --- Search / Filter (Questions View) ---
function filterQuestions(query) {
    const q = query.trim().toLowerCase();
    const blocks = document.querySelectorAll('.topic-block');

    blocks.forEach(block => {
        const items = block.querySelectorAll('.question-item');
        const content = block.querySelector('[id^="content-"]');
        const icon = block.querySelector('[id^="icon-"]');
        let visibleCount = 0;

        items.forEach(item => {
            const matches = q === '' || item.dataset.title.includes(q) || item.dataset.platform.includes(q) || block.dataset.topic.includes(q);
            item.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        });

        if (q === '') {
            block.style.display = '';
            if (content) content.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
        } else if (visibleCount === 0) {
            block.style.display = 'none';
        } else {
            block.style.display = '';
            if (content) content.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    });
}

// --- Dashboard summary text ---
function updateDashboardSummaries() {
    let qTotal = 0, qSolved = 0;
    for (const topic in questionsData) {
        ['Easy', 'Medium', 'Hard'].forEach(d => {
            questionsData[topic][d].forEach(it => {
                qTotal++;
                if (isQuestionSolved(it.url)) qSolved++;
            });
        });
    }
    const platformCount = document.querySelectorAll('[data-platform]').length || 8;
    const qEl = document.getElementById('dashboard-question-progress');
    if (qEl) qEl.textContent = `${qTotal} questions across ${platformCount} platforms · ${qSolved} solved so far`;

    const titleEl = document.getElementById('questions-card-title');
    if (titleEl) titleEl.textContent = `DSA Questions — All Platforms`;

    updatePlatformSolvedCounts();
}

// --- Per-platform solved counts on "My Coding Profiles" cards ---
function updatePlatformSolvedCounts() {
    function normalizePlatform(p) {
        if (p === 'GFG') return 'GeeksforGeeks';
        if (p === 'Coding Ninjas' || p === 'CodingNinjas' || p === 'CodeStudio') return 'CodeStudio';
        return p;
    }

    const solvedByPlatform = {};
    for (const topic in questionsData) {
        ['Easy', 'Medium', 'Hard'].forEach(d => {
            questionsData[topic][d].forEach(it => {
                if (!isQuestionSolved(it.url)) return;
                const key = normalizePlatform(it.platform);
                solvedByPlatform[key] = (solvedByPlatform[key] || 0) + 1;
            });
        });
    }

    document.querySelectorAll('[data-platform]').forEach(card => {
        const platform = card.getAttribute('data-platform');
        const countEl = card.querySelector('.platform-solved-count');
        if (countEl) countEl.textContent = solvedByPlatform[platform] || 0;
    });
}


// ==================== First-Time Welcome Modal Logic ====================
const HAS_ONBOARDED_KEY = 'dsa_user_has_onboarded_v1';
let welcomeSelectedColor = userProfile.color || '#6366f1';

function renderWelcomeColorOptions() {
    const container = document.getElementById('welcome-color-options');
    if (!container) return;
    container.innerHTML = PRESET_COLORS.map(c => `
        <button type="button" onclick="selectWelcomeColor('${c.hex}')"
            class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${welcomeSelectedColor === c.hex ? 'border-white scale-110 ring-2 ring-indigo-400' : 'border-transparent'}"
            style="background-color: ${c.hex};" title="${c.name}">
        </button>
    `).join('');
}

function selectWelcomeColor(hex) {
    welcomeSelectedColor = hex;
    renderWelcomeColorOptions();
}

function openWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    const nameInput = document.getElementById('welcome-modal-name');
    if (!modal) return;

    if (nameInput) {
        nameInput.value = (userProfile.name && userProfile.name !== 'Coder' && userProfile.name !== 'User') ? userProfile.name : '';
    }
    welcomeSelectedColor = userProfile.color || '#6366f1';
    renderWelcomeColorOptions();
    modal.classList.remove('hidden');
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.add('hidden');
}

function submitWelcomeModal() {
    const nameInput = document.getElementById('welcome-modal-name');
    const name = (nameInput ? nameInput.value : '').trim();
    if (!name) {
        alert('Please enter your name.');
        if (nameInput) nameInput.focus();
        return;
    }

    userProfile.name = name;
    userProfile.color = welcomeSelectedColor;
    saveUserProfile(userProfile);
    localStorage.setItem(HAS_ONBOARDED_KEY, 'true');

    closeWelcomeModal();
    updateProfileUI();
    updateDashboardSummaries();
    showToast(`Welcome back, ${name}! 🚀`);
}

function checkFirstTimeUser() {
    const hasOnboarded = localStorage.getItem(HAS_ONBOARDED_KEY);
    if (!hasOnboarded) {
        openWelcomeModal();
    }
}

// Initialize App
window.onload = function () {
    updateProfileUI();
    updateDashboardSummaries();
};
