import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function setCors(res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
}

// Try both v1beta and v1 with multiple models
const ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent',
];

async function callGemini(prompt: string, apiKey: string): Promise<{ text: string | null; lastError: string }> {
  let lastError = '';

  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
        }),
      });

      const body = await response.text();

      if (!response.ok) {
        console.warn(`${endpoint} → ${response.status}: ${body.slice(0, 200)}`);
        lastError = `${response.status}: ${body.slice(0, 300)}`;
        continue;
      }

      const data = JSON.parse(body);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`✓ Success: ${endpoint}`);
        return { text, lastError: '' };
      }
    } catch (err) {
      lastError = String(err);
      console.error(`${endpoint} threw:`, err);
    }
  }

  return { text: null, lastError };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { confession, prompt } = req.body ?? {};

  if (!confession || !prompt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
  }

  const personalizedPrompt = (prompt as string).replace('{{confession}}', confession as string);
  const { text, lastError } = await callGemini(personalizedPrompt, process.env.GOOGLE_GEMINI_API_KEY);

  if (!text) {
    return res.status(429).json({ error: `All models failed. Last error: ${lastError}` });
  }

  return res.status(200).json({ response: text });
}
