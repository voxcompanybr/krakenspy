const IG_APP_ID = '936619743392459';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

exports.handler = async (event) => {
  const username = String(event.queryStringParameters?.u || '').trim().toLowerCase();
  const headers = { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' };

  if (!/^[a-z0-9._]{2,30}$/.test(username)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'invalid' }) };
  }

  const targets = [
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`
  ];

  for (const target of targets) {
    try {
      const res = await fetch(target, {
        headers: {
          'x-ig-app-id': IG_APP_ID,
          'user-agent': UA,
          'accept': '*/*',
          'accept-language': 'pt-BR,pt;q=0.9',
          'referer': `https://www.instagram.com/${username}/`
        }
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json?.data?.user) return { statusCode: 200, headers, body: JSON.stringify(json) };
    } catch (_) {}
  }

  return { statusCode: 502, headers, body: JSON.stringify({ error: 'not_found' }) };
};
