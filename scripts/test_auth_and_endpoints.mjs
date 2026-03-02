import fetch from 'node-fetch';

(async () => {
  const base = 'http://localhost:3000';
  const email = `ci+${Math.floor(Date.now()/1000)}@example.com`;
  const password = 'TestPass123!';
  console.log('Using email:', email);

  try {
    const su = await fetch(base + '/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const suJson = await su.json().catch(() => null);
    console.log('/api/auth/signup', su.status, suJson);

    const li = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const liJson = await li.json().catch(() => null);
    console.log('/api/auth/login', li.status, liJson);

    let token = null;
    if (liJson?.data?.session?.access_token) token = liJson.data.session.access_token;
    if (liJson?.data?.access_token) token = liJson.data.access_token;

    console.log('token?', !!token);

    if (token) {
      const h = { Authorization: `Bearer ${token}` };
      const p = await fetch(base + '/api/projects', { headers: h });
      console.log('/api/projects', p.status, await p.text());
      const m = await fetch(base + '/api/dashboard/metrics', { headers: h });
      console.log('/api/dashboard/metrics', m.status, await m.text());
    }
  } catch (e) {
    console.error('error', e);
  }
})();
