import React, { useState } from "react";
import { Check, Star, Zap, Crown, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const PricingSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscription = async (planName: string) => {
    if (planName === "Free") {
      navigate('/chatbot');
      return;
    }

    toast({
      title: "Coming Soon",
      description: "Payment integration will be available soon!",
    });
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Perfect for trying our revolutionary AI",
      icon: Zap,
      popular: false,
      features: [
        "50 chat messages per day",
        "Basic AI responses",
        "Community support",
        "Standard response time"
      ],
      limitations: [
        "🔒 No code generation",
        "🔒 No script automation",
        "🔒 No offline mode",
        "🔒 No chat export",
        "Contains ads"
      ],
      cta: "Start Free",
      variant: "outline",
      urgency: false
    },
    {
      name: "Pro",
      price: "$20",
      period: "/month",
      description: "Unlock AI superpowers for creators",
      icon: Star,
      popular: true,
      features: [
        "Unlimited messages & chat history",
        "Advanced code generation",
        "Script automation engine",
        "Save & export everything",
        "Priority support (< 2h)",
        "No advertisements",
        "Dark mode & themes",
        "Real-time collaboration"
      ],
      limitations: [],
      cta: "Upgrade to Pro",
      variant: "default",
      urgency: false
    },
    {
      name: "Elite",
      price: "$49.99",
      period: "/month",
      description: "For power users who demand everything",
      icon: Crown,
      popular: false,
      features: [
        "Everything in Pro +",
        "🔥 Offline mode (works anywhere)",
        "Stealth mode & encrypted vault",
        "AI agents & workflow automation",
        "Custom model fine-tuning",
        "White-label solutions",
        "24/7 phone support",
        "Early beta access",
        "Advanced analytics dashboard"
      ],
      limitations: [],
      cta: "Go Elite",
      variant: "secondary",
      urgency: false
    },
    {
      name: "Lifetime",
      price: "$100,000",
      period: "one-time payment",
      description: "🔥 Limited time offer - Pay once, own forever!",
      icon: Infinity,
      popular: false,
      features: [
        "Everything in Elite forever",
        "All future updates included",
        "VIP Discord community access",
        "Exclusive webinars & training",
        "Direct developer access",
        "Never pay again!"
      ],
      limitations: [],
      cta: "Secure Lifetime Deal",
      variant: "outline",
      urgency: true,
      badge: "🔥 Only 47 left!"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-card/50 border border-border rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Simple Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your{" "}
            <span className="gradient-text">Perfect Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative card-hover ${
                plan.popular
                  ? 'ring-2 ring-primary shadow-glow scale-105'
                  : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              {plan.urgency && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground urgency-blink">
                  🔥 Only 47 left!
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary mb-4 mx-auto`}>
                  <plan.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start space-x-3">
                      <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full mx-auto mt-1"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  className={`w-full ${plan.popular ? 'btn-glow' : ''}`}
                  variant={plan.variant as any}
                  size="lg"
                  onClick={() => handleSubscription(plan.name)}
                  disabled={loading === plan.name}
                >
                  {loading === plan.name ? 'Processing...' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include 30-day money-back guarantee • Cancel anytime
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-success" />
              <span>No setup fees</span>
            </span>
            <span className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-success" />
              <span>Secure payment</span>
            </span>
            <span className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-success" />
              <span>Instant activation</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
