/* ===========================
   天命三国 - Destiny of Three Kingdoms
   game.js — Complete Game Logic
   =========================== */

'use strict';

/* ===========================
   GENERALS DATA
   =========================== */
const GENERALS = [
  // UR
  {
    id: 'lubu', name: '呂布', rarity: 'UR', atk: 100,
    effectName: '飛将',
    effectDesc: '最強の一撃。ただし同一プレイで3回以上召喚すると裏切り、50ダメージを受ける',
  },
  {
    id: 'guanyu', name: '関羽', rarity: 'UR', atk: 80,
    effectName: '義',
    effectDesc: '敵HP20%未満の場合、攻撃を拒否する（義を重んじるため）',
  },
  {
    id: 'zhugeliang', name: '諸葛亮', rarity: 'UR', atk: 30,
    effectName: '天命',
    effectDesc: '次の関の軍議で全ての竹簡の内容が事前に判明する',
  },
  {
    id: 'diaochan', name: '貂蝉', rarity: 'UR', atk: 10,
    effectName: '傾国',
    effectDesc: '美人計で敵の次の2回の攻撃を封じる',
  },
  {
    id: 'caocao', name: '曹操', rarity: 'UR', atk: 70,
    effectName: '覇道',
    effectDesc: '敵の現在HPの10%を奪い、自分のHPとして吸収する',
  },
  // SSR
  {
    id: 'zhaoyun', name: '趙雲', rarity: 'SSR', atk: 70,
    effectName: '一騎当千',
    effectDesc: '追加ダメージ+20',
  },
  {
    id: 'zhangfei', name: '張飛', rarity: 'SSR', atk: 60,
    effectName: '万夫不当',
    effectDesc: '広範囲攻撃。ただし20%の確率で自陣に10ダメージ',
  },
  {
    id: 'zhouyu', name: '周瑜', rarity: 'SSR', atk: 65,
    effectName: '業火',
    effectDesc: '敵に炎上付与。次のターンに追加10ダメージ',
  },
  {
    id: 'simayi', name: '司馬懿', rarity: 'SSR', atk: 50,
    effectName: '隠忍',
    effectDesc: '敵の攻撃力を永続で5削減する',
  },
  {
    id: 'machao', name: '馬超', rarity: 'SSR', atk: 65,
    effectName: '神威',
    effectDesc: '30%の確率でダメージ2倍の突撃',
  },
  {
    id: 'huangzhong', name: '黄忠', rarity: 'SSR', atk: 55,
    effectName: '百歩穿楊',
    effectDesc: '40%の確率でクリティカル（ダメージ2倍）',
  },
  {
    id: 'luxun', name: '陸遜', rarity: 'SSR', atk: 50,
    effectName: '火計',
    effectDesc: '2ターンにわたって炎上15ダメージを与える',
  },
  {
    id: 'lumeng', name: '呂蒙', rarity: 'SSR', atk: 55,
    effectName: '白衣渡江',
    effectDesc: '敵の防御・バフを無視して攻撃する',
  },
  // SR
  {
    id: 'liubei', name: '劉備', rarity: 'SR', atk: 30,
    effectName: '仁',
    effectDesc: 'プレイヤーのHPを20回復する',
  },
  {
    id: 'sunquan', name: '孫権', rarity: 'SR', atk: 45,
    effectName: '守成',
    effectDesc: '敵の次の攻撃ダメージを50%軽減する',
  },
  {
    id: 'huanggai', name: '黄蓋', rarity: 'SR', atk: 70,
    effectName: '苦肉',
    effectDesc: '自陣に15ダメージを受けるが高い攻撃力で敵を攻める',
  },
  {
    id: 'xiahoudum', name: '夏侯惇', rarity: 'SR', atk: 55,
    effectName: '隻眼',
    effectDesc: 'プレイヤーHP50%未満の時、攻撃力が2倍になる',
  },
  {
    id: 'zhangliao', name: '張遼', rarity: 'SR', atk: 50,
    effectName: '威震',
    effectDesc: '30%の確率で敵が逃走（即時勝利、報酬は減少）',
  },
  {
    id: 'ganning', name: '甘寧', rarity: 'SR', atk: 50,
    effectName: '奇襲',
    effectDesc: 'その戦闘の最初の召喚に+30ボーナスダメージ',
  },
  {
    id: 'pangtong', name: '龐統', rarity: 'SR', atk: 20,
    effectName: '連環',
    effectDesc: '次の召喚のダメージが2倍になる',
  },
  {
    id: 'jiangwei', name: '姜維', rarity: 'SR', atk: 45,
    effectName: '継志',
    effectDesc: '直前に召喚した武将の効果をコピーする',
  },
  {
    id: 'dianwei', name: '典韋', rarity: 'SR', atk: 60,
    effectName: '古之悪来',
    effectDesc: 'プレイヤーHP30以下の時、攻撃力が3倍になる',
  },
  {
    id: 'taishici', name: '太史慈', rarity: 'SR', atk: 50,
    effectName: '義勇',
    effectDesc: 'ランダム性を無視して必ず50ダメージを与える',
  },
  // R
  {
    id: 'weiyan', name: '魏延', rarity: 'R', atk: 35,
    effectName: '謀反の気',
    effectDesc: '5%の確率で裏切りが発動し、自陣に20ダメージ',
  },
  {
    id: 'xushu', name: '徐庶', rarity: 'R', atk: 25,
    effectName: '孝義',
    effectDesc: 'HPを10回復する',
  },
  {
    id: 'menghuo', name: '孟獲', rarity: 'R', atk: 40,
    effectName: '蛮勇',
    effectDesc: '50%の確率で攻撃が外れる',
  },
  {
    id: 'zhurong', name: '祝融', rarity: 'R', atk: 35,
    effectName: '炎術',
    effectDesc: '2ターンにわたって炎上5ダメージを与える',
  },
  {
    id: 'wenchou', name: '文醜', rarity: 'R', atk: 35,
    effectName: 'なし',
    effectDesc: '特殊効果なし',
  },
  {
    id: 'yanliang', name: '顔良', rarity: 'R', atk: 35,
    effectName: 'なし',
    effectDesc: '特殊効果なし',
  },
  {
    id: 'zhanghong', name: '張紘', rarity: 'R', atk: 15,
    effectName: '謀略',
    effectDesc: 'HPを15回復する',
  },
  {
    id: 'chengyu', name: '程昱', rarity: 'R', atk: 20,
    effectName: '策謀',
    effectDesc: '召喚符を1つ追加で得る',
  },
  {
    id: 'yujin', name: '于禁', rarity: 'R', atk: 30,
    effectName: '威慑',
    effectDesc: '敵の攻撃力を3下げる',
  },
  {
    id: 'yuejin', name: '楽進', rarity: 'R', atk: 30,
    effectName: '速攻',
    effectDesc: '素早い攻撃で敵の反撃を封じる（次の敵攻撃スキップ）',
  },
  {
    id: 'lidiian', name: '李典', rarity: 'R', atk: 28,
    effectName: '治癒',
    effectDesc: 'HPを5回復する',
  },
  {
    id: 'masu', name: '馬謖', rarity: 'R', atk: 15,
    effectName: '失街亭',
    effectDesc: '40%の確率で次の関の軍議に凶カードが1枚増える',
  },
  // N
  {
    id: 'kiinan_a', name: '黄巾賊A', rarity: 'N', atk: 8,
    effectName: 'なし', effectDesc: '特殊効果なし',
  },
  {
    id: 'kiinan_b', name: '黄巾賊B', rarity: 'N', atk: 10,
    effectName: 'なし', effectDesc: '特殊効果なし',
  },
  {
    id: 'sanzoku', name: '山賊', rarity: 'N', atk: 12,
    effectName: '略奪',
    effectDesc: '敵の代わりにプレイヤーからHPを5奪う',
  },
  {
    id: 'ryumin', name: '流民', rarity: 'N', atk: 3,
    effectName: '感謝',
    effectDesc: '攻撃力は低いが、召喚されたことへの感謝でHP5回復',
  },
  {
    id: 'nouhei_a', name: '農民兵A', rarity: 'N', atk: 7,
    effectName: 'なし', effectDesc: '特殊効果なし',
  },
  {
    id: 'nouhei_b', name: '農民兵B', rarity: 'N', atk: 9,
    effectName: 'なし', effectDesc: '特殊効果なし',
  },
  {
    id: 'giyuuhei', name: '義勇兵', rarity: 'N', atk: 15,
    effectName: 'なし', effectDesc: 'Nランク最強の義勇兵',
  },
  {
    id: 'shokunin', name: '旅の商人', rarity: 'N', atk: 0,
    effectName: '行商',
    effectDesc: 'HP10回復＋召喚符+1',
  },
  {
    id: 'uranaishi', name: '占い師', rarity: 'N', atk: 0,
    effectName: '占術',
    effectDesc: '次の関の軍議で竹簡を1枚だけ事前に確認できる',
  },
  {
    id: 'toubouhe', name: '逃亡兵', rarity: 'N', atk: 5,
    effectName: '逃走',
    effectDesc: '50%の確率で何もせず逃げてしまう',
  },
];

// Build ID map
const GENERAL_MAP = {};
GENERALS.forEach(g => { GENERAL_MAP[g.id] = g; });

/* ===========================
   FLOOR DATA
   =========================== */
const FLOORS = [
  {
    num: 1, label: '第一関', name: '黄巾の乱',
    enemyName: '黄巾賊', hp: 80, atk: 8,
    desc: '乱世の幕開け。天下に黄巾の波が押し寄せる。暴徒を食い止めよ。',
    advisorHints: [
      '左の竹簡から光が漏れているような気がする...',
      '真ん中は見かけによらぬこともある。慎重に。',
      '選ぶ前に、風の向きを感じてみよ。',
    ],
  },
  {
    num: 2, label: '第二関', name: '反董卓連合',
    enemyName: '董卓軍', hp: 120, atk: 12,
    desc: '暴君・董卓が洛陽を牛耳る。諸侯が連合して立ち上がった。',
    advisorHints: [
      '強大な敵ほど、策略で崩せる。',
      '右の竹簡には不吉な予感がある。直感を信じよ。',
      '三つのうち、二つは味方をしてくれる…はずだ。',
    ],
  },
  {
    num: 3, label: '第三関', name: '官渡の戦い',
    enemyName: '袁紹軍', hp: 160, atk: 15,
    desc: '北方の覇者・袁紹と曹操の決戦。天下分け目の大一番。',
    advisorHints: [
      '袁紹軍は兵多く、一手一手が命取りになる。',
      '守りを固めるか、攻め続けるか。竹簡が語るだろう。',
      '中央の竹簡、今日は妙に輝いて見える。',
    ],
  },
  {
    num: 4, label: '第四関', name: '赤壁の戦い',
    enemyName: '曹操軍', hp: 220, atk: 18,
    desc: '百万の兵を率いる曹操が南下する。孫劉連合の奇策が鍵。',
    advisorHints: [
      '東南の風が吹けば、形勢は変わる。',
      '三つの中に、業火の兆しを感じる。',
      '慎重な者は右を選ぶという。だが武将の直感は別だ。',
    ],
  },
  {
    num: 5, label: '第五関', name: '五丈原の決戦',
    enemyName: '天下の覇者', hp: 300, atk: 22,
    desc: '最後の決戦。五丈原に星が落ちる前に、天命を掴め。',
    advisorHints: [
      'これが最後の軍議だ。全ての運命がここに収束する。',
      '天命とは選ぶ者が作るもの。恐れるな。',
      '星よ、我らに力を貸せ。',
    ],
  },
];

/* ===========================
   STRATEGY CARD TYPES
   =========================== */
const SCROLL_TYPES = {
  daikichi: {
    name: '大吉', resultClass: 'result-daikichi',
    heal: 30, charges: 2,
    desc: '大吉！HP+30、召喚符+2',
  },
  kichi: {
    name: '吉', resultClass: 'result-kichi',
    heal: 15, charges: 1,
    desc: '吉。HP+15、召喚符+1',
  },
  shoukichi: {
    name: '小吉', resultClass: 'result-shoukichi',
    heal: 10, charges: 0,
    desc: '小吉。HP+10',
  },
  kyou: {
    name: '凶', resultClass: 'result-kyou',
    damage: 15, charges: 0,
    desc: '凶。15ダメージを受ける',
  },
  daikyou: {
    name: '大凶', resultClass: 'result-daikyou',
    damage: 25, guaranteedSSR: true,
    desc: '大凶！25ダメージ。しかし次の召喚はSSR以上確定！',
  },
};

/* ===========================
   ADVISOR POOL (extra lines)
   =========================== */
const ADVISOR_QUOTES = [
  '天命は竹簡に宿る。慎重に選べ。',
  '良い結果ばかりとは限らぬ。覚悟して選ぶのだ。',
  '三つのうち、一つは必ず光明がある。',
  '運命は自ら切り開くもの。迷わず手を伸ばせ。',
];

/* ===========================
   PERSISTENCE (localStorage)
   =========================== */
const STORAGE_KEY = 'sangoku_gacha_save';

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function writeSave(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function getOrCreateSave() {
  const existing = loadSave();
  if (existing) return existing;
  return {
    generalsMet: [],
    totalRuns: 0,
    bestFloor: 0,
    totalWins: 0,
    destinyXP: 0, // 0-100
  };
}

/* ===========================
   UTILITY FUNCTIONS
   =========================== */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedRandom(weights) {
  // weights: [{id, weight}, ...]
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w.id;
  }
  return weights[weights.length - 1].id;
}

function rarityColor(rarity) {
  const map = { N: '#888', R: '#4caf50', SR: '#2196f3', SSR: '#9c27b0', UR: '#ffd700' };
  return map[rarity] || '#888';
}

/* ===========================
   GACHA POOL
   =========================== */
const RARITY_WEIGHTS = [
  { id: 'N', weight: 35 },
  { id: 'R', weight: 30 },
  { id: 'SR', weight: 20 },
  { id: 'SSR', weight: 10 },
  { id: 'UR', weight: 5 },
];

const RARITY_WEIGHTS_GUARANTEED = [
  { id: 'SSR', weight: 50 },
  { id: 'UR', weight: 50 },
];

const GENERALS_BY_RARITY = {};
GENERALS.forEach(g => {
  if (!GENERALS_BY_RARITY[g.rarity]) GENERALS_BY_RARITY[g.rarity] = [];
  GENERALS_BY_RARITY[g.rarity].push(g);
});

function rollGacha(guaranteed) {
  const rarity = guaranteed
    ? weightedRandom(RARITY_WEIGHTS_GUARANTEED)
    : weightedRandom(RARITY_WEIGHTS);
  const pool = GENERALS_BY_RARITY[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ===========================
   MAIN GAME CLASS
   =========================== */
const Game = (() => {

  // ── State ──────────────────────────────────
  let state = null;
  let save = null;

  // ── Screen Management ─────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen-' + id);
    if (screen) screen.classList.add('active');
  }

  // ── Init ──────────────────────────────────
  function init() {
    save = getOrCreateSave();
    updateTitleUI();
    showScreen('title');
  }

  function updateTitleUI() {
    // Destiny bar
    const pct = Math.min(100, save.destinyXP);
    document.getElementById('destiny-bar').style.width = pct + '%';
    document.getElementById('destiny-text').textContent = Math.floor(save.destinyXP) + ' / 100';

    // Stats display
    const el = document.getElementById('title-stats-display');
    el.textContent = `出陣回数: ${save.totalRuns}  /  勝利: ${save.totalWins}  /  最高到達: 第${save.bestFloor || '—'}関`;

    // Bonus banner
    const banner = document.getElementById('title-bonus-banner');
    if (save.destinyXP >= 100) {
      banner.classList.remove('hidden');
      banner.textContent = '✦ 天命降臨 ✦ 開始時HP+20＆召喚符+1ボーナス！';
    } else {
      banner.classList.add('hidden');
    }
  }

  // ── Start Run ─────────────────────────────
  function startRun() {
    const destinyBonus = save.destinyXP >= 100;

    state = {
      // Player
      playerHP: destinyBonus ? 120 : 100,
      playerMaxHP: destinyBonus ? 120 : 100,
      // Run metadata
      currentFloor: 0,
      generalsMetThisRun: [],
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      generalsCount: 0,
      // Lu Bu system
      lubuCount: 0,
      // Guaranteed SSR flag
      guaranteedSSR: false,
      // Zhuge Liang reveal
      zhugeRevealNextFloor: false,
      // Oracle (占い師) partial reveal
      oracleRevealNextFloor: false,
      // Ma Su extra bad
      masuExtraBad: false,
      // Bonus from destiny
      destinyBonus,
      baseCharges: destinyBonus ? 4 : 3,
    };

    if (destinyBonus) {
      // Reset destiny on use
      save.destinyXP = 0;
      writeSave(save);
    }

    save.totalRuns++;
    writeSave(save);

    loadFloor(0);
  }

  // ── Floor Loading ──────────────────────────
  function loadFloor(index) {
    state.currentFloor = index;
    const floor = FLOORS[index];

    // Enemy state
    state.enemy = {
      name: floor.enemyName,
      hp: floor.hp,
      maxHP: floor.hp,
      atk: floor.atk,
      burnTurns: 0,
      burnDmg: 0,
      skipAttacks: 0,
    };

    // Charges (3 base + any bonuses)
    state.charges = state.baseCharges;
    state.bonusCharges = 0;

    // Battle-specific flags
    state.isFirstSummon = true;
    state.doubleNextSummon = false;
    state.nextSummonSkipEnemyAtk = false;
    state.skipEnemyAttacks = 0;
    state.reducedNextEnemyAtk = false;
    state.floorGenerals = [];
    state.lastGeneral = null;
    state.battleLog = [];
    state.fleedAlready = false;

    // Track damage dealt / taken this floor
    state.floorDmgDealt = 0;
    state.floorDmgTaken = 0;

    showFloorIntro(floor);
  }

  function showFloorIntro(floor) {
    document.getElementById('floor-intro-num').textContent = floor.label;
    document.getElementById('floor-intro-name').textContent = floor.name;
    document.getElementById('floor-intro-enemy').textContent = floor.enemyName;
    document.getElementById('floor-intro-stats').textContent =
      `HP: ${floor.hp}  /  ATK: ${floor.atk}`;
    document.getElementById('floor-intro-desc').textContent = floor.desc;
    document.getElementById('floor-intro-hp-info').textContent =
      `現在HP: ${state.playerHP} / ${state.playerMaxHP}`;
    showScreen('floor-intro');
  }

  function goToStrategy() {
    buildStrategyCards();
    showScreen('strategy');
  }

  // ── Strategy Cards ─────────────────────────
  function buildStrategyCards() {
    const floor = FLOORS[state.currentFloor];

    // Determine card distribution
    const goodTypes = Math.random() < 0.5 ? ['daikichi'] : ['kichi'];
    const badTypes = state.masuExtraBad && Math.random() < 0.4
      ? ['kyou', 'daikyou']
      : [Math.random() < 0.5 ? 'kyou' : 'daikyou'];

    state.masuExtraBad = false;

    let pool;
    if (badTypes.length === 2) {
      // Ma Su effect: 2 bad, 1 neutral
      pool = [...goodTypes.slice(0, 0), 'shoukichi', ...badTypes];
      // Actually 2 bad + 1 neutral
      pool = ['shoukichi', badTypes[0], badTypes[1]];
    } else {
      pool = [...goodTypes, 'shoukichi', ...badTypes];
    }

    // Shuffle
    state.scrollCards = shuffle(pool);
    state.scrollRevealed = [false, false, false];
    state.scrollChosen = -1;

    // Reset UI
    for (let i = 0; i < 3; i++) {
      const card = document.getElementById('scroll-' + i);
      card.classList.remove('revealed', 'selected');
    }

    document.getElementById('strategy-result-msg').textContent = '';
    document.getElementById('strategy-next-btn-wrap').classList.add('hidden');
    document.getElementById('strategy-zhuge-reveal').classList.add('hidden');
    document.getElementById('guaranteed-notice').classList.toggle('hidden', !state.guaranteedSSR);

    // Advisor hint
    const hints = floor.advisorHints;
    let hint = hints[Math.floor(Math.random() * hints.length)];
    document.getElementById('advisor-hint').textContent = hint;

    // Zhuge Liang effect: reveal all cards
    if (state.zhugeRevealNextFloor) {
      state.zhugeRevealNextFloor = false;
      const labels = state.scrollCards.map(t => `「${SCROLL_TYPES[t].name}」`).join('・');
      const zhugeEl = document.getElementById('strategy-zhuge-reveal');
      zhugeEl.classList.remove('hidden');
      zhugeEl.textContent = `諸葛亮の天命眼：左から ${labels}`;
    }
    // Oracle partial reveal (一枚だけ)
    else if (state.oracleRevealNextFloor) {
      state.oracleRevealNextFloor = false;
      const revealIdx = Math.floor(Math.random() * 3);
      const zhugeEl = document.getElementById('strategy-zhuge-reveal');
      zhugeEl.classList.remove('hidden');
      const posName = ['左', '中央', '右'][revealIdx];
      zhugeEl.textContent = `占い師の予言：${posName}の竹簡は「${SCROLL_TYPES[state.scrollCards[revealIdx]].name}」`;
    }
  }

  function revealScroll(idx) {
    if (state.scrollChosen !== -1) return; // already chose
    state.scrollChosen = idx;
    state.scrollRevealed[idx] = true;

    const cardType = state.scrollCards[idx];
    const typeData = SCROLL_TYPES[cardType];

    // Animate flip
    const card = document.getElementById('scroll-' + idx);
    card.classList.add('revealed', 'selected');

    // Render back
    const back = document.getElementById('scroll-back-' + idx);
    back.innerHTML = `
      <div class="scroll-result-name ${typeData.resultClass}">${typeData.name}</div>
      <div class="scroll-result-effect">${typeData.desc}</div>
    `;

    // Apply effect
    const msgEl = document.getElementById('strategy-result-msg');
    let msg = '';

    if (typeData.heal) {
      const actual = Math.min(typeData.heal, state.playerMaxHP - state.playerHP);
      state.playerHP = Math.min(state.playerMaxHP, state.playerHP + typeData.heal);
      msg += `HP +${typeData.heal}（現在: ${state.playerHP}）`;
    }
    if (typeData.charges) {
      state.bonusCharges = (state.bonusCharges || 0) + typeData.charges;
      msg += (msg ? '　' : '') + `召喚符 +${typeData.charges}`;
    }
    if (typeData.damage) {
      state.playerHP = Math.max(1, state.playerHP - typeData.damage);
      state.totalDamageTaken += typeData.damage;
      msg += (msg ? '　' : '') + `${typeData.damage}ダメージ（残HP: ${state.playerHP}）`;
    }
    if (typeData.guaranteedSSR) {
      state.guaranteedSSR = true;
      msg += (msg ? '　' : '') + '⚡ 次の召喚はSSR以上確定！';
    }

    msgEl.textContent = msg;

    // Reveal other cards after brief delay
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        if (i !== idx) {
          const otherCard = document.getElementById('scroll-' + i);
          otherCard.classList.add('revealed');
          const otherBack = document.getElementById('scroll-back-' + i);
          const otherType = SCROLL_TYPES[state.scrollCards[i]];
          otherBack.innerHTML = `
            <div class="scroll-result-name ${otherType.resultClass}" style="opacity:0.5">${otherType.name}</div>
            <div class="scroll-result-effect" style="opacity:0.4">${otherType.desc}</div>
          `;
        }
      }
      // Show next button
      document.getElementById('strategy-next-btn-wrap').classList.remove('hidden');
    }, 700);
  }

  // ── Battle ─────────────────────────────────
  function goToBattle() {
    const floor = FLOORS[state.currentFloor];
    state.charges = state.baseCharges + (state.bonusCharges || 0);

    renderBattleUI();
    showScreen('battle');
  }

  function renderBattleUI() {
    const floor = FLOORS[state.currentFloor];
    document.getElementById('battle-enemy-name').textContent = state.enemy.name;
    document.getElementById('battle-floor-tag').textContent =
      `${floor.label} 「${floor.name}」`;

    updateBattleHP();
    updateChargeOrbs();
    updateStatusBars();

    // Lu Bu counter
    updateLubuCounter();

    // Guaranteed summon
    document.getElementById('guaranteed-summon-tag').classList.toggle('hidden', !state.guaranteedSSR);
    document.getElementById('double-next-tag').classList.toggle('hidden', !state.doubleNextSummon);

    // Clear log
    document.getElementById('battle-log').innerHTML = '';
    addLog(`${floor.label} 「${floor.name}」 開始！`, 'log-system');
    addLog(`敵: ${state.enemy.name}  HP${state.enemy.hp}`, 'log-system');
  }

  function updateBattleHP() {
    const ePct = Math.max(0, state.enemy.hp / state.enemy.maxHP * 100);
    document.getElementById('battle-enemy-hp-bar').style.width = ePct + '%';
    document.getElementById('battle-enemy-hp-text').textContent =
      `${Math.max(0, state.enemy.hp)} / ${state.enemy.maxHP}`;

    const pPct = Math.max(0, state.playerHP / state.playerMaxHP * 100);
    const pBar = document.getElementById('battle-player-hp-bar');
    pBar.style.width = pPct + '%';
    pBar.className = 'hp-bar-fill player-hp';
    if (pPct < 30) pBar.classList.add('critical');
    else if (pPct < 50) pBar.classList.add('low');
    document.getElementById('battle-player-hp-text').textContent =
      `${Math.max(0, state.playerHP)} / ${state.playerMaxHP}`;
  }

  function updateChargeOrbs() {
    const container = document.getElementById('charge-orbs');
    container.innerHTML = '';
    const total = state.charges;
    for (let i = 0; i < total; i++) {
      const orb = document.createElement('div');
      orb.className = 'charge-orb';
      container.appendChild(orb);
    }
    // Check summon button
    const btn = document.getElementById('summon-btn');
    btn.disabled = state.charges <= 0;
  }

  function updateStatusBars() {
    const bar = document.getElementById('enemy-status-bar');
    bar.innerHTML = '';
    if (state.enemy.burnTurns > 0) {
      bar.innerHTML += `<div class="status-tag status-burn">🔥 炎上 ${state.enemy.burnTurns}T (${state.enemy.burnDmg}/T)</div>`;
    }
    if (state.enemy.atk < FLOORS[state.currentFloor].atk) {
      const diff = FLOORS[state.currentFloor].atk - state.enemy.atk;
      bar.innerHTML += `<div class="status-tag status-atk-down">↓ ATK-${diff}</div>`;
    }
    if (state.enemy.skipAttacks > 0) {
      bar.innerHTML += `<div class="status-tag status-skip">💤 封印 ${state.enemy.skipAttacks}T</div>`;
    }
  }

  function updateLubuCounter() {
    const warn = document.getElementById('lubu-warning');
    if (state.lubuCount > 0) {
      warn.classList.remove('hidden');
      document.getElementById('lubu-count').textContent = state.lubuCount;
    } else {
      warn.classList.add('hidden');
    }
  }

  function addLog(text, cls) {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + (cls || '');
    entry.textContent = text;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    // Keep only last 8
    while (log.children.length > 8) {
      log.removeChild(log.firstChild);
    }
  }

  // ── Summon ─────────────────────────────────
  function doSummon() {
    if (state.charges <= 0) return;
    state.charges--;
    updateChargeOrbs();

    // Disable button during animation
    document.getElementById('summon-btn').disabled = true;

    const general = rollGacha(state.guaranteedSSR);
    if (state.guaranteedSSR) state.guaranteedSSR = false;

    // Update guaranteed display
    document.getElementById('guaranteed-summon-tag').classList.add('hidden');

    // Show summon animation
    showSummonAnimation(general, () => {
      // Animation done callback — apply effect & enemy attack
      applySummonEffect(general);
    });
  }

  function showSummonAnimation(general, callback) {
    const overlay = document.getElementById('summon-overlay');
    const seal = document.getElementById('summon-seal');
    const rays = document.getElementById('summon-rays');
    const card = document.getElementById('general-card-reveal');
    const hint = document.getElementById('summon-tap-hint');

    // Reset
    seal.style.display = 'flex';
    rays.classList.remove('active');
    card.classList.remove('show');
    card.className = 'general-card-reveal';

    // Set rarity color on seal
    seal.style.borderColor = rarityColor(general.rarity);
    seal.style.color = rarityColor(general.rarity);
    seal.style.boxShadow = `0 0 30px ${rarityColor(general.rarity)}88`;

    // Rarity-based ray style
    const rarityGlowMap = {
      N: 'rgba(136,136,136,0.3)',
      R: 'rgba(76,175,80,0.5)',
      SR: 'rgba(33,150,243,0.5)',
      SSR: 'rgba(156,39,176,0.6)',
      UR: 'rgba(255,215,0,0.8)',
    };
    rays.style.background = `radial-gradient(circle, ${rarityGlowMap[general.rarity]} 0%, transparent 70%)`;

    overlay.classList.add('active');
    hint.textContent = '...';

    // Spin for 1s, then crack open
    setTimeout(() => {
      seal.style.display = 'none';
      rays.classList.add('active');

      // Set up card
      card.className = `general-card-reveal rarity-${general.rarity.toLowerCase()}`;
      document.getElementById('reveal-rarity-badge').textContent = general.rarity;
      document.getElementById('reveal-name').textContent = general.name;
      document.getElementById('reveal-atk').textContent = general.atk;
      document.getElementById('reveal-effect').textContent =
        `【${general.effectName}】${general.effectDesc}`;
      card.classList.add('show');

      hint.textContent = 'タップで続ける';

      // Tap to close
      const close = () => {
        overlay.classList.remove('active');
        overlay.removeEventListener('click', close);
        callback();
      };
      setTimeout(() => {
        overlay.addEventListener('click', close);
      }, 400);
    }, 1000);
  }

  function applySummonEffect(general) {
    // Track
    state.floorGenerals.push(general.id);
    if (!state.generalsMetThisRun.includes(general.id)) {
      state.generalsMetThisRun.push(general.id);
    }
    state.generalsCount++;

    // Add to save (collection)
    if (!save.generalsMet.includes(general.id)) {
      save.generalsMet.push(general.id);
      addDestinyXP(5); // New general found
    }

    // For Jiang Wei: capture last general before updating
    const prevGeneral = state.lastGeneral ? { ...state.lastGeneral } : null;
    state.lastGeneral = general;

    let damage = general.atk;
    let log = `【${general.name} (${general.rarity})】`;
    let extraEffects = [];
    let healPlayer = 0;
    let selfDamage = 0;
    let addCharge = 0;
    let skipNextEnemyAtk = false;
    let isMiss = false;
    let isBetrayal = false;

    // Double next (Pang Tong effect active)
    const pangTongActive = state.doubleNextSummon;
    if (pangTongActive) {
      state.doubleNextSummon = false;
      document.getElementById('double-next-tag').classList.add('hidden');
    }

    // ── Apply specific effects ──────────────

    switch (general.id) {

      // UR
      case 'lubu': {
        state.lubuCount++;
        updateLubuCounter();
        if (state.lubuCount >= 3) {
          // Betrayal!
          isBetrayal = true;
          damage = 0;
          selfDamage = 50;
          log += '【裏切り！】呂布が刃を向けた！';
          triggerBetrayalEffect();
        } else {
          log += '【飛将】最強の一撃！';
        }
        break;
      }

      case 'guanyu': {
        const enemyHPPct = state.enemy.hp / state.enemy.maxHP;
        if (enemyHPPct < 0.20) {
          damage = 0;
          log += '【義】敵のHPが少ない。義のため攻撃を拒む。';
          extraEffects.push('関羽は剣を収めた');
        } else {
          log += '【義】渾身の一撃！';
        }
        break;
      }

      case 'zhugeliang': {
        state.zhugeRevealNextFloor = true;
        log += '【天命】次の軍議では全ての竹簡が見通せる。';
        break;
      }

      case 'diaochan': {
        state.enemy.skipAttacks = (state.enemy.skipAttacks || 0) + 2;
        log += '【傾国】美人計成功！敵の攻撃を2回封印。';
        updateStatusBars();
        break;
      }

      case 'caocao': {
        const steal = Math.floor(state.enemy.hp * 0.10);
        healPlayer = steal;
        log += `【覇道】敵HP${steal}を吸収！`;
        break;
      }

      // SSR
      case 'zhaoyun': {
        damage += 20;
        log += '【一騎当千】追加ダメージ+20！';
        break;
      }

      case 'zhangfei': {
        log += '【万夫不当】豪快な大振り！';
        if (Math.random() < 0.20) {
          selfDamage = 10;
          log += ' 自陣にも10ダメージ...';
        }
        break;
      }

      case 'zhouyu': {
        state.enemy.burnTurns = Math.max(state.enemy.burnTurns, 1);
        state.enemy.burnDmg = Math.max(state.enemy.burnDmg, 10);
        log += '【業火】敵を炎上させた！次ターンに追加10ダメージ。';
        updateStatusBars();
        break;
      }

      case 'simayi': {
        state.enemy.atk = Math.max(0, state.enemy.atk - 5);
        log += `【隠忍】敵ATKを5削減。（現ATK: ${state.enemy.atk}）`;
        updateStatusBars();
        break;
      }

      case 'machao': {
        if (Math.random() < 0.30) {
          damage *= 2;
          log += '【神威】突撃！ダメージ2倍！';
        } else {
          log += '【神威】突撃（発動せず）';
        }
        break;
      }

      case 'huangzhong': {
        if (Math.random() < 0.40) {
          damage *= 2;
          log += '【百歩穿楊】クリティカル！ダメージ2倍！';
        } else {
          log += '【百歩穿楊】（クリティカルせず）';
        }
        break;
      }

      case 'luxun': {
        state.enemy.burnTurns = Math.max(state.enemy.burnTurns, 2);
        state.enemy.burnDmg = Math.max(state.enemy.burnDmg, 15);
        log += '【火計】2ターン炎上！計15ダメージ。';
        updateStatusBars();
        break;
      }

      case 'lumeng': {
        // Ignores enemy defense/buffs - in this game, just deal full damage always
        log += '【白衣渡江】敵の防御を無視！';
        break;
      }

      // SR
      case 'liubei': {
        healPlayer = 20;
        log += '【仁】仁政。HP20回復！';
        break;
      }

      case 'sunquan': {
        state.reducedNextEnemyAtk = true;
        log += '【守成】次の敵攻撃を50%軽減！';
        break;
      }

      case 'huanggai': {
        selfDamage = 15;
        log += '【苦肉】自ら傷を負い、敵を崩す！';
        break;
      }

      case 'xiahoudum': {
        const hpPct = state.playerHP / state.playerMaxHP;
        if (hpPct < 0.50) {
          damage *= 2;
          log += '【隻眼】HP半分以下！ATK2倍！';
        } else {
          log += '【隻眼】（条件未達）';
        }
        break;
      }

      case 'zhangliao': {
        if (Math.random() < 0.30) {
          // Enemy flees
          log += '【威震】敵が恐れをなして逃走！即時勝利！';
          addLog(log, 'log-special');
          state.fleedAlready = true;
          // Kill enemy with minimal reward
          state.enemy.hp = 0;
          updateBattleHP();
          setTimeout(() => endBattleVictory(true), 800);
          writeSave(save);
          return;
        } else {
          log += '【威震】（逃走せず）';
        }
        break;
      }

      case 'ganning': {
        if (state.isFirstSummon) {
          damage += 30;
          log += '【奇襲】初撃に+30ボーナス！';
        } else {
          log += '【奇襲】（初撃でないため効果なし）';
        }
        break;
      }

      case 'pangtong': {
        state.doubleNextSummon = true;
        document.getElementById('double-next-tag').classList.remove('hidden');
        log += '【連環】次の召喚のダメージが2倍になる！';
        break;
      }

      case 'jiangwei': {
        // Copy previous general's effect
        if (prevGeneral) {
          log += `【継志】${prevGeneral.name}の効果をコピー！`;
          // Re-apply prev general effect (limited)
          const copyDmg = applyJiangWeiCopy(prevGeneral, state);
          if (copyDmg > 0) damage += copyDmg;
        } else {
          log += '【継志】（コピーする前の武将がいない）';
        }
        break;
      }

      case 'dianwei': {
        const hpLow = state.playerHP <= 30;
        if (hpLow) {
          damage *= 3;
          log += '【古之悪来】HP30以下！ATK3倍！！';
        } else {
          log += '【古之悪来】（条件未達）';
        }
        break;
      }

      case 'taishici': {
        damage = 50; // override
        log += '【義勇】必中！固定50ダメージ！';
        break;
      }

      // R
      case 'weiyan': {
        if (Math.random() < 0.05) {
          isBetrayal = true;
          selfDamage = 20;
          damage = 0;
          log += '【謀反の気】魏延が謀反！自陣に20ダメージ！';
          triggerBetrayalEffect();
        } else {
          log += '【謀反の気】（謀反せず）';
        }
        break;
      }

      case 'xushu': {
        healPlayer = 10;
        log += '【孝義】HP10回復！';
        break;
      }

      case 'menghuo': {
        if (Math.random() < 0.50) {
          isMiss = true;
          damage = 0;
          log += '【蛮勇】攻撃が外れた！（50%）';
        } else {
          log += '【蛮勇】攻撃命中！';
        }
        break;
      }

      case 'zhurong': {
        state.enemy.burnTurns = Math.max(state.enemy.burnTurns, 2);
        state.enemy.burnDmg = Math.max(state.enemy.burnDmg, 5);
        log += '【炎術】2ターン炎上5ダメージ！';
        updateStatusBars();
        break;
      }

      case 'zhanghong': {
        healPlayer = 15;
        log += '【謀略】HP15回復！';
        break;
      }

      case 'chengyu': {
        addCharge = 1;
        log += '【策謀】召喚符+1！';
        break;
      }

      case 'yujin': {
        state.enemy.atk = Math.max(0, state.enemy.atk - 3);
        log += `【威慑】敵ATK-3。（現ATK: ${state.enemy.atk}）`;
        updateStatusBars();
        break;
      }

      case 'yuejin': {
        skipNextEnemyAtk = true;
        log += '【速攻】素早い攻撃で敵の反撃を封じた！';
        break;
      }

      case 'lidiian': {
        healPlayer = 5;
        log += '【治癒】HP5回復。';
        break;
      }

      case 'masu': {
        if (Math.random() < 0.40) {
          state.masuExtraBad = true;
          log += '【失街亭】次の軍議で凶カードが増える...';
        } else {
          log += '【失街亭】（失敗せず）';
        }
        break;
      }

      // N
      case 'sanzoku': {
        selfDamage = 5;
        damage = general.atk;
        log += '【略奪】山賊に5HP奪われた！';
        break;
      }

      case 'ryumin': {
        healPlayer = 5;
        log += '【感謝】流民の感謝でHP5回復。';
        break;
      }

      case 'shokunin': {
        healPlayer = 10;
        addCharge = 1;
        log += '【行商】HP10回復＋召喚符+1！';
        break;
      }

      case 'uranaishi': {
        state.oracleRevealNextFloor = true;
        log += '【占術】次の軍議で1枚だけ竹簡が見える。';
        break;
      }

      case 'toubouhe': {
        if (Math.random() < 0.50) {
          isMiss = true;
          damage = 0;
          log += '【逃走】逃亡兵が逃げた！（何もせず）';
        } else {
          log += '【逃走】逃げずに戦った！';
        }
        break;
      }

      default: {
        // wenchou, yanliang, kiinan_a, kiinan_b, nouhei_a, nouhei_b, giyuuhei
        log += '（特殊効果なし）';
        break;
      }
    }

    // Apply Pang Tong double AFTER all effects
    if (pangTongActive && !isMiss && !isBetrayal) {
      damage *= 2;
      log += ' [龐統の連環: ダメージ2倍！]';
    }

    // Apply first-summon flag update
    state.isFirstSummon = false;

    // Apply heal
    if (healPlayer > 0) {
      state.playerHP = Math.min(state.playerMaxHP, state.playerHP + healPlayer);
      spawnFloater(healPlayer, 'heal', false);
    }

    // Apply self damage
    if (selfDamage > 0) {
      state.playerHP = Math.max(0, state.playerHP - selfDamage);
      state.totalDamageTaken += selfDamage;
      state.floorDmgTaken += selfDamage;
      spawnFloater(selfDamage, 'player', false);
      if (isBetrayal) {
        spawnFloater('裏切り！', 'betrayal', false);
      }
    }

    // Apply charge add
    if (addCharge > 0) {
      state.charges += addCharge;
      updateChargeOrbs();
    }

    // Deal damage to enemy
    if (damage > 0) {
      state.enemy.hp -= damage;
      state.totalDamageDealt += damage;
      state.floorDmgDealt += damage;
      const isHuge = damage >= 80;
      spawnFloater(damage, 'enemy', isHuge);
    }

    addLog(log, damage > 50 ? 'log-special' : 'log-dmg');

    // Update HP bars
    updateBattleHP();
    updateStatusBars();

    // Check player death
    if (state.playerHP <= 0) {
      setTimeout(() => endBattleDefeat(), 600);
      writeSave(save);
      return;
    }

    // Check enemy death
    if (state.enemy.hp <= 0) {
      setTimeout(() => endBattleVictory(false), 600);
      writeSave(save);
      return;
    }

    // Enemy attack phase (unless skipped)
    const shouldSkipEnemy = skipNextEnemyAtk || state.enemy.skipAttacks > 0;
    if (state.enemy.skipAttacks > 0) {
      state.enemy.skipAttacks--;
    }

    if (!shouldSkipEnemy) {
      setTimeout(() => enemyAttackPhase(), 400);
    } else {
      // Burn tick even if attack skipped
      setTimeout(() => {
        processBurnTick();
        updateBattleHP();
        updateStatusBars();
        enableSummonIfCharges();
      }, 400);
    }

    writeSave(save);
  }

  function applyJiangWeiCopy(prevG, st) {
    // Simplified copy of previous general — only damage bonus
    switch (prevG.id) {
      case 'zhaoyun': return 20;
      case 'zhouyu': {
        st.enemy.burnTurns = Math.max(st.enemy.burnTurns, 1);
        st.enemy.burnDmg = Math.max(st.enemy.burnDmg, 10);
        return 0;
      }
      case 'simayi': {
        st.enemy.atk = Math.max(0, st.enemy.atk - 5);
        return 0;
      }
      case 'diaochan': {
        st.enemy.skipAttacks = (st.enemy.skipAttacks || 0) + 2;
        return 0;
      }
      case 'liubei': {
        st.playerHP = Math.min(st.playerMaxHP, st.playerHP + 20);
        spawnFloater(20, 'heal', false);
        return 0;
      }
      default: return Math.floor(prevG.atk * 0.5);
    }
  }

  function enemyAttackPhase() {
    let atkDmg = state.enemy.atk + rand(-3, 3);
    atkDmg = Math.max(1, atkDmg);

    // Reduced attack (Sun Quan)
    if (state.reducedNextEnemyAtk) {
      atkDmg = Math.floor(atkDmg * 0.5);
      state.reducedNextEnemyAtk = false;
      addLog(`敵の攻撃！（半減）→ ${atkDmg}ダメージ`, 'log-dmg');
    } else {
      addLog(`${state.enemy.name}の攻撃！→ ${atkDmg}ダメージ`, 'log-dmg');
    }

    state.playerHP = Math.max(0, state.playerHP - atkDmg);
    state.totalDamageTaken += atkDmg;
    state.floorDmgTaken += atkDmg;

    spawnFloater(atkDmg, 'player', false);
    updateBattleHP();

    // Screen shake on big hits
    if (atkDmg >= 15) {
      document.getElementById('app').classList.add('shake');
      setTimeout(() => document.getElementById('app').classList.remove('shake'), 300);
    }

    // Burn tick
    processBurnTick();
    updateBattleHP();
    updateStatusBars();

    // Check player death
    if (state.playerHP <= 0) {
      setTimeout(() => endBattleDefeat(), 500);
      return;
    }

    enableSummonIfCharges();
  }

  function processBurnTick() {
    if (state.enemy.burnTurns > 0 && state.enemy.hp > 0) {
      const burnDmg = state.enemy.burnDmg;
      state.enemy.hp -= burnDmg;
      state.totalDamageDealt += burnDmg;
      state.floorDmgDealt += burnDmg;
      state.enemy.burnTurns--;
      if (state.enemy.burnTurns === 0) state.enemy.burnDmg = 0;
      addLog(`🔥 炎上ダメージ ${burnDmg}！`, 'log-special');
      spawnFloater(burnDmg, 'enemy', false);

      if (state.enemy.hp <= 0) {
        setTimeout(() => endBattleVictory(false), 400);
      }
    }
  }

  function enableSummonIfCharges() {
    if (state.charges <= 0) {
      // Out of charges — one final enemy attack then proceed (badly hurt)
      document.getElementById('summon-btn').disabled = true;
      addLog('召喚符が尽きた！敵の最終攻撃...', 'log-system');
      setTimeout(() => {
        // One more enemy hit
        let finalDmg = state.enemy.atk + rand(-2, 2);
        finalDmg = Math.max(1, finalDmg);
        state.playerHP = Math.max(0, state.playerHP - finalDmg);
        state.totalDamageTaken += finalDmg;
        addLog(`最終攻撃: ${finalDmg}ダメージ！`, 'log-dmg');
        spawnFloater(finalDmg, 'player', false);
        updateBattleHP();

        if (state.playerHP <= 0) {
          setTimeout(() => endBattleDefeat(), 500);
        } else {
          // Proceed regardless (draw/partial defeat)
          addLog('満身創痍で撤退... 次の関へ', 'log-system');
          setTimeout(() => endBattleVictory(false, true), 800);
        }
      }, 800);
    } else {
      document.getElementById('summon-btn').disabled = false;
    }
  }

  function triggerBetrayalEffect() {
    // Red flash
    const flash = document.createElement('div');
    flash.className = 'betrayal-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);

    // Screen shake
    document.getElementById('app').classList.add('shake');
    setTimeout(() => document.getElementById('app').classList.remove('shake'), 300);
  }

  // ── Floaters ───────────────────────────────
  function spawnFloater(text, type, huge) {
    const mid = document.getElementById('battle-mid');
    const el = document.createElement('div');
    el.className = 'damage-floater';

    if (huge) el.classList.add('floater-huge');
    else if (type === 'enemy') el.classList.add('floater-enemy');
    else if (type === 'player') el.classList.add('floater-player');
    else if (type === 'heal') el.classList.add('floater-heal');
    else if (type === 'betrayal') el.classList.add('floater-betrayal');

    const dmgText = type === 'enemy' ? `-${text}` :
                    type === 'heal' ? `+${text}HP` :
                    type === 'betrayal' ? text :
                    `-${text}`;
    el.textContent = dmgText;

    const rect = mid.getBoundingClientRect();
    const x = rand(30, rect.width - 60);
    const y = rand(rect.height * 0.2, rect.height * 0.7);
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    mid.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }

  // ── Battle End ─────────────────────────────
  function endBattleVictory(enemyFled, noCharges) {
    const floor = FLOORS[state.currentFloor];

    // Add destiny XP for floor clear
    addDestinyXP(10 + (state.currentFloor * 2));

    // Update best floor
    if ((state.currentFloor + 1) > (save.bestFloor || 0)) {
      save.bestFloor = state.currentFloor + 1;
    }
    writeSave(save);

    showFloorClear(floor, enemyFled, noCharges);
  }

  function endBattleDefeat() {
    save.bestFloor = Math.max(save.bestFloor || 0, state.currentFloor);
    writeSave(save);
    showGameOver();
  }

  // ── Floor Clear Screen ─────────────────────
  function showFloorClear(floor, enemyFled, noCharges) {
    document.getElementById('clear-floor-name').textContent =
      `${floor.label} 「${floor.name}」 攻略`;

    // Stats panel
    const statsEl = document.getElementById('clear-stats-panel');
    let extraNote = '';
    if (enemyFled) extraNote = '<div class="stat-row"><span class="stat-label">備考</span><span class="stat-value" style="color:#ff9800">敵が逃走（報酬減）</span></div>';
    if (noCharges) extraNote = '<div class="stat-row"><span class="stat-label">備考</span><span class="stat-value" style="color:#ff9800">召喚符切れ（満身創痍）</span></div>';

    statsEl.innerHTML = `
      <div class="stats-title">戦況報告</div>
      <div class="stat-row">
        <span class="stat-label">与えたダメージ</span>
        <span class="stat-value">${state.floorDmgDealt}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">受けたダメージ</span>
        <span class="stat-value">${state.floorDmgTaken}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">現在HP</span>
        <span class="stat-value">${state.playerHP} / ${state.playerMaxHP}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">召喚した武将数</span>
        <span class="stat-value">${state.floorGenerals.length}</span>
      </div>
      ${extraNote}
    `;

    // New generals
    const newGenerals = state.floorGenerals
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .map(id => GENERAL_MAP[id])
      .filter(Boolean);

    const labelEl = document.getElementById('clear-new-generals-label');
    const listEl = document.getElementById('clear-generals-list');

    if (newGenerals.length > 0) {
      labelEl.textContent = '今回の武将';
      listEl.innerHTML = newGenerals.map(g => `
        <div class="clear-general-chip cc-rarity-${g.rarity.toLowerCase()}"
             style="border-color:${rarityColor(g.rarity)};">
          ${g.name}
          <span style="font-size:10px;opacity:0.7;">(${g.rarity})</span>
        </div>
      `).join('');
    } else {
      labelEl.textContent = '';
      listEl.innerHTML = '';
    }

    // Next button text
    const isLast = state.currentFloor >= 4;
    document.getElementById('clear-next-btn').textContent =
      isLast ? '最終決戦へ！' : '次の関へ';

    showScreen('floor-clear');
  }

  function nextFloor() {
    const nextIdx = state.currentFloor + 1;
    if (nextIdx >= FLOORS.length) {
      // Victory!
      showVictory();
    } else {
      loadFloor(nextIdx);
    }
  }

  // ── Game Over ──────────────────────────────
  function showGameOver() {
    const gameOverQuotes = [
      '志半ばにして倒れた。しかし、武将たちの魂は永遠に...',
      '乱世は誰にも等しく牙を剥く。',
      '敗れても、また立ち上がれる。それが武将の魂。',
      '天命はまだ終わっていない。再び立て！',
    ];

    document.getElementById('game-over-quote').textContent =
      gameOverQuotes[Math.floor(Math.random() * gameOverQuotes.length)];

    document.getElementById('game-over-stats').innerHTML = buildRunSummaryHTML();
    showScreen('game-over');
  }

  // ── Victory ───────────────────────────────
  function showVictory() {
    save.totalWins++;
    addDestinyXP(30);
    writeSave(save);

    const victoryQuotes = [
      '五つの関を制し、天命を掴んだ！乱世は終わりを告げる。',
      '天下に名を刻んだ。武将たちの魂が貴方を支えた！',
      '勝利！しかし、真の平和への道はまだ長い...',
    ];

    document.getElementById('victory-quote').textContent =
      victoryQuotes[Math.floor(Math.random() * victoryQuotes.length)];

    document.getElementById('victory-stats').innerHTML = buildRunSummaryHTML();
    showScreen('victory');
  }

  function buildRunSummaryHTML() {
    const uniqMet = state.generalsMetThisRun.length;
    return `
      <div class="stats-title">出陣記録</div>
      <div class="stat-row">
        <span class="stat-label">到達した関</span>
        <span class="stat-value">${FLOORS[state.currentFloor].label}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">総与ダメージ</span>
        <span class="stat-value">${state.totalDamageDealt}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">総受ダメージ</span>
        <span class="stat-value">${state.totalDamageTaken}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">召喚した武将</span>
        <span class="stat-value">${state.generalsCount}回</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">出会った武将（種）</span>
        <span class="stat-value">${uniqMet}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">図鑑登録数</span>
        <span class="stat-value">${save.generalsMet.length} / ${GENERALS.length}</span>
      </div>
    `;
  }

  // ── Title ──────────────────────────────────
  function showTitle() {
    save = getOrCreateSave();
    updateTitleUI();
    showScreen('title');
  }

  // ── Collection ─────────────────────────────
  let currentFilter = 'all';

  function showCollection() {
    save = getOrCreateSave();
    renderCollectionGrid('all');
    document.getElementById('collection-progress').textContent =
      `図鑑登録: ${save.generalsMet.length} / ${GENERALS.length} (${Math.round(save.generalsMet.length / GENERALS.length * 100)}%)`;
    showScreen('collection');
  }

  function filterCollection(rarity, btn) {
    currentFilter = rarity;
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCollectionGrid(rarity);
  }

  function renderCollectionGrid(rarity) {
    const grid = document.getElementById('collection-grid');
    grid.innerHTML = '';

    const generals = rarity === 'all'
      ? GENERALS
      : GENERALS.filter(g => g.rarity === rarity);

    generals.forEach(g => {
      const met = save.generalsMet.includes(g.id);
      const card = document.createElement('div');
      card.className = `collection-card rarity-${g.rarity.toLowerCase()} ${met ? 'met' : ''}`;

      if (met) {
        card.style.color = rarityColor(g.rarity);
        card.innerHTML = `
          <div class="cc-rarity cc-rarity-${g.rarity.toLowerCase()}">${g.rarity}</div>
          <div class="cc-name">${g.name}</div>
          <div class="cc-atk">ATK ${g.atk}</div>
          <div class="cc-effect">【${g.effectName}】</div>
        `;
      } else {
        card.innerHTML = `
          <div class="cc-rarity" style="background:#333;color:#555;">${g.rarity}</div>
          <div class="cc-unknown">？</div>
          <div class="cc-unknown-name">???</div>
        `;
      }
      grid.appendChild(card);
    });
  }

  // ── Destiny XP ─────────────────────────────
  function addDestinyXP(amount) {
    save.destinyXP = Math.min(100, (save.destinyXP || 0) + amount);
    writeSave(save);
  }

  // ── Public API ─────────────────────────────
  return {
    init,
    startRun,
    showTitle,
    showCollection,
    filterCollection,
    goToStrategy,
    revealScroll,
    goToBattle,
    doSummon,
    nextFloor,
  };

})();

// ── Bootstrap ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
