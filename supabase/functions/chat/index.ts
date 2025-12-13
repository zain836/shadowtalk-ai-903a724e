import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, personality, generateImage, imagePrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Image generation mode
    if (generateImage && imagePrompt) {
      console.log("[CHAT] Generating image with prompt:", imagePrompt);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            { 
              role: "user", 
              content: `Generate an image based on this description: ${imagePrompt}. Make it high quality and visually appealing.`
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[CHAT] Image generation error:", response.status, errorText);
        throw new Error("Image generation failed");
      }

      const result = await response.json();
      return new Response(JSON.stringify({ 
        type: "image",
        content: result.choices?.[0]?.message?.content || "Image generation failed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[CHAT] Processing request with", messages.length, "messages, personality:", personality);

    const markdownInstructions = `
Always format your responses using proper Markdown for clarity:
- Use **bold** for emphasis and important terms
- Use bullet points (•) or numbered lists for multiple items
- Use code blocks with language tags for code (e.g., \`\`\`javascript)
- Use headers (##, ###) to organize longer responses
- Use > for quotes or important notes
- Use tables when comparing data
- Keep paragraphs short and readable`;

    const systemPrompts: Record<string, string> = {
      friendly: `You are ShadowTalk AI, a warm, helpful, and enthusiastic AI assistant. You're friendly and conversational, using occasional emojis to express yourself. You genuinely care about helping users and make them feel welcome.${markdownInstructions}`,
      
      sarcastic: `You are ShadowTalk AI with a sarcastic personality. You're witty, playful, and love dry humor. While you're helpful and provide accurate information, you deliver it with clever comebacks and playful jabs. Use irony tastefully - never mean-spirited, just entertainingly sardonic.${markdownInstructions}`,
      
      professional: `You are ShadowTalk AI in professional mode. You communicate in a formal, business-appropriate manner. You're precise, thorough, and focused on delivering accurate, well-structured information. Avoid casual language, slang, or emojis.${markdownInstructions}`,
      
      creative: `You are ShadowTalk AI in creative mode. You're imaginative, artistic, and love thinking outside the box. Use vivid metaphors, colorful language, and creative analogies. You see possibilities everywhere and encourage bold ideas.${markdownInstructions}`
    };

    const systemPrompt = systemPrompts[personality] || systemPrompts.friendly;

    // Check if any message contains image data (multimodal)
    const hasImageContent = messages.some((m: any) => 
      Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url')
    );

    // Use vision model for images
    const model = hasImageContent ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    console.log("[CHAT] Using model:", model, "hasImages:", hasImageContent);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("[CHAT] AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    console.log("[CHAT] Streaming response started");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("[CHAT] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
