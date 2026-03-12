document.addEventListener('DOMContentLoaded', () => {
    // Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // State
    const state = {
        layers: {
            watermark: false,
            microprint: false,
            hologram: false,
            uvink: false
        },
        specimen: {
            name: 'JOHN DOE',
            year: '2026'
        },
        serial: Math.floor(Math.random() * 9000 + 1000) + '-F'
    };

    // Elements
    const layerBtns = document.querySelectorAll('.layer-btn');
    const idCard = document.getElementById('id-specimen');
    const nameInput = document.getElementById('id-name');
    const yearInput = document.getElementById('id-year');
    const displayName = document.getElementById('display-name');
    const displayYear = document.getElementById('display-year');
    const serialEl = document.getElementById('serial-num');
    
    const uvToggle = document.getElementById('uv-toggle');
    const zoomToggle = document.getElementById('zoom-toggle');
    const scanBtn = document.getElementById('submit-specimen');
    const scanFeedback = document.getElementById('scan-feedback');
    const scoreCircle = document.getElementById('score-circle');
    const scoreText = document.getElementById('score-text');
    const gradeText = document.getElementById('grade-text');

    const resultModal = document.getElementById('result-modal');
    const resultMsg = document.getElementById('result-message');
    const critiqueList = document.getElementById('critique-list');
    const closeResult = document.getElementById('close-result');

    // Init
    serialEl.innerText = state.serial;

    // Layer Interactions
    layerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.layer;
            state.layers[type] = !state.layers[type];
            btn.classList.toggle('active');
            document.getElementById(`layer-${type}`).classList.toggle('active');
            
            if (type === 'hologram') {
                idCard.classList.toggle('hologram-effect', state.layers.hologram);
            }
        });
    });

    // Data Interactions
    nameInput.addEventListener('input', (e) => {
        state.specimen.name = e.target.value.toUpperCase();
        displayName.innerText = state.specimen.name || '---';
    });

    yearInput.addEventListener('input', (e) => {
        state.specimen.year = e.target.value;
        displayYear.innerText = state.specimen.year;
    });

    // Forensic Tools
    uvToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('uv-lamp-active');
        } else {
            document.body.classList.remove('uv-lamp-active');
        }
    });

    zoomToggle.addEventListener('change', (e) => {
        idCard.style.transform = e.target.checked ? 'scale(1.2)' : 'scale(1)';
        idCard.style.zIndex = e.target.checked ? '10' : '1';
    });

    // Scanning Logic
    scanBtn.addEventListener('click', () => {
        scanBtn.disabled = true;
        scanBtn.innerText = 'SCANNING FORGERY...';
        
        setTimeout(() => {
            calculateScore();
            scanBtn.disabled = false;
            scanBtn.innerText = 'SUBMIT FOR SCANNING';
        }, 2000);
    });

    function calculateScore() {
        let score = 0;
        const totalLayers = Object.values(state.layers).filter(v => v).length;
        score += totalLayers * 20; // 80% if all layers present

        // Data Check
        if (state.specimen.name === 'JOHN DOE') score += 10;
        if (state.specimen.year === '2026') score += 10;

        // Visuals
        scanFeedback.classList.remove('hidden');
        const offset = 283 - (283 * (score / 100));
        scoreCircle.style.strokeDashoffset = offset;
        scoreText.innerText = score + '%';

        let grade = "NOVICE ATTEMPT";
        if (score >= 90) grade = "PROFESSIONAL COUNTERFEIT";
        else if (score >= 70) grade = "SKILLED FORGERY";
        else if (score >= 40) grade = "AMATEUR FAKE";
        
        gradeText.innerText = grade;
        gradeText.style.color = score >= 70 ? 'var(--accent-green)' : 'var(--accent-red)';

        showDetailedReport(score, grade);
    }

    function showDetailedReport(score, grade) {
        resultModal.classList.add('active');
        resultMsg.innerText = `Final Forensic Analysis: Your specimen achieved a ${score}% authenticity replication match. Verdict: ${grade}.`;
        
        critiqueList.innerHTML = '';
        
        const checks = [
            { id: 'watermark', name: 'Watermark Security' },
            { id: 'microprint', name: 'Microprinting Resolution' },
            { id: 'hologram', name: 'Optical Hologram' },
            { id: 'uvink', name: 'UV Fluorescent Pattern' }
        ];

        checks.forEach(check => {
            const li = document.createElement('div');
            li.className = `critique-item ${state.layers[check.id] ? 'hit' : 'miss'}`;
            li.innerText = `${state.layers[check.id] ? '✓' : '✗'} ${check.name}: ${state.layers[check.id] ? 'Replicated' : 'Missing'}`;
            critiqueList.appendChild(li);
        });

        // Date check
        const dateLi = document.createElement('div');
        dateLi.className = `critique-item ${state.specimen.year === '2026' ? 'hit' : 'miss'}`;
        dateLi.innerText = `${state.specimen.year === '2026' ? '✓' : '✗'} Data Integrity (Year): ${state.specimen.year === '2026' ? 'Consistent' : 'Altered/Suspect'}`;
        critiqueList.appendChild(dateLi);
    }

    closeResult.addEventListener('click', () => {
        resultModal.classList.remove('active');
    });
});
