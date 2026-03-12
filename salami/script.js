document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // Simulation State
    let state = {
        isScriptOn: false,
        bankTotal: 0,
        theftTotal: 0,
        theftCount: 0,
        isGenerating: false,
        modalThreshold: 50
    };

    // DOM Elements
    const scriptToggle = document.getElementById('script-toggle');
    const bankTotalEl = document.getElementById('bank-total');
    const theftTotalEl = document.getElementById('theft-total');
    const theftCountEl = document.getElementById('theft-count');
    const transList = document.getElementById('transaction-list');
    const bulkBtn = document.getElementById('generate-bulk');
    const resetBtn = document.getElementById('reset-sim');
    const attackerLogs = document.getElementById('attacker-logs');
    
    const eduModal = document.getElementById('edu-modal');
    const closeModal = document.getElementById('close-modal');

    // Toggle Script
    scriptToggle.addEventListener('click', () => {
        state.isScriptOn = !state.isScriptOn;
        scriptToggle.innerText = state.isScriptOn ? 'ON' : 'OFF';
        scriptToggle.classList.toggle('on', state.isScriptOn);
        
        const status = state.isScriptOn ? 'ACTIVATED' : 'DEACTIVATED';
        addAttackerLog(`> Salami Slicing script ${status}`, state.isScriptOn ? 'warn' : 'info');
    });

    // Bulk Simulation
    bulkBtn.addEventListener('click', () => {
        if (state.isGenerating) return;
        state.isGenerating = true;
        bulkBtn.disabled = true;
        bulkBtn.innerText = 'Processing...';
        
        let count = 0;
        const interval = setInterval(() => {
            generateTransaction();
            count++;
            if (count >= 100) { // Doing 100 visual ones, then the rest instantly
                clearInterval(interval);
                completeRemainder(900);
                state.isGenerating = false;
                bulkBtn.disabled = false;
                bulkBtn.innerText = 'Run 1,000 Transactions';
            }
        }, 30);
    });

    function generateTransaction() {
        const amount = (Math.random() * 500 + 10).toFixed(4);
        const original = parseFloat(amount);
        let processed = original;
        let theft = 0;

        if (state.isScriptOn) {
            // Salami Attack Logic: Shave off exactly ₹1
            processed = original - 1;
            theft = 1;
            
            state.theftTotal += theft;
            state.theftCount++;
        }

        state.bankTotal += processed;
        updateUI();
        addTransactionRow(original, processed, state.isScriptOn);
    }

    function completeRemainder(rem) {
        for(let i=0; i<rem; i++) {
            const amount = Math.random() * 500 + 10;
            if (state.isScriptOn) {
                const processed = amount - 1;
                const theft = 1;
                state.theftTotal += theft;
                state.theftCount++;
                state.bankTotal += processed;
            } else {
                state.bankTotal += amount;
            }
        }
        updateUI();
        addAttackerLog(`> Completed bulk batch of ${rem} transfers.`, 'success');
        
        if (state.theftTotal >= state.modalThreshold) {
            showModal();
        }
    }

    function addTransactionRow(orig, proc, sliced) {
        const row = document.createElement('div');
        row.className = `transaction-row ${sliced ? 'sliced' : ''}`;
        
        const desc = ['Wire Transfer', 'Retail Purchase', 'ATM Withdrawal', 'Salary Deposit', 'Online Payment'][Math.floor(Math.random() * 5)];
        
        row.innerHTML = `
            <span>${desc}</span>
            <span>₹${orig.toFixed(3)}</span>
            <span>₹${proc.toFixed(2)}</span>
        `;
        
        transList.prepend(row);
        if (transList.children.length > 50) transList.lastChild.remove();
    }

    function updateUI() {
        bankTotalEl.innerText = `₹${state.bankTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        theftTotalEl.innerText = `₹${state.theftTotal.toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 5})}`;
        theftCountEl.innerText = `${state.theftCount.toLocaleString()} thefts performed`;
    }

    function addAttackerLog(msg, type) {
        const div = document.createElement('div');
        div.innerText = msg;
        if (type === 'warn') div.style.color = 'var(--accent-red)';
        if (type === 'success') div.style.color = 'var(--accent-green)';
        attackerLogs.prepend(div);
    }

    function showModal() {
        eduModal.classList.add('active');
    }

    resetBtn.addEventListener('click', () => {
        state = { ...state, bankTotal: 0, theftTotal: 0, theftCount: 0, isGenerating: false };
        updateUI();
        transList.innerHTML = '';
        attackerLogs.innerHTML = '> Simulation reset.';
    });

    closeModal.addEventListener('click', () => eduModal.classList.remove('active'));
    eduModal.addEventListener('click', (e) => { if(e.target === eduModal) eduModal.classList.remove('active'); });

});
