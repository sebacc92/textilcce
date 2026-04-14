import { type RequestHandler } from '@builder.io/qwik-city';
import { handleUpload } from '@vercel/blob/client';

export const onPost: RequestHandler = async ({ request, json, env }) => {
  const body = (await request.json()) as any;
  
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // We allow video and image uploads. 
        // In a more complex app, we should check admin session/cookies here.
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'],
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Vercel Blob Upload completed:', blob.url);
      },
      token: env.get('BLOB_READ_WRITE_TOKEN') || '',
    });

    json(200, jsonResponse);
  } catch (error) {
    console.error('Error handling upload:', error);
    json(400, { error: (error as Error).message });
  }
};
