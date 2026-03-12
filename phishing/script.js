document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow Effect
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // Module 1: Email Anatomy Tips
    const triggers = document.querySelectorAll('.phish-trigger');
    const tipDisplay = document.querySelector('#tip-display p');

    triggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => {
            const tip = trigger.getAttribute('data-tip');
            tipDisplay.innerHTML = `<strong>Flagged:</strong> ${tip}`;
            tipDisplay.parentElement.style.borderColor = 'var(--accent-red)';
        });

        trigger.addEventListener('mouseleave', () => {
            tipDisplay.innerHTML = '💡 Hover over highlighted parts of the email to see why they are suspicious.';
            tipDisplay.parentElement.style.borderColor = 'var(--accent-blue)';
        });
    });

    // Module 2: Credential Capture Simulation
    const loginBtn = document.getElementById('submit-trap');
    const userField = document.getElementById('victim-user');
    const passField = document.getElementById('victim-pass');
    const captureOutput = document.getElementById('captured-data');
    const terminal = document.querySelector('.terminal');
    const eduModal = document.getElementById('edu-modal');
    const closeModal = document.getElementById('close-modal');

    loginBtn.addEventListener('click', () => {
        const username = userField.value;
        const password = passField.value;

        if (!username || !password) {
            addToTerminal('⚠️ Error: Waiting for victim to enter credentials...', 'system');
            return;
        }

        // Simulate attacker console update
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'captured-entry';
        entry.innerHTML = `
            <div>[${timestamp}] NEW DATA CAPTURED!</div>
            <div>URL: https://facebook-secure-login.net/auth</div>
            <div>USER: <span style="color: #fff">${username}</span></div>
            <div>PASS: <span style="color: #fff">${RegExp('.').test(password) ? password : '[MASKED]'}</span></div>
            <div>IP: 172.16.254.1 (Simulated)</div>
        `;
        
        captureOutput.prepend(entry);
        addToTerminal('✅ Payload delivered successfully.', 'success');
        
        // Visual feedback on "mock" form
        loginBtn.innerHTML = 'Signing in...';
        loginBtn.disabled = true;
        
        setTimeout(() => {
            eduModal.classList.add('active');
            loginBtn.innerHTML = 'Log In';
            loginBtn.disabled = false;
            userField.value = '';
            passField.value = '';
        }, 1000);
    });

    // Close Modal Logic
    closeModal.addEventListener('click', () => {
        eduModal.classList.remove('active');
    });

    // Close on overlay click
    eduModal.addEventListener('click', (e) => {
        if (e.target === eduModal) {
            eduModal.classList.remove('active');
        }
    });

    // Guide Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Update active button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Copy to Clipboard Logic
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.parentElement.nextElementSibling.innerText;
            navigator.clipboard.writeText(code).then(() => {
                const originalText = btn.innerText;
                btn.innerText = 'Copied!';
                btn.style.color = 'var(--accent-blue)';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.color = '';
                }, 2000);
            });
        });
    });

    function addToTerminal(msg, type) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.style.color = type === 'system' ? '#ff9900' : (type === 'success' ? '#00ff00' : '#888');
        line.innerText = `> ${msg}`;
        captureOutput.prepend(line);
    }
});
