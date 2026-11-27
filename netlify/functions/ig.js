'use strict';

/* KrakenSpy — /api/ig
 * 1) dados públicos do perfil  2) proxy de imagem do CDN
 * Cascata: API web_profile_info -> JSON embutido -> meta tags -> leitores -> scraper pago (opcional)
 */

const VERSION = 'ig-6';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const APP_ID = '936619743392459';
const TTL = 6 * 60 * 60 * 1000;
const MAX_ENTRIES = 400;
const CACHE = new Map();

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'GET,OPTIONS'
};
const JSON_H = { ...CORS, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' };
const IMG_HOST = /^https:\/\/(?:[a-z0-9-]+\.)*(?:cdninstagram\.com|fbcdn\.net)\//i;

/* ---------- helpers ---------- */

function num(v) {
  if (typeof v === 'number' && isFinite(v)) return Math.max(0, Math.round(v));
  let s = String(v == null ? '' : v).trim().toLowerCase();
  if (!s) return 0;

  let mult = 1;
  if (/(?:^|\s)(mil|k)$/.test(s)) mult = 1e3;
  else if (/(?:^|\s)(milh(?:ao|ão|oes|ões)|mi|m)$/.test(s)) mult = 1e6;
  else if (/(?:^|\s)(bi|b)$/.test(s)) mult = 1e9;

  s = s.replace(/[^\d.,]/g, '');
  if (!s) return 0;

  const lastSep = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
  let intPart = s, decPart = '';
  if (lastSep > -1 && s.length - lastSep - 1 > 0 && s.length - lastSep - 1 <= 2) {
    intPart = s.slice(0, lastSep);
    decPart = s.slice(lastSep + 1);
  }
  const n = parseFloat((intPart.replace(/[.,]/g, '') || '0') + (decPart ? '.' + decPart : ''));
  return isFinite(n) ? Math.round(n * mult) : 0;
}

function clean(u) {
  return String(u || '')
    .replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/s150x150/g, 's640x640')
    .replace(/s320x320/g, 's640x640');
}

function safeDecode(s) {
  try { return decodeURIComponent(s); } catch (e) { return String(s || ''); }
}

function meta(html, prop) {
  const a = new RegExp('<meta[^>]+(?:property|name)=["\']' + prop + '["\'][^>]*content=["\']([^"\']*)["\']', 'i');
  const b = new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name)=["\']' + prop + '["\']', 'i');
  const m = html.match(a) || html.match(b);
  return m ? clean(m[1]) : '';
}

function count(obj, fallback) {
  if (obj && typeof obj.count === 'number') return Math.max(0, Math.round(obj.count));
  return num(fallback);
}

function normalize(user, name) {
  if (!user || typeof user !== 'object') return null;
  const uname = String(user.username || name || '').toLowerCase();
  if (!uname) return null;

  const avatar = clean(String(user.profile_pic_url_hd || user.profile_pic_url || ''));
  const followers = count(user.edge_followed_by, user.followers_count);
  const following = count(user.edge_follow, user.following_count);
  const posts = count(user.edge_owner_to_timeline_media, user.media_count);

  const photos = [];
  const edges = (user.edge_owner_to_timeline_media && user.edge_owner_to_timeline_media.edges) || [];
  for (let i = 0; i < edges.length && photos.length < 12; i++) {
    const node = edges[i] && edges[i].node;
    if (!node) continue;
    const res = Array.isArray(node.thumbnail_resources) ? node.thumbnail_resources : [];
    const src = clean(String(node.display_url || node.thumbnail_src || (res.length ? res[res.length - 1].src : '')));
    if (src && src !== avatar && photos.indexOf(src) === -1) photos.push(src);
  }

  if (!avatar && !followers && !posts) return null;

  return {
    username: uname,
    full_name: String(user.full_name || ''),
    bio: String(user.biography || ''),
    avatar: avatar,
    followers: followers,
    following: following,
    posts: posts,
    is_private: !!user.is_private,
    verified: !!user.is_verified,
    photos: photos,
    source: 'instagram'
  };
}

function deepFind(node, name, depth) {
  if (!node || typeof node !== 'object' || depth > 12) return null;
  if (node.username && String(node.username).toLowerCase() === name &&
      (node.edge_followed_by || node.followers_count !== undefined)) return node;
  for (const k in node) {
    const v = node[k];
    if (v && typeof v === 'object') {
      const r = deepFind(v, name, depth + 1);
      if (r) return r;
    }
  }
  return null;
}

function parseJson(text, name) {
  let j;
  try { j = JSON.parse(text); } catch (e) { return null; }
  const u = (j && j.data && (j.data.user || j.data)) || deepFind(j, name, 0);
  return normalize(u, name);
}

function fromBlobs(html, name) {
  const re = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[1].length > 3e6) continue;
    try {
      const j = JSON.parse(m[1]);
      const p = normalize(deepFind(j, name, 0), name);
      if (p) return p;
    } catch (e) { /* blob inválido, segue */ }
  }
  return null;
}

function fromHtml(html, name) {
  if (!html) return null;
  const desc = meta(html, 'og:description') || meta(html, 'description');
  const q = '([\\d.,]+(?:\\s*(?:mil|milh(?:ao|ão|oes|ões)|k|m|mi|bi|b))?)';
  const fol = desc.match(new RegExp(q + '\\s*(?:followers|seguidores)', 'i'));
  const pos = desc.match(new RegExp(q + '\\s*(?:posts|publica[çc][õo]es)', 'i'));
  const fll = desc.match(new RegExp(q + '\\s*(?:following|seguindo)', 'i'));
  const avatar = meta(html, 'og:image');
  if (!fol && !pos && !avatar) return null;
  return {
    username: name,
    full_name: '',
    bio: '',
    avatar: avatar,
    followers: num(fol && fol[1]),
    following: num(fll && fll[1]),
    posts: num(pos && pos[1]),
    is_private: false,
    verified: false,
    photos: [],
    source: 'html'
  };
}

async function get(url, headers, ms) {
  const ctl = new AbortController();
  const t = setTimeout(function () { ctl.abort(); }, ms || 9000);
  try {
    const r = await fetch(url, { headers: headers || { 'user-agent': UA }, signal: ctl.signal, redirect: 'follow' });
    const text = r.ok ? await r.text() : '';
    return { status: r.status, text: text };
  } catch (e) {
    return { status: 0, text: '', err: String((e && e.message) || e) };
  } finally {
    clearTimeout(t);
  }
}

/* ---------- estratégias ---------- */

async function viaApi(name) {
  const urls = [
    'https://www.instagram.com/api/v1/users/web_profile_info/?username=' + encodeURIComponent(name),
    'https://i.instagram.com/api/v1/users/web_profile_info/?username=' + encodeURIComponent(name)
  ];
  for (const u of urls) {
    const r = await get(u, {
      'user-agent': UA,
      'x-ig-app-id': APP_ID,
      'x-requested-with': 'XMLHttpRequest',
      accept: 'application/json',
      'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8',
      referer: 'https://www.instagram.com/' + encodeURIComponent(name) + '/'
    }, 9000);
    if (r.status !== 200 || !r.text) continue;
    const p = parseJson(r.text, name);
    if (p) return p;
  }
  return null;
}

async function viaEmbed(name) {
  const url = 'https://www.instagram.com/' + encodeURIComponent(name) + '/embed/captioned/';
  const r = await get(url, { 'user-agent': UA, 'accept-language': 'pt-BR,pt;q=0.9' }, 9000);
  if (r.status !== 200 || !r.text) return null;
  return fromBlobs(r.text, name) || fromHtml(r.text, name);
}

async function viaProfile(name) {
  const r = await get('https://www.instagram.com/' + encodeURIComponent(name) + '/?__a=1&__d=dis', {
    'user-agent': UA, 'x-ig-app-id': APP_ID, 'accept-language': 'pt-BR,pt;q=0.9'
  }, 9000);
  if (!r.text) return null;
  if (r.text.trim().charAt(0) === '{') {
    const p = parseJson(r.text, name);
    if (p) return p;
  }
  return fromBlobs(r.text, name) || fromHtml(r.text, name);
}

async function viaReader(name) {
  const target = 'https://www.instagram.com/' + encodeURIComponent(name) + '/embed/captioned/';
  const key = process.env.JINA_KEY;
  const jinaHeaders = { accept: 'text/plain' };
  if (key) jinaHeaders.authorization = 'Bearer ' + key;

  const list = [
    ['jina', 'https://r.jina.ai/' + target, jinaHeaders, 15000],
    ['dhr', 'https://md.dhr.wtf/?url=' + encodeURIComponent(target), { accept: 'text/plain' }, 12000],
    ['codetabs', 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(target), null, 12000]
  ];
  for (const item of list) {
    const r = await get(item[1], item[2], item[3]);
    if (!r.text) continue;
    const p = fromBlobs(r.text, name) || fromHtml(r.text, name);
    if (p) return p;
  }
  return null;
}

async function viaScraper(name) {
  const tpl = process.env.IG_SCRAPER_URL;
  if (!tpl) return null;
  const url = tpl.replace('{user}', encodeURIComponent(name));
  const headers = { accept: 'application/json' };
  if (process.env.IG_SCRAPER_KEY) headers.authorization = 'Bearer ' + process.env.IG_SCRAPER_KEY;
  const r = await get(url, headers, 12000);
  if (r.status !== 200 || !r.text) return null;
  const p = parseJson(r.text, name);
  if (p) return p;
  try { return normalize(JSON.parse(r.text), name); } catch (e) { return null; }
}

async function attempt(name) {
  const chain = [
    ['scraper', viaScraper],
    ['api', viaApi],
    ['embed', viaEmbed],
    ['perfil', viaProfile],
    ['leitor', viaReader]
  ];
  const log = [];
  for (const item of chain) {
    let p = null;
    try { p = await item[1](name); } catch (e) { p = null; }
    log.push({ via: item[0], ok: !!p });
    if (p) return { p: p, via: item[0], log: log };
  }
  return { p: null, via: null, log: log };
}

/* ---------- proxy de imagem ---------- */

async function proxyImage(target) {
  if (!IMG_HOST.test(target)) return { statusCode: 400, headers: CORS, body: 'host invalido' };
  let r;
  try {
    r = await fetch(target, {
      headers: {
        'user-agent': UA,
        referer: 'https://www.instagram.com/',
        accept: 'image/avif,image/webp,image/apng,image/*,*/*'
      },
      redirect: 'follow'
    });
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: '' };
  }
  const type = r.headers.get('content-type') || '';
  if (!r.ok || !/^image\//i.test(type)) return { statusCode: r.status === 200 ? 415 : r.status, headers: CORS, body: '' };
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) return { statusCode: 413, headers: CORS, body: '' };
  return {
    statusCode: 200,
    headers: { ...CORS, 'content-type': type, 'cache-control': 'public, max-age=604800, immutable' },
    body: buf.toString('base64'),
    isBase64Encoded: true
  };
}

/* ---------- handler ---------- */

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const q = event.queryStringParameters || {};

  if (q.img) {
    const raw = String(q.img);
    const target = /^https?:\/\//i.test(raw) ? raw : safeDecode(raw);
    return proxyImage(target);
  }

  const name = String(q.username || '').replace(/^@/, '').toLowerCase().trim();
  if (!/^[a-z0-9._]{2,30}$/.test(name)) {
    return { statusCode: 400, headers: JSON_H, body: JSON.stringify({ error: 'username_invalido' }) };
  }

  if (!q.debug) {
    const hit = CACHE.get(name);
    if (hit && hit.t > Date.now() - TTL) {
      return { statusCode: 200, headers: JSON_H, body: JSON.stringify(hit.p) };
    }
  }

  const out = await attempt(name);

  if (q.debug) {
    return {
      statusCode: 200,
      headers: JSON_H,
      body: JSON.stringify({ version: VERSION, name: name, via: out.via, found: !!out.p, log: out.log, data: out.p }, null, 2)
    };
  }

  if (!out.p) {
    return { statusCode: 404, headers: { ...JSON_H, 'cache-control': 'no-store' }, body: JSON.stringify({ error: 'nao_encontrado' }) };
  }

  if (CACHE.size > MAX_ENTRIES) CACHE.clear();
  CACHE.set(name, { t: Date.now(), p: out.p });

  return { statusCode: 200, headers: JSON_H, body: JSON.stringify(out.p) };
};
