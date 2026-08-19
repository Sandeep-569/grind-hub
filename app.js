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

        const DEFAULT_PROFILE = {
            name: "Sandeep",
            color: "#6366f1",
            github: "https://github.com",
            handles: {
                "LeetCode": "https://leetcode.com/u/codedbysandeep/",
                "HackerRank": "https://www.hackerrank.com/profile/codedbysandeep",
                "Codeforces": "https://codeforces.com/profile/codedbysandeep1413",
                "CodeChef": "https://www.codechef.com/",
                "GeeksforGeeks": "https://auth.geeksforgeeks.org/",
                "CodeStudio": "https://www.naukri.com/code360/",
                "InterviewBit": "https://www.interviewbit.com/",
                "AtCoder": "https://atcoder.jp/"
            }
        };

        let userProfile = loadUserProfile();

        function loadUserProfile() {
            try {
                const raw = localStorage.getItem(PROFILE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object' && parsed.name) {
                        return Object.assign({}, DEFAULT_PROFILE, parsed);
                    }
                }
                const rawV2 = localStorage.getItem('dsa_profiles_v2');
                if (rawV2) {
                    const parsedV2 = JSON.parse(rawV2);
                    if (Array.isArray(parsedV2) && parsedV2.length > 0) {
                        const first = parsedV2[0];
                        const migrated = Object.assign({}, DEFAULT_PROFILE, first);
                        saveUserProfile(migrated);
                        return migrated;
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

            const dashboardUserEl = document.getElementById('dashboard-user-name');
            if (dashboardUserEl) dashboardUserEl.textContent = userProfile.name || 'Coder';

            const githubLink = document.getElementById('nav-github-link');
            if (githubLink) {
                githubLink.href = userProfile.github || 'https://github.com';
            }

            document.querySelectorAll('.platform-card[data-platform]').forEach(card => {
                const plat = card.getAttribute('data-platform');
                const handle = userProfile.handles?.[plat];
                if (handle) {
                    card.href = handle;
                }
            });
        }

        function renderColorOptions() {
            const container = document.getElementById('profile-color-options');
            if (!container) return;
            const currentColor = document.getElementById('profile-modal-color').value || '#6366f1';

            container.innerHTML = PRESET_COLORS.map(c => {
                const isSelected = c.hex.toLowerCase() === currentColor.toLowerCase();
                return `
                    <button type="button" onclick="selectModalColor('${c.hex}')" title="${c.name}"
                        class="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'opacity-80 hover:opacity-100'}"
                        style="background-color: ${c.hex};">
                        ${isSelected ? '<svg class="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' : ''}
                    </button>
                `;
            }).join('');
        }

        function selectModalColor(hex) {
            document.getElementById('profile-modal-color').value = hex;
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
        }

        // --- Local Storage: Progress Tracking ---
        function escJs(str) {
            return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        }
        function escAttr(str) {
            return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        }

        function loadSet(key) {
            try {
                const raw = localStorage.getItem(key);
                if (raw) return new Set(JSON.parse(raw));
                const fallbackSolved = localStorage.getItem('dsa_tracker_solved_questions_profile-sandeep');
                if (key === SOLVED_KEY && fallbackSolved) return new Set(JSON.parse(fallbackSolved));
                return new Set();
            } catch (e) {
                return new Set();
            }
        }

        function saveSet(key, set) {
            try {
                localStorage.setItem(key, JSON.stringify(Array.from(set)));
            } catch (e) { /* storage unavailable - fail silently */ }
        }

        let solvedQuestions = loadSet(SOLVED_KEY);

        function toggleQuestionSolved(url, checkboxEl) {
            if (checkboxEl.checked) solvedQuestions.add(url);
            else solvedQuestions.delete(url);
            saveSet(SOLVED_KEY, solvedQuestions);

            const li = checkboxEl.closest('.question-item');
            if (li) {
                const link = li.querySelector('a span.q-title');
                if (link) link.classList.toggle('line-through', checkboxEl.checked);
                if (link) link.classList.toggle('text-slate-500', checkboxEl.checked);
            }

            updateQuestionsProgressUI();
            updateDashboardSummaries();
        }

        function resetQuestionProgress() {
            if (!confirm(`Clear all solved-question checkmarks for "${userProfile.name}"? This cannot be undone.`)) return;
            solvedQuestions = new Set();
            saveSet(SOLVED_KEY, solvedQuestions);
            renderQuestions();
            updateDashboardSummaries();
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
            const solvedCount = allItems.filter(it => solvedQuestions.has(it.url)).length;
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
                    const isSolved = solvedQuestions.has(entry.url);
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
                resultsEl.innerHTML = '<div class="p-3 text-sm text-slate-500">No questions found.</div>';
            } else {
                resultsEl.innerHTML = matches.map(it => {
                    return `<a href="${escAttr(it.url)}" target="_blank" rel="noopener" class="flex items-center justify-between gap-2 px-4 py-2 hover:bg-slate-750 border-b border-slate-700/60 last:border-0 transition-colors">
                        <div class="min-w-0">
                            <div class="text-sm text-slate-200 truncate">${escAttr(it.title)}</div>
                            <div class="text-xs text-slate-500">${escAttr(it.topic)} • ${escAttr(it.diff)} • ${escAttr(it.platform)}</div>
                        </div>
                    </a>`;
                }).join('');
            }
            resultsEl.classList.remove('hidden');
        }

        document.addEventListener('click', (e) => {
            const box = document.getElementById('global-search-results');
            const input = document.getElementById('global-question-search');
            if (box && input && !box.contains(e.target) && e.target !== input) {
                box.classList.add('hidden');
            }
        });

        function updateQuestionsProgressUI() {
            let total = 0, solved = 0;
            for (const topic in questionsData) {
                ['Easy', 'Medium', 'Hard'].forEach(d => {
                    questionsData[topic][d].forEach(it => {
                        total++;
                        if (solvedQuestions.has(it.url)) solved++;
                        const sectionId = `topic-${slugify(topic)}`;
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
                const topicSolved = allItems.filter(it => solvedQuestions.has(it.url)).length;
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
                        if (solvedQuestions.has(it.url)) qSolved++;
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
            // Normalizes a raw platform label from the tracker data onto the
            // platform name used by the profile cards (data-platform attr).
            function normalizePlatform(p) {
                if (p === 'GFG') return 'GeeksforGeeks';
                if (p === 'Coding Ninjas' || p === 'CodingNinjas' || p === 'CodeStudio') return 'CodeStudio';
                return p;
            }

            const solvedByPlatform = {};
            for (const topic in questionsData) {
                ['Easy', 'Medium', 'Hard'].forEach(d => {
                    questionsData[topic][d].forEach(it => {
                        if (!solvedQuestions.has(it.url)) return;
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

        // Initialize App
        window.onload = function () {
            updateProfileUI();
            updateDashboardSummaries();
        };
