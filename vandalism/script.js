document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        activeTool: 'spray',
        damage: 0,
        cost: 0,
        isClean: true
    };

    // Elements
    const toolBtns = document.querySelectorAll('.tool-btn');
    const target = document.getElementById('vandal-target');
    const damageVal = document.getElementById('damage-val');
    const costVal = document.getElementById('cost-val');
    const restoreBtn = document.getElementById('restore-btn');
    
    const eduModal = document.getElementById('edu-modal');
    const modalMessage = document.getElementById('modal-message');
    const closeModal = document.getElementById('close-modal');

    // Tool Selection
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeTool = btn.dataset.tool;
            updateCursor();
        });
    });

    function updateCursor() {
        let cursor = 'auto';
        if (state.activeTool === 'spray') cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24">💨</text></svg>\'), auto';
        else if (state.activeTool === 'scramble') cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24">🔀</text></svg>\'), auto';
        else if (state.activeTool === 'glitch') cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24">⚡</text></svg>\'), auto';
        else if (state.activeTool === 'replace') cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24">🖼️</text></svg>\'), auto';
        target.style.cursor = cursor;
    }

    // Interaction Logic
    target.addEventListener('click', (e) => {
        state.isClean = false;
        incrementDamage();

        if (state.activeTool === 'spray') {
            createSplatter(e);
        } else if (state.activeTool === 'scramble') {
            scrambleTarget(e.target);
        } else if (state.activeTool === 'glitch') {
            glitchElement(e.target);
        } else if (state.activeTool === 'replace') {
            replaceImage(e.target);
        }

        if (state.damage === 20) {
            showEduMessage('Note: Digital vandalism isn\'t just visual. It often disrupts backend services and data integrity, making recovery expensive and slow.');
        }
    });

    function createSplatter(e) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const splatter = document.createElement('div');
        splatter.className = 'splatter';
        splatter.style.left = x + 'px';
        splatter.style.top = y + 'px';
        
        const colors = ['#ffde3e', '#ff3e3e', '#ff00ff', '#333'];
        splatter.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        splatter.style.borderRadius = `${Math.random() * 50 + 20}%`;
        splatter.style.width = `${Math.random() * 50 + 30}px`;
        splatter.style.height = splatter.style.width;
        
        target.appendChild(splatter);
    }

    function scrambleTarget(el) {
        if (el === target) return;
        if (el.children.length > 0) {
            Array.from(el.children).forEach(scrambleTarget);
        } else {
            const text = el.innerText;
            if (text) {
                el.innerText = text.split('').sort(() => Math.random() - 0.5).join('');
                el.style.fontFamily = 'Space Mono, monospace';
                el.style.color = '#ff3e3e';
            }
        }
    }

    function glitchElement(el) {
        if (el === target) return;
        el.classList.add('glitch-flash');
        el.style.transform = `rotate(${Math.random() * 10 - 5}deg) scale(1.1)`;
        el.style.filter = 'hue-rotate(90deg) invert(1)';
    }

    function replaceImage(el) {
        if (el.tagName === 'IMG') {
            el.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=100&q=80'; // Error/Maintenance image
            el.style.borderRadius = '0';
            el.style.border = '2px solid red';
        }
    }

    function incrementDamage() {
        state.damage = Math.min(100, state.damage + 5);
        state.cost += 15000;
        damageVal.innerText = state.damage + '%';
        costVal.innerText = '₹' + state.cost.toLocaleString();
    }

    function showEduMessage(msg) {
        modalMessage.innerText = msg;
        eduModal.classList.add('active');
    }

    restoreBtn.addEventListener('click', () => {
        location.reload();
    });

    closeModal.addEventListener('click', () => {
        eduModal.classList.remove('active');
    });
});
