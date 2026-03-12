document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    let state = {
        voltage: 230,
        frequency: 50.0,
        load: 42,
        isCompromised: false,
        activeSubstations: 3
    };

    // Elements
    const voltEl = document.getElementById('voltage-val');
    const freqEl = document.getElementById('freq-val');
    const loadEl = document.getElementById('load-val');
    const stabilityFill = document.getElementById('stability-fill');
    const stabilityText = document.getElementById('stability-text');
    
    const logs = document.getElementById('terror-logs');
    const exploitBtns = document.querySelectorAll('.exploit-btn');
    const resetBtn = document.getElementById('reset-sim');
    
    const eduModal = document.getElementById('edu-modal');
    const closeModal = document.getElementById('close-modal');

    // Fluctuations
    setInterval(() => {
        if (state.isCompromised) return;
        
        const vOff = (Math.random() - 0.5) * 2;
        const fOff = (Math.random() - 0.5) * 0.1;
        
        voltEl.innerText = `${(state.voltage + vOff).toFixed(1)}kV`;
        freqEl.innerText = `${(state.frequency + fOff).toFixed(2)}Hz`;
    }, 2000);

    // Exploit Logic
    exploitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.isCompromised) return;
            triggerExploit(btn.dataset.exploit);
        });
    });

    function triggerExploit(type) {
        state.isCompromised = true;
        addLog(`> INJECTING MALICIOUS PAYLOAD: ${type.toUpperCase()}`);
        
        if (type === 'voltage') {
            animateCrisis(350, 50.0, 95);
        } else if (type === 'frequency') {
            animateCrisis(230, 42.5, 80);
        } else {
            animateCrisis(0, 0, 100);
        }
    }

    function animateCrisis(targetV, targetF, targetL) {
        let step = 0;
        const interval = setInterval(() => {
            step++;
            
            // UI Feedback
            stabilityFill.style.width = `${100 - step * 2}%`;
            stabilityFill.style.background = 'var(--accent-red)';
            stabilityText.innerText = 'CRITICAL FAILURE';
            stabilityText.style.color = '#fff';
            
            const currV = 230 + (targetV - 230) * (step / 50);
            const currF = 50 + (targetF - 50) * (step / 50);
            const currL = 42 + (targetL - 42) * (step / 50);

            voltEl.innerText = `${currV.toFixed(1)}kV`;
            freqEl.innerText = `${currF.toFixed(2)}Hz`;
            loadEl.innerText = `${Math.round(currL)}%`;

            if (step === 15) {
                document.getElementById('sub-1').classList.add('offline');
                document.getElementById('sub-1').querySelector('span').innerText = 'OFFLINE';
                addLog(`> SUBSTATION A: PROTECTION RELAY TRIPPED`);
            }
            if (step === 30) {
                document.getElementById('sub-2').classList.add('offline');
                document.getElementById('sub-2').querySelector('span').innerText = 'OFFLINE';
                addLog(`> SUBSTATION B: TRANSFORMER CORE OVERHEAT`);
            }
            if (step === 45) {
                document.getElementById('sub-3').classList.add('offline');
                document.getElementById('sub-3').querySelector('span').innerText = 'OFFLINE';
                addLog(`> SUBSTATION C: TOTAL CASCADE FAILURE`);
            }

            if (step >= 50) {
                clearInterval(interval);
                addLog(`> SYSTEM HALTED. CITY BLACKOUT INITIATED.`);
                setTimeout(() => eduModal.classList.add('active'), 1000);
            }
        }, 100);
    }

    function addLog(msg) {
        const line = document.createElement('div');
        line.innerText = msg;
        logs.prepend(line);
    }

    resetBtn.addEventListener('click', () => {
        state.isCompromised = false;
        location.reload(); // Quick reset for simulation
    });

    closeModal.addEventListener('click', () => eduModal.classList.remove('active'));
});
