document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // Simulation State
    let state = {
        mode: 'dos', // 'dos' or 'ddos'
        intensity: 0,
        health: 100,
        latency: 24,
        rps: 0,
        isAttacking: false,
        packetCount: 0
    };

    // DOM Elements
    const modeBtns = document.querySelectorAll('.mode-btn');
    const attackSlider = document.getElementById('attack-power');
    const startBtn = document.getElementById('start-attack');
    const resetBtn = document.getElementById('reset-sim');
    const logs = document.getElementById('log-output');
    
    const cpuFill = document.getElementById('cpu-fill');
    const statusText = document.getElementById('status-text');
    const latencyText = document.getElementById('latency-text');
    const rpsText = document.getElementById('rps-text');
    const healthRing = document.getElementById('health-ring');
    const serverNode = document.getElementById('target-server');
    const eduModal = document.getElementById('edu-modal');
    const closeModal = document.getElementById('close-modal');
    const modalMessage = document.getElementById('modal-message');

    // Tab Logic
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.mode = btn.dataset.mode;
            addLog(`> Mode switched to: ${state.mode.toUpperCase()}`, 'info');
            resetSim();
        });
    });

    // Attack Logic
    attackSlider.addEventListener('input', (e) => {
        state.intensity = parseInt(e.target.value);
    });

    startBtn.addEventListener('click', () => {
        if (!state.isAttacking) {
            state.isAttacking = true;
            startBtn.innerText = 'Stop Attack';
            startBtn.style.background = '#333';
            addLog(`> Attack initiated using ${state.mode.toUpperCase()} vector...`, 'warn');
            runSimulation();
        } else {
            stopAttack();
        }
    });

    resetBtn.addEventListener('click', resetSim);

    function runSimulation() {
        if (!state.isAttacking) return;

        // Calculate Simulation Step
        const powerMult = state.mode === 'ddos' ? 2.5 : 1;
        const currentRps = Math.floor(state.intensity * powerMult * 10);
        state.rps = currentRps;

        // Visuals: Packets
        if (state.intensity > 5) {
            createPacket();
        }

        // Damage calculation
        const damage = (state.intensity / 100) * powerMult;
        state.health = Math.max(0, state.health - (damage * 0.2));
        
        // Latency escalation
        state.latency = 24 + (100 - state.health) * (state.mode === 'ddos' ? 15 : 5);

        updateUI();

        if (state.health > 0) {
            requestAnimationFrame(() => setTimeout(runSimulation, 100));
        } else {
            onServerCrash();
        }
    }

    function createPacket() {
        const packet = document.createElement('div');
        packet.className = 'packet';
        
        // Random entry point
        const startX = state.mode === 'ddos' ? Math.random() * window.innerWidth : -20;
        const startY = state.mode === 'ddos' ? (Math.random() > 0.5 ? -20 : window.innerHeight + 20) : window.innerHeight / 2;
        
        packet.style.left = startX + 'px';
        packet.style.top = startY + 'px';
        packet.style.background = state.mode === 'ddos' ? 'var(--accent-red)' : 'var(--accent-blue)';
        
        document.body.appendChild(packet);

        const targetRect = serverNode.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        packet.animate([
            { left: startX + 'px', top: startY + 'px', opacity: 1 },
            { left: targetX + 'px', top: targetY + 'px', opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-in'
        }).onfinish = () => packet.remove();
    }

    function updateUI() {
        // Status Colors
        let color = 'var(--accent-green)';
        let status = 'HEALTHY';

        if (state.health < 80) { color = 'var(--accent-yellow)'; status = 'WARNING'; }
        if (state.health < 40) { color = 'var(--accent-red)'; status = 'CRITICAL'; }
        if (state.health <= 0) { color = '#555'; status = 'OFFLINE'; }

        statusText.innerText = status;
        statusText.style.color = color;
        healthRing.style.borderColor = color;
        healthRing.style.transform = `scale(${1 + (100 - state.health) / 200})`;
        
        cpuFill.style.width = `${100 - state.health}%`;
        cpuFill.style.backgroundColor = color;
        
        latencyText.innerText = `${Math.floor(state.latency)}ms`;
        rpsText.innerText = state.rps.toLocaleString();

        if (state.health < 20) {
            serverNode.style.animation = 'shake 0.1s infinite';
        } else {
            serverNode.style.animation = '';
        }
    }

    function onServerCrash() {
        state.isAttacking = false;
        addLog(`> !!! SERVER CRASHED !!!`, 'error');
        addLog(`> Connection timed out. Resources exhausted.`, 'error');
        startBtn.innerText = 'Attack Failed';
        startBtn.disabled = true;
        updateUI();
        
        // Show Custom Modal
        const insight = `The server has crashed because it could not handle the volume of requests. Notice how the ${state.mode === 'ddos' ? 'DDoS attack from multiple sources' : 'DoS attack'} caused latency to skyrocket before the shutdown.`;
        modalMessage.innerText = insight;
        eduModal.classList.add('active');
    }

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

    function stopAttack() {
        state.isAttacking = false;
        startBtn.innerText = 'Launch Attack';
        startBtn.style.background = 'var(--accent-red)';
        addLog('> Attack suspended. Connection stabilizing...', 'info');
    }

    function resetSim() {
        state = { ...state, health: 100, latency: 24, rps: 0, isAttacking: false };
        attackSlider.value = 0;
        startBtn.innerText = 'Launch Attack';
        startBtn.disabled = false;
        startBtn.style.background = 'var(--accent-red)';
        logs.innerHTML = '> System initialized... awaiting input.';
        updateUI();
    }

    function addLog(msg, type) {
        const div = document.createElement('div');
        div.innerText = msg;
        if (type === 'warn') div.style.color = 'var(--accent-yellow)';
        if (type === 'error') div.style.color = 'var(--accent-red)';
        logs.prepend(div);
    }
});

// CSS Injection for needed simulation animations
const style = document.createElement('style');
style.textContent = `
    .packet {
        position: fixed;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 5;
        box-shadow: 0 0 10px currentColor;
    }
    @keyframes shake {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        25% { transform: translate(-52%, -48%) rotate(1deg); }
        50% { transform: translate(-48%, -52%) rotate(-1deg); }
        75% { transform: translate(-51%, -49%) rotate(1deg); }
        100% { transform: translate(-50%, -50%) rotate(0deg); }
    }
`;
document.head.appendChild(style);
