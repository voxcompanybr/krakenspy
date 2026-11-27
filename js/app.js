(function () {
  'use strict';
  var $ = KSU.$, profile = null;

  KSU.captureUtms();

  var VOICE_M = 'Ricardo', VOICE_F = 'Camila';
  function tts(text, voice) {
    return 'https://api.streamelements.com/kappa/v2/speech?voice=' + (voice || VOICE_F) +
      '&text=' + encodeURIComponent(String(text || 'Oi').slice(0, 280));
  }

  var T = function (s) { return { t:'text', m:s }; };
  var A = function (d, x, me) { return { t:'audio', d:d, x:x, me:!!me }; };
  var P = function (g) { return { t:'photo', g:g }; };
  var R = function (u, txt, g) { return { t:'reel', u:u, x:txt, g:g }; };
  var C = function (lbl, tm) { return { t:'call', lbl:lbl, tm:tm }; };
  var D = function (v) { return { t:'day', v:v }; };

  var PEOPLE = [
    { id:'fer', name:'Fernanda', g:'f', msg:'Victor adivinha o que vc esqueceu aqui? kkkk', time:'3 h', unread:true, locked:false },
    { id:'viz', name:'Vitória', g:'f', msg:'Encaminhou um reels', time:'3 h', unread:true, locked:false },
    { id:'rob', name:'Roberta', g:'f', msg:'Blz depois a gente se fala', time:'5 h', unread:false, locked:true },
    { id:'and', name:'Andressa', g:'f', msg:'Manda mais sua tbm', time:'6 h', unread:false, locked:true },
    { id:'bru', name:'Bruna', g:'f', msg:'Jamais eu me sujeitaria a tudo isso...', time:'8 h', unread:false, locked:true },
    { id:'car', name:'Carla', g:'f', msg:'Oi, tudo bem?', time:'1 d', unread:false, locked:true },
    { id:'jul', name:'Juliana', g:'f', msg:'Encaminhou uma publicação', time:'1 d', unread:false, locked:true }
  ];

  var CONV = {
    fer: [
      D('2 DIAS ATRÁS, 09:31'), T('Bom dia {nome}'), T('lai melhorou??'), A('0:25', 'Bom dia amor, conseguiu dormir melhor hoje?', 1),
      T('Perdão pelo desafo'), T('Mas n sei o que eu faço'), T('Imagina'), A('0:41', 'Relaxa, foi só um desabafo, você não tem culpa de nada'), A('0:12', 'Mas sério, obrigada por me ouvir'), A('0:29', 'Você é a única pessoa que me entende de verdade', 1),
      T('Simm, vc sabe'), T('No rolo que eu tive com o {ex} foi a mesma coisa'), T('Se apaixonar por amante é foda te entendo'),
      D('ONTEM, 21:34'), T('Amor'), T('Ta podendo falar?'), { t:'text', m:'Oii bb', q:'Amor' },
      T('Perai que o {nome} ta aqui do lado, deixa eu ir pro quintal'), T('kkkkkkkk'), T('🐎🐎🐎 kkkk'),
      { t:'react', e:'😍' }, P(0), T('CARALHOOOOO'), T('Delicia demais'), { t:'react', e:'❤️❤️❤️' },
      { t:'vipcard' }, A('0:30', 'Olha o que eu acabei de mandar, sem censura mesmo'), A('0:07', 'Agora fala você'), T('Disso??'), { t:'react', e:'😍😍😍😍😍' },
      T('Cê ta me deixando mal acostumada {nome}'), A('0:11', 'Adivinha o que você esqueceu aqui em casa', 1), T('{nome} adivinha o que vc esqueceu aqui? kkkk')
    ],
    viz: [
      D('ONTEM, 18:45'), R('safadodesejo', 'no jogo cnc mtm 🤤', 0), T('kkkkkkkkkkkk'), A('0:23', 'Mano do céu, olha o nível desses dois'), { t:'react', e:'😍' },
      R('fettrem', 'AFFF', 1), T('Esse casal é a gente em 2030, anota'), R('safadodesejo', 'olha isso', 2),
      T('Já vi, tu manda igual'), R('jonas.milgrau', 'João Pedro está no prime.', 3), T('kkkkkkkkk esse dai não perdoa'),
      D('18:17'), R('safadodesejo', 'aqui na {cidade} tá assim hoje', 0), T('Sério que tu foi sem mim??'), T('Vou te bater'),
      A('0:18', 'Vem cá que eu te mostro direito como é que faz', 1), T('Manda a localização exata'), R('jonas.milgrau', 'cê vai amar', 2), T('Amém'), { t:'vipcard' },
      T('Depois te mando as fotos que tirei'), T('Só não mostra pro {ex} kkkk'), A('0:09', 'Prometo que não conto pra ninguém'), T('Encaminhou um reels')
    ],
    rob: [
      D('3 DIAS ATRÁS, 22:10'), T('Oi'), T('Cê tá acordado?'), A('0:41', 'Desculpa te chamar tão tarde, mas hoje o {ex} me chamou de novo'), T('Pergunto porque hoje o {ex} me chamou de novo'),
      A('0:12', 'Eu sei que não devia, mas respondi', 1), T('Eu sei que não devia mas respondi'), T('Imagina'), T('Se apaixonar por amante é foda te entendo'),
      D('ONTEM, 09:31'), T('Bom dia {nome}'), T('lai melhorou??'), A('4:25', 'Bom dia, tô pensando aqui ainda em tudo que a gente conversou ontem', 1), T('Perdão pelo desafo'), T('Mas n sei o que eu faço'),
      { t:'vipcard' }, T('No fundo a gente sabe o que quer'), A('1:02', 'Sabe o que é pior? É que no fundo eu já sei a resposta e tenho medo dela'), T('Se for pra sofrer que seja por alguém que vale a pena'),
      A('0:16', 'Blz depois a gente se fala', 1), T('Blz depois a gente se fala')
    ],
    and: [
      D('2 DIAS ATRÁS, 16:10'), C('Chamada de vídeo', '16:10'), C('Ligação encerrada', '14:24'), T('Net tá ruim'),
      T('To no 4G'), T('Liga de novo'), A('0:22', 'Conseguiu me ver agora? A rede aqui tá horrível', 1), T('Deliciaaaaaaaaaaa'), { t:'react', e:'😍😍😍' }, T('Manda mais sua tbm'),
      P(1), { t:'vipcard' }, P(2), T('Meu Deus'), P(0), T('Calma que eu ainda não terminei'), A('0:33', 'Calma que eu ainda não terminei de mandar, tem mais'),
      T('Kkkkkk'), A('0:14', 'Tô aqui na {cidade} essa semana, se quiser marcar alguma coisa', 1), T('Tô aqui na {cidade} essa semana'), T('Sem compromisso, óbvio')
    ],
    bru: [
      D('5 DIAS ATRÁS, 20:04'), R('relacionamentos', 'O amor é uma escolha diária', 3), T('Já viu esse?'),
      T('É exatamente a gente'), A('0:47', 'Fala sério {nome}, você sabe que é exatamente a nossa história', 1), T('Fala sério {nome}, você sabe que é'), { t:'vipcard' },
      T('A gente não terminou por falta de amor'), A('1:12', 'A gente não terminou por falta de amor, terminou por orgulho e você sabe disso'), T('Por favor {nome}'), T('Vamos ser felizes'),
      T('Jamais eu me sujeitaria a tudo isso se o sentimento não tivesse no topo.')
    ],
    car: [
      D('1 SEMANA ATRÁS'), T('Oi, tudo bem?'), T('Faz tempo né'), A('0:19', 'Oi, tudo bem? Sei que faz tempo, mas lembrei de você hoje do nada'), T('Lembrei de vc do nada hoje'),
      { t:'vipcard' }, T('Sei que é aleatório mas queria saber como vc ta'), A('0:08', 'Me responde quando puder, sem pressa'), T('Me responde quando puder')
    ],
    jul: [
      D('1 SEMANA ATRÁS, 11:20'), R('safadodesejo', 'aqui na {cidade} é isso', 0), T('Encaminhou uma publicação'),
      T('Isso é a sua cara'), A('0:26', 'Olha o tamanho da cara de pau dessa pessoa, juro'), { t:'vipcard' }, T('Olha o tamanho da cara de pau kkkkk'), T('Saudade de vc, viu')
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
  function avatarOf(pessoa, seed) {
    return 'https://i.pravatar.cc/160?u=' + encodeURIComponent(seed + '-' + pessoa);
  }
  function photoSrc(i) {
    var ph = (profile && profile.photos) || [];
    if (ph.length) return ph[i % ph.length];
    return 'https://picsum.photos/seed/' + encodeURIComponent((profile && profile.username) || 'ks') + i + '/600/800';
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
    PEOPLE.forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return;
    var p = profile;
    var nome = nomeDe(p), cidade = cidadeDe(p), msgs = CONV[id] || [];
    var hardLocked = c.locked && !KSU.isVip();
    var voice = c.g === 'f' ? VOICE_F : VOICE_M;

    $('cvAv').src = avatarOf(c.name, c.id);
    $('cvName').textContent = c.name.slice(0, 3).toLowerCase() + '*****';
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
        var txt = String(m.x || '').replace(/\{nome\}/g, nome).replace(/\{ex\}/g, 'Rafael').replace(/\{cidade\}/g, cidade);
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
        bub.innerHTML = '<div class="reel-head"><img src="' + avatarOf(c.name, c.id) + '" alt=""><span>' + KSU.esc(m.u) + '</span></div><div class="reel-thumb" style="background:' + gradient(m.g) + ';overflow:hidden">' + PLAYI + '</div>';
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
    PEOPLE.slice(0, 3).forEach(function (c) {
      var d = document.createElement('div'); d.className = 'story';
      d.innerHTML = '<div class="ring"><img src="' + avatarOf(c.name, c.id) + '" alt=""></div><p>' + KSU.esc(c.name.slice(0, 3).toLowerCase()) + '*****</p>';
      $('stories').appendChild(d);
    });
    $('chats').innerHTML = PEOPLE.map(function (c) {
      var lock = c.locked && !KSU.isVip();
      var mark = lock ? LOCKI.replace('<svg', '<svg class="lock"') : (c.unread ? '<span class="dot"></span>' : '');
      var msg = c.msg.replace('Victor', nomeDe(profile));
      return '<li class="chat" data-id="' + c.id + '"><img class="av" src="' + avatarOf(c.name, c.id) + '" alt=""><div class="info"><div class="nm">' + KSU.esc(c.name.slice(0, 3).toLowerCase()) + '*****</div><div class="last">' + KSU.esc(msg) + '</div></div><div class="meta"><span class="tm">' + KSU.esc(c.time) + '</span><span class="dot-wrap">' + mark + '</span></div></li>';
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
