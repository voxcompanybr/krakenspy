(function () {
  'use strict';
  var $ = KSU.$, profile = null;

  if (new URLSearchParams(location.search).has('reset')) {
    ['ks_used','ks_vip','ks_deadline','ks_profile','ks_age'].forEach(function (k) { localStorage.removeItem(k); });
    Object.keys(localStorage).forEach(function (k) { if (k.indexOf('ks_cache_') === 0) localStorage.removeItem(k); });
  }

  KSU.captureUtms();
  if (window.fbq) window.fbq('track', 'PageView');

  var days = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  $('weekday').textContent = days[new Date().getDay()];
  var n = 88825 + Math.floor(Math.random() * 400);
  setInterval(function () { n += Math.floor(Math.random() * 3) + 1; $('count').textContent = n.toLocaleString('pt-BR'); }, 4200);

  var cv = $('rain'), ctx = cv.getContext('2d'), CH = 'PBSTHWYGEOIAGTBSPOLLYHTSGHOEWYIPGBSTWOHYEPGIOTSSB'.split(''), cols = [], W, H;
  function size() {
    W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio;
    cols = []; for (var i = 0; i < Math.floor(innerWidth / 22); i++) cols.push(Math.random() * -60);
  }
  function draw() {
    ctx.fillStyle = 'rgba(232,241,251,.32)'; ctx.fillRect(0, 0, W, H);
    ctx.font = (12 * devicePixelRatio) + 'px ui-monospace,monospace';
    cols.forEach(function (y, i) {
      ctx.fillStyle = Math.random() > .82 ? 'rgba(34,150,110,.5)' : 'rgba(96,150,215,.55)';
      ctx.fillText(CH[Math.floor(Math.random() * CH.length)], i * 22 * devicePixelRatio, y * 20 * devicePixelRatio);
      cols[i] = y * 20 * devicePixelRatio > H ? 0 : y + 1;
    });
    requestAnimationFrame(draw);
  }
  size(); draw(); addEventListener('resize', size);

  if (localStorage.getItem('ks_age') !== '1') $('ageModal').classList.add('open');
  $('ageYes').onclick = function () { localStorage.setItem('ks_age', '1'); $('ageModal').classList.remove('open'); };
  $('ageNo').onclick = function () { location.href = 'https://www.google.com'; };

  $('startBtn').onclick = function () {
    if (localStorage.getItem('ks_age') !== '1') { $('ageModal').classList.add('open'); return; }
    if (KS.searchPerDevice && localStorage.getItem('ks_used') === '1' && KSU.getProfile()) {
      KSU.toast('Você já usou sua pesquisa grátis. Abrindo seu painel…');
      setTimeout(function () { location.href = '/app.html'; }, 1200);
      return;
    }
    $('userModal').classList.add('open');
    setTimeout(function () { $('userInput').focus(); }, 120);
  };
  $('userModal').onclick = function (e) { if (e.target.id === 'userModal') $('userModal').classList.remove('open'); };
  $('fixBtn').onclick = function () {
    $('confirmModal').classList.remove('open');
    $('userModal').classList.add('open');
    setTimeout(function () { $('userInput').select(); }, 120);
  };

  $('userForm').onsubmit = function (e) {
    e.preventDefault();
    var btn = $('userSubmit'), val = $('userInput').value.trim();
    if (!KSU.valid(KSU.norm(val))) return KSU.toast('Digite um @ válido');
    btn.disabled = true; btn.textContent = 'Buscando…';
    KSU.lookup(val).then(function (p) {
      profile = p;
      $('userModal').classList.remove('open');
      $('cUser').textContent = '@' + p.username;
      $('cAvatar').src = KSU.img(p.avatar);
      $('cPosts').textContent = p.posts;
      $('cFollowers').textContent = p.followers;
      $('cFollowing').textContent = p.following || '—';
      $('confirmModal').classList.add('open');
    }).catch(function () {
      KSU.toast('Não encontramos esse perfil. Confira o @.');
    }).then(function () {
      btn.disabled = false; btn.textContent = 'Continuar';
    });
  };

  var STEPS = [
    ['Conectando ao servidor de análise…', 700],
    ['Consultando dados públicos do perfil…', 900],
    ['Localizando conta ', 800],
    ['Lendo publicações e mídias recentes…', 900],
    ['Modelando histórico de conversas…', 1100],
    ['Organizando contatos e linhas do tempo…', 900],
    ['Preparando o painel de visualização…', 700]
  ];

  $('confirmBtn').onclick = function () {
    $('confirmModal').classList.remove('open');
    $('hack').classList.add('on');
    KSU.setProfile(profile);
    localStorage.setItem('ks_used', '1');
    KSU.track('Lead', { content_name: '@' + profile.username });
    var log = $('log'), fill = $('barFill'), i = 0;
    (function step() {
      if (i >= STEPS.length) {
        var ok = document.createElement('div');
        ok.className = 'ok';
        ok.textContent = '✓ PAINEL PRONTO — abrindo visualização';
        log.appendChild(ok);
        $('termFoot').textContent = 'Redirecionando…';
        setTimeout(function () { location.href = '/app.html'; }, 900);
        return;
      }
      var line = document.createElement('div');
      line.className = 'dim';
      line.textContent = '› ' + STEPS[i][0];
      log.appendChild(line);
      if (i === 2) {
        var u = document.createElement('span');
        u.className = 'usr'; u.textContent = '@' + profile.username;
        line.appendChild(u);
      }
      fill.style.width = Math.round(((i + 1) / STEPS.length) * 100) + '%';
      i++;
      setTimeout(step, STEPS[i - 1][1]);
    })();
  };
})();
