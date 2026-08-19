// ==================== GrindNeko: Cyber-Cat DSA Tracker ====================

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
            sectionEl.classList.add('ring-2', 'ring-pink-400');
            setTimeout(() => sectionEl.classList.remove('ring-2', 'ring-pink-400'), 1600);
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
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${cls}">${topicKey}</span>`;
}

function platformPill(platform) {
    const cls = PLATFORM_COLORS[platform] || 'text-slate-300 bg-slate-400/10 border-slate-400/30';
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 ${cls}">${platform}</span>`;
}

function difficultyBadgeClasses(difficulty) {
    if (difficulty === 'Easy') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (difficulty === 'Medium') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
}

function escJs(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ==================== Feline Rank & Gamification ====================
const FELINE_RANKS = [
    { min: 0, title: "Novice Kitten", icon: "🍼", nextDesc: "Solve 25 for Curious Prowler" },
    { min: 25, title: "Curious Prowler", icon: "🐾", nextDesc: "Solve 100 for Cyber TomCat" },
    { min: 100, title: "Cyber TomCat", icon: "⚡", nextDesc: "Solve 250 for Ninja Shorthair" },
    { min: 250, title: "Ninja Shorthair", icon: "🗡️", nextDesc: "Solve 500 for Shadow Panther" },
    { min: 500, title: "Shadow Panther", icon: "🔮", nextDesc: "Solve 1,000 for Apex Mythic Neko" },
    { min: 1000, title: "Apex Mythic Neko", icon: "👑", nextDesc: "Master of all algorithms!" }
];

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
            // High sparkling completion chime
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
            osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc.start(now);
            osc.stop(now + 0.5);
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
    }, 1000);
}

// ==================== Interactive Neko Desk Mascot ====================
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
    "Fish treats earned: Keep pouncing on those problems! 🐟"
];

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

    // Spawn paw particle near mouse or screen center
    const rect = mascotEmoji ? mascotEmoji.getBoundingClientRect() : { left: window.innerWidth / 2, top: 150 };
    spawnFloatingPaw(rect.left + 30, rect.top + 20);

    playFelineChime(true);
}

// ==================== User Profile & Custom Links ====================
const PROFILE_KEY = 'dsa_user_profile_v1';
const SOLVED_KEY = 'dsa_tracker_solved_questions_v1';

const CAT_AVATARS = ["🐱", "😸", "😻", "😼", "😽", "🐈‍⬛", "🦁", "🐯", "🐾", "⚡"];

const PRESET_COLORS = [
    { name: "Pink", hex: "#ff5376" },
    { name: "Purple", hex: "#8b5cf6" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Indigo", hex: "#6366f1" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Sky", hex: "#0ea5e9" }
];

const DEFAULT_PROFILE = {
    name: "Coder",
    color: "#ff5376",
    avatarEmoji: "🐱",
    soundEnabled: true,
    github: "",
    codolioUrl: ""
};

let userProfile = loadUserProfile();

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

function updateProfileUI() {
    const profileName = (userProfile.name || 'Coder').trim();
    const avatarEmoji = userProfile.avatarEmoji || '🐱';
    const avatarEl = document.getElementById('active-profile-avatar');
    const nameEl = document.getElementById('active-profile-name');
    if (avatarEl) {
        avatarEl.textContent = avatarEmoji;
        avatarEl.style.backgroundColor = userProfile.color || '#ff5376';
    }
    if (nameEl) nameEl.textContent = profileName;

    const welcomeEl = document.getElementById('dashboard-welcome-heading');
    if (welcomeEl) {
        welcomeEl.innerHTML = `Welcome back, <span id="dashboard-user-name" onclick="openProfileModal()" title="Click to edit profile" class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-extrabold cursor-pointer hover:underline">${escAttr(profileName)}</span>! 🚀`;
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
    showToast("Profile & Cat Persona Saved! 🐾");
}

function renderAvatarOptions(containerId, activeAvatar, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    CAT_AVATARS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `w-9 h-9 rounded-xl text-lg flex items-center justify-center transition cursor-pointer border ${emoji === activeAvatar ? 'border-pink-500 bg-pink-500/20 scale-110 shadow-md shadow-pink-500/30' : 'border-slate-800 bg-slate-950/80 hover:border-slate-600'}`;
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
        btn.className = `w-7 h-7 rounded-full transition transform cursor-pointer ${c.hex.toLowerCase() === activeColor.toLowerCase() ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-md' : 'opacity-80 hover:opacity-100 hover:scale-110'}`;
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
        const hasVisited = localStorage.getItem('dsa_tracker_has_visited_v1');
        if (!hasVisited) {
            setTimeout(() => {
                openWelcomeModal();
            }, 400);
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
        localStorage.setItem('dsa_tracker_has_visited_v1', 'true');
    } catch (e) {}

    updateProfileUI();
    closeWelcomeModal();
    showToast(`Welcome to GrindNeko, ${name}! 🐾`);
    playFelineChime(true);
}

// ==================== Solved Questions LocalStorage ====================
let solvedSet = loadSolvedQuestions();

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

function updateSingleQuestionCheckboxUI(urlKey, isSolved) {
    document.querySelectorAll(`input[data-qurl="${CSS.escape(urlKey)}"]`).forEach(input => {
        input.checked = isSolved;
        const row = input.closest('.question-row') || input.closest('li') || input.closest('div');
        if (row) {
            if (isSolved) {
                row.classList.add('opacity-60', 'line-through');
            } else {
                row.classList.remove('opacity-60', 'line-through');
            }
        }
    });
}

function resetQuestionProgress() {
    if (confirm("Reset all question progress? This will clear all checked problems in your local storage.")) {
        solvedSet.clear();
        saveSolvedQuestions();
        renderQuestions();
        updateDashboardSummaries();
        showToast("All progress reset 🐾");
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

// ==================== Dashboard Summaries & Stats ====================
function updateDashboardSummaries() {
    let totalQuestions = 0;
    let solvedCount = 0;
    const platforms = new Set();

    if (typeof questionsData !== 'undefined') {
        for (const topic in questionsData) {
            ['Easy', 'Medium', 'Hard'].forEach(diff => {
                const list = questionsData[topic][diff] || [];
                totalQuestions += list.length;
                list.forEach(q => {
                    if (q.platform) platforms.add(q.platform);
                    if (solvedSet.has(q.url)) solvedCount++;
                });
            });
        }
    }

    const pct = totalQuestions ? Math.round((solvedCount / totalQuestions) * 100) : 0;
    const treats = Math.floor(solvedCount / 5);
    const catRank = getCatRank(solvedCount);

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

    const dashRankIcon = document.getElementById('dash-stat-rank-icon');
    const dashRankTitle = document.getElementById('dash-stat-rank-title');
    const dashRankDesc = document.getElementById('dash-stat-rank-desc');
    if (dashRankIcon) dashRankIcon.textContent = catRank.icon;
    if (dashRankTitle) dashRankTitle.textContent = catRank.title;
    if (dashRankDesc) dashRankDesc.textContent = catRank.nextDesc;

    const dashTreats = document.getElementById('dash-stat-treats');
    if (dashTreats) dashTreats.textContent = treats.toLocaleString();
}

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
    if (bar) bar.style.width = `${pct}%`;
    if (label) label.textContent = `Mastery: ${solved.toLocaleString()} / ${total.toLocaleString()} solved (${pct}%) 🐾`;

    // Render Platform Legend
    const legend = document.getElementById('platform-legend');
    if (legend) {
        legend.innerHTML = Object.keys(platformCounts).sort().map(p => {
            const count = platformCounts[p];
            const pSol = platformSolved[p] || 0;
            const cls = PLATFORM_COLORS[p] || 'text-slate-300 bg-slate-400/10 border-slate-400/30';
            return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cls}">
                <span>${p}</span>
                <span class="text-slate-400 font-mono text-[11px]">${pSol}/${count}</span>
            </span>`;
        }).join('');
    }
}

// ==================== Questions Accordion Rendering ====================
let openAccordions = new Set();

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

function renderQuestions(filterText = '') {
    const container = document.getElementById('questions-container');
    if (!container || typeof questionsData === 'undefined') return;

    const query = filterText.trim().toLowerCase();
    let html = '';

    for (const topic in questionsData) {
        const sectionId = `topic-${slugify(topic)}`;
        let totalInTopic = 0;
        let solvedInTopic = 0;

        let easyList = questionsData[topic].Easy || [];
        let medList = questionsData[topic].Medium || [];
        let hardList = questionsData[topic].Hard || [];

        if (query) {
            easyList = easyList.filter(q => q.title.toLowerCase().includes(query) || (q.platform || '').toLowerCase().includes(query) || topic.toLowerCase().includes(query));
            medList = medList.filter(q => q.title.toLowerCase().includes(query) || (q.platform || '').toLowerCase().includes(query) || topic.toLowerCase().includes(query));
            hardList = hardList.filter(q => q.title.toLowerCase().includes(query) || (q.platform || '').toLowerCase().includes(query) || topic.toLowerCase().includes(query));
        }

        const visibleCount = easyList.length + medList.length + hardList.length;
        if (query && visibleCount === 0) continue;

        // Calculate total solved in topic from full dataset
        ['Easy', 'Medium', 'Hard'].forEach(diff => {
            (questionsData[topic][diff] || []).forEach(q => {
                totalInTopic++;
                if (solvedSet.has(q.url)) solvedInTopic++;
            });
        });

        const topicPct = totalInTopic ? Math.round((solvedInTopic / totalInTopic) * 100) : 0;
        const isOpen = query ? true : openAccordions.has(sectionId);

        html += `
        <div id="${sectionId}" class="mb-3 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition shadow-sm">
            <button type="button" onclick="toggleAccordion('${sectionId}')" class="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left topic-accordion-header cursor-pointer focus:outline-none">
                <div class="flex items-center gap-3 flex-wrap">
                    <span class="font-extrabold text-sm sm:text-base text-slate-100">${topic}</span>
                    ${topicPill(topic)}
                    <span class="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">${solvedInTopic}/${totalInTopic} (${topicPct}%)</span>
                </div>
                <div class="flex items-center gap-2">
                    <svg id="icon-${sectionId}" class="w-4 h-4 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </button>

            <div id="content-${sectionId}" class="${isOpen ? '' : 'hidden'} border-t border-slate-800/80 p-3 sm:p-4 bg-slate-950/40 space-y-4">
                ${renderDifficultyBlock('Easy', easyList, sectionId)}
                ${renderDifficultyBlock('Medium', medList, sectionId)}
                ${renderDifficultyBlock('Hard', hardList, sectionId)}
            </div>
        </div>`;
    }

    if (!html) {
        html = `<div class="p-8 text-center text-slate-400">
            <span class="text-3xl block mb-2">🐾</span>
            <p class="font-bold text-sm">No questions found matching "${escAttr(query)}"</p>
            <p class="text-xs text-slate-500 mt-1">Try another search keyword or clear the filter.</p>
        </div>`;
    }

    container.innerHTML = html;
    updateQuestionsViewProgress();
}

function renderDifficultyBlock(difficulty, list, sectionId) {
    if (!list || list.length === 0) return '';
    const badgeCls = difficultyBadgeClasses(difficulty);

    const itemsHtml = list.map(q => {
        const isSolved = solvedSet.has(q.url);
        const urlAttr = escAttr(q.url);
        return `
        <div class="question-row flex items-center justify-between p-2 sm:px-3 rounded-xl border border-slate-800/60 bg-slate-900/60 hover:border-slate-700 transition ${isSolved ? 'opacity-50' : ''}">
            <div class="flex items-center gap-3 min-w-0 flex-grow pr-2">
                <input type="checkbox" class="paw-checkbox" data-qurl="${urlAttr}" ${isSolved ? 'checked' : ''} onchange="toggleQuestionSolved('${escJs(q.url)}', event)">
                <a href="${urlAttr}" target="_blank" rel="noopener noreferrer" class="text-xs sm:text-sm font-medium text-slate-200 hover:text-pink-300 transition truncate hover:underline ${isSolved ? 'line-through text-slate-400' : ''}">
                    ${escAttr(q.title)}
                </a>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                ${platformPill(q.platform)}
                <a href="${urlAttr}" target="_blank" rel="noopener noreferrer" class="text-slate-500 hover:text-slate-300 p-1" title="Open in new tab">
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
            <span class="text-[11px] font-mono text-slate-400">(${list.length})</span>
        </div>
        <div class="space-y-1.5">
            ${itemsHtml}
        </div>
    </div>`;
}

function filterQuestions(val) {
    renderQuestions(val);
}

// ==================== Global Fast Search ====================
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
        resultsContainer.innerHTML = `<div class="p-4 text-xs text-slate-400 text-center">No questions found matching "${escAttr(query)}" 🐾</div>`;
        resultsContainer.classList.remove('hidden');
        return;
    }

    const maxShown = 40;
    const listHtml = matches.slice(0, maxShown).map(item => {
        const isSolved = solvedSet.has(item.url);
        const badgeCls = difficultyBadgeClasses(item.diff);
        return `
        <div class="p-3 border-b border-slate-800/80 hover:bg-slate-800/60 transition flex items-center justify-between gap-3">
            <div class="min-w-0 flex-grow">
                <div class="flex items-center gap-2 mb-1">
                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${badgeCls}">${item.diff}</span>
                    ${platformPill(item.platform)}
                    ${topicPill(item.topic)}
                </div>
                <a href="${escAttr(item.url)}" target="_blank" rel="noopener noreferrer" class="text-xs sm:text-sm font-semibold text-white hover:text-pink-300 transition truncate block ${isSolved ? 'line-through text-slate-400' : ''}">
                    ${escAttr(item.title)}
                </a>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button type="button" onclick="goToTopicQuestions('${escJs(item.topic)}'); document.getElementById('global-search-results').classList.add('hidden');" class="text-[11px] font-bold text-pink-400 hover:text-pink-300 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20 cursor-pointer">
                    View in Topic
                </button>
            </div>
        </div>`;
    }).join('');

    resultsContainer.innerHTML = `
        <div class="p-2 bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-pink-400 flex items-center justify-between">
            <span>Found ${matches.length} questions matching "${escAttr(query)}"</span>
            <span>🐾</span>
        </div>
        ${listHtml}
        ${matches.length > maxShown ? `<div class="p-2 text-center text-xs text-slate-400">Showing first ${maxShown} results. Refine search for more.</div>` : ''}
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

// ==================== Initialize Application ====================
document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
    updateDashboardSummaries();
    checkFirstTimeUser();
});
