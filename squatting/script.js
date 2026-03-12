document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        balance: 5000,
        profit: 0,
        portfolio: [],
        risk: 0
    };

    // Elements
    const brandInput = document.getElementById('brand-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsArea = document.getElementById('results-area');
    
    const balanceEl = document.getElementById('balance');
    const profitEl = document.getElementById('profit');
    const portfolioList = document.getElementById('portfolio-list');
    const riskBar = document.getElementById('risk-bar');
    const riskLevel = document.getElementById('risk-level');
    const monetizeBtn = document.getElementById('monetize-btn');

    const monModal = document.getElementById('monetize-modal');
    const selectedDomainEl = document.getElementById('selected-domain');
    const strategyBtns = document.querySelectorAll('.strategy-btn');
    
    const legalModal = document.getElementById('legal-modal');
    const closeLegal = document.getElementById('close-legal');

    const revModal = document.getElementById('revenue-modal');
    const collectedAmountEl = document.getElementById('collected-amount');
    const closeRevenue = document.getElementById('close-revenue');

    let monetizingDomain = null;

    // Search Logic
    searchBtn.addEventListener('click', () => {
        const brand = brandInput.value.toLowerCase().trim();
        if (!brand) return;
        
        resultsArea.innerHTML = '';
        const typos = generateTypos(brand);
        
        typos.forEach(domain => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <span class="domain-name">${domain}.com</span>
                <button class="buy-btn" data-domain="${domain}.com">BUY (₹499)</button>
            `;
            resultsArea.appendChild(div);
            
            div.querySelector('.buy-btn').addEventListener('click', (e) => {
                purchaseDomain(e.target.dataset.domain);
                e.target.disabled = true;
                e.target.innerText = 'ACQUIRED';
            });
        });
    });

    function generateTypos(name) {
        const typos = [];
        // Omission
        typos.push(name.substring(1));
        // Repetition
        typos.push(name[0] + name[0] + name.substring(1));
        // Transposition
        if (name.length > 2) {
            typos.push(name[0] + name[2] + name[1] + name.substring(3));
        }
        // Subdomain trick
        typos.push(name + '-official');
        return typos;
    }

    // Portfolio Logic
    function purchaseDomain(domain) {
        if (state.balance < 499) {
            alert('Insufficient balance!');
            return;
        }
        
        state.balance -= 499;
        state.portfolio.push({
            name: domain,
            revenue: 0,
            strategy: 'none',
            riskWeight: domain.includes('-') ? 10 : 25
        });
        
        updateUI();
    }

    function updateUI() {
        balanceEl.innerText = `₹${state.balance.toLocaleString()}`;
        profitEl.innerText = `₹${state.profit.toLocaleString()}`;
        
        portfolioList.innerHTML = '';
        state.portfolio.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'owned-item';
            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <span class="rev-text">Strategy: ${item.strategy}</span>
                </div>
                <button class="buy-btn" onclick="document.dispatchEvent(new CustomEvent('monetize', {detail: ${index}}))">MONETIZE</button>
            `;
            portfolioList.appendChild(div);
        });

        const totalRisk = state.portfolio.reduce((acc, curr) => acc + curr.riskWeight, 0);
        state.risk = Math.min(100, totalRisk);
        riskBar.style.width = state.risk + '%';
        
        if (state.risk > 70) {
            riskLevel.innerText = 'EXTREME';
            riskLevel.className = 'danger';
        } else if (state.risk > 40) {
            riskLevel.innerText = 'HIGH';
            riskLevel.className = 'danger';
        } else {
            riskLevel.innerText = 'LOW';
            riskLevel.className = 'safe';
        }

        if (state.risk >= 90 && Math.random() > 0.7) {
            triggerLegalTakedown();
        }
    }

    // Modal Interaction
    document.addEventListener('monetize', (e) => {
        monetizingDomain = state.portfolio[e.detail];
        selectedDomainEl.innerText = monetizingDomain.name;
        monModal.classList.add('active');
    });

    strategyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            monetizingDomain.strategy = type;
            
            if (type === 'phish') {
                monetizingDomain.revenue = 5000;
                monetizingDomain.riskWeight += 40;
            } else if (type === 'park') {
                monetizingDomain.revenue = 500;
                monetizingDomain.riskWeight += 5;
            } else if (type === 'sell') {
                monetizingDomain.revenue = 15000;
                monetizingDomain.riskWeight += 20;
            }
            
            monModal.classList.remove('active');
            updateUI();
        });
    });

    monetizeBtn.addEventListener('click', () => {
        let dailyTotal = 0;
        state.portfolio.forEach(item => {
            if (item.strategy !== 'none') {
                dailyTotal += item.revenue;
            }
        });
        state.profit += dailyTotal;
        state.balance += dailyTotal;
        updateUI();
        
        if (dailyTotal > 0) {
            collectedAmountEl.innerText = `₹${dailyTotal.toLocaleString()}`;
            revModal.classList.add('active');
        } else {
            alert('No active monetization strategies found. Set a strategy for your domains first!');
        }
    });

    function triggerLegalTakedown() {
        legalModal.classList.add('active');
        state.portfolio = []; // Seize everything
        state.risk = 0;
        updateUI();
    }

    closeLegal.addEventListener('click', () => {
        legalModal.classList.remove('active');
    });

    closeRevenue.addEventListener('click', () => {
        revModal.classList.remove('active');
    });

    document.getElementById('cancel-modal').addEventListener('click', () => monModal.classList.remove('active'));
});
