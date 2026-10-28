// UI strings LV / EN / RU here; ES / PT / JA / ZH in i18n-more.js (missing keys fall back to English). Language: ?lang= → saved choice (localStorage "fa-lang", shared with the main site) → visitor's country:
// LV → lv; RU, BY, KZ, KG → ru; anything else → en. Country comes from the time zone (no IP lookup), with the
// browser locale's region (e.g. lv-LV) as a fallback when the time zone does not tell.
import { MORE } from './i18n-more.js?v=39';
export const LANGS = [{ code: 'lv', label: 'LV', name: 'Latviešu' }, { code: 'en', label: 'EN', name: 'English' }, { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'es', label: 'ES', name: 'Español' }, { code: 'pt', label: 'PT', name: 'Português' }, { code: 'ja', label: 'JA', name: '日本語' }, { code: 'zh', label: 'ZH', name: '中文（简体）' }];
export const LOCALE = { lv: 'lv_LV', en: 'en_GB', ru: 'ru_RU', es: 'es_ES', pt: 'pt_BR', ja: 'ja_JP', zh: 'zh_CN' };
const S = {
  lv: {
    title: 'FlowAthletiq Aim Trainer', 'mobile.h': 'Spēlē uz datora ar peli',
    'seo.title': 'Aim Trainer pārlūkā — bezmaksas CS2 aim treniņš | FlowAthletiq',
    'seo.desc': 'Bezmaksas CS2 aim trainer pārlūkā: šauj vistām Kuldīgas vecpilsētā ar AK-47, M4A4 un M4A1-S spray paterniem, savu CS2 sensitivity un crosshair. Iekļūsti TOP 8!',
    'mobile.p1': 'FlowAthletiq Aim Trainer ir veidots peles aim treniņam ar CS2 sensitivity, tāpēc telefonā vai planšetē tas nedarbojas.',
    'mobile.p2': 'Atver šo lapu datorā (ieteicams Chrome vai Edge) un pievieno savu CS2 crosshair.', 'mobile.back': 'Atpakaļ uz FlowAthletiq',
    lead: 'Vistas ar ķiverēm un bruņuvestēm parādās logos, balkonu durvīs un uz jumtu malām: izbāž galvu, paskatās pa labi un pa kreisi, pietupstas un lec lejā uz A site. Nošauj katru, pirms tā piezemējas. Pirmo šauj to, kura jau gatavojas lēkt! Viena piezemējusies vista, un spēle beigusies.',
    start: 'Aim Trainer', spray: 'Spray treniņš', crosshair: 'Crosshair', settings: 'Iestatījumi',
    'tip.fire': '<b>Kreisā poga:</b> šaut (turi, lai šautu sērijā)', 'tip.keys': '<b>1 / 2 / 3:</b> ierocis &nbsp; <b>ESC:</b> pauze',
    'tip.dmg': 'Bojājumi, recoil un šaušanas ātrums pēc CS2 vērtībām. AK-47 headshot caur ķiveri nogalina ar vienu šāvienu, M4 ne.',
    pbTitle: 'Tavs rekords', ranksTitle: 'Rangi', pbNone: 'Vēl nav rezultāta. Uzspēlē pirmo raundu!',
    lbTitle: 'Top spēlētāji', lbAll: 'Visu laiku', lbWeek: 'Šonedēļ', lbEmpty: 'Vēl nav neviena rezultāta. Esi pirmais!', lbOffline: 'Rezultātu tabula pašlaik nav pieejama.', lbLoading: 'Ielādē…', lbLvl: 'Līm.', lbPts: 'Punkti',
    privacy: 'Mēs neievācam personas datus. Tabulā redzams tikai tavs niks, izvēlētā valsts un rezultāts.',
    subTitle: 'Ieraksti savu rezultātu tabulā', subNick: 'Segvārds', subCountry: 'Valsts', subBtn: 'Iesniegt', subSending: 'Sūta…', subOk: 'Iesniegts ({w})! Tava vieta: #{n}', lbWpn: 'Ierocis',
    'subErr.nick': 'Segvārdam jābūt 2–16 simboliem (burti, cipari, atstarpe, _ . -), bez saitēm un rupjībām.', 'subErr.rate': 'Pārāk bieži. Pamēģini pēc brīža.',
    'subErr.implausible': 'Šis rezultāts neizskatās pēc īstas spēles.', 'subErr.country': 'Izvēlies valsti.', 'subErr.net': 'Neizdevās nosūtīt. Pārbaudi interneta savienojumu.', 'subErr.bad': 'Neizdevās nosūtīt.',
    boardEmpty: 'Vēl tukšs. Ieraksti savu vārdu!',
    pbText: 'Augstākais līmenis: <b>{level}</b><br>Labākais rezultāts: <b>{score}</b> punkti<br>Rangs: <b>{rank}</b>',
    fromLevel: 'no {n}. līmeņa', topReq: 'Līmenis {n}+ un ≥{hs}% headshot', hsNeed: 'Vajag ≥{hs}% headshot (tev {cur}%), lai kļūtu par „{rank}”.',
    'set.sens': 'CS2 sensitivity', 'set.dpi': 'Peles DPI', 'set.note': 'Pagrieziens = peles kustība × sens × 0.022° (tāpat kā CS2). FOV 106.26° horizontāli 16:9 ekrānā (CS2 noklusējums). Ievadi to pašu sens, ko lieto spēlē, un sajūta sakritīs.',
    'set.sound': 'Skaņa', 'set.fps': 'Rādīt FPS', 'set.raw': 'Raw input (bez Windows paātrinājuma)', 'set.lang': 'Valoda',
    rawYes: 'Jā', rawNo: 'Nē (pārlūks neatbalsta)', rawLater: 'Pārbaudīs, sākot spēli', done: 'Gatavs',
    'ed.title': 'Crosshair redaktors', 'ed.prev': 'Priekšskatījums (izmērs atbilst tavam ekrānam)', 'ed.style': 'Stils', 'ed.size': 'Izmērs',
    'ed.thick': 'Biezums', 'ed.gap': 'Atstarpe', 'ed.outline': 'Kontūra', 'ed.outlineT': 'Kontūras biezums', 'ed.color': 'Krāsa', 'ed.alpha': 'Caurspīdīgums',
    'ed.dot': 'Centra punkts', 'ed.t': 'T-stils', 'ed.code': 'CS2 share kods', 'ed.import': 'Importēt', 'ed.copy': 'Kopēt kodu', 'ed.link': 'Kopēt saiti',
    'ed.help': 'CS2: Settings → Game → Crosshair → Share or Import. Kodu vari ielīmēt arī atpakaļ spēlē.', 'ed.reset': 'Atjaunot noklusējumu',
    'ed.ok': 'Crosshair importēts!', 'ed.bad': 'Nederīgs share kods. Tam jāizskatās kā CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx.', 'ed.manual': 'Nokopē manuāli (Ctrl+C).',
    'ed.copied': 'Kods nokopēts. Ielīmē to CS2: Crosshair → Share or Import.', 'ed.linkCopied': 'Saite nokopēta. Kas to atvērs, redzēs tavu crosshair.', 'ed.resetDone': 'Atjaunots noklusējums.',
    colors: ['Sarkans', 'Zaļš', 'Dzeltens', 'Zils', 'Ciāns', 'Pielāgots'],
    level: 'Līmenis', kills: 'Kills', hs: 'HS %', points: 'Punkti', reloading: 'Pārlādē…', clickLock: 'Klikšķini, lai turpinātu',
    pause: 'Pauze', resume: 'Turpināt', toMenu: 'Uz izvēlni', again: 'Spēlēt vēlreiz', accuracy: 'Precizitāte',
    levelBanner: 'Līmenis {n}', chickensN: '{n} vistas', levelDone: 'Līmenis {n} izturēts', timeBonus: 'Laika bonuss +{n}',
    idleEnd: 'Brīvais režīms beidzās: 1 minūti bez darbības', getReady: 'Gatavojies…', remaining: 'Atlikušas vistas: {n}', escaped: 'Vista aizbēga!', landed: 'Vista piezemējās!', timeUp: 'Laiks beidzās!',
    chicken: 'Vista', reached: 'Sasniegtais līmenis: {n}', nextRank: ' · nākamais rangs no {n}. līmeņa', topRank: ' · augstākais rangs!',
    newPB: 'Jauns personīgais rekords!', yourPB: 'Tavs rekords: {level}. līmenis, {score} punkti',
    wBanner: '{dmg} bojājums · {rpm} RPM · {mag} lodes', wCard: '{dmg} dmg · {rpm} RPM · {mag} lodes', wHs: 'HS ar ķiveri: {n}', oneTap: ' (one-tap)',
    wKeys: '1 AK-47 · 2 M4A4 · 3 M4A1-S · WASD',
    'sp.wall': 'SPRAY TRENIŅŠ', 'sp.hint': 'Turi šaušanu un velc peli pa ciāna līniju', 'sp.result': 'Rezultāts', 'sp.bullets': 'Lodes', 'sp.best': 'Labākais',
    'sp.keys': '1 AK-47 · 2 M4A4 · 3 M4A1-S · ESC izvēlne', 'sp.raw': '● recoil bez kontroles', 'sp.ideal': '— ideālais peles ceļš', 'sp.yours': '● tavas lodes', 'sp.grid': 'režģis 2°',
    ranks: ['Vilcēns', 'Jaunais vilks', 'Mednieks', 'Bara sargs', 'Alfa', 'Astral'],
  },
  en: {
    title: 'FlowAthletiq Aim Trainer', 'mobile.h': 'Play on a computer with a mouse',
    'seo.title': 'Browser Aim Trainer — free CS2 aim practice | FlowAthletiq',
    'seo.desc': 'Free CS2 aim trainer in your browser: shoot chickens in Kuldīga old town with AK-47, M4A4 and M4A1-S spray patterns, your CS2 sensitivity and crosshair. Make the TOP 8!',
    'mobile.p1': 'FlowAthletiq Aim Trainer is built for mouse aim training with CS2 sensitivity, so it does not work on phones or tablets.',
    'mobile.p2': 'Open this page on a computer (Chrome or Edge recommended) and bring your CS2 crosshair.', 'mobile.back': 'Back to FlowAthletiq',
    lead: 'Chickens in helmets and armor vests appear in windows, balcony doors and on roof edges: they stick their head out, look right, look left, crouch and jump down onto A site. Shoot every one before it lands. Shoot the one about to jump first! One chicken on the ground and the game is over.',
    start: 'Aim Trainer', spray: 'Spray training', crosshair: 'Crosshair', settings: 'Settings',
    'tip.fire': '<b>Left click:</b> shoot (hold to spray)', 'tip.keys': '<b>1 / 2 / 3:</b> weapon &nbsp; <b>ESC:</b> pause',
    'tip.dmg': 'Damage, recoil and fire rate use CS2 values. An AK-47 headshot through a helmet is a one-tap, an M4 is not.',
    pbTitle: 'Your best', ranksTitle: 'Ranks', pbNone: 'No result yet. Play your first round!',
    lbTitle: 'Top players', lbAll: 'All time', lbWeek: 'This week', lbEmpty: 'No scores yet. Be the first!', lbOffline: 'The leaderboard is unavailable right now.', lbLoading: 'Loading…', lbLvl: 'Lvl', lbPts: 'Points',
    privacy: 'We do not collect personal data. The board only shows your nick, the country you chose and your score.',
    subTitle: 'Put your score on the leaderboard', subNick: 'Nickname', subCountry: 'Country', subBtn: 'Submit', subSending: 'Sending…', subOk: 'Submitted ({w})! Your position: #{n}', lbWpn: 'Weapon',
    'subErr.nick': 'Nickname must be 2–16 characters (letters, digits, space, _ . -), no links or swearing.', 'subErr.rate': 'Too fast. Try again in a moment.',
    'subErr.implausible': "This result doesn't look like a real run.", 'subErr.country': 'Pick a country.', 'subErr.net': 'Could not send. Check your connection.', 'subErr.bad': 'Could not send.',
    boardEmpty: 'Empty so far. Write your name here!',
    pbText: 'Highest level: <b>{level}</b><br>Best score: <b>{score}</b> points<br>Rank: <b>{rank}</b>',
    fromLevel: 'from level {n}', topReq: 'Level {n}+ and ≥{hs}% headshots', hsNeed: 'You need ≥{hs}% headshots (you had {cur}%) to become “{rank}”.',
    'set.sens': 'CS2 sensitivity', 'set.dpi': 'Mouse DPI', 'set.note': 'Turn = mouse movement × sens × 0.022° (same as CS2). FOV 106.26° horizontal on a 16:9 screen (CS2 default). Enter the sens you use in game and the feel will match.',
    'set.sound': 'Sound', 'set.fps': 'Show FPS', 'set.raw': 'Raw input (no Windows acceleration)', 'set.lang': 'Language',
    rawYes: 'Yes', rawNo: 'No (browser does not support it)', rawLater: 'Checked when the game starts', done: 'Done',
    'ed.title': 'Crosshair editor', 'ed.prev': 'Preview (size matches your screen)', 'ed.style': 'Style', 'ed.size': 'Size',
    'ed.thick': 'Thickness', 'ed.gap': 'Gap', 'ed.outline': 'Outline', 'ed.outlineT': 'Outline thickness', 'ed.color': 'Color', 'ed.alpha': 'Alpha',
    'ed.dot': 'Center dot', 'ed.t': 'T-style', 'ed.code': 'CS2 share code', 'ed.import': 'Import', 'ed.copy': 'Copy code', 'ed.link': 'Copy link',
    'ed.help': 'CS2: Settings → Game → Crosshair → Share or Import. You can paste the code back into the game too.', 'ed.reset': 'Reset to default',
    'ed.ok': 'Crosshair imported!', 'ed.bad': 'Invalid share code. It should look like CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx.', 'ed.manual': 'Copy it manually (Ctrl+C).',
    'ed.copied': 'Code copied. Paste it in CS2: Crosshair → Share or Import.', 'ed.linkCopied': 'Link copied. Anyone who opens it will see your crosshair.', 'ed.resetDone': 'Reset to default.',
    colors: ['Red', 'Green', 'Yellow', 'Blue', 'Cyan', 'Custom'],
    level: 'Level', kills: 'Kills', hs: 'HS %', points: 'Score', reloading: 'Reloading…', clickLock: 'Click to continue',
    pause: 'Paused', resume: 'Resume', toMenu: 'Main menu', again: 'Play again', accuracy: 'Accuracy',
    levelBanner: 'Level {n}', chickensN: '{n} chickens', levelDone: 'Level {n} cleared', timeBonus: 'Time bonus +{n}',
    idleEnd: 'Free mode ended: 1 minute without input', getReady: 'Get ready…', remaining: 'Chickens left: {n}', escaped: 'A chicken escaped!', landed: 'A chicken landed!', timeUp: 'Time is up!',
    chicken: 'Chicken', reached: 'Level reached: {n}', nextRank: ' · next rank at level {n}', topRank: ' · highest rank!',
    newPB: 'New personal best!', yourPB: 'Your best: level {level}, {score} points',
    wBanner: '{dmg} damage · {rpm} RPM · {mag} rounds', wCard: '{dmg} dmg · {rpm} RPM · {mag} rounds', wHs: 'HS with helmet: {n}', oneTap: ' (one-tap)',
    wKeys: '1 AK-47 · 2 M4A4 · 3 M4A1-S · WASD',
    'sp.wall': 'SPRAY TRAINING', 'sp.hint': 'Hold fire and drag your mouse along the cyan line', 'sp.result': 'Score', 'sp.bullets': 'Bullets', 'sp.best': 'Best',
    'sp.keys': '1 AK-47 · 2 M4A4 · 3 M4A1-S · ESC menu', 'sp.raw': '● recoil without control', 'sp.ideal': '— ideal mouse path', 'sp.yours': '● your bullets', 'sp.grid': 'grid 2°',
    ranks: ['Wolf Pup', 'Young Wolf', 'Hunter', 'Pack Guard', 'Alpha', 'Astral'],
  },
  ru: {
    title: 'FlowAthletiq Aim Trainer', 'mobile.h': 'Играй на компьютере с мышью',
    'seo.title': 'Аим-тренер в браузере — бесплатная тренировка аима CS2 | FlowAthletiq',
    'seo.desc': 'Бесплатный аим-тренер CS2 в браузере: стреляй по курицам в старом городе Кулдиги со спреем AK-47, M4A4 и M4A1-S, своей чувствительностью CS2 и прицелом. Попади в TOP 8!',
    'mobile.p1': 'FlowAthletiq Aim Trainer создан для тренировки аима мышью с сенсой CS2, поэтому на телефоне или планшете он не работает.',
    'mobile.p2': 'Открой эту страницу на компьютере (лучше в Chrome или Edge) и добавь свой прицел из CS2.', 'mobile.back': 'Назад на FlowAthletiq',
    lead: 'Курицы в шлемах и бронежилетах появляются в окнах, дверях балконов и на краях крыш: высовывают голову, смотрят направо и налево, приседают и прыгают вниз на плент A. Подстрели каждую, пока она не приземлилась. Сначала стреляй в ту, что уже готова прыгнуть! Одна приземлившаяся курица — и игра окончена.',
    start: 'Aim Trainer', spray: 'Тренировка спрея', crosshair: 'Прицел', settings: 'Настройки',
    'tip.fire': '<b>Левая кнопка:</b> стрелять (зажми для очереди)', 'tip.keys': '<b>1 / 2 / 3:</b> оружие &nbsp; <b>ESC:</b> пауза',
    'tip.dmg': 'Урон, отдача и скорострельность взяты из CS2. Хедшот из AK-47 через шлем убивает с одного выстрела, из M4 — нет.',
    pbTitle: 'Твой рекорд', ranksTitle: 'Ранги', pbNone: 'Результата пока нет. Сыграй первый раунд!',
    lbTitle: 'Лучшие игроки', lbAll: 'За всё время', lbWeek: 'За неделю', lbEmpty: 'Пока нет результатов. Будь первым!', lbOffline: 'Таблица сейчас недоступна.', lbLoading: 'Загрузка…', lbLvl: 'Ур.', lbPts: 'Очки',
    privacy: 'Мы не собираем персональные данные. В таблице видны только твой ник, выбранная страна и результат.',
    subTitle: 'Добавь свой результат в таблицу', subNick: 'Ник', subCountry: 'Страна', subBtn: 'Отправить', subSending: 'Отправка…', subOk: 'Отправлено ({w})! Твоё место: #{n}', lbWpn: 'Оружие',
    'subErr.nick': 'Ник: 2–16 символов (буквы, цифры, пробел, _ . -), без ссылок и мата.', 'subErr.rate': 'Слишком часто. Попробуй чуть позже.',
    'subErr.implausible': 'Этот результат не похож на настоящую игру.', 'subErr.country': 'Выбери страну.', 'subErr.net': 'Не удалось отправить. Проверь интернет.', 'subErr.bad': 'Не удалось отправить.',
    boardEmpty: 'Пока пусто. Впиши своё имя!',
    pbText: 'Лучший уровень: <b>{level}</b><br>Лучший счёт: <b>{score}</b> очков<br>Ранг: <b>{rank}</b>',
    fromLevel: 'с {n} уровня', topReq: 'Уровень {n}+ и ≥{hs}% хедшотов', hsNeed: 'Нужно ≥{hs}% хедшотов (у тебя {cur}%), чтобы стать «{rank}».',
    'set.sens': 'Сенса CS2', 'set.dpi': 'DPI мыши', 'set.note': 'Поворот = движение мыши × сенса × 0.022° (как в CS2). FOV 106.26° по горизонтали на экране 16:9 (по умолчанию в CS2). Введи свою игровую сенсу, и ощущения совпадут.',
    'set.sound': 'Звук', 'set.fps': 'Показывать FPS', 'set.raw': 'Raw input (без ускорения Windows)', 'set.lang': 'Язык',
    rawYes: 'Да', rawNo: 'Нет (браузер не поддерживает)', rawLater: 'Проверим при запуске игры', done: 'Готово',
    'ed.title': 'Редактор прицела', 'ed.prev': 'Предпросмотр (размер как на твоём экране)', 'ed.style': 'Стиль', 'ed.size': 'Размер',
    'ed.thick': 'Толщина', 'ed.gap': 'Зазор', 'ed.outline': 'Обводка', 'ed.outlineT': 'Толщина обводки', 'ed.color': 'Цвет', 'ed.alpha': 'Прозрачность',
    'ed.dot': 'Точка в центре', 'ed.t': 'T-стиль', 'ed.code': 'Код прицела CS2', 'ed.import': 'Импорт', 'ed.copy': 'Копировать код', 'ed.link': 'Копировать ссылку',
    'ed.help': 'CS2: Settings → Game → Crosshair → Share or Import. Код можно вставить и обратно в игру.', 'ed.reset': 'Сбросить по умолчанию',
    'ed.ok': 'Прицел импортирован!', 'ed.bad': 'Неверный код. Он должен выглядеть как CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx.', 'ed.manual': 'Скопируй вручную (Ctrl+C).',
    'ed.copied': 'Код скопирован. Вставь его в CS2: Crosshair → Share or Import.', 'ed.linkCopied': 'Ссылка скопирована. Кто её откроет, увидит твой прицел.', 'ed.resetDone': 'Сброшено по умолчанию.',
    colors: ['Красный', 'Зелёный', 'Жёлтый', 'Синий', 'Голубой', 'Свой'],
    level: 'Уровень', kills: 'Убийства', hs: 'HS %', points: 'Очки', reloading: 'Перезарядка…', clickLock: 'Кликни, чтобы продолжить',
    pause: 'Пауза', resume: 'Продолжить', toMenu: 'В меню', again: 'Играть снова', accuracy: 'Точность',
    levelBanner: 'Уровень {n}', chickensN: 'Куриц: {n}', levelDone: 'Уровень {n} пройден', timeBonus: 'Бонус за время +{n}',
    idleEnd: 'Свободный режим завершён: 1 минута без действий', getReady: 'Приготовься…', remaining: 'Осталось куриц: {n}', escaped: 'Курица сбежала!', landed: 'Курица приземлилась!', timeUp: 'Время вышло!',
    chicken: 'Курица', reached: 'Достигнутый уровень: {n}', nextRank: ' · следующий ранг с {n} уровня', topRank: ' · высший ранг!',
    newPB: 'Новый личный рекорд!', yourPB: 'Твой рекорд: уровень {level}, {score} очков',
    wBanner: 'Урон {dmg} · {rpm} RPM · {mag} патронов', wCard: '{dmg} урон · {rpm} RPM · {mag} патр.', wHs: 'HS в шлем: {n}', oneTap: ' (ваншот)',
    wKeys: '1 AK-47 · 2 M4A4 · 3 M4A1-S · WASD',
    'sp.wall': 'ТРЕНИРОВКА СПРЕЯ', 'sp.hint': 'Зажми огонь и веди мышь по голубой линии', 'sp.result': 'Результат', 'sp.bullets': 'Пули', 'sp.best': 'Лучший',
    'sp.keys': '1 AK-47 · 2 M4A4 · 3 M4A1-S · ESC меню', 'sp.raw': '● отдача без контроля', 'sp.ideal': '— идеальный путь мыши', 'sp.yours': '● твои пули', 'sp.grid': 'сетка 2°',
    ranks: ['Волчонок', 'Молодой волк', 'Охотник', 'Страж стаи', 'Альфа', 'Астрал'],
  },
};
Object.assign(S, MORE);
// touch mode (phones / tablets)
const TOUCH = {
  lv: { rotate: 'Pagriez telefonu horizontāli, lai spēlētu', 'set.tsens': 'Touch jutība', 'set.gyro': 'Žiroskopa tēmēšana', gyroDenied: 'Žiroskopa atļauja netika dota.', gyroNone: 'Šī ierīce nesniedz žiroskopa datus.', lbMobile: 'Mobilais',
    'tip.touch': '<b>Velc pa ekrānu:</b> tēmē &nbsp; <b>Turi ◎:</b> šauj (full-auto, telefonā bez atsitiena) &nbsp; <b>1/2/3:</b> ierocis &nbsp; <b>❚❚:</b> pauze' },
  en: { rotate: 'Turn your phone sideways (landscape) to play', 'set.tsens': 'Touch sensitivity', 'set.gyro': 'Gyro aim', gyroDenied: 'Motion permission was not granted.', gyroNone: 'This device does not provide gyro data.', lbMobile: 'Mobile',
    'tip.touch': '<b>Drag the screen:</b> aim &nbsp; <b>Hold ◎:</b> fire (full-auto, no recoil on phone) &nbsp; <b>1/2/3:</b> weapon &nbsp; <b>❚❚:</b> pause' },
  ru: { rotate: 'Поверни телефон горизонтально, чтобы играть', 'set.tsens': 'Чувствительность касания', 'set.gyro': 'Прицел гироскопом', gyroDenied: 'Доступ к датчикам движения не выдан.', gyroNone: 'Это устройство не даёт данных гироскопа.', lbMobile: 'Мобильные',
    'tip.touch': '<b>Веди по экрану:</b> прицел &nbsp; <b>Держи ◎:</b> огонь (автомат, на телефоне без отдачи) &nbsp; <b>1/2/3:</b> оружие &nbsp; <b>❚❚:</b> пауза' },
  es: { rotate: 'Gira el móvil en horizontal para jugar', 'set.tsens': 'Sensibilidad táctil', 'set.gyro': 'Apuntar con giroscopio', gyroDenied: 'No se concedió el permiso de movimiento.', gyroNone: 'Este dispositivo no ofrece datos de giroscopio.', lbMobile: 'Móvil',
    'tip.touch': '<b>Arrastra la pantalla:</b> apuntar &nbsp; <b>Mantén ◎:</b> disparar (automático, sin retroceso en el móvil) &nbsp; <b>1/2/3:</b> arma &nbsp; <b>❚❚:</b> pausa' },
  pt: { rotate: 'Vire o celular na horizontal para jogar', 'set.tsens': 'Sensibilidade do toque', 'set.gyro': 'Mira com giroscópio', gyroDenied: 'A permissão de movimento não foi concedida.', gyroNone: 'Este aparelho não fornece dados de giroscópio.', lbMobile: 'Celular',
    'tip.touch': '<b>Arraste a tela:</b> mirar &nbsp; <b>Segure ◎:</b> atirar (automático, sem recuo no celular) &nbsp; <b>1/2/3:</b> arma &nbsp; <b>❚❚:</b> pausa' },
  ja: { rotate: 'スマホを横向きにしてプレイしてください', 'set.tsens': 'タッチ感度', 'set.gyro': 'ジャイロエイム', gyroDenied: 'モーションへのアクセスが許可されませんでした。', gyroNone: 'この端末はジャイロのデータを提供しません。', lbMobile: 'モバイル',
    'tip.touch': '<b>画面をドラッグ：</b>エイム &nbsp; <b>◎を長押し：</b>射撃（フルオート・スマホはリコイルなし） &nbsp; <b>1/2/3：</b>武器 &nbsp; <b>❚❚：</b>一時停止' },
  zh: { rotate: '请把手机横过来游玩', 'set.tsens': '触控灵敏度', 'set.gyro': '陀螺仪瞄准', gyroDenied: '未获得运动传感器权限。', gyroNone: '此设备不提供陀螺仪数据。', lbMobile: '手机',
    'tip.touch': '<b>拖动屏幕：</b>瞄准 &nbsp; <b>按住 ◎：</b>射击（全自动，手机上无后坐力） &nbsp; <b>1/2/3：</b>武器 &nbsp; <b>❚❚：</b>暂停' },
};
const ROT = {
  lv: ['Pagriezt ekrānu', 'Ja telefons negriežas (rotācijas bloķēšana), poga pagriezīs spēli pati — turi telefonu ar augšu pa kreisi.', 'Piespiedu horizontālais skats', 'Izslēgt ekrāna pagriešanu'],
  en: ['Rotate screen', 'If your phone will not rotate (rotation lock), this button turns the game for you — hold the phone with its top to the left.', 'Forced landscape', 'Turn off screen rotation'],
  ru: ['Повернуть экран', 'Если телефон не поворачивается (блокировка поворота), кнопка повернёт игру сама — держи телефон верхом влево.', 'Принудительный ландшафт', 'Выключить поворот экрана'],
  es: ['Girar pantalla', 'Si el móvil no gira (bloqueo de rotación), este botón gira el juego por ti: sujeta el móvil con la parte de arriba a la izquierda.', 'Horizontal forzado', 'Desactivar giro de pantalla'],
  pt: ['Girar tela', 'Se o celular não gira (bloqueio de rotação), este botão gira o jogo para você — segure o celular com o topo para a esquerda.', 'Paisagem forçada', 'Desativar giro de tela'],
  ja: ['画面を回転', '画面が回転しない（回転ロック）場合、このボタンでゲームを回転します。スマホの上側を左にして持ってください。', '強制横向き', '画面回転をオフ'],
  zh: ['旋转屏幕', '如果手机不会自动旋转（已锁定方向），此按钮会帮你旋转游戏——请把手机顶部朝左握持。', '强制横屏', '关闭屏幕旋转'],
};
for (const l in ROT) Object.assign(TOUCH[l], { rotBtn: ROT[l][0], rotNote: ROT[l][1], 'set.forcerot': ROT[l][2], rotOff: ROT[l][3] });
const TM = { lv: ['Telefona režīms (pieskarieni)', 'IESL.', 'IZSL.'], en: ['Touch mode', 'ON', 'OFF'], ru: ['Сенсорный режим', 'ВКЛ', 'ВЫКЛ'], es: ['Modo táctil', 'SÍ', 'NO'],
  pt: ['Modo toque', 'LIGADO', 'DESLIGADO'], ja: ['タッチモード', 'オン', 'オフ'], zh: ['触控模式', '开', '关'] };
for (const l in TM) Object.assign(TOUCH[l], { touchMode: TM[l][0], on: TM[l][1], off: TM[l][2] });
const QS = {
  lv: ['Grafikas kvalitāte', 'Auto', 'Augsta', 'Vidēja', 'Zema', 'Mērķēšanas palīdzība', 'FIRE pogas izmērs', 'Telefonā vistas ir lielākas (vieglāk trāpīt); telefona tabula ir atsevišķa. Auto kvalitāte pati samazinās, ja kadri krīt zem 40 FPS.'],
  en: ['Graphics quality', 'Auto', 'High', 'Medium', 'Low', 'Aim assist', 'FIRE button size', 'On phones the chickens are bigger (easier to hit); phones have their own leaderboard. Auto quality steps down by itself if the frame rate drops below 40 FPS.'],
  ru: ['Качество графики', 'Авто', 'Высокое', 'Среднее', 'Низкое', 'Помощь в прицеливании', 'Размер кнопки FIRE', 'На телефоне курицы крупнее (легче попасть); у телефонов своя таблица. Авто-качество снижается само, если FPS падает ниже 40.'],
  es: ['Calidad gráfica', 'Auto', 'Alta', 'Media', 'Baja', 'Ayuda de apuntado', 'Tamaño del botón FIRE', 'En el móvil las gallinas son más grandes (más fáciles de acertar); los móviles tienen su propia clasificación. La calidad Auto baja sola si los FPS caen por debajo de 40.'],
  pt: ['Qualidade gráfica', 'Auto', 'Alta', 'Média', 'Baixa', 'Assistência de mira', 'Tamanho do botão FIRE', 'No celular as galinhas são maiores (mais fáceis de acertar); celulares têm ranking próprio. A qualidade Auto baixa sozinha se o FPS cair abaixo de 40.'],
  ja: ['画質', '自動', '高', '中', '低', 'エイムアシスト', 'FIREボタンの大きさ', 'スマホではニワトリが大きく表示され、当てやすくなります。スマホ用ランキングは別です。自動画質は40FPSを下回ると自動で下がります。'],
  zh: ['画质', '自动', '高', '中', '低', '辅助瞄准', 'FIRE 按钮大小', '手机上小鸡更大（更容易命中）；手机有独立排行榜。自动画质在帧率低于 40 FPS 时会自动降低。'],
};
for (const l in QS) { const a = QS[l]; Object.assign(TOUCH[l], { 'set.quality': a[0], qAuto: a[1], qHigh: a[2], qMed: a[3], qLow: a[4], 'set.fire': a[6], 'set.mnote': a[7] }); }
const GO = { lv: 'AIZIET!', en: 'GO!', ru: 'ВПЕРЁД!', es: '¡YA!', pt: 'JÁ!', ja: 'スタート！', zh: '开始！' };
for (const l in GO) TOUCH[l].go = GO[l];
const NR = { lv: 'Telefonā bez atsitiena', en: 'No recoil on phone', ru: 'На телефоне без отдачи', es: 'Sin retroceso en el móvil', pt: 'Sem recuo no celular', ja: 'スマホはリコイルなし', zh: '手机上无后坐力' };
for (const l in NR) TOUCH[l].noRecoil = NR[l];
const HOME = { lv: 'FlowAthletiq sākumlapa', en: 'FlowAthletiq home page', ru: 'Главная страница FlowAthletiq', es: 'Página de inicio de FlowAthletiq', pt: 'Página inicial do FlowAthletiq', ja: 'FlowAthletiq ホームページ', zh: 'FlowAthletiq 首页' };
for (const l in HOME) TOUCH[l].homeLink = HOME[l];
const PRAC = { // [button, badge, picker title, note, retry, other level, ranked again, back]
  lv: ['Brīvais režīms', 'BRĪVAIS REŽĪMS – netiek ieskaitīts', 'Brīvais režīms: izvēlies līmeni', 'Rezultāts netiek iesniegts tabulā un neskaitās rekordā vai rangā.', 'Atkārtot {n}. līmeni', 'Cits līmenis', 'Spēlēt ar rangu', 'Atpakaļ'],
  en: ['Free mode', 'FREE MODE – not counted', 'Free mode: choose a level', 'Scores are not submitted to the leaderboard and do not count for your record or rank.', 'Retry level {n}', 'Other level', 'Play ranked', 'Back'],
  ru: ['Свободный режим', 'СВОБОДНЫЙ РЕЖИМ – не засчитывается', 'Свободный режим: выбери уровень', 'Результат не отправляется в таблицу и не идёт в рекорд или ранг.', 'Повторить уровень {n}', 'Другой уровень', 'Играть на ранг', 'Назад'],
  es: ['Modo libre', 'MODO LIBRE – no cuenta', 'Modo libre: elige un nivel', 'La puntuación no se envía a la clasificación y no cuenta para tu récord ni tu rango.', 'Repetir nivel {n}', 'Otro nivel', 'Jugar con rango', 'Atrás'],
  pt: ['Modo livre', 'MODO LIVRE – não conta', 'Modo livre: escolha um nível', 'A pontuação não é enviada ao ranking e não conta para seu recorde nem rank.', 'Repetir nível {n}', 'Outro nível', 'Jogar ranqueado', 'Voltar'],
  ja: ['フリーモード', 'フリーモード – 記録されません', 'フリーモード：レベルを選択', 'スコアはランキングに送信されず、自己ベストやランクにも反映されません。', 'レベル{n}をもう一度', '別のレベル', 'ランク戦をプレイ', '戻る'],
  zh: ['自由模式', '自由模式 – 不计成绩', '自由模式：选择关卡', '成绩不会提交到排行榜，也不计入个人纪录或段位。', '重玩第 {n} 关', '其他关卡', '排位模式', '返回'],
};
for (const l in PRAC) { const a = PRAC[l]; Object.assign(TOUCH[l], { pracBtn: a[0], pracBadge: a[1], pracPick: a[2], pracNote: a[3], pracRetry: a[4], pracOther: a[5], pracRanked: a[6], pracBack: a[7] }); }
const SHARE = { // [button, toast, share text]
  lv: ['🔗 Dalīties ar draugiem', 'Saite nokopēta!', 'Izmēģini CS2 aim trainer pārlūkā – šauj vistām Kuldīgā!'],
  en: ['🔗 Share with friends', 'Link copied!', 'Try this free CS2 aim trainer in your browser – shoot chickens in Kuldīga!'],
  ru: ['🔗 Поделиться с друзьями', 'Ссылка скопирована!', 'Попробуй бесплатный CS2 aim trainer в браузере – стреляй по курицам в Кулдиге!'],
  es: ['🔗 Compartir con amigos', '¡Enlace copiado!', 'Prueba este aim trainer de CS2 gratis en el navegador: ¡dispara a gallinas en Kuldīga!'],
  pt: ['🔗 Compartilhar com amigos', 'Link copiado!', 'Experimente este aim trainer de CS2 grátis no navegador – atire em galinhas em Kuldīga!'],
  ja: ['🔗 友達に共有', 'リンクをコピーしました！', 'ブラウザで遊べる無料のCS2エイムトレーナー – クルディーガでチキンを撃とう！'],
  zh: ['🔗 分享给朋友', '链接已复制！', '在浏览器里免费玩 CS2 瞄准训练——在库尔迪加打鸡！'],
};
for (const l in SHARE) Object.assign(TOUCH[l], { share: SHARE[l][0], copied: SHARE[l][1], shareText: SHARE[l][2] });
const SHARE2 = { // [manual copy hint, shared ok, close]
  lv: ['Nokopē saiti un nosūti draugiem:', 'Paldies par dalīšanos!', 'Aizvērt'], en: ['Copy the link and send it to your friends:', 'Thanks for sharing!', 'Close'],
  ru: ['Скопируй ссылку и отправь друзьям:', 'Спасибо, что поделился!', 'Закрыть'], es: ['Copia el enlace y envíalo a tus amigos:', '¡Gracias por compartir!', 'Cerrar'],
  pt: ['Copie o link e envie para seus amigos:', 'Obrigado por compartilhar!', 'Fechar'], ja: ['リンクをコピーして友達に送ろう：', 'シェアありがとう！', '閉じる'], zh: ['复制链接发给朋友：', '感谢分享！', '关闭'],
};
for (const l in SHARE2) Object.assign(TOUCH[l], { shareManual: SHARE2[l][0], shared: SHARE2[l][1], shareClose: SHARE2[l][2] });
const TOUCH_IDEAL = { lv: '— ideālais pirksta ceļš', en: '— ideal finger path', ru: '— идеальный путь пальца', es: '— trayectoria ideal del dedo', pt: '— caminho ideal do dedo', ja: '— 理想の指の軌道', zh: '— 理想手指轨迹' };
const TOUCH_HINTS = {
  lv: ['Turi ◎ un velc ar pirkstu pa cian līniju', '1 / 2 / 3 ierocis · ❚❚ izvēlne'],
  en: ['Hold ◎ and drag your finger along the cyan line', '1 / 2 / 3 weapon · ❚❚ menu'],
  ru: ['Держи ◎ и веди пальцем по голубой линии', '1 / 2 / 3 оружие · ❚❚ меню'],
  es: ['Mantén ◎ y arrastra el dedo siguiendo la línea cian', '1 / 2 / 3 arma · ❚❚ menú'],
  pt: ['Segure ◎ e arraste o dedo pela linha ciano', '1 / 2 / 3 arma · ❚❚ menu'],
  ja: ['◎を押したまま、指でシアンの線をなぞろう', '1 / 2 / 3 武器 · ❚❚ メニュー'],
  zh: ['按住 ◎，用手指沿着青色线拖动', '1 / 2 / 3 武器 · ❚❚ 菜单'],
};
for (const l in TOUCH_HINTS) Object.assign(TOUCH[l], { 'sp.hint.m': TOUCH_HINTS[l][0], 'sp.keys.m': TOUCH_HINTS[l][1], 'sp.ideal.m': TOUCH_IDEAL[l] });
const TAV = { // Vistu krogs (free mode, desktop): [enter, exit, sit, stand up, leave, screen poster, free-mode hint, live, offline note, channel]
  lv: ['E — ieiet Vistu krogā', 'E — iziet no kroga', 'E — apsēsties', 'Piecelties (E)', 'Iziet no kroga', 'Apsēdies pie galda (E), lai skatītos tiešraidi', 'Brīvais režīms: WASD staigāt · H nolikt/paņemt ieroci · E krogs', 'TIEŠRAIDE', 'Ja kanāls šobrīd nav tiešsaistē, Twitch rāda bezsaistes ekrānu.', 'Kanāls'],
  en: ['E — enter Vistu krogs', 'E — leave the tavern', 'E — sit down', 'Stand up (E)', 'Leave the tavern', 'Sit at a table (E) to watch the live stream', 'Free mode: WASD walk · H holster/draw weapon · E tavern', 'LIVE', 'If the channel is offline right now, Twitch shows its offline screen.', 'Channel'],
  ru: ['E — войти в Vistu krogs', 'E — выйти из таверны', 'E — сесть', 'Встать (E)', 'Выйти из таверны', 'Сядь за стол (E), чтобы смотреть трансляцию', 'Свободный режим: WASD — ходить везде · H — убрать/достать оружие · E — таверна', 'ПРЯМОЙ ЭФИР', 'Если канал сейчас не в эфире, Twitch показывает экран офлайн.', 'Канал'],
  es: ['E — entrar en Vistu krogs', 'E — salir de la taberna', 'E — sentarse', 'Levantarse (E)', 'Salir de la taberna', 'Siéntate a una mesa (E) para ver el directo', 'Modo libre: WASD camina libre · H guardar/sacar arma · E taberna', 'EN DIRECTO', 'Si el canal no está en directo, Twitch muestra su pantalla offline.', 'Canal'],
  pt: ['E — entrar no Vistu krogs', 'E — sair da taverna', 'E — sentar', 'Levantar (E)', 'Sair da taverna', 'Sente-se a uma mesa (E) para ver a live', 'Modo livre: WASD andar livre · H guardar/sacar arma · E taverna', 'AO VIVO', 'Se o canal estiver offline agora, a Twitch mostra a tela offline.', 'Canal'],
  ja: ['E — Vistu krogsに入る', 'E — 酒場を出る', 'E — 座る', '立ち上がる (E)', '酒場を出る', 'テーブルに座って（E）ライブ配信を見よう', 'フリーモード：WASDで自由に歩く · H 武器をしまう/出す · E 酒場', 'ライブ', 'チャンネルが配信していない場合はTwitchのオフライン画面が表示されます。', 'チャンネル'],
  zh: ['E — 进入 Vistu krogs', 'E — 离开酒馆', 'E — 坐下', '站起来 (E)', '离开酒馆', '在桌边坐下（E）观看直播', '自由模式：WASD 自由行走 · H 收起/拿出武器 · E 酒馆', '直播', '如果频道当前未开播，Twitch 会显示离线画面。', '频道'],
};
const HOL = { lv: 'Ierocis nolikts — spied H, lai paņemtu', en: 'Weapon holstered — press H to draw', ru: 'Оружие убрано — нажми H, чтобы достать', es: 'Arma guardada — pulsa H para sacarla', pt: 'Arma guardada — prima H para sacar', ja: '武器をしまいました — H で構える', zh: '武器已收起 — 按 H 取出' };
for (const l in HOL) if (TOUCH[l]) TOUCH[l].holsterOn = HOL[l];
for (const l in TAV) { const a = TAV[l]; Object.assign(TOUCH[l], { tavEnter: a[0], tavExit: a[1], tavSit: a[2], tavStand: a[3], tavLeave: a[4], tavPoster: a[5], freeHint: a[6], tavLive: a[7], tavOffline: a[8], tavChannel: a[9] }); }
for (const l in TOUCH) Object.assign(S[l], TOUCH[l]);
const valid = (c) => !!S[c];
// --- visitor country without any IP service: time zone first, then the browser locale's region subtag
const RU_TZ = ['Europe/Moscow', 'Europe/Kaliningrad', 'Europe/Samara', 'Europe/Volgograd', 'Europe/Saratov', 'Europe/Ulyanovsk', 'Europe/Astrakhan', 'Europe/Kirov',
  'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Barnaul', 'Asia/Tomsk', 'Asia/Novokuznetsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Chita',
  'Asia/Yakutsk', 'Asia/Khandyga', 'Asia/Vladivostok', 'Asia/Ust-Nera', 'Asia/Magadan', 'Asia/Sakhalin', 'Asia/Srednekolymsk', 'Asia/Kamchatka', 'Asia/Anadyr'];
const KZ_TZ = ['Asia/Almaty', 'Asia/Qostanay', 'Asia/Aqtobe', 'Asia/Aqtau', 'Asia/Atyrau', 'Asia/Oral', 'Asia/Qyzylorda'];
const TZ_CC = { 'Europe/Riga': 'LV', 'Europe/Minsk': 'BY', 'Asia/Bishkek': 'KG',
  // Spanish
  'Europe/Madrid': 'ES', 'Atlantic/Canary': 'ES', 'Africa/Ceuta': 'ES', 'America/Bogota': 'CO', 'America/Santiago': 'CL', 'America/Punta_Arenas': 'CL', 'Pacific/Easter': 'CL',
  'America/Lima': 'PE', 'America/Caracas': 'VE', 'America/Guayaquil': 'EC', 'Pacific/Galapagos': 'EC', 'America/Guatemala': 'GT', 'America/Havana': 'CU', 'America/La_Paz': 'BO',
  'America/Santo_Domingo': 'DO', 'America/Tegucigalpa': 'HN', 'America/Asuncion': 'PY', 'America/El_Salvador': 'SV', 'America/Managua': 'NI', 'America/Costa_Rica': 'CR',
  'America/Panama': 'PA', 'America/Montevideo': 'UY', 'America/Puerto_Rico': 'PR', 'America/Buenos_Aires': 'AR', 'America/Cordoba': 'AR', 'America/Mendoza': 'AR',
  // Portuguese
  'Europe/Lisbon': 'PT', 'Atlantic/Madeira': 'PT', 'Atlantic/Azores': 'PT', 'Africa/Luanda': 'AO', 'Africa/Maputo': 'MZ',
  // Japanese, Chinese
  'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Urumqi': 'CN', 'Asia/Chongqing': 'CN', 'Asia/Chungking': 'CN', 'Asia/Harbin': 'CN', 'PRC': 'CN', 'Asia/Taipei': 'TW', 'ROC': 'TW', 'Japan': 'JP' };
RU_TZ.forEach((z) => (TZ_CC[z] = 'RU')); KZ_TZ.forEach((z) => (TZ_CC[z] = 'KZ'));
['Mexico_City', 'Cancun', 'Merida', 'Monterrey', 'Matamoros', 'Chihuahua', 'Ciudad_Juarez', 'Ojinaga', 'Mazatlan', 'Bahia_Banderas', 'Hermosillo', 'Tijuana', 'Ensenada']
  .forEach((z) => (TZ_CC['America/' + z] = 'MX'));
['Sao_Paulo', 'Noronha', 'Belem', 'Fortaleza', 'Recife', 'Araguaina', 'Maceio', 'Bahia', 'Campo_Grande', 'Cuiaba', 'Santarem', 'Porto_Velho', 'Boa_Vista', 'Manaus', 'Eirunepe', 'Rio_Branco']
  .forEach((z) => (TZ_CC['America/' + z] = 'BR'));
const ES_CC = ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR'];
export function detectCountry() {
  let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
  if (TZ_CC[tz]) return TZ_CC[tz];
  if (tz.startsWith('America/Argentina/')) return 'AR';
  for (const l of navigator.languages || [navigator.language || '']) { const m = /^[a-z]{2,3}(?:-[A-Za-z]{4})?[-_]([A-Za-z]{2})\b/.exec(String(l)); if (m) return m[1].toUpperCase(); }
  return '';
}
// LV → lv; RU BY KZ KG → ru; Spain + Spanish-majority Latin America → es; PT BR AO MZ → pt; JP → ja; CN TW → zh; everything else (incl. IN, SG) → en
export const countryLang = (cc) => (cc === 'LV' ? 'lv' : ['RU', 'BY', 'KZ', 'KG'].includes(cc) ? 'ru' : ES_CC.includes(cc) ? 'es'
  : ['PT', 'BR', 'AO', 'MZ'].includes(cc) ? 'pt' : cc === 'JP' ? 'ja' : ['CN', 'TW'].includes(cc) ? 'zh' : 'en');
function pick() {
  const q = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  if (valid(q)) { try { localStorage.setItem('fa-lang', q); } catch {} return q; }
  try { const s = localStorage.getItem('fa-lang'); if (valid(s)) return s; } catch {}
  return countryLang(detectCountry());
}
export let LANG = pick();
export function t(key, vars) {
  let v = (S[LANG] && S[LANG][key]) ?? S.en[key] ?? S.lv[key] ?? key;
  if (vars && typeof v === 'string') v = v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  return v;
}
const listeners = [];
export const onLang = (f) => listeners.push(f);
export function setLang(code) {
  if (!valid(code)) return;
  LANG = code; try { localStorage.setItem('fa-lang', code); } catch {}
  const u = new URL(location.href); if (u.searchParams.has('lang')) { u.searchParams.set('lang', code); history.replaceState(null, '', u); }
  applyDom(); listeners.forEach((f) => f(code));
}
// localized <title>/description + self-referencing canonical (?lang=) and hreflang alternates (x-default = English)
const BASE = 'https://flowathletiq.com/aim/';
function seoHead() {
  const h = document.head, set = (sel, mk, attr, val) => { let e = h.querySelector(sel); if (!e) { e = mk(); h.appendChild(e); } e.setAttribute(attr, val); };
  const meta = (k, v) => () => { const m = document.createElement('meta'); m.setAttribute(k, v); return m; };
  document.title = t('seo.title');
  set('meta[name="description"]', meta('name', 'description'), 'content', t('seo.desc'));
  set('meta[property="og:title"]', meta('property', 'og:title'), 'content', t('seo.title'));
  set('meta[property="og:description"]', meta('property', 'og:description'), 'content', t('seo.desc'));
  set('meta[property="og:url"]', meta('property', 'og:url'), 'content', BASE + '?lang=' + LANG);
  set('meta[property="og:locale"]', meta('property', 'og:locale'), 'content', LOCALE[LANG]);
  set('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; }, 'href', BASE + '?lang=' + LANG);
}
export function applyDom(root = document) {
  document.documentElement.lang = LANG;
  if (root === document) seoHead();
  root.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  root.querySelectorAll('.lang-sw').forEach((el) => {
    // compact dropdown (7 languages): shows the short code, lists native names
    el.innerHTML = `<label class="lang-dd"><span aria-hidden="true">${LANGS.find((l) => l.code === LANG).label} ▾</span><select aria-label="${t('set.lang')}">${
      LANGS.map((l) => `<option value="${l.code}"${l.code === LANG ? ' selected' : ''}>${l.label} · ${l.name}</option>`).join('')}</select></label>`;
    el.querySelector('select').onchange = (e) => setLang(e.target.value);
  });
}
