// Sends the contact form to the Telegram bot.
// Netlify env vars required: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
const clean = (v, n) => String(v || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, n);

exports.handler = async (event) => {
  const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (event.httpMethod !== 'POST') return json(405, { ok: false });

  let d;
  try { d = JSON.parse(event.body || '{}'); } catch { return json(400, { ok: false }); }
  if (d.website) return json(200, { ok: true }); // honeypot: bots fill this

  const name = clean(d.name, 80), phone = clean(d.phone, 30), topic = clean(d.topic, 80), note = clean(d.note, 600);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 9) return json(400, { ok: false });

  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return json(500, { ok: false });

  const text = [
    '🩺 Yangi so‘rov (sayt)',
    'Til: ' + (d.lang === 'ru' ? 'RU' : 'UZ'),
    'Ism: ' + name,
    'Telefon: ' + phone,
    'Muammo: ' + (topic || '-'),
    note ? 'Izoh: ' + note : ''
  ].filter(Boolean).join('\n');

  try {
    const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text })
    });
    return r.ok ? json(200, { ok: true }) : json(502, { ok: false });
  } catch {
    return json(502, { ok: false });
  }
};
