(function () {
  'use strict';
  var $ = KSU.$, profile = null;

  KSU.captureUtms();

  var CHATS = [
    { id:'fer', handle:'fer*****', msg:'Victor adivinha o que vc esqueceu aqui? kkkk', time:'3 h', unread:true, locked:false, avatar:'https://i.pravatar.cc/160?u=fernanda-ks' },
    { id:'viz', handle:'viz*****', msg:'Encaminhou um reels', time:'3 h', unread:true, locked:false, avatar:'https://i.pravatar.cc/160?u=vitoria-ks' },
    { id:'rob', handle:'rob*****', msg:'Blz depois a gente se fala', time:'5 h', unread:false, locked:true, avatar:'https://i.pravatar.cc/160?u=roberta-ks' },
    { id:'and', handle:'And*****', msg:'Manda mais sua tbm', time:'6 h', unread:false, locked:true, avatar:'https://i.pravatar.cc/160?u=andressa-ks' },
    { id:'bru', handle:'Bru*****', msg:'Jamais eu me sujeitaria a tudo isso...', time:'8 h', unread:false, locked:true, avatar:'https://i.pravatar.cc/160?u=bruna-ks' },
    { id:'car', handle:'car*****', msg:'Oi, tudo bem?', time:'1 d', unread:false, locked:true, avatar:'https://i.pravatar.cc/160?u=carla-ks' },
    { id:'jul', handle:'jul*****', msg:'Encaminhou uma publicação', time:'1 d', unread:false, locked:true, avatar:'https://i.pravatar.cc/160?u=juliana-ks' }
  ];

  var T = function (s) { return { t:'text', m:s }; };
  var A = function (d, me) { return { t:'audio', d:d, me:!!me }; };
  var P = function (g) { return { t:'photo', g:g }; };
  var R = function (u, txt, g) { return { t:'reel', u:u, x:txt, g:g }; };
  var C = function (lbl, tm) { return { t:'call', lbl:lbl, tm:tm }; };
  var D = function (v) { return { t:'day', v:v }; };

  var CONV = {
    fer: [
      D('2 DIAS ATRÁS, 09:31'), T('Bom dia {nome}'), T('lai melhorou??'), A('4:25', 1),
      T('Perdão pelo desafo'), T('Mas n sei o que eu faço'), T('Imagina'), A('0:41'), A('0:12'), A('0:29', 1),
      T('Simm, vc sabe'), T('No rolo que eu tive com o {ex} foi a mesma coisa'), T('Se apaixonar por amante é foda te entendo'),
      D('ONTEM, 21:34'), T('Amor'), T('Ta podendo falar?'), { t:'text', m:'Oii bb', q:'Amor' },
      T('Perai que o {nome} ta aqui do lado, deixa eu ir pro quintal'), T('kkkkkkkk'), T('🐎🐎🐎 kkkk'),
      { t:'react', e:'😍' }, P('a'), T('CARALHOOOOO'), T('Delicia demais'), { t:'react', e:'❤️❤️❤️' },
      { t:'vipcard' }, A('0:30'), A('0:07'), T('Disso??'), { t:'react', e:'😍😍😍😍😍' },
      T('Cê ta me deixando mal acostumada {nome}'), A('0:11', 1), T('{nome} adivinha o que vc esqueceu aqui? kkkk')
    ],
    viz: [
      D('ONTEM, 18:45'), R('safadodesejo', 'no jogo cnc mtm 🤤', 'a'), T('kkkkkkkkkkkk'), A('0:23'), { t:'react', e:'😍' },
      R('fettrem', 'AFFF', 'b'), T('Esse casal é a gente em 2030, anota'), R('safadodesejo', 'olha isso', 'a'),
      T('Já vi, tu manda igual'), R('jonas.milgrau', 'João Pedro está no prime.', 'c'), T('kkkkkkkkk esse dai não perdoa'),
      D('18:17'), R('safadodesejo', 'aqui na {cidade} tá assim hoje', 'a'), T('Sério que tu foi sem mim??'), T('Vou te bater'),
      A('0:18', 1), T('Manda a localização exata'), R('jonas.milgrau', 'cê vai amar', 'c'), T('Amém'), { t:'vipcard' },
      T('Depois te mando as fotos que tirei'), T('Só não mostra pro {ex} kkkk'), A('0:09'), T('Encaminhou um reels')
    ],
    rob: [
      D('3 DIAS ATRÁS, 22:10'), T('Oi'), T('Cê tá acordado?'), A('0:41'), T('Pergunto porque hoje o {ex} me chamou de novo'),
      A('0:12', 1), T('Eu sei que não devia mas respondi'), T('Imagina'), T('Se apaixonar por amante é foda te entendo'),
      D('ONTEM, 09:31'), T('Bom dia {nome}'), T('lai melhorou??'), A('4:25', 1), T('Perdão pelo desafo'), T('Mas n sei o que eu faço'),
      { t:'vipcard' }, T('No fundo a gente sabe o que quer'), A('1:02'), T('Se for pra sofrer que seja por alguém que vale a pena'),
      A('0:16', 1), T('Blz depois a gente se fala')
    ],
    and: [
      D('2 DIAS ATRÁS, 16:10'), C('Chamada de vídeo', '16:10'), C('Ligação encerrada', '14:24'), T('Net tá ruim'),
      T('To no 4G'), T('Liga de novo'), A('0:22', 1), T('Deliciaaaaaaaaaaa'), { t:'react', e:'😍😍😍' }, T('Manda mais sua tbm'),
      P('b'), { t:'vipcard' }, P('a'), T('Meu Deus'), P('c'), T('Calma que eu ainda não terminei'), A('0:33'),
      T('Kkkkkk'), A('0:14', 1), T('Tô aqui na {cidade} essa semana'), T('Sem compromisso, óbvio')
    ],
    bru: [
      D('5 DIAS ATRÁS, 20:04'), R('relacionamentos', 'O amor é uma escolha diária', 'd'), T('Já viu esse?'),
      T('É exatamente a gente'), A('0:47', 1), T('Fala sério {nome}, você sabe que é'), { t:'vipcard' },
      T('A gente não terminou por falta de amor'), A('1:12'), T('Por favor {nome}'), T('Vamos ser felizes'),
      T('Jamais eu me sujeitaria a tudo isso se o sentimento não tivesse no topo.')
    ],
    car: [
      D('1 SEMANA ATRÁS'), T('Oi, tudo bem?'), T('Faz tempo né'), A('0:19'), T('Lembrei de vc do nada hoje'),
      { t:'vipcard' }, T('Sei que é aleatório mas queria saber como vc ta'), A('0:08'), T('Me responde quando puder')
    ],
    jul: [
      D('1 SEMANA ATRÁS, 11:20'), R('safadodesejo', 'aqui na {cidade} é isso', 'a'), T('Encaminhou uma publicação'),
      T('Isso é a sua cara'), A('0:26'), { t:'vipcard' }, T('Olha o tamanho da cara de pau kkkkk'), T('Saudade de vc, viu')
    ]
  };

  var EYE = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Zm10 3.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/></svg>';
  var PLAYI = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var LOCKI = '<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z"/></svg>';
  var MUTEI = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m16 9 5 6M21 9l-5 6" stroke="#8e8e93" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';

  function nomeDe(p) { return String(p.full_name || p.username).split(' ')[0]; }
  function cidadeDe(p) { var m = String(p.bio || '').match(/📍\s*([^|,·]+)/); return m ? m[1].trim() : 'São Paulo'; }
  function gradient(k) {
    var gs = ['linear-gradient(160deg,#7d5a4a,#3b2a24)','linear-gradient(160deg,#5c4a63,#2a2130)','linear-gradient(160deg,#4a5c63,#20282c)','linear-gradient(160deg,#6b5a3f,#2c2418)'];
    return gs[String(k || 'a').charCodeAt(0) % gs.length];
  }

  function goCheckout() {
    location.href = '/checkout.html?u=' + encodeURIComponent((profile && profile.username) || '');
  }
  function openVip(msg) {
    if (KSU.isVip()) { KSU.toast('Você já é VIP.'); return; }
    $('vipMsg').textContent = msg || 'Libere o painel completo do KrakenSpy com o acesso VIP';
    $('vipModal').classList.add('open');
    KSU.track('ViewContent', { content_name: 'paywall' });
  }

  function renderChat(id) {
    var c = null;
    CHATS.forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return;
    var p = profile;
    var nome = nomeDe(p), cidade = cidadeDe(p), msgs = CONV[id] || [];
    var hardLocked = c.locked && !KSU.isVip();

    $('cvAv').src = c.avatar;
    $('cvName').textContent = c.handle;
    $('cvStatus').textContent = ['Online','Online há 1 min','Online há 2 h'][msgs.length % 3];

    var body = $('cvBody'); body.innerHTML = '';
    var gateDone = false, total = msgs.length;

    msgs.forEach(function (m, i) {
      if (m.t === 'day') {
        var d = document.createElement('div'); d.className = 'day'; d.textContent = m.v; body.appendChild(d); return;
      }
      if (m.t === 'vipcard') {
        if (!hardLocked) {
          var vc = document.createElement('div'); vc.className = 'vipcard';
          vc.innerHTML = MUTEI + '<p>Libere os áudios com o acesso VIP</p><div class="dots">•••••••••••••••••</div><button>Desbloquear áudio</button>';
          vc.onclick = function () { openVip('Os áudios e as transcrições fazem parte do acesso VIP.'); };
          body.appendChild(vc);
        }
        return;
      }
      var dist = total - 1 - i, bl = 0;
      if (hardLocked) bl = 2; else if (dist >= 13) bl = 2; else if (dist >= 6) bl = 1;

      if (bl === 2 && !gateDone) {
        var g = document.createElement('div'); g.className = 'gate';
        g.innerHTML = LOCKI + (hardLocked
          ? '<b>Conversa bloqueada</b><span>Este contato faz parte do acesso VIP do KrakenSpy.</span><button>Desbloquear conversa</button>'
          : '<b>Histórico completo bloqueado</b><span>Desbloqueie o VIP para ver as mensagens anteriores, fotos e transcrições.</span><button>Liberar histórico</button>');
        g.onclick = function () { openVip('O histórico completo desta conversa faz parte do acesso VIP.'); };
        body.appendChild(g); gateDone = true;
      }

      var wrap = document.createElement('div');
      wrap.className = 'msg' + (m.me ? ' me' : '') + (bl === 1 ? ' bl' : '') + (bl === 2 ? ' hard' : '');
      if (!m.me) {
        var av = document.createElement('div'); av.className = 'mav'; av.style.background = gradient(c.id);
        wrap.appendChild(av);
      }
      var bub = document.createElement('div');
      if (m.t === 'text') {
        bub.className = 'bub';
        var html = '';
        if (m.q) html += '<div class="quote"><b>' + KSU.esc(m.q) + '</b></div>';
        html += KSU.esc(String(m.m || '').replace(/\{nome\}/g, nome).replace(/\{ex\}/g, 'Rafael').replace(/\{cidade\}/g, cidade));
        bub.innerHTML = html;
      } else if (m.t === 'react') {
        bub.className = 'bub'; bub.style.fontSize = '20px'; bub.style.padding = '4px 10px'; bub.textContent = m.e;
      } else if (m.t === 'audio') {
        bub.className = 'bub audio';
        var bars = '', seed = KSU.hash(c.id + i);
        for (var b = 0; b < 30; b++) bars += '<i style="height:' + (30 + ((seed >> (b % 9)) % 70)) + '%"></i>';
        bub.innerHTML = '<div class="a-top"><button class="play">' + PLAYI + '</button><div class="wave">' + bars + '</div><span class="dur">' + KSU.esc(m.d) + '</span></div><span class="tr">Ver transcrição</span>';
      } else if (m.t === 'photo') {
        bub.className = 'bub photo';
        bub.innerHTML = '<div class="ph" style="background:' + gradient(m.g) + '">' + EYE + '</div>';
      } else if (m.t === 'reel') {
        bub.className = 'bub reel';
        bub.innerHTML = '<div class="reel-head"><img src="' + c.avatar + '" alt=""><span>' + KSU.esc(m.u) + '</span></div><div class="reel-thumb" style="background:' + gradient(m.g) + '">' + PLAYI + '</div>';
      } else if (m.t === 'call') {
        bub.className = 'bub call';
        bub.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 11 5-3v8l-5-3z"/></svg><div><b>' + KSU.esc(m.lbl) + '</b><small>' + KSU.esc(m.tm) + '</small></div>';
      }
      wrap.appendChild(bub);
      body.appendChild(wrap);
    });

    if (!hardLocked) {
      var texts = Array.prototype.slice.call(body.children).filter(function (x) { return x.className.indexOf('msg') === 0; });
      if (texts.length > 6) {
        var nd = document.createElement('div'); nd.className = 'newdiv'; nd.textContent = 'Novas mensagens';
        body.insertBefore(nd, texts[texts.length - 6]);
      }
    }

    body.scrollTop = body.scrollHeight;
    $('viewChat').hidden = false;
    document.body.classList.add('chat-open');
  }

  function renderApp() {
    profile = KSU.getProfile();
    if (!profile) { location.replace('/'); return; }
    $('acct').textContent = profile.username;
    $('stories').innerHTML = '<div class="story own"><div class="ring"><div class="own-badge"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#f5f5f5" stroke-width="2" fill="none"/></svg></div></div><p>Sua nota</p></div>';
    CHATS.slice(0, 3).forEach(function (c) {
      var d = document.createElement('div'); d.className = 'story';
      d.innerHTML = '<div class="ring"><img src="' + c.avatar + '" alt=""></div><p>' + KSU.esc(c.handle) + '</p>';
      $('stories').appendChild(d);
    });
    $('chats').innerHTML = CHATS.map(function (c) {
      var lock = c.locked && !KSU.isVip();
      var mark = lock ? LOCKI.replace('<svg', '<svg class="lock"') : (c.unread ? '<span class="dot"></span>' : '');
      return '<li class="chat" data-id="' + c.id + '"><img class="av" src="' + c.avatar + '" alt=""><div class="info"><div class="nm">' + KSU.esc(c.handle) + '</div><div class="last">' + KSU.esc(c.msg) + '</div></div><div class="meta"><span class="tm">' + KSU.esc(c.time) + '</span><span class="dot-wrap">' + mark + '</span></div></li>';
    }).join('');
    if (KSU.isVip()) { $('vipbar').style.display = 'none'; }
    else startClock();
  }

  var clockOn = false;
  function startClock() {
    if (clockOn) return; clockOn = true;
    var key = 'ks_deadline';
    var end = Number(localStorage.getItem(key));
    if (!end || end < Date.now()) { end = Date.now() + KS.trialMinutes * 60000; localStorage.setItem(key, end); }
    (function paint() {
      var left = Math.max(0, Math.round((end - Date.now()) / 1000));
      $('clock').textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      if (left <= 0) { if (!KSU.isVip()) openVip('Sua prévia terminou. Libere o painel completo com o acesso VIP.'); return; }
      setTimeout(paint, 1000);
    })();
  }

  $('chats').onclick = function (e) {
    var li = e.target.closest('.chat'); if (!li) return;
    renderChat(li.dataset.id);
  };
  $('cvBack').onclick = function () { $('viewChat').hidden = true; document.body.classList.remove('chat-open'); $('cvBody').innerHTML = ''; };
  $('vipBtn').onclick = function () { openVip(); };
  $('vipModal').onclick = function (e) { if (e.target.id === 'vipModal') $('vipModal').classList.remove('open'); };
  $('vipCta').onclick = goCheckout;
  $('backBtn').onclick = function () { location.href = '/'; };

  renderApp();
})();
