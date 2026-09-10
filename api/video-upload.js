import { handleUpload } from '@vercel/blob/client';

// This powers direct browser-to-Blob video uploads (bypassing the ~4.5MB
// serverless function body limit that images are subject to). The client
// calls upload() with handleUploadUrl: '/api/video-upload', which hits this
// route first to get a short-lived signed token, then uploads the video
// bytes straight to Blob storage — this file never sees the video itself.
export default async function handler(req, res) {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['video/*'],
          addRandomSuffix: true,
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB, matches the client-side check
        };
      },
      onUploadCompleted: async () => {
        // no-op — nothing extra needs to happen after upload finishes
      },
    });

    res.status(200).json(jsonResponse);
  } catch (err) {
    console.error('Video upload token error:', err);
    res.status(400).json({ error: err.message || 'Video upload failed.' });
  }
}
