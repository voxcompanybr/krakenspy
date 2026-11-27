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

function upscale(url) {
  return String(url || '').replace(/s150x150/g, 's320x320').replace(/\/s\d+x\d+\//, '/s320x320/');
}

function parse(html, name) {
  const av = html.match(/<img[^>]+src="(https:\/\/[^"]*cdninstagram[^"]*)"/i);
  const fol = html.match(/([\d.,]+[KMB]?)\s*followers/i);
  const pos = html.match(/([\d.,]+[KMB]?)\s*posts/i);
  if (!fol && !pos) return null;

  const photos = [];
  const re = /"(https:\/\/[^"]*cdninstagram\.com\/v\/t51\.[^"]*)"/g;
  let m;
  while ((m = re.exec(html)) && photos.length < 12) {
    const u = m[1].replace(/\\u0026/g, '&');
    if (!photos.includes(u) && !/profile picture/i.test(u)) photos.push(u);
  }

  return {
    username: name,
    avatar: av ? upscale(av[1].replace(/\\u0026/g, '&')) : '',
    followers: num(fol && fol[1]),
    posts: num(pos && pos[1]),
    following: 0,
    full_name: '',
    bio: '',
    photos: photos
  };
}

async function grab(name) {
  const target = 'https://www.instagram.com/' + encodeURIComponent(name) + '/embed/';
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(target, {
      headers: { 'user-agent': UA, 'accept-language': 'pt-BR,pt;q=0.9' },
      signal: ctl.signal,
      redirect: 'follow'
    });
    if (!r.ok) return null;
    return parse(await r.text(), name);
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function grabViaJina(name) {
  const target = 'https://r.jina.ai/https://www.instagram.com/' + encodeURIComponent(name) + '/embed/';
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(target, { headers: { 'accept': 'text/plain' }, signal: ctl.signal });
    if (!r.ok) return null;
    const txt = await r.text();
    return parse(txt, name);
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
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
        headers: {
          ...CORS,
          'content-type': r.headers.get('content-type') || 'image/jpeg',
          'cache-control': 'public, max-age=86400'
        },
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
  if (hit && hit.t > Date.now() - TTL) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' },
      body: JSON.stringify(hit.p)
    };
  }

  let p = await grab(name);
  if (!p) p = await grabViaJina(name);
  if (!p) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'nao_encontrado' }) };

  CACHE.set(name, { t: Date.now(), p });
  return {
    statusCode: 200,
    headers: { ...CORS, 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' },
    body: JSON.stringify(p)
  };
};
