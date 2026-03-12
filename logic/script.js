document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        isArmed: false,
        isDetonated: false,
        trigger: 'admin-check',
        payload: 'wipe',
        files: 4285
    };

    // Elements
    const armBtn = document.getElementById('arm-btn');
    const deleteAdminBtn = document.getElementById('delete-admin-btn');
    const systemStatus = document.getElementById('system-status-indicator');
    const fileList = document.getElementById('file-list');
    const countVal = document.getElementById('count-val');
    
    const triggerSelect = document.getElementById('trigger-select');
    const payloadSelect = document.getElementById('payload-select');
    const resetBtn = document.getElementById('reset-sim');
    
    const explosionOverlay = document.getElementById('explosion-overlay');
    const closeModal = document.getElementById('close-modal');
    const deletedCount = document.getElementById('deleted-count');

    // Trigger & Payload Sync
    triggerSelect.addEventListener('change', (e) => {
        state.trigger = e.target.value;
        updateCodeView();
    });

    payloadSelect.addEventListener('change', (e) => {
        state.payload = e.target.value;
        updateCodeView();
    });

    function updateCodeView() {
        const codeView = document.querySelector('.bomb-code-view code');
        let logic = '';
        
        if (state.trigger === 'admin-check') logic = `if (admin_account == NULL) {`;
        else if (state.trigger === 'time-check') logic = `if (today == "Friday 13th") {`;
        else logic = `if (login_count > 10000) {`;
        
        logic += `\n    ${state.payload}_payload();\n}`;
        codeView.innerText = logic;
    }

    // Arming
    armBtn.addEventListener('click', () => {
        if (state.isDetonated) return;
        state.isArmed = true;
        armBtn.innerText = '💣 Logic Bomb ARMED';
        armBtn.style.background = 'var(--accent-red)';
        armBtn.style.color = 'white';
        
        addSystemLog('Warning: Unauthorized dormant code detected in system core.', 'orange');
    });

    // Execution Trigger
    deleteAdminBtn.addEventListener('click', () => {
        if (!state.isArmed) {
            addSystemLog('Admin "IT_Director" has been removed. No side effects detected.', 'dim');
            deleteAdminBtn.disabled = true;
            deleteAdminBtn.innerText = 'Admin Removed';
            return;
        }

        if (state.trigger === 'admin-check') {
            detonate();
        }
    });

    function detonate() {
        state.isDetonated = true;
        systemStatus.innerText = 'CRITICAL FAILURE';
        systemStatus.className = 'status-badge critical';
        
        deleteAdminBtn.disabled = true;
        deleteAdminBtn.innerText = 'SYSTEM OVERRIDE';

        if (state.payload === 'wipe') {
            animateWipe();
        } else if (state.payload === 'encrypt') {
            animateEncryption();
        } else {
            animateLeak();
        }
    }

    function animateWipe() {
        const files = document.querySelectorAll('.file-item');
        files.forEach((file, i) => {
            setTimeout(() => {
                file.style.background = 'var(--accent-red)';
                file.style.opacity = '0';
                file.innerText = 'DELETED';
                state.files -= Math.floor(Math.random() * 500);
                countVal.innerText = Math.max(0, state.files).toLocaleString();
            }, i * 200);
        });

        setTimeout(showExplosion, files.length * 200 + 500);
    }

    function animateEncryption() {
        const files = document.querySelectorAll('.file-item');
        files.forEach((file, i) => {
            setTimeout(() => {
                file.style.background = 'var(--accent-orange)';
                file.innerText = `[LOCKED] ${file.innerText}.vault`;
            }, i * 200);
        });
        setTimeout(showExplosion, files.length * 200 + 500);
    }

    function animateLeak() {
        const files = document.querySelectorAll('.file-item');
        files.forEach((file, i) => {
            setTimeout(() => {
                file.style.borderLeft = '4px solid var(--accent-blue)';
                file.innerText = `>>> SENDING: ${file.innerText}`;
            }, i * 200);
        });
        setTimeout(showExplosion, files.length * 200 + 500);
    }

    function showExplosion() {
        deletedCount.innerText = 'All System Data';
        explosionOverlay.classList.add('active');
    }

    function addSystemLog(msg, color) {
        console.log(`System Log: ${msg}`);
        // Visual cue on the server module could be added here
    }

    resetBtn.addEventListener('click', () => {
        location.reload();
    });

    closeModal.addEventListener('click', () => {
        explosionOverlay.classList.remove('active');
    });
});
