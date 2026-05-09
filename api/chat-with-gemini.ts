import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function setCors(res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { confession, mood, prompt } = req.body;

    if (!confession || !prompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('GOOGLE_GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
    }

    const personalizedPrompt = prompt.replace('{{confession}}', confession);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: personalizedPrompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error status:', response.status);
      console.error('Gemini API error body:', errText);
      return res.status(500).json({ error: `Gemini error ${response.status}: ${errText}` });
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Oops, the vibe took a break! Try again? ✨";

    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error in chat-with-gemini:', error);
    return res.status(500).json({ error: "Oops, the vibe took a break! Try again? ✨" });
  }
}
