const UA_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const APP_ID = '936619743392459';
const CACHE = new Map();
const TTL = 1000 * 60 * 30;

const HEADERS = {
  'user-agent': UA_IOS,
  'x-ig-app-id': APP_ID,
  'accept': '*/*',
  'accept-language': 'pt-BR,pt;q=0.9',
  'x-requested-with': 'XMLHttpRequest',
  'referer': 'https://www.instagram.com/'
};

function shape(u, name) {
  return {
    username: name,
    full_name: u.full_name || name,
    avatar: u.profile_pic_url_hd || u.profile_pic_url || '',
    posts: u.media_count || (u.edge_owner_to_timeline_media && u.edge_owner_to_timeline_media.count) || 0,
    followers: u.follower_count || (u.edge_followed_by && u.edge_followed_by.count) || 0,
    following: u.following_count || (u.edge_follow && u.edge_follow.count) || 0,
    bio: u.biography || '',
    verified: !!u.is_verified,
    private: !!u.is_private
  };
}

async function tryJson(url, name) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 7000);
  try {
    const r = await fetch(url, { headers: HEADERS, signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) return null;
    const j = await r.json();
    const u = j && (j.data && j.data.user ? j.data.user : j.user);
    if (!u || !u.username) return null;
    return shape(u, name);
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors };

  if (q.img) {
    const target = decodeURIComponent(q.img);
    if (!/^https:\/\/[a-z0-9.-]*\.(cdninstagram\.com|fbcdn\.net)\//i.test(target)) {
      return { statusCode: 400, headers: cors, body: 'host invalido' };
    }
    try {
      const r = await fetch(target, { headers: { 'user-agent': UA_IOS } });
      const buf = Buffer.from(await r.arrayBuffer());
      return {
        statusCode: r.status,
        headers: {
          ...cors,
          'content-type': r.headers.get('content-type') || 'image/jpeg',
          'cache-control': 'public, max-age=86400'
        },
        body: buf.toString('base64'),
        isBase64Encoded: true
      };
    } catch (e) {
      return { statusCode: 502, headers: cors, body: '' };
    }
  }

  const name = String(q.username || '').replace(/^@/, '').toLowerCase().trim();
  if (!/^[a-z0-9._]{2,30}$/.test(name)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'username invalido' }) };
  }

  const hit = CACHE.get(name);
  if (hit && hit.t > Date.now() - TTL) {
    return { statusCode: 200, headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' }, body: JSON.stringify(hit.p) };
  }

  const strategies = [
    () => tryJson('https://i.instagram.com/api/v1/users/web_profile_info/?username=' + encodeURIComponent(name), name),
    () => tryJson('https://www.instagram.com/api/v1/users/web_profile_info/?username=' + encodeURIComponent(name), name),
    () => tryJson('https://www.instagram.com/' + encodeURIComponent(name) + '/?__a=1&__d=dis', name)
  ];

  let profile = null;
  for (const s of strategies) {
    profile = await s();
    if (profile) break;
  }

  if (!profile) return { statusCode: 404, headers: cors, body: JSON.stringify({ error: 'nao_encontrado' }) };

  CACHE.set(name, { t: Date.now(), p: profile });
  return {
    statusCode: 200,
    headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' },
    body: JSON.stringify(profile)
  };
};
