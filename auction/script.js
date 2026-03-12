document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        currentBid: 42000,
        vigilance: 100,
        risk: 'LOW',
        redFlags: [
            { id: 'seller', text: 'Seller has zero feedback/reviews.', caught: false },
            { id: 'payment', text: 'Seller requested off-platform wire transfer.', caught: false },
            { id: 'shill', text: 'User_782 is a shill bot automatically raising the price.', caught: false },
            { id: 'shipping', text: 'Impossible shipping method (Unknown carrier).', caught: false }
        ]
    };

    // Elements
    const bidInput = document.getElementById('bid-input');
    const currentBidEl = document.getElementById('current-bid');
    const placeBidBtn = document.getElementById('place-bid-btn');
    const bidderInfo = document.getElementById('bidder-info');
    
    const chatWindow = document.getElementById('chat-window');
    const chatOptions = document.querySelectorAll('.chat-opt');
    const vigilanceEl = document.getElementById('vigilance-score');
    const riskEl = document.getElementById('risk-val');
    
    const auditBtn = document.getElementById('audit-btn');
    const auditModal = document.getElementById('audit-modal');
    const auditList = document.getElementById('audit-list');
    const closeModal = document.getElementById('close-modal');

    // Bidding Logic (Shill Bidding)
    placeBidBtn.addEventListener('click', () => {
        const userBid = parseInt(bidInput.value);
        if (userBid > state.currentBid) {
            updateBid(userBid, 'YOU');
            
            // Bot react (Shill Bidding)
            setTimeout(() => {
                const botBid = userBid + 500;
                updateBid(botBid, 'User_782 (Invited Guest)');
                bidderInfo.innerHTML = `Highest Bidder: <span class="shill-text">User_782 (Invited Guest)</span>`;
                state.redFlags.find(f => f.id === 'shill').caught = true;
                updateStats();
            }, 800);
        } else {
            alert('Bid must be higher than current price.');
        }
    });

    function updateBid(val, name) {
        state.currentBid = val;
        currentBidEl.innerText = '₹' + state.currentBid.toLocaleString();
        bidInput.value = state.currentBid + 500;
        if (name === 'YOU') {
            bidderInfo.innerHTML = `Highest Bidder: <span style="color: #3eff81">YOU</span>`;
        }
    }

    // Chat Logic
    chatOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const type = opt.dataset.msg;
            addMessage(opt.innerText, 'user');
            
            if (type === 'yes') {
                setTimeout(() => {
                    addMessage('"I can let it go for ₹35,000 right now. But only if you pay via direct Bank Wire transfer to my brother. It\'s faster and skips the fees!"', 'seller');
                    state.redFlags.find(f => f.id === 'payment').caught = true;
                    updateStats();
                }, 1000);
            } else {
                setTimeout(() => {
                    addMessage('"Okay, but you might lose the auction. Someone else is bidding very aggressively!"', 'seller');
                }, 1000);
            }
            opt.parentElement.style.display = 'none';
        });
    });

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `msg ${sender}`;
        div.innerText = text;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Stats Logic
    function updateStats() {
        const caughtCount = state.redFlags.filter(f => f.caught).length;
        if (caughtCount >= 1) {
            state.risk = 'MEDIUM';
            riskEl.innerText = 'MEDIUM';
            riskEl.className = 'danger';
        }
        if (caughtCount >= 2) {
            state.risk = 'HIGH';
            riskEl.innerText = 'HIGH';
        }
    }

    // Audit Logic
    auditBtn.addEventListener('click', () => {
        auditList.innerHTML = '';
        state.redFlags.forEach(flag => {
            const li = document.createElement('li');
            li.innerText = flag.text;
            auditList.appendChild(li);
        });
        auditModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        auditModal.classList.remove('active');
    });

    // Timer (Visual only)
    let seconds = 165;
    setInterval(() => {
        if (seconds > 0) {
            seconds--;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('auction-timer').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }, 1000);
});
