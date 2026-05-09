import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).set(corsHeaders).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(corsHeaders).json({ error: 'Method not allowed' });
  }

  try {
    const { confession, mood, prompt } = req.body;

    if (!confession || !prompt) {
      return res.status(400).set(corsHeaders).json({ error: 'Missing required fields' });
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
      console.error('Gemini API error:', errText);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Oops, the vibe took a break! Try again? ✨";

    return res.status(200).set(corsHeaders).json({ response: aiResponse });
  } catch (error) {
    console.error('Error in chat-with-gemini:', error);
    return res.status(500).set(corsHeaders).json({ error: "Oops, the vibe took a break! Try again? ✨" });
  }
}
