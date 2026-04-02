import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { BlobServiceClient } from '@azure/storage-blob';
import { authenticate } from '../middleware/auth.js';

/**
 * POST /api/generate-tts-audio
 *
 * Synthesizes speech audio from text using Azure Speech Service (neural TTS),
 * stores the result in Azure Blob Storage, and returns a CDN URL.
 *
 * Requirements: 13.4, 13.5
 */

const TTS_CONTAINER = 'tts-audio';
const TTS_VOICE = 'en-US-GuyNeural'; // Professional male voice for dispatch radio

app.http('generate-tts-audio', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'generate-tts-audio',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as any;
      const { text } = body;

      if (!text || typeof text !== 'string') {
        return { status: 400, jsonBody: { error: 'text is required and must be a string' } };
      }

      if (text.length > 5000) {
        return { status: 400, jsonBody: { error: 'text must be 5000 characters or fewer' } };
      }

      const speechKey = process.env.AZURE_SPEECH_KEY || '';
      const speechRegion = process.env.AZURE_SPEECH_REGION || 'eastus';
      const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';

      if (!speechKey) {
        context.error('AZURE_SPEECH_KEY not configured');
        return { status: 500, jsonBody: { error: 'TTS service not configured' } };
      }

      // Synthesize audio using Azure Speech Service
      const audioBuffer = await synthesizeSpeech(speechKey, speechRegion, text);

      // Upload to Azure Blob Storage
      const blobName = `dispatch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.wav`;
      const audioUrl = await uploadToBlob(storageConnectionString, TTS_CONTAINER, blobName, audioBuffer);

      return {
        status: 200,
        jsonBody: { audio_url: audioUrl },
      };
    } catch (err: any) {
      context.error('generate-tts-audio error:', err);
      return { status: 500, jsonBody: { error: 'Failed to generate audio' } };
    }
  },
});

/**
 * Synthesize speech from text using Azure Speech Service neural TTS.
 * Returns a Buffer containing WAV audio data.
 */
function synthesizeSpeech(key: string, region: string, text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisVoiceName = TTS_VOICE;
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm;

    // Use null for audioConfig to get the result in memory (pull stream)
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as any);

    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData));
        } else {
          const details = sdk.CancellationDetails.fromResult(result as any);
          reject(new Error(`TTS synthesis failed: ${details.reason} — ${details.errorDetails}`));
        }
      },
      (error) => {
        synthesizer.close();
        reject(new Error(`TTS synthesis error: ${error}`));
      }
    );
  });
}

/**
 * Upload a buffer to Azure Blob Storage and return the public URL.
 */
async function uploadToBlob(
  connectionString: string,
  containerName: string,
  blobName: string,
  data: Buffer
): Promise<string> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Ensure container exists
  await containerClient.createIfNotExists({ access: 'blob' });

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(data, {
    blobHTTPHeaders: {
      blobContentType: 'audio/wav',
      blobCacheControl: 'public, max-age=31536000',
    },
  });

  return blockBlobClient.url;
}
