import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const fallbackGifs = {
  roast: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  therapist: "https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif", 
  dadi: "https://media.giphy.com/media/l0HlSdFMmj3b1oqOY/giphy.gif",
  drama: "https://media.giphy.com/media/l0MYB7D1wVN9xBZqE/giphy.gif"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, response } = await req.json();

    // Create search query based on mood and response
    let searchQuery = '';
    switch (mood) {
      case 'roast':
        searchQuery = 'savage burn roast funny';
        break;
      case 'therapist':
        searchQuery = 'comfort hug calm peaceful';
        break;
      case 'dadi':
        searchQuery = 'indian grandmother wise funny';
        break;
      case 'drama':
        searchQuery = 'dramatic crying support bestie';
        break;
      default:
        searchQuery = 'supportive friend';
    }

    const giphyResponse = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${Deno.env.get('GIPHY_API_KEY')}&q=${encodeURIComponent(searchQuery)}&limit=10&rating=pg-13`
    );

    if (!giphyResponse.ok) {
      throw new Error('Giphy API failed');
    }

    const giphyData = await giphyResponse.json();
    const gifs = giphyData.data;

    let gifUrl = fallbackGifs[mood as keyof typeof fallbackGifs];
    
    if (gifs && gifs.length > 0) {
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      gifUrl = randomGif.images.fixed_height.url;
    }

    return new Response(JSON.stringify({ gifUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-vibe-gif:', error);
    const { mood } = await req.json().catch(() => ({ mood: 'roast' }));
    
    return new Response(JSON.stringify({ 
      gifUrl: fallbackGifs[mood as keyof typeof fallbackGifs] || fallbackGifs.roast
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});