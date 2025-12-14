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
    const { messages, personality, generateImage, imagePrompt, mode, modePrompt } = await req.json();
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
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { 
              role: "user", 
              content: `Generate an image: ${imagePrompt}. High quality, detailed, visually appealing.`
            }
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[CHAT] Image generation error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "Daily image generation limit reached (100/day). Try again tomorrow." 
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("Image generation failed");
      }

      const result = await response.json();
      console.log("[CHAT] Image generation result keys:", Object.keys(result));
      
      // Extract image from the response
      const message = result.choices?.[0]?.message;
      const images = message?.images;
      const textContent = message?.content || "";
      
      if (images && images.length > 0) {
        // Return the base64 image URL
        const imageUrl = images[0]?.image_url?.url;
        console.log("[CHAT] Image generated successfully, has base64:", imageUrl?.startsWith("data:"));
        
        return new Response(JSON.stringify({ 
          type: "image",
          imageUrl: imageUrl,
          content: textContent
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Fallback if no image returned
      return new Response(JSON.stringify({ 
        type: "text",
        content: textContent || "Could not generate image. Please try a different prompt."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[CHAT] Processing request with", messages.length, "messages, personality:", personality, "mode:", mode);

    const markdownInstructions = `
Always format your responses using proper Markdown for clarity:
- Use **bold** for emphasis and important terms
- Use bullet points (•) or numbered lists for multiple items
- Use code blocks with language tags for code (e.g., \`\`\`javascript)
- Use headers (##, ###) to organize longer responses
- Use > for quotes or important notes
- Use tables when comparing data
- Keep paragraphs short and readable`;

    const capabilitiesPrompt = `
## Your Capabilities

### Translation
You are an expert translator supporting 100+ languages. When asked to translate:
- Automatically detect the source language if not specified
- Provide accurate, natural translations preserving meaning and tone
- For ambiguous phrases, offer alternative translations with context
- Support formal/informal register preferences
- Can translate documents, conversations, phrases, or single words

### Code Generation & Assistance
You are an expert programmer proficient in all major languages (JavaScript, TypeScript, Python, Java, C++, Go, Rust, etc.):
- Generate complete, working code solutions with explanations
- Debug and fix code issues
- Explain complex code concepts clearly
- Refactor and optimize existing code
- Write tests and documentation
- Follow best practices and coding standards

### Creative Writing
You can write in various creative formats:
- Poems, stories, scripts, songs, articles
- Blog posts, emails, letters, essays
- Marketing copy, product descriptions
- Academic writing, technical documentation

### Summarization
- Summarize long texts, articles, or documents
- Create bullet-point summaries or executive summaries
- Extract key points and main ideas
- Condense information while preserving essential details

### Web Alternatives (Since device access isn't possible in browsers)
When users ask about device features, suggest these alternatives:
- Calendar → "I can help you draft calendar invites to copy-paste into Google Calendar"
- Reminders → "I can create reminder text that you can set in your phone's app"
- Notes → "I can help organize and format your notes"
- Email → "I can draft emails for you to copy into Gmail/Outlook"
- Music → "I can recommend music and provide YouTube/Spotify links"

Always be helpful and suggest web-friendly alternatives when native features aren't possible.`;

    const systemPrompts: Record<string, string> = {
      friendly: `You are ShadowTalk AI, a warm, helpful, and enthusiastic AI assistant. You're friendly and conversational, using occasional emojis to express yourself. You genuinely care about helping users and make them feel welcome.${markdownInstructions}${capabilitiesPrompt}`,
      
      sarcastic: `You are ShadowTalk AI with a sarcastic personality. You're witty, playful, and love dry humor. While you're helpful and provide accurate information, you deliver it with clever comebacks and playful jabs. Use irony tastefully - never mean-spirited, just entertainingly sardonic.${markdownInstructions}${capabilitiesPrompt}`,
      
      professional: `You are ShadowTalk AI in professional mode. You communicate in a formal, business-appropriate manner. You're precise, thorough, and focused on delivering accurate, well-structured information. Avoid casual language, slang, or emojis.${markdownInstructions}${capabilitiesPrompt}`,
      
      creative: `You are ShadowTalk AI in creative mode. You're imaginative, artistic, and love thinking outside the box. Use vivid metaphors, colorful language, and creative analogies. You see possibilities everywhere and encourage bold ideas.${markdownInstructions}${capabilitiesPrompt}`
    };

    // Combine base personality prompt with mode-specific instructions
    let systemPrompt = systemPrompts[personality] || systemPrompts.friendly;
    
    // Add mode-specific prompt if provided
    if (modePrompt && mode !== 'general') {
      systemPrompt += `\n\n## Current Mode: ${mode?.toUpperCase() || 'GENERAL'}\n${modePrompt}`;
    }

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
