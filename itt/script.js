document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        scanResults: [
            { ssid: 'Home_Wifi_2.4G', signal: 'Strong', secured: false },
            { ssid: 'Office_Guest', signal: 'Medium', secured: true },
            { ssid: 'TP-Link_5G', signal: 'Weak', secured: false }
        ],
        target: null,
        intensity: 0,
        victimData: 1024,
        victimBill: 0,
        buffer: 100,
        isRunning: false
    };

    // Elements
    const scanBtn = document.getElementById('scan-btn');
    const wifiList = document.getElementById('wifi-list');
    const leechControls = document.getElementById('leech-controls');
    const intensitySlider = document.getElementById('leech-slider');
    const intensityVal = document.getElementById('leech-val');
    const theftRateEl = document.getElementById('theft-rate');
    const targetSSIDEl = document.getElementById('target-ssid');
    const killBtn = document.getElementById('kill-connection');

    const bufferBar = document.getElementById('buffer-bar');
    const bufferOverlay = document.getElementById('buffer-overlay');
    const victimDataEl = document.getElementById('victim-data');
    const victimBillEl = document.getElementById('victim-bill');
    const logContainer = document.getElementById('alert-logs');

    const accessModal = document.getElementById('access-modal');
    const closeAccess = document.getElementById('close-access');

    // Scan Logic
    scanBtn.addEventListener('click', () => {
        wifiList.innerHTML = '<div class="placeholder-text">Scanning for peaks...</div>';
        setTimeout(() => {
            wifiList.innerHTML = '';
            state.scanResults.forEach(net => {
                const div = document.createElement('div');
                div.className = 'wifi-item';
                div.innerHTML = `
                    <span class="ssid">📶 ${net.ssid}</span>
                    <span class="signal">${net.signal} ${net.secured ? '🔒' : ''}</span>
                `;
                div.addEventListener('click', () => {
                    if (net.secured) {
                        accessModal.classList.add('active');
                        return;
                    }
                    selectTarget(net);
                });
                wifiList.appendChild(div);
            });
        }, 1500);
    });

    function selectTarget(net) {
        state.target = net;
        targetSSIDEl.innerText = net.ssid;
        leechControls.classList.remove('disabled');
        intensitySlider.disabled = false;
        killBtn.disabled = false;
        state.isRunning = true;
        
        // Visual select feedback
        const items = document.querySelectorAll('.wifi-item');
        items.forEach(i => i.classList.remove('active'));
        [...items].find(i => i.innerText.includes(net.ssid)).classList.add('active');
        
        addLog(`Unauthorized connection established to ${net.ssid}`, 'danger');
    }

    // Leech Logic
    intensitySlider.addEventListener('input', (e) => {
        state.intensity = parseInt(e.target.value);
        intensityVal.innerText = state.intensity + '%';
        theftRateEl.innerText = (state.intensity * 0.5).toFixed(1) + ' Mbps';
    });

    // Simulation Loop
    setInterval(() => {
        if (!state.isRunning) return;

        const theftAmount = (state.intensity / 100) * 1.5; // MB per tick
        state.victimData = Math.max(0, state.victimData - theftAmount);
        state.victimBill += (theftAmount * 2.5); // ₹2.5 per MB roughly
        
        // Update Victim UI
        victimDataEl.innerText = Math.floor(state.victimData) + ' MB';
        victimBillEl.innerText = '₹' + Math.floor(state.victimBill);
        
        // Buffer Logic
        if (state.intensity > 40) {
            state.buffer = Math.max(0, state.buffer - (state.intensity / 20));
        } else {
            state.buffer = Math.min(100, state.buffer + 2);
        }
        
        bufferBar.style.width = state.buffer + '%';
        if (state.buffer < 10) {
            bufferOverlay.classList.add('active');
            if (Math.random() > 0.9) addLog('Victim experienced video buffering timeout.', 'system');
        } else {
            bufferOverlay.classList.remove('active');
        }

        if (state.victimData === 0) {
            addLog('Victim data pool EXHAUSTED.', 'danger');
            state.isRunning = false;
            intensitySlider.disabled = true;
        }
    }, 500);

    function addLog(msg, type) {
        const div = document.createElement('div');
        div.className = `log ${type}`;
        div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logContainer.prepend(div);
    }

    killBtn.addEventListener('click', () => {
        state.isRunning = false;
        state.intensity = 0;
        intensitySlider.value = 0;
        intensityVal.innerText = '0%';
        theftRateEl.innerText = '0 Mbps';
        leechControls.classList.add('disabled');
        addLog('Connection terminated by attacker.', 'system');
    });

    closeAccess.addEventListener('click', () => {
        accessModal.classList.remove('active');
    });
});
