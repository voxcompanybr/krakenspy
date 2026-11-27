(function () {
  'use strict';
  var $ = KSU.$, profile = null, CTX = null, PEOPLE = [], CONV = {};

  KSU.captureUtms();

  var VOICE_M = 'Ricardo', VOICE_F = 'Camila';
  function tts(text, voice) {
    return 'https://api.streamelements.com/kappa/v2/speech?voice=' + (voice || VOICE_F) +
      '&text=' + encodeURIComponent(String(text || 'Oi').slice(0, 280));
  }

  var T = function (s) { return { t: 'text', m: s }; };
  var A = function (d, x, me) { return { t: 'audio', d: d, x: x, me: !!me }; };
  var P = function (g) { return { t: 'photo', g: g }; };
  var R = function (u, txt, g) { return { t: 'reel', u: u, x: txt, g: g }; };
  var C = function (lbl, tm) { return { t: 'call', lbl: lbl, tm: tm }; };
  var D = function (v) { return { t: 'day', v: v }; };

  /* ---------- RNG determinístico ---------- */
  function prng(seed) {
    seed = seed >>> 0;
    return function () {
      seed = (seed + 0x6D2B79F5) >>> 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), tmp = arr[i];
      arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }
  function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
  function hm(rng) {
    return String(Math.floor(rng() * 24)).padStart(2, '0') + ':' + String(Math.floor(rng() * 60)).padStart(2, '0');
  }
  function dur(rng) { return '0:' + String(6 + Math.floor(rng() * 50)).padStart(2, '0'); }

  /* ---------- pools ---------- */
  var NAMES = ['Fernanda','Vitória','Roberta','Andressa','Bruna','Carla','Juliana','Larissa','Camila','Patrícia','Renata','Tatiane','Débora','Aline','Simone','Vanessa','Priscila','Mariana','Letícia','Gabriela','Isabela','Manuela','Rafaela','Bianca','Jéssica','Sabrina','Elaine','Michele','Cristina','Sandra'];
  var EX = ['Rafael','Diego','Bruno','Lucas','Thiago','Gustavo','Felipe','Rodrigo','Leonardo','Marcelo','André','Vinícius'];

  var OPEN = [
    'Oi {nome}, tudo bem?',
    'Cê tá acordado?',
    'Sei que faz tempo que a gente não se fala',
    'Mas precisei desabafar com alguém',
    'Prometo que é rapidinho',
    'Aconteceu uma coisa hoje e só lembrei de você',
    'Posso te contar uma coisa?',
    'Não é nada demais, relaxa',
    'Só não quero falar com mais ninguém sobre isso',
    'Oi, tudo bem? Sei que é aleatório',
    'Tô aqui pensando em tanta coisa'
  ];

  var MID = [
    'O {ex} me chamou de novo',
    'Juro que dessa vez eu não ia responder',
    'Mas respondi, óbvio',
    'Sei que devia ter mais firmeza',
    'Aqui na {cidade} todo mundo comenta',
    'Tô cansada de ser a que cede sempre',
    'No fundo eu já sei a resposta e tenho medo dela',
    'Você é a única pessoa que me entende de verdade',
    'Se for pra sofrer que seja por alguém que vale a pena',
    'A gente não terminou por falta de amor',
    'Terminou por orgulho e você sabe disso',
    'Fala sério {nome}, você sabe que é exatamente a nossa história',
    'Imagina',
    'kkkkkkkkkk',
    'Vou te mandar o print',
    'Mas não espalha',
    'Tô rindo de nervoso',
    'Meu Deus do céu',
    'E ele ainda acha que tá certo',
    'Sem noção demais'
  ];

  var SHORT = ['Sim', 'Não', 'Kkkk', 'Uhum', 'Tô aqui', 'Depois', 'Entendi', 'Sério?', 'Ah tá', 'Pois é'];

  var CLOSE = [
    'Depois a gente se fala',
    'Me responde quando puder, sem pressa',
    'Blz',
    'Saudade de vc, viu',
    'Amanhã te conto o resto',
    'Vou dormir que amanhã é cedo',
    'Boa noite {nome}',
    'Obrigada por me ouvir',
    'Você é diferente de todo mundo'
  ];

  var AUD = [
    'Bom dia amor, conseguiu dormir melhor hoje?',
    'Relaxa, foi só um desabafo, você não tem culpa de nada',
    'Mas sério, obrigada por me ouvir',
    'Adivinha o que você esqueceu aqui em casa',
    'Desculpa te chamar tão tarde, mas hoje o {ex} me chamou de novo',
    'Sabe o que é pior? É que no fundo eu já sei a resposta',
    'Olha o que eu acabei de mandar, sem censura mesmo',
    'Tô aqui na {cidade} essa semana, se quiser marcar alguma coisa',
    'Prometo que não conto pra ninguém',
    'Calma que eu ainda não terminei de mandar, tem mais',
    'Cê não tem ideia do tamanho da cara de pau dessa pessoa'
  ];

  var REELS = [
    ['safadodesejo', 'no jogo cnc mtm 🤤'],
    ['fettrem', 'AFFF'],
    ['jonas.milgrau', 'João Pedro está no prime.'],
    ['relacionamentos', 'O amor é uma escolha diária'],
    ['safadodesejo', 'aqui na {cidade} tá assim hoje'],
    ['safadodesejo', 'olha isso'],
    ['jonas.milgrau', 'cê vai amar']
  ];

  var REAC = ['😍', '❤️', '❤️❤️❤️', '😍😍😍', '🔥', '🥵', '😍😍😍😍😍'];
  var TONES = ['normal', 'audio', 'audio', 'reel', 'textao', 'seco'];

  var PLAYI = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var LOCKI = '<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z"/></svg>';
  var MUTEI = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m16 9 5 6M21 9l-5 6" stroke="#8e8e93" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';

  /* ---------- contexto do perfil ---------- */
  function nomeDe(p) { return String(p.full_name || p.username).split(' ')[0]; }
  function cidadeDe(p) { var m = String(p.bio || '').match(/📍\s*([^|,·✦]+)/); return m ? m[1].trim() : 'São Paulo'; }

  function gradient(k) {
    var gs = ['linear-gradient(160deg,#7d5a4a,#3b2a24)','linear-gradient(160deg,#5c4a63,#2a2130)','linear-gradient(160deg,#4a5c63,#20282c)','linear-gradient(160deg,#6b5a3f,#2c2418)'];
    return gs[String(k == null ? 'a' : k).charCodeAt(0) % gs.length];
  }
  function avatarOf(pessoa, seed) {
    return 'https://i.pravatar.cc/160?u=' + encodeURIComponent(seed + '-' + pessoa);
  }
  function photoSrc(i) {
    var ph = (profile && profile.photos) || [];
    if (ph.length) return KSU.img(ph[i % ph.length]);
    return 'https://picsum.photos/seed/' + encodeURIComponent((profile && profile.username) || 'ks') + i + '/600/800';
  }
  function fill(s) {
    return String(s || '')
      .replace(/\{nome\}/g, CTX.nome)
      .replace(/\{ex\}/g, CTX.ex)
      .replace(/\{cidade\}/g, CTX.cidade);
  }

  /* ---------- gerador de conversa ---------- */
  function buildConv(ctx, rng, tone) {
    var out = [];
    var used = 0;
    var maxPhotos = ctx.fotos.length ? Math.min(ctx.fotos.length, 1 + Math.floor(rng() * 3)) : 0;
    var audios = 1 + Math.floor(rng() * 2);
    var reels = rng() < 0.45 ? 1 + Math.floor(rng() * 2) : 0;

    if (tone === 'audio') { audios += 2; maxPhotos = Math.max(0, maxPhotos - 1); }
    if (tone === 'reel') { reels += 2; }
    if (tone === 'textao') { reels = 0; }
    if (tone === 'seco') { audios = 1; reels = 0; maxPhotos = Math.min(maxPhotos, 1); }

    function say() { out.push(T(pick(tone === 'seco' ? SHORT : MID, rng))); }
    function photo() { if (used < maxPhotos) out.push(P(used++)); }
    function react() { out.push({ t: 'react', e: pick(REAC, rng) }); }
    function audio(me) { out.push(A(dur(rng), pick(AUD, rng), me)); }
    function reel() { var r = pick(REELS, rng); out.push(R(r[0], r[1], Math.floor(rng() * 4))); }

    out.push(D('3 DIAS ATRÁS, ' + hm(rng)));
    out.push(T(pick(OPEN, rng)));
    if (rng() < 0.7) out.push(T(pick(OPEN, rng)));
    if (tone === 'audio' || rng() < 0.45) audio(false);
    say();
    if (rng() < 0.6) say();
    while (reels-- > 0) { reel(); out.push(T('kkkkkkkkk')); }

    if (rng() < 0.25) { out.push(C('Chamada de vídeo', hm(rng))); out.push(C('Ligação encerrada', hm(rng))); }

    out.push(D('ONTEM, ' + hm(rng)));
    say();
    if (audios-- > 0) audio(false);
    var pre = Math.min(2, maxPhotos);
    for (var i = 0; i < pre; i++) { photo(); if (rng() < 0.55) react(); }
    out.push({ t: 'vipcard' });
    if (audios > 0) audio(true);
    while (used < maxPhotos) { photo(); if (rng() < 0.4) react(); }
    if (rng() < 0.5) say();
    out.push(T(pick(CLOSE, rng)));
    out.push(T(pick(CLOSE, rng)));
    return out;
  }

  function preview(conv) {
    for (var i = conv.length - 1; i >= 0; i--) {
      var m = conv[i];
      if (m.t === 'text') return fill(m.m).slice(0, 46);
      if (m.t === 'audio') return '🎤 Áudio (' + m.d + ')';
      if (m.t === 'photo') return '📷 Foto';
      if (m.t === 'reel') return 'Encaminhou um reels';
      if (m.t === 'call') return m.lbl;
    }
    return 'Oi';
  }

  function buildPeople(ctx) {
    var rng = prng(KSU.hash(profile.username + '|people'));
    var total = Math.min(8, Math.max(5, 4 + Math.floor(rng() * 5)));
    var names = shuffle(NAMES.slice(), rng).slice(0, total);
    var tones = shuffle(TONES.slice(), rng);
    var times = ['agora', '12 min', '48 min', '2 h', '3 h', '5 h', '8 h', '1 d'];
    var list = [];

    for (var i = 0; i < total; i++) {
      var id = 'c' + i;
      var tone = tones[i % tones.length];
      var conv = buildConv(ctx, rng, tone);
      CONV[id] = conv;
      list.push({
        id: id,
        name: names[i],
        g: 'f',
        tone: tone,
        locked: i >= KS.freeChats,
        unread: i < 2,
        msg: preview(conv),
        time: times[i] || '1 d'
      });
    }
    return list;
  }

  /* ---------- paywall ---------- */
  function goCheckout() {
    location.href = '/checkout.html?u=' + encodeURIComponent((profile && profile.username) || '');
  }
  function openVip(msg) {
    if (KSU.isVip()) { KSU.toast('Você já é VIP.'); return; }
    $('vipMsg').textContent = msg || 'Libere o painel completo do KrakenSpy com o acesso VIP';
    $('vipModal').classList.add('open');
    KSU.track('ViewContent', { content_name: 'paywall' });
  }

  /* ---------- render da conversa ---------- */
  function renderChat(id) {
    var c = null;
    PEOPLE.forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return;

    var msgs = CONV[id] || [];
    var hardLocked = c.locked && !KSU.isVip();
    var voice = c.g === 'f' ? VOICE_F : VOICE_M;

    $('cvAv').src = KSU.img(avatarOf(c.name, c.id));
    $('cvName').textContent = c.name.slice(0, 3).toLowerCase() + '*****';
    $('cvStatus').textContent = ['Online', 'Online há 1 min', 'Online há 2 h'][msgs.length % 3];

    var body = $('cvBody');
    body.innerHTML = '';
    var gateDone = false, total = msgs.length;

    msgs.forEach(function (m, i) {
      if (m.t === 'day') {
        var d = document.createElement('div');
        d.className = 'day';
        d.textContent = m.v;
        body.appendChild(d);
        return;
      }

      if (m.t === 'vipcard') {
        if (!hardLocked) {
          var vc = document.createElement('div');
          vc.className = 'vipcard';
          vc.innerHTML = MUTEI + '<p>Libere os áudios com o acesso VIP</p><div class="dots">•••••••••••••••••</div><button>Desbloquear áudio</button>';
          vc.onclick = function () { openVip('Os áudios e as transcrições fazem parte do acesso VIP.'); };
          body.appendChild(vc);
        }
        return;
      }

      var dist = total - 1 - i, bl = 0;
      if (hardLocked) bl = 2;
      else if (dist >= 13) bl = 2;
      else if (dist >= 6) bl = 1;

      if (bl === 2 && !gateDone) {
        var g = document.createElement('div');
        g.className = 'gate';
        g.innerHTML = LOCKI + (hardLocked
          ? '<b>Conversa bloqueada</b><span>Este contato faz parte do acesso VIP do KrakenSpy.</span><button>Desbloquear conversa</button>'
          : '<b>Histórico completo bloqueado</b><span>Desbloqueie o VIP para ver as mensagens anteriores, fotos e transcrições.</span><button>Liberar histórico</button>');
        g.onclick = function () { openVip('O histórico completo desta conversa faz parte do acesso VIP.'); };
        body.appendChild(g);
        gateDone = true;
      }

      var wrap = document.createElement('div');
      wrap.className = 'msg' + (m.me ? ' me' : '') + (bl === 1 ? ' bl' : '') + (bl === 2 ? ' hard' : '');

      if (!m.me) {
        var av = document.createElement('div');
        av.className = 'mav';
        av.style.background = gradient(c.id);
        wrap.appendChild(av);
      }

      var bub = document.createElement('div');

      if (m.t === 'text') {
        bub.className = 'bub';
        bub.innerHTML = KSU.esc(fill(m.m));
      } else if (m.t === 'react') {
        bub.className = 'bub';
        bub.style.fontSize = '20px';
        bub.style.padding = '4px 10px';
        bub.textContent = m.e;
      } else if (m.t === 'audio') {
        bub.className = 'bub audio';
        var bars = '', seed = KSU.hash(c.id + i);
        for (var b = 0; b < 30; b++) bars += '<i style="height:' + (30 + ((seed >> (b % 9)) % 70)) + '%"></i>';
        var txt = fill(m.x);
        bub.innerHTML = '<div class="a-top"><button class="play">' + PLAYI + '</button><div class="wave">' + bars + '</div><span class="dur">' + KSU.esc(m.d) + '</span></div><span class="tr" style="cursor:pointer">Ver transcrição</span><div class="tt" style="display:none;font-size:12.5px;line-height:1.45;opacity:.85;margin-top:6px">' + KSU.esc(txt) + '</div>';

        var au = new Audio(tts(txt, voice));
        var pb = bub.querySelector('.play'), tr = bub.querySelector('.tr'), tt = bub.querySelector('.tt');
        pb.onclick = function () {
          if (bl > 0) { openVip('Os áudios e as transcrições fazem parte do acesso VIP.'); return; }
          if (au.paused) { au.play(); pb.classList.add('on'); } else { au.pause(); pb.classList.remove('on'); }
        };
        au.onended = function () { pb.classList.remove('on'); };
        tr.onclick = function () {
          if (bl > 0) { openVip('Os áudios e as transcrições fazem parte do acesso VIP.'); return; }
          tt.style.display = tt.style.display === 'none' ? 'block' : 'none';
        };
      } else if (m.t === 'photo') {
        bub.className = 'bub photo';
        bub.innerHTML = '<div class="ph" style="background:' + gradient(m.g) + ';overflow:hidden"><img src="' + photoSrc(m.g || 0) + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></div>';
        if (bl > 0) bub.querySelector('img').style.filter = 'blur(7px)';
      } else if (m.t === 'reel') {
        bub.className = 'bub reel';
        bub.innerHTML = '<div class="reel-head"><img src="' + KSU.img(avatarOf(c.name, c.id)) + '" alt=""><span>' + KSU.esc(fill(m.u)) + '</span></div><div class="reel-thumb" style="background:' + gradient(m.g) + ';overflow:hidden">' + PLAYI + '</div>';
      } else if (m.t === 'call') {
        bub.className = 'bub call';
        bub.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 11 5-3v8l-5-3z"/></svg><div><b>' + KSU.esc(m.lbl) + '</b><small>' + KSU.esc(m.tm) + '</small></div>';
      }

      wrap.appendChild(bub);
      body.appendChild(wrap);
    });

    if (!hardLocked) {
      var nodes = Array.prototype.slice.call(body.children).filter(function (x) { return x.className.indexOf('msg') === 0; });
      if (nodes.length > 6) {
        var nd = document.createElement('div');
        nd.className = 'newdiv';
        nd.textContent = 'Novas mensagens';
        body.insertBefore(nd, nodes[nodes.length - 6]);
      }
    }

    body.scrollTop = body.scrollHeight;
    $('viewChat').hidden = false;
    document.body.classList.add('chat-open');
  }

  /* ---------- render do painel ---------- */
  function renderApp() {
    profile = KSU.getProfile();
    if (!profile || !profile.username) { location.replace('/'); return; }

    CTX = {
      nome: nomeDe(profile),
      cidade: cidadeDe(profile),
      ex: EX[KSU.hash(profile.username + '|ex') % EX.length],
      fotos: profile.photos || []
    };

    $('acct').textContent = profile.username;

    $('stories').innerHTML = '<div class="story own"><div class="ring"><div class="own-badge"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#f5f5f5" stroke-width="2" fill="none"/></svg></div></div><p>Sua nota</p></div>';

    CONV = {};
    PEOPLE = buildPeople(CTX);

    PEOPLE.slice(0, 3).forEach(function (c) {
      var d = document.createElement('div');
      d.className = 'story';
      d.innerHTML = '<div class="ring"><img src="' + avatarOf(c.name, c.id) + '" alt=""></div><p>' + KSU.esc(c.name.slice(0, 3).toLowerCase()) + '*****</p>';
      $('stories').appendChild(d);
    });

    $('chats').innerHTML = PEOPLE.map(function (c, idx) {
      var lock = (c.locked || idx >= KS.freeChats) && !KSU.isVip();
      var mark = lock ? LOCKI.replace('<svg', '<svg class="lock"') : (c.unread ? '<span class="dot"></span>' : '');
      return '<li class="chat" data-id="' + c.id + '">' +
        '<img class="av" src="' + avatarOf(c.name, c.id) + '" alt="">' +
        '<div class="info"><div class="nm">' + KSU.esc(c.name.slice(0, 3).toLowerCase()) + '*****</div>' +
        '<div class="last">' + KSU.esc(c.msg) + '</div></div>' +
        '<div class="meta"><span class="tm">' + KSU.esc(c.time) + '</span><span class="dot-wrap">' + mark + '</span></div></li>';
    }).join('');

    var req = document.querySelector('.req');
    if (req) req.textContent = 'Pedidos (' + PEOPLE.filter(function (c) { return c.locked; }).length + ')';

    if (KSU.isVip()) {
      document.body.classList.add('is-vip');
      $('vipbar').style.display = 'none';
    } else {
      document.body.classList.remove('is-vip');
      startClock();
    }
  }

  var clockOn = false;
  function startClock() {
    if (!KS.trialMinutes) { $('clock').textContent = '∞'; return; }
    if (clockOn) return;
    clockOn = true;
    var key = 'ks_deadline';
    var end = Number(localStorage.getItem(key));
    if (!end || end < Date.now()) { end = Date.now() + KS.trialMinutes * 60000; localStorage.setItem(key, end); }
    (function paint() {
      var left = Math.max(0, Math.round((end - Date.now()) / 1000));
      $('clock').textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      if (left <= 0) {
        if (!KSU.isVip()) openVip('Sua prévia terminou. Libere o painel completo com o acesso VIP.');
        return;
      }
      setTimeout(paint, 1000);
    })();
  }

  $('chats').onclick = function (e) {
    var li = e.target.closest('.chat');
    if (!li) return;
    renderChat(li.dataset.id);
  };
  $('cvBack').onclick = function () {
    $('viewChat').hidden = true;
    document.body.classList.remove('chat-open');
    $('cvBody').innerHTML = '';
  };
  $('vipBtn').onclick = function () { openVip(); };
  $('vipModal').onclick = function (e) { if (e.target.id === 'vipModal') $('vipModal').classList.remove('open'); };
  $('vipCta').onclick = goCheckout;
  $('backBtn').onclick = function () { location.href = '/'; };

  renderApp();
})();
