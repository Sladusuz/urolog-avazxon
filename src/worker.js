// Cloudflare Worker: serves the static site (assets) and handles POST /api/send.
import { onRequestPost } from '../functions/api/send.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/send') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      return new Response('{"ok":false}', { status: 405, headers: { 'Content-Type': 'application/json' } });
    }
    return env.ASSETS.fetch(request);
  }
};
