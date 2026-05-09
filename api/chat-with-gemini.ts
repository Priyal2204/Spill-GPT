import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function setCors(res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
}

// Free tier models in order of preference (most generous limits first)
const MODELS = [
  'gemini-2.5-flash-lite-preview-06-17',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

async function callGemini(prompt: string, apiKey: string): Promise<string | null> {
  for (const model of MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
          }),
        }
      );

      if (response.status === 429 || response.status === 503) {
        console.warn(`Model ${model} rate limited, trying next...`);
        continue;
      }

      if (response.status === 404) {
        console.warn(`Model ${model} not found, trying next...`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Model ${model} error ${response.status}:`, errText);
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`Success with model: ${model}`);
        return text;
      }
    } catch (err) {
      console.error(`Model ${model} threw:`, err);
      continue;
    }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { confession, prompt } = req.body;

    if (!confession || !prompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
    }

    const personalizedPrompt = prompt.replace('{{confession}}', confession);
    const aiResponse = await callGemini(personalizedPrompt, process.env.GOOGLE_GEMINI_API_KEY);

    if (!aiResponse) {
      return res.status(429).json({ error: "All models are busy right now 😮‍💨 Try again in a minute!" });
    }

    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error in chat-with-gemini:', error);
    return res.status(500).json({ error: "Oops, the vibe took a break! Try again? ✨" });
  }
}
