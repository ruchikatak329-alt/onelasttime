import { put } from '@vercel/blob';

const MAX_BYTES = 4 * 1024 * 1024; // 4MB — stays under Vercel's 4.5MB function body limit

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const filename = (req.query && req.query.filename) || `upload-${Date.now()}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    // Read the raw request body as bytes (images are sent as raw binary, not JSON)
    let buffer;
    if (Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      buffer = Buffer.concat(chunks);
    }

    if (buffer.length === 0) {
      res.status(400).json({ error: 'No file data received.' });
      return;
    }
    if (buffer.length > MAX_BYTES) {
      res.status(413).json({ error: 'File too large — please keep uploads under 4MB (compress the image first).' });
      return;
    }

    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed.' });
  }
}
