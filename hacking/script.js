document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        currentStep: 1,
        isHacked: false,
        terminalHistory: [],
        targets: [
            { ip: '192.168.1.15', ports: ['22:ssh', '80:http', '443:https'], vulnerable: '22', password: 'admin' }
        ]
    };

    // Elements
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const accessEl = document.getElementById('access-level');
    const toolBtns = document.querySelectorAll('.tool-btn');
    
    const overlay = document.getElementById('status-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMsg = document.getElementById('overlay-message');
    const closeOverlay = document.getElementById('close-overlay');

    // Input Handling
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.toLowerCase().trim();
            handleCommand(cmd);
            terminalInput.value = '';
        }
    });

    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            handleCommand(btn.dataset.cmd);
        });
    });

    function handleCommand(cmd) {
        logToTerminal(`<span class="prompt">root@attacker:~#</span> ${cmd}`);
        
        switch(cmd) {
            case 'help':
                logToTerminal('Available commands:');
                logToTerminal('- <span class="cmd-text">scan</span>: Scan network for targets');
                logToTerminal('- <span class="cmd-text">bruteforce</span>: Attempt SSH password crack');
                logToTerminal('- <span class="cmd-text">exploit</span>: Execute root privilege script');
                logToTerminal('- <span class="cmd-text">extract</span>: Dump database records');
                logToTerminal('- <span class="cmd-text">clear</span>: Clear terminal screen');
                break;
            case 'scan':
                if (state.currentStep === 1) startScan();
                else logToTerminal('Network already scanned. Found target: 192.168.1.15');
                break;
            case 'bruteforce':
                if (state.currentStep === 2) startBruteForce();
                else if (state.currentStep < 2) logToTerminal('Error: Target connection not identified. Run <span class="cmd-text">scan</span> first.');
                else logToTerminal('Already gained entry to system.');
                break;
            case 'exploit':
                if (state.currentStep === 3) startExploit();
                else if (state.currentStep < 3) logToTerminal('Error: Low-privilege shell required. Run <span class="cmd-text">bruteforce</span> first.');
                else logToTerminal('System already fully compromised.');
                break;
            case 'extract':
                if (state.currentStep === 4) startExtract();
                else logToTerminal('Error: Root access required for data dump.');
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                break;
            case '':
                break;
            default:
                logToTerminal(`command not found: ${cmd}`);
        }
    }

    function logToTerminal(msg) {
        const line = document.createElement('div');
        line.className = 'line';
        line.innerHTML = msg;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // Step Logic
    function startScan() {
        logToTerminal('Initializing Nmap scan v7.80...');
        logToTerminal('Scanning 256 IP addresses on subnet 192.168.1.0/24');
        
        const dots = ['.', '..', '...', 'DONE'];
        let i = 0;
        const interval = setInterval(() => {
            logToTerminal(`Progress: ${dots[i]}`);
            i++;
            if (i === 4) {
                clearInterval(interval);
                logToTerminal('<span class="glow-text">FOUND: 192.168.1.15 [Server-Primary]</span>');
                logToTerminal('Open Ports: 22 (ssh), 80 (http), 443 (https)');
                completeStep(1);
            }
        }, 500);
    }

    function startBruteForce() {
        logToTerminal('Starting Hydra Brute-Force attack on 192.168.1.15:22...');
        logToTerminal('Wordlist: common_passwords.txt (Size: 100 entries)');
        
        let attempts = 0;
        const interval = setInterval(() => {
            logToTerminal(`Attempting password: ${Math.random().toString(36).substring(7)} ... [FAIL]`);
            attempts++;
            if (attempts === 5) {
                clearInterval(interval);
                logToTerminal('<span class="glow-text">SUCCESS: password found -> "admin"</span>');
                logToTerminal('Establishing SSH connection... Connection established.');
                accessEl.innerText = 'USER (Low-Priv)';
                accessEl.className = 'glow-text';
                completeStep(2);
            }
        }, 300);
    }

    function startExploit() {
        logToTerminal('Loading Local Privilege Escalation script: filthycow.py');
        logToTerminal('Targeting Kernel Vulnerability CVE-2026-0001...');
        
        setTimeout(() => {
            logToTerminal('Exploiting stack overflow... Done.');
            logToTerminal('Allocating memory buffer... Done.');
            logToTerminal('Escalating privileges... <span class="cmd-text"># whoami -> root</span>');
            accessEl.innerText = 'ROOT (High-Priv)';
            accessEl.style.color = 'var(--term-green)';
            completeStep(3);
            showOverlay('SYSTEM OWNED', 'Root access gained. Entire file system is now readable/writable.');
        }, 2000);
    }

    function startExtract() {
        logToTerminal('Querying Internal Database: HR_FINANCE_DB');
        logToTerminal('Extracting records... dump_104928.sql generated.');
        
        let data = [
            '{ "id": 1, "name": "Avanish", "salary": "₹150,000", "role": "IT_Director" }',
            '{ "id": 2, "name": "Sanjeev", "salary": "₹120,000", "role": "SR_Dev" }'
        ];
        
        data.forEach(line => logToTerminal(line));
        completeStep(4);
        showOverlay('MISSION COMPLETE', 'Data exfiltrated successfully. All objectives met.');
    }

    function completeStep(n) {
        document.getElementById(`step-${n}`).classList.remove('active');
        document.getElementById(`step-${n}`).classList.add('done');
        state.currentStep = n + 1;
        if (n < 4) {
            document.getElementById(`step-${n + 1}`).classList.add('active');
        }
    }

    function showOverlay(title, msg) {
        overlayTitle.innerText = title;
        overlayMsg.innerText = msg;
        overlay.classList.add('active');
    }

    closeOverlay.addEventListener('click', () => overlay.classList.remove('active'));

    // Initialize first step
    document.getElementById('step-1').classList.add('active');
});
