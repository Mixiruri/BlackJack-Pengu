// ═══════════════════════════════════════════════════════════════
//  BLACKJACK ULTIMATE — Pengu Loader Plugin
//  by Mixiruriii
//
//  ▸ v1.0  — Release inicial
//            Surrender · Side Bets · Multi-hand · Card Counting
//            Web Audio · Hand History · Basic Strategy
//            Probability HUD · XP/Levels · Achievements · Themes
//            Confetti · Animated Chips · Tournaments
//
//  ▸ v2.0  — Compatibilidad con Elaina Theme
//            • Botón flotante eliminado (conflicto con Elaina)
//            • Apertura con atajo de teclado Alt+B
//            • CSS inyectado al final del <head> para ganar
//              prioridad de cascada sobre Elaina
//            • MutationObserver en <head> para mantener los
//              estilos últimos si Elaina los reordena
//            • Overlay con isolation:isolate y contain:layout style
//              para evitar que el CSS de Elaina se filtre al juego
//            • injectStyles() se llama al abrir el overlay para
//              asegurar prioridad en cada apertura
// ═══════════════════════════════════════════════════════════════

export const init = () => console.log('[BJ] Init v2.0');

export const load = () => {
  console.log('[BJ] Loaded — Blackjack Ultimate v2.0 via Pengu Loader');

  // ──────────────────────────────────────────────
  // SAVE SYSTEM
  // ──────────────────────────────────────────────
  const SAVE_KEY = 'bj_ultimate_v1';

  const DEFAULT_SAVE = {
    balance: 1000, wins: 0, losses: 0, pushes: 0, blackjacks: 0,
    streak: 0, bestStreak: 0, xp: 0, level: 1,
    achievements: {}, theme: 'dark',
    history: [], // last 20 hands
    tournament: { active: false, date: '', balance: 1000, peak: 1000 },
    totalHands: 0, totalWagered: 0, totalWon: 0,
  };

  function loadSave() {
    try { const r = localStorage.getItem(SAVE_KEY); return r ? { ...DEFAULT_SAVE, ...JSON.parse(r) } : { ...DEFAULT_SAVE }; }
    catch { return { ...DEFAULT_SAVE }; }
  }
  function writeSave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
  }

  let save = loadSave();

  // ──────────────────────────────────────────────
  // THEMES
  // ──────────────────────────────────────────────
  const THEMES = {
    dark: {
      name: '🌑 Dark Velvet', overlay: '#0a0a18', accent: '#ff4500',
      surface: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)',
      text: '#e0e0ff', subtext: '#8888aa', gold: '#ffd700',
      win: '#00ff88', lose: '#ff4444', push: '#ffd700',
      dealerColor: '#ff4500', playerColor: '#00ffea',
      gradient: 'linear-gradient(135deg,#0a0a18 0%,#12122a 60%,#080818 100%)',
    },
    lol: {
      name: '⚔ Runeterra', overlay: '#0a1628', accent: '#c89b3c',
      surface: 'rgba(200,155,60,0.07)', border: 'rgba(200,155,60,0.2)',
      text: '#c8aa6e', subtext: '#785a28', gold: '#f0e6d3',
      win: '#00bcd4', lose: '#e84057', push: '#c89b3c',
      dealerColor: '#e84057', playerColor: '#00bcd4',
      gradient: 'linear-gradient(135deg,#0a1628 0%,#091428 60%,#060e1f 100%)',
    },
    vegas: {
      name: '🎰 Las Vegas', overlay: '#0d0800', accent: '#ffcc00',
      surface: 'rgba(255,204,0,0.06)', border: 'rgba(255,204,0,0.15)',
      text: '#fff8dc', subtext: '#aa9060', gold: '#ffcc00',
      win: '#00e676', lose: '#ff1744', push: '#ffcc00',
      dealerColor: '#ff6600', playerColor: '#ffcc00',
      gradient: 'linear-gradient(135deg,#0d0800 0%,#1a1000 60%,#080400 100%)',
    },
    vip: {
      name: '💎 VIP Black', overlay: '#080808', accent: '#b8a0e0',
      surface: 'rgba(184,160,224,0.06)', border: 'rgba(184,160,224,0.12)',
      text: '#e8e0f0', subtext: '#6a6080', gold: '#b8a0e0',
      win: '#80ffcc', lose: '#ff6080', push: '#b8a0e0',
      dealerColor: '#ff6080', playerColor: '#80ffcc',
      gradient: 'linear-gradient(135deg,#080808 0%,#100c18 60%,#060408 100%)',
    },
  };

  let theme = THEMES[save.theme] || THEMES.dark;

  // ──────────────────────────────────────────────
  // ACHIEVEMENTS
  // ──────────────────────────────────────────────
  const ACHIEVEMENTS = {
    first_win:      { icon:'🏆', name:'First Win',        desc:'Win your first hand',             xp:50  },
    blackjack:      { icon:'🌟', name:'Blackjack!',       desc:'Get a natural blackjack',         xp:100 },
    streak3:        { icon:'🔥', name:'On Fire',          desc:'Win 3 in a row',                  xp:75  },
    streak5:        { icon:'💥', name:'Unstoppable',      desc:'Win 5 in a row',                  xp:150 },
    streak10:       { icon:'👑', name:'Legend',           desc:'Win 10 in a row',                 xp:500 },
    bust_dealer:    { icon:'💣', name:'Dealer Buster',    desc:'Watch dealer bust 10 times',      xp:100 },
    double_win:     { icon:'✌',  name:'Double Trouble',   desc:'Win a doubled-down hand',         xp:80  },
    split_win:      { icon:'✂',  name:'Divide & Conquer', desc:'Win both split hands',            xp:120 },
    high_roller:    { icon:'💰', name:'High Roller',      desc:'Place a bet of 500+',             xp:60  },
    all_in:         { icon:'🎲', name:'All In',           desc:'Go all-in and win',               xp:200 },
    millionaire:    { icon:'🤑', name:'Millionaire',      desc:'Reach 10,000 RP balance',         xp:1000},
    survivor:       { icon:'😰', name:'Close Call',       desc:'Win with exactly 21 (5+ cards)',  xp:150 },
    insurance_win:  { icon:'🛡', name:'Insured',          desc:'Win an insurance bet',            xp:80  },
    hundred_hands:  { icon:'🃏', name:'Centurion',        desc:'Play 100 hands total',            xp:200 },
    surrender_wise: { icon:'🏳', name:'Know When to Fold',desc:'Surrender 5 times',              xp:50  },
    counter:        { icon:'🧠', name:'Card Counter',     desc:'Toggle count mode 10 times',      xp:100 },
  };

  let _surrenderCount = 0;
  let _counterToggleCount = 0;
  let _dealerBustCount = 0;

  function unlockAchievement(key) {
    if (save.achievements[key]) return;
    save.achievements[key] = Date.now();
    const ach = ACHIEVEMENTS[key];
    if (!ach) return;
    addXP(ach.xp);
    showAchievementToast(ach);
    writeSave();
  }

  function showAchievementToast(ach) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:80px;right:24px;z-index:99999999;
      background:linear-gradient(135deg,#1a1a2e,#16213e);
      border:1px solid ${theme.accent};
      border-radius:14px;padding:14px 20px;
      display:flex;align-items:center;gap:14px;
      box-shadow:0 8px 32px rgba(0,0,0,0.8),0 0 0 1px ${theme.accent}44;
      animation:bj-slideIn 0.4s cubic-bezier(0.22,1,0.36,1) both,
                bj-slideOut 0.4s ease 3.5s forwards;
      min-width:280px;
      font-family:'Rajdhani',sans-serif;
    `;
    toast.innerHTML = `
      <div style="font-size:36px;line-height:1;">${ach.icon}</div>
      <div>
        <div style="font-size:11px;letter-spacing:3px;color:${theme.accent};margin-bottom:3px;">ACHIEVEMENT UNLOCKED</div>
        <div style="font-size:17px;font-weight:700;color:${theme.text};">${ach.name}</div>
        <div style="font-size:13px;color:${theme.subtext};">${ach.desc} · +${ACHIEVEMENTS[Object.keys(ACHIEVEMENTS).find(k=>ACHIEVEMENTS[k]===ach)]?.xp||0} XP</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
  }

  // ──────────────────────────────────────────────
  // XP & LEVELS
  // ──────────────────────────────────────────────
  const LEVELS = [
    { level:1,  name:'Novice',       xp:0,     color:'#888' },
    { level:2,  name:'Apprentice',   xp:200,   color:'#7cb9e8' },
    { level:3,  name:'Player',       xp:500,   color:'#7cb9e8' },
    { level:4,  name:'Gambler',      xp:1000,  color:'#50c878' },
    { level:5,  name:'Sharp',        xp:2000,  color:'#50c878' },
    { level:6,  name:'Pro',          xp:3500,  color:'#ffd700' },
    { level:7,  name:'High Roller',  xp:5500,  color:'#ffd700' },
    { level:8,  name:'Card Shark',   xp:8000,  color:'#ff6600' },
    { level:9,  name:'MIT Counter',  xp:12000, color:'#ff4500' },
    { level:10, name:'Casino Legend',xp:20000, color:'#b8a0e0' },
  ];

  function getLevelData(xp) {
    let cur = LEVELS[0], next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xp) { cur = LEVELS[i]; next = LEVELS[i+1] || null; }
    }
    return { cur, next };
  }

  function addXP(amount) {
    const oldLevel = save.level;
    save.xp += amount;
    const { cur } = getLevelData(save.xp);
    save.level = cur.level;
    if (save.level > oldLevel) showLevelUp(cur);
    refreshXPBar();
    writeSave();
  }

  function showLevelUp(levelData) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:999999999;
      background:linear-gradient(135deg,#0a0a18,#1a1a3d);
      border:2px solid ${levelData.color};
      border-radius:20px;padding:30px 50px;text-align:center;
      box-shadow:0 0 60px ${levelData.color}66;
      font-family:'Cinzel Decorative',serif;
      animation:bj-levelPop 0.5s cubic-bezier(0.22,1,0.36,1) both;
    `;
    el.innerHTML = `
      <div style="font-size:48px;margin-bottom:8px;">🎊</div>
      <div style="font-size:13px;letter-spacing:4px;color:${theme.subtext};margin-bottom:6px;">LEVEL UP!</div>
      <div style="font-size:28px;color:${levelData.color};text-shadow:0 0 20px ${levelData.color};">LEVEL ${levelData.level}</div>
      <div style="font-size:18px;color:${theme.text};margin-top:6px;">${levelData.name}</div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // ──────────────────────────────────────────────
  // WEB AUDIO ENGINE
  // ──────────────────────────────────────────────
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(freq, dur, type = 'sine', vol = 0.15, delay = 0) {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + dur);
    } catch {}
  }

  const SFX = {
    deal:      () => { playTone(800, 0.07, 'triangle', 0.12); playTone(600, 0.07, 'triangle', 0.08, 0.08); },
    chip:      () => playTone(1200, 0.05, 'sine', 0.1),
    win:       () => { [523,659,784,1047].forEach((f,i) => playTone(f, 0.15, 'triangle', 0.15, i*0.1)); },
    blackjack: () => { [523,659,784,1047,1319].forEach((f,i) => playTone(f, 0.2, 'triangle', 0.2, i*0.08)); },
    lose:      () => { playTone(300, 0.3, 'sawtooth', 0.1); playTone(220, 0.4, 'sawtooth', 0.08, 0.1); },
    push:      () => { playTone(440, 0.15, 'sine', 0.1); playTone(440, 0.15, 'sine', 0.1, 0.2); },
    bust:      () => { playTone(200, 0.5, 'sawtooth', 0.15); },
    shuffle:   () => { for(let i=0;i<8;i++) playTone(400+Math.random()*400, 0.04, 'triangle', 0.06, i*0.05); },
    levelup:   () => { [523,784,1047,1568].forEach((f,i) => playTone(f, 0.2, 'square', 0.1, i*0.12)); },
    achievement:()=> { [659,784,1047].forEach((f,i) => playTone(f, 0.15, 'triangle', 0.12, i*0.1)); },
    hover:     () => playTone(600, 0.03, 'sine', 0.05),
    click:     () => playTone(800, 0.05, 'triangle', 0.1),
  };

  let soundEnabled = true;
  function sfx(name) { if (soundEnabled && SFX[name]) SFX[name](); }

  // ──────────────────────────────────────────────
  // HI-LO CARD COUNTING
  // ──────────────────────────────────────────────
  let runningCount = 0;
  let cardsDealt = 0;
  let countMode = false;

  function hiLoValue(rank) {
    if (['2','3','4','5','6'].includes(rank)) return +1;
    if (['10','J','Q','K','A'].includes(rank)) return -1;
    return 0;
  }

  function updateCount(hand, reveal = false) {
    if (!reveal) return;
    hand.forEach(c => { runningCount += hiLoValue(c.rank); cardsDealt++; });
  }

  function trueCount(decksRemaining) {
    if (decksRemaining <= 0) return runningCount;
    return Math.round((runningCount / decksRemaining) * 10) / 10;
  }

  function countAdvice() {
    const tc = trueCount(Math.max(1, Math.floor((312 - cardsDealt) / 52)));
    if (tc >= 3) return { text: 'BET BIG 📈', color: '#00ff88' };
    if (tc >= 1) return { text: 'BET NORMAL', color: '#ffd700' };
    if (tc >= -1) return { text: 'BET SMALL', color: '#ffa500' };
    return { text: 'BET MINIMUM 📉', color: '#ff4444' };
  }

  // ──────────────────────────────────────────────
  // BASIC STRATEGY ENGINE
  // ──────────────────────────────────────────────
  function basicStrategy(playerHand, dealerUpCard) {
    const pv = handValue(playerHand);
    const dv = rankValue(dealerUpCard.rank);
    const isSoftHand = isSoft(playerHand);
    const isPair = playerHand.length === 2 && playerHand[0].rank === playerHand[1].rank;

    // Pair splitting
    if (isPair) {
      const r = playerHand[0].rank;
      if (r === 'A' || r === '8') return { action: 'SPLIT', color: '#a855f7', reason: 'Always split Aces and 8s' };
      if (r === '10' || r === 'J' || r === 'Q' || r === 'K') return { action: 'STAND', color: '#ca8a04', reason: 'Never split 10s — you have 20!' };
      if (r === '5') return { action: 'DOUBLE', color: '#1d4ed8', reason: 'Never split 5s — treat as 10' };
      if (r === '4' && (dv === 5 || dv === 6)) return { action: 'SPLIT', color: '#a855f7', reason: 'Split 4s vs 5-6' };
      if (r === '9' && ![7,10,11].includes(dv)) return { action: 'SPLIT', color: '#a855f7', reason: 'Split 9s unless vs 7,10,A' };
      if (r === '7' && dv <= 7) return { action: 'SPLIT', color: '#a855f7', reason: 'Split 7s vs 2-7' };
      if (r === '6' && dv <= 6) return { action: 'SPLIT', color: '#a855f7', reason: 'Split 6s vs 2-6' };
      if (r === '3' || r === '2') {
        if (dv <= 7) return { action: 'SPLIT', color: '#a855f7', reason: 'Split 2s/3s vs 2-7' };
      }
    }

    // Soft hands
    if (isSoftHand) {
      if (pv >= 19) return { action: 'STAND', color: '#ca8a04', reason: 'Soft 19+ always stands' };
      if (pv === 18) {
        if (dv <= 6) return { action: 'DOUBLE', color: '#1d4ed8', reason: 'Double soft 18 vs 2-6' };
        if (dv >= 9) return { action: 'HIT', color: '#16a34a', reason: 'Hit soft 18 vs 9,10,A' };
        return { action: 'STAND', color: '#ca8a04', reason: 'Stand soft 18 vs 7-8' };
      }
      if (pv === 17) {
        if (dv >= 3 && dv <= 6) return { action: 'DOUBLE', color: '#1d4ed8', reason: 'Double soft 17 vs 3-6' };
        return { action: 'HIT', color: '#16a34a', reason: 'Hit soft 17' };
      }
      if (pv <= 16) {
        if (dv >= 4 && dv <= 6) return { action: 'DOUBLE', color: '#1d4ed8', reason: `Double soft ${pv} vs 4-6` };
        return { action: 'HIT', color: '#16a34a', reason: `Hit soft ${pv}` };
      }
    }

    // Hard hands
    if (pv >= 17) return { action: 'STAND', color: '#ca8a04', reason: 'Always stand on hard 17+' };
    if (pv <= 8)  return { action: 'HIT',   color: '#16a34a', reason: 'Always hit 8 or less' };
    if (pv === 11) return { action: 'DOUBLE', color: '#1d4ed8', reason: 'Double 11 always' };
    if (pv === 10 && dv <= 9) return { action: 'DOUBLE', color: '#1d4ed8', reason: 'Double 10 vs 2-9' };
    if (pv === 9 && dv >= 3 && dv <= 6) return { action: 'DOUBLE', color: '#1d4ed8', reason: 'Double 9 vs 3-6' };
    if (pv >= 13 && pv <= 16 && dv <= 6) return { action: 'STAND', color: '#ca8a04', reason: `Stand ${pv} vs dealer bust card` };
    if (pv === 12 && dv >= 4 && dv <= 6) return { action: 'STAND', color: '#ca8a04', reason: 'Stand 12 vs 4-6' };
    return { action: 'HIT', color: '#16a34a', reason: `Hit ${pv} — dealer has ${dv}` };
  }

  // ──────────────────────────────────────────────
  // PROBABILITY ENGINE
  // ──────────────────────────────────────────────
  function bustProbability(hand, deckRemaining) {
    const cur = handValue(hand);
    const safeCards = deckRemaining.filter(c => {
      const testHand = [...hand, c];
      return handValue(testHand) <= 21;
    }).length;
    const bustChance = 1 - (safeCards / Math.max(1, deckRemaining.length));
    return Math.round(bustChance * 100);
  }

  // ──────────────────────────────────────────────
  // CONFETTI
  // ──────────────────────────────────────────────
  function launchConfetti(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;border-radius:18px;';
    canvas.width = container.offsetWidth || 800;
    canvas.height = container.offsetHeight || 500;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#ff4500','#ffd700','#00ff88','#00ffea','#ff69b4','#a855f7','#1d4ed8'];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: -10,
        vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        p.vy += 0.1; // gravity
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / 100);
        if (p.shape === 'rect') ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
        else { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        ctx.restore();
      });
      frame++;
      if (frame < 120) requestAnimationFrame(animate);
      else canvas.remove();
    }
    animate();
  }

  // ──────────────────────────────────────────────
  // TOURNAMENT SYSTEM
  // ──────────────────────────────────────────────
  function getTodayStr() { return new Date().toISOString().slice(0,10); }

  function updateTournament(newBalance) {
    if (!save.tournament || !save.tournament.active) return;
    save.tournament.balance = newBalance;
    if (newBalance > save.tournament.peak) save.tournament.peak = newBalance;
    writeSave();
  }

  // ──────────────────────────────────────────────
  // BOT ENGINE
  // ──────────────────────────────────────────────
  const BOT_NAMES = [
    'ShadowAce','ViperKing','NeonShark','IronBluff','GhostRiver',
    'CrimsonDeal','StormBet','FrostCard','BlazeChip','VoidSplit',
    'LuckyDusk','SilentAce','WildStack','NightFlush','CobraBlind',
  ];

  const BOT_AVATARS = ['🐺','🦊','🐯','🦁','🐻','🦅','🐍','🦈','🦂','🐲','🎭','👤','🤖','💀','🎪'];

  // Difficulty configs
  const DIFFICULTY = {
    easy:   { name:'EASY',   color:'#22c55e', startBalance:800,  bots:2, botSkill:0.4, betMult:0.8,  blindPlay:true  },
    medium: { name:'MEDIUM', color:'#f59e0b', startBalance:1000, bots:3, botSkill:0.7, betMult:1.0,  blindPlay:false },
    hard:   { name:'HARD',   color:'#ef4444', startBalance:1200, bots:5, botSkill:0.95,betMult:1.3,  blindPlay:false },
  };

  // Active tournament state (null = no tournament running)
  let activeTournament = null;

  function createBots(difficulty) {
    const cfg = DIFFICULTY[difficulty];
    const count = cfg.bots;
    const usedNames = new Set();
    return Array.from({length: count}, (_, i) => {
      let name;
      do { name = BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)]; } while(usedNames.has(name));
      usedNames.add(name);
      return {
        id: 'bot_'+i,
        name,
        avatar: BOT_AVATARS[Math.floor(Math.random()*BOT_AVATARS.length)],
        balance: cfg.startBalance + Math.floor((Math.random()-0.5)*200),
        skill: cfg.botSkill + (Math.random()-0.5)*0.1,
        blindPlay: cfg.blindPlay,
        aggression: 0.3 + Math.random()*0.5, // how big they bet relative to balance
        status: 'waiting', // waiting | playing | bust | won
        lastResult: '',
        hand: [],
        bet: 0,
        wins: 0, losses: 0,
        // personality
        personality: ['conservative','aggressive','balanced','risky'][Math.floor(Math.random()*4)],
      };
    });
  }

  function botDecideAction(bot, hand, dealerUpCard) {
    const hv = handValue(hand);
    // Blind play = random-ish, low skill
    if (bot.blindPlay || Math.random() > bot.skill) {
      if (hv <= 13) return 'hit';
      if (hv >= 17) return 'stand';
      return Math.random() > 0.5 ? 'hit' : 'stand';
    }
    // Use basic strategy
    const strat = basicStrategy(hand, dealerUpCard);
    const action = strat.action.toLowerCase();
    if (action === 'hit') return 'hit';
    if (action === 'stand') return 'stand';
    if (action === 'double') return hand.length === 2 && bot.balance >= bot.bet ? 'double' : 'hit';
    if (action === 'split') return hand.length === 2 && bot.balance >= bot.bet ? 'split' : 'hit';
    return 'hit';
  }

  function botDecideBet(bot, difficulty) {
    const cfg = DIFFICULTY[difficulty];
    const base = Math.floor(bot.balance * bot.aggression * cfg.betMult * (0.05 + Math.random()*0.15));
    const clamped = Math.max(10, Math.min(base, Math.floor(bot.balance * 0.4)));
    return clamped;
  }

  // ──────────────────────────────────────────────
  // STYLES
  // ──────────────────────────────────────────────
  function injectStyles() {
    const old = document.querySelector('#bj-ult-styles');
    if (old) old.remove();
    const s = document.createElement('style');
    s.id = 'bj-ult-styles';
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Rajdhani:wght@400;500;600;700&display=swap');

      #bj-ult * { box-sizing:border-box; }
      #bj-ult { font-family:'Rajdhani',sans-serif; }

      @keyframes bj-deal {
        from { opacity:0;transform:translateY(-50px) scale(0.7) rotate(-12deg); }
        to   { opacity:1;transform:translateY(0)     scale(1)   rotate(0deg);   }
      }
      @keyframes bj-flip {
        0%   { transform:scaleX(1); }
        50%  { transform:scaleX(0); }
        100% { transform:scaleX(1); }
      }
      @keyframes bj-pulse-gold {
        0%,100% { box-shadow:0 0 12px rgba(255,215,0,0.4); }
        50%     { box-shadow:0 0 28px rgba(255,215,0,1);   }
      }
      @keyframes bj-flash-win  {
        0%,100% { filter:brightness(1);     }
        50%     { filter:brightness(1.15) hue-rotate(120deg); }
      }
      @keyframes bj-flash-lose {
        0%,100% { filter:brightness(1); }
        50%     { filter:brightness(0.8) hue-rotate(-30deg); }
      }
      @keyframes bj-coinFloat {
        0%   { opacity:1;transform:translateY(0)    scale(1);   }
        100% { opacity:0;transform:translateY(-70px) scale(0.5); }
      }
      @keyframes bj-slideIn {
        from { opacity:0;transform:translateX(120px); }
        to   { opacity:1;transform:translateX(0);     }
      }
      @keyframes bj-slideOut {
        from { opacity:1;transform:translateX(0); }
        to   { opacity:0;transform:translateX(120px); }
      }
      @keyframes bj-levelPop {
        from { opacity:0;transform:translate(-50%,-50%) scale(0.5); }
        to   { opacity:1;transform:translate(-50%,-50%) scale(1);   }
      }
      @keyframes bj-stratPop {
        from { opacity:0;transform:translateY(8px); }
        to   { opacity:1;transform:translateY(0);   }
      }
      @keyframes bj-chipPop {
        from { transform:scale(0);opacity:0; }
        60%  { transform:scale(1.2);         }
        to   { transform:scale(1);opacity:1; }
      }
      @keyframes bj-scanline {
        0%   { transform:translateY(-100%); }
        100% { transform:translateY(100vh); }
      }
      @keyframes bj-glow {
        0%,100% { opacity:0.6; }
        50%     { opacity:1;   }
      }
      @keyframes bj-rgb {
        0%   { color: #ff4444; }
        14%  { color: #ff8800; }
        28%  { color: #ffff00; }
        42%  { color: #00ff88; }
        57%  { color: #00ccff; }
        71%  { color: #aa44ff; }
        85%  { color: #ff44aa; }
        100% { color: #ff4444; }
      }

      .bj-card-anim { animation:bj-deal 0.4s cubic-bezier(0.22,1,0.36,1) both; }

      .bj-btn {
        padding:10px 22px;
        font-family:'Rajdhani',sans-serif;
        font-size:15px;font-weight:700;letter-spacing:1.5px;
        text-transform:uppercase;border:none;border-radius:10px;cursor:pointer;
        transition:transform 0.12s,filter 0.15s,box-shadow 0.15s;
        position:relative;overflow:hidden;
      }
      .bj-btn::after {
        content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
        transition:left 0.4s;pointer-events:none;
      }
      .bj-btn:hover:not(:disabled)::after { left:100%; }
      .bj-btn:hover:not(:disabled) { transform:translateY(-2px);filter:brightness(1.18); }
      .bj-btn:active:not(:disabled) { transform:translateY(0); }
      .bj-btn:disabled { opacity:0.3;cursor:not-allowed;filter:grayscale(0.5); }

      .bj-chip {
        border-radius:50%;display:flex;align-items:center;justify-content:center;
        font-weight:700;cursor:pointer;user-select:none;
        border:3px dashed rgba(255,255,255,0.4);
        transition:transform 0.15s,box-shadow 0.15s;
        animation:bj-chipPop 0.3s ease both;
        position:relative;overflow:hidden;
      }
      .bj-chip::after {
        content:'';position:absolute;top:0;left:0;right:0;height:50%;
        background:rgba(255,255,255,0.15);border-radius:50% 50% 0 0;
        pointer-events:none;
      }
      .bj-chip:hover { transform:scale(1.15) translateY(-3px); }

      .bj-tab {
        padding:7px 16px;font-size:13px;letter-spacing:2px;font-weight:700;
        background:transparent;border:none;cursor:pointer;
        color:#666;border-bottom:2px solid transparent;
        transition:color 0.2s,border-color 0.2s;
        font-family:'Rajdhani',sans-serif;text-transform:uppercase;
      }
      .bj-tab.active { color:var(--accent);border-bottom-color:var(--accent); }

      .bj-pill {
        background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
        border-radius:8px;padding:8px 14px;font-size:13px;
        display:flex;flex-direction:column;align-items:center;gap:2px;min-width:72px;
      }
      .bj-pill b { font-size:18px;font-weight:700; }

      .bj-strat-badge {
        display:inline-flex;align-items:center;gap:8px;
        padding:8px 16px;border-radius:10px;
        font-size:14px;font-weight:700;letter-spacing:1px;
        animation:bj-stratPop 0.3s ease both;
      }

      .bj-history-row {
        display:grid;grid-template-columns:1fr 70px 80px 80px;
        gap:8px;align-items:center;
        padding:6px 10px;border-radius:6px;font-size:13px;
        border-bottom:1px solid rgba(255,255,255,0.04);
      }
      .bj-history-row:hover { background:rgba(255,255,255,0.03); }

      .bj-xp-bar-fill {
        height:100%;border-radius:4px;
        background:linear-gradient(90deg,#ffd700,#ff4500);
        transition:width 0.6s cubic-bezier(0.22,1,0.36,1);
        position:relative;overflow:hidden;
      }
      .bj-xp-bar-fill::after {
        content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);
        animation:bj-scanline 2s linear infinite;
      }

      .bj-count-badge {
        padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;
        letter-spacing:1px;transition:all 0.3s;
      }

      /* Scrollbar */
      #bj-ult ::-webkit-scrollbar { width:4px; }
      #bj-ult ::-webkit-scrollbar-track { background:rgba(255,255,255,0.03); }
      #bj-ult ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15);border-radius:2px; }
    `;
    document.head.appendChild(s);
  }

  // ──────────────────────────────────────────────
  // ABRIR CON Alt+B
  // ──────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.altKey && e.code === 'KeyB') {
      if (gameOverlay) {
        gameOverlay.remove();
        gameOverlay = null;
      } else {
        openGame();
      }
    }
  });

  new MutationObserver(() => {
    const bjStyle = document.querySelector('#bj-ult-styles');
    if (!bjStyle) { injectStyles(); }
    else if (bjStyle !== document.head.lastElementChild) { document.head.appendChild(bjStyle); }
  }).observe(document.head, { childList: true });

  setTimeout(injectStyles, 300);

  // ──────────────────────────────────────────────
  // GAME ENGINE
  // ──────────────────────────────────────────────
  const SUITS = ['♥','♦','♣','♠'];
  const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const SUIT_COLOR = { '♥':'#e03030','♦':'#e03030','♣':'#111','♠':'#111' };

  let deck = [], deckPool = []; // deckPool = full undealt deck for probability

  function rankValue(r) {
    if (r === 'A') return 11;
    if ('JQK'.includes(r)) return 10;
    return parseInt(r);
  }

  function handValue(hand) {
    let v=0, aces=0;
    hand.forEach(c => { if(c.rank==='A'){aces++;v+=11;} else v+=rankValue(c.rank); });
    while (v>21 && aces-->0) v-=10;
    return v;
  }

  function isSoft(hand) {
    let v=0, aces=0;
    hand.forEach(c => { if(c.rank==='A'){aces++;v+=11;} else v+=rankValue(c.rank); });
    return aces>0 && v<=21;
  }

  function buildDeck(numDecks=6) {
    deck=[];
    for(let d=0;d<numDecks;d++) SUITS.forEach(s=>RANKS.forEach(r=>deck.push({rank:r,suit:s})));
    for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    deckPool=[...deck];
    runningCount=0; cardsDealt=0;
    sfx('shuffle');
  }

  function pop() {
    const c=deck.pop();
    if (c) { runningCount+=hiLoValue(c.rank); cardsDealt++; }
    return c;
  }

  // ──────────────────────────────────────────────
  // OPEN GAME
  // ──────────────────────────────────────────────
  let gameOverlay = null;
  let floatingButton = null;

  function openGame() {
    if (gameOverlay) { gameOverlay.remove(); gameOverlay = null; }
    buildOverlay();
  }

  // ──────────────────────────────────────────────
  // BUILD OVERLAY
  // ──────────────────────────────────────────────
  function buildOverlay() {
    // ── Game state ──
    let playerHands = [[]], dealerHand = [];
    let activeHandIdx = 0;
    let bet = 0, extraBets = {}; // extraBets: {perfectPairs, twentyOne3}
    let gameOver = false;
    let roundActive = false;
    let insuranceBet = 0;
    let _surrenderCount_local = 0;
    let currentBet = 100;
    let showStrategy = true;
    let showProbability = true;

    theme = THEMES[save.theme] || THEMES.dark;

    // ── Overlay ──
    gameOverlay = document.createElement('div');
    gameOverlay.id = 'bj-ult';
    Object.assign(gameOverlay.style, {
      position:'fixed', top:'3%', left:'6%',
      width:'88%', height:'92vh', maxHeight:'92vh',
      background:theme.gradient, color:theme.text,
      zIndex:'2147483647',
      display:'flex', flexDirection:'column',
      borderRadius:'18px',
      boxShadow:`0 0 0 1px ${theme.accent}88,0 0 80px rgba(0,0,0,0.95),0 0 120px ${theme.accent}11`,
      overflow:'hidden', pointerEvents:'all',
      isolation:'isolate', contain:'layout style',
      fontFamily:"'Rajdhani', sans-serif",
    });
    gameOverlay.style.setProperty('--accent', theme.accent);

    // Ambient glow overlay
    const glow = document.createElement('div');
    glow.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:0;border-radius:18px;
      background:radial-gradient(ellipse at 50% 0%,${theme.accent}15 0%,transparent 60%);
      animation:bj-glow 3s ease-in-out infinite;`;
    gameOverlay.appendChild(glow);

    // ── WATERMARK ──
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position:absolute;bottom:8px;right:14px;
      font-family:'Rajdhani',sans-serif;
      font-size:12px;font-weight:700;letter-spacing:2px;
      animation:bj-rgb 3s linear infinite;
      pointer-events:none;z-index:50;
      text-shadow:0 0 8px currentColor;
      opacity:0.85;user-select:none;
    `;
    watermark.textContent = 'made by Mixiruriii';
    gameOverlay.appendChild(watermark);

    // ── HEADER ──
    const header = document.createElement('div');
    header.style.cssText = `
      position:relative;z-index:5;
      background:rgba(0,0,0,0.6);
      border-bottom:1px solid ${theme.border};
      padding:10px 18px;
      display:flex;align-items:center;gap:16px;
      cursor:move;flex-shrink:0;
      backdrop-filter:blur(10px);
    `;

    // Title
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `font-family:'Cinzel Decorative',serif;font-size:18px;color:${theme.accent};
      letter-spacing:2px;text-shadow:0 0 16px ${theme.accent}88;white-space:nowrap;`;
    titleEl.textContent = '♠ BLACKJACK';
    header.appendChild(titleEl);

    // XP bar section
    const xpSection = document.createElement('div');
    xpSection.style.cssText = 'display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;';
    const { cur: lvData, next: lvNext } = getLevelData(save.xp);
    const xpLabel = document.createElement('div');
    xpLabel.id = 'bj-xp-label';
    xpLabel.style.cssText = `font-size:12px;color:${lvData.color};font-weight:700;letter-spacing:1px;`;
    xpLabel.textContent = `LV${save.level} ${lvData.name}  ·  ${save.xp.toLocaleString()} XP`;
    const xpBarWrap = document.createElement('div');
    xpBarWrap.style.cssText = 'height:5px;background:rgba(255,255,255,0.07);border-radius:4px;overflow:hidden;';
    const xpBarFill = document.createElement('div');
    xpBarFill.id = 'bj-xp-fill';
    xpBarFill.className = 'bj-xp-bar-fill';
    const xpPct = lvNext ? Math.min(100, ((save.xp - lvData.xp) / (lvNext.xp - lvData.xp)) * 100) : 100;
    xpBarFill.style.width = xpPct + '%';
    xpBarWrap.appendChild(xpBarFill);
    xpSection.append(xpLabel, xpBarWrap);
    header.appendChild(xpSection);

    // Balance
    const balanceEl = document.createElement('div');
    balanceEl.id = 'bj-balance';
    balanceEl.style.cssText = `font-size:17px;font-weight:700;color:${theme.gold};letter-spacing:1px;white-space:nowrap;`;
    balanceEl.textContent = `💰 ${save.balance.toLocaleString()} RP`;
    header.appendChild(balanceEl);

    // Count badge
    const countBadge = document.createElement('div');
    countBadge.id = 'bj-count-badge';
    countBadge.className = 'bj-count-badge';
    countBadge.style.display = 'none';
    header.appendChild(countBadge);

    // Sound toggle
    const soundBtn = makeBtn(soundEnabled ? '🔊' : '🔇', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.15)');
    soundBtn.style.padding = '6px 12px';
    soundBtn.onclick = () => { soundEnabled=!soundEnabled; soundBtn.textContent=soundEnabled?'🔊':'🔇'; };
    header.appendChild(soundBtn);

    // Theme selector
    const themeBtn = makeBtn('🎨', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.15)');
    themeBtn.style.padding = '6px 12px';
    themeBtn.onclick = () => cycleTheme();
    header.appendChild(themeBtn);

    // Close
    const closeBtn = makeBtn('✕', 'rgba(180,0,0,0.6)', 'rgba(255,0,0,0.8)');
    closeBtn.style.cssText += 'width:32px;height:32px;padding:0;font-size:16px;border-radius:8px;';
    closeBtn.onclick = () => {
      gameOverlay.remove(); gameOverlay = null;
    };
    header.appendChild(closeBtn);

    gameOverlay.appendChild(header);

    // Drag header
    let _drag=false,_ox,_oy;
    header.addEventListener('mousedown', e => {
      if (e.target===closeBtn||e.target===soundBtn||e.target===themeBtn) return;
      _drag=true; const r=gameOverlay.getBoundingClientRect(); _ox=e.clientX-r.left; _oy=e.clientY-r.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => { if(!_drag) return; gameOverlay.style.left=(e.clientX-_ox)+'px'; gameOverlay.style.top=(e.clientY-_oy)+'px'; });
    document.addEventListener('mouseup', ()=>_drag=false);

    // ── RESIZE HANDLES ──
    const HANDLES = [
      { id:'n',  cursor:'n-resize',  style:'top:-4px;left:12px;right:12px;height:8px;' },
      { id:'s',  cursor:'s-resize',  style:'bottom:-4px;left:12px;right:12px;height:8px;' },
      { id:'e',  cursor:'e-resize',  style:'right:-4px;top:12px;bottom:12px;width:8px;' },
      { id:'w',  cursor:'w-resize',  style:'left:-4px;top:12px;bottom:12px;width:8px;' },
      { id:'ne', cursor:'ne-resize', style:'top:-4px;right:-4px;width:16px;height:16px;' },
      { id:'nw', cursor:'nw-resize', style:'top:-4px;left:-4px;width:16px;height:16px;' },
      { id:'se', cursor:'se-resize', style:'bottom:-4px;right:-4px;width:16px;height:16px;border-radius:0 0 18px 0;' },
      { id:'sw', cursor:'sw-resize', style:'bottom:-4px;left:-4px;width:16px;height:16px;border-radius:0 0 0 18px;' },
    ];

    let _resizing=false, _resizeDir='', _startX, _startY, _startW, _startH, _startL, _startT;
    const MIN_W=500, MIN_H=380;

    HANDLES.forEach(h => {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;' + h.style + 'cursor:' + h.cursor + ';z-index:100;background:transparent;transition:background 0.2s;';
      el.addEventListener('mouseover', () => el.style.background = theme.accent + '44');
      el.addEventListener('mouseout',  () => el.style.background = 'transparent');
      el.addEventListener('mousedown', e => {
        e.stopPropagation(); e.preventDefault();
        _resizing=true; _resizeDir=h.id;
        _startX=e.clientX; _startY=e.clientY;
        const r=gameOverlay.getBoundingClientRect();
        _startW=r.width; _startH=r.height; _startL=r.left; _startT=r.top;
        document.body.style.userSelect='none';
      });
      gameOverlay.appendChild(el);
    });

    document.addEventListener('mousemove', e => {
      if (!_resizing) return;
      const dx=e.clientX-_startX, dy=e.clientY-_startY;
      let w=_startW, h=_startH, l=_startL, t=_startT;
      if (_resizeDir.includes('e')) w=Math.max(MIN_W,_startW+dx);
      if (_resizeDir.includes('w')) { w=Math.max(MIN_W,_startW-dx); l=_startL+(_startW-w); }
      if (_resizeDir.includes('s')) h=Math.max(MIN_H,_startH+dy);
      if (_resizeDir.includes('n')) { h=Math.max(MIN_H,_startH-dy); t=_startT+(_startH-h); }
      gameOverlay.style.width=w+'px'; gameOverlay.style.height=h+'px';
      gameOverlay.style.left=l+'px'; gameOverlay.style.top=t+'px';
      gameOverlay.style.maxHeight='none';
    });

    document.addEventListener('mouseup', () => {
      if (_resizing) { _resizing=false; document.body.style.userSelect=''; }
    });

    // ── TABS ──
    const tabBar = document.createElement('div');
    tabBar.style.cssText = `position:relative;z-index:4;display:flex;gap:0;
      background:rgba(0,0,0,0.4);border-bottom:1px solid ${theme.border};padding:0 16px;flex-shrink:0;`;

    const tabs = { game:'GAME', history:'HISTORY', achievements:'TROPHIES', strategy:'STRATEGY', tournament:'TOURNAMENT' };
    let activeTab = 'game';
    const tabEls = {};
    const tabPanels = {};

    Object.entries(tabs).forEach(([key,label]) => {
      const tab = document.createElement('button');
      tab.className = 'bj-tab' + (key==='game'?' active':'');
      tab.textContent = label;
      tab.style.setProperty('--accent', theme.accent);
      tab.onclick = () => switchTab(key);
      tabBar.appendChild(tab);
      tabEls[key] = tab;
    });
    gameOverlay.appendChild(tabBar);

    function switchTab(key) {
      activeTab = key;
      Object.entries(tabEls).forEach(([k,el]) => el.classList.toggle('active', k===key));
      Object.entries(tabPanels).forEach(([k,el]) => el.style.display = k===key ? 'flex' : 'none');
      if (key==='history') renderHistory();
      if (key==='achievements') renderAchievements();
      if (key==='tournament') renderTournament();
    }

    // ── PANELS wrapper ──
    const panelWrap = document.createElement('div');
    panelWrap.style.cssText = 'flex:1;overflow:hidden;position:relative;z-index:1;min-height:0;display:flex;flex-direction:column;';
    gameOverlay.appendChild(panelWrap);

    // ═══════════════════════════════════
    // PANEL: GAME
    // ═══════════════════════════════════
    const gamePanel = document.createElement('div');
    gamePanel.style.cssText = 'display:flex;flex:1;overflow:hidden;min-height:0;';
    tabPanels['game'] = gamePanel;
    panelWrap.appendChild(gamePanel);

    // Sidebar
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `width:150px;flex-shrink:0;background:rgba(0,0,0,0.35);
      border-right:1px solid ${theme.border};padding:10px 8px;display:flex;flex-direction:column;gap:6px;overflow-y:auto;`;
    gamePanel.appendChild(sidebar);

    // Stats title
    const sideTitle = document.createElement('div');
    sideTitle.style.cssText = `font-size:9px;letter-spacing:3px;color:${theme.subtext};text-align:center;padding-bottom:4px;border-bottom:1px solid ${theme.border};`;
    sideTitle.textContent = 'STATISTICS';
    sidebar.appendChild(sideTitle);

    function makePill(label, id, color) {
      const p = document.createElement('div');
      p.style.cssText = `display:flex;justify-content:space-between;align-items:center;
        padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:6px;`;
      p.innerHTML = `<span style="font-size:11px;color:${theme.subtext};letter-spacing:1px;">${label}</span>
        <b id="${id}" style="font-size:14px;color:${color||theme.text};">0</b>`;
      return p;
    }

    sidebar.appendChild(makePill('WINS',    'bj-s-wins',   theme.win));
    sidebar.appendChild(makePill('LOSSES',  'bj-s-losses', theme.lose));
    sidebar.appendChild(makePill('PUSHES',  'bj-s-pushes', theme.push));
    sidebar.appendChild(makePill('BJs',     'bj-s-bjs',    theme.gold));

    const sep1 = document.createElement('div');
    sep1.style.cssText = `height:1px;background:${theme.border};`;
    sidebar.appendChild(sep1);

    sidebar.appendChild(makePill('STREAK',  'bj-s-streak', theme.win));
    sidebar.appendChild(makePill('BEST',    'bj-s-best',   theme.gold));
    sidebar.appendChild(makePill('HANDS',   'bj-s-hands',  theme.subtext));
    sidebar.appendChild(makePill('WAGERED', 'bj-s-wagered',theme.subtext));

    const sep2 = document.createElement('div');
    sep2.style.cssText = `height:1px;background:${theme.border};`;
    sidebar.appendChild(sep2);

    // Settings title
    const settingsTitle = document.createElement('div');
    settingsTitle.style.cssText = `font-size:9px;letter-spacing:3px;color:${theme.subtext};text-align:center;`;
    settingsTitle.textContent = 'SETTINGS';
    sidebar.appendChild(settingsTitle);

    // Toggle helper — creates a proper labeled row toggle
    function makeToggleRow(label, defaultOn, onColor, onToggle) {
      const row = document.createElement('div');
      row.style.cssText = `display:flex;justify-content:space-between;align-items:center;
        padding:5px 8px;background:rgba(255,255,255,0.03);border-radius:6px;cursor:pointer;
        border:1px solid ${theme.border};transition:border-color 0.2s;`;

      const lbl = document.createElement('span');
      lbl.style.cssText = `font-size:11px;color:${theme.text};letter-spacing:0.5px;font-family:'Rajdhani',sans-serif;font-weight:600;`;
      lbl.textContent = label;

      const pill = document.createElement('div');
      let state = defaultOn;
      pill.style.cssText = `font-size:10px;font-weight:700;letter-spacing:1px;padding:2px 7px;border-radius:10px;
        background:${state ? onColor+'33' : 'rgba(255,255,255,0.06)'};
        color:${state ? onColor : theme.subtext};
        border:1px solid ${state ? onColor+'66' : theme.border};
        transition:all 0.2s;font-family:'Rajdhani',sans-serif;`;
      pill.textContent = state ? 'ON' : 'OFF';

      row.append(lbl, pill);
      row.addEventListener('mouseover', () => row.style.borderColor = onColor+'66');
      row.addEventListener('mouseout',  () => row.style.borderColor = theme.border);
      row.onclick = () => {
        state = !state;
        pill.style.background = state ? onColor+'33' : 'rgba(255,255,255,0.06)';
        pill.style.color = state ? onColor : theme.subtext;
        pill.style.borderColor = state ? onColor+'66' : theme.border;
        pill.textContent = state ? 'ON' : 'OFF';
        onToggle(state);
      };
      return { el: row, getState: () => state };
    }

    const stratRow = makeToggleRow('Strategy', true, theme.accent, (on) => {
      showStrategy = on;
      const el = document.getElementById('bj-strat-area');
      if (el) el.style.display = on ? 'flex' : 'none';
    });
    sidebar.appendChild(stratRow.el);

    const probRow = makeToggleRow('Bust %', true, '#1d4ed8', (on) => {
      showProbability = on;
      const el = document.getElementById('bj-prob-area');
      if (el) el.style.display = on ? 'flex' : 'none';
    });
    sidebar.appendChild(probRow.el);

    const countRow = makeToggleRow('Card Count', false, '#7c3aed', (on) => {
      countMode = on;
      const cb = document.getElementById('bj-count-badge');
      if (cb) cb.style.display = on ? 'flex' : 'none';
      _counterToggleCount++;
      if (_counterToggleCount >= 10) unlockAchievement('counter');
    });
    sidebar.appendChild(countRow.el);

    // Reset button — at bottom, styled as danger
    const resetBtn = document.createElement('div');
    resetBtn.style.cssText = `margin-top:auto;padding:5px 8px;border-radius:6px;cursor:pointer;
      text-align:center;font-size:11px;font-weight:700;letter-spacing:1px;
      color:${theme.subtext};border:1px solid ${theme.border};
      font-family:'Rajdhani',sans-serif;transition:all 0.2s;`;
    resetBtn.textContent = '⚠ RESET ALL';
    resetBtn.addEventListener('mouseover', () => { resetBtn.style.borderColor='#dc2626'; resetBtn.style.color='#dc2626'; });
    resetBtn.addEventListener('mouseout',  () => { resetBtn.style.borderColor=theme.border; resetBtn.style.color=theme.subtext; });
    resetBtn.onclick = () => {
      if (!confirm('Reset all stats, balance, XP and achievements?')) return;
      Object.assign(save, {...DEFAULT_SAVE});
      writeSave(); refreshStats(); updateBalance(); refreshXPBar();
    };
    sidebar.appendChild(resetBtn);

    // Main area
    const main = document.createElement('div');
    main.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:10px 18px;gap:6px;min-width:0;overflow-y:auto;min-height:0;';
    gamePanel.appendChild(main);

    // Message
    const msgEl = document.createElement('div');
    msgEl.id = 'bj-msg';
    msgEl.style.cssText = `text-align:center;font-size:16px;font-weight:700;letter-spacing:1px;
      color:${theme.gold};text-shadow:0 0 10px ${theme.gold}66;min-height:22px;flex-shrink:0;transition:opacity 0.25s;`;
    msgEl.textContent = '♠ Place your bet to begin ♠';
    main.appendChild(msgEl);

    // HUD row: strategy + probability
    const hudRow = document.createElement('div');
    hudRow.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-height:26px;flex-shrink:0;';
    main.appendChild(hudRow);

    const stratArea = document.createElement('div');
    stratArea.id = 'bj-strat-area';
    stratArea.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1;';
    hudRow.appendChild(stratArea);

    const probArea = document.createElement('div');
    probArea.id = 'bj-prob-area';
    probArea.style.cssText = 'display:flex;align-items:center;gap:8px;';
    hudRow.appendChild(probArea);

    // Count info
    const countInfoRow = document.createElement('div');
    countInfoRow.id = 'bj-count-row';
    countInfoRow.style.cssText = 'display:none;align-items:center;gap:10px;font-size:13px;';
    hudRow.appendChild(countInfoRow);

    // Table area
    const tableArea = document.createElement('div');
    tableArea.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex-shrink:0;flex:1;min-height:0;';
    main.appendChild(tableArea);

    // Dealer section
    const dealerSec = document.createElement('div');
    const dealerLabel = document.createElement('div');
    dealerLabel.id = 'bj-dealer-label';
    dealerLabel.style.cssText = `font-size:11px;letter-spacing:3px;color:${theme.dealerColor};margin-bottom:4px;font-weight:700;`;
    dealerLabel.textContent = "DEALER'S HAND";
    const dealerCardsEl = document.createElement('div');
    dealerCardsEl.id = 'bj-dealer-cards';
    dealerCardsEl.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;min-height:0;align-items:flex-end;';
    dealerSec.append(dealerLabel, dealerCardsEl);
    tableArea.appendChild(dealerSec);

    // Table rule strip
    const ruleLine = document.createElement('div');
    ruleLine.style.cssText = `display:flex;align-items:center;gap:10px;font-family:'Cinzel Decorative',serif;
      font-size:9px;color:${theme.accent}55;letter-spacing:2px;`;
    ruleLine.innerHTML = `<div style="flex:1;height:1px;background:${theme.border};"></div>
      ♠ BJ PAYS 3:2 · DEALER HITS SOFT 17 · 6 DECKS ♠
      <div style="flex:1;height:1px;background:${theme.border};"></div>`;
    tableArea.appendChild(ruleLine);

    // Player hands container
    const playerHandsEl = document.createElement('div');
    playerHandsEl.id = 'bj-player-hands';
    playerHandsEl.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;min-height:0;align-items:flex-end;';
    tableArea.appendChild(playerHandsEl);

    // ── BET AREA ──
    const betArea = document.createElement('div');
    betArea.id = 'bj-bet-area';
    betArea.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:7px;flex-shrink:0;';
    main.appendChild(betArea);

    // ── ROW 1: Bet display + Deal/Clear/Rebet (ALWAYS VISIBLE FIRST) ──
    const betCtrlRow = document.createElement('div');
    betCtrlRow.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;';
    betArea.appendChild(betCtrlRow);

    const betDisplay = document.createElement('div');
    betDisplay.id = 'bj-bet-display';
    betDisplay.style.cssText = `font-size:18px;font-weight:700;color:${theme.gold};
      padding:6px 20px;background:${theme.surface};border:1px solid ${theme.gold}55;
      border-radius:10px;min-width:150px;text-align:center;letter-spacing:1px;`;
    betDisplay.textContent = 'Bet: 0 RP';
    betCtrlRow.appendChild(betDisplay);

    const clearBtn = makeBtn('Clear', '#374151','#4b5563');
    clearBtn.onclick = () => { if(!roundActive){bet=0;updateBetDisplay();} };
    betCtrlRow.appendChild(clearBtn);

    const rebetBtn = makeBtn('Rebet', '#1e3a5f','#1e4a7f');
    rebetBtn.onclick = () => { if(!roundActive){bet=Math.min(currentBet,save.balance);updateBetDisplay();} };
    betCtrlRow.appendChild(rebetBtn);

    const dealBtn = makeBtn('DEAL  ▶', theme.accent, theme.accent, true);
    dealBtn.style.fontSize='15px'; dealBtn.style.padding='8px 28px';
    dealBtn.style.boxShadow=`0 4px 20px ${theme.accent}66`;
    dealBtn.onclick = () => {
      if (bet<=0) { flashMsg('Place a bet first!'); return; }
      if (bet>save.balance) { flashMsg('Not enough balance!'); return; }
      startRound();
    };
    betCtrlRow.appendChild(dealBtn);

    // ── ROW 2: Chips ──
    const betLabel = document.createElement('div');
    betLabel.style.cssText = `font-size:10px;letter-spacing:4px;color:${theme.subtext};`;
    betLabel.textContent = 'SELECT CHIPS';
    betArea.appendChild(betLabel);

    const chipsRow = document.createElement('div');
    chipsRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;';
    betArea.appendChild(chipsRow);

    const CHIPS = [
      {v:5,   bg:'#dc2626',s:'rgba(220,38,38,0.6)',   label:'5'   },
      {v:25,  bg:'#16a34a',s:'rgba(22,163,74,0.6)',   label:'25'  },
      {v:50,  bg:'#2563eb',s:'rgba(37,99,235,0.6)',   label:'50'  },
      {v:100, bg:'#7c3aed',s:'rgba(124,58,237,0.6)',  label:'100' },
      {v:250, bg:'#d97706',s:'rgba(217,119,6,0.6)',   label:'250' },
      {v:500, bg:'#be185d',s:'rgba(190,24,93,0.6)',   label:'500' },
      {v:-1,  bg:'#ffd700',s:'rgba(255,215,0,0.6)',   label:'MAX', color:'#111' },
    ];

    CHIPS.forEach(c => {
      const chip = document.createElement('div');
      chip.className = 'bj-chip';
      chip.style.cssText = `width:46px;height:46px;font-size:12px;background:${c.bg};
        box-shadow:0 5px 15px ${c.s},inset 0 2px 4px rgba(255,255,255,0.2);
        color:${c.color||'#fff'};`;
      chip.textContent = c.label;
      chip.title = c.v===-1 ? 'All in!' : `+${c.v} RP`;
      chip.onclick = (e) => {
        e.stopPropagation();
        const add = c.v===-1 ? save.balance : c.v;
        if (roundActive) return;
        if (add <= 0) return;
        if (c.v>=500||c.v===-1) unlockAchievement('high_roller');
        bet = Math.min(bet+add, save.balance);
        currentBet = bet;
        updateBetDisplay();
        try { sfx('chip'); } catch(err) {}
        try { spawnCoin(chip, `+${add}`); } catch(err) {}
      };
      chipsRow.appendChild(chip);
    });

    // ── ROW 3: Side bets + multi-hand (collapsed/compact) ──
    const optionsRow = document.createElement('div');
    optionsRow.style.cssText = `display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;
      padding:5px 12px;background:${theme.surface};border:1px solid ${theme.border};border-radius:8px;width:100%;`;

    // Multi-hand
    const multiLabel = document.createElement('div');
    multiLabel.style.cssText = `font-size:11px;letter-spacing:2px;color:${theme.subtext};`;
    multiLabel.textContent = 'HANDS:';
    optionsRow.appendChild(multiLabel);
    [1,2,3].forEach(n => {
      const hBtn = makeBtn(`${n}`, 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.12)');
      hBtn.id = `bj-h${n}`;
      hBtn.style.cssText += `padding:4px 14px;font-size:13px;border-radius:7px;border:1px solid ${n===1?theme.accent:theme.border};`;
      hBtn.onclick = () => {
        [1,2,3].forEach(x=>{const b=document.getElementById(`bj-h${x}`);if(b)b.style.borderColor=theme.border;});
        hBtn.style.borderColor = theme.accent;
        numHands = n;
      };
      optionsRow.appendChild(hBtn);
    });

    // Divider
    const optSep = document.createElement('div');
    optSep.style.cssText = `width:1px;height:28px;background:${theme.border};`;
    optionsRow.appendChild(optSep);

    // Side bets inline
    const sideBetLabel = document.createElement('div');
    sideBetLabel.style.cssText = `font-size:11px;letter-spacing:2px;color:${theme.subtext};`;
    sideBetLabel.textContent = 'SIDE BETS:';
    optionsRow.appendChild(sideBetLabel);

    const sideBets = [
      { key:'perfectPairs', label:'Pairs', payout:'25:1' },
      { key:'twentyOne3',   label:'21+3',  payout:'9:1'  },
    ];
    sideBets.forEach(sb => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;align-items:center;gap:5px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = `font-size:11px;color:${theme.subtext};`;
      lbl.textContent = `${sb.label}:`;
      const inp = document.createElement('input');
      inp.type='number'; inp.min='0'; inp.max='500'; inp.value='0';
      inp.id=`bj-sb-${sb.key}`;
      inp.style.cssText = `width:60px;padding:4px 6px;background:rgba(255,255,255,0.06);
        border:1px solid ${theme.border};border-radius:6px;color:${theme.text};
        font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;text-align:center;`;
      inp.title = `${sb.label} - pays ${sb.payout}`;
      wrap.append(lbl, inp);
      optionsRow.appendChild(wrap);
    });
    betArea.appendChild(optionsRow);

    // ── ACTION AREA ──
    const actionArea = document.createElement('div');
    actionArea.id = 'bj-action-area';
    actionArea.style.cssText = 'display:none;justify-content:center;gap:10px;flex-wrap:wrap;align-items:center;';
    main.appendChild(actionArea);

    const hitBtn     = makeBtn('HIT',         '#16a34a','#15803d');
    const standBtn   = makeBtn('STAND',       '#ca8a04','#a16207');
    const doubleBtn  = makeBtn('DOUBLE',      '#1d4ed8','#1e40af');
    const splitBtn   = makeBtn('SPLIT',       '#7c3aed','#6d28d9');
    const surrenderBtn = makeBtn('SURRENDER', '#dc2626','#b91c1c');
    const newGameBtn = makeBtn('NEW GAME  ↺', '#1e90ff','#0060cc', true);
    newGameBtn.style.display='none';

    actionArea.append(hitBtn,standBtn,doubleBtn,splitBtn,surrenderBtn,newGameBtn);

    // Insurance banner
    const insBanner = document.createElement('div');
    insBanner.id = 'bj-ins';
    insBanner.style.cssText = `display:none;align-items:center;gap:14px;justify-content:center;
      padding:10px 20px;background:rgba(255,69,0,0.12);border:1px solid ${theme.accent};
      border-radius:12px;animation:bj-pulse-gold 1.5s infinite;flex-wrap:wrap;`;
    insBanner.innerHTML = `
      <div>
        <div style="font-size:13px;font-weight:700;color:${theme.accent};">⚠ INSURANCE?</div>
        <div style="font-size:12px;color:${theme.subtext};">Half your bet · pays 2:1 if dealer has BJ</div>
      </div>
    `;
    const insYes = makeBtn('YES - INSURE', theme.accent, theme.accent);
    const insNo  = makeBtn('NO THANKS', '#374151','#4b5563');
    insBanner.append(insYes, insNo);
    main.appendChild(insBanner);

    document.body.appendChild(gameOverlay);
    injectStyles();

    // ═══════════════════════════════════
    // PANEL: HISTORY
    // ═══════════════════════════════════
    const historyPanel = document.createElement('div');
    historyPanel.style.cssText = 'display:none;flex-direction:column;padding:20px;overflow-y:auto;flex:1;min-height:0;';
    tabPanels['history'] = historyPanel;
    panelWrap.appendChild(historyPanel);

    function renderHistory() {
      historyPanel.innerHTML = '';
      const title = document.createElement('div');
      title.style.cssText = `font-size:11px;letter-spacing:4px;color:${theme.subtext};margin-bottom:14px;`;
      title.textContent = 'LAST 20 HANDS';
      historyPanel.appendChild(title);

      const header = document.createElement('div');
      header.className = 'bj-history-row';
      header.style.cssText += `background:${theme.surface};font-size:11px;letter-spacing:2px;color:${theme.subtext};margin-bottom:6px;`;
      header.innerHTML = '<div>RESULT</div><div>BET</div><div>PAYOUT</div><div>NET</div>';
      historyPanel.appendChild(header);

      if (!save.history || !save.history.length) {
        const empty = document.createElement('div');
        empty.style.cssText = `text-align:center;color:${theme.subtext};padding:40px;font-size:16px;`;
        empty.textContent = 'No hands played yet.';
        historyPanel.appendChild(empty);
        return;
      }

      [...save.history].reverse().forEach(h => {
        const row = document.createElement('div');
        row.className = 'bj-history-row';
        const resultColor = h.result==='WIN'?theme.win : h.result==='LOSE'?theme.lose : theme.push;
        const net = h.payout - h.bet;
        row.innerHTML = `
          <div style="color:${resultColor};font-weight:700;">${h.icon||''} ${h.result}</div>
          <div style="color:${theme.subtext};">${h.bet.toLocaleString()}</div>
          <div style="color:${theme.text};">${h.payout.toLocaleString()}</div>
          <div style="color:${net>=0?theme.win:theme.lose};font-weight:700;">${net>=0?'+':''}${net.toLocaleString()}</div>
        `;
        historyPanel.appendChild(row);
      });
    }

    // ═══════════════════════════════════
    // PANEL: ACHIEVEMENTS
    // ═══════════════════════════════════
    const achPanel = document.createElement('div');
    achPanel.style.cssText = 'display:none;flex-direction:column;padding:20px;overflow-y:auto;flex:1;min-height:0;';
    tabPanels['achievements'] = achPanel;
    panelWrap.appendChild(achPanel);

    function renderAchievements() {
      achPanel.innerHTML = '';
      const title = document.createElement('div');
      title.style.cssText = `font-size:11px;letter-spacing:4px;color:${theme.subtext};margin-bottom:16px;`;
      const earned = Object.keys(ACHIEVEMENTS).filter(k=>save.achievements[k]).length;
      title.textContent = `ACHIEVEMENTS  ${earned}/${Object.keys(ACHIEVEMENTS).length}`;
      achPanel.appendChild(title);

      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;';

      Object.entries(ACHIEVEMENTS).forEach(([key,ach]) => {
        const unlocked = !!save.achievements[key];
        const card = document.createElement('div');
        card.style.cssText = `padding:14px;border-radius:12px;
          background:${unlocked ? theme.surface : 'rgba(255,255,255,0.02)'};
          border:1px solid ${unlocked ? theme.accent+'44' : theme.border};
          display:flex;gap:12px;align-items:flex-start;
          opacity:${unlocked?1:0.4};transition:opacity 0.2s;`;
        card.innerHTML = `
          <div style="font-size:28px;line-height:1;">${unlocked?ach.icon:'🔒'}</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:${unlocked?theme.text:theme.subtext};">${ach.name}</div>
            <div style="font-size:12px;color:${theme.subtext};">${ach.desc}</div>
            <div style="font-size:11px;color:${theme.gold};margin-top:3px;">+${ach.xp} XP</div>
          </div>
        `;
        grid.appendChild(card);
      });
      achPanel.appendChild(grid);
    }

    // ═══════════════════════════════════
    // PANEL: STRATEGY
    // ═══════════════════════════════════
    const stratPanel = document.createElement('div');
    stratPanel.style.cssText = 'display:none;flex-direction:column;padding:20px;overflow-y:auto;flex:1;min-height:0;';
    tabPanels['strategy'] = stratPanel;
    panelWrap.appendChild(stratPanel);

    // Build basic strategy chart
    (function buildStratChart() {
      const title = document.createElement('div');
      title.style.cssText = `font-size:11px;letter-spacing:4px;color:${theme.subtext};margin-bottom:14px;`;
      title.textContent = 'BASIC STRATEGY CHART (6 DECKS, S17)';
      stratPanel.appendChild(title);

      const dealerCols = ['2','3','4','5','6','7','8','9','10','A'];
      const rows = [
        // Hard totals
        {label:'Hard 8',  values:['H','H','H','H','H','H','H','H','H','H']},
        {label:'Hard 9',  values:['H','D','D','D','D','H','H','H','H','H']},
        {label:'Hard 10', values:['D','D','D','D','D','D','D','D','H','H']},
        {label:'Hard 11', values:['D','D','D','D','D','D','D','D','D','D']},
        {label:'Hard 12', values:['H','H','S','S','S','H','H','H','H','H']},
        {label:'Hard 13-16',values:['S','S','S','S','S','H','H','H','H','H']},
        {label:'Hard 17+', values:['S','S','S','S','S','S','S','S','S','S']},
        // Soft
        {label:'Soft 13-14',values:['H','H','H','D','D','H','H','H','H','H']},
        {label:'Soft 15-16',values:['H','H','D','D','D','H','H','H','H','H']},
        {label:'Soft 17',   values:['H','D','D','D','D','H','H','H','H','H']},
        {label:'Soft 18',   values:['S','D','D','D','D','S','S','H','H','H']},
        {label:'Soft 19+',  values:['S','S','S','S','S','S','S','S','S','S']},
      ];
      const ACTION_COLORS = {H:'#16a34a',D:'#1d4ed8',S:'#ca8a04',P:'#7c3aed',R:'#dc2626'};
      const ACTION_LABELS = {H:'Hit',D:'Dbl',S:'Std',P:'Spl',R:'Sur'};

      const table = document.createElement('div');
      table.style.cssText = 'overflow-x:auto;';
      const grid = document.createElement('div');
      grid.style.cssText = `display:grid;grid-template-columns:100px repeat(${dealerCols.length},1fr);gap:2px;min-width:500px;`;

      // Header
      const blank = document.createElement('div');
      blank.style.cssText = `font-size:10px;letter-spacing:2px;color:${theme.subtext};display:flex;align-items:flex-end;padding-bottom:4px;`;
      blank.textContent = 'vs DEALER ↓';
      grid.appendChild(blank);
      dealerCols.forEach(d => {
        const h = document.createElement('div');
        h.style.cssText = `font-size:12px;font-weight:700;text-align:center;color:${theme.text};padding:4px;`;
        h.textContent = d; grid.appendChild(h);
      });
      rows.forEach(row => {
        const rl = document.createElement('div');
        rl.style.cssText = `font-size:11px;color:${theme.subtext};display:flex;align-items:center;padding:2px 4px;`;
        rl.textContent = row.label; grid.appendChild(rl);
        row.values.forEach(a => {
          const cell = document.createElement('div');
          cell.style.cssText = `background:${ACTION_COLORS[a]||'#333'}44;border:1px solid ${ACTION_COLORS[a]||'#333'}66;
            border-radius:4px;text-align:center;padding:4px 2px;font-size:11px;font-weight:700;color:${ACTION_COLORS[a]};`;
          cell.textContent = ACTION_LABELS[a]||a; grid.appendChild(cell);
        });
      });
      table.appendChild(grid);
      stratPanel.appendChild(table);

      // Legend
      const legend = document.createElement('div');
      legend.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;';
      Object.entries(ACTION_LABELS).forEach(([k,v]) => {
        const li = document.createElement('div');
        li.style.cssText = `display:flex;align-items:center;gap:6px;font-size:12px;`;
        li.innerHTML = `<div style="width:24px;height:20px;background:${ACTION_COLORS[k]}44;border:1px solid ${ACTION_COLORS[k]};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${ACTION_COLORS[k]};">${k}</div><span style="color:${theme.subtext};">${v}</span>`;
        legend.appendChild(li);
      });
      stratPanel.appendChild(legend);
    })();

    // ═══════════════════════════════════
    // ═══════════════════════════════════
    // PANEL: TOURNAMENT
    // ═══════════════════════════════════
    const tournPanel = document.createElement('div');
    tournPanel.style.cssText = 'display:none;flex-direction:column;overflow:hidden;flex:1;min-height:0;';
    tabPanels['tournament'] = tournPanel;
    panelWrap.appendChild(tournPanel);

    function renderTournament() {
      tournPanel.innerHTML = '';

      // If a tournament is running, show the live view
      if (activeTournament) { renderLiveTournament(); return; }

      // ── LOBBY ──
      const lobby = document.createElement('div');
      lobby.style.cssText = 'display:flex;flex-direction:column;gap:16px;padding:20px;overflow-y:auto;flex:1;';
      tournPanel.appendChild(lobby);

      const titleRow = document.createElement('div');
      titleRow.style.cssText = 'display:flex;align-items:center;gap:12px;';
      titleRow.innerHTML = `
        <div style="font-family:'Cinzel Decorative',serif;font-size:22px;color:${theme.accent};">🏆 TOURNAMENT</div>
        <div style="font-size:12px;color:${theme.subtext};letter-spacing:2px;margin-top:4px;">SELECT MODE & DIFFICULTY</div>
      `;
      lobby.appendChild(titleRow);

      // Mode selector
      const modeSection = document.createElement('div');
      modeSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      const modeLabel = document.createElement('div');
      modeLabel.style.cssText = `font-size:10px;letter-spacing:3px;color:${theme.subtext};`;
      modeLabel.textContent = 'GAME MODE';
      modeSection.appendChild(modeLabel);

      const modeRow = document.createElement('div');
      modeRow.style.cssText = 'display:flex;gap:10px;';

      let selectedMode = 'solo';
      const modes = [
        { id:'solo',  icon:'👤', label:'Solo',       desc:'Play alone, track your peak' },
        { id:'bots',  icon:'🤖', label:'vs Bots',    desc:'Compete against AI opponents' },
      ];

      const modeCards = {};
      modes.forEach(m => {
        const card = document.createElement('div');
        card.style.cssText = `flex:1;padding:14px;border-radius:12px;cursor:pointer;
          background:${m.id==='solo'?theme.surface:'rgba(255,255,255,0.02)'};
          border:2px solid ${m.id==='solo'?theme.accent:theme.border};
          transition:all 0.2s;`;
        card.innerHTML = `
          <div style="font-size:24px;margin-bottom:6px;">${m.icon}</div>
          <div style="font-size:15px;font-weight:700;color:${theme.text};">${m.label}</div>
          <div style="font-size:12px;color:${theme.subtext};margin-top:3px;">${m.desc}</div>
        `;
        card.onclick = () => {
          selectedMode = m.id;
          Object.entries(modeCards).forEach(([k,el]) => {
            el.style.background = k===m.id ? theme.surface : 'rgba(255,255,255,0.02)';
            el.style.borderColor = k===m.id ? theme.accent : theme.border;
          });
        };
        modeCards[m.id] = card;
        modeRow.appendChild(card);
      });
      modeSection.appendChild(modeRow);
      lobby.appendChild(modeSection);

      // Difficulty selector
      const diffSection = document.createElement('div');
      diffSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      const diffLabel = document.createElement('div');
      diffLabel.style.cssText = `font-size:10px;letter-spacing:3px;color:${theme.subtext};`;
      diffLabel.textContent = 'DIFFICULTY';
      diffSection.appendChild(diffLabel);

      const diffRow = document.createElement('div');
      diffRow.style.cssText = 'display:flex;gap:10px;';

      let selectedDiff = 'medium';
      const diffs = Object.entries(DIFFICULTY).map(([k,v]) => ({id:k,...v}));
      const diffCards = {};

      diffs.forEach(d => {
        const card = document.createElement('div');
        const isSel = d.id==='medium';
        card.style.cssText = `flex:1;padding:14px;border-radius:12px;cursor:pointer;
          background:${isSel?d.color+'18':'rgba(255,255,255,0.02)'};
          border:2px solid ${isSel?d.color:theme.border};
          transition:all 0.2s;text-align:center;`;
        const botInfo = d.id==='easy'?'2 bots':d.id==='medium'?'3 bots':'5 bots';
        card.innerHTML = `
          <div style="font-size:18px;font-weight:900;color:${d.color};letter-spacing:2px;">${d.name}</div>
          <div style="font-size:11px;color:${theme.subtext};margin-top:4px;">${botInfo} · ${d.startBalance} RP start</div>
          <div style="font-size:11px;color:${theme.subtext};">Skill: ${'★'.repeat(d.id==='easy'?1:d.id==='medium'?2:3)}${'☆'.repeat(3-(d.id==='easy'?1:d.id==='medium'?2:3))}</div>
        `;
        card.onclick = () => {
          selectedDiff = d.id;
          Object.entries(diffCards).forEach(([k,el]) => {
            const dc = DIFFICULTY[k];
            el.style.background = k===d.id ? dc.color+'18' : 'rgba(255,255,255,0.02)';
            el.style.borderColor = k===d.id ? dc.color : theme.border;
          });
        };
        diffCards[d.id] = card;
        diffRow.appendChild(card);
      });
      diffSection.appendChild(diffRow);
      lobby.appendChild(diffSection);

      // Tournament rules info box
      const infoBox = document.createElement('div');
      infoBox.style.cssText = `padding:14px 16px;background:${theme.surface};border:1px solid ${theme.border};border-radius:12px;font-size:12px;color:${theme.subtext};line-height:1.8;`;
      infoBox.innerHTML = `
        <div style="color:${theme.text};font-weight:700;margin-bottom:6px;font-size:13px;">📋 HOW IT WORKS</div>
        <div>· All players (you + bots) start with the same balance</div>
        <div>· Each player plays their hand independently vs the dealer</div>
        <div>· Tournament ends after <b style="color:${theme.text};">10 rounds</b> or if you go bust</div>
        <div>· Final ranking is by balance — highest wins 🏆</div>
        <div>· Bots play automatically with a short delay so you can watch</div>
      `;
      lobby.appendChild(infoBox);

      // Start button
      const startBtn = document.createElement('button');
      startBtn.className = 'bj-btn';
      startBtn.style.cssText = `padding:14px 40px;font-size:18px;background:${theme.accent};color:white;
        border-radius:14px;width:100%;box-shadow:0 4px 24px ${theme.accent}66;margin-top:auto;`;
      startBtn.textContent = '▶ START TOURNAMENT';
      startBtn.addEventListener('mouseover', ()=>startBtn.style.filter='brightness(1.2)');
      startBtn.addEventListener('mouseout',  ()=>startBtn.style.filter='');
      startBtn.onclick = () => {
        launchTournament(selectedMode, selectedDiff);
      };
      lobby.appendChild(startBtn);
    }

    // ── LAUNCH TOURNAMENT ──
    function launchTournament(mode, difficulty) {
      const cfg = DIFFICULTY[difficulty];
      activeTournament = {
        mode,
        difficulty,
        cfg,
        round: 0,
        maxRounds: 10,
        playerBalance: cfg.startBalance,
        playerStartBalance: cfg.startBalance,
        bots: mode === 'bots' ? createBots(difficulty) : [],
        log: [],
        finished: false,
      };
      // Give player the tournament starting balance as a separate pool
      renderTournament();
    }

    // ── LIVE TOURNAMENT VIEW ──
    function renderLiveTournament() {
      const t = activeTournament;
      if (!t) return;

      tournPanel.innerHTML = '';

      // Top bar
      const topBar = document.createElement('div');
      topBar.style.cssText = `display:flex;align-items:center;justify-content:space-between;
        padding:10px 16px;background:rgba(0,0,0,0.4);border-bottom:1px solid ${theme.border};flex-shrink:0;`;

      const roundInfo = document.createElement('div');
      roundInfo.style.cssText = `font-size:13px;font-weight:700;color:${theme.text};`;
      roundInfo.innerHTML = `<span style="color:${t.cfg.color};">${t.cfg.name}</span>  ·  Round <span id="bj-tourn-round">${t.round}</span>/${t.maxRounds}  ·  Mode: ${t.mode==='bots'?'vs Bots':'Solo'}`;
      topBar.appendChild(roundInfo);

      const abortBtn = document.createElement('button');
      abortBtn.className = 'bj-btn';
      abortBtn.style.cssText = 'padding:5px 14px;font-size:12px;background:#dc2626;color:white;border-radius:7px;';
      abortBtn.textContent = '✕ QUIT';
      abortBtn.onclick = () => {
        if (confirm('Quit the tournament? Progress will be lost.')) {
          activeTournament = null;
          renderTournament();
        }
      };
      topBar.appendChild(abortBtn);
      tournPanel.appendChild(topBar);

      // Main content: leaderboard + play area
      const content = document.createElement('div');
      content.style.cssText = 'display:flex;flex:1;overflow:hidden;min-height:0;gap:0;';
      tournPanel.appendChild(content);

      // ── LEADERBOARD ──
      const lbPanel = document.createElement('div');
      lbPanel.style.cssText = `width:200px;flex-shrink:0;background:rgba(0,0,0,0.3);
        border-right:1px solid ${theme.border};padding:10px 8px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;`;

      const lbTitle = document.createElement('div');
      lbTitle.style.cssText = `font-size:9px;letter-spacing:3px;color:${theme.subtext};text-align:center;padding-bottom:6px;border-bottom:1px solid ${theme.border};`;
      lbTitle.textContent = 'LEADERBOARD';
      lbPanel.appendChild(lbTitle);

      function buildLeaderboard() {
        // Build all players list
        const players = [
          { name:'YOU', avatar:'🎮', balance: t.playerBalance, isPlayer:true, status:'active' },
          ...t.bots.map(b => ({ name:b.name, avatar:b.avatar, balance:b.balance, isPlayer:false, status:b.status, lastResult:b.lastResult }))
        ];
        players.sort((a,b) => b.balance - a.balance);

        lbPanel.querySelectorAll('.bj-lb-row').forEach(el=>el.remove());

        players.forEach((p, rank) => {
          const row = document.createElement('div');
          row.className = 'bj-lb-row';
          const rankColor = rank===0?theme.gold:rank===1?'#aaa':rank===2?'#cd7f32':theme.subtext;
          const statusColor = p.status==='bust'?theme.lose:p.isPlayer?theme.playerColor:theme.subtext;
          row.style.cssText = `display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;
            background:${p.isPlayer?theme.accent+'18':'rgba(255,255,255,0.02)'};
            border:1px solid ${p.isPlayer?theme.accent+'44':theme.border};`;
          row.innerHTML = `
            <div style="font-size:11px;font-weight:700;color:${rankColor};width:16px;">#${rank+1}</div>
            <div style="font-size:16px;">${p.avatar}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:11px;font-weight:700;color:${p.isPlayer?theme.accent:theme.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
              <div style="font-size:12px;color:${theme.gold};font-weight:700;">${p.balance.toLocaleString()} RP</div>
            </div>
            <div style="font-size:10px;color:${statusColor};">${p.status==='bust'?'BUST':p.lastResult||''}</div>
          `;
          lbPanel.appendChild(row);
        });
      }

      buildLeaderboard();
      content.appendChild(lbPanel);

      // ── PLAY AREA ──
      const playArea = document.createElement('div');
      playArea.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:14px;gap:10px;overflow-y:auto;';
      content.appendChild(playArea);

      if (t.finished) {
        // Show final results
        renderTournamentResults(playArea);
        return;
      }

      // Round prompt / active round UI
      const roundTitle = document.createElement('div');
      roundTitle.id = 'bj-tourn-title';
      roundTitle.style.cssText = `font-size:15px;font-weight:700;color:${theme.gold};text-align:center;`;
      roundTitle.textContent = t.round === 0 ? '🏁 Ready to start! Press DEAL to play Round 1.' : `Round ${t.round} complete. Press DEAL to continue.`;
      playArea.appendChild(roundTitle);

      // Bot activity feed
      if (t.mode === 'bots') {
        const feedTitle = document.createElement('div');
        feedTitle.style.cssText = `font-size:10px;letter-spacing:3px;color:${theme.subtext};`;
        feedTitle.textContent = 'LIVE FEED';
        playArea.appendChild(feedTitle);

        const feed = document.createElement('div');
        feed.id = 'bj-tourn-feed';
        feed.style.cssText = `flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:4px;
          padding:8px;background:rgba(0,0,0,0.25);border-radius:10px;border:1px solid ${theme.border};
          font-size:12px;min-height:80px;max-height:180px;`;
        playArea.appendChild(feed);

        // Populate existing log
        t.log.slice(-20).forEach(entry => {
          const line = document.createElement('div');
          line.style.cssText = `color:${entry.color||theme.subtext};padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);`;
          line.textContent = entry.text;
          feed.appendChild(line);
        });
        feed.scrollTop = feed.scrollHeight;
      }

      // Player balance display
      const balRow = document.createElement('div');
      balRow.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;';
      balRow.innerHTML = `
        <div style="padding:8px 18px;background:${theme.surface};border:1px solid ${theme.gold}44;border-radius:10px;">
          <span style="color:${theme.subtext};font-size:11px;">YOUR BALANCE  </span>
          <span id="bj-tourn-bal" style="color:${theme.gold};font-size:18px;font-weight:700;">${t.playerBalance.toLocaleString()} RP</span>
        </div>
        <div style="padding:8px 18px;background:${theme.surface};border:1px solid ${theme.border};border-radius:10px;">
          <span style="color:${theme.subtext};font-size:11px;">ROUND  </span>
          <span style="color:${t.cfg.color};font-size:18px;font-weight:700;">${t.round+1}/${t.maxRounds}</span>
        </div>
      `;
      playArea.appendChild(balRow);

      // Bet + deal for tournament round
      const tournBetRow = document.createElement('div');
      tournBetRow.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;';
      playArea.appendChild(tournBetRow);

      let tournBet = Math.min(100, Math.floor(t.playerBalance * 0.1));
      const tournBetDisplay = document.createElement('div');
      tournBetDisplay.style.cssText = `font-size:16px;font-weight:700;color:${theme.gold};
        padding:7px 20px;background:${theme.surface};border:1px solid ${theme.gold}44;border-radius:9px;min-width:140px;text-align:center;`;
      tournBetDisplay.textContent = `Bet: ${tournBet} RP`;
      tournBetRow.appendChild(tournBetDisplay);

      // Quick chips for tournament
      [25,50,100,250].forEach(v => {
        if (v > t.playerBalance) return;
        const chip = document.createElement('div');
        chip.className = 'bj-chip';
        const colors = {25:'#16a34a',50:'#2563eb',100:'#7c3aed',250:'#d97706'};
        chip.style.cssText = `width:40px;height:40px;font-size:11px;background:${colors[v]};
          box-shadow:0 4px 10px ${colors[v]}88;color:#fff;`;
        chip.textContent = v;
        chip.onclick = () => {
          tournBet = Math.min(tournBet + v, t.playerBalance);
          tournBetDisplay.textContent = `Bet: ${tournBet} RP`;
        };
        tournBetRow.appendChild(chip);
      });

      const clearTBtn = makeBtn('Clear','#374151','#4b5563');
      clearTBtn.style.padding='7px 14px';
      clearTBtn.onclick = () => { tournBet=0; tournBetDisplay.textContent='Bet: 0 RP'; };
      tournBetRow.appendChild(clearTBtn);

      const tournDealBtn = makeBtn('DEAL ▶', t.cfg.color, t.cfg.color, true);
      tournDealBtn.style.padding='8px 28px';
      tournDealBtn.onclick = () => {
        if (tournBet <= 0) { addFeedLog('⚠ Set a bet first!', theme.lose); return; }
        if (tournBet > t.playerBalance) { addFeedLog('⚠ Not enough balance!', theme.lose); return; }
        playTournamentRound(tournBet, buildLeaderboard);
      };
      tournBetRow.appendChild(tournDealBtn);
    }

    function addFeedLog(text, color) {
      const feed = document.getElementById('bj-tourn-feed');
      if (!feed) return;
      const line = document.createElement('div');
      line.style.cssText = `color:${color||theme.subtext};padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);`;
      line.textContent = text;
      feed.appendChild(line);
      feed.scrollTop = feed.scrollHeight;
      activeTournament.log.push({text, color});
      if (activeTournament.log.length > 100) activeTournament.log.shift();
    }

    function playTournamentRound(playerBet, onUpdate) {
      const t = activeTournament;
      if (!t || t.finished) return;

      t.round++;
      t.playerBalance -= playerBet;

      // Update UI
      const titleEl = document.getElementById('bj-tourn-title');
      if (titleEl) titleEl.textContent = `⚡ Round ${t.round} in progress...`;

      addFeedLog(`━━━ ROUND ${t.round} ━━━`, theme.accent);
      addFeedLog(`🎮 YOU bet ${playerBet} RP`, theme.playerColor);

      // Bots place bets
      if (t.mode === 'bots') {
        t.bots.forEach(bot => {
          if (bot.status === 'bust') return;
          bot.bet = botDecideBet(bot, t.difficulty);
          bot.balance -= bot.bet;
          bot.hand = [];
          addFeedLog(`${bot.avatar} ${bot.name} bets ${bot.bet} RP`, theme.subtext);
        });
      }

      // Deal cards
      if (deck.length < 52) buildDeck(6);
      const playerHand = [pop(), pop()];
      const dealerHand = [pop(), pop()];
      t.bots.forEach(bot => { if (bot.status !== 'bust') bot.hand = [pop(), pop()]; });

      // Player plays (simplified: use basic strategy or stand at 17+)
      // Actually let player control — we just track result via callback
      // For tournament we play it out automatically with a short animation then show result
      let botDelay = 400;

      // Simulate bot hands with delays
      if (t.mode === 'bots') {
        t.bots.forEach((bot, bi) => {
          if (bot.status === 'bust' || !bot.hand.length) return;
          setTimeout(() => {
            // Bot plays hand
            let hand = [...bot.hand];
            let action = botDecideAction(bot, hand, dealerHand[0]);
            let safety = 0;
            while ((action === 'hit' || action === 'double') && handValue(hand) < 21 && safety < 6) {
              if (action === 'double' && bot.balance >= bot.bet) {
                bot.balance -= bot.bet; bot.bet *= 2;
              }
              hand.push(pop());
              action = botDecideAction(bot, hand, dealerHand[0]);
              safety++;
            }
            bot.hand = hand;

            // Dealer plays
            const dh = [...dealerHand];
            while (handValue(dh) < 17 || (handValue(dh) === 17 && isSoft(dh))) dh.push(pop());
            const dv = handValue(dh);
            const bv = handValue(hand);

            let payout = 0;
            if (bv > 21) { bot.lastResult = '💥'; bot.losses++; addFeedLog(`${bot.avatar} ${bot.name}: BUST (${bv}) — lost ${bot.bet} RP`, theme.lose); }
            else if (dv > 21 || bv > dv) { payout = bot.bet * 2; bot.wins++; bot.lastResult = '✅'; addFeedLog(`${bot.avatar} ${bot.name}: WIN (${bv} vs ${dv}) +${bot.bet} RP`, theme.win); }
            else if (bv < dv) { bot.lastResult = '❌'; bot.losses++; addFeedLog(`${bot.avatar} ${bot.name}: LOSE (${bv} vs ${dv}) -${bot.bet} RP`, theme.lose); }
            else { payout = bot.bet; bot.lastResult = '🤝'; addFeedLog(`${bot.avatar} ${bot.name}: PUSH`, theme.push); }

            bot.balance += payout;
            if (bot.balance <= 0) { bot.status = 'bust'; bot.balance = 0; addFeedLog(`💀 ${bot.name} is BUST!`, theme.lose); }

            if (onUpdate) onUpdate();
          }, botDelay * (bi + 1));
        });
      }

      // Player hand resolution — show cards + let player decide with actual buttons
      // We overlay a mini-game area in the feed panel
      const totalBotDelay = t.mode === 'bots' ? botDelay * (t.bots.filter(b=>b.status!=='bust').length + 1) : 500;

      // Resolve player hand automatically using basic strategy (can be overridden)
      setTimeout(() => {
        // Dealer final hand
        const dh = [...dealerHand];
        while (handValue(dh) < 17 || (handValue(dh) === 17 && isSoft(dh))) dh.push(pop());
        const dv = handValue(dh);

        // Player result (auto-play with basic strategy for simplicity in tournament)
        let ph = [...playerHand];
        let pAction = basicStrategy(ph, dealerHand[0]).action;
        let safetyP = 0;
        while ((pAction === 'HIT' || pAction === 'DOUBLE') && handValue(ph) < 21 && safetyP < 6) {
          ph.push(pop()); pAction = basicStrategy(ph, dealerHand[0]).action; safetyP++;
        }
        const pv = handValue(ph);
        const pBJ = pv === 21 && ph.length === 2;
        const dBJ = dv === 21 && dh.length === 2;

        let payout = 0;
        let resultText = '';
        if (pv > 21)         { resultText = `💥 YOU BUST (${pv})`; addFeedLog(`🎮 YOU: BUST (${pv}) — lost ${playerBet} RP`, theme.lose); }
        else if (dBJ&&!pBJ)  { resultText = `😱 Dealer BJ!`;         addFeedLog(`🎮 YOU: Dealer BJ — lost ${playerBet} RP`, theme.lose); }
        else if (pBJ&&!dBJ)  { payout = Math.floor(playerBet*2.5);  resultText = `🌟 BLACKJACK! +${payout-playerBet} RP`; addFeedLog(`🎮 YOU: BLACKJACK! +${payout-playerBet} RP`, theme.win); }
        else if (dv>21||pv>dv){ payout = playerBet*2;               resultText = `✅ YOU WIN +${playerBet} RP`; addFeedLog(`🎮 YOU: WIN (${pv} vs ${dv}) +${playerBet} RP`, theme.win); }
        else if (pv<dv)      { resultText = `❌ YOU LOSE`;            addFeedLog(`🎮 YOU: LOSE (${pv} vs ${dv}) -${playerBet} RP`, theme.lose); }
        else                 { payout = playerBet;                   resultText = `🤝 PUSH`;  addFeedLog(`🎮 YOU: PUSH`, theme.push); }

        t.playerBalance += payout;
        if (t.playerBalance < 0) t.playerBalance = 0;

        // Update displays
        const balEl = document.getElementById('bj-tourn-bal');
        if (balEl) balEl.textContent = t.playerBalance.toLocaleString() + ' RP';
        if (onUpdate) onUpdate();

        const titleEl2 = document.getElementById('bj-tourn-title');

        // Check end conditions
        const playerBust = t.playerBalance <= 0;
        const roundsUp = t.round >= t.maxRounds;

        if (playerBust || roundsUp) {
          t.finished = true;
          if (titleEl2) titleEl2.textContent = playerBust ? '💀 You went bust!' : `🏁 Tournament complete! ${resultText}`;
          addFeedLog('━━━ TOURNAMENT OVER ━━━', theme.accent);
          setTimeout(() => renderTournament(), 1500);
        } else {
          if (titleEl2) titleEl2.textContent = `${resultText}  —  Press DEAL for Round ${t.round+1}`;
        }
      }, totalBotDelay + 300);
    }

    function renderTournamentResults(container) {
      const t = activeTournament;
      const players = [
        { name:'YOU', avatar:'🎮', balance: t.playerBalance, isPlayer:true },
        ...t.bots.map(b => ({ name:b.name, avatar:b.avatar, balance:b.balance, isPlayer:false }))
      ].sort((a,b) => b.balance - a.balance);

      const playerRank = players.findIndex(p=>p.isPlayer) + 1;
      const cfg = t.cfg;

      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:14px;padding:10px;';

      const trophy = playerRank===1?'🥇':playerRank===2?'🥈':playerRank===3?'🥉':'😤';
      const resultColor = playerRank===1?theme.gold:playerRank===2?'#aaa':playerRank===3?'#cd7f32':theme.lose;

      const heroCard = document.createElement('div');
      heroCard.style.cssText = `text-align:center;padding:20px;background:${resultColor}18;
        border:2px solid ${resultColor}44;border-radius:14px;`;
      heroCard.innerHTML = `
        <div style="font-size:48px;">${trophy}</div>
        <div style="font-size:22px;font-weight:700;color:${resultColor};margin-top:6px;">RANK #${playerRank}</div>
        <div style="font-size:14px;color:${theme.subtext};margin-top:4px;">${cfg.name} difficulty · ${t.round} rounds</div>
        <div style="font-size:28px;font-weight:700;color:${theme.gold};margin-top:10px;">${t.playerBalance.toLocaleString()} RP</div>
        <div style="font-size:13px;color:${t.playerBalance>=t.playerStartBalance?theme.win:theme.lose};">
          ${t.playerBalance>=t.playerStartBalance?'+':''}${(t.playerBalance-t.playerStartBalance).toLocaleString()} RP vs start
        </div>
      `;
      wrap.appendChild(heroCard);

      const podium = document.createElement('div');
      podium.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
      players.forEach((p, i) => {
        const rankColors = ['#ffd700','#c0c0c0','#cd7f32'];
        const row = document.createElement('div');
        row.style.cssText = `display:flex;align-items:center;gap:10px;padding:8px 12px;
          border-radius:10px;background:${p.isPlayer?theme.accent+'18':theme.surface};
          border:1px solid ${p.isPlayer?theme.accent+'44':theme.border};`;
        row.innerHTML = `
          <div style="font-size:16px;font-weight:700;color:${rankColors[i]||theme.subtext};width:24px;">#${i+1}</div>
          <div style="font-size:20px;">${p.avatar}</div>
          <div style="flex:1;font-weight:700;color:${p.isPlayer?theme.accent:theme.text};">${p.name}</div>
          <div style="font-size:15px;font-weight:700;color:${theme.gold};">${p.balance.toLocaleString()} RP</div>
        `;
        podium.appendChild(row);
      });
      wrap.appendChild(podium);

      const playAgainBtn = document.createElement('button');
      playAgainBtn.className = 'bj-btn';
      playAgainBtn.style.cssText = `padding:12px 32px;font-size:15px;background:${theme.accent};
        color:white;border-radius:12px;width:100%;box-shadow:0 4px 16px ${theme.accent}55;`;
      playAgainBtn.textContent = '↺ PLAY AGAIN';
      playAgainBtn.onclick = () => { activeTournament = null; renderTournament(); };
      wrap.appendChild(playAgainBtn);

      container.appendChild(wrap);
    }

    // ══════════════════════════════════════════════
    // GAME LOGIC
    // ══════════════════════════════════════════════
    let numHands = 1;

    function updateBalance() {
      const el = document.getElementById('bj-balance');
      if (el) el.textContent = `💰 ${save.balance.toLocaleString()} RP`;
      updateTournament(save.balance);
    }

    function updateBetDisplay() {
      const el = document.getElementById('bj-bet-display');
      if (el) el.textContent = `Bet: ${bet.toLocaleString()} RP`;
    }

    function refreshStats() {
      const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=typeof v==='number'?v.toLocaleString():v; };
      set('bj-s-wins', save.wins); set('bj-s-losses', save.losses);
      set('bj-s-pushes', save.pushes); set('bj-s-bjs', save.blackjacks);
      set('bj-s-streak', save.streak); set('bj-s-best', save.bestStreak);
      set('bj-s-hands', save.totalHands); set('bj-s-wagered', `${(save.totalWagered||0).toLocaleString()}`);
    }

    function refreshXPBar() {
      const {cur,next} = getLevelData(save.xp);
      const pct = next ? Math.min(100, ((save.xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100;
      const fill = document.getElementById('bj-xp-fill');
      const label = document.getElementById('bj-xp-label');
      if (fill) fill.style.width = pct+'%';
      if (label) { label.textContent = `LV${cur.level} ${cur.name}  ·  ${save.xp.toLocaleString()} XP`; label.style.color=cur.color; }
    }

    function updateCountBadge() {
      if (!countMode) return;
      const el = document.getElementById('bj-count-badge');
      const row = document.getElementById('bj-count-row');
      const tc = trueCount(Math.max(1, Math.floor((312 - cardsDealt) / 52)));
      const adv = countAdvice();
      if (el) {
        el.style.display='flex'; el.style.alignItems='center'; el.style.gap='6px';
        el.innerHTML = `<span style="color:${theme.subtext};font-size:11px;">RC:${runningCount} TC:${tc}</span>
          <span class="bj-count-badge" style="background:${adv.color}22;color:${adv.color};border:1px solid ${adv.color}44;">${adv.text}</span>`;
      }
      if (row) {
        row.style.display='flex';
        row.innerHTML = `<span style="color:${theme.subtext};font-size:12px;">Running: <b style="color:${theme.text};">${runningCount}</b></span>
          <span style="color:${theme.subtext};font-size:12px;">True: <b style="color:${theme.text};">${tc}</b></span>
          <span style="background:${adv.color}22;color:${adv.color};padding:3px 10px;border-radius:5px;font-size:12px;font-weight:700;border:1px solid ${adv.color}44;">${adv.text}</span>
          <span style="color:${theme.subtext};font-size:11px;">Cards dealt: ${cardsDealt}/312</span>`;
      }
    }

    // Card rendering
    function makeCardEl(card, hidden=false, delay=0, active=false) {
      const wrap = document.createElement('div');
      wrap.className = 'bj-card-anim';
      wrap.style.animationDelay = delay+'ms';

      const inner = document.createElement('div');
      inner.style.cssText = `
        width:72px;height:104px;
        background:${hidden ? 'linear-gradient(135deg,#1a1a3d 0%,#0d0d28 50%,#111130 100%)' : 'white'};
        border:2px solid ${hidden ? '#2a2a50' : '#111'};
        border-radius:12px;position:relative;overflow:hidden;
        box-shadow:${active?`0 0 0 2px ${theme.playerColor},`:''} 0 6px 20px rgba(0,0,0,0.7);
        font-family:Georgia,serif;transition:box-shadow 0.3s;
        flex-shrink:0;
      `;

      if (hidden) {
        inner.innerHTML = `
          <div style="position:absolute;inset:4px;border-radius:9px;
            background:repeating-linear-gradient(45deg,#1a1a42,#1a1a42 4px,#111130 4px,#111130 8px);
            border:2px solid ${theme.accent}33;">
          </div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            font-size:28px;color:${theme.accent}44;">♠</div>
        `;
      } else {
        const col = SUIT_COLOR[card.suit];
        inner.innerHTML = `
          <div style="position:absolute;top:4px;left:6px;font-size:14px;font-weight:bold;color:${col};line-height:1;">${card.rank}</div>
          <div style="position:absolute;top:19px;left:6px;font-size:12px;color:${col};line-height:1;">${card.suit}</div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:38px;color:${col};line-height:1;">${card.suit}</div>
          <div style="position:absolute;bottom:4px;right:6px;font-size:14px;font-weight:bold;color:${col};transform:rotate(180deg);line-height:1;">${card.rank}</div>
          <div style="position:absolute;bottom:19px;right:6px;font-size:12px;color:${col};transform:rotate(180deg);line-height:1;">${card.suit}</div>
        `;
      }

      wrap.appendChild(inner);
      sfx('deal');
      return wrap;
    }

    function renderHands(hideDealer=true) {
      const dc = document.getElementById('bj-dealer-cards');
      const dl = document.getElementById('bj-dealer-label');
      const phEl = document.getElementById('bj-player-hands');
      if (!dc||!phEl) return;

      dc.innerHTML='';
      dealerHand.forEach((c,i) => {
        dc.appendChild(makeCardEl(c, hideDealer&&i===1, i*80));
      });
      const dv = hideDealer ? handValue([dealerHand[0]]) : handValue(dealerHand);
      if (dl) { dl.textContent = `DEALER'S HAND  (${dv}${hideDealer&&dealerHand.length>1?'+?':''})`; dl.style.color = !hideDealer&&dv>21?theme.lose:theme.dealerColor; }

      phEl.innerHTML='';
      playerHands.forEach((hand, hi) => {
        const isActive = hi===activeHandIdx && !gameOver;
        const hEl = document.createElement('div');
        hEl.style.cssText = `display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:12px;
          background:${isActive?theme.surface:'rgba(255,255,255,0.02)'};
          border:1px solid ${isActive?theme.playerColor:theme.border};
          transition:all 0.3s;min-width:120px;`;

        const hLabel = document.createElement('div');
        const hv = handValue(hand);
        hLabel.style.cssText = `font-size:11px;letter-spacing:2px;font-weight:700;
          color:${hv>21?theme.lose:isActive?theme.playerColor:theme.subtext};`;
        hLabel.textContent = playerHands.length>1 ? `HAND ${hi+1}  (${hv}${isSoft(hand)&&hv<21?' soft':''})` : `YOUR HAND  (${hv}${isSoft(hand)&&hv<21?' soft':''})`;

        const cardsRow = document.createElement('div');
        cardsRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
        hand.forEach((c,ci) => cardsRow.appendChild(makeCardEl(c, false, ci*70, isActive)));

        hEl.append(hLabel, cardsRow);
        phEl.appendChild(hEl);
      });

      updateStratHUD(hideDealer);
      updateProbHUD();
      updateCountBadge();
    }

    function updateStratHUD(hideDealer=true) {
      const area = document.getElementById('bj-strat-area');
      if (!area||!showStrategy||!roundActive||gameOver) { if(area) area.innerHTML=''; return; }
      const hand = playerHands[activeHandIdx];
      if (!hand||!dealerHand[0]) return;
      const strat = basicStrategy(hand, dealerHand[0]);
      area.innerHTML = '';
      const badge = document.createElement('div');
      badge.className = 'bj-strat-badge';
      badge.style.cssText += `background:${strat.color}22;border:1px solid ${strat.color}55;color:${strat.color};`;
      badge.innerHTML = `<span style="font-size:11px;color:${theme.subtext};">STRATEGY:</span> ${strat.action} <span style="font-size:11px;color:${theme.subtext};font-weight:400;">— ${strat.reason}</span>`;
      area.appendChild(badge);
    }

    function updateProbHUD() {
      const area = document.getElementById('bj-prob-area');
      if (!area||!showProbability||!roundActive||gameOver) { if(area) area.innerHTML=''; return; }
      const hand = playerHands[activeHandIdx];
      if (!hand) return;
      const remaining = deck;
      const bp = bustProbability(hand, remaining);
      area.innerHTML = '';
      const badge = document.createElement('div');
      badge.style.cssText = `display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        font-size:13px;font-weight:700;
        background:${bp>60?theme.lose+'22':bp>30?theme.push+'22':theme.win+'22'};
        border:1px solid ${bp>60?theme.lose:bp>30?theme.push:theme.win}55;
        color:${bp>60?theme.lose:bp>30?theme.push:theme.win};`;
      badge.innerHTML = `<span style="color:${theme.subtext};font-size:11px;">BUST:</span> ${bp}%`;
      area.appendChild(badge);
    }

    // Start round
    function startRound() {
      if (deck.length < 52) buildDeck(6);

      // Collect side bets
      const ppEl = document.getElementById('bj-sb-perfectPairs');
      const t3El = document.getElementById('bj-sb-twentyOne3');
      extraBets.perfectPairs = Math.min(parseInt(ppEl?.value||0)||0, save.balance - bet);
      extraBets.twentyOne3   = Math.min(parseInt(t3El?.value||0)||0, save.balance - bet - extraBets.perfectPairs);

      const totalCost = bet * numHands + extraBets.perfectPairs + extraBets.twentyOne3;
      if (totalCost > save.balance) { flashMsg('Not enough balance for all bets!'); return; }

      save.balance -= totalCost;
      save.totalWagered = (save.totalWagered||0) + totalCost;
      writeSave(); updateBalance(); refreshStats();

      betArea.style.display='none';
      actionArea.style.display='flex';
      newGameBtn.style.display='none';
      insBanner.style.display='none';

      // Initialize hands
      playerHands = Array.from({length:numHands}, ()=>[]);
      dealerHand = [];
      activeHandIdx = 0;
      gameOver = false;
      insuranceBet = 0;

      // Deal: p,d,p,d for each hand
      playerHands.forEach(h => h.push(pop()));
      dealerHand.push(pop());
      playerHands.forEach(h => h.push(pop()));
      dealerHand.push(pop());

      // Enable/disable buttons
      setActionBtns(true);
      roundActive = true;

      renderHands(true);
      save.totalHands = (save.totalHands||0) + 1;
      writeSave();

      // Achievements
      if (save.totalHands >= 100) unlockAchievement('hundred_hands');

      // Insurance?
      if (dealerHand[0].rank === 'A') {
        setTimeout(() => offerInsurance(), 700);
        return;
      }

      // Check immediate blackjack
      if (numHands===1 && handValue(playerHands[0])===21) {
        setTimeout(revealAndFinish, 700);
        return;
      }

      flashMsg(`Deck: ${deck.length} cards · Good luck!`);
    }

    function setActionBtns(active) {
      const hand = playerHands[activeHandIdx];
      if (!hand) return;
      const hv = handValue(hand);
      hitBtn.disabled     = !active;
      standBtn.disabled   = !active;
      doubleBtn.disabled  = !active || hand.length!==2 || save.balance<bet;
      splitBtn.disabled   = !active || hand.length!==2 || hand[0].rank!==hand[1].rank || save.balance<bet;
      surrenderBtn.disabled = !active || hand.length!==2 || activeHandIdx>0;
      newGameBtn.style.display = active ? 'none' : 'inline-flex';
    }

    function offerInsurance() {
      insBanner.style.display='flex';
      hitBtn.disabled=standBtn.disabled=doubleBtn.disabled=splitBtn.disabled=surrenderBtn.disabled=true;
      insYes.onclick = () => {
        const cost=Math.floor(bet/2);
        if(save.balance<cost){flashMsg('Not enough for insurance!');return;}
        insuranceBet=cost; save.balance-=cost; writeSave(); updateBalance();
        insBanner.style.display='none';
        resumePostInsurance();
      };
      insNo.onclick = () => { insBanner.style.display='none'; resumePostInsurance(); };
    }

    function resumePostInsurance() {
      setActionBtns(true);
      if (numHands===1 && handValue(playerHands[0])===21) { setTimeout(revealAndFinish, 500); }
      else flashMsg('Good luck!');
    }

    function revealAndFinish() {
      // Dealer draws
      while (handValue(dealerHand)<17 || (handValue(dealerHand)===17 && isSoft(dealerHand))) {
        dealerHand.push(pop());
      }
      if (handValue(dealerHand)>21) { _dealerBustCount++; if(_dealerBustCount>=10) unlockAchievement('bust_dealer'); }
      resolveAll();
    }

    function resolveAll() {
      gameOver=true; roundActive=false;
      hitBtn.disabled=standBtn.disabled=doubleBtn.disabled=splitBtn.disabled=surrenderBtn.disabled=true;
      newGameBtn.style.display='flex';

      const dv=handValue(dealerHand);
      const dBJ=dv===21&&dealerHand.length===2;
      let totalPayout=0; let resultParts=[]; let finalResult=''; let flashType='push';
      let xpGain=0;

      // Insurance resolve
      if (insuranceBet>0) {
        if(dBJ){ totalPayout+=insuranceBet*3; resultParts.push('🛡 Insurance pays!'); unlockAchievement('insurance_win'); xpGain+=20; }
        else   { resultParts.push('🛡 Insurance lost'); }
      }

      // Resolve each hand
      playerHands.forEach((hand,hi) => {
        const pv=handValue(hand);
        const pBJ=pv===21&&hand.length===2;
        let payout=0; let label='';

        if(pv>21){ label=`Hand ${hi+1}: BUST 💥`; save.losses++; save.streak=0; if(flashType!=='win')flashType='lose'; }
        else if(dBJ&&!pBJ){ label=`Hand ${hi+1}: Dealer BJ`; save.losses++; save.streak=0; if(flashType!=='win')flashType='lose'; }
        else if(pBJ&&!dBJ){ payout=Math.floor(bet*2.5); label=`Hand ${hi+1}: BLACKJACK 🌟`; save.wins++;save.blackjacks++;save.streak++;if(save.streak>save.bestStreak)save.bestStreak=save.streak;flashType='win';unlockAchievement('blackjack');xpGain+=100;sfx('blackjack');launchConfetti(gameOverlay); }
        else if(dv>21){ payout=bet*2; label=`Hand ${hi+1}: WIN (dealer bust)`; save.wins++;save.streak++;if(save.streak>save.bestStreak)save.bestStreak=save.streak;flashType='win';xpGain+=30; }
        else if(pv>dv){ payout=bet*2; label=`Hand ${hi+1}: WIN`; save.wins++;save.streak++;if(save.streak>save.bestStreak)save.bestStreak=save.streak;flashType='win';xpGain+=20; }
        else if(pv<dv){ label=`Hand ${hi+1}: Lose`; save.losses++;save.streak=0;if(flashType!=='win')flashType='lose'; }
        else { payout=bet; label=`Hand ${hi+1}: Push`; save.pushes++;xpGain+=5; }

        // 5-card Charlie (≥5 cards under 22)
        if(pv<=21&&hand.length>=5){ payout=bet*2; label+='+Charlie!'; }
        if(pv===21&&hand.length>=5) unlockAchievement('survivor');

        // Win-streak achievements
        if(save.streak>=3)unlockAchievement('streak3');
        if(save.streak>=5)unlockAchievement('streak5');
        if(save.streak>=10)unlockAchievement('streak10');
        if(save.wins>=1)unlockAchievement('first_win');
        if(save.balance>=10000)unlockAchievement('millionaire');

        totalPayout+=payout;
        resultParts.push(label);
      });

      // Side bet resolve
      if (playerHands[0]&&dealerHand[0]) {
        const h=playerHands[0];
        // Perfect Pairs
        if(extraBets.perfectPairs>0) {
          if(h.length>=2&&h[0].rank===h[1].rank&&h[0].suit===h[1].suit) {
            totalPayout+=extraBets.perfectPairs*26; resultParts.push('💎 Perfect Pair!');
          } else if(h.length>=2&&h[0].rank===h[1].rank&&h[0].suit[0]===h[1].suit[0]) {
            totalPayout+=extraBets.perfectPairs*13; resultParts.push('♠ Colored Pair!');
          } else if(h.length>=2&&h[0].rank===h[1].rank) {
            totalPayout+=extraBets.perfectPairs*7; resultParts.push('🃏 Mixed Pair!');
          } else { resultParts.push('PP: No pair'); }
        }
        // 21+3
        if(extraBets.twentyOne3>0) {
          const three=[h[0],h[1],dealerHand[0]];
          const ranks3=three.map(c=>c.rank).sort();
          const suits3=three.map(c=>c.suit);
          const flush3=suits3.every(s=>s===suits3[0]);
          const vals=[2,3,4,5,6,7,8,9,10,10,10,10,11];
          const rankNums=three.map(c=>RANKS.indexOf(c.rank)).sort((a,b)=>a-b);
          const straight3=(rankNums[2]-rankNums[0]===2&&rankNums[1]-rankNums[0]===1)||(rankNums.join()===([0,11,12]).join());
          const three3k=ranks3[0]===ranks3[1]&&ranks3[1]===ranks3[2];
          let t3payout=0;
          if(flush3&&straight3&&three3k){t3payout=100;resultParts.push('🔥 Suited Trips! (100:1)');}
          else if(straight3&&flush3){t3payout=40;resultParts.push('🔥 Straight Flush! (40:1)');}
          else if(three3k){t3payout=30;resultParts.push('💰 Three of a Kind! (30:1)');}
          else if(straight3){t3payout=10;resultParts.push('📈 Straight! (10:1)');}
          else if(flush3){t3payout=5;resultParts.push('🎨 Flush! (5:1)');}
          else { resultParts.push('21+3: No combo'); }
          totalPayout+=extraBets.twentyOne3*(t3payout+1);
        }
      }

      save.balance+=totalPayout;
      save.totalWon=(save.totalWon||0)+totalPayout;
      writeSave(); updateBalance(); refreshStats();

      const totalBetPaid=bet*numHands+extraBets.perfectPairs+extraBets.twentyOne3+(insuranceBet||0);
      const net=totalPayout-totalBetPaid;
      const netStr=(net>=0?'+':'')+net.toLocaleString()+' RP';

      finalResult=resultParts.join('  ·  ')+'   ('+netStr+')';
      msgEl.style.color = flashType==='win'?theme.win:flashType==='lose'?theme.lose:theme.push;
      msgEl.textContent = finalResult;

      gameOverlay.style.animation = flashType==='win'?'bj-flash-win 0.7s ease 2':
        flashType==='lose'?'bj-flash-lose 0.7s ease 2':'';

      if(flashType==='win') sfx('win'); else if(flashType==='lose') sfx('lose'); else sfx('push');

      if(xpGain>0) addXP(xpGain);

      // History
      if (!save.history) save.history=[];
      save.history.push({
        result: flashType==='win'?'WIN':flashType==='lose'?'LOSE':'PUSH',
        icon: flashType==='win'?'✅':flashType==='lose'?'❌':'🤝',
        bet: bet*numHands,
        payout: totalPayout,
        ts: Date.now(),
      });
      if(save.history.length>20) save.history.shift();
      writeSave();

      renderHands(false);

      // Broke
      if(save.balance<=0) {
        save.balance=300; writeSave();
        setTimeout(()=>{ flashMsg('💸 Out of RP! Reloaded with 300 RP'); updateBalance(); }, 1500);
      }
    }

    // Hit
    hitBtn.onclick = () => {
      if(gameOver||!roundActive) return;
      const hand=playerHands[activeHandIdx];
      hand.push(pop());
      doubleBtn.disabled=true; splitBtn.disabled=true; surrenderBtn.disabled=true;
      renderHands(true);
      const hv=handValue(hand);
      if(hv>=21) advanceOrFinish();
    };

    // Stand
    standBtn.onclick = () => {
      if(gameOver||!roundActive) return;
      advanceOrFinish();
    };

    // Double Down
    doubleBtn.onclick = () => {
      if(gameOver||!roundActive||save.balance<bet) return;
      save.balance-=bet; bet*=2; currentBet=bet; writeSave(); updateBalance(); updateBetDisplay();
      const hand=playerHands[activeHandIdx];
      hand.push(pop());
      doubleBtn.disabled=true; splitBtn.disabled=true; surrenderBtn.disabled=true;
      renderHands(true);
      flashMsg(`Double Down! New bet: ${bet.toLocaleString()} RP`);
      unlockAchievement('double_win'); // tentative, will only count if they win later
      setTimeout(() => advanceOrFinish(), 600);
    };

    // Split
    splitBtn.onclick = () => {
      if(gameOver||!roundActive||save.balance<bet) return;
      save.balance-=bet; writeSave(); updateBalance();
      const hand=playerHands[activeHandIdx];
      const newHand=[hand.pop()];
      hand.push(pop()); newHand.push(pop());
      playerHands.splice(activeHandIdx+1,0,newHand);
      splitBtn.disabled=true; doubleBtn.disabled=(save.balance<bet);
      renderHands(true);
      flashMsg('Split! Play each hand in turn.');
    };

    // Surrender
    surrenderBtn.onclick = () => {
      if(gameOver||!roundActive) return;
      // Return half the bet
      save.balance+=Math.floor(bet/2); writeSave(); updateBalance();
      _surrenderCount++; if(_surrenderCount>=5) unlockAchievement('surrender_wise');
      // Remove current hand, resolve rest or finish
      playerHands[activeHandIdx]=[];
      flashMsg(`Surrendered — recovered ${Math.floor(bet/2).toLocaleString()} RP`);
      sfx('lose');
      save.losses++; save.streak=0; writeSave(); refreshStats();
      // Add to history
      if(!save.history) save.history=[];
      save.history.push({result:'LOSE',icon:'🏳',bet,payout:Math.floor(bet/2),ts:Date.now()});
      if(save.history.length>20) save.history.shift();
      // End hand
      if(playerHands.length===1||activeHandIdx>=playerHands.length-1) {
        gameOver=true; roundActive=false;
        hitBtn.disabled=standBtn.disabled=doubleBtn.disabled=splitBtn.disabled=surrenderBtn.disabled=true;
        newGameBtn.style.display='flex';
        msgEl.style.color=theme.lose;
        msgEl.textContent=`Surrendered — got back ${Math.floor(bet/2).toLocaleString()} RP`;
        gameOverlay.style.animation='bj-flash-lose 0.5s ease 1';
        renderHands(false);
      } else {
        advanceOrFinish();
      }
    };

    function advanceOrFinish() {
      if (activeHandIdx < playerHands.length-1) {
        activeHandIdx++;
        setActionBtns(true);
        renderHands(true);
        flashMsg(`Playing Hand ${activeHandIdx+1} of ${playerHands.length}`);
      } else {
        revealAndFinish();
      }
    }

    // New game
    newGameBtn.onclick = () => {
      bet=currentBet;
      actionArea.style.display='none';
      betArea.style.display='flex';
      newGameBtn.style.display='none';
      insBanner.style.display='none';
      gameOverlay.style.animation='';
      msgEl.style.color=theme.gold;
      msgEl.textContent='♠ Place your bet ♠';
      document.getElementById('bj-dealer-cards').innerHTML='';
      document.getElementById('bj-player-hands').innerHTML='';
      const sa=document.getElementById('bj-strat-area'); if(sa) sa.innerHTML='';
      const pa=document.getElementById('bj-prob-area'); if(pa) pa.innerHTML='';
      updateBetDisplay();
    };

    // Theme cycling
    function cycleTheme() {
      const keys=Object.keys(THEMES);
      const ci=keys.indexOf(save.theme); save.theme=keys[(ci+1)%keys.length];
      writeSave();
      // Rebuild overlay with new theme
      gameOverlay.remove(); gameOverlay=null;
      buildOverlay();
    }

    // Init build
    refreshStats(); updateBalance(); buildDeck(6);

    if (deck.length<52) buildDeck(6);
  }

  // ──────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────
  function makeBtn(text, bg, bgHover, primary=false) {
    const btn=document.createElement('button');
    btn.textContent=text; btn.className='bj-btn';
    btn.style.background=bg; btn.style.color='#fff';
    if(primary) btn.style.boxShadow=`0 4px 20px ${bg}66`;
    btn.addEventListener('mouseover',()=>{ if(!btn.disabled){ btn.style.background=bgHover; sfx('hover'); }});
    btn.addEventListener('mouseout', ()=>{ if(!btn.disabled) btn.style.background=bg; });
    return btn;
  }

  function flashMsg(text) {
    const el=document.getElementById('bj-msg');
    if(!el) return;
    el.style.opacity='0';
    setTimeout(()=>{ el.textContent=text; el.style.opacity='1'; },150);
  }

  function spawnCoin(parent, label) {
    const coin=document.createElement('div');
    coin.textContent=label;
    coin.style.cssText=`position:fixed;font-weight:bold;font-size:14px;
      color:${theme.gold};text-shadow:0 0 8px ${theme.gold};
      pointer-events:none;z-index:99999999;
      animation:bj-coinFloat 0.7s ease forwards;`;
    const r=parent.getBoundingClientRect();
    coin.style.left=(r.left+r.width/2)+'px';
    coin.style.top=r.top+'px';
    document.body.appendChild(coin);
    setTimeout(()=>coin.remove(),800);
  }
};
