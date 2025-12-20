import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
console.log({ RESEND_API_KEY });
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackNotificationRequest {
  feedbackId: string;
  category: string;
  rating: number;
  message: string;
  userEmail?: string;
}

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case "bug":
      return "🐛 Bug Report";
    case "feature":
      return "💡 Feature Request";
    case "improvement":
      return "⚡ Improvement Suggestion";
    case "other":
      return "❓ Other";
    default:
      return "📝 General Feedback";
  }
};

const getRatingStars = (rating: number): string => {
  return "⭐".repeat(rating) + "☆".repeat(5 - rating);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("[FEEDBACK-NOTIFICATION] Function started");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      feedbackId,
      category,
      rating,
      message,
      userEmail,
    }: FeedbackNotificationRequest = await req.json();
    console.log("[FEEDBACK-NOTIFICATION] Received feedback:", {
      feedbackId,
      category,
      rating,
    });

    // For now, send to a default admin email if configured
    // In production, you'd want to fetch admin emails from profiles or a config
    const adminEmail = "zaim98269@gmail.com";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #fafafa; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); padding: 24px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .content { padding: 24px; }
            .badge { display: inline-block; background: rgba(0, 212, 255, 0.2); border: 1px solid rgba(0, 212, 255, 0.3); color: #00d4ff; padding: 6px 12px; border-radius: 20px; font-size: 14px; margin-bottom: 16px; }
            .rating { font-size: 20px; margin: 16px 0; }
            .message { background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 3px solid #00d4ff; }
            .meta { color: #888; font-size: 12px; margin-top: 16px; }
            .footer { text-align: center; padding: 16px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Feedback Received</h1>
            </div>
            <div class="content">
              <div class="badge">${getCategoryLabel(category)}</div>
              <div class="rating">Rating: ${getRatingStars(rating)} (${rating}/5)</div>
              <div class="message">
                <p style="margin: 0;">${message}</p>
              </div>
              <div class="meta">
                <p><strong>From:</strong> ${userEmail || "Anonymous user"}</p>
                <p><strong>Feedback ID:</strong> ${feedbackId}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from ShadowTalk AI</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ShadowTalk AI <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `${getCategoryLabel(category)} - New Feedback (${rating}⭐)`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log(
      "[FEEDBACK-NOTIFICATION] Email sent successfully:",
      emailResult,
    );

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[FEEDBACK-NOTIFICATION] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);