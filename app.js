// app.js - Core Game Engine (SPA + Dynamic Question Management + Ordering + Export)
// ============================================
(function() {
    'use strict';

    let config = loadConfig();
    let gameState = {
        move: 0, bank: 150, visit: 0, time: 0, year: 1,
        extra1: 0, extra2: 0, extra3: 0, extra4: 0, extra5: 0, extra6: 0, extra7: 0,
        id: null, name: '', phone: '',
        // ── PATCH (year1-only mode): 'two' = full two-year game (with the
        // Year 1 reserve restriction), 'one' = single-year game (no reserve,
        // ends right after Year 1's last question).
        playMode: 'two'
    };
    let isAdmin = false;
    let timerInterval = null;
    let currentStepId = null;
    let adminViewMode = 'game'; // 'game', 'list', 'edit'
    let adminListYear = 1; // ── PATCH (year2 admin): which year's questions the admin is browsing/editing

    // ── PATCH (year2 admin): returns (and lazily creates) the steps array for a given year
    function stepsArrayFor(year) {
        if (year === 2) {
            if (!config.steps2) config.steps2 = [];
            return config.steps2;
        }
        return config.steps;
    }
    function setStepsArrayFor(year, arr) {
        if (year === 2) config.steps2 = arr; else config.steps = arr;
    }

    document.addEventListener('DOMContentLoaded', () => {
        initSession();
        createPersistentHUD();
        startTimer();
        createAdminToggle();
        renderMainMenu();
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('admin-editable')) saveAdminInputs();
        });
    });

    function initSession() {
        if (!sessionStorage.getItem('id')) {
            gameState.id = Math.floor(Math.random() * 900000) + 100000;
            sessionStorage.setItem('id', gameState.id);
            ['move', 'bank', 'visit', 'time', 'year'].forEach(k => sessionStorage.setItem(k, gameState[k]));
            for(let i=1; i<=7; i++) sessionStorage.setItem('extra'+i, gameState['extra'+i]);
            sessionStorage.setItem('playMode', gameState.playMode);
        } else {
            ['move', 'bank', 'visit', 'time', 'year'].forEach(k => gameState[k] = parseInt(sessionStorage.getItem(k)) || gameState[k]);
            for(let i=1; i<=7; i++) gameState['extra'+i] = parseInt(sessionStorage.getItem('extra'+i)) || 0;
            gameState.id = sessionStorage.getItem('id');
            gameState.name = sessionStorage.getItem('name') || '';
            gameState.phone = sessionStorage.getItem('phone') || '';
            gameState.playMode = sessionStorage.getItem('playMode') || 'two';
        }
    }

    function saveGameState() {
        ['move', 'bank', 'visit', 'time', 'year'].forEach(k => sessionStorage.setItem(k, gameState[k]));
        for(let i=1; i<=7; i++) sessionStorage.setItem('extra'+i, gameState['extra'+i]);
        sessionStorage.setItem('playMode', gameState.playMode);
        updateHUD();
    }

    function resetGameState() {
        gameState.move = 0;
        gameState.bank = config.settings.startingBank;
        gameState.visit = 0;
        gameState.time = 0;
        gameState.year = 1;
        gameState.playMode = 'two'; // ── PATCH (year1-only mode): re-ask the mode each new game
        for(let i=1; i<=7; i++) gameState['extra'+i] = 0;
        ['move', 'bank', 'visit', 'time', 'year'].forEach(k => sessionStorage.setItem(k, gameState[k]));
        for(let i=1; i<=7; i++) sessionStorage.setItem('extra'+i, 0);
        sessionStorage.setItem('playMode', gameState.playMode);
        _bestStrategy = null; // ── PATCH: recompute best-strategy for the new mode
        _year1MaxScore = null;
        updateHUD();
    }

    // ── PATCH (year 2): coins that Year 1 is not allowed to touch.
    // Year 2 has its own grant, so it never needs a reserve of its own.
    // ── PATCH (year1-only mode): in single-year mode there's no reserve to keep,
    // since Year 2 will never happen.
    function currentReserve() {
        if (gameState.playMode === 'one') return 0;
        return gameState.year === 1 ? (config.settings.year2Reserve || 0) : 0;
    }

    // ── PATCH (year 2): which step list / step count is "current"?
    function activeSteps() {
        return gameState.year === 1 ? config.steps : (config.steps2 || []);
    }
    function totalStepCount() {
        return config.steps.length + (config.steps2 ? config.steps2.length : 0);
    }

    // FIX: year2ScoreMultiplier was defined in config-default.js ("Year 2
    // tourists count for more") but never actually read anywhere — every
    // score calculation used the flat Year 1 scoreMultiplier regardless of
    // year. This is now the single source of truth for which multiplier
    // applies to a given year's moves.
    function scoreMultiplierForYear(year) {
        return year === 2
            ? (config.settings.year2ScoreMultiplier || config.settings.scoreMultiplier)
            : config.settings.scoreMultiplier;
    }

    // ── PATCH (year 1→2 review): called when Year 1's last step is reached.
    // Gives the user a chance to review Year 1's move-by-move recap before
    // choosing to proceed to Year 2 (previously this jumped straight into
    // Year 2 with no pause).
    function showYearOneEndScreen() {
        document.getElementById('hud-container').style.display = 'none';
        const b = getLoginBox();
        // FIX (year2ScoreMultiplier): gameState.visit is now accrued already
        // weighted by each move's own multiplier, so it must not be
        // multiplied again here.
        const sr = gameState.visit;

        // ── PATCH: preliminary Year 1 totals (Year-1-only maximum, since
        // Year 2 hasn't happened yet at this point)
        const max1 = getYear1MaxScore();
        const pct1 = max1 > 0 ? Math.round((sr / max1) * 100) : 0;

        b.innerHTML = `
            <h2 style="color:#03e9f4;">${config.ui.year1EndTitle || 'Год 1 завершён'}</h2>
            <div class="result-tourist-box">
                <div class="result-tourist-main"> Туристов за год 1: ${sr}</div>
                <div class="result-tourist-sub">из максимума (год 1): ${max1}</div>
            </div>

            <div style="margin:14px 0 6px; text-align:left; color:#aaa; font-size:0.85rem;">
                Эффективность стратегии (год 1): ${pct1}%
            </div>
            <div style="background:#1a2a3a; border-radius:6px; height:18px; overflow:hidden; border:1px solid #03e9f4;">
                <div id="score-bar-fill-y1" style="height:100%; width:0%; background:linear-gradient(90deg,#03e9f4,#0077ff);
                    border-radius:6px; transition:width 1.2s ease;"></div>
            </div>

            <button type="button" class="neon-btn" id="btn-recap-y1" style="margin-top:20px; border-color:#ff9900; color:#ff9900;">
                <span></span><span></span><span></span><span></span> Разбор ходов
            </button>
            <button type="button" class="neon-btn" id="btn-proceed-year2" style="margin-top:10px;">
                <span></span><span></span><span></span><span></span>${gameState.playMode === 'one' ? (config.ui.year1FinishBtn || 'Завершить игру') : config.ui.year2IntroBtn}
            </button>`;

        // Animate bar after render (same pattern as the final screen)
        requestAnimationFrame(() => {
            setTimeout(() => {
                const fill = document.getElementById('score-bar-fill-y1');
                if (fill) fill.style.width = pct1 + '%';
            }, 100);
        });

        document.getElementById('btn-recap-y1').onclick = showRecapModal;
        // ── PATCH (year1-only mode): one-year games end the game here instead
        // of proceeding into Year 2.
        document.getElementById('btn-proceed-year2').onclick = (gameState.playMode === 'one') ? showFinalScreen : startYearTwo;
    }

    // ── PATCH (year 2): called when the user chooses to proceed to Year 2.
    function startYearTwo() {
        gameState.year = 2;
        gameState.move = 0;
        gameState.bank += (config.settings.year2Grant || 0);
        saveGameState();
        const b = getLoginBox();
        document.getElementById('hud-container').style.display = 'none';
        b.innerHTML = `
            <h2 style="color:#03e9f4;">${config.ui.year2IntroTitle}</h2>
            ${(config.ui.year2IntroText || []).map(t => `<p>${t}</p>`).join('')}
            <p style="color:#aaa;">Бюджет на второй год: ${gameState.bank}</p>
            <form><button type="button" class="neon-btn" id="btn-start-year2"><span></span><span></span><span></span><span></span>${config.ui.year2IntroBtn}</button></form>
        `;
        document.getElementById('btn-start-year2').onclick = () => {
            document.getElementById('hud-container').style.display = 'flex';
            loadGameStep(config.steps2[0].id);
        };
    }

    function createPersistentHUD() {
        let hud = document.getElementById('hud-container');
        if (!hud) {
            hud = document.createElement('div'); hud.id = 'hud-container';
            hud.innerHTML = `<div class="hud-item" id="hud-score">Монет: ${gameState.bank}</div><div class="hud-item" id="hud-move">Год ${gameState.year}, месяц: ${gameState.move + 1}/${activeSteps().length}</div>`;
            document.body.prepend(hud);
        }
    }

    function updateHUD() {
        const s = document.getElementById('hud-score'), m = document.getElementById('hud-move');
        if (s) s.textContent = `Монет: ${gameState.bank}`;
        if (m) m.textContent = `Год ${gameState.year}, месяц: ${gameState.move + 1}/${activeSteps().length}`;
        updateEfficiencyHUD(); // ── PATCH
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => { gameState.time++; sessionStorage.setItem('time', gameState.time); }, 1000);
    }

    function checkLoseCondition() {
        if (gameState.move > activeSteps().length) { 
            gameState.visit = "0. Превышено число ходов!"; 
            showLostScreen(); return true; 
        }
        if (gameState.bank < 0) { 
            gameState.visit = "0. Превышен бюджет!"; 
            showLostScreen(); return true; 
        }
        return false;
    }

    function getLoginBox() {
        let b = document.querySelector('.login-box');
        if (!b) { b = document.createElement('div'); b.className = 'login-box'; document.body.appendChild(b); }
        return b;
    }

    // ── PATCH (year1-only mode): let the player choose, before registering,
    // whether to play just Year 1 (no reserve restriction) or the full two
    // years (with the Year 1 reserve kept for Year 2).
    function renderModeSelect() {
        const b = getLoginBox();
        b.innerHTML = `
            <h2>${config.ui.modeSelectTitle || 'Выберите режим игры'}</h2>
            <p>${config.ui.modeSelectText || 'Можно сыграть только первый год (без ограничения на резерв бюджета) или пройти оба года подряд (часть бюджета первого года резервируется на второй).'}</p>
            <form>
                <button type="button" class="neon-btn" id="btn-mode-one"><span></span><span></span><span></span><span></span>${config.ui.modeOneBtn || 'Только 1 год'}</button>
                <button type="button" class="neon-btn" id="btn-mode-two"><span></span><span></span><span></span><span></span>${config.ui.modeTwoBtn || 'Полные 2 года'}</button>
            </form>`;
        document.getElementById('btn-mode-one').onclick = () => { gameState.playMode = 'one'; _bestStrategy = null; _year1MaxScore = null; renderRegistration(); };
        document.getElementById('btn-mode-two').onclick = () => { gameState.playMode = 'two'; _bestStrategy = null; _year1MaxScore = null; renderRegistration(); };
    }

    // ===== ADMIN NAVIGATION & AUTO-LINKING =====
    function renderMainMenu() {
        if (checkLoseCondition()) return;
        currentStepId = null;
        document.getElementById('hud-container').style.display = 'none';
        const b = getLoginBox();
        
        if (isAdmin && adminViewMode === 'list') {
            renderAdminQuestionList(b);
        } else if (isAdmin && adminViewMode === 'game') {
            b.innerHTML = `
                <div class="admin-field" data-tooltip="Главный заголовок"><input type="text" class="admin-editable" data-ui="mainTitle" value="${config.ui.mainTitle}" style="font-size:clamp(1.5rem, 5vw, 3rem); text-align:center; margin-bottom:20px; color:#03e9f4;"></div>
                <form>
                    <button type="button" class="neon-btn" id="btn-start"><span></span><span></span><span></span><span></span><span class="btn-text">${config.ui.startBtn}</span></button>
                    <button type="button" class="neon-btn" id="btn-rules"><span></span><span></span><span></span><span></span><span class="btn-text">${config.ui.rulesBtn}</span></button>
                </form>
                <div class="admin-field" data-tooltip="Подзаголовок"><input type="text" class="admin-editable" data-ui="mainSubtitle" value="${config.ui.mainSubtitle}" style="font-size:clamp(1.5rem, 5vw, 3rem); text-align:center; margin-top:20px; color:#03e9f4;"></div>
                <button class="nav-btn" id="btn-manage-questions"> Управление вопросами</button>
            `;
            document.getElementById('btn-start').onclick = renderModeSelect;
            document.getElementById('btn-rules').onclick = renderRules;
            document.getElementById('btn-manage-questions').onclick = () => { adminViewMode = 'list'; renderMainMenu(); };
            
        } else if (!isAdmin) {
            b.innerHTML = `<h2>${config.ui.mainTitle}</h2><form><button type="button" class="neon-btn" id="btn-start"><span></span><span></span><span></span><span></span>${config.ui.startBtn}</button><button type="button" class="neon-btn" id="btn-rules"><span></span><span></span><span></span><span></span>${config.ui.rulesBtn}</button></form><h2>${config.ui.mainSubtitle}</h2>`;
            document.getElementById('btn-start').onclick = renderModeSelect;
            document.getElementById('btn-rules').onclick = renderRules;
        }
    }

    function renderAdminQuestionList(b) {
        // ── PATCH (year2 admin): list either Year 1 or Year 2 questions via tabs
        const year = adminListYear;
        const steps = stepsArrayFor(year);

        let html = `
            <div class="nav-header">
                <button class="nav-btn" id="btn-back-home"> На главную</button>
                <h2 style="color:#03e9f4; margin:10px 0;">Вопросы (${steps.length})</h2>
            </div>
            <div class="nav-header" style="margin-bottom:10px;">
                <button class="nav-btn" id="btn-tab-year1" style="${year===1?'background:#03e9f4;color:#000;':''}">Год 1 (${config.steps.length})</button>
                <button class="nav-btn" id="btn-tab-year2" style="${year===2?'background:#03e9f4;color:#000;':''}">Год 2 (${(config.steps2||[]).length})</button>
            </div>
            <div class="admin-scroll-list">`;

        steps.forEach((step, idx) => {
            const isTop = (idx === 0);
            const isBottom = (idx === steps.length - 1);
            
            html += `
            <div class="admin-option-card" style="margin-bottom:10px; padding:10px; border:1px solid #444; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#03e9f4;">#${step.id}: ${step.question.substring(0,30)}...</strong>
                    <br><small style="color:#aaa;">Вариантов: ${step.options.length}</small>
                </div>
                <div style="display:flex; gap:5px; align-items:center;">
                    <button class="move-btn" onclick="window.moveQuestion(${idx}, 'up', ${year})" ${isTop ? 'disabled' : ''} title="Вверх">▲</button>
                    <button class="move-btn" onclick="window.moveQuestion(${idx}, 'down', ${year})" ${isBottom ? 'disabled' : ''} title="Вниз">▼</button>
                    <button class="neon-btn" style="width:auto; min-height:40px; padding:8px 12px; font-size:0.8rem;" onclick="editQuestion(${step.id}, ${year})">Изменить</button>
                    <button class="neon-btn" style="width:auto; min-height:40px; padding:8px 12px; font-size:0.8rem; background:#ff4444;" onclick="deleteQuestion(${step.id}, ${year})">Удалить</button>
                </div>
            </div>`;
        });
        
        html += `</div>
            <button class="neon-btn" id="btn-add-question" style="margin-top:15px; border:1px dashed var(--neon-blue); background:rgba(3,233,244,0.1);"><span></span><span></span><span></span><span></span> Добавить вопрос</button>`;
            
        b.innerHTML = html;
        document.getElementById('btn-back-home').onclick = () => { adminViewMode = 'game'; renderMainMenu(); };
        document.getElementById('btn-tab-year1').onclick = () => { adminListYear = 1; renderAdminQuestionList(b); };
        document.getElementById('btn-tab-year2').onclick = () => { adminListYear = 2; renderAdminQuestionList(b); };
        document.getElementById('btn-add-question').onclick = () => addQuestion(year);
    }

    // ===== GLOBAL FUNCTIONS FOR BUTTONS =====
    // ── PATCH (year2 admin): all of these now take an explicit `year` (1 or 2)
    // so admins can manage Year 1 and Year 2 question lists independently.
    window.moveQuestion = function(index, direction, year) {
        year = year || 1;
        const arr = stepsArrayFor(year);
        if (direction === 'up' && index > 0) {
            // Swap with previous
            const temp = arr[index];
            arr[index] = arr[index - 1];
            arr[index - 1] = temp;
            relinkQuestions(year);
            renderAdminQuestionList(getLoginBox());
        } else if (direction === 'down' && index < arr.length - 1) {
            // Swap with next
            const temp = arr[index];
            arr[index] = arr[index + 1];
            arr[index + 1] = temp;
            relinkQuestions(year);
            renderAdminQuestionList(getLoginBox());
        }
    };

    window.editQuestion = function(stepId, year) {
        adminListYear = year || 1;
        currentStepId = stepId;
        adminViewMode = 'edit';
        loadGameStep(stepId);
    };

    window.deleteQuestion = function(stepId, year) {
        year = year || 1;
        const arr = stepsArrayFor(year);
        if (arr.length <= 1) { alert("Нельзя удалить последний вопрос!"); return; }
        if (confirm("Удалить этот вопрос? Игра будет автоматически перестроена.")) {
            setStepsArrayFor(year, arr.filter(s => s.id !== stepId));
            relinkQuestions(year);
            renderMainMenu();
        }
    };

    window.addQuestion = function(year) {
        year = year || 1;
        const arr = stepsArrayFor(year);
        const newQuestion = {
            id: 0, question: "Новый вопрос",
            options: [
                { id: 1, text: "Вариант 1", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
                { id: 2, text: "Вариант 2", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
                { id: 3, text: "Вариант 3", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
                { id: 4, text: "Вариант 4", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
            ],
            nextStep: 'final'
        };
        // FIX: insert right before the final-trigger step (single option,
        // nextStep === 'final') instead of always appending at the end.
        // Previously, appending after an existing final trigger silently
        // demoted the real "Узнать результаты..." step into an ordinary
        // mid-game question and turned the brand-new blank question into
        // the new final trigger.
        const isFinalTrigger = s => s.options.length === 1 && s.nextStep === 'final';
        let insertAt = arr.length;
        if (arr.length > 0 && isFinalTrigger(arr[arr.length - 1])) {
            insertAt = arr.length - 1;
        }
        arr.splice(insertAt, 0, newQuestion);
        relinkQuestions(year);
        editQuestion(arr[insertAt].id, year);
    };

    // Automatically re-chains all questions 1->2->3...->final within a single year's list
    // ── FIX (year2 id collision): Year 2 ids must keep the +100 offset (101, 102, ...)
    // so they never collide with Year 1's 1..N ids. Without this, moving/adding/deleting
    // a Year 2 question reset its ids back to 1, 2, 3..., which then collided with Year 1
    // question ids and caused wrong rationale tooltips (buildRationale keys on stepId-optId).
    function relinkQuestions(year) {
        year = year || 1;
        const arr = stepsArrayFor(year);
        const base = (year === 2) ? 100 : 0;
        for (let i = 0; i < arr.length; i++) {
            arr[i].id = base + i + 1;
            arr[i].nextStep = (i === arr.length - 1) ? 'final' : (base + i + 2);
        }
        saveConfig(config);
    }

    function renderRegistration() {
        const b = getLoginBox();
        b.innerHTML = isAdmin ? `
            <div class="admin-field" data-tooltip="Заголовок регистрации"><input type="text" class="admin-editable" data-ui="regTitle" value="${config.ui.regTitle}" style="font-size:2rem; text-align:center; margin-bottom:20px;"></div>
            <form>
                <div class="user-box"><input type="text" id="input-name" required value="${gameState.name}"><label class="admin-field" data-tooltip="Подпись имени"><input type="text" class="admin-editable" data-ui="regName" value="${config.ui.regName}" style="background:transparent; border:none; color:#fff;"></label></div>
                <div class="user-box"><input type="text" id="input-phone" required value="${gameState.phone}"><label class="admin-field" data-tooltip="Подпись телефона"><input type="text" class="admin-editable" data-ui="regPhone" value="${config.ui.regPhone}" style="background:transparent; border:none; color:#fff;"></label></div>
                <div class="admin-field" data-tooltip="Примечание"><input type="text" class="admin-editable" data-ui="regNote" value="${config.ui.regNote}" style="text-align:center; margin:10px 0;"></div>
                <button type="button" class="neon-btn" id="btn-reg-start"><span></span><span></span><span></span><span></span><span class="btn-text">${config.ui.regBtn}</span></button>
            </form>` : `
            <h2>${config.ui.regTitle}</h2><form>
                <div class="user-box"><input type="text" id="input-name" required value="${gameState.name}"><label>${config.ui.regName}</label></div>
                <div class="user-box"><input type="text" id="input-phone" required value="${gameState.phone}"><label>${config.ui.regPhone}</label></div>
                <h4>${config.ui.regNote}</h4>
                <button type="button" class="neon-btn" id="btn-reg-start"><span></span><span></span><span></span><span></span>${config.ui.regBtn}</button>
            </form>`;
        document.getElementById('btn-reg-start').onclick = () => {
            gameState.name = document.getElementById('input-name').value || 'Аноним';
            gameState.phone = document.getElementById('input-phone').value || 'Не указан';
            sessionStorage.setItem('name', gameState.name);
            sessionStorage.setItem('phone', gameState.phone);
            document.getElementById('hud-container').style.display = 'flex';
            loadGameStep(1);
        };
    }

    function renderRules() {
        const b = getLoginBox();
        if (isAdmin) {
            b.innerHTML = `
                <div class="admin-field" data-tooltip="Правила (каждый пункт с новой строки)"><textarea class="admin-editable" data-ui="rulesText" rows="5" style="width:100%; text-align:left; font-size:1rem; margin-bottom:20px; background:rgba(0,0,0,0.3); color:#fff; border:1px dashed #555;">${config.ui.rulesText.join('\n')}</textarea></div>
                <form><button type="button" class="nav-btn" id="btn-back-rules"> Назад</button></form>
            `;
            document.getElementById('btn-back-rules').onclick = () => { adminViewMode = 'game'; renderMainMenu(); };
        } else {
            b.innerHTML = config.ui.rulesText.map(t => `<p>${t}</p>`).join('') + 
                `<form><button type="button" class="neon-btn" id="btn-back-rules"><span></span><span></span><span></span><span></span>${config.ui.rulesBackBtn}</button></form>`;
            document.getElementById('btn-back-rules').onclick = renderMainMenu;
        }
    }

    function loadGameStep(id) {
        if (checkLoseCondition()) return;
        currentStepId = id;
        // ── PATCH (year2 admin): admin browses/edits whichever year's list is
        // selected (adminListYear), independent of the live session's gameState.year.
        const stepsArr = isAdmin ? stepsArrayFor(adminListYear) : activeSteps();
        const step = stepsArr.find(s => s.id === id);
        if (!step) {
            if (isAdmin) { adminViewMode = 'list'; renderMainMenu(); return; }
            if (gameState.year === 1) { showYearOneEndScreen(); return; }
            showFinalScreen(); return;
        }
        const b = getLoginBox();
        document.getElementById('hud-container').style.display = 'flex';
        
        if (isAdmin) {
            renderAdminStepEditor(step, b, adminListYear);
        } else {
            const q = `<p id="questt" style="font-size:3vh;text-align:left;margin-bottom:30px">${step.question}</p>`;
            let o = '';
            step.options.forEach(op => {
                let c = true, m = '';
                if (op.conditionType >= 1 && op.conditionType <= 7 && gameState['extra'+op.conditionType] < op.requiredExtra) { 
                    c = false; m = ` (требуется: E${op.conditionType}≥${op.requiredExtra})`; 
                }
                if (op.cost > gameState.bank - currentReserve()) {
                    c = false;
                    m = (gameState.playMode === 'one')
                        ? ' (недостаточно бюджета)'
                        : ` (нужно оставить резерв на год 2: ${currentReserve()})`;
                }
                // PATCH 3: build rationale tooltip from option data
                const rationale = buildRationale(op, step.id);
                o += `<div class="opt-wrap">
                  <button type="button" class="neon-btn ${c?'':'disabled'}" data-cost="${op.cost}" data-score="${op.scoreGain}" data-e1="${op.extra1Gain||0}" data-e2="${op.extra2Gain||0}" data-e3="${op.extra3Gain||0}" data-e4="${op.extra4Gain||0}" data-e5="${op.extra5Gain||0}" data-e6="${op.extra6Gain||0}" data-e7="${op.extra7Gain||0}" data-cond="${op.conditionType}" data-req="${op.requiredExtra}" data-next="${step.nextStep}" ${c?'':'disabled'}><span></span><span></span><span></span><span></span>${op.text}. Стоимость: ${op.cost}${m}</button>
                  <button type="button" class="rationale-btn" data-tip="${rationale}" aria-label="Пояснение">ℹ</button>
                </div>`;
            });
            b.innerHTML = q + `<form>${o}</form>`;
            // Rationale popover handler
            b.querySelectorAll('.rationale-btn').forEach(rb => {
                rb.onclick = (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.rationale-popover').forEach(p => p.remove());
                    const pop = document.createElement('div');
                    pop.className = 'rationale-popover';
                    pop.textContent = rb.dataset.tip;
                    rb.parentNode.insertBefore(pop, rb.nextSibling);
                    setTimeout(() => pop.remove(), 4000);
                };
            });
            document.addEventListener('click', () => {
                document.querySelectorAll('.rationale-popover').forEach(p => p.remove());
            }, { once: true });
            b.querySelectorAll('.neon-btn:not(.disabled)').forEach(btn => btn.onclick = e => selectOption(btn));
            appendHintButton(id); // ── PATCH: hint button
        }
        updateHUD();
    }


    // ===================================================
    // INSTRUCTIONAL PATCH — best-strategy solver
    // ===================================================

    /**
     * Solve the game tree with simple greedy DP.
     *
     * Since steps are linear (no branching), the optimal play
     * is: at each step, choose the option with the highest
     * scoreGain that (a) costs ≤ remaining bank and
     * (b) meets conditionType prerequisites given the extras
     * accumulated so far.
     *
     * ── PATCH (year2): continues the same simulation into Year 2 —
     * respecting the Year 1 reserve, then adding the Year 2 grant — instead
     * of stopping after Year 1. Previously this only ever solved Year 1,
     * so a full Year 1+2 playthrough's actual score could exceed the
     * reported "maximum" (>100% efficiency), which was the bug.
     *
     * Returns { totalScore, path }
     *   path[i] = { stepId, year, optionId, scoreGain, cost }
     */
    function solveBestStrategy() {
        let bank = config.settings.startingBank;
        let score = 0;
        let extras = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0 };
        const path = [];
        // ── PATCH (year1-only mode): no reserve needed if Year 2 will never happen
        const reserve = (gameState.playMode === 'one') ? 0 : (config.settings.year2Reserve || 0);

        function playYear(steps, year, bankFloor) {
            for (const step of steps) {
                // Skip the "final trigger" step (single option, 0 cost/score)
                if (step.options.length === 1 && step.nextStep === 'final') continue;

                // Find the best affordable, available option
                let best = null;
                for (const op of step.options) {
                    if (op.cost > bank - bankFloor) continue;
                    if (op.conditionType >= 1 && op.conditionType <= 7 &&
                        extras[op.conditionType] < op.requiredExtra) continue;
                    if (!best || op.scoreGain > best.scoreGain) best = op;
                }

                if (best) {
                    bank  -= best.cost;
                    // FIX (year2ScoreMultiplier): weight by this year's own
                    // multiplier as we go, instead of applying one flat
                    // multiplier to the whole Year1+Year2 total at the end.
                    score += best.scoreGain * scoreMultiplierForYear(year);
                    for (let i = 1; i <= 7; i++) {
                        extras[i] += (best['extra' + i + 'Gain'] || 0);
                    }
                    path.push({
                        stepId:    step.id,
                        year:      year,
                        optionId:  best.id,
                        optionText: best.text,
                        scoreGain: best.scoreGain,
                        cost:      best.cost
                    });
                }
            }
        }

        // Year 1 — must leave the Year 2 reserve untouched, mirroring real gameplay
        // (reserve is 0 in single-year mode, so nothing is held back)
        playYear(config.steps, 1, reserve);

        // ── PATCH (year2): if a Year 2 exists AND the player chose the full
        // two-year mode, continue the simulation into it
        if (gameState.playMode !== 'one' && config.steps2 && config.steps2.length) {
            bank += (config.settings.year2Grant || 0);
            playYear(config.steps2, 2, 0);
        }

        // FIX (year2ScoreMultiplier): score is already weighted per-year above.
        return { totalScore: score, path };
    }

    // Cached result — computed once per game session
    let _bestStrategy = null;
    function getBestStrategy() {
        if (!_bestStrategy) _bestStrategy = solveBestStrategy();
        return _bestStrategy;
    }

    // ── PATCH (year 1→2 review): Year-1-only max score, for the preliminary
    // totals shown at the end of Year 1 (before Year 2 has even started, so
    // the full Year 1+2 maximum from solveBestStrategy() wouldn't be a fair
    // comparison yet).
    function solveYear1MaxScore() {
        let bank = config.settings.startingBank;
        let score = 0;
        let extras = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0 };
        const reserve = (gameState.playMode === 'one') ? 0 : (config.settings.year2Reserve || 0);

        for (const step of config.steps) {
            if (step.options.length === 1 && step.nextStep === 'final') continue;
            let best = null;
            for (const op of step.options) {
                if (op.cost > bank - reserve) continue;
                if (op.conditionType >= 1 && op.conditionType <= 7 &&
                    extras[op.conditionType] < op.requiredExtra) continue;
                if (!best || op.scoreGain > best.scoreGain) best = op;
            }
            if (best) {
                bank -= best.cost;
                score += best.scoreGain;
                for (let i = 1; i <= 7; i++) extras[i] += (best['extra' + i + 'Gain'] || 0);
            }
        }
        return score * config.settings.scoreMultiplier;
    }
    let _year1MaxScore = null;
    function getYear1MaxScore() {
        if (_year1MaxScore === null) _year1MaxScore = solveYear1MaxScore();
        return _year1MaxScore;
    }

    
    // ── PATCH: hand-written educational rationale (RU) ──────────────────────
    const RATIONALE = {
        "1-1": "Бывалые прагматики — опытные путешественники, которые хотят высокого качества за деньги. Они много тратят, но требуют зрелой инфраструктуры — отсюда высокая стоимость привлечения.",
        "1-2": "Непритязательные туристы приезжают в любых условиях. Недорогой сегмент, но и поток невелик — бюджет уходит минимально, а прирост скромный.",
        "1-3": "Семейные туристы — самый массовый и доходный сегмент Владивостока. Им нужны безопасность, разнообразие и доступность, поэтому вложения оправдываются большим потоком.",
        "1-4": "Экстремалы — узкая аудитория. Инфраструктура для них дорога и специализирована, а массового потока не даёт — затраты сопоставимы с «Бывалыми», но отдача ниже.",

        "2-1": "1–2 дня — транзитный формат. Туристы почти не тратят деньги в городе, поэтому экономический эффект минимален, несмотря на небольшие инвестиции.",
        "2-2": "3–7 дней — стандартный туристский пакет. Хороший баланс между стоимостью разработки продукта и реальным потоком, но потенциал ещё не максимален.",
        "2-3": "8–9 дней — оптимальный горизонт для Дальнего Востока. Турист успевает посетить острова, Русский мост, музеи. Длинные туры дают более высокий прирост посетителей.",
        "2-4": "10+ дней — премиальный формат. Во Владивостоке пока не хватает контента на такой срок, отсюда высокая цена продукта и лишь незначительный выигрыш перед 8–9 днями.",

        "3-1": "Хостелы — доступное жильё для молодёжи и бэкпекеров. Низкие затраты на строительство и хорошая заполняемость дают стабильный прирост туристского потока.",
        "3-2": "Трёхзвёздочные отели — стандарт для массового рынка. Вложения чуть выше хостелов, но сегмент более конкурентный — прирост посетителей ниже ожидаемого.",
        "3-3": "Глэмпинги отражают мировой тренд на экотуризм. Природа Приморья идеально подходит: невысокие затраты на строительство, но высокий интерес и уникальность продукта.",
        "3-4": "Пятизвёздочные отели привлекают VIP-туристов и деловые делегации, которые тратят много. Высокая стоимость строительства окупается плотным потоком платёжеспособных гостей.",

        "4-1": "Новый терминал аэропорта улучшит пропускную способность, но авиарейсов во Владивосток и так уже достаточно. Большие вложения дают умеренный прирост — узкое место не в аэропорту.",
        "4-2": "Углубление дна морвокзала позволит принимать крупные круизные лайнеры. Это перспективное направление, но круизный рынок развивается медленно — краткосрочный эффект невысокий.",
        "4-3": "Реконструкция автомобильных пунктов пропуска открывает въезд туристам из Китая, Кореи и Японии. Именно автотуристы и автобусные группы дают самый большой поток в регионе.",
        "4-4": "Пляж у гостиницы — локальное благоустройство. Почти не требует бюджета и создаёт комфорт для уже приехавших туристов, но новых гостей почти не привлекает — отсюда неожиданно неплохой КПД.",

        "5-1": "Паназиатская кухня — модный тренд, но во Владивостоке она уже есть повсюду. Туристам это не в новинку, конкурентного преимущества не создаёт.",
        "5-2": "Русская кухня интересна иностранным туристам, но отечественных гостей ею не удивить. Влияние на поток минимально.",
        "5-3": "Фастфуд решает базовую потребность, но не формирует гастрономический образ города. Низкий вклад в туристскую привлекательность.",
        "5-4": "Дальневосточная кухня — краб, морской ёж, гребешок — это уникальное конкурентное преимущество Владивостока. Гастротуризм активно растёт, и аутентичная еда является весомым мотивом поездки.",

        "6-1": "Электромопеды — модный и экологичный вариант для коротких поездок. Удобны в холмистом Владивостоке, но охватывают лишь небольшую часть туристских маршрутов.",
        "6-2": "Троллейбусы — дёшево, но инфраструктура устарела и маршруты ограничены. Туристам неудобно разбираться в сети, реального прироста почти нет.",
        "6-3": "Электрички связывают Владивосток с пригородами и позволяют добраться до природных объектов — полуострова, бухт, Уссурийска. Это именно то, что туристам нужно, при разумных затратах.",
        "6-4": "Метро — масштабный проект, который долго строится и стоит дорого. В компактном Владивостоке его эффект для туристов значительно ниже, чем в городах-миллионниках.",

        "7-1": "Один фестиваль в год — почти ничего. Событийный туризм строится на регулярности и разнообразии; одна точка не формирует поток.",
        "7-2": "10 фестивалей — уже заметная событийная программа. Охватывает несколько сезонов и интересов, но всё ещё недостаточно для устойчивого потока.",
        "7-3": "70 фестивалей — это более одного мероприятия в неделю. Владивосток превращается в постоянно живущий событиями город: это максимальный магнит для туристов.",
        "7-4": "50 фестивалей в год — насыщенная программа с хорошим охватом. Чуть дешевле 70, а прирост туристов пропорционально ниже — но всё равно очень эффективно.",

        "8-1": "Tigre de Cristal — крупнейшее интегрированное развлекательное казино региона. Привлекает состоятельных гостей из Азии, но это узкая аудитория.",
        "8-2": "Туристско-информационный центр помогает ориентироваться в городе, но сам по себе не является ядром кластера — это вспомогательная инфраструктура.",
        "8-3": "ВГУЭС Трэвел — университетское турагентство. Полезно для учебного туризма, но не создаёт конкурентного ядра кластера в масштабах города.",
        "8-4": "Сильный туристский кластер не строится на одном предприятии — он требует сети якорных объектов. Без чёткого ядра кластер оказывается размытым, но зато средства не расходуются зря.",

        "9-1": "Привлечение кадров из других регионов даёт быстрый результат и высокую квалификацию. Дорого из-за релокации, но такие специалисты сразу создают турпоток.",
        "9-2": "Волонтёры дёшевы и энергичны, но нестабильны. Они не могут полностью заменить профессионалов, хотя и создают заметный эффект при минимальных затратах.",
        "9-3": "Воспитание собственных кадров — стратегически лучшее решение. Дорого и долго, зато формирует устойчивую базу специалистов и ОТКРЫВАЕТ доступ к более эффективным опциям в следующих шагах.",
        "9-4": "Рассчитывать, что кадры сами появятся — значит не управлять ситуацией. Небольшой органический прирост всё же происходит, но без системной работы отрасль теряет конкурентоспособность.",

        "10-1": "Виртуальная экскурсия у внешних специалистов — дорогостоящая разработка. Привлекает туристов на этапе выбора направления, но эффективнее, если создана своими силами.",
        "10-2": "Система бронирования у внешних специалистов — необходимый инструмент, но переплата посредникам снижает рентабельность. Своя система была бы выгоднее.",
        "10-3": "Создать и экскурсию, и бронирование своими кадрами — идеально по соотношению цены и эффекта. Доступно только если на шаге 9 вы выбрали «Воспитание собственных» и вложились в специалистов.",
        "10-4": "Отказ от цифровых инструментов в современном туризме — серьёзная ошибка, но небольшой поток всё равно приходит по старым каналам. Сэкономленные деньги не компенсируют упущенный потенциал.",

        "11-1": "Без продвижения туристы узнают о Владивостоке случайно. Поток не растёт — это стратегический проигрыш, несмотря на нулевые затраты.",
        "11-2": "Агентство знает рынок и инструменты, но работает за комиссию. Хороший результат, однако компетенции остаются у внешнего исполнителя, а не у вас.",
        "11-3": "Продвижение своими кадрами — самый эффективный вариант по цене: дёшево, а результат такой же, как у агентства. Требует наличия подготовленной команды (шаг 9).",

        "12-1": "Владивосток — не спортивный курорт, но площадки для активного отдыха есть. Акцент на спорте отвлекает ресурсы от более сильных сторон города.",
        "12-2": "Пляжный туризм — главная ловушка. Сезон короткий, вода холодная, а туристы, приехав ради пляжа, разочаровываются. Это наносит серьёзный удар по репутации и потоку.",
        "12-3": "Зимний туризм — незаслуженно забытое направление. Владивосток зимой красив, немноголюден и аутентичен. Акцент на этом не навредит потоку, а может и помочь.",
        "12-4": "Этнокультурный туризм привлекателен, но во Владивостоке он ещё недостаточно развит как продукт. Акцент на нём слегка снижает эффективность продвижения.",

        "13-1": "Это финальный шаг — посмотрим, что получилось!",

        // ── PATCH: Year 2 rationale (previously missing entirely — every
        // Year 2 option fell back to the generic "Нет пояснения" text) ──
        "101-1": "Хостелы во втором сезоне — надёжный и недорогой способ нарастить номерной фонд, но конкуренция в этом сегменте уже выросла с первого года.",
        "101-2": "Глэмпинги продолжают набирать популярность у туристов, ищущих природу и уникальный опыт, — дороже хостелов, но и отдача выше.",
        "101-3": "Собственные строители, обученные в первый год, расширяют номерной фонд быстрее и дешевле внешних подрядчиков — практический эффект инвестиции в кадры.",
        "101-4": "Отказ от расширения экономит бюджет, но упускает спрос уже сформированного за первый год потока туристов.",

        "102-1": "Более частые электрички — постепенное улучшение доступности для тех, кто уже выбрал этот вид транспорта.",
        "102-2": "Автобусные маршруты для гостей из Китая, Кореи и Японии открывают целый новый международный сегмент — самый выгодный шаг для транспортной доступности во втором сезоне.",
        "102-3": "Ничего не менять — самый дешёвый вариант, но транспортная доступность второго сезона остаётся на уровне первого года.",

        "103-1": "Дальневосточная кухня — устойчивое гастрономическое позиционирование города, которое во второй сезон продолжает привлекать гурманов.",
        "103-2": "Фастфуд закрывает базовый спрос, но не усиливает репутацию города как гастрономического направления.",
        "103-3": "Без изменений — гастрономическое предложение второго сезона не развивается дальше уровня первого года.",

        "104-1": "Стороннее агентство снова даёт результат, но комиссия посредника делает продвижение менее выгодным, чем свои силы.",
        "104-2": "Команда, обученная в первый год, продвигает город дешевле и эффективнее агентства — прямая отдача от вложений в кадры.",
        "104-3": "Отказ от продвижения ничего не стоит, но и не приносит новых туристов во втором сезоне.",

        "105-1": "Повтор прошлогоднего календаря фестивалей — стабильный, но не растущий вариант событийной программы.",
        "105-2": "Крупный якорный фестиваль, приуроченный к уже сформированному кластеру, усиливает его как точку притяжения — самый сильный вариант для второго сезона.",
        "105-3": "Сокращение программы экономит бюджет, но снижает событийную привлекательность города во второй сезон.",

        "106-1": "Горнолыжный курорт — дорогостоящий, но мощный якорь для зимнего направления, недооценённого во Владивостоке.",
        "106-2": "Зимние фестивали и ярмарки — доступный способ оживить зимний сезон без крупных капитальных вложений.",
        "106-3": "Команда, обученная в первый год, развивает зимний продукт дешевле и эффективнее — снова окупается инвестиция в кадры.",
        "106-4": "Не развивать зимний туризм — ничего не стоит, но оставляет город без круглогодичного турпотока.",

        "107-1": "Внешние тренеры быстро поднимают уровень сервиса, но это разовая и не самая бюджетная услуга.",
        "107-2": "Свои кадры, обученные в первый год, внедряют стандарты сервиса дешевле и с не меньшим эффектом.",
        "107-3": "Программа лояльности удерживает уже приехавших туристов и мотивирует их возвращаться, при умеренных затратах.",
        "107-4": "Без изменений в сервисе — бюджет экономится, но качество гостеприимства не растёт.",

        "108-1": "Агентство обновляет цифровое присутствие быстро, но за существенную плату посреднику.",
        "108-2": "Своя команда делает то же самое дешевле и эффективнее — сервис уже наработан за первый год.",
        "108-3": "Экономия бюджета за счёт отказа от цифрового развития — но город рискует отстать в онлайн-продвижении.",

        "109-1": "Это финальный шаг второго сезона — посмотрим, что получилось за оба года!"
    };

    function buildRationale(op, stepId) {
        const key = stepId + '-' + op.id;
        return RATIONALE[key] || 'Нет пояснения для этого варианта.';
    }
    // ── END rationale table ───────────────────────────────────────────────────



    // Per-move history for recap modal
    let moveHistory = [];

    /**
     * Show post-move feedback overlay.
     * bestScoreForStep  = scoreGain of optimal option at this step (×multiplier)
     * playerScoreForStep = scoreGain of chosen option (×multiplier)
     */
    function showMoveFeedback(playerScore, bestScore, nextStepId) {
        const diff = bestScore - playerScore;
        const mult = config.settings.scoreMultiplier;
        const isOptimal = diff <= 0;

        const overlay = document.createElement('div');
        overlay.id = 'move-feedback-overlay';
        overlay.style.cssText = `
            position:fixed; inset:0; display:flex; align-items:center;
            justify-content:center; z-index:5000; pointer-events:all;
            background:rgba(0,0,0,0.55);`;

        const box = document.createElement('div');
        box.style.cssText = `
            background:#141e30; border-radius:12px; padding:24px 32px;
            text-align:center; max-width:340px; width:90%;
            border:2px solid ${isOptimal ? '#03e9f4' : '#ff9900'};
            box-shadow:0 0 24px ${isOptimal ? '#03e9f4' : '#ff9900'}55;`;

        if (isOptimal) {
            box.innerHTML = `
                <div style="font-size:2.8rem;"></div>
                <div style="font-size:1.4rem; color:#03e9f4; font-weight:700; margin:10px 0;">
                    Лучший ход!
                </div>
                <div style="color:#aaa; font-size:0.9rem;">
                    Оптимальный выбор — так держать!
                </div>`;
        } else {
            box.innerHTML = `
                <div style="font-size:2.4rem;"></div>
                <div style="font-size:1.3rem; color:#ff9900; font-weight:700; margin:10px 0;">
                    Недополучено ${diff} туристов
                </div>
                <div style="color:#aaa; font-size:0.9rem;">
                    Лучший вариант принёс бы на ${diff} туристов больше
                </div>`;
        }

        const btn = document.createElement('button');
        btn.className = 'neon-btn';
        btn.style.cssText = 'margin-top:16px; width:100%;';
        btn.innerHTML = '<span></span><span></span><span></span><span></span>Продолжить';
        btn.onclick = () => {
            overlay.remove();
            loadGameStep(parseInt(nextStepId));
        };
        box.appendChild(btn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    /** Return the best scoreGain for a given stepId, or null if step not found */
    function getBestScoreForStep(stepId, currentBank, currentExtras) {
        const best = getBestOptionForStep(stepId, currentBank, currentExtras);
        return best ? best.scoreGain : null;
    }

    // ── PATCH (year2): same search, but returns the full option object (so
    // callers can show its text, not just its score). Uses activeSteps() —
    // i.e. whichever year's step list is currently live — so it works
    // correctly for both Year 1 and Year 2 questions.
    function getBestOptionForStep(stepId, currentBank, currentExtras) {
        const step = activeSteps().find(s => s.id === stepId);
        if (!step) return null;
        let best = null;
        for (const op of step.options) {
            if (op.cost > currentBank) continue;
            if (op.conditionType >= 1 && op.conditionType <= 7 &&
                currentExtras['extra' + op.conditionType] < op.requiredExtra) continue;
            if (best === null || op.scoreGain > best.scoreGain) best = op;
        }
        return best;
    }

    // ── 4: Hint button ───────────────────────────────────────────────────────
    /**
     * Append a "Подсказка" button to the current step.
     * On click it reveals which option text is optimal right now
     * (without giving away the score value).
     */
    function appendHintButton(stepId) {
        const b = getLoginBox();
        const hint = document.createElement('button');
        hint.type = 'button';   // CRITICAL: prevents form submit on click
        hint.className = 'neon-btn';
        hint.style.cssText = 'margin-top:6px; border-color:#888; color:#888; font-size:0.85rem;';
        hint.innerHTML = '<span></span><span></span><span></span><span></span> Подсказка';
        let revealed = false;
        hint.onclick = () => {
            if (revealed) return;
            revealed = true;
            // FIX: build a LOCAL best choice from the CURRENT step using
            // the player's ACTUAL bank/extras — not the global greedy path.
            const step = activeSteps().find(s => s.id === stepId);
            if (!step) { hint.innerHTML = ' Нет данных шага'; return; }
            let bestOpt = null;
            // FIX: subtract the Year 2 reserve here too, so the hint never
            // recommends an option that is actually disabled on screen.
            const affordableBank = gameState.bank - currentReserve();
            for (const op of step.options) {
                if (op.cost > affordableBank) continue;
                if (op.conditionType >= 1 && op.conditionType <= 7 &&
                    gameState['extra' + op.conditionType] < op.requiredExtra) continue;
                if (!bestOpt || op.scoreGain > bestOpt.scoreGain) bestOpt = op;
            }
            if (bestOpt) {
                hint.innerHTML = ` Лучший вариант: «${bestOpt.text}»`;
                hint.style.color = '#03e9f4';
                hint.style.borderColor = '#03e9f4';
            } else {
                hint.innerHTML = ' Нет доступных вариантов';
            }
            // Do NOT navigate away — just show inline.
        };
        const form = b.querySelector('form');
        if (form) form.appendChild(hint);
        else b.appendChild(hint);
    }

    // ── 5: Efficiency HUD ───────────────────────────────────────────────────
    function updateEfficiencyHUD() {
        let effItem = document.getElementById('hud-efficiency');
        if (!effItem) {
            const hud = document.getElementById('hud-container');
            if (!hud) return;
            effItem = document.createElement('div');
            effItem.className = 'hud-item';
            effItem.id = 'hud-efficiency';
            hud.appendChild(effItem);
        }
        // ── PATCH (year2): total money ever available includes the Year 2
        // grant once it's been received, so "spent" doesn't understate itself
        // (previously this only knew about startingBank, so once the Year 2
        // grant was added to gameState.bank, "spent" could look artificially low).
        const totalGranted = config.settings.startingBank + (gameState.year === 2 ? (config.settings.year2Grant || 0) : 0);
        const spent = totalGranted - gameState.bank;
        // FIX (year2ScoreMultiplier): gameState.visit is already weighted by
        // each move's own year multiplier — do not multiply again here.
        const eff = spent > 0
            ? (gameState.visit / spent).toFixed(1)
            : '—';
        effItem.textContent = `КПД: ${eff} т/м`;
        effItem.title = 'Туристов на каждую потраченную монету';
    }

    // ── 6: Move-history recap modal ─────────────────────────────────────────
    function showRecapModal() {
        if (moveHistory.length === 0) return;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(0,0,0,0.8);
            z-index:6000; overflow-y:auto; display:flex;
            align-items:flex-start; justify-content:center; padding:20px;`;

        let rows = '';
        let lastYear = null;
        moveHistory.forEach((m, i) => {
            // ── PATCH: insert a "Год N" section header whenever the year changes
            if (m.year !== lastYear) {
                lastYear = m.year;
                rows += `<tr><td colspan="5" style="padding:10px 4px 4px; color:#03e9f4; font-weight:700; border-bottom:1px solid #03e9f4;">Год ${lastYear || 1}</td></tr>`;
            }
            const good = m.playerScore >= m.bestScore;
            const icon = good ? 'Да' : 'Нет';
            const diff = m.bestScore - m.playerScore;
            rows += `<tr style="border-bottom:1px solid #333;">
                <td style="padding:6px 4px; color:#aaa;">${i+1}</td>
                <td style="padding:6px 4px; color:#fff; font-size:0.85rem;">${m.question.substring(0,30)}…</td>
                <td style="padding:6px 4px; color:#03e9f4;">${m.playerChoice}</td>
                <td style="padding:6px 4px; color:#ff9900;">${good ? '—' : m.bestChoice}</td>
                <td style="padding:6px 4px; color:${good?'#4caf50':'#ff9900'}; font-weight:700;">${icon} ${good ? '+0' : '-'+diff}</td>
            </tr>`;
        });

        overlay.innerHTML = `
            <div style="background:#141e30; border-radius:12px; padding:20px;
                        max-width:680px; width:100%; border:1px solid #03e9f4;">
                <h2 style="color:#03e9f4; margin:0 0 16px;"> Разбор ходов</h2>
                <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                    <thead>
                        <tr style="color:#888; border-bottom:1px solid #444;">
                            <th style="padding:6px 4px; text-align:left;">#</th>
                            <th style="padding:6px 4px; text-align:left;">Вопрос</th>
                            <th style="padding:6px 4px; text-align:left;">Ваш выбор</th>
                            <th style="padding:6px 4px; text-align:left;">Лучший выбор</th>
                            <th style="padding:6px 4px; text-align:left;">Δ туристов</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                </div>
                <button id="close-recap" class="neon-btn" style="margin-top:16px; width:100%;">
                    <span></span><span></span><span></span><span></span>Закрыть
                </button>
            </div>`;

        document.body.appendChild(overlay);
        overlay.querySelector('#close-recap').onclick = () => overlay.remove();
    }
    // ===================================================
    // END INSTRUCTIONAL PATCH helpers
    // ===================================================

    // ── PATCH: immediate tap feedback so a choice never feels unresponsive,
    // especially on slower devices/connections — mark the tapped option,
    // lock out the rest, then advance after a short, deliberate pause.
    function selectOption(btn) {
        const form = btn.closest('form');
        if (form) {
            form.querySelectorAll('.neon-btn').forEach(b => {
                b.onclick = null;
                if (b !== btn) b.classList.add('disabled');
            });
        }
        btn.classList.add('selected');
        setTimeout(() => handleOptionClick(btn), 220);
    }

    function handleOptionClick(btn) {
        const c = parseInt(btn.dataset.cost), sg = parseInt(btn.dataset.score);
        const e1 = parseInt(btn.dataset.e1), e2 = parseInt(btn.dataset.e2), e3 = parseInt(btn.dataset.e3), e4 = parseInt(btn.dataset.e4), e5 = parseInt(btn.dataset.e5), e6 = parseInt(btn.dataset.e6), e7 = parseInt(btn.dataset.e7);
        const ns = btn.dataset.next, ct = parseInt(btn.dataset.cond), re = parseInt(btn.dataset.req);
        const thisStepId = currentStepId;

        if (ns === 'final') {
            if (gameState.year === 1) { showYearOneEndScreen(); return; }
            showFinalScreen(); return;
        }

        // ── PATCH: capture best score/option BEFORE updating state (uses the
        // CURRENTLY ACTIVE year's step list, so this works for Year 2 too) ──
        const bestScoreRaw = getBestScoreForStep(thisStepId, gameState.bank, gameState) || 0;
        const bestOpt = getBestOptionForStep(thisStepId, gameState.bank, gameState);
        const moveYear = gameState.year; // ── PATCH: remember which year this move happened in
        // FIX (year2ScoreMultiplier): use the multiplier for the year the move
        // actually happened in, not always the flat Year 1 scoreMultiplier.
        const mult = scoreMultiplierForYear(moveYear);

        gameState.move += 1;
        let cm = true;
        if (ct >= 1 && ct <= 7 && gameState['extra'+ct] < re) cm = false;

        let actualSg = 0;
        if (cm) {
            // FIX: accrue visit already weighted by this move's year multiplier,
            // so Year 1 and Year 2 tourists are combined correctly instead of
            // both being scaled by the same flat multiplier at display time.
            gameState.bank -= c; actualSg = sg; gameState.visit += sg * mult;
            gameState.extra1 += e1; gameState.extra2 += e2; gameState.extra3 += e3; gameState.extra4 += e4;
            gameState.extra5 += e5; gameState.extra6 += e6; gameState.extra7 += e7;
        }
        saveGameState();
        updateEfficiencyHUD(); // ── PATCH: update KPD

        // ── PATCH: record move for recap (uses activeSteps(), not the
        // hardcoded config.steps, so Year 2 moves are recorded correctly) ──
        const step = activeSteps().find(s => s.id === thisStepId);
        if (step) {
            moveHistory.push({
                year:         moveYear, // ── PATCH: so the recap can label/group by year
                question:    step.question,
                playerChoice: btn.textContent.replace(/\s+/g,' ').trim().split('.')[0],
                playerScore:  actualSg * mult,
                bestScore:    bestScoreRaw * mult,
                bestChoice:   bestOpt ? bestOpt.text : '—'
            });
        }

        if (checkLoseCondition()) return;

        // ── PATCH: show feedback overlay before next step ─────────────────
        showMoveFeedback(actualSg * mult, bestScoreRaw * mult, ns);
        // (loadGameStep is called inside overlay "Продолжить" button)
    }

    function showFinalScreen() {
        clearInterval(timerInterval);
        document.getElementById('hud-container').style.display = 'none';
        const b = getLoginBox();
        // FIX (year2ScoreMultiplier): gameState.visit already sums each move's
        // score weighted by that move's own year multiplier.
        const sr = gameState.visit;

        // ── PATCH: compute best possible score ────────────────────────────
        const bestResult = getBestStrategy();
        const maxSr = bestResult.totalScore;
        const pct = maxSr > 0 ? Math.round((sr / maxSr) * 100) : 0;

        if (typeof Email !== 'undefined') { try { Email.send("miostvvguproject@mail.ru", "miostvvguproject@mail.ru", 'Результат:'+sr+'/'+maxSr+'; Имя:'+gameState.name+'; Телефон:'+gameState.phone+'; Время:'+gameState.time+'; Айди:'+gameState.id, "this is the body", "smtp.mail.ru", "miostvvguproject@mail.ru", "HKWxL9y5TnFMhFGrZFWd"); } catch(e) {} }

        b.innerHTML = `
            <h2 style="color:#03e9f4;">${config.ui.finalTitle}</h2>
            <button type="button" class="neon-btn result-btn" disabled style="background:teal;color:#fff;border:none;margin-top:10px;"><span></span><span></span><span></span><span></span>Имя: ${gameState.name}</button>
            <button type="button" class="neon-btn result-btn" disabled style="background:burlywood;color:#000;border:none;margin-top:10px;"><span></span><span></span><span></span><span></span>ID: ${gameState.id}</button>
            <div class="result-tourist-box">
                <div class="result-tourist-main"> Туристов: ${sr}</div>
                <div class="result-tourist-sub">из максимума: ${maxSr}</div>
            </div>
            <button type="button" class="neon-btn result-btn" disabled style="background:green;color:#fff;border:none;margin-top:10px;"><span></span><span></span><span></span><span></span>Время: ${gameState.time}с</button>

            <!-- ── PATCH: visual progress bar ── -->
            <div style="margin:14px 0 6px; text-align:left; color:#aaa; font-size:0.85rem;">
                Эффективность стратегии: ${pct}%
            </div>
            <div style="background:#1a2a3a; border-radius:6px; height:18px; overflow:hidden; border:1px solid #03e9f4;">
                <div id="score-bar-fill" style="height:100%; width:0%; background:linear-gradient(90deg,#03e9f4,#0077ff);
                    border-radius:6px; transition:width 1.2s ease;"></div>
            </div>

            <button type="button" class="neon-btn" id="btn-recap" style="margin-top:20px; border-color:#ff9900; color:#ff9900;">
                <span></span><span></span><span></span><span></span> Разбор ходов
            </button>
            <button type="button" class="neon-btn" id="btn-main-final" style="margin-top:10px;">
                <span></span><span></span><span></span><span></span>${config.ui.finalBtnMain}
            </button>`;

        // Animate bar after render
        requestAnimationFrame(() => {
            setTimeout(() => {
                const fill = document.getElementById('score-bar-fill');
                if (fill) fill.style.width = pct + '%';
            }, 100);
        });

        document.getElementById('btn-recap').onclick = showRecapModal;
        document.getElementById('btn-main-final').onclick = () => {
            _bestStrategy = null; // reset cache
            moveHistory = [];
            resetGameState();
            renderMainMenu();
        };
    }

    function showLostScreen() {
        clearInterval(timerInterval);
        document.getElementById('hud-container').style.display = 'none';
        const b = getLoginBox();
        b.innerHTML = `<h2 style="color:#ff4444;">${config.ui.lostTitle}</h2><p style="font-size:3vh;text-align:center;color:#fff;margin:20px 0;">${gameState.visit}</p><p style="font-size:2vh;color:#aaa;">Монет: ${gameState.bank} | Ходов: ${gameState.move + 1}/${activeSteps().length}</p><form><button type="button" class="neon-btn" id="btn-restart-lost"><span></span><span></span><span></span><span></span>${config.ui.lostRestartBtn}</button></form>`;
        document.getElementById('btn-restart-lost').onclick = () => { resetGameState(); renderMainMenu(); };
    }

    function createAdminToggle() {
        const t = document.createElement('div'); t.id = 'admin-toggle'; t.innerHTML = '&#8226;&#8226;&#8226;';
        t.onclick = () => {
            const p = prompt('Введите пароль администратора:');
            if (p === config.settings.adminPassword) {
                isAdmin = !isAdmin;
                t.style.color = isAdmin ? '#03e9f4' : 'rgba(255,255,255,0.3)';
                t.style.borderColor = isAdmin ? '#03e9f4' : '#444';
                t.style.boxShadow = isAdmin ? '0 0 10px #03e9f4' : 'none';
                renderSaveButton();
                currentStepId ? loadGameStep(currentStepId) : renderMainMenu();
            } else if (p !== null) alert('Неверный пароль');
        };
        document.body.appendChild(t);
    }

    function renderSaveButton() {
        let toolbar = document.getElementById('admin-toolbar');
        if (toolbar) toolbar.remove();
        if (isAdmin) {
            toolbar = document.createElement('div'); toolbar.id = 'admin-toolbar';

            const saveBtn = document.createElement('button'); saveBtn.id = 'save-btn'; saveBtn.textContent = 'Сохранить всё';
            saveBtn.onclick = () => { saveAdminInputs(); saveConfig(config); alert('Все изменения сохранены!'); };
            toolbar.appendChild(saveBtn);

            const exportBtn = document.createElement('button'); exportBtn.id = 'export-btn'; exportBtn.textContent = 'Скачать автономную версию';
            exportBtn.onclick = () => { exportStandaloneGame(); };
            toolbar.appendChild(exportBtn);

            const resetBtn = document.createElement('button'); resetBtn.id = 'reset-btn'; resetBtn.textContent = 'Сбросить всё';
            resetBtn.onclick = () => { if (confirm("Вы уверены?")) { localStorage.removeItem('miost_config'); sessionStorage.clear(); location.reload(); } };
            toolbar.appendChild(resetBtn);

            document.body.appendChild(toolbar);
        }
    }

    function renderAdminStepEditor(step, box, year) {
        year = year || 1;
        let h = `<div class="nav-header">
            <button class="nav-btn" id="btn-back-list"> К списку</button>
            <button class="nav-btn" id="btn-back-home-edit"> На главную</button>
        </div>
        <div style="color:#aaa; font-size:0.8rem; margin-bottom:8px;">Год ${year}</div>
        <div class="admin-field" data-tooltip="Вопрос текущего шага"><input type="text" class="admin-editable" data-type="step-question" data-step="${step.id}" data-year="${year}" value="${step.question}" style="text-align:center;margin-bottom:20px;font-size:3vh;color:#03e9f4;"></div>`;
        
        step.options.forEach((opt, idx) => {
            h += `
            <div class="admin-option-card" style="position:relative;">
                <button class="admin-opt-remove" data-step="${step.id}" data-idx="${idx}" data-year="${year}" title="Удалить вариант">x</button>
                <div class="admin-option-title">Вариант ${idx+1}</div>
                <div class="admin-field" data-tooltip="Текст кнопки"><input type="text" class="admin-editable" data-type="opt-text" data-step="${step.id}" data-idx="${idx}" data-year="${year}" value="${opt.text}" style="width:100%;margin-bottom:8px;"></div>
                <div class="admin-params-row">
                    <div class="admin-param" data-tooltip="Стоимость"><label>Стоимость</label><input type="number" class="admin-editable" data-type="opt-cost" data-step="${step.id}" data-idx="${idx}" data-year="${year}" value="${opt.cost}"></div>
                    <div class="admin-param" data-tooltip="Очки"><label>Очки</label><input type="number" class="admin-editable" data-type="opt-score" data-step="${step.id}" data-idx="${idx}" data-year="${year}" value="${opt.scoreGain}"></div>
                    ${[1,2,3,4,5,6,7].map(n => `<div class="admin-param" data-tooltip="Прибавка к E${n}"><label>E${n}</label><input type="number" class="admin-editable" data-type="opt-e${n}" data-step="${step.id}" data-idx="${idx}" data-year="${year}" value="${opt['extra'+n+'Gain']||0}"></div>`).join('')}
                    <div class="admin-param" data-tooltip="Условие: 0=нет, 1-7=нужен E[1-7]"><label>Условие</label><input type="number" class="admin-editable" data-type="opt-cond" data-step="${step.id}" data-idx="${idx}" data-year="${year}" value="${opt.conditionType}" min="0" max="7"></div>
                </div>
            </div>`;
        });
        h += `<button class="admin-add-option" data-step="${step.id}" data-year="${year}"> Добавить вариант ответа</button>`;
        box.innerHTML = h;

        // Navigation Listeners
        document.getElementById('btn-back-list').onclick = () => { saveAdminInputs(); adminViewMode = 'list'; renderMainMenu(); };
        document.getElementById('btn-back-home-edit').onclick = () => { saveAdminInputs(); adminViewMode = 'game'; renderMainMenu(); };

        box.querySelectorAll('.admin-opt-remove').forEach(btn => {
            btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); removeOption(parseInt(btn.dataset.step), parseInt(btn.dataset.idx), parseInt(btn.dataset.year)); };
        });
        const addBtn = box.querySelector('.admin-add-option');
        if (addBtn) addBtn.onclick = (e) => { e.preventDefault(); addOption(parseInt(addBtn.dataset.step), parseInt(addBtn.dataset.year)); };
    }

    function addOption(stepId, year) {
        year = year || 1;
        const step = stepsArrayFor(year).find(s => s.id === stepId);
        if (!step) return;
        step.options.push({
            id: step.options.length + 1, text: "Новый вариант", cost: 0, scoreGain: 0,
            extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0,
            conditionType: 0, requiredExtra: 0
        });
        saveConfig(config);
        renderAdminStepEditor(step, document.querySelector('.login-box'), year);
    }

    function removeOption(stepId, idx, year) {
        year = year || 1;
        const step = stepsArrayFor(year).find(s => s.id === stepId);
        if (!step || step.options.length <= 1) { alert("Оставьте хотя бы один вариант!"); return; }
        const removedText = step.options[idx].text;
        if (confirm(`Удалить "${removedText}"?`)) {
            step.options.splice(idx, 1);
            step.options.forEach((opt, i) => { opt.id = i + 1; });
            saveConfig(config);
            renderAdminStepEditor(step, document.querySelector('.login-box'), year);
        }
    }

    function saveAdminInputs() {
        document.querySelectorAll('.admin-editable').forEach(el => {
            if (el.dataset.ui) { 
                const k = el.dataset.ui; 
                if (el.tagName === 'TEXTAREA') config.ui[k] = el.value.split('\n').filter(l => l.trim() !== ''); 
                else config.ui[k] = el.value; 
            } else if (el.dataset.type) {
                const t = el.dataset.type, sid = parseInt(el.dataset.step);
                const year = parseInt(el.dataset.year) || 1;
                const st = stepsArrayFor(year).find(s => s.id === sid);
                if (!st) return;
                if (t === 'step-question') st.question = el.value;
                else if (t.indexOf('opt-') === 0) {
                    const idx = parseInt(el.dataset.idx);
                    if (!st.options[idx]) return;
                    const op = st.options[idx];
                    if (t === 'opt-text') op.text = el.value;
                    else if (t === 'opt-cost') op.cost = parseInt(el.value) || 0;
                    else if (t === 'opt-score') op.scoreGain = parseInt(el.value) || 0;
                    else if (t === 'opt-cond') op.conditionType = parseInt(el.value) || 0;
                    else { const m = t.match(/^opt-e(\d+)$/); if (m) op['extra'+m[1]+'Gain'] = parseInt(el.value) || 0; }
                }
            }
        });
    }

    // ── FIX: previously this embedded a hand-maintained duplicate copy of the
    // whole engine as a string, which silently fell out of sync with the real
    // game (it had no Year 2 support at all). Instead, this now fetches the
    // ACTUAL live files (style.css, config-default.js, smtp.js, app.js) and
    // bundles them as-is, so the export can never go stale again. The only
    // thing swapped in is the current (possibly admin-edited) config, in
    // place of config-default.js's built-in DEFAULT_CONFIG.
    async function exportStandaloneGame() {
        saveAdminInputs();

        let cssText, configDefaultText, smtpText, appText;
        try {
            [cssText, configDefaultText, smtpText, appText] = await Promise.all([
                fetch('style.css').then(r => { if (!r.ok) throw new Error('style.css: ' + r.status); return r.text(); }),
                fetch('config-default.js').then(r => { if (!r.ok) throw new Error('config-default.js: ' + r.status); return r.text(); }),
                fetch('smtp.js').then(r => { if (!r.ok) throw new Error('smtp.js: ' + r.status); return r.text(); }),
                fetch('app.js').then(r => { if (!r.ok) throw new Error('app.js: ' + r.status); return r.text(); })
            ]);
        } catch (err) {
            alert('Не удалось собрать автономную версию: ' + err.message + '\n\nЭта функция требует, чтобы игра была запущена через локальный сервер (например: python -m http.server 8000), а не просто открыта двойным кликом — иначе браузер блокирует чтение файлов игры (ошибка CORS на file://).');
            return;
        }

        // Swap config-default.js's built-in DEFAULT_CONFIG for the CURRENT
        // (possibly admin-edited) config, keeping its helper functions
        // (cloneConfig/loadConfig/saveConfig) untouched and functional.
        const splitMarker = '// Helper: Deep clone config for safe editing';
        const splitIdx = configDefaultText.indexOf(splitMarker);
        const configJSON = JSON.stringify(config).replace(/<\/script>/gi, '<\\/script>');
        const configDefaultOut = splitIdx === -1
            ? `const DEFAULT_CONFIG = ${configJSON};\n`
            : `const DEFAULT_CONFIG = ${configJSON};\n\n${configDefaultText.slice(splitIdx)}`;

        const title = (config.ui && config.ui.mainSubtitle) ? config.ui.mainSubtitle : 'ТГРБ ВВГУ';
        const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${title} - Compiled</title>
<style>${cssText}</style>
</head>
<body>
<div class="login-box"></div>
<script>${configDefaultOut}<\/script>
<script>${smtpText}<\/script>
<script>${appText}<\/script>
</body>
</html>`;

        const blob = new Blob([html], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'tgrb_standalone.html';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        alert('Файл скачан!\n\nЭто точная копия текущей игры (включая Год 2, все правки и порядок вопросов), собранная из реальных файлов игры — не устаревший слепок. Для полной совместимости открывайте через локальный сервер (python -m http.server 8000 или VS Code Live Server).');
    }

})();
