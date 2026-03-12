document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        security: { spf: true, dkim: true, dmarc: true },
        emails: []
    };

    // Elements
    const secBtns = document.querySelectorAll('.sec-btn');
    const sendBtn = document.getElementById('send-btn');
    const inboxList = document.getElementById('inbox-list');
    const inboxTitle = document.querySelector('.inbox-module h3');
    
    const emailDetail = document.getElementById('email-detail');
    const backBtn = document.getElementById('back-to-inbox');
    
    const eduModal = document.getElementById('edu-modal');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMsg = document.getElementById('modal-message');

    // Toggle Security
    secBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const protocol = btn.dataset.sec;
            state.security[protocol] = !state.security[protocol];
            btn.classList.toggle('active', state.security[protocol]);
            
            showEducationalContext(protocol, state.security[protocol]);
        });
    });

    function showEducationalContext(proto, active) {
        const info = {
            spf: {
                title: 'SPF (Sender Policy Framework)',
                msg: active ? 'SPF is now verifying if the sender IP is authorized. Spoofed emails from random servers will be flagged.' : 'SPF disabled! Any server can now claim to be your domain, making spoofing trivial.'
            },
            dkim: {
                title: 'DKIM (DomainKeys Identified Mail)',
                msg: active ? 'DKIM will now check for a digital signature. If the email doesn\'t have one from the real domain, it fails.' : 'DKIM disabled! The mail server no longer verifies digital signatures. Headers can be forged easily.'
            },
            dmarc: {
                title: 'DMARC',
                msg: active ? 'DMARC is set to REJECT. Emails failing SPF or DKIM will be blocked or sent to spam.' : 'DMARC disabled! There is no policy on what to do when authentication fails. Spoofers get a free pass.'
            }
        };
        
        modalTitle.innerText = info[proto].title;
        modalMsg.innerText = info[proto].msg;
        eduModal.classList.add('active');
    }

    // Send Logic
    sendBtn.addEventListener('click', () => {
        const spoofedEmail = document.getElementById('spoofed-email').value;
        const displayName = document.getElementById('display-name').value;
        const subject = document.getElementById('email-subject').value;
        
        let status = 'PASS';
        let reason = 'All checks verified.';
        
        if (!state.security.spf) status = 'WARNING';
        if (!state.security.dkim) status = 'WARNING';
        if (state.security.dmarc && (status === 'WARNING')) {
            status = 'FAIL';
            reason = 'DMARC Policy: Rejected due to authentication failure.';
        }

        const newEmail = {
            id: Date.now(),
            from: `${displayName} <${spoofedEmail}>`,
            actualFrom: 'internal@attack-node-77.net',
            subject: subject,
            status: status,
            reason: reason,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        state.emails.unshift(newEmail);
        updateInboxUI();
        
        sendBtn.innerText = 'Email Sent!';
        setTimeout(() => sendBtn.innerText = 'Send Spoofed Email', 2000);
    });

    function updateInboxUI() {
        if (state.emails.length === 0) {
            inboxList.innerHTML = '<div class="empty-inbox">No new messages.</div>';
            return;
        }

        inboxList.innerHTML = '';
        state.emails.forEach(email => {
            const item = document.createElement('div');
            item.className = `email-item ${email.status === 'FAIL' || email.status === 'WARNING' ? 'warning' : ''}`;
            item.innerHTML = `
                <div class="email-info">
                    <h4>${email.subject}</h4>
                    <p>From: ${email.from}</p>
                </div>
                <div class="email-meta">
                    <span class="time">${email.time}</span>
                </div>
            `;
            item.addEventListener('click', () => openEmail(email));
            inboxList.appendChild(item);
        });
    }

    function openEmail(email) {
        inboxList.style.display = 'none';
        inboxTitle.innerText = 'Message Details';
        emailDetail.style.display = 'block';
        
        document.getElementById('view-subject').innerText = email.subject;
        document.getElementById('view-from').innerText = email.from;
        document.getElementById('header-meta').innerText = `Envelope-From: ${email.actualFrom}\nAuth-Result: ${email.status} (${email.reason})`;
        
        const badge = document.getElementById('sec-badge');
        if (email.status === 'PASS') {
            badge.className = 'security-badge secure';
            badge.innerHTML = '<span class="badge-icon">✓</span> <span class="badge-text">VERIFIED</span>';
        } else {
            badge.className = 'security-badge danger';
            badge.innerHTML = '<span class="badge-icon">⚠</span> <span class="badge-text">SPOOF DETECTED</span>';
        }
    }

    backBtn.addEventListener('click', () => {
        emailDetail.style.display = 'none';
        inboxList.style.display = 'block';
        inboxTitle.innerText = 'Victim\'s Inbox';
    });

    closeModal.addEventListener('click', () => eduModal.classList.remove('active'));
    eduModal.addEventListener('click', (e) => { if(e.target === eduModal) eduModal.classList.remove('active'); });
});
