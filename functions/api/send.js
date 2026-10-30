// Cloudflare Pages Function: sends the contact form to the Telegram bot.
// Variables required (Pages > Settings > Variables and Secrets): TELEGRAM_BOT_TOKEN (secret), TELEGRAM_CHAT_ID
const clean = (v, n) => String(v || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, n);
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json(400, { ok: false }); }
  if (d.website) return json(200, { ok: true }); // honeypot: bots fill this

  const name = clean(d.name, 80), phone = clean(d.phone, 30), topic = clean(d.topic, 80), note = clean(d.note, 600);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 9) return json(400, { ok: false });
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json(500, { ok: false });

  const text = [
    '🩺 Yangi so‘rov (sayt)',
    'Til: ' + (d.lang === 'ru' ? 'RU' : d.lang === 'uz-Cyrl' ? 'UZ (kirill)' : 'UZ'),
    'Ism: ' + name,
    'Telefon: ' + phone,
    'Muammo: ' + (topic || '-'),
    note ? 'Izoh: ' + note : ''
  ].filter(Boolean).join('\n');

  try {
    const r = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text })
    });
    return r.ok ? json(200, { ok: true }) : json(502, { ok: false });
  } catch {
    return json(502, { ok: false });
  }
}

export const onRequest = () => json(405, { ok: false });
