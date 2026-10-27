// UI strings LV / EN / RU. Language: ?lang= → site's saved language (localStorage "fa-lang") → browser → lv.
export const LANGS = [{ code: 'lv', label: 'LV' }, { code: 'en', label: 'EN' }, { code: 'ru', label: 'RU' }];
const S = {
  lv: {
    title: 'FlowAthletiq Aim Trainer', 'mobile.h': 'Spēlē uz datora ar peli',
    'mobile.p1': 'FlowAthletiq Aim Trainer ir veidots peles aim treniņam ar CS2 sensitivity, tāpēc telefonā vai planšetē tas nedarbojas.',
    'mobile.p2': 'Atver šo lapu datorā (ieteicams Chrome vai Edge) un pievieno savu CS2 crosshair.', 'mobile.back': 'Atpakaļ uz FlowAthletiq',
    lead: 'Vistas ar ķiverēm un bruņuvestēm parādās logos, balkonu durvīs un uz jumtu malām: izbāž galvu, paskatās pa labi un pa kreisi, pietupstas un lec lejā uz A site. Nošauj katru, pirms tā piezemējas. Pirmo šauj to, kura jau gatavojas lēkt! Viena piezemējusies vista, un spēle beigusies.',
    start: 'Sākt spēli', spray: 'Spray treniņš', crosshair: 'Crosshair', settings: 'Iestatījumi',
    'tip.fire': '<b>Kreisā poga:</b> šaut (turi, lai šautu sērijā)', 'tip.keys': '<b>1 / 2 / 3:</b> ierocis &nbsp; <b>ESC:</b> pauze',
    'tip.dmg': 'Bojājumi, recoil un šaušanas ātrums pēc CS2 vērtībām. AK-47 headshot caur ķiveri nogalina ar vienu šāvienu, M4 ne.',
    pbTitle: 'Tavs rekords', ranksTitle: 'Rangi', pbNone: 'Vēl nav rezultāta. Uzspēlē pirmo raundu!',
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
    getReady: 'Gatavojies…', remaining: 'Atlikušas vistas: {n}', escaped: 'Vista aizbēga!', landed: 'Vista piezemējās!', timeUp: 'Laiks beidzās!',
    chicken: 'Vista', reached: 'Sasniegtais līmenis: {n}', nextRank: ' · nākamais rangs no {n}. līmeņa', topRank: ' · augstākais rangs!',
    newPB: 'Jauns personīgais rekords!', yourPB: 'Tavs rekords: {level}. līmenis, {score} punkti',
    wBanner: '{dmg} bojājums · {rpm} RPM · {mag} lodes', wCard: '{dmg} dmg · {rpm} RPM · {mag} lodes', wHs: 'HS ar ķiveri: {n}', oneTap: ' (one-tap)',
    wKeys: '1 AK-47 · 2 M4A4 · 3 M4A1-S',
    'sp.wall': 'SPRAY TRENIŅŠ', 'sp.hint': 'Turi šaušanu un velc peli pa ciāna līniju', 'sp.result': 'Rezultāts', 'sp.bullets': 'Lodes', 'sp.best': 'Labākais',
    'sp.keys': '1 AK-47 · 2 M4A4 · 3 M4A1-S · ESC izvēlne', 'sp.raw': '● recoil bez kontroles', 'sp.ideal': '— ideālais peles ceļš', 'sp.yours': '● tavas lodes', 'sp.grid': 'režģis 2°',
    ranks: ['Vilcēns', 'Jaunais vilks', 'Mednieks', 'Bara sargs', 'Alfa', 'Astral'],
  },
  en: {
    title: 'FlowAthletiq Aim Trainer', 'mobile.h': 'Play on a computer with a mouse',
    'mobile.p1': 'FlowAthletiq Aim Trainer is built for mouse aim training with CS2 sensitivity, so it does not work on phones or tablets.',
    'mobile.p2': 'Open this page on a computer (Chrome or Edge recommended) and bring your CS2 crosshair.', 'mobile.back': 'Back to FlowAthletiq',
    lead: 'Chickens in helmets and armor vests appear in windows, balcony doors and on roof edges: they stick their head out, look right, look left, crouch and jump down onto A site. Shoot every one before it lands. Shoot the one about to jump first! One chicken on the ground and the game is over.',
    start: 'Start game', spray: 'Spray training', crosshair: 'Crosshair', settings: 'Settings',
    'tip.fire': '<b>Left click:</b> shoot (hold to spray)', 'tip.keys': '<b>1 / 2 / 3:</b> weapon &nbsp; <b>ESC:</b> pause',
    'tip.dmg': 'Damage, recoil and fire rate use CS2 values. An AK-47 headshot through a helmet is a one-tap, an M4 is not.',
    pbTitle: 'Your best', ranksTitle: 'Ranks', pbNone: 'No result yet. Play your first round!',
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
    getReady: 'Get ready…', remaining: 'Chickens left: {n}', escaped: 'A chicken escaped!', landed: 'A chicken landed!', timeUp: 'Time is up!',
    chicken: 'Chicken', reached: 'Level reached: {n}', nextRank: ' · next rank at level {n}', topRank: ' · highest rank!',
    newPB: 'New personal best!', yourPB: 'Your best: level {level}, {score} points',
    wBanner: '{dmg} damage · {rpm} RPM · {mag} rounds', wCard: '{dmg} dmg · {rpm} RPM · {mag} rounds', wHs: 'HS with helmet: {n}', oneTap: ' (one-tap)',
    wKeys: '1 AK-47 · 2 M4A4 · 3 M4A1-S',
    'sp.wall': 'SPRAY TRAINING', 'sp.hint': 'Hold fire and drag your mouse along the cyan line', 'sp.result': 'Score', 'sp.bullets': 'Bullets', 'sp.best': 'Best',
    'sp.keys': '1 AK-47 · 2 M4A4 · 3 M4A1-S · ESC menu', 'sp.raw': '● recoil without control', 'sp.ideal': '— ideal mouse path', 'sp.yours': '● your bullets', 'sp.grid': 'grid 2°',
    ranks: ['Wolf Pup', 'Young Wolf', 'Hunter', 'Pack Guard', 'Alpha', 'Astral'],
  },
  ru: {
    title: 'FlowAthletiq Aim Trainer', 'mobile.h': 'Играй на компьютере с мышью',
    'mobile.p1': 'FlowAthletiq Aim Trainer создан для тренировки аима мышью с сенсой CS2, поэтому на телефоне или планшете он не работает.',
    'mobile.p2': 'Открой эту страницу на компьютере (лучше в Chrome или Edge) и добавь свой прицел из CS2.', 'mobile.back': 'Назад на FlowAthletiq',
    lead: 'Курицы в шлемах и бронежилетах появляются в окнах, дверях балконов и на краях крыш: высовывают голову, смотрят направо и налево, приседают и прыгают вниз на плент A. Подстрели каждую, пока она не приземлилась. Сначала стреляй в ту, что уже готова прыгнуть! Одна приземлившаяся курица — и игра окончена.',
    start: 'Начать игру', spray: 'Тренировка спрея', crosshair: 'Прицел', settings: 'Настройки',
    'tip.fire': '<b>Левая кнопка:</b> стрелять (зажми для очереди)', 'tip.keys': '<b>1 / 2 / 3:</b> оружие &nbsp; <b>ESC:</b> пауза',
    'tip.dmg': 'Урон, отдача и скорострельность взяты из CS2. Хедшот из AK-47 через шлем убивает с одного выстрела, из M4 — нет.',
    pbTitle: 'Твой рекорд', ranksTitle: 'Ранги', pbNone: 'Результата пока нет. Сыграй первый раунд!',
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
    getReady: 'Приготовься…', remaining: 'Осталось куриц: {n}', escaped: 'Курица сбежала!', landed: 'Курица приземлилась!', timeUp: 'Время вышло!',
    chicken: 'Курица', reached: 'Достигнутый уровень: {n}', nextRank: ' · следующий ранг с {n} уровня', topRank: ' · высший ранг!',
    newPB: 'Новый личный рекорд!', yourPB: 'Твой рекорд: уровень {level}, {score} очков',
    wBanner: 'Урон {dmg} · {rpm} RPM · {mag} патронов', wCard: '{dmg} урон · {rpm} RPM · {mag} патр.', wHs: 'HS в шлем: {n}', oneTap: ' (ваншот)',
    wKeys: '1 AK-47 · 2 M4A4 · 3 M4A1-S',
    'sp.wall': 'ТРЕНИРОВКА СПРЕЯ', 'sp.hint': 'Зажми огонь и веди мышь по голубой линии', 'sp.result': 'Результат', 'sp.bullets': 'Пули', 'sp.best': 'Лучший',
    'sp.keys': '1 AK-47 · 2 M4A4 · 3 M4A1-S · ESC меню', 'sp.raw': '● отдача без контроля', 'sp.ideal': '— идеальный путь мыши', 'sp.yours': '● твои пули', 'sp.grid': 'сетка 2°',
    ranks: ['Волчонок', 'Молодой волк', 'Охотник', 'Страж стаи', 'Альфа', 'Астрал'],
  },
};
const valid = (c) => !!S[c];
function pick() {
  const q = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  if (valid(q)) { try { localStorage.setItem('fa-lang', q); } catch {} return q; }
  try { const s = localStorage.getItem('fa-lang'); if (valid(s)) return s; } catch {}
  for (const l of navigator.languages || [navigator.language || '']) { const c = String(l).slice(0, 2).toLowerCase(); if (valid(c)) return c; }
  return 'lv';
}
export let LANG = pick();
export function t(key, vars) {
  let v = (S[LANG] && S[LANG][key]) ?? S.lv[key] ?? key;
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
export function applyDom(root = document) {
  document.documentElement.lang = LANG;
  root.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
  root.querySelectorAll('.lang-sw').forEach((el) => {
    el.innerHTML = LANGS.map((l) => `<button type="button" data-lang="${l.code}" class="${l.code === LANG ? 'on' : ''}" aria-pressed="${l.code === LANG}">${l.label}</button>`).join('');
    el.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));
  });
}
