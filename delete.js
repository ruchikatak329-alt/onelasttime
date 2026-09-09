import { del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body;
    if (!body || typeof body === 'string') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString('utf8');
      body = raw ? JSON.parse(raw) : {};
    }

    const { url } = body || {};
    if (!url) {
      res.status(400).json({ error: 'Missing url.' });
      return;
    }

    await del(url);
    res.status(200).json({ ok: true });
  } catch (err) {
    // Not fatal — the site treats delete as best-effort cleanup anyway
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message || 'Delete failed.' });
  }
}
