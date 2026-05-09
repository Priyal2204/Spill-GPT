import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const fallbackGifs: Record<string, string> = {
  roast: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  therapist: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif',
  dadi: 'https://media.giphy.com/media/l0HlSdFMmj3b1oqOY/giphy.gif',
  drama: 'https://media.giphy.com/media/l0MYB7D1wVN9xBZqE/giphy.gif',
};

const moodQueries: Record<string, string> = {
  roast: 'savage burn roast funny',
  therapist: 'comfort hug calm peaceful',
  dadi: 'indian grandmother wise funny',
  drama: 'dramatic crying support bestie',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).set(corsHeaders).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(corsHeaders).json({ error: 'Method not allowed' });
  }

  const { mood } = req.body;
  const searchQuery = moodQueries[mood] || 'supportive friend';

  try {
    const giphyResponse = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=10&rating=pg-13`
    );

    if (!giphyResponse.ok) throw new Error('Giphy API failed');

    const giphyData = await giphyResponse.json();
    const gifs = giphyData.data;

    let gifUrl = fallbackGifs[mood] || fallbackGifs.roast;
    if (gifs && gifs.length > 0) {
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      gifUrl = randomGif.images.fixed_height.url;
    }

    return res.status(200).set(corsHeaders).json({ gifUrl });
  } catch (error) {
    console.error('Error in get-vibe-gif:', error);
    return res.status(500).set(corsHeaders).json({ gifUrl: fallbackGifs[mood] || fallbackGifs.roast });
  }
}
