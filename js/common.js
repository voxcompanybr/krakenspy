window.KSU = (function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function toast(m) {
    var t = $('toast'); if (!t) return;
    t.textContent = m; t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2400);
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function rnd(seed, min, max) { return min + (seed % (max - min + 1)); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

  var FIRST = ['Ana','Fernanda','Vitória','Roberta','Andressa','Camila','Larissa','Juliana','Beatriz','Marina','Bruna','Carla','Patrícia','Renata','Tatiane','Débora','Aline','Simone','Vanessa','Priscila','Marcelo','Rafael','Diego','Bruno','Lucas','Thiago','Gustavo','Felipe','Rodrigo','Leonardo'];
  var LAST = ['Silva','Souza','Oliveira','Costa','Almeida','Ribeiro','Martins','Barbosa','Ferreira','Lima','Rocha','Cardoso','Moreira','Nunes','Teixeira','Ramos','Farias','Moraes'];
  var CITIES = ['São Paulo','Rio de Janeiro','Belo Horizonte','Curitiba','Porto Alegre','Salvador','Recife','Fortaleza','Goiânia','Campinas','Florianópolis','Brasília','Uberlândia','Londrina','Natal'];
  var FRASES = ['Vida real, filtros à parte','Deus no comando','Bem-vindo ao meu perfil','Só coisa boa','Vivendo um dia de cada vez','Aqui é meu canto','Colecionando momentos','Fé e café','Menos tela, mais vida','Trabalho e correria'];

  function nameFromHandle(u) {
    var t = u.split(/[._]+/).filter(function (x) { return x.length > 2 && !/\d/.test(x); });
    if (t.length >= 2) return cap(t[0]) + ' ' + cap(t[1]);
    if (t.length === 1) return cap(t[0]) + ' ' + LAST[hash(u) % LAST.length];
    return FIRST[hash(u) % FIRST.length] + ' ' + LAST[(hash(u) >> 4) % LAST.length];
  }

  function generate(u) {
    var h = hash(u), c = CITIES[h % CITIES.length], f = FRASES[(h >> 6) % FRASES.length], r = h % 100;
    return {
      username: u,
      full_name: nameFromHandle(u),
      avatar: 'https://i.pravatar.cc/320?u=' + encodeURIComponent(u),
      posts: rnd(h, 7, 180),
      followers: (r < 45 ? rnd(h, 130, 900) : (r < 86 ? rnd(h, 900, 4200) : rnd(h, 4200, 24000))),
      following: rnd(h >> 4, 160, 1500),
      bio: ['📍 ' + c + ' ✦ ' + f, '📍 ' + c, f + ' ✨', '✦ ' + c + ' | ' + f, f + ' | ' + c][(h >> 9) % 5],
      photos: [],
      _synthetic: true
    };
  }

  function norm(u) { return String(u || '').replace(/^@/, '').trim().toLowerCase().replace(/\s/g, ''); }
  function valid(u) { return /^[a-z0-9._]{2,30}$/.test(u); }

  function lookup(raw) {
    var u = norm(raw);
    if (!valid(u)) return Promise.reject(new Error('invalid'));

    var cached = null;
    try { cached = JSON.parse(localStorage.getItem('ks_cache_' + u) || 'null'); } catch (e) {}
    if (cached && cached.t > Date.now() - 864e5) return Promise.resolve(cached.p);

    return fetch('/api/ig?username=' + encodeURIComponent(u), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (p) {
        var out;
        if (p && p.username && (p.followers || p.avatar)) {
          out = generate(u);
          out._synthetic = false;
          if (p.avatar) out.avatar = p.avatar;
          if (p.followers) out.followers = p.followers;
          if (p.posts) out.posts = p.posts;
          if (p.photos && p.photos.length) out.photos = p.photos;
          if (p.full_name) out.full_name = p.full_name;
          if (p.bio) out.bio = p.bio;
        } else {
          out = generate(u);
        }
        try { localStorage.setItem('ks_cache_' + u, JSON.stringify({ t: Date.now(), p: out })); } catch (e) {}
        return out;
      });
  }

  function img(url) {
    if (!url) return '';
    if (/cdninstagram\.com|fbcdn\.net/.test(url)) return '/api/ig?img=' + encodeURIComponent(url);
    return url;
  }

  function captureUtms() {
    var q = new URLSearchParams(location.search), keep = {};
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid','src'].forEach(function (k) {
      var v = q.get(k); if (v) keep[k] = v;
    });
    if (Object.keys(keep).length) sessionStorage.setItem('ks_utm', JSON.stringify(keep));
  }
  function utmString() {
    try {
      var o = JSON.parse(sessionStorage.getItem('ks_utm') || '{}');
      return Object.keys(o).map(function (k) { return k + '=' + encodeURIComponent(o[k]); }).join('&');
    } catch (e) { return ''; }
  }

  function track(ev, data) { if (window.fbq) window.fbq('track', ev, data || {}); }

  function getProfile() {
    try { return JSON.parse(localStorage.getItem('ks_profile') || 'null'); } catch (e) { return null; }
  }
  function setProfile(p) { localStorage.setItem('ks_profile', JSON.stringify(p)); }
  function isVip() { return localStorage.getItem('ks_vip') === '1'; }
  function setVip() { localStorage.setItem('ks_vip', '1'); }

  return { $: $, esc: esc, toast: toast, hash: hash, rnd: rnd, generate: generate,
           norm: norm, valid: valid, lookup: lookup, img: img,
           captureUtms: captureUtms, utmString: utmString, track: track,
           getProfile: getProfile, setProfile: setProfile, isVip: isVip, setVip: setVip };
})();
