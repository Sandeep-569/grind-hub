// ==================== GrindHub: Professional DSA Problem Tracker ====================

// --- Storage Keys ---
const PROFILE_KEY = 'dsa_user_profile_v1';
const SOLVED_KEY = 'dsa_tracker_solved_questions_v1';
const STARRED_KEY = 'dsa_tracker_starred_v1';
const VISITED_KEY = 'dsa_tracker_has_visited_v1';

const PRESET_COLORS = [
    { name: "LeetCode Orange", hex: "#ffa116" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#10b981" },
    { name: "Purple", hex: "#8b5cf6" },
    { name: "Rose", hex: "#f43f5e" }
];

const DEFAULT_PROFILE = {
    name: "Coder",
    color: "#ffa116",
    github: "",
    codolioUrl: ""
};

// --- Topic Metadata & Icons ---
const TOPIC_METADATA = {
    "Patterns": { icon: "📘", category: "core" },
    "Bit Manipulation & Math": { icon: "🔢", category: "core" },
    "Arrays": { icon: "🟢", category: "core" },
    "Matrix": { icon: "▦", category: "core" },
    "Strings": { icon: "🧵", category: "core" },
    "Searching": { icon: "🔍", category: "core" },
    "Sorting": { icon: "📊", category: "core" },
    "Two Pointer & Sliding Window": { icon: "🪟", category: "core" },
    "Linked List": { icon: "🔗", category: "core" },
    "Stacks & Queues": { icon: "🥞", category: "core" },
    "HashMap / Hash Table": { icon: "🔑", category: "advanced" },
    "Recursion & Backtracking": { icon: "🔄", category: "advanced" },
    "Greedy": { icon: "⚡", category: "advanced" },
    "Intervals": { icon: "📏", category: "advanced" },
    "Trees": { icon: "🌲", category: "advanced" },
    "Heaps": { icon: "📐", category: "advanced" },
    "Tries": { icon: "🌴", category: "advanced" },
    "Graphs": { icon: "🕸️", category: "advanced" },
    "Union Find / Disjoint Set": { icon: "🪢", category: "advanced" },
    "Dynamic Programming": { icon: "💡", category: "advanced" },
    "Segment Tree / Binary Indexed Tree": { icon: "🌳", category: "advanced" },
    "Design": { icon: "🛠️", category: "advanced" },
    "OOP": { icon: "🧩", category: "advanced" }
};

// Platform Shorthand Tokens & Styles
const PLATFORM_SHORTHAND = {
    "LeetCode": { code: "LC", class: "platform-lc" },
    "GeeksforGeeks": { code: "GFG", class: "platform-gfg" },
    "HackerRank": { code: "HR", class: "platform-hr" },
    "Codeforces": { code: "CF", class: "platform-cf" },
    "CodeChef": { code: "CC", class: "platform-cc" },
    "InterviewBit": { code: "IB", class: "platform-ib" },
    "AtCoder": { code: "AC", class: "platform-ac" },
    "CodeStudio": { code: "CS", class: "platform-other" }
};

// --- Application State ---
let userProfile = loadUserProfile();
let solvedSet = loadSolvedQuestions();
let starredSet = loadStarredQuestions();

let searchFilter = '';
let statusFilter = 'all';     // 'all' | 'unsolved' | 'solved' | 'starred'
let diffFilter = 'all';       // 'all' | 'Easy' | 'Medium' | 'Hard'
let platformFilter = 'all';   // 'all' | Platform string

let accordionCollapsed = {}; // topicKey -> boolean

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

function escJs(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getPlatformBadgeHTML(platform) {
    const info = PLATFORM_SHORTHAND[platform] || { code: (platform || 'OTH').slice(0, 3).toUpperCase(), class: 'platform-other' };
    return `<span class="platform-pill ${info.class}">${info.code}</span>`;
}

function getDifficultyBadgeHTML(difficulty) {
    const cls = (difficulty === 'Easy') ? 'badge-easy' : (difficulty === 'Medium') ? 'badge-medium' : 'badge-hard';
    return `<span class="${cls}">${difficulty || 'Easy'}</span>`;
}

function extractSubtitle(title, topic) {
    if (!title) return '';
    const match = title.match(/\(([^)]+)\)/);
    if (match && match[1]) {
        return match[1];
    }
    // Generic approach hint fallback derived from topic
    if (topic === 'Sorting') return 'Divide & Conquer / Comparison Sort';
    if (topic === 'Binary Search' || topic === 'Searching') return 'Logarithmic Divide & Conquer';
    if (topic === 'Two Pointer & Sliding Window') return 'Two Pointer Window Scanning';
    if (topic === 'Dynamic Programming') return 'Optimal Substructure & Memoization';
    if (topic === 'Graphs') return 'Traversal & Graph Topography';
    if (topic === 'Trees') return 'Recursive Tree Traversal';
    if (topic === 'Bit Manipulation & Math') return 'Bitwise Bitmasks & Formulae';
    return 'Optimal Solution Strategy';
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToTopic(topicKey) {
    const topicSlug = slugify(topicKey);
    const section = document.getElementById(`topic-${topicSlug}`);
    if (section) {
        const tableContainer = section.querySelector('.problem-table-container');
        const arrow = section.querySelector('.accordion-arrow');
        if (tableContainer && tableContainer.classList.contains('hidden')) {
            tableContainer.classList.remove('hidden');
            accordionCollapsed[topicKey] = false;
            if (arrow) arrow.classList.remove('rotate-180');
        }
        const yOffset = -80;
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
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
}

function updateProfileUI() {
    const profileName = (userProfile.name || 'Coder').trim();
    applyThemeAccent(userProfile.color || '#ffa116');

    const avatarEl = document.getElementById('active-profile-avatar');
    const nameEl = document.getElementById('active-profile-name');
    if (avatarEl) {
        avatarEl.textContent = getInitial(profileName);
        avatarEl.style.backgroundColor = userProfile.color || '#ffa116';
        avatarEl.style.color = '#0a0a0a';
    }
    if (nameEl) nameEl.textContent = profileName;

    const welcomeEl = document.getElementById('dashboard-welcome-heading');
    if (welcomeEl) {
        welcomeEl.innerHTML = `Welcome back, <span id="dashboard-user-name" onclick="openProfileModal()" title="Edit Profile" class="text-[#ffa116] cursor-pointer hover:underline font-bold">${escAttr(profileName)}</span>`;
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
    if (colorInput) colorInput.value = userProfile.color || '#ffa116';
    if (githubInput) githubInput.value = userProfile.github || '';
    if (codolioInput) codolioInput.value = userProfile.codolioUrl || '';

    renderColorOptions('profile-color-options', userProfile.color || '#ffa116', (selected) => {
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
    userProfile.color = (colorInput && colorInput.value.trim()) ? colorInput.value.trim() : '#ffa116';
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
        btn.className = `w-6 h-6 rounded-full transition transform cursor-pointer ${c.hex.toLowerCase() === activeColor.toLowerCase() ? 'scale-125 ring-2 ring-[#ffa116] ring-offset-2 ring-offset-[#0a0a0a]' : 'opacity-70 hover:opacity-100'}`;
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
        updateSingleQuestionRowUI(idKey, false);
    } else {
        solvedSet.add(idKey);
        saveSolvedQuestions();
        updateSingleQuestionRowUI(idKey, true);
    }
    updateDashboardSummaries();
    updatePlatformLegend();
    renderSidebar();
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
    if (statusFilter === 'starred') {
        renderProblemAccordions();
    }
}

function updateSingleQuestionRowUI(idKey, isSolved) {
    document.querySelectorAll(`input[data-qid="${CSS.escape(idKey)}"]`).forEach(input => {
        input.checked = isSolved;
        const row = input.closest('.problem-row');
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

// ==================== Dashboard Summaries & Platform Stats ====================
function updateDashboardSummaries() {
    let totalQuestions = 0;
    let totalEasy = 0;
    let totalMed = 0;
    let totalHard = 0;
    let solvedCount = 0;
    let solvedEasy = 0;
    let solvedMed = 0;
    let solvedHard = 0;

    if (typeof questionsData !== 'undefined') {
        for (const topic in questionsData) {
            (questionsData[topic].Easy || []).forEach(q => {
                totalQuestions++;
                totalEasy++;
                if (solvedSet.has(q.id)) { solvedCount++; solvedEasy++; }
            });
            (questionsData[topic].Medium || []).forEach(q => {
                totalQuestions++;
                totalMed++;
                if (solvedSet.has(q.id)) { solvedCount++; solvedMed++; }
            });
            (questionsData[topic].Hard || []).forEach(q => {
                totalQuestions++;
                totalHard++;
                if (solvedSet.has(q.id)) { solvedCount++; solvedHard++; }
            });
        }
    }

    const pct = totalQuestions ? Math.round((solvedCount / totalQuestions) * 100) : 0;
    const remaining = Math.max(0, totalQuestions - solvedCount);

    const sidebarPct = document.getElementById('sidebar-progress-pct');
    const sidebarBar = document.getElementById('sidebar-progress-bar');
    const sidebarSolved = document.getElementById('sidebar-progress-solved');
    const sidebarTotal = document.getElementById('sidebar-progress-total');

    if (sidebarPct) sidebarPct.textContent = `${pct}%`;
    if (sidebarBar) sidebarBar.style.width = `${pct}%`;
    if (sidebarSolved) sidebarSolved.textContent = `${solvedCount.toLocaleString()} Solved`;
    if (sidebarTotal) sidebarTotal.textContent = `${totalQuestions.toLocaleString()} Total`;

    const dashTotal = document.getElementById('dash-stat-total');
    const dashHeroTotal = document.getElementById('dash-hero-total');
    if (dashTotal) dashTotal.textContent = totalQuestions.toLocaleString();
    if (dashHeroTotal) dashHeroTotal.textContent = totalQuestions.toLocaleString();

    const dashTotalEasy = document.getElementById('dash-total-easy');
    const dashTotalMed = document.getElementById('dash-total-med');
    const dashTotalHard = document.getElementById('dash-total-hard');
    if (dashTotalEasy) dashTotalEasy.textContent = totalEasy.toLocaleString();
    if (dashTotalMed) dashTotalMed.textContent = totalMed.toLocaleString();
    if (dashTotalHard) dashTotalHard.textContent = totalHard.toLocaleString();

    const dashEasy = document.getElementById('dash-solved-easy');
    const dashMed = document.getElementById('dash-solved-med');
    const dashHard = document.getElementById('dash-solved-hard');
    if (dashEasy) dashEasy.textContent = `E: ${solvedEasy}/${totalEasy}`;
    if (dashMed) dashMed.textContent = `M: ${solvedMed}/${totalMed}`;
    if (dashHard) dashHard.textContent = `H: ${solvedHard}/${totalHard}`;
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
        const info = PLATFORM_SHORTHAND[p] || { code: p, class: 'platform-other' };
        return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${info.class}">
            <span>${p}</span>
            <span class="text-neutral-400 font-normal">${pSol}/${count}</span>
        </span>`;
    }).join('');
}

// ==================== SIDEBAR RENDERING ====================
function renderSidebar() {
    const container = document.getElementById('sidebar-topic-list');
    if (!container || typeof questionsData === 'undefined') return;

    const topics = getTopicKeys();
    
    // Group topics into Core and Advanced without Step numbers
    const coreTopics = topics.filter(t => (TOPIC_METADATA[t]?.category || 'core') === 'core');
    const advTopics = topics.filter(t => (TOPIC_METADATA[t]?.category || 'advanced') === 'advanced');

    let html = '';

    // Core Topics Group
    if (coreTopics.length > 0) {
        html += `
        <div>
            <div class="px-2 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                CORE TOPICS
            </div>
            <div class="space-y-0.5">
                ${coreTopics.map(t => renderSidebarItemHTML(t)).join('')}
            </div>
        </div>`;
    }

    // Advanced Topics Group
    if (advTopics.length > 0) {
        html += `
        <div>
            <div class="px-2 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                ADVANCED TOPICS
            </div>
            <div class="space-y-0.5">
                ${advTopics.map(t => renderSidebarItemHTML(t)).join('')}
            </div>
        </div>`;
    }

    container.innerHTML = html;
}

function renderSidebarItemHTML(topicKey) {
    const meta = TOPIC_METADATA[topicKey] || { icon: "📁" };
    const easyList = questionsData[topicKey].Easy || [];
    const medList = questionsData[topicKey].Medium || [];
    const hardList = questionsData[topicKey].Hard || [];
    const totalInTopic = easyList.length + medList.length + hardList.length;

    return `
    <a href="javascript:void(0)" onclick="scrollToTopic('${escJs(topicKey)}')" class="sidebar-item group" id="side-item-${slugify(topicKey)}">
        <div class="flex items-center gap-2 truncate">
            <span class="text-sm">${meta.icon}</span>
            <span class="truncate">${topicKey}</span>
        </div>
        <span class="badge-count">${totalInTopic}</span>
    </a>`;
}

// ==================== ACCORDIONS & PROBLEM TABLES RENDERING ====================
function renderProblemAccordions() {
    const container = document.getElementById('problem-accordion-container');
    if (!container || typeof questionsData === 'undefined') return;

    const topics = getTopicKeys();
    const query = searchFilter.toLowerCase();

    let html = '';
    let globalIndex = 0;

    topics.forEach((topicKey) => {
        const meta = TOPIC_METADATA[topicKey] || { icon: "📁" };
        const easyList = questionsData[topicKey].Easy || [];
        const medList = questionsData[topicKey].Medium || [];
        const hardList = questionsData[topicKey].Hard || [];

        // Combine all questions for this topic
        const allQuestions = [
            ...easyList.map(q => ({ ...q, difficulty: 'Easy' })),
            ...medList.map(q => ({ ...q, difficulty: 'Medium' })),
            ...hardList.map(q => ({ ...q, difficulty: 'Hard' }))
        ];

        // Apply Multi-Filters
        const filteredQuestions = allQuestions.filter(q => {
            // Text Search
            if (query) {
                const matchTitle = q.title.toLowerCase().includes(query);
                const matchTopic = topicKey.toLowerCase().includes(query);
                const matchPlatform = (q.platform || '').toLowerCase().includes(query);
                if (!matchTitle && !matchTopic && !matchPlatform) return false;
            }

            // Status Filter
            if (statusFilter === 'solved' && !solvedSet.has(q.id)) return false;
            if (statusFilter === 'unsolved' && solvedSet.has(q.id)) return false;
            if (statusFilter === 'starred' && !starredSet.has(q.id)) return false;

            // Difficulty Filter
            if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false;

            // Platform Filter
            if (platformFilter !== 'all' && (q.platform || 'Other') !== platformFilter) return false;

            return true;
        });

        // Hide topic section if zero matches found under active search/filter
        if (filteredQuestions.length === 0 && (query || statusFilter !== 'all' || diffFilter !== 'all' || platformFilter !== 'all')) {
            return;
        }

        const topicSlug = slugify(topicKey);
        const isCollapsed = !!accordionCollapsed[topicKey];

        html += `
        <section id="topic-${topicSlug}" class="scroll-mt-24">
            <!-- Accordion Header Card (Clean Text, No Step X prefix) -->
            <div onclick="toggleAccordion('${escJs(topicKey)}')" class="accordion-header">
                <div class="flex items-center gap-3">
                    <span class="text-xl">${meta.icon}</span>
                    <div>
                        <h2 class="text-base font-bold text-white tracking-tight">
                            ${topicKey}
                        </h2>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <span class="text-xs font-mono font-bold text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/40 px-2.5 py-1 rounded-full">
                        ${filteredQuestions.length} problems
                    </span>
                    <button type="button" class="text-neutral-400 hover:text-white transition p-1">
                        <svg class="accordion-arrow w-4 h-4 transform ${isCollapsed ? 'rotate-180' : ''} transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Problem Table Section -->
            <div class="${isCollapsed ? 'hidden' : 'block'} problem-table-container">
                <table class="problem-table">
                    <thead>
                        <tr>
                            <th class="w-12 text-center">#</th>
                            <th>PROBLEM</th>
                            <th class="w-28 text-center">DIFF</th>
                            <th class="w-24 text-center">PLATFORM</th>
                            <th class="w-16 text-center">✓</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredQuestions.map(q => {
                            globalIndex++;
                            const isSolved = solvedSet.has(q.id);
                            const isStarred = starredSet.has(q.id);
                            const subtitle = extractSubtitle(q.title, topicKey);

                            return `
                            <tr class="problem-row ${isSolved ? 'is-solved' : ''}">
                                <!-- Number -->
                                <td class="text-center font-mono text-xs text-neutral-500 font-semibold">${globalIndex}</td>

                                <!-- Title & Subtitle -->
                                <td>
                                    <div class="flex items-start justify-between gap-2">
                                        <div>
                                            <a href="${escAttr(q.url)}" target="_blank" class="q-title-link">
                                                ${escAttr(q.title)}
                                            </a>
                                            ${subtitle ? `<div class="q-subtitle">${escAttr(subtitle)}</div>` : ''}
                                        </div>
                                    </div>
                                </td>

                                <!-- Difficulty Badge -->
                                <td class="text-center">
                                    ${getDifficultyBadgeHTML(q.difficulty)}
                                </td>

                                <!-- Platform Pill -->
                                <td class="text-center">
                                    ${getPlatformBadgeHTML(q.platform)}
                                </td>

                                <!-- Checkbox & Star -->
                                <td class="text-center">
                                    <div class="flex items-center justify-center gap-1.5">
                                        <button type="button" onclick="toggleQuestionStarred('${escJs(q.id)}', event)" data-starid="${escAttr(q.id)}" class="star-btn ${isStarred ? 'starred' : ''}" title="${isStarred ? 'Remove bookmark' : 'Bookmark problem'}">
                                            ${isStarred ? '★' : '☆'}
                                        </button>
                                        <input type="checkbox" data-qid="${escAttr(q.id)}" ${isSolved ? 'checked' : ''} onchange="toggleQuestionSolved('${escJs(q.id)}', event)" class="pro-checkbox" title="Mark as solved">
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </section>`;
    });

    if (!html) {
        html = `
        <div class="pro-card p-10 text-center text-neutral-400">
            <p class="font-semibold text-base text-white">No problems found matching your active filters.</p>
            <p class="text-xs text-neutral-400 mt-1">Try clearing your search query or setting filters to "All".</p>
            <button onclick="resetAllFilters()" class="mt-4 px-4 py-1.5 bg-[#ffa116] hover:bg-[#ff9900] text-black font-bold text-xs rounded-lg transition cursor-pointer">
                Reset All Filters
            </button>
        </div>`;
    }

    container.innerHTML = html;
}

// 0ms Instant Accordion Toggle (Direct DOM manipulation - Zero lag!)
function toggleAccordion(topicKey) {
    const topicSlug = slugify(topicKey);
    const section = document.getElementById(`topic-${topicSlug}`);
    if (!section) return;

    const tableContainer = section.querySelector('.problem-table-container');
    const arrow = section.querySelector('.accordion-arrow');

    if (tableContainer) {
        tableContainer.classList.toggle('hidden');
        const isCollapsed = tableContainer.classList.contains('hidden');
        accordionCollapsed[topicKey] = isCollapsed;

        if (arrow) {
            if (isCollapsed) {
                arrow.classList.add('rotate-180');
            } else {
                arrow.classList.remove('rotate-180');
            }
        }
    }
}

// ==================== FILTER & SEARCH HANDLERS ====================
function onSearchInputChanged() {
    const input = document.getElementById('global-search-input');
    searchFilter = input ? input.value.trim() : '';
    renderProblemAccordions();
}

function onFilterChanged() {
    const statusEl = document.getElementById('filter-status');
    const diffEl = document.getElementById('filter-diff');
    const platEl = document.getElementById('filter-platform');

    statusFilter = statusEl ? statusEl.value : 'all';
    diffFilter = diffEl ? diffEl.value : 'all';
    platformFilter = platEl ? platEl.value : 'all';

    renderProblemAccordions();
}

function resetAllFilters() {
    const searchInput = document.getElementById('global-search-input');
    const statusEl = document.getElementById('filter-status');
    const diffEl = document.getElementById('filter-diff');
    const platEl = document.getElementById('filter-platform');

    if (searchInput) searchInput.value = '';
    if (statusEl) statusEl.value = 'all';
    if (diffEl) diffEl.value = 'all';
    if (platEl) platEl.value = 'all';

    searchFilter = '';
    statusFilter = 'all';
    diffFilter = 'all';
    platformFilter = 'all';

    renderProblemAccordions();
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
    updateDashboardSummaries();
    updatePlatformLegend();
    renderSidebar();
    renderProblemAccordions();
    checkFirstTimeUser();
});
