// ==================== GrindNeko: Cyber-Cat DSA Tracker & Problem Vault ====================

// --- Storage Keys ---
const PROFILE_KEY = 'dsa_user_profile_v1';
const SOLVED_KEY = 'dsa_tracker_solved_questions_v1';
const STARRED_KEY = 'dsa_tracker_starred_v1';
const VISITED_KEY = 'dsa_tracker_has_visited_v1';

// --- Cat Mascot & Preset Palettes ---
const CAT_AVATARS = ["🐱", "😸", "😻", "😼", "😽", "🐈‍⬛", "🦁", "🐯", "🐾", "⚡"];

const PRESET_COLORS = [
    { name: "Cyber Pink", hex: "#ff5376", glow: "rgba(255, 83, 118, 0.35)" },
    { name: "Neon Purple", hex: "#8b5cf6", glow: "rgba(139, 92, 246, 0.35)" },
    { name: "Electric Cyan", hex: "#06b6d4", glow: "rgba(6, 182, 212, 0.35)" },
    { name: "Cat Amber", hex: "#f59e0b", glow: "rgba(245, 158, 11, 0.35)" },
    { name: "Neon Emerald", hex: "#10b981", glow: "rgba(16, 185, 129, 0.35)" },
    { name: "Cyber Indigo", hex: "#6366f1", glow: "rgba(99, 102, 241, 0.35)" },
    { name: "Laser Rose", hex: "#f43f5e", glow: "rgba(244, 63, 94, 0.35)" },
    { name: "Sky Blue", hex: "#0ea5e9", glow: "rgba(14, 165, 233, 0.35)" }
];

const TOPIC_ICONS = {
    "Patterns": "📐",
    "Bit Manipulation & Math": "⚡",
    "Arrays": "📦",
    "Matrix": "🔢",
    "Strings": "🔤",
    "Searching": "🔍",
    "Sorting": "📊",
    "Two Pointer & Sliding Window": "🪟",
    "Linked List": "🔗",
    "Stacks & Queues": "📚",
    "HashMap / Hash Table": "🗺️",
    "Recursion & Backtracking": "🌀",
    "Greedy": "💰",
    "Intervals": "⏱️",
    "Trees": "🌲",
    "Heaps": "⛰️",
    "Tries": "🌴",
    "Graphs": "🕸️",
    "Union Find / Disjoint Set": "🤝",
    "Dynamic Programming": "🧩",
    "Segment Tree / Binary Indexed Tree": "🎋",
    "Design": "🏗️",
    "OOP": "🏛️",
    "_default": "🐾"
};

const FELINE_RANKS = [
    { min: 0, title: "Novice Kitten", icon: "🍼", nextDesc: "Solve 25 for Curious Prowler", nextTarget: 25 },
    { min: 25, title: "Curious Prowler", icon: "🐾", nextDesc: "Solve 100 for Cyber TomCat", nextTarget: 100 },
    { min: 100, title: "Cyber TomCat", icon: "⚡", nextDesc: "Solve 250 for Ninja Shorthair", nextTarget: 250 },
    { min: 250, title: "Ninja Shorthair", icon: "🗡️", nextDesc: "Solve 500 for Shadow Panther", nextTarget: 500 },
    { min: 500, title: "Shadow Panther", icon: "🔮", nextDesc: "Solve 1,000 for Apex Mythic Neko", nextTarget: 1000 },
    { min: 1000, title: "Apex Mythic Neko", icon: "👑", nextDesc: "Master of all algorithms!", nextTarget: 3532 }
];

const NEKO_QUOTES = [
    "Meow! You can master Dynamic Programming! 🐾",
    "Knock that Hard graph problem off the table! 😼",
    "A cat always lands on its feet, and you'll land this binary search! 🐱",
    "Purr-fect recursion depth! Keep grinding! ✨",
    "Time for a cat nap? No, one more tree traversal first! 🐾",
    "Claw through the test cases! Zero WA allowed! 🦁",
    "Treat yourself to a fish 🐟 after solving 5 problems!",
    "Even the longest linked list starts with a single node! 🐾",
    "Sharpen your claws on some Two Pointers today! 😼",
    "You're purr-fectly capable of clearing FAANG! 👑",
    "Keep calm and cuddle the stack! 🐱‍💻",
    "Fish treats earned: Keep pouncing on those problems! 🐟",
    "Sliding window? More like a cat looking out the window! 🪟🐱",
    "Memoization is just saving tasty snacks for later! 🐟✨"
];

const DEFAULT_PROFILE = {
    name: "Coder",
    color: "#ff5376",
    avatarEmoji: "🐱",
    soundEnabled: true,
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
            sectionEl.classList.add('ring-2', 'ring-pink-400');
            setTimeout(() => sectionEl.classList.remove('ring-2', 'ring-pink-400'), 1600);
        }
    }, 100);
}

// ==================== Helpers ====================
function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function topicPill(topicKey) {
    if (!topicKey) return '';
    const cls = (typeof TOPIC_COLORS !== 'undefined' && TOPIC_COLORS[topicKey]) ? TOPIC_COLORS[topicKey] : 'text-pink-400 bg-pink-950/40 border-pink-500/30';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${cls}">${topicKey}</span>`;
}

function platformPill(platform) {
    const cls = (typeof PLATFORM_COLORS !== 'undefined' && PLATFORM_COLORS[platform]) ? PLATFORM_COLORS[platform] : 'text-slate-300 bg-slate-400/10 border-slate-400/30';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 ${cls}">${platform || 'Other'}</span>`;
}

function difficultyBadgeClasses(difficulty) {
    if (difficulty === 'Easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (difficulty === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
}

function escJs(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ==================== Audio Synthesis (Meow / Chime FX) ====================
let audioCtx = null;

function playFelineChime(isMeow = false) {
    if (!userProfile.soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (isMeow) {
            // Sweet cute feline chirp
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5
            
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            osc.start(now);
            osc.stop(now + 0.4);
        } else {
            // Sparkling completion chime
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.14); // G5
            osc.frequency.setValueAtTime(1046.50, now + 0.22); // C6

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.16, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.start(now);
            osc.stop(now + 0.45);
        }
    } catch (e) {}
}

function toggleSound() {
    userProfile.soundEnabled = !userProfile.soundEnabled;
    saveUserProfile(userProfile);
    updateSoundUI();
    showToast(userProfile.soundEnabled ? "Sound FX: Meow & Chimes Enabled 🔊" : "Sound FX: Muted 🔇");
}

function updateSoundUI() {
    const btn = document.getElementById('sound-toggle-icon');
    if (btn) {
        btn.textContent = userProfile.soundEnabled ? "🔊" : "🔇";
    }
    const modalSound = document.getElementById('profile-modal-sound');
    if (modalSound) {
        modalSound.checked = !!userProfile.soundEnabled;
    }
}

// ==================== Floating Paw Particle ====================
function spawnFloatingPaw(x, y) {
    const paw = document.createElement('div');
    paw.className = 'floating-paw';
    paw.textContent = '🐾';
    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;
    document.body.appendChild(paw);
    setTimeout(() => {
        if (paw && paw.parentNode) paw.parentNode.removeChild(paw);
    }, 950);
}

// ==================== Interactive Neko Desk Mascot ====================
function petTheCat() {
    const speechEl = document.getElementById('neko-speech-text');
    const bubbleEl = document.getElementById('neko-speech-bubble');
    const mascotEmoji = document.getElementById('neko-mascot-emoji');

    if (speechEl) {
        const randomQuote = NEKO_QUOTES[Math.floor(Math.random() * NEKO_QUOTES.length)];
        speechEl.textContent = randomQuote;
    }

    if (mascotEmoji) {
        mascotEmoji.classList.remove('animate-purr');
        mascotEmoji.classList.add('scale-125', 'rotate-12');
        setTimeout(() => {
            mascotEmoji.classList.remove('scale-125', 'rotate-12');
            mascotEmoji.classList.add('animate-purr');
        }, 400);
    }

    if (bubbleEl) {
        bubbleEl.classList.remove('hidden');
        bubbleEl.classList.add('scale-105');
        setTimeout(() => bubbleEl.classList.remove('scale-105'), 300);
    }

    // Spawn paw particle
    const rect = mascotEmoji ? mascotEmoji.getBoundingClientRect() : { left: window.innerWidth / 2, top: 150 };
    spawnFloatingPaw(rect.left + 35, rect.top + 20);

    playFelineChime(true);
}

// ==================== User Profile & Theme Accent ====================
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
    saveUserProfile(DEFAULT_PROFILE);
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
    const glow = preset ? preset.glow : 'rgba(255, 83, 118, 0.35)';
    document.documentElement.style.setProperty('--neon-accent', hexColor);
    document.documentElement.style.setProperty('--neon-glow', glow);
    document.documentElement.style.setProperty('--border-hover', glow);
}

function updateProfileUI() {
    const profileName = (userProfile.name || 'Coder').trim();
    const avatarEmoji = userProfile.avatarEmoji || '🐱';
    applyThemeAccent(userProfile.color || '#ff5376');

    const avatarEl = document.getElementById('active-profile-avatar');
    const nameEl = document.getElementById('active-profile-name');
    if (avatarEl) {
        avatarEl.textContent = avatarEmoji;
        avatarEl.style.backgroundColor = userProfile.color || '#ff5376';
    }
    if (nameEl) nameEl.textContent = profileName;

    const welcomeEl = document.getElementById('dashboard-welcome-heading');
    if (welcomeEl) {
        welcomeEl.innerHTML = `Welcome back, <span id="dashboard-user-name" onclick="openProfileModal()" title="Click to edit profile" class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 font-black cursor-pointer hover:underline">${escAttr(profileName)}</span>! 🚀`;
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

    const mascotEmoji = document.getElementById('neko-mascot-emoji');
    if (mascotEmoji) {
        mascotEmoji.textContent = avatarEmoji;
    }

    updateSoundUI();
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
    if (colorInput) colorInput.value = userProfile.color || '#ff5376';
    if (githubInput) githubInput.value = userProfile.github || '';
    if (codolioInput) codolioInput.value = userProfile.codolioUrl || '';

    renderAvatarOptions('profile-avatar-options', userProfile.avatarEmoji || '🐱', (selected) => {
        userProfile.avatarEmoji = selected;
    });

    renderColorOptions('profile-color-options', userProfile.color || '#ff5376', (selected) => {
        if (colorInput) colorInput.value = selected;
    });

    const modalSound = document.getElementById('profile-modal-sound');
    if (modalSound) modalSound.checked = !!userProfile.soundEnabled;

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
    const modalSound = document.getElementById('profile-modal-sound');

    userProfile.name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Coder';
    userProfile.color = (colorInput && colorInput.value.trim()) ? colorInput.value.trim() : '#ff5376';
    userProfile.github = githubInput ? githubInput.value.trim() : '';
    userProfile.codolioUrl = codolioInput ? codolioInput.value.trim() : '';
    userProfile.soundEnabled = modalSound ? modalSound.checked : true;

    saveUserProfile(userProfile);
    updateProfileUI();
    closeProfileModal();
    showToast("Profile & Cyber-Neko Persona Saved! 🐾");
}

function renderAvatarOptions(containerId, activeAvatar, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    CAT_AVATARS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `w-9 h-9 rounded-xl text-lg flex items-center justify-center transition cursor-pointer border ${emoji === activeAvatar ? 'border-pink-500 bg-pink-500/20 scale-110 shadow-md shadow-pink-500/30' : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'}`;
        btn.textContent = emoji;
        btn.onclick = () => {
            renderAvatarOptions(containerId, emoji, onSelect);
            onSelect(emoji);
        };
        container.appendChild(btn);
    });
}

function renderColorOptions(containerId, activeColor, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    PRESET_COLORS.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = c.name;
        btn.className = `w-7 h-7 rounded-full transition transform cursor-pointer ${c.hex.toLowerCase() === activeColor.toLowerCase() ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-110'}`;
        btn.style.backgroundColor = c.hex;
        btn.onclick = () => {
            renderColorOptions(containerId, c.hex, onSelect);
            onSelect(c.hex);
        };
        container.appendChild(btn);
    });
}

// ==================== First-Time Welcome Modal ====================
function checkFirstTimeUser() {
    try {
        const hasVisited = localStorage.getItem(VISITED_KEY);
        if (!hasVisited) {
            setTimeout(() => {
                openWelcomeModal();
            }, 350);
        }
    } catch (e) {}
}

function openWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    let selectedAvatar = '🐱';
    renderAvatarOptions('welcome-avatar-options', selectedAvatar, (avatar) => {
        selectedAvatar = avatar;
        userProfile.avatarEmoji = avatar;
    });

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
    showToast(`Welcome to GrindNeko, ${name}! 🐾`);
    playFelineChime(true);
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
    if (ev && ev.clientX && ev.clientY) {
        spawnFloatingPaw(ev.clientX, ev.clientY);
    }

    if (solvedSet.has(urlKey)) {
        solvedSet.delete(urlKey);
        saveSolvedQuestions();
        updateSingleQuestionCheckboxUI(urlKey, false);
    } else {
        solvedSet.add(urlKey);
        saveSolvedQuestions();
        updateSingleQuestionCheckboxUI(urlKey, true);
        playFelineChime(false);
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
        playFelineChime(true);
    }
    // If viewing starred filter, re-render
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
            btn.textContent = '⭐';
            btn.title = 'Remove star';
        } else {
            btn.classList.remove('starred');
            btn.textContent = '☆';
            btn.title = 'Star problem for revision';
        }
    });
}

function resetQuestionProgress() {
    if (confirm("Reset all problem progress? This will uncheck all solved problems in your local storage.")) {
        solvedSet.clear();
        saveSolvedQuestions();
        renderQuestions();
        updateDashboardSummaries();
        renderDashboardTopicGrid();
        showToast("All question progress reset 🐾");
    }
}

// ==================== Toast Notifications ====================
let toastTimer = null;
function showToast(msg) {
    const toast = document.getElementById('toast-container');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = msg;
    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-12', 'opacity-0');
    }, 2400);
}

// ==================== Feline Rank Calculation ====================
function getCatRank(solvedCount) {
    let currentRank = FELINE_RANKS[0];
    for (let i = 0; i < FELINE_RANKS.length; i++) {
        if (solvedCount >= FELINE_RANKS[i].min) {
            currentRank = FELINE_RANKS[i];
        } else {
            break;
        }
    }
    return currentRank;
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
    const treats = Math.floor(solvedCount / 5);
    const catRank = getCatRank(solvedCount);
    const nextTreatRemaining = 5 - (solvedCount % 5);

    // Navbar treats & rank
    const navTreats = document.getElementById('nav-treats-count');
    if (navTreats) navTreats.textContent = `${treats} Treats`;

    const navRankIcon = document.getElementById('nav-rank-icon');
    const navRankTitle = document.getElementById('nav-rank-title');
    if (navRankIcon) navRankIcon.textContent = catRank.icon;
    if (navRankTitle) navRankTitle.textContent = catRank.title;

    // Dashboard 4 stat cards
    const dashSolved = document.getElementById('dash-stat-solved');
    const dashProg = document.getElementById('dash-stat-progress');
    const dashBar = document.getElementById('dash-stat-bar');
    if (dashSolved) dashSolved.textContent = solvedCount.toLocaleString();
    if (dashProg) dashProg.textContent = `${pct}% of ${totalQuestions.toLocaleString()} problems`;
    if (dashBar) dashBar.style.width = `${pct}%`;

    const dashEasy = document.getElementById('dash-solved-easy');
    const dashMed = document.getElementById('dash-solved-med');
    const dashHard = document.getElementById('dash-solved-hard');
    if (dashEasy) dashEasy.textContent = `E: ${solvedEasy}`;
    if (dashMed) dashMed.textContent = `M: ${solvedMed}`;
    if (dashHard) dashHard.textContent = `H: ${solvedHard}`;

    const dashRankIcon = document.getElementById('dash-stat-rank-icon');
    const dashRankTitle = document.getElementById('dash-stat-rank-title');
    const dashRankDesc = document.getElementById('dash-stat-rank-desc');
    const dashRankBar = document.getElementById('dash-stat-rank-bar');
    if (dashRankIcon) dashRankIcon.textContent = catRank.icon;
    if (dashRankTitle) dashRankTitle.textContent = catRank.title;
    if (dashRankDesc) dashRankDesc.textContent = catRank.nextDesc;

    if (dashRankBar) {
        const rankIdx = FELINE_RANKS.indexOf(catRank);
        const nextRank = FELINE_RANKS[rankIdx + 1];
        if (nextRank) {
            const range = nextRank.min - catRank.min;
            const progress = solvedCount - catRank.min;
            const rankPct = Math.min(100, Math.round((progress / range) * 100));
            dashRankBar.style.width = `${rankPct}%`;
        } else {
            dashRankBar.style.width = `100%`;
        }
    }

    const dashTreats = document.getElementById('dash-stat-treats');
    const dashTreatsNext = document.getElementById('dash-stat-treats-next');
    if (dashTreats) dashTreats.textContent = treats.toLocaleString();
    if (dashTreatsNext) dashTreatsNext.textContent = `${nextTreatRemaining} more solved for next treat 🐟`;
}

// ==================== 23-Topic Dashboard Grid Renderer ====================
function renderDashboardTopicGrid() {
    const grid = document.getElementById('dashboard-topics-grid');
    if (!grid || typeof questionsData === 'undefined') return;

    let html = '';
    for (const topic in questionsData) {
        const icon = TOPIC_ICONS[topic] || TOPIC_ICONS['_default'];
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
        const colorCls = (typeof TOPIC_COLORS !== 'undefined' && TOPIC_COLORS[topic]) ? TOPIC_COLORS[topic] : 'text-pink-400 bg-pink-950/40 border-pink-500/30';

        html += `
        <div onclick="goToTopicQuestions('${escJs(topic)}')" class="topic-roadmap-card p-5 cursor-pointer flex flex-col justify-between group">
            <div>
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2.5">
                        <span class="text-2xl">${icon}</span>
                        <h3 class="font-extrabold text-sm sm:text-base text-white group-hover:text-pink-300 transition-colors">${topic}</h3>
                    </div>
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${colorCls}">
                        ${solved}/${total}
                    </span>
                </div>

                <!-- Difficulty Count Chips -->
                <div class="flex items-center gap-2 mb-3 text-[11px] font-mono">
                    <span class="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">E: ${easyCount}</span>
                    <span class="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">M: ${medCount}</span>
                    <span class="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">H: ${hardCount}</span>
                </div>
            </div>

            <div>
                <!-- Topic Progress Bar -->
                <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800 mb-2">
                    <div class="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span class="font-mono">${pct}% mastered</span>
                    <span class="text-pink-400 group-hover:text-pink-300 font-bold flex items-center gap-1">
                        <span>Pounce</span>
                        <svg class="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
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
        const icon = TOPIC_ICONS[topic] || '🐾';
        const sectionId = `topic-${slugify(topic)}`;
        html += `
        <button type="button" onclick="goToTopicQuestions('${escJs(topic)}')" class="topic-jump-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer flex-shrink-0">
            <span>${icon}</span>
            <span>${topic}</span>
        </button>`;
    }
    bar.innerHTML = html;
}

// ==================== Questions View Mastery & Progress ====================
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
    if (pctBadge) pctBadge.textContent = `${pct}% Mastered 🐾`;

    // Render Platform Legend
    const legend = document.getElementById('platform-legend');
    if (legend) {
        legend.innerHTML = Object.keys(platformCounts).sort().map(p => {
            const count = platformCounts[p];
            const pSol = platformSolved[p] || 0;
            const cls = (typeof PLATFORM_COLORS !== 'undefined' && PLATFORM_COLORS[p]) ? PLATFORM_COLORS[p] : 'text-slate-300 bg-slate-400/10 border-slate-400/30';
            return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cls}">
                <span>${p}</span>
                <span class="text-slate-400 font-mono text-[11px] font-bold">${pSol}/${count}</span>
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
                btn.className = 'px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm';
            } else {
                btn.className = 'px-3 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition cursor-pointer border border-transparent';
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
                btn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm';
            } else {
                btn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition cursor-pointer border border-transparent';
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

        // Calculate total solved in topic from full dataset
        ['Easy', 'Medium', 'Hard'].forEach(diff => {
            (questionsData[topic][diff] || []).forEach(q => {
                totalInTopic++;
                if (solvedSet.has(q.url)) solvedInTopic++;
            });
        });

        const topicPct = totalInTopic ? Math.round((solvedInTopic / totalInTopic) * 100) : 0;
        const isOpen = (query || statusFilter !== 'all' || diffFilter !== 'all' || platFilter !== 'all') ? true : openAccordions.has(sectionId);
        const icon = TOPIC_ICONS[topic] || '🐾';

        if (visibleCount === 0 && (query || statusFilter !== 'all' || diffFilter !== 'all' || platFilter !== 'all')) {
            continue;
        }

        html += `
        <div id="${sectionId}" class="rounded-2xl neko-card border border-slate-800 overflow-hidden transition shadow-sm mb-3">
            <button type="button" onclick="toggleAccordion('${sectionId}')" class="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left cursor-pointer focus:outline-none hover:bg-slate-900/60 transition">
                <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="text-xl">${icon}</span>
                    <span class="font-black text-sm sm:text-base text-slate-100">${topic}</span>
                    ${topicPill(topic)}
                    <span class="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                        ${solvedInTopic}/${totalInTopic} (${topicPct}%)
                    </span>
                    ${visibleCount !== totalInTopic ? `<span class="text-[11px] font-mono text-slate-400">Showing ${visibleCount}</span>` : ''}
                </div>
                <div class="flex items-center gap-2">
                    <svg id="icon-${sectionId}" class="w-4 h-4 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </button>

            <div id="content-${sectionId}" class="${isOpen ? '' : 'hidden'} border-t border-slate-800/80 p-3 sm:p-4 bg-slate-950/60 space-y-4">
                ${renderDifficultyBlock('Easy', easyFiltered, sectionId)}
                ${renderDifficultyBlock('Medium', medFiltered, sectionId)}
                ${renderDifficultyBlock('Hard', hardFiltered, sectionId)}
            </div>
        </div>`;
    }

    if (!html) {
        html = `
        <div class="neko-card p-10 rounded-2xl border border-slate-800 text-center text-slate-400">
            <span class="text-4xl block mb-3">🐾</span>
            <p class="font-extrabold text-base text-white">No questions matched your filters</p>
            <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try clearing your search query or switching your status/difficulty filters.</p>
            <button onclick="clearAllVaultFilters()" class="mt-4 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold rounded-xl border border-pink-500/30 transition cursor-pointer">
                Clear All Filters
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
        <div class="question-row flex items-center justify-between p-2.5 sm:px-3.5 rounded-xl border border-slate-800/80 bg-slate-900/70 hover:border-pink-500/30 transition ${isSolved ? 'opacity-50' : ''}">
            <div class="flex items-center gap-3 min-w-0 flex-grow pr-2">
                <!-- Paw Checkbox -->
                <input type="checkbox" class="paw-checkbox" data-qurl="${urlAttr}" ${isSolved ? 'checked' : ''} onchange="toggleQuestionSolved('${escJs(q.url)}', event)">
                
                <!-- Star Button -->
                <button type="button" data-starurl="${urlAttr}" onclick="toggleQuestionStarred('${escJs(q.url)}', event)" class="star-btn ${isStarred ? 'starred' : ''} text-sm focus:outline-none" title="${isStarred ? 'Remove star' : 'Star problem'}">
                    ${isStarred ? '⭐' : '☆'}
                </button>

                <!-- Problem Link -->
                <a href="${urlAttr}" target="_blank" rel="noopener noreferrer" class="q-title-link text-xs sm:text-sm font-semibold text-slate-100 hover:text-pink-300 transition truncate hover:underline ${isSolved ? 'line-through text-slate-400' : ''}">
                    ${escAttr(q.title)}
                </a>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                ${platformPill(q.platform)}
                <a href="${urlAttr}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-white p-1 rounded transition" title="Open problem in new tab">
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
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${badgeCls}">${difficulty}</span>
            <span class="text-[11px] font-mono font-bold text-slate-400">(${list.length})</span>
        </div>
        <div class="space-y-1.5">
            ${itemsHtml}
        </div>
    </div>`;
}

// ==================== Random Challenge Picker ====================
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

    showToast(`Random Challenge: ${randomPick.title} (${randomPick.diff}) 🎲`);
    playFelineChime(true);
}

// ==================== Global Fast Search Dropdown ====================
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
        resultsContainer.innerHTML = `<div class="p-5 text-xs text-slate-400 text-center font-semibold">No questions found matching "${escAttr(query)}" 🐾</div>`;
        resultsContainer.classList.remove('hidden');
        return;
    }

    const maxShown = 35;
    const listHtml = matches.slice(0, maxShown).map(item => {
        const isSolved = solvedSet.has(item.url);
        const badgeCls = difficultyBadgeClasses(item.diff);
        return `
        <div class="p-3 border-b border-slate-800/80 hover:bg-slate-900/80 transition flex items-center justify-between gap-3">
            <div class="min-w-0 flex-grow">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${badgeCls}">${item.diff}</span>
                    ${platformPill(item.platform)}
                    ${topicPill(item.topic)}
                </div>
                <a href="${escAttr(item.url)}" target="_blank" rel="noopener noreferrer" class="text-xs sm:text-sm font-semibold text-white hover:text-pink-300 transition truncate block ${isSolved ? 'line-through text-slate-400' : ''}">
                    ${escAttr(item.title)}
                </a>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button type="button" onclick="goToTopicQuestions('${escJs(item.topic)}'); document.getElementById('global-search-results').classList.add('hidden');" class="text-[11px] font-bold text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-2.5 py-1 rounded-xl border border-pink-500/20 cursor-pointer transition">
                    Jump to Topic
                </button>
            </div>
        </div>`;
    }).join('');

    resultsContainer.innerHTML = `
        <div class="p-2.5 bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-pink-400 flex items-center justify-between">
            <span>Found ${matches.length} questions matching "${escAttr(query)}"</span>
            <span>🐾</span>
        </div>
        ${listHtml}
        ${matches.length > maxShown ? `<div class="p-2.5 text-center text-xs text-slate-400 font-mono">Showing first ${maxShown} results. Refine search for more.</div>` : ''}
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

// Keyboard shortcuts: '/' or 'Ctrl/Cmd+K' to search, 'Escape' to close
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

// ==================== Initialize Application ====================
document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
    updateDashboardSummaries();
    renderDashboardTopicGrid();
    checkFirstTimeUser();
});
