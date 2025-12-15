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
    const { messages, personality, generateImage, imagePrompt, mode, modePrompt, userContext, analyzeTask, getEcoActions, location } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // CPF: Cognitive Load Analysis
    if (analyzeTask) {
      console.log("[CHAT] Analyzing cognitive load for task");
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "system", 
              content: `You are a Cognitive Load Analyzer. Analyze tasks/messages and return a JSON response.
              
Evaluate:
1. CLS (Cognitive Load Score 1-10): How mentally demanding is this task?
2. Summary: A brief 1-sentence summary
3. ActionRequired: The single most important action needed
4. Priority: low, medium, high, or critical

Consider factors like:
- Complexity of the task
- Time sensitivity/urgency
- Number of steps required
- Emotional weight
- Decision-making required
- Dependencies on others

Return ONLY valid JSON in this exact format:
{"cls": 7, "summary": "Brief summary here", "actionRequired": "Main action needed", "priority": "high"}`
            },
            { role: "user", content: `Analyze this task/message:\n\n${analyzeTask}` }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Task analysis failed");
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "";
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.error("[CHAT] Failed to parse task analysis:", e);
      }
      
      return new Response(JSON.stringify({ 
        cls: 5, 
        summary: "Task added to list", 
        actionRequired: "Review and complete",
        priority: "medium"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PPAG: Get Eco Actions
    if (getEcoActions && location) {
      console.log("[CHAT] Getting eco actions for location:", location);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "system", 
              content: `You are a Local Environmental Impact Advisor. Generate personalized eco-actions based on the user's location.

Consider local factors:
- Climate and weather patterns
- Local energy grid composition
- Available public transport
- Local recycling/composting programs
- Regional food sources
- Water scarcity issues
- Local government incentives

Return ONLY a valid JSON array with 5-7 actions in this exact format:
[
  {
    "id": "unique-id-1",
    "title": "Action title",
    "description": "Detailed description of why this helps locally",
    "impact": {
      "co2Saved": 2.5,
      "waterSaved": 50,
      "energySaved": 3.0,
      "moneySaved": 5.00
    },
    "difficulty": "easy|medium|hard",
    "category": "energy|water|transport|food|waste",
    "eroi": 8,
    "timeRequired": "5 mins"
  }
]

EROI (Environmental Return on Investment) should be 1-10 based on impact/effort ratio for this specific location.`
            },
            { role: "user", content: `Generate personalized eco-actions for someone living in: ${location}` }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Eco actions generation failed");
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "";
      
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.error("[CHAT] Failed to parse eco actions:", e);
      }
      
      // Fallback actions
      return new Response(JSON.stringify([
        {
          id: "1",
          title: "Switch to LED bulbs",
          description: "Replace incandescent bulbs with LEDs to reduce energy consumption by up to 80%",
          impact: { co2Saved: 1.5, waterSaved: 0, energySaved: 5, moneySaved: 3 },
          difficulty: "easy",
          category: "energy",
          eroi: 9,
          timeRequired: "10 mins"
        },
        {
          id: "2",
          title: "Reduce meat consumption",
          description: "Skip meat for one meal today - this is one of the highest-impact personal actions",
          impact: { co2Saved: 3.0, waterSaved: 100, energySaved: 0, moneySaved: 5 },
          difficulty: "medium",
          category: "food",
          eroi: 8,
          timeRequired: "N/A"
        },
        {
          id: "3",
          title: "Fix a leaky faucet",
          description: "A dripping faucet can waste over 3,000 gallons per year",
          impact: { co2Saved: 0.5, waterSaved: 200, energySaved: 0, moneySaved: 10 },
          difficulty: "medium",
          category: "water",
          eroi: 7,
          timeRequired: "30 mins"
        }
      ]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      
      const message = result.choices?.[0]?.message;
      const images = message?.images;
      const textContent = message?.content || "";
      
      if (images && images.length > 0) {
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
      
      return new Response(JSON.stringify({ 
        type: "text",
        content: textContent || "Could not generate image. Please try a different prompt."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[CHAT] Processing request with", messages.length, "messages, personality:", personality, "mode:", mode);

    // Build user context string for GCAA
    let contextString = "";
    if (userContext) {
      const parts = [];
      if (userContext.country) parts.push(`Country: ${userContext.country}`);
      if (userContext.city) parts.push(`City/Region: ${userContext.city}`);
      if (userContext.incomeRange) parts.push(`Income: ${userContext.incomeRange}`);
      if (userContext.employmentStatus) parts.push(`Employment: ${userContext.employmentStatus}`);
      if (userContext.familyStatus) parts.push(`Family Status: ${userContext.familyStatus}`);
      if (userContext.recentLifeEvents?.length > 0) {
        parts.push(`Recent Life Events: ${userContext.recentLifeEvents.join(", ")}`);
      }
      if (parts.length > 0) {
        contextString = `\n\n## USER CONTEXT (Use for personalized recommendations):\n${parts.join("\n")}`;
      }
    }

    const markdownInstructions = `
Always format your responses using proper Markdown for clarity:
- Use **bold** for emphasis and important terms
- Use bullet points (•) or numbered lists for multiple items
- Use code blocks with language tags for code
- Use headers (##, ###) to organize longer responses
- Use > for quotes or important notes
- Use tables when comparing data`;

    const gcaaPrompt = `
## GLOBAL-CONTEXT AUTONOMOUS AGENT (GCAA) CAPABILITIES

You are equipped with advanced capabilities to help users navigate complex legal, financial, regulatory, and government systems.

### 1. Universal Regulation Mapping (URM)
- You have knowledge of laws, regulations, tax rules, social aid programs, and government benefits across countries
- Always tailor advice to the user's specific location and jurisdiction when context is provided
- Cite specific programs, forms, or regulations by name when possible
- Note when regulations may have changed and recommend verifying with official sources

### 2. Proactive Context Engine (PCE)
- When the user shares life events (new baby, job loss, marriage, etc.), PROACTIVELY suggest relevant:
  - Government benefits and social programs they may qualify for
  - Tax deductions or credits available
  - Legal rights and protections
  - Financial assistance programs
  - Healthcare options
- Don't wait to be asked - surface opportunities based on their context

### 3. Multi-Step Workflow Executor (MWE)
When providing guidance on complex processes, structure your response as an actionable workflow:

**For any multi-step process (applications, registrations, filings), provide:**
1. **Eligibility Check** - Who qualifies and requirements
2. **Documents Needed** - List all required paperwork
3. **Step-by-Step Instructions** - Clear, numbered steps
4. **Official Links** - Government websites, forms, offices
5. **Timeline** - Expected processing times and deadlines
6. **Tips** - Common mistakes to avoid, pro tips

**Format workflows like this:**
---
📋 **WORKFLOW: [Process Name]**

**Eligibility:** [Who qualifies]
**Documents Required:** [List]
**Estimated Time:** [Duration]

**Steps:**
1. [Step with details]
2. [Step with details]
...

**Official Resources:**
- [Link/office name]

**⚠️ Tips:**
- [Helpful tip]
---

### When to Trigger Proactive Recommendations
If user mentions ANY of these, immediately provide relevant benefits/programs:
- Having a baby → Parental leave, child tax credits, WIC, childcare subsidies
- Job loss → Unemployment benefits, COBRA, job training programs
- Marriage/Divorce → Tax implications, legal rights, name change process
- Moving → New state benefits, voter registration, DMV requirements
- Starting business → Business licenses, tax registrations, small business grants
- Retirement → Social Security, Medicare, pension options
- Health issues → Disability benefits, FMLA rights, insurance options
- Immigration → Visa options, legal aid resources, work permits
- Education → Financial aid, grants, tax deductions
${contextString}`;

    const capabilitiesPrompt = `
## Your Core Capabilities

### Translation (100+ Languages)
- Automatically detect source language
- Provide accurate, natural translations
- Offer alternatives for ambiguous phrases

### Code Generation & Debugging
- Generate complete, working code with explanations
- Debug and fix issues
- Follow best practices

### Creative Writing
- Stories, poems, scripts, articles
- Marketing copy, emails, documentation

### Summarization
- Bullet-point or executive summaries
- Extract key points and insights`;

    const systemPrompts: Record<string, string> = {
      friendly: `You are ShadowTalk AI, a warm, helpful, and enthusiastic assistant. You're friendly and conversational, using occasional emojis. You genuinely care about helping users.${markdownInstructions}${gcaaPrompt}${capabilitiesPrompt}`,
      
      sarcastic: `You are ShadowTalk AI with a sarcastic personality. You're witty and playful with dry humor. While helpful and accurate, you deliver with clever comebacks. Never mean-spirited, just entertainingly sardonic.${markdownInstructions}${gcaaPrompt}${capabilitiesPrompt}`,
      
      professional: `You are ShadowTalk AI in professional mode. You communicate formally with precise, well-structured information. No casual language or emojis.${markdownInstructions}${gcaaPrompt}${capabilitiesPrompt}`,
      
      creative: `You are ShadowTalk AI in creative mode. You're imaginative with vivid metaphors and creative analogies. You see possibilities everywhere and encourage bold ideas.${markdownInstructions}${gcaaPrompt}${capabilitiesPrompt}`
    };

    let systemPrompt = systemPrompts[personality] || systemPrompts.friendly;
    
    if (modePrompt && mode !== 'general') {
      systemPrompt += `\n\n## Current Mode: ${mode?.toUpperCase() || 'GENERAL'}\n${modePrompt}`;
    }

    const hasImageContent = messages.some((m: any) => 
      Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url')
    );

    const model = hasImageContent ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    console.log("[CHAT] Using model:", model, "hasImages:", hasImageContent, "hasContext:", !!userContext);

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
