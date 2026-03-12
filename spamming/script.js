document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        isRunning: false,
        receivedCount: 0,
        volume: 500,
        filterEnabled: false
    };

    // Elements
    const volumeRange = document.getElementById('volume-range');
    const volumeVal = document.getElementById('volume-val');
    const sendBtn = document.getElementById('send-btn');
    const resetBtn = document.getElementById('reset-sim');
    const filterToggle = document.getElementById('filter-toggle');
    
    const notificationList = document.getElementById('notification-list');
    const loadVal = document.getElementById('load-val');
    const statusText = document.getElementById('status-text');
    const receivedCountEl = document.getElementById('received-count');
    
    const eduModal = document.getElementById('edu-modal');
    const closeModal = document.getElementById('close-modal');

    // Volume Sync
    volumeRange.addEventListener('input', (e) => {
        state.volume = e.target.value;
        volumeVal.innerText = `${state.volume} emails`;
    });

    filterToggle.addEventListener('change', (e) => {
        state.filterEnabled = e.target.checked;
    });

    // Campaign Logic
    sendBtn.addEventListener('click', () => {
        if (state.isRunning) return;
        startCampaign();
    });

    function startCampaign() {
        state.isRunning = true;
        sendBtn.disabled = true;
        sendBtn.innerText = 'Sending...';
        statusText.innerText = 'ACTIVE CAMPAIGN';
        statusText.style.color = 'var(--accent-red)';
        
        const count = parseInt(state.volume);
        const subject = document.getElementById('subject-select').options[document.getElementById('subject-select').selectedIndex].text;
        
        let sent = 0;
        const interval = setInterval(() => {
            if (sent >= count) {
                clearInterval(interval);
                finishCampaign();
                return;
            }

            // UI Ripple
            sent += 10;
            state.receivedCount += 10;
            
            // Randomly skip if filter is ON
            if (!state.filterEnabled || Math.random() > 0.8) {
                addNotification(subject);
            }

            // Update Stats
            receivedCountEl.innerText = state.receivedCount;
            loadVal.innerText = `${Math.min(100, Math.floor((sent / count) * 100))}%`;
            
            // Scroll to end
            notificationList.scrollTop = 0;
        }, 50);
    }

    function addNotification(subject) {
        if (notificationList.querySelector('.empty-inbox')) {
            notificationList.innerHTML = '';
        }

        const notify = document.createElement('div');
        notify.className = 'notification';
        notify.innerHTML = `
            <h4>${subject}</h4>
            <p>From: bulk-mailer-${Math.floor(Math.random() * 9999)}@marketing-node.net</p>
        `;
        notificationList.prepend(notify);

        // Limit list size for performance
        if (notificationList.children.length > 50) {
            notificationList.removeChild(notificationList.lastChild);
        }
    }

    function finishCampaign() {
        state.isRunning = false;
        sendBtn.disabled = false;
        sendBtn.innerText = 'Launch Campaign';
        statusText.innerText = 'COMPLETED';
        statusText.style.color = 'var(--accent-green)';
        loadVal.innerText = '2%';

        if (!state.filterEnabled && state.receivedCount > 200) {
            setTimeout(() => eduModal.classList.add('active'), 1000);
        }
    }

    resetBtn.addEventListener('click', () => {
        state.receivedCount = 0;
        receivedCountEl.innerText = '0';
        notificationList.innerHTML = '<div class="empty-inbox">No notifications.</div>';
        statusText.innerText = 'Standby';
        statusText.style.color = 'var(--accent-magenta)';
    });

    closeModal.addEventListener('click', () => eduModal.classList.remove('active'));
});
