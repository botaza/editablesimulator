// config-default.js
// Default game configuration - loaded as fallback if no localStorage edits exist

const DEFAULT_CONFIG = {
  // ===== GAME SETTINGS =====
  settings: {
    adminPassword: "000",
    maxMoves: 12,
    startingBank: 150,
    scoreMultiplier: 100
  },

  // ===== UI TEXT (Root Scenes) =====
  ui: {
    mainTitle: "Виртуальная веб-игра",
    mainSubtitle: "МИОСТ ВВГУ",
    startBtn: "Старт",
    rulesBtn: "Правила",
    regTitle: "Познакомимся!*",
    regName: "Имя",
    regPhone: "Телефон",
    regNote: "*Заполняется по желанию",
    regBtn: "Отправить",
    rulesText: [
      "Лето уже близко! Твоя задача -- подготовить наш город к туристическому сезону.",
      "Игра дает тебе 12 ходов. Итоговое число привлеченных туристов ты узнаешь в конце игры.",
      "Будь внимателен - бюджет невосполняем! Выбор действия, которое ты финансово не можешь себе позволить, приводит к поражению!",
      "При выборе действия, предпосылки для которого не были созданы на предыдущих этапах, происходит переход хода.",
      "Удачи!"
    ],
    rulesBackBtn: "Назад",
    finalTitle: "Итоги",
    finalBtnMain: "В главное меню",
    lostTitle: "Игра окончена",
    lostRestartBtn: "Начать заново"
  },

  // ===== GAME STEPS (01-013) =====
  steps: [
    {
      id: 1, question: "На какого потребителя-туриста будем ориентироваться?",
      options: [
        { id: 1, text: "Бывалые прагматики", cost: 30, scoreGain: 15, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Непритязательные", cost: 10, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Семейные", cost: 20, scoreGain: 20, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "Увлеченные экстремалы", cost: 30, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 2
    },
    {
      id: 2, question: "На какую среднюю длительность посещения планируем?",
      options: [
        { id: 1, text: "1-2 дня", cost: 5, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "3-7 дней", cost: 15, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "8-9 дней", cost: 20, scoreGain: 20, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "10+ дней", cost: 25, scoreGain: 23, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 3
    },
    {
      id: 3, question: "Строительство каких средств размещения будем поддерживать?",
      options: [
        { id: 1, text: "Хостелов", cost: 10, scoreGain: 13, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "3*", cost: 12, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Глэмпингов", cost: 15, scoreGain: 15, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "5*", cost: 20, scoreGain: 19, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 4
    },
    {
      id: 4, question: "Что сделаем, чтобы туристам было удобнее добираться во Владивосток?",
      options: [
        { id: 1, text: "Новый терминал аэропорта", cost: 25, scoreGain: 8, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Углубленное дно морвокзала", cost: 10, scoreGain: 7, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Реконструкция автомобильных пунктов пропуска", cost: 22, scoreGain: 20, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "Пляж возле гостиницы", cost: 3, scoreGain: 11, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 5
    },
    {
      id: 5, question: "Какую кухню для туристов будем поддерживать?",
      options: [
        { id: 1, text: "Паназиатскую", cost: 5, scoreGain: 3, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Русскую", cost: 5, scoreGain: 3, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Фастфуд", cost: 5, scoreGain: 2, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "Дальневосточную", cost: 5, scoreGain: 7, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 6
    },
    {
      id: 6, question: "За счет чего будем развивать общественный транспорт?",
      options: [
        { id: 1, text: "Электромопеды", cost: 5, scoreGain: 5, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Троллейбусы", cost: 3, scoreGain: 2, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Электрички", cost: 7, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "Метро", cost: 15, scoreGain: 7, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 7
    },
    {
      id: 7, question: "Сколько различных фестивалей организуем за год?",
      options: [
        { id: 1, text: "1", cost: 1, scoreGain: 1, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "10", cost: 5, scoreGain: 4, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "70", cost: 25, scoreGain: 25, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "50", cost: 17, scoreGain: 17, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 8
    },
    {
      id: 8, question: "Какое из перечисленных предприятий выберем в качестве одного из ядер туристского кластера?",
      options: [
        { id: 1, text: "Tigre de Cristal", cost: 5, scoreGain: 5, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Туристско-информационный центр", cost: 5, scoreGain: 3, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "ВГУЭС Трэвел", cost: 5, scoreGain: 2, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "Можно и без логотипа", cost: 0, scoreGain: 7, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 9
    },
    {
      id: 9, question: "Как будем привлекать новые кадры?",
      options: [
        { id: 1, text: "Из других регионов", cost: 15, scoreGain: 20, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Побольше волонтеров", cost: 3, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Воспитание собственных", cost: 20, scoreGain: 20, extra1Gain: 1, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "Сами как-нибудь узнают", cost: 0, scoreGain: 7, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 10
    },
    {
      id: 10, question: "Какие информационные решения подготовим?",
      options: [
        { id: 1, text: "Виртуальную экскурсию у внешних специалистов", cost: 20, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Систему бронирования у внешних специалистов", cost: 20, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "И то и другое своими кадрами", cost: 5, scoreGain: 15, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 1, requiredExtra: 1 },
        { id: 4, text: "Дополнительных решений не нужно", cost: 0, scoreGain: 7, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 11
    },
    {
      id: 11, question: "Как будем продвигаться?",
      options: [
        { id: 1, text: "Никак", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Через стороннее агентство", cost: 15, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Собственными кадрами", cost: 4, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 1, requiredExtra: 1 }
      ], nextStep: 12
    },
    {
      id: 12, question: "На что не стоит делать акцент в продвижении",
      options: [
        { id: 1, text: "Спортивный отдых", cost: 0, scoreGain: -5, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Пляжный отдых", cost: 0, scoreGain: -10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Зимний отдых", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "Этнокультурный отдых", cost: 0, scoreGain: -5, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 13
    },
    {
      id: 13, question: "Узнать результаты...",
      options: [
        { id: 1, text: "ok", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: "final"
    }
  ]
};

// Helper: Deep clone config for safe editing
function cloneConfig(obj) { return JSON.parse(JSON.stringify(obj)); }

// Helper: Load config (localStorage first, then defaults)
function loadConfig() {
  const saved = localStorage.getItem('miost_config');
  const defaults = cloneConfig(DEFAULT_CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.ui) parsed.ui = defaults.ui;
      return parsed;
    } catch (e) { return defaults; }
  }
  return defaults;
}

// Helper: Save config to localStorage with auto-backup
function saveConfig(cfg) {
  try { localStorage.setItem('miost_config', JSON.stringify(cfg)); return true; } 
  catch (e) { console.error('Failed to save config:', e); return false; }
}