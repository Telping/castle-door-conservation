import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, mediaType = 'image/jpeg' } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const prompt = `You are an expert in heritage building conservation, specializing in medieval Irish castle doors and their preservation.

Analyze this image of a castle door and provide a detailed conservation assessment.

Please respond with a JSON object containing the following fields:
{
  "door_type": "Type of door (e.g., 'Oak plank door with iron studs', 'Arched stone doorway with timber door')",
  "estimated_age": "Estimated age or period (e.g., '15th century', 'Victorian replacement on medieval frame')",
  "condition_summary": "Brief overall condition summary (2-3 sentences)",
  "conservation_concerns": ["Array of specific conservation concerns"],
  "recommended_interventions": ["Array of recommended conservation work"],
  "heritage_considerations": ["Array of heritage/historical considerations to note"],
  "urgency_level": "low | medium | high | critical"
}

Focus on:
1. Material identification (timber species, ironwork, stonework)
2. Signs of deterioration (rot, rust, woodworm, water damage)
3. Historic features that must be preserved
4. Compatibility of any previous repairs
5. Environmental factors affecting the door

Be specific about conservation-grade materials and traditional techniques that should be used.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract the text content from the response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse the JSON from the response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing door:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze door image', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
