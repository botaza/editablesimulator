// app.js - Core Game Engine (SPA + Dynamic Question Management + Ordering + Export)
// ============================================
(function() {
    'use strict';

    let config = loadConfig();
    let gameState = {
        move: 0, bank: 150, visit: 0, time: 0,
        extra1: 0, extra2: 0, extra3: 0, extra4: 0, extra5: 0, extra6: 0, extra7: 0,
        id: null, name: '', phone: ''
    };
    let isAdmin = false;
    let timerInterval = null;
    let currentStepId = null;
    let adminViewMode = 'game'; // 'game', 'list', 'edit'

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
            ['move', 'bank', 'visit', 'time'].forEach(k => sessionStorage.setItem(k, gameState[k]));
            for(let i=1; i<=7; i++) sessionStorage.setItem('extra'+i, gameState['extra'+i]);
        } else {
            ['move', 'bank', 'visit', 'time'].forEach(k => gameState[k] = parseInt(sessionStorage.getItem(k)) || gameState[k]);
            for(let i=1; i<=7; i++) gameState['extra'+i] = parseInt(sessionStorage.getItem('extra'+i)) || 0;
            gameState.id = sessionStorage.getItem('id');
            gameState.name = sessionStorage.getItem('name') || '';
            gameState.phone = sessionStorage.getItem('phone') || '';
        }
    }

    function saveGameState() {
        ['move', 'bank', 'visit', 'time'].forEach(k => sessionStorage.setItem(k, gameState[k]));
        for(let i=1; i<=7; i++) sessionStorage.setItem('extra'+i, gameState['extra'+i]);
        updateHUD();
    }

    function resetGameState() {
        gameState.move = 0;
        gameState.bank = config.settings.startingBank;
        gameState.visit = 0;
        gameState.time = 0;
        for(let i=1; i<=7; i++) gameState['extra'+i] = 0;
        ['move', 'bank', 'visit', 'time'].forEach(k => sessionStorage.setItem(k, gameState[k]));
        for(let i=1; i<=7; i++) sessionStorage.setItem('extra'+i, 0);
        updateHUD();
    }

    function createPersistentHUD() {
        let hud = document.getElementById('hud-container');
        if (!hud) {
            hud = document.createElement('div'); hud.id = 'hud-container';
            hud.innerHTML = `<div class="hud-item" id="hud-score">Монет: ${gameState.bank}</div><div class="hud-item" id="hud-move">Месяц: ${gameState.move + 1}/${config.steps.length}</div>`;
            document.body.prepend(hud);
        }
    }

    function updateHUD() {
        const s = document.getElementById('hud-score'), m = document.getElementById('hud-move');
        if (s) s.textContent = `Монет: ${gameState.bank}`;
        if (m) m.textContent = `Месяц: ${gameState.move + 1}/${config.steps.length}`;
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => { gameState.time++; sessionStorage.setItem('time', gameState.time); }, 1000);
    }

    function checkLoseCondition() {
        if (gameState.move > config.steps.length) { 
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
                <button class="nav-btn" id="btn-manage-questions">📋 Управление вопросами</button>
            `;
            document.getElementById('btn-start').onclick = renderRegistration;
            document.getElementById('btn-rules').onclick = renderRules;
            document.getElementById('btn-manage-questions').onclick = () => { adminViewMode = 'list'; renderMainMenu(); };
            
        } else if (!isAdmin) {
            b.innerHTML = `<h2>${config.ui.mainTitle}</h2><form><button type="button" class="neon-btn" id="btn-start"><span></span><span></span><span></span><span></span>${config.ui.startBtn}</button><button type="button" class="neon-btn" id="btn-rules"><span></span><span></span><span></span><span></span>${config.ui.rulesBtn}</button></form><h2>${config.ui.mainSubtitle}</h2>`;
            document.getElementById('btn-start').onclick = renderRegistration;
            document.getElementById('btn-rules').onclick = renderRules;
        }
    }

    function renderAdminQuestionList(b) {
        let html = `
            <div class="nav-header">
                <button class="nav-btn" id="btn-back-home">🏠 На главную</button>
                <h2 style="color:#03e9f4; margin:10px 0;">Вопросы (${config.steps.length})</h2>
            </div>
            <div class="admin-scroll-list">`;
        
        config.steps.forEach((step, idx) => {
            const isTop = (idx === 0);
            const isBottom = (idx === config.steps.length - 1);
            
            html += `
            <div class="admin-option-card" style="margin-bottom:10px; padding:10px; border:1px solid #444; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#03e9f4;">#${step.id}: ${step.question.substring(0,30)}...</strong>
                    <br><small style="color:#aaa;">Вариантов: ${step.options.length}</small>
                </div>
                <div style="display:flex; gap:5px; align-items:center;">
                    <button class="move-btn" onclick="window.moveQuestion(${idx}, 'up')" ${isTop ? 'disabled' : ''} title="Вверх">▲</button>
                    <button class="move-btn" onclick="window.moveQuestion(${idx}, 'down')" ${isBottom ? 'disabled' : ''} title="Вниз">▼</button>
                    <button class="neon-btn" style="width:auto; padding:5px 10px; font-size:0.8rem;" onclick="editQuestion(${step.id})">✏️</button>
                    <button class="neon-btn" style="width:auto; padding:5px 10px; font-size:0.8rem; background:#ff4444;" onclick="deleteQuestion(${step.id})">🗑️</button>
                </div>
            </div>`;
        });
        
        html += `</div>
            <button class="neon-btn" id="btn-add-question" style="margin-top:15px; border:1px dashed var(--neon-blue); background:rgba(3,233,244,0.1);"><span></span><span></span><span></span><span></span>➕ Добавить вопрос</button>`;
            
        b.innerHTML = html;
        document.getElementById('btn-back-home').onclick = () => { adminViewMode = 'game'; renderMainMenu(); };
        document.getElementById('btn-add-question').onclick = () => addQuestion();
    }

    // ===== GLOBAL FUNCTIONS FOR BUTTONS =====
    window.moveQuestion = function(index, direction) {
        if (direction === 'up' && index > 0) {
            // Swap with previous
            const temp = config.steps[index];
            config.steps[index] = config.steps[index - 1];
            config.steps[index - 1] = temp;
            relinkQuestions();
            renderAdminQuestionList(getLoginBox());
        } else if (direction === 'down' && index < config.steps.length - 1) {
            // Swap with next
            const temp = config.steps[index];
            config.steps[index] = config.steps[index + 1];
            config.steps[index + 1] = temp;
            relinkQuestions();
            renderAdminQuestionList(getLoginBox());
        }
    };

    window.editQuestion = function(stepId) {
        currentStepId = stepId;
        adminViewMode = 'edit';
        loadGameStep(stepId);
    };

    window.deleteQuestion = function(stepId) {
        if (config.steps.length <= 1) { alert("Нельзя удалить последний вопрос!"); return; }
        if (confirm("Удалить этот вопрос? Игра будет автоматически перестроена.")) {
            config.steps = config.steps.filter(s => s.id !== stepId);
            relinkQuestions();
            renderMainMenu();
        }
    };

    window.addQuestion = function() {
        const newId = config.steps.length > 0 ? Math.max(...config.steps.map(s => s.id)) + 1 : 1;
        config.steps.push({
            id: newId, question: "Новый вопрос",
            options: [
                { id: 1, text: "Вариант 1", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
                { id: 2, text: "Вариант 2", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
                { id: 3, text: "Вариант 3", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
                { id: 4, text: "Вариант 4", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
            ],
            nextStep: 'final'
        });
        relinkQuestions();
        editQuestion(newId);
    };

    // Automatically re-chains all questions 1->2->3...->final
    function relinkQuestions() {
        // Sort by ID is not needed if we assume array order is visual order
        // But we must update IDs and nextStep links
        for (let i = 0; i < config.steps.length; i++) {
            config.steps[i].id = i + 1;
            config.steps[i].nextStep = (i === config.steps.length - 1) ? 'final' : (i + 2);
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
                <form><button type="button" class="nav-btn" id="btn-back-rules">🔙 Назад</button></form>
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
        const step = config.steps.find(s => s.id === id);
        if (!step) {
            if (id > config.steps.length) { showFinalScreen(); return; }
            loadGameStep(Math.max(1, id - 1)); return;
        }
        const b = getLoginBox();
        document.getElementById('hud-container').style.display = 'flex';
        
        if (isAdmin) {
            renderAdminStepEditor(step, b);
        } else {
            const q = `<p id="questt" style="font-size:3vh;text-align:left;margin-bottom:30px">${step.question}</p>`;
            let o = '';
            step.options.forEach(op => {
                let c = true, m = '';
                if (op.conditionType >= 1 && op.conditionType <= 7 && gameState['extra'+op.conditionType] < op.requiredExtra) { 
                    c = false; m = ` (требуется: E${op.conditionType}≥${op.requiredExtra})`; 
                }
                o += `<button type="button" class="neon-btn ${c?'':'disabled'}" data-cost="${op.cost}" data-score="${op.scoreGain}" data-e1="${op.extra1Gain||0}" data-e2="${op.extra2Gain||0}" data-e3="${op.extra3Gain||0}" data-e4="${op.extra4Gain||0}" data-e5="${op.extra5Gain||0}" data-e6="${op.extra6Gain||0}" data-e7="${op.extra7Gain||0}" data-cond="${op.conditionType}" data-req="${op.requiredExtra}" data-next="${step.nextStep}" ${c?'':'disabled'}><span></span><span></span><span></span><span></span>${op.text}. Стоимость: ${op.cost}${m}</button>`;
            });
            b.innerHTML = q + `<form>${o}</form>`;
            b.querySelectorAll('.neon-btn:not(.disabled)').forEach(btn => btn.onclick = e => handleOptionClick(btn));
        }
        updateHUD();
    }

    function handleOptionClick(btn) {
        const c = parseInt(btn.dataset.cost), sg = parseInt(btn.dataset.score);
        const e1 = parseInt(btn.dataset.e1), e2 = parseInt(btn.dataset.e2), e3 = parseInt(btn.dataset.e3), e4 = parseInt(btn.dataset.e4), e5 = parseInt(btn.dataset.e5), e6 = parseInt(btn.dataset.e6), e7 = parseInt(btn.dataset.e7);
        const ns = btn.dataset.next, ct = parseInt(btn.dataset.cond), re = parseInt(btn.dataset.req);
        
        if (ns === 'final') { showFinalScreen(); return; }
        gameState.move += 1;
        let cm = true;
        if (ct >= 1 && ct <= 7 && gameState['extra'+ct] < re) cm = false;
        
        if (cm) { 
            gameState.bank -= c; gameState.visit += sg; 
            gameState.extra1 += e1; gameState.extra2 += e2; gameState.extra3 += e3; gameState.extra4 += e4; 
            gameState.extra5 += e5; gameState.extra6 += e6; gameState.extra7 += e7; 
        }
        saveGameState();
        if (checkLoseCondition()) return;
        loadGameStep(parseInt(ns));
    }

    function showFinalScreen() {
        clearInterval(timerInterval);
        document.getElementById('hud-container').style.display = 'none';
        const b = getLoginBox();
        const sr = gameState.visit * config.settings.scoreMultiplier;
        if (typeof Email !== 'undefined') { try { Email.send("miostvvguproject@mail.ru", "miostvvguproject@mail.ru", 'Результат:'+sr+'; Имя:'+gameState.name+'; Телефон:'+gameState.phone+'; Время:'+gameState.time+'; Айди:'+gameState.id, "this is the body", "smtp.mail.ru", "miostvvguproject@mail.ru", "HKWxL9y5TnFMhFGrZFWd"); } catch(e) {} }
        b.innerHTML = `<h2 style="color:#03e9f4;">${config.ui.finalTitle}</h2><button type="button" class="neon-btn result-btn" disabled style="background:teal;color:#fff;border:none;margin-top:10px;"><span></span><span></span><span></span><span></span>Имя: ${gameState.name}</button><button type="button" class="neon-btn result-btn" disabled style="background:burlywood;color:#000;border:none;margin-top:10px;"><span></span><span></span><span></span><span></span>ID: ${gameState.id}</button><button type="button" class="neon-btn result-btn" disabled style="background:mediumslateblue;color:#fff;border:none;margin-top:10px;"><span></span><span></span><span></span><span></span>Туристов: ${sr}</button><button type="button" class="neon-btn result-btn" disabled style="background:green;color:#fff;border:none;margin-top:10px;"><span></span><span></span><span></span><span></span>Время: ${gameState.time}с</button><button type="button" class="neon-btn" id="btn-main-final" style="margin-top:30px;"><span></span><span></span><span></span><span></span>${config.ui.finalBtnMain}</button>`;
        document.getElementById('btn-main-final').onclick = () => { resetGameState(); renderMainMenu(); };
    }

    function showLostScreen() {
        clearInterval(timerInterval);
        document.getElementById('hud-container').style.display = 'none';
        const b = getLoginBox();
        b.innerHTML = `<h2 style="color:#ff4444;">${config.ui.lostTitle}</h2><p style="font-size:3vh;text-align:center;color:#fff;margin:20px 0;">${gameState.visit}</p><p style="font-size:2vh;color:#aaa;">Монет: ${gameState.bank} | Ходов: ${gameState.move + 1}/${config.steps.length}</p><form><button type="button" class="neon-btn" id="btn-restart-lost"><span></span><span></span><span></span><span></span>${config.ui.lostRestartBtn}</button></form>`;
        document.getElementById('btn-restart-lost').onclick = () => { resetGameState(); renderMainMenu(); };
    }

    function createAdminToggle() {
        const t = document.createElement('div'); t.id = 'admin-toggle'; t.innerHTML = '⚙️';
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
        ['save-btn', 'export-btn', 'reset-btn'].forEach(id => {
            let el = document.getElementById(id); if (el) el.remove();
        });
        if (isAdmin) {
            const saveBtn = document.createElement('button'); saveBtn.id = 'save-btn'; saveBtn.textContent = '💾 Сохранить всё';
            saveBtn.style.cssText = 'display:block;position:fixed;bottom:15px;right:80px;background:#28a745;color:#fff;border:none;padding:10px 16px;border-radius:20px;cursor:pointer;z-index:10000;font-size:.9rem;font-weight:700;touch-action:manipulation;box-shadow:0 0 10px rgba(40,167,69,0.5);';
            saveBtn.onclick = () => { saveAdminInputs(); saveConfig(config); alert('✅ Все изменения сохранены!'); };
            document.body.appendChild(saveBtn);

            const exportBtn = document.createElement('button'); exportBtn.id = 'export-btn'; exportBtn.textContent = '📦 Скачать автономную версию';
            exportBtn.style.cssText = 'display:block;position:fixed;bottom:15px;left:185px;background:#03e9f4;color:#000;border:none;padding:10px 16px;border-radius:20px;cursor:pointer;z-index:10000;font-size:.9rem;font-weight:700;touch-action:manipulation;box-shadow:0 0 10px rgba(3,233,244,0.5);';
            exportBtn.onclick = () => { exportStandaloneGame(); };
            document.body.appendChild(exportBtn);

            const resetBtn = document.createElement('button'); resetBtn.id = 'reset-btn'; resetBtn.textContent = '🗑️ Сбросить всё';
            resetBtn.style.cssText = 'display:block;position:fixed;bottom:15px;left:15px;background:#ff4444;color:#fff;border:none;padding:10px 16px;border-radius:20px;cursor:pointer;z-index:10000;font-size:.9rem;font-weight:700;touch-action:manipulation;box-shadow:0 0 10px rgba(255,68,68,0.5);';
            resetBtn.onclick = () => { if (confirm("Вы уверены?")) { localStorage.removeItem('miost_config'); sessionStorage.clear(); location.reload(); } };
            document.body.appendChild(resetBtn);
        }
    }

    function renderAdminStepEditor(step, box) {
        let h = `<div class="nav-header">
            <button class="nav-btn" id="btn-back-list">📋 К списку</button>
            <button class="nav-btn" id="btn-back-home-edit">🏠 На главную</button>
        </div>
        <div class="admin-field" data-tooltip="Вопрос текущего шага"><input type="text" class="admin-editable" data-type="step-question" data-step="${step.id}" value="${step.question}" style="text-align:center;margin-bottom:20px;font-size:3vh;color:#03e9f4;"></div>`;
        
        step.options.forEach((opt, idx) => {
            h += `
            <div class="admin-option-card" style="position:relative;">
                <button class="admin-opt-remove" data-step="${step.id}" data-idx="${idx}" title="Удалить вариант">✕</button>
                <div class="admin-option-title">Вариант ${idx+1}</div>
                <div class="admin-field" data-tooltip="Текст кнопки"><input type="text" class="admin-editable" data-type="opt-text" data-step="${step.id}" data-idx="${idx}" value="${opt.text}" style="width:100%;margin-bottom:8px;"></div>
                <div class="admin-params-row">
                    <div class="admin-param" data-tooltip="Стоимость"><label>Стоимость</label><input type="number" class="admin-editable" data-type="opt-cost" data-step="${step.id}" data-idx="${idx}" value="${opt.cost}"></div>
                    <div class="admin-param" data-tooltip="Очки"><label>Очки</label><input type="number" class="admin-editable" data-type="opt-score" data-step="${step.id}" data-idx="${idx}" value="${opt.scoreGain}"></div>
                    ${[1,2,3,4,5,6,7].map(n => `<div class="admin-param" data-tooltip="Прибавка к E${n}"><label>E${n}</label><input type="number" class="admin-editable" data-type="opt-e${n}" data-step="${step.id}" data-idx="${idx}" value="${opt['extra'+n+'Gain']||0}"></div>`).join('')}
                    <div class="admin-param" data-tooltip="Условие: 0=нет, 1-7=нужен E[1-7]"><label>Условие</label><input type="number" class="admin-editable" data-type="opt-cond" data-step="${step.id}" data-idx="${idx}" value="${opt.conditionType}" min="0" max="7"></div>
                </div>
            </div>`;
        });
        h += `<button class="admin-add-option" data-step="${step.id}">➕ Добавить вариант ответа</button>`;
        box.innerHTML = h;

        // Navigation Listeners
        document.getElementById('btn-back-list').onclick = () => { saveAdminInputs(); adminViewMode = 'list'; renderMainMenu(); };
        document.getElementById('btn-back-home-edit').onclick = () => { saveAdminInputs(); adminViewMode = 'game'; renderMainMenu(); };

        box.querySelectorAll('.admin-opt-remove').forEach(btn => {
            btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); removeOption(parseInt(btn.dataset.step), parseInt(btn.dataset.idx)); };
        });
        const addBtn = box.querySelector('.admin-add-option');
        if (addBtn) addBtn.onclick = (e) => { e.preventDefault(); addOption(parseInt(addBtn.dataset.step)); };
    }

    function addOption(stepId) {
        const step = config.steps.find(s => s.id === stepId);
        if (!step) return;
        step.options.push({
            id: step.options.length + 1, text: "Новый вариант", cost: 0, scoreGain: 0,
            extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0,
            conditionType: 0, requiredExtra: 0
        });
        saveConfig(config);
        renderAdminStepEditor(step, document.querySelector('.login-box'));
    }

    function removeOption(stepId, idx) {
        const step = config.steps.find(s => s.id === stepId);
        if (!step || step.options.length <= 1) { alert("Оставьте хотя бы один вариант!"); return; }
        const removedText = step.options[idx].text;
        if (confirm(`Удалить "${removedText}"?`)) {
            step.options.splice(idx, 1);
            step.options.forEach((opt, i) => { opt.id = i + 1; });
            saveConfig(config);
            renderAdminStepEditor(step, document.querySelector('.login-box'));
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
                const st = config.steps.find(s => s.id === sid);
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

    function exportStandaloneGame() {
        // Force flush
        saveAdminInputs();
        
        const css = `:root{--bg-dark:#141e30;--bg-light:#243b55;--neon-blue:#03e9f4;--glass-bg:rgba(0,0,0,.5);--text-white:#fff;--font-main:sans-serif}*{box-sizing:border-box;outline:none;-webkit-tap-highlight-color:transparent}html,body{height:100%;margin:0;padding:0;font-family:var(--font-main);background:linear-gradient(var(--bg-dark),var(--bg-light));overflow-x:hidden;color:var(--text-white);-webkit-text-size-adjust:100%}#hud-container{position:fixed;top:10px;left:0;width:100%;display:flex;justify-content:space-between;padding:0 15px;z-index:1000;pointer-events:none}.hud-item{background:rgba(0,0,0,.6);padding:8px 12px;border-radius:6px;font-size:clamp(.85rem,4vw,1.3rem);font-weight:700;border:1px solid var(--neon-blue);box-shadow:0 0 8px var(--neon-blue);white-space:nowrap}.login-box{position:absolute;top:50%;left:50%;width:92%;max-width:700px;padding:30px 20px;transform:translate(-50%,-50%);background:var(--glass-bg);box-shadow:0 15px 25px rgba(0,0,0,.6);border-radius:12px;text-align:center;z-index:10;max-height:90vh;overflow-y:auto;-webkit-overflow-scrolling:touch}.login-box h2{margin:0 0 20px;font-size:clamp(1.4rem,6vw,2.8rem);color:#fff;text-align:center}.login-box p{margin:10px 0 20px;padding:0;color:#fff;font-size:clamp(1rem,4vw,1.6rem);text-align:left;line-height:1.5}.login-box form{display:flex;flex-direction:column;gap:16px;align-items:center}.user-box{position:relative;width:100%;margin-bottom:16px}.user-box input{width:100%;padding:12px 0;font-size:16px;color:#fff;margin-bottom:20px;border:none;border-bottom:1px solid #fff;background:0 0;transition:.3s}.user-box label{position:absolute;top:0;left:0;padding:12px 0;font-size:16px;color:#fff;pointer-events:none;transition:.5s}.user-box input:focus~label,.user-box input:valid~label{top:-20px;left:0;color:var(--neon-blue);font-size:.9rem}.neon-btn{position:relative;display:block;width:100%;min-height:48px;padding:12px 16px;color:var(--neon-blue);font-size:clamp(.95rem,3.5vw,1.3rem);text-decoration:none;text-transform:uppercase;overflow:hidden;transition:.3s;margin-top:10px;letter-spacing:1px;border:1px solid rgba(255,255,255,.2);text-align:center;cursor:pointer;background:0 0;font-family:var(--font-main);border-radius:6px;touch-action:manipulation}.neon-btn:hover{background:var(--neon-blue);color:#000;box-shadow:0 0 12px var(--neon-blue);border-color:var(--neon-blue)}.neon-btn:active{transform:scale(.98);opacity:.9}.neon-btn span{position:absolute;display:block}.neon-btn span:nth-child(1){top:0;left:-100%;width:100%;height:2px;background:linear-gradient(90deg,transparent,var(--neon-blue));animation:btn-anim1 1s linear infinite}@keyframes btn-anim1{0%{left:-100%}50%,100%{left:100%}}.neon-btn span:nth-child(2){top:-100%;right:0;width:2px;height:100%;background:linear-gradient(180deg,transparent,var(--neon-blue));animation:btn-anim2 1s linear infinite;animation-delay:.25s}@keyframes btn-anim2{0%{top:-100%}50%,100%{top:100%}}.neon-btn span:nth-child(3){bottom:0;right:-100%;width:100%;height:2px;background:linear-gradient(270deg,transparent,var(--neon-blue));animation:btn-anim3 1s linear infinite;animation-delay:.5s}@keyframes btn-anim3{0%{right:-100%}50%,100%{right:100%}}.neon-btn span:nth-child(4){bottom:-100%;left:0;width:2px;height:100%;background:linear-gradient(360deg,transparent,var(--neon-blue));animation:btn-anim4 1s linear infinite;animation-delay:.75s}@keyframes btn-anim4{0%{bottom:-100%}50%,100%{bottom:100%}}.neon-btn.disabled{opacity:.35;pointer-events:none;filter:grayscale(.8);color:#444;border-color:#333}.admin-editable{width:100%;padding:8px;border-radius:4px;background:rgba(255,255,255,.1);border:1px dashed #555;color:#fff!important;font-weight:700;transition:.2s;text-align:center}.admin-editable:focus{border-color:var(--neon-blue);background:rgba(3,233,244,.15)}#admin-toggle{position:fixed;bottom:15px;right:15px;font-size:22px;color:rgba(255,255,255,.4);cursor:pointer;z-index:9999;background:rgba(0,0,0,.6);width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid #555;touch-action:manipulation}#admin-toggle:hover{color:var(--neon-blue);transform:rotate(90deg)}#save-btn{display:none;position:fixed;bottom:15px;right:75px;background:#28a745;color:#fff;border:none;padding:10px 16px;border-radius:20px;cursor:pointer;z-index:10000;font-size:.9rem;font-weight:700;touch-action:manipulation}.admin-field{position:relative;flex:1;min-width:0}.admin-field[data-tooltip]::after{content:attr(data-tooltip);position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:#000;color:var(--neon-blue);padding:5px 8px;border-radius:4px;font-size:.7rem;white-space:nowrap;opacity:0;pointer-events:none;transition:.2s;border:1px solid var(--neon-blue);z-index:9999;box-shadow:0 4px 8px rgba(0,0,0,.5)}.admin-field[data-tooltip]:hover::after{opacity:1}.admin-option-card{border:1px solid #444;padding:12px;margin-bottom:12px;border-radius:6px;background:rgba(0,0,0,.4);text-align:left;position:relative}.admin-option-title{font-size:.85rem;color:#aaa;margin-bottom:5px;text-transform:uppercase;letter-spacing:1px}.admin-params-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.admin-param{flex:1 1 50px;display:flex;flex-direction:column;min-width:50px;position:relative}.admin-param label{font-size:.7rem;color:#888;margin-bottom:3px;text-align:center}.admin-param input{width:100%;padding:5px 2px;text-align:center;font-size:.85rem;background:rgba(255,255,255,.1);border:1px solid #555;color:#fff;border-radius:3px}.admin-param input:focus{border-color:var(--neon-blue);background:rgba(3,233,244,.1)}.admin-opt-remove{position:absolute;top:8px;right:8px;background:#ff4444;color:#fff;border:none;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;transition:.2s;z-index:2}.admin-opt-remove:hover{background:#cc0000;transform:scale(1.1)}.admin-add-option{width:100%;padding:10px;margin-top:10px;background:rgba(3,233,244,.1);border:1px dashed var(--neon-blue);color:var(--neon-blue);border-radius:6px;cursor:pointer;font-size:.9rem;font-weight:700;transition:.2s}.admin-add-option:hover{background:rgba(3,233,244,.2)}.nav-header{display:flex;justify-content:space-between;gap:10px;margin-bottom:20px;}.nav-btn{background:#444;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:0.9rem;touch-action:manipulation;}.nav-btn:hover{background:#555;}.admin-scroll-list{max-height:60vh;overflow-y:auto;margin-bottom:10px;}.move-btn{background:none;border:none;color:#03e9f4;font-size:1.2rem;cursor:pointer;padding:0 5px;}.move-btn:hover{color:#fff;}.move-btn:disabled{opacity:0.3;cursor:default;}@media (max-width:480px){.login-box{width:96%;padding:20px 15px;max-height:92vh}.hud-item{padding:6px 10px;font-size:.85rem}#hud-container{top:8px}.user-box input{font-size:16px}}`;
        
        const configJSON = JSON.stringify(config).replace(/<\/script>/gi, '<\\/script>');
        
        // Note: For a complete export, the 'engine' string must be updated with the new logic.
        // In a real development environment, this would be automated.
        // For now, the export will contain the logic up to this point.
        // We construct a minimal engine string to make sure it runs.
        const engine = '(function(){"use strict";var config='+configJSON+';var gameState={move:0,bank:150,visit:0,time:0,extra1:0,extra2:0,extra3:0,extra4:0,extra5:0,extra6:0,extra7:0,id:null,name:"",phone:""};var isAdmin=false,timerInterval=null,currentStepId=null,adminViewMode="game";document.addEventListener("DOMContentLoaded",function(){initSession();createPersistentHUD();startTimer();createAdminToggle();renderMainMenu();document.addEventListener("input",function(e){if(e.target.classList.contains("admin-editable"))saveAdminInputs();});});function initSession(){if(!sessionStorage.getItem("id")){gameState.id=Math.floor(Math.random()*9e5)+1e5;sessionStorage.setItem("id",gameState.id);["move","bank","visit","time"].forEach(function(k){sessionStorage.setItem(k,gameState[k]);});for(var i=1;i<=7;i++)sessionStorage.setItem("extra"+i,gameState["extra"+i]);}else{["move","bank","visit","time"].forEach(function(k){gameState[k]=parseInt(sessionStorage.getItem(k))||gameState[k];});for(var i=1;i<=7;i++)gameState["extra"+i]=parseInt(sessionStorage.getItem("extra"+i))||0;gameState.id=sessionStorage.getItem("id");gameState.name=sessionStorage.getItem("name")||"";gameState.phone=sessionStorage.getItem("phone")||"";}}function saveGameState(){["move","bank","visit","time"].forEach(function(k){sessionStorage.setItem(k,gameState[k]);});for(var i=1;i<=7;i++)sessionStorage.setItem("extra"+i,gameState["extra"+i]);updateHUD();}function resetGameState(){gameState.move=0;gameState.bank=config.settings.startingBank;gameState.visit=0;gameState.time=0;for(var i=1;i<=7;i++)gameState["extra"+i]=0;["move","bank","visit","time"].forEach(function(k){sessionStorage.setItem(k,gameState[k]);});for(var i=1;i<=7;i++)sessionStorage.setItem("extra"+i,0);updateHUD();}function createPersistentHUD(){var h=document.getElementById("hud-container");if(!h){h=document.createElement("div");h.id="hud-container";h.innerHTML="<div class=\\"hud-item\\" id=\\"hud-score\\">Монет: "+gameState.bank+"</div><div class=\\"hud-item\\" id=\\"hud-move\\">Месяц: "+(gameState.move+1)+"/"+config.steps.length+"</div>";document.body.prepend(h);}}function updateHUD(){var s=document.getElementById("hud-score"),m=document.getElementById("hud-move");if(s)s.textContent="Монет: "+gameState.bank;if(m)m.textContent="Месяц: "+(gameState.move+1)+"/"+config.steps.length;}function startTimer(){if(timerInterval)clearInterval(timerInterval);timerInterval=setInterval(function(){gameState.time++;sessionStorage.setItem("time",gameState.time);},1000);}function checkLoseCondition(){if(gameState.move>config.steps.length){gameState.visit="0. Превышено число ходов!";showLostScreen();return true;}if(gameState.bank<0){gameState.visit="0. Превышен бюджет!";showLostScreen();return true;}return false;}function getLoginBox(){var b=document.querySelector(".login-box");if(!b){b=document.createElement("div");b.className="login-box";document.body.appendChild(b);}return b;}function renderMainMenu(){if(checkLoseCondition())return;currentStepId=null;document.getElementById("hud-container").style.display="none";var b=getLoginBox();if(isAdmin&&adminViewMode==="list"){var html="<div class=\\"nav-header\\"><button class=\\"nav-btn\\" id=\\"btn-back-home\\">🏠 На главную</button><h2 style=\\"color:#03e9f4;margin:10px 0;\\">Вопросы ("+config.steps.length+")</h2></div><div class=\\"admin-scroll-list\\" >";config.steps.forEach(function(step,idx){var isTop=(idx===0);var isBottom=(idx===config.steps.length-1);html+="<div class=\\"admin-option-card\\" style=\\"margin-bottom:10px;padding:10px;border:1px solid #444;border-radius:6px;display:flex;justify-content:space-between;align-items:center;\\"><div><strong style=\\"color:#03e9f4;\\">#"+step.id+": "+step.question.substring(0,30)+"...</strong><br><small style=\\"color:#aaa;\\">Вариантов: "+step.options.length+"</small></div><div style=\\"display:flex;gap:5px;align-items:center;\\"><button class=\\"move-btn\\" onclick=\\"window.moveQuestion("+idx+",\'up\')\\" "+(isTop?"disabled":"")+" title=\\"Вверх\\">▲</button><button class=\\"move-btn\\" onclick=\\"window.moveQuestion("+idx+",\'down\')\\" "+(isBottom?"disabled":"")+" title=\\"Вниз\\">▼</button><button class=\\"neon-btn\\" style=\\"width:auto;padding:5px 10px;font-size:0.8rem;\\" onclick=\\"editQuestion("+step.id+")\\">✏️</button><button class=\\"neon-btn\\" style=\\"width:auto;padding:5px 10px;font-size:0.8rem;background:#ff4444;\\" onclick=\\"deleteQuestion("+step.id+")\\">🗑️</button></div></div>"});html+="</div><button class=\\"neon-btn\\" id=\\"btn-add-question\\" style=\\"margin-top:15px;border:1px dashed var(--neon-blue);background:rgba(3,233,244,0.1);\\"><span></span><span></span><span></span><span></span>➕ Добавить вопрос</button>";b.innerHTML=html;document.getElementById("btn-back-home").onclick=function(){adminViewMode="game";renderMainMenu();};document.getElementById("btn-add-question").onclick=function(){addQuestion();};}else if(isAdmin&&adminViewMode==="game"){b.innerHTML="<div class=\\"admin-field\\" data-tooltip=\\"Главный заголовок\\"><input type=\\"text\\" class=\\"admin-editable\\" data-ui=\\"mainTitle\\" value=\\""+config.ui.mainTitle+"\\" style=\\"font-size:clamp(1.5rem, 5vw, 3rem); text-align:center; margin-bottom:20px; color:#03e9f4;\\"></div><form><button type=\\"button\\" class=\\"neon-btn\\" id=\\"btn-start\\"><span></span><span></span><span></span><span></span><span class=\\"btn-text\\">"+config.ui.startBtn+"</span></button><button type=\\"button\\" class=\\"neon-btn\\" id=\\"btn-rules\\"><span></span><span></span><span></span><span></span><span class=\\"btn-text\\">"+config.ui.rulesBtn+"</span></button></form><div class=\\"admin-field\\" data-tooltip=\\"Подзаголовок\\"><input type=\\"text\\" class=\\"admin-editable\\" data-ui=\\"mainSubtitle\\" value=\\""+config.ui.mainSubtitle+"\\" style=\\"font-size:clamp(1.5rem, 5vw, 3rem); text-align:center; margin-top:20px; color:#03e9f4;\\"></div><button class=\\"nav-btn\\" id=\\"btn-manage-questions\\">📋 Управление вопросами</button>";document.getElementById("btn-start").onclick=renderRegistration;document.getElementById("btn-rules").onclick=renderRules;document.getElementById("btn-manage-questions").onclick=function(){adminViewMode="list";renderMainMenu();};}else{b.innerHTML="<h2>"+config.ui.mainTitle+"</h2><form><button type=\\"button\\" class=\\"neon-btn\\" id=\\"btn-start\\"><span></span><span></span><span></span><span></span>"+config.ui.startBtn+"</button><button type=\\"button\\" class=\\"neon-btn\\" id=\\"btn-rules\\"><span></span><span></span><span></span><span></span>"+config.ui.rulesBtn+"</button></form><h2>"+config.ui.mainSubtitle+"</h2>";document.getElementById("btn-start").onclick=renderRegistration;document.getElementById("btn-rules").onclick=renderRules;}}function renderRegistration(){var b=getLoginBox();b.innerHTML="<h2>"+config.ui.regTitle+"</h2><form><div class=\\"user-box\\"><input type=\\"text\\" id=\\"input-name\\" required value=\\""+gameState.name+"\\"><label>"+config.ui.regName+"</label></div><div class=\\"user-box\\"><input type=\\"text\\" id=\\"input-phone\\" required value=\\""+gameState.phone+"\\"><label>"+config.ui.regPhone+"</label></div><h4>"+config.ui.regNote+"</h4><button type=\\"button\\" class=\\"neon-btn\\" id=\\"btn-reg-start\\"><span></span><span></span><span></span><span></span>"+config.ui.regBtn+"</button></form>";document.getElementById("btn-reg-start").onclick=function(){gameState.name=document.getElementById("input-name").value||"Аноним";gameState.phone=document.getElementById("input-phone").value||"Не указан";sessionStorage.setItem("name",gameState.name);sessionStorage.setItem("phone",gameState.phone);document.getElementById("hud-container").style.display="flex";loadGameStep(1);};}function renderRules(){var b=getLoginBox();b.innerHTML=config.ui.rulesText.map(function(t){return"<p>"+t+"</p>";}).join("")+"<form><button type=\\"button\\" class=\\"nav-btn\\" id=\\"btn-back-rules\\">🔙 Назад</button></form>";document.getElementById("btn-back-rules").onclick=function(){adminViewMode="game";renderMainMenu();};}function loadGameStep(id){if(checkLoseCondition())return;currentStepId=id;var step=config.steps.find(function(s){return s.id===id;});if(!step){if(id>config.steps.length){showFinalScreen();return;}loadGameStep(Math.max(1,id-1));return;}var b=getLoginBox();document.getElementById("hud-container").style.display="flex";if(isAdmin){renderAdminStepEditor(step,b);}else{var q="<p id=\\"questt\\" style=\\"font-size:3vh;text-align:left;margin-bottom:30px\\">"+step.question+"</p>";var o="";step.options.forEach(function(op){var c=true,m="";if(op.conditionType>=1&&op.conditionType<=7&&gameState["extra"+op.conditionType]<op.requiredExtra){c=false;m=" (требуется: E"+op.conditionType+"≥"+op.requiredExtra+")";}o+="<button type=\\"button\\" class=\\"neon-btn "+(c?"":"disabled")+"\\" data-cost=\\""+op.cost+"\\" data-score=\\""+op.scoreGain+"\\" data-e1=\\""+(op.extra1Gain||0)+"\\" data-e2=\\""+(op.extra2Gain||0)+"\\" data-e3=\\""+(op.extra3Gain||0)+"\\" data-e4=\\""+(op.extra4Gain||0)+"\\" data-e5=\\""+(op.extra5Gain||0)+"\\" data-e6=\\""+(op.extra6Gain||0)+"\\" data-e7=\\""+(op.extra7Gain||0)+"\\" data-cond=\\""+op.conditionType+"\\" data-req=\\""+op.requiredExtra+"\\" data-next=\\""+step.nextStep+"\\" "+(c?"":"disabled")+"><span></span><span></span><span></span><span></span>"+op.text+". Стоимость: "+op.cost+m+"</button>";});b.innerHTML=q+"<form>"+o+"</form>";var btns=b.querySelectorAll(".neon-btn:not(.disabled)");for(var i=0;i<btns.length;i++){(function(btn){btn.onclick=function(){handleOptionClick(btn);};})(btns[i]);}}updateHUD();}function handleOptionClick(btn){var c=parseInt(btn.dataset.cost),sg=parseInt(btn.dataset.score);var e1=parseInt(btn.dataset.e1),e2=parseInt(btn.dataset.e2),e3=parseInt(btn.dataset.e3),e4=parseInt(btn.dataset.e4),e5=parseInt(btn.dataset.e5),e6=parseInt(btn.dataset.e6),e7=parseInt(btn.dataset.e7);var ns=btn.dataset.next,ct=parseInt(btn.dataset.cond),re=parseInt(btn.dataset.req);if(ns==="final"){showFinalScreen();return;}gameState.move+=1;var cm=true;if(ct>=1&&ct<=7&&gameState["extra"+ct]<re)cm=false;if(cm){gameState.bank-=c;gameState.visit+=sg;gameState.extra1+=e1;gameState.extra2+=e2;gameState.extra3+=e3;gameState.extra4+=e4;gameState.extra5+=e5;gameState.extra6+=e6;gameState.extra7+=e7;}saveGameState();if(checkLoseCondition())return;loadGameStep(parseInt(ns));}function showFinalScreen(){clearInterval(timerInterval);document.getElementById("hud-container").style.display="none";var b=getLoginBox();var sr=gameState.visit*config.settings.scoreMultiplier;if(typeof Email!=="undefined"){try{Email.send("miostvvguproject@mail.ru","miostvvguproject@mail.ru","Результат:"+sr+"; Имя:"+gameState.name+"; Телефон:"+gameState.phone+"; Время:"+gameState.time+"; Айди:"+gameState.id,"this is the body","smtp.mail.ru","miostvvguproject@mail.ru","HKWxL9y5TnFMhFGrZFWd");}catch(e){}}b.innerHTML="<h2 style=\\"color:#03e9f4;\\">"+config.ui.finalTitle+"</h2><button type=\\"button\\" class=\\"neon-btn result-btn\\" disabled style=\\"background:teal;color:#fff;border:none;margin-top:10px;\\"><span></span><span></span><span></span><span></span>Имя: "+gameState.name+"</button><button type=\\"button\\" class=\\"neon-btn result-btn\\" disabled style=\\"background:burlywood;color:#000;border:none;margin-top:10px;\\"><span></span><span></span><span></span><span></span>ID: "+gameState.id+"</button><button type=\\"button\\" class=\\"neon-btn result-btn\\" disabled style=\\"background:mediumslateblue;color:#fff;border:none;margin-top:10px;\\"><span></span><span></span><span></span><span></span>Туристов: "+sr+"</button><button type=\\"button\\" class=\\"neon-btn result-btn\\" disabled style=\\"background:green;color:#fff;border:none;margin-top:10px;\\"><span></span><span></span><span></span><span></span>Время: "+gameState.time+"с</button><button type=\\"button\\" class=\\"neon-btn\\" id=\\"btn-main-final\\" style=\\"margin-top:30px;\\"><span></span><span></span><span></span><span></span>"+config.ui.finalBtnMain+"</button>";document.getElementById("btn-main-final").onclick=function(){resetGameState();renderMainMenu();};}function showLostScreen(){clearInterval(timerInterval);document.getElementById("hud-container").style.display="none";var b=getLoginBox();b.innerHTML="<h2 style=\\"color:#ff4444;\\">"+config.ui.lostTitle+"</h2><p style=\\"font-size:3vh;text-align:center;color:#fff;margin:20px 0;\\">"+gameState.visit+"</p><p style=\\"font-size:2vh;color:#aaa;\\">Монет: "+gameState.bank+" | Ходов: "+(gameState.move+1)+"/"+config.steps.length+"</p><form><button type=\\"button\\" class=\\"neon-btn\\" id=\\"btn-restart-lost\\"><span></span><span></span><span></span><span></span>"+config.ui.lostRestartBtn+"</button></form>";document.getElementById("btn-restart-lost").onclick=function(){resetGameState();renderMainMenu();};}function createAdminToggle(){var t=document.createElement("div");t.id="admin-toggle";t.innerHTML="⚙️";t.onclick=function(){var p=prompt("Введите пароль администратора:");if(p===config.settings.adminPassword){isAdmin=!isAdmin;t.style.color=isAdmin?"#03e9f4":"rgba(255,255,255,0.3)";t.style.borderColor=isAdmin?"#03e9f4":"#444";t.style.boxShadow=isAdmin?"0 0 10px #03e9f4":"none";renderSaveButton();if(currentStepId)loadGameStep(currentStepId);else renderMainMenu();}else if(p!==null)alert("Неверный пароль");};document.body.appendChild(t);}function renderSaveButton(){["save-btn","export-btn","reset-btn"].forEach(function(id){var el=document.getElementById(id);if(el)el.remove();});if(isAdmin){var saveBtn=document.createElement("button");saveBtn.id="save-btn";saveBtn.textContent="💾 Сохранить всё";saveBtn.style.cssText="display:block;position:fixed;bottom:15px;right:80px;background:#28a745;color:#fff;border:none;padding:10px 16px;border-radius:20px;cursor:pointer;z-index:10000;font-size:.9rem;font-weight:700;touch-action:manipulation;box-shadow:0 0 10px rgba(40,167,69,0.5);";saveBtn.onclick=function(){saveAdminInputs();saveConfig(config);alert("✅ Все изменения сохранены!");};document.body.appendChild(saveBtn);var exportBtn=document.createElement("button");exportBtn.id="export-btn";exportBtn.textContent="📦 Скачать автономную версию";exportBtn.style.cssText="display:block;position:fixed;bottom:15px;left:185px;background:#03e9f4;color:#000;border:none;padding:10px 16px;border-radius:20px;cursor:pointer;z-index:10000;font-size:.9rem;font-weight:700;touch-action:manipulation;box-shadow:0 0 10px rgba(3,233,244,0.5);";exportBtn.onclick=function(){exportStandaloneGame();};document.body.appendChild(exportBtn);var resetBtn=document.createElement("button");resetBtn.id="reset-btn";resetBtn.textContent="🗑️ Сбросить всё";resetBtn.style.cssText="display:block;position:fixed;bottom:15px;left:15px;background:#ff4444;color:#fff;border:none;padding:10px 16px;border-radius:20px;cursor:pointer;z-index:10000;font-size:.9rem;font-weight:700;touch-action:manipulation;box-shadow:0 0 10px rgba(255,68,68,0.5);";resetBtn.onclick=function(){if(confirm("Вы уверены?")){localStorage.removeItem("miost_config");sessionStorage.clear();location.reload();}};document.body.appendChild(resetBtn);}}function renderAdminStepEditor(step,box){var h="<div class=\\"nav-header\\"><button class=\\"nav-btn\\" id=\\"btn-back-list\\">📋 К списку</button><button class=\\"nav-btn\\" id=\\"btn-back-home-edit\\">🏠 На главную</button></div><div class=\\"admin-field\\" data-tooltip=\\"Вопрос текущего шага\\"><input type=\\"text\\" class=\\"admin-editable\\" data-type=\\"step-question\\" data-step=\\""+step.id+"\\" value=\\""+step.question+"\\" style=\\"text-align:center;margin-bottom:20px;font-size:3vh;color:#03e9f4;\\"></div>";step.options.forEach(function(opt,idx){h+="<div class=\\"admin-option-card\\" style=\\"position:relative;\\"><button class=\\"admin-opt-remove\\" data-step=\\""+step.id+"\\" data-idx=\\""+idx+"\\" title=\\"Удалить вариант\\">✕</button><div class=\\"admin-option-title\\">Вариант "+(idx+1)+"</div><div class=\\"admin-field\\" data-tooltip=\\"Текст кнопки\\"><input type=\\"text\\" class=\\"admin-editable\\" data-type=\\"opt-text\\" data-step=\\""+step.id+"\\" data-idx=\\""+idx+"\\" value=\\""+opt.text+"\\" style=\\"width:100%;margin-bottom:8px;\\"></div><div class=\\"admin-params-row\\"><div class=\\"admin-param\\" data-tooltip=\\"Стоимость\\"><label>Стоимость</label><input type=\\"number\\" class=\\"admin-editable\\" data-type=\\"opt-cost\\" data-step=\\""+step.id+"\\" data-idx=\\""+idx+"\\" value=\\""+opt.cost+"\\"></div><div class=\\"admin-param\\" data-tooltip=\\"Очки\\"><label>Очки</label><input type=\\"number\\" class=\\"admin-editable\\" data-type=\\"opt-score\\" data-step=\\""+step.id+"\\" data-idx=\\""+idx+"\\" value=\\""+opt.scoreGain+"\\"></div>";for(var n=1;n<=7;n++){h+="<div class=\\"admin-param\\" data-tooltip=\\"Прибавка к E"+n+"\\"><label>E"+n+"</label><input type=\\"number\\" class=\\"admin-editable\\" data-type=\\"opt-e"+n+"\\" data-step=\\""+step.id+"\\" data-idx=\\""+idx+"\\" value=\\""+(opt["extra"+n+"Gain"]||0)+"\\"></div>";}h+="<div class=\\"admin-param\\" data-tooltip=\\"Условие: 0=нет, 1-7=нужен E[1-7]\\"><label>Условие</label><input type=\\"number\\" class=\\"admin-editable\\" data-type=\\"opt-cond\\" data-step=\\""+step.id+"\\" data-idx=\\""+idx+"\\" value=\\""+opt.conditionType+"\\" min=\\"0\\" max=\\"7\\"></div></div></div>";});h+="<button class=\\"admin-add-option\\" data-step=\\""+step.id+"\\">➕ Добавить вариант ответа</button>";box.innerHTML=h;document.getElementById("btn-back-list").onclick=function(){saveAdminInputs();adminViewMode="list";renderMainMenu();};document.getElementById("btn-back-home-edit").onclick=function(){saveAdminInputs();adminViewMode="game";renderMainMenu();};box.querySelectorAll(".admin-opt-remove").forEach(function(btn){btn.onclick=function(e){e.preventDefault();e.stopPropagation();removeOption(parseInt(btn.dataset.step),parseInt(btn.dataset.idx));};});var addBtn=box.querySelector(".admin-add-option");if(addBtn)addBtn.onclick=function(e){e.preventDefault();addOption(parseInt(addBtn.dataset.step));};}function addOption(stepId){var step=config.steps.find(function(s){return s.id===stepId;});if(!step)return;step.options.push({id:step.options.length+1,text:"Новый вариант",cost:0,scoreGain:0,extra1Gain:0,extra2Gain:0,extra3Gain:0,extra4Gain:0,extra5Gain:0,extra6Gain:0,extra7Gain:0,conditionType:0,requiredExtra:0});saveConfig(config);renderAdminStepEditor(step,document.querySelector(".login-box"));}function removeOption(stepId,idx){var step=config.steps.find(function(s){return s.id===stepId;});if(!step||step.options.length<=1){alert("Оставьте хотя бы один вариант!");return;}var removedText=step.options[idx].text;if(confirm("Удалить вариант \\""+removedText+"\\"?")){step.options.splice(idx,1);step.options.forEach(function(opt,i){opt.id=i+1;});saveConfig(config);renderAdminStepEditor(step,document.querySelector(".login-box"));;}}function saveAdminInputs(){var inputs=document.querySelectorAll(".admin-editable");for(var i=0;i<inputs.length;i++){var el=inputs[i];if(el.dataset.ui){var k=el.dataset.ui;if(el.tagName==="TEXTAREA")config.ui[k]=el.value.split("\\n").filter(function(l){return l.trim()!=="";});else config.ui[k]=el.value;}else if(el.dataset.type){var t=el.dataset.type,sid=parseInt(el.dataset.step);var st=config.steps.find(function(s){return s.id===sid;});if(!st)return;if(t==="step-question")st.question=el.value;else if(t.indexOf("opt-")===0){var idx=parseInt(el.dataset.idx);if(!st.options[idx])return;var op=st.options[idx];if(t==="opt-text")op.text=el.value;else if(t==="opt-cost")op.cost=parseInt(el.value)||0;else if(t==="opt-score")op.scoreGain=parseInt(el.value)||0;else if(t==="opt-cond")op.conditionType=parseInt(el.value)||0;else{var m=t.match(/^opt-e(\\d+)$/);if(m)op["extra"+m[1]+"Gain"]=parseInt(el.value)||0;}}}}}window.editQuestion=function(stepId){currentStepId=stepId;adminViewMode="edit";loadGameStep(stepId);};window.deleteQuestion=function(stepId){if(config.steps.length<=1){alert("Нельзя удалить последний вопрос!");return;}if(confirm("Удалить этот вопрос? Игра будет автоматически перестроена.")){config.steps=config.steps.filter(function(s){return s.id!==stepId;});relinkQuestions();renderMainMenu();}};window.addQuestion=function(){var newId=config.steps.length>0?Math.max.apply(Math,config.steps.map(function(s){return s.id;}))+1:1;config.steps.push({id:newId,question:"Новый вопрос",options:[{id:1,text:"Вариант 1",cost:0,scoreGain:0,extra1Gain:0,extra2Gain:0,extra3Gain:0,extra4Gain:0,extra5Gain:0,extra6Gain:0,extra7Gain:0,conditionType:0,requiredExtra:0},{id:2,text:"Вариант 2",cost:0,scoreGain:0,extra1Gain:0,extra2Gain:0,extra3Gain:0,extra4Gain:0,extra5Gain:0,extra6Gain:0,extra7Gain:0,conditionType:0,requiredExtra:0},{id:3,text:"Вариант 3",cost:0,scoreGain:0,extra1Gain:0,extra2Gain:0,extra3Gain:0,extra4Gain:0,extra5Gain:0,extra6Gain:0,extra7Gain:0,conditionType:0,requiredExtra:0},{id:4,text:"Вариант 4",cost:0,scoreGain:0,extra1Gain:0,extra2Gain:0,extra3Gain:0,extra4Gain:0,extra5Gain:0,extra6Gain:0,extra7Gain:0,conditionType:0,requiredExtra:0}],nextStep:"final"});relinkQuestions();editQuestion(newId);};function relinkQuestions(){for(var i=0;i<config.steps.length;i++){config.steps[i].id=i+1;config.steps[i].nextStep=(i===config.steps.length-1)?"final":(i+2);}saveConfig(config);}window.moveQuestion=function(index,direction){if(direction==="up"&&index>0){var temp=config.steps[index];config.steps[index]=config.steps[index-1];config.steps[index-1]=temp;relinkQuestions();renderAdminQuestionList(getLoginBox());}else if(direction==="down"&&index<config.steps.length-1){var temp=config.steps[index];config.steps[index]=config.steps[index+1];config.steps[index+1]=temp;relinkQuestions();renderAdminQuestionList(getLoginBox());}};})();';

        const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>МИОСТ ВВГУ - Compiled</title><style>${css}</style></head><body><div class="login-box"></div><script>${engine}<\/script></body></html>`;
        const blob = new Blob([html], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'miost_compiled_standalone.html';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        alert('✅ Файл скачан!\n\nВсе правки, порядок вопросов и настройки включены. Для полной совместимости используйте локальный сервер (python -m http.server 8000 или VS Code Live Server).');
    }
})();