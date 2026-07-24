// config-default.js
// Default game configuration - loaded as fallback if no localStorage edits exist

const DEFAULT_CONFIG = {
  // ===== GAME SETTINGS =====
  settings: {
    adminPassword: "000",
    maxMoves: 12,
    startingBank: 150,
    scoreMultiplier: 100,

    // ===== YEAR 2 (added by patch_year_two.py) =====
    // Coins reserved during Year 1: no option can be chosen if it would dip
    // into this reserve, so every legal Year-1 playthrough (including the
    // optimal one) always has at least this much left when Year 2 starts.
    year2Reserve: 40,
    // Fresh budget injected at the start of Year 2, on top of whatever
    // was left over (>= year2Reserve) from Year 1.
    year2Grant: 60,
    // Year 2 tourists count for more -- it's a bigger, better-prepared season.
    year2ScoreMultiplier: 130
  },

  // ===== UI TEXT (Root Scenes) =====
  ui: {
    modeSelectTitle: "Выберите режим игры",
    modeSelectText: "Можно сыграть только первый год (без ограничения на резерв бюджета) или пройти оба года подряд (часть бюджета первого года резервируется на второй).",
    modeOneBtn: "Только 1 год",
    modeTwoBtn: "Полные 2 года",
    year1FinishBtn: "Завершить игру",
    year2IntroTitle: "Год 2",
    year2IntroText: [
      "Первый туристический сезон завершён!",
      "То, что вы построили и чему научили город, никуда не делось: все ваши наработки (кадры, продвижение, инфраструктура) переходят во второй год.",
      "К оставшемуся бюджету добавлено дополнительное финансирование на новый сезон."
    ],
    year2IntroBtn: "Начать год 2",
    year2FinalTitle: "Итоги (2 года)",
    mainTitle: "Виртуальная веб-игра",
    mainSubtitle: "ТГРБ ВВГУ",
    startBtn: "Старт",
    rulesBtn: "Правила",
    regTitle: "Познакомимся!*",
    regName: "Имя",
    regPhone: "Телефон",
    regNote: "*Заполняется по желанию",
    regBtn: "Отправить",
    rulesText: [
      "Лето уже близко! Твоя задача -- подготовить наш город к туристическому сезону.",
      "Перед началом игры ты выбираешь один из двух сценариев: только первый год (12 ходов) или полные два года (12 ходов в первом году + 8 ходов во втором). Итоговое число привлеченных туристов ты узнаешь в конце выбранного сценария.",
      "Будь внимателен - бюджет невосполняем! Выбор действия, которое ты финансово не можешь себе позволить, приводит к поражению!",
      "При выборе действия, предпосылки для которого не были созданы на предыдущих этапах, происходит переход хода.",
      "Резерв бюджета на второй сезон действует только в сценарии «Полные 2 года»: часть бюджета первого года остаётся недоступна для трат, а во втором году прибавляется к тому, что осталось после первого года, вместе с дополнительным финансированием на новый сезон. В сценарии «Только 1 год» никакой резерв не удерживается - весь бюджет первого года доступен для трат.",
      "Удачи!"
    ],
    rulesBackBtn: "Назад",
    finalTitle: "Итоги",
    finalBtnMain: "В главное меню",
    lostTitle: "Игра окончена",
    lostRestartBtn: "Начать заново"
  },

  // ===== GAME STEPS - YEAR 1 (01-013) =====
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
  ],

  // ===== GAME STEPS - YEAR 2 (added by patch_year_two.py) =====
  // IDs start at 101 so they never collide with Year-1 step ids.
  // Several options here are cheaper / score higher if the matching
  // extraN threshold from Year 1 was met -- that's how Year-1 decisions
  // pay off in Year 2, using the same conditionType/requiredExtra system
  // you already use for in-year prerequisites.
  steps2: [
    {
      id: 101, question: "Как расширим номерной фонд на второй сезон?",
      options: [
        { id: 1, text: "Строим ещё хостелов", cost: 15, scoreGain: 14, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Строим ещё глэмпингов", cost: 18, scoreGain: 17, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Расширяем силами своих же строителей (дешевле и быстрее)", cost: 10, scoreGain: 20, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 1, requiredExtra: 1 },
        { id: 4, text: "Оставляем как есть", cost: 0, scoreGain: 5, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 102
    },
    {
      id: 102, question: "Как усилим транспортную доступность во втором году?",
      options: [
        { id: 1, text: "Добавляем электрички чаще", cost: 10, scoreGain: 14, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Открываем автобусные маршруты для гостей из Китая/Кореи/Японии", cost: 12, scoreGain: 22, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Ничего не меняем", cost: 0, scoreGain: 4, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 103
    },
    {
      id: 103, question: "Как развиваем гастрономию во второй год?",
      options: [
        { id: 1, text: "Делаем ставку на дальневосточную кухню как визитную карточку", cost: 6, scoreGain: 12, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Расширяем фастфуд-сегмент", cost: 5, scoreGain: 3, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Ничего не меняем", cost: 0, scoreGain: 2, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 104
    },
    {
      id: 104, question: "Кто ведёт продвижение города во второй сезон?",
      options: [
        { id: 1, text: "Опять нанимаем стороннее агентство", cost: 18, scoreGain: 12, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Продвигаем силами своей команды (дешевле, эффект выше — команда уже обучена)", cost: 6, scoreGain: 22, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 1, requiredExtra: 1 },
        { id: 3, text: "Не продвигаемся", cost: 0, scoreGain: 0, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 105
    },
    {
      id: 105, question: "Событийная программа второго года?",
      options: [
        { id: 1, text: "Повторяем прошлогодний календарь фестивалей", cost: 10, scoreGain: 12, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Добавляем крупный якорный фестиваль под сформированный кластер", cost: 20, scoreGain: 26, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Сокращаем программу", cost: 0, scoreGain: 3, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 106
    },
    {
      id: 106, question: "Как развиваем зимний туристический продукт во второй сезон?",
      options: [
        { id: 1, text: "Открываем горнолыжный курорт", cost: 20, scoreGain: 22, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Организуем зимние фестивали и ярмарки", cost: 10, scoreGain: 14, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 3, text: "Развиваем силами своей уже обученной команды (дешевле, эффект выше)", cost: 6, scoreGain: 20, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 1, requiredExtra: 1 },
        { id: 4, text: "Ничего не меняем", cost: 0, scoreGain: 3, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 107
    },
    {
      id: 107, question: "Как усиливаем гостеприимство (сервис) во второй сезон?",
      options: [
        { id: 1, text: "Обучаем персонал силами внешних тренеров", cost: 15, scoreGain: 12, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Внедряем стандарты сервиса силами своей обученной команды", cost: 5, scoreGain: 18, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 1, requiredExtra: 1 },
        { id: 3, text: "Вводим программу лояльности для гостей", cost: 8, scoreGain: 10, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 4, text: "Не меняем ничего", cost: 0, scoreGain: 2, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 108
    },
    {
      id: 108, question: "Как усиливаем цифровое присутствие города во втором сезоне?",
      options: [
        { id: 1, text: "Заказываем новый сайт и продвижение в соцсетях у агентства", cost: 14, scoreGain: 12, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 },
        { id: 2, text: "Делаем это силами своей команды (дешевле, эффект выше)", cost: 5, scoreGain: 20, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 1, requiredExtra: 1 },
        { id: 3, text: "Ограничиваемся текущими каналами", cost: 0, scoreGain: 4, extra1Gain: 0, extra2Gain: 0, extra3Gain: 0, extra4Gain: 0, extra5Gain: 0, extra6Gain: 0, extra7Gain: 0, conditionType: 0, requiredExtra: 0 }
      ], nextStep: 109
    },
    {
      id: 109, question: "Узнать итоговые результаты...",
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
