(async ()=>{
  try {
    const payload = { email: 'test+run@local.test', password: 'Test1234!' };
    const res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('STATUS', res.status);
    const text = await res.text();
    try { console.log('BODY', JSON.parse(text)); } catch { console.log('BODY', text); }
    process.exit(res.ok?0:1);
  } catch (err) {
    console.error('REQUEST ERROR', err);
    process.exit(2);
  }
})();
