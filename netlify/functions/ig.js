const VERSION = 'ig-4-tagstrip';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const CACHE = new Map();
const TTL = 1e3 * 60 * 30;
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'GET,OPTIONS'
};

function num(s) {
  if (!s) return 0;
  const m = String(s).replace(/[.,]/g, '').match(/^(\d+)([KMB])?$/i);
  if (!m) return 0;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1;
  return Math.round(+m[1] * mult);
}

function clean(u) { return String(u || '').replace(/\\u0026/g, '&').replace(/s150x150/g, 's320x320'); }
function strip(html) { return String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); }

function parse(raw, name) {
  const html = String(raw || '');
  const txt = strip(html);

  const fol = txt.match(/([\d.,]+[KMB]?)\s*followers/i);
  const pos = txt.match(/([\d.,]+[KMB]?)\s*posts/i);
  if (!fol && !pos) return null;

  let avatar = '';
  const avHtml = html.match(/<img[^>]+src="(https:\/\/[^"]*cdninstagram[^"]*)"/i);
  if (avHtml) avatar = clean(avHtml[1]);
  if (!avatar) {
    const avMd = html.match(/!\[[^\]]*profile picture[^\]]*\]\((https:\/\/[^)]*cdninstagram[^)]*)\)/i);
    if (avMd) avatar = clean(avMd[1]);
  }

  const photos = [];
  const re = /(https:\/\/[^")\s]*cdninstagram\.com\/v\/t51\.[^")\s]*)/g;
  let m;
  while ((m = re.exec(html)) && photos.length < 12) {
    const u = clean(m[1]);
    if (!photos.includes(u) && u !== avatar && !/profile picture/i.test(u)) photos.push(u);
  }

  return {
    username: name,
    avatar: avatar,
    followers: num(fol && fol[1]),
    posts: num(pos && pos[1]),
    following: 0,
    full_name: '',
    bio: '',
    photos: photos
  };
}

async function get(url, headers, ms) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms || 8000);
  try {
    const r = await fetch(url, { headers: headers || { 'user-agent': UA }, signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) return { status: r.status, text: '' };
    return { status: r.status, text: await r.text() };
  } catch (e) {
    return { status: 0, text: '', err: String((e && e.message) || e) };
  } finally {
    clearTimeout(t);
  }
}

async function attempt(name) {
  const embed = 'https://www.instagram.com/' + encodeURIComponent(name) + '/embed/';
  const enc = encodeURIComponent(embed);
  const list = [
    ['jina', 'https://r.jina.ai/' + embed, { 'accept': 'text/plain' }, 15000],
    ['direto', embed + '?cr=1', { 'user-agent': UA, 'accept-language': 'pt-BR,pt;q=0.9' }, 9000],
    ['codetabs', 'https://api.codetabs.com/v1/proxy?quest=' + enc, null, 12000]
  ];
  const log = [];
  for (const [via, url, headers, ms] of list) {
    const r = await get(url, headers, ms);
    const p = r.text ? parse(r.text, name) : null;
    log.push({ via, status: r.status, len: r.text.length, ok: !!p, err: r.err || undefined });
    if (p) return { p, via, log };
  }
  return { p: null, via: null, log };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const q = event.queryStringParameters || {};

  if (q.img) {
    const target = decodeURIComponent(q.img);
    if (!/^https:\/\/[a-z0-9.-]*\.(cdninstagram\.com|fbcdn\.net)\//i.test(target)) {
      return { statusCode: 400, headers: CORS, body: 'host invalido' };
    }
    try {
      const r = await fetch(target, { headers: { 'user-agent': UA } });
      const buf = Buffer.from(await r.arrayBuffer());
      return {
        statusCode: r.status,
        headers: { ...CORS, 'content-type': r.headers.get('content-type') || 'image/jpeg', 'cache-control': 'public, max-age=86400' },
        body: buf.toString('base64'),
        isBase64Encoded: true
      };
    } catch (e) {
      return { statusCode: 502, headers: CORS, body: '' };
    }
  }

  const name = String(q.username || '').replace(/^@/, '').toLowerCase().trim();
  if (!/^[a-z0-9._]{2,30}$/.test(name)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'username invalido' }) };
  }

  const hit = CACHE.get(name);
  if (hit && hit.t > Date.now() - TTL && !q.debug) {
    return { statusCode: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(hit.p) };
  }

  const out = await attempt(name);

  if (q.debug) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'content-type': 'application/json' },
      body: JSON.stringify({ version: VERSION, name, via: out.via, found: !!out.p, log: out.log, data: out.p }, null, 2)
    };
  }

  if (!out.p) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'nao_encontrado' }) };
  CACHE.set(name, { t: Date.now(), p: out.p });
  return { statusCode: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(out.p) };
};
