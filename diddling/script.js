document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        isDiddling: false,
        isTransmitting: false,
        records: []
    };

    // Elements
    const form = document.getElementById('payroll-form');
    const packet = document.getElementById('data-packet');
    const interZone = document.getElementById('interceptor-zone');
    const diddleToggle = document.getElementById('diddle-toggle');
    const logs = document.getElementById('interceptor-logs');
    const dbView = document.getElementById('db-record');
    const compPanel = document.getElementById('comparison-panel');
    const eduModal = document.getElementById('edu-modal');
    const closeModal = document.getElementById('close-modal');

    // Toggle Mode
    diddleToggle.addEventListener('click', () => {
        state.isDiddling = !state.isDiddling;
        diddleToggle.innerText = state.isDiddling ? 'ON' : 'OFF';
        diddleToggle.classList.toggle('on', state.isDiddling);
        interZone.classList.toggle('active', state.isDiddling);
        
        const status = state.isDiddling ? 'INTERCEPTOR ARMED' : 'INTERCEPTOR STANDBY';
        addLog(`> ${status}`, state.isDiddling ? 'red' : 'green');
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.isTransmitting) return;

        const inputData = {
            name: document.getElementById('employee-name').value,
            salary: document.getElementById('employee-salary').value,
            account: document.getElementById('employee-account').value
        };

        startTransmission(inputData);
    });

    function startTransmission(data) {
        state.isTransmitting = true;
        addLog(`> Initiating transmission for ${data.name}...`);
        
        // Reset Visuals
        packet.style.transition = 'none';
        packet.style.left = '0%';
        packet.style.opacity = '1';
        packet.style.background = 'var(--accent-blue)';
        
        // Animation
        setTimeout(() => {
            packet.style.transition = 'all 2s linear';
            packet.style.left = '100%';

            // Check for interception mid-way
            setTimeout(() => {
                if (state.isDiddling) {
                    addLog(`> !!! DATA INTERCEPTED !!!`, 'red');
                    packet.style.background = 'var(--accent-red)';
                    packet.innerText = 'FIXED';
                    
                    // The "Diddle"
                    data.salary = "999999";
                    data.account = "ATTACKER-ID-666";
                }
            }, 1000);

            // Arrival
            setTimeout(() => {
                packet.style.opacity = '0';
                commitToDB(data);
                state.isTransmitting = false;
            }, 2000);
        }, 100);
    }

    function commitToDB(data) {
        state.records.push({...data});
        addLog(`> Record stored in database.`, 'green');
        
        updateDBUI();
        
        if (state.isDiddling) {
            setTimeout(() => {
                compPanel.style.display = 'block';
                eduModal.classList.add('active');
            }, 500);
        } else {
            compPanel.style.display = 'none';
        }
    }

    function updateDBUI() {
        if (state.records.length === 0) return;

        let html = `
            <table class="db-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Salary</th>
                        <th>Account</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        state.records.slice().reverse().forEach(rec => {
            const isCorrupt = rec.salary === "999999";
            html += `
                <tr>
                    <td>${rec.name}</td>
                    <td style="color: ${isCorrupt ? 'var(--accent-red)' : 'inherit'}">₹${rec.salary}</td>
                    <td style="color: ${isCorrupt ? 'var(--accent-red)' : 'inherit'}">${rec.account}</td>
                    <td><span style="color: ${isCorrupt ? 'var(--accent-red)' : 'var(--accent-green)'}">${isCorrupt ? '⚠️ ALERT' : '✅ SECURE'}</span></td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        dbView.innerHTML = html;
        dbView.className = '';
    }

    function addLog(msg, color) {
        const line = document.createElement('div');
        line.innerText = msg;
        if (color === 'red') line.style.color = 'var(--accent-red)';
        if (color === 'green') line.style.color = 'var(--accent-green)';
        logs.prepend(line);
    }

    closeModal.addEventListener('click', () => eduModal.classList.remove('active'));
    eduModal.addEventListener('click', (e) => { if(e.target === eduModal) eduModal.classList.remove('active'); });

});
