import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowLeft, Book, Code, Zap, MessageSquare, Image, Mic, Shield, Brain,
  Palette, Users, Download, Search, ChevronRight, ExternalLink, Sparkles,
  Settings, Lock, Bell, Globe, Keyboard, FileText, HelpCircle, Lightbulb,
  Terminal, Database, Cloud, Smartphone, Monitor, Wifi, WifiOff, Volume2,
  Upload, Share2, History, Star, Crown, Check, X, BarChart, Bot, Leaf, HeartPulse
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const DocSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="text-2xl font-bold mb-4 gradient-text">{title}</h2>
    {children}
  </section>
);

const DocCard = ({ icon: Icon, title, description, badge }: { icon: any; title: string; description: string; badge?: string }) => (
  <Card className="card-hover">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {badge && <Badge variant="secondary">{badge}</Badge>}
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

const CodeExample = ({ title, code, language = "bash" }: { title: string; code: string; language?: string }) => (
  <div className="rounded-xl border border-border overflow-hidden mb-4">
    <div className="bg-muted px-4 py-2 text-sm font-medium border-b border-border flex items-center justify-between">
      <span>{title}</span>
      <Badge variant="outline" className="text-xs">{language}</Badge>
    </div>
    <pre className="p-4 overflow-x-auto text-sm bg-card">
      <code className="text-foreground">{code}</code>
    </pre>
  </div>
);

const FeatureComparison = () => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left p-4">Feature</th>
          <th className="text-center p-4">Free</th>
          <th className="text-center p-4">Pro</th>
          <th className="text-center p-4">Elite</th>
        </tr>
      </thead>
      <tbody>
        {[
          { feature: "Daily Messages", free: "50", pro: "Unlimited", elite: "Unlimited" },
          { feature: "AI Chat", free: true, pro: true, elite: true },
          { feature: "Voice Input", free: true, pro: true, elite: true },
          { feature: "Voice Output (TTS)", free: false, pro: true, elite: true },
          { feature: "Image Analysis", free: true, pro: true, elite: true },
          { feature: "Image Generation", free: false, pro: true, elite: true },
          { feature: "Code Canvas", free: false, pro: true, elite: true },
          { feature: "Chat Export", free: false, pro: true, elite: true },
          { feature: "Collaborative Rooms", free: false, pro: true, elite: true },
          { feature: "File Uploads", free: "5MB", pro: "50MB", elite: "500MB" },
          { feature: "Analytics Dashboard", free: false, pro: true, elite: true },
          { feature: "Script Automation", free: false, pro: false, elite: true },
          { feature: "Offline Mode", free: false, pro: false, elite: true },
          { feature: "Stealth Vault", free: false, pro: false, elite: true },
          { feature: "Model Fine-Tuning", free: false, pro: false, elite: true },
          { feature: "White-Label Branding", free: false, pro: false, elite: true },
          { feature: "Specialized AI Panels", free: false, pro: false, elite: true },
          { feature: "API Access", free: false, pro: false, elite: true },
          { feature: "Priority Support", free: false, pro: true, elite: "24/7" },
        ].map((row, i) => (
          <tr key={i} className="border-b border-border hover:bg-muted/50">
            <td className="p-4 font-medium">{row.feature}</td>
            <td className="text-center p-4">
              {typeof row.free === 'boolean' ? (
                row.free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
              ) : row.free}
            </td>
            <td className="text-center p-4">
              {typeof row.pro === 'boolean' ? (
                row.pro ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
              ) : row.pro}
            </td>
            <td className="text-center p-4">
              {typeof row.elite === 'boolean' ? (
                row.elite ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
              ) : row.elite}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DocsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    { icon: MessageSquare, title: "Multimodal AI Chat", description: "Engage with an AI that understands text, voice, and images.", badge: "Free" },
    { icon: Code, title: "Code Canvas", description: "Generate, edit, and run code in an interactive environment.", badge: "Pro" },
    { icon: BarChart, title: "Analytics Dashboard", description: "Visualize your chat activity and usage patterns.", badge: "Pro" },
    { icon: Users, title: "Collaborative Rooms", description: "Chat with AI together in real-time.", badge: "Pro" },
    { icon: Shield, title: "Stealth Vault", description: "Encrypted, local-first storage for sensitive conversations.", badge: "Elite" },
    { icon: Bot, title: "Script Automation", description: "Automate complex tasks by running predefined AI scripts.", badge: "Elite" },
    { icon: Brain, title: "Model Fine-Tuning", description: "Personalize your AI's responses with custom training.", badge: "Elite" },
    { icon: Palette, title: "White-Label Branding", description: "Customize the chatbot's appearance for your brand.", badge: "Elite" },
  ];

  const quickStartSteps = [
    { step: 1, title: "Create an Account", description: "Sign up with your email or social login to get started. No credit card required for the free tier.", icon: Users },
    { step: 2, title: "Start Chatting", description: "Open the chatbot and start typing, speaking, or uploading files. The AI will respond in real-time.", icon: MessageSquare },
    { step: 3, title: "Explore Modes", description: "Use the mode selector to tailor the AI for specific tasks like coding, translation, or creative writing.", icon: Zap },
    { step: 4, title: "Upgrade for More", description: "Unlock advanced features like our Analytics Dashboard, Script Automation, and the Stealth Vault.", icon: Crown },
  ];

  const apiEndpoints = [
    { method: "POST", endpoint: "/v1/chat", description: "Send a message and receive AI response", example: `{\n  "messages": [{"role": "user", "content": "Hello!"}],\n  "model": "gemini-2.5-flash",\n  "personality": "friendly"\n}` },
    { method: "POST", endpoint: "/v1/images/generate", description: "Generate an image from text prompt", example: `{\n  "prompt": "A sunset over mountains",\n  "size": "1024x1024"\n}` },
    { method: "GET", endpoint: "/v1/conversations", description: "List user conversations", example: null },
    { method: "POST", endpoint: "/v1/rooms", description: "Create a collaborative room", example: `{\n  "name": "Team Brainstorm",\n  "is_public": true\n}` },
    { method: "GET", endpoint: "/v1/rooms/:id/messages", description: "Get messages from a room", example: null },
    { method: "POST", endpoint: "/v1/transcribe", description: "Transcribe audio to text", example: `{\n  "audio": "base64_encoded_audio",\n  "language": "en"\n}` },
  ];

  const chatModes = [
    { name: "General", icon: MessageSquare, description: "All-purpose assistant for any topic.", color: "from-blue-500 to-cyan-500" },
    { name: "Code", icon: Code, description: "Programming and debugging assistance.", color: "from-green-500 to-emerald-500" },
    { name: "Creative", icon: Sparkles, description: "Writing, storytelling, and content creation.", color: "from-purple-500 to-pink-500" },
    { name: "Translate", icon: Globe, description: "Multi-language translation support.", color: "from-amber-500 to-orange-500" },
    { name: "Summarize", icon: FileText, description: "Condense long texts into key points.", color: "from-red-500 to-rose-500" },
    { name: "Image", icon: Image, description: "Generate images from descriptions.", color: "from-indigo-500 to-violet-500" },
    { name: "Debug", icon: Terminal, description: "Find and fix bugs in your code.", color: "from-teal-500 to-cyan-500" },
    { name: "Brainstorm", icon: Lightbulb, description: "Generate ideas and explore concepts.", color: "from-yellow-500 to-amber-500" },
    { name: "Explain", icon: HelpCircle, description: "Break down complex topics simply.", color: "from-cyan-500 to-blue-500" },
    { name: "Music", icon: Volume2, description: "Get music recommendations and discover new artists.", color: "from-pink-500 to-rose-500" },
  ];
  
  const specialPanels = [
      { name: "Cognitive Load Panel", icon: Brain, description: "Analyze and get feedback on the cognitive complexity of tasks and workflows.", badge: "Elite", mode: "cpf" },
      { name: "Planetary Action Panel", icon: Leaf, description: "Receive AI-driven suggestions for eco-friendly actions and sustainable choices based on your location.", badge: "Elite", mode: "ppag" },
      { name: "Security Audit Panel", icon: Shield, description: "Submit code snippets for a comprehensive security audit, identifying potential vulnerabilities.", badge: "Elite", mode: "hsca" },
      { name: "Universal Health Sentinel", icon: HeartPulse, description: "Engage with an AI designed to provide general health and wellness information (not a substitute for medical advice).", badge: "Elite", mode: "uhs" }
  ];

  const personalities = [
      { name: "Friendly", emoji: "😊", description: "Warm, approachable, and conversational. Great for casual chats." },
      { name: "Professional", emoji: "💼", description: "Formal, precise, and business-oriented. For work-related tasks." },
      { name: "Creative", emoji: "🎨", description: "Imaginative and expressive. Ideal for brainstorming." },
      { name: "Sarcastic", emoji: "😏", description: "Witty and humorous. For those who enjoy a bit of dry humor." },
      { name: "Meticulous", emoji: "꼼꼼", description: "Pays close attention to every detail, ensuring thoroughness and accuracy." },
      { name: "Curious", emoji: "🤔", description: "Eager to learn and explore, asking clarifying questions to understand better." },
      { name: "Diplomatic", emoji: "🤝", description: "Navigates conversations with care, skilled in handling sensitive topics." },
      { name: "Witty", emoji: "💡", description: "Quick and inventive with words, providing clever and amusing responses." },
      { name: "Pragmatic", emoji: "🔧", description: "Focused on practical solutions and straightforward answers." },
      { name: "Inquisitive", emoji: "❓", description: "Likes to ask questions and delve deeper into topics for comprehensive understanding." }
  ];

  const troubleshooting = [
    { 
      issue: "Messages not sending", 
      solutions: [
        "Check your internet connection.",
        "Refresh the page and try again.",
        "Ensure you are logged in to your account.",
        "Check if you've exceeded your daily message limit on the Free plan."
      ]
    },
    { 
      issue: "Voice input not working", 
      solutions: [
        "Allow microphone permissions in your browser settings.",
        "Check if your microphone is working in other applications.",
        "Use a modern browser like Chrome, Edge, or Safari for best compatibility.",
        "Ensure your surroundings are quiet to avoid background noise."
      ]
    },
    { 
      issue: "Elite features are locked", 
      solutions: [
        "Ensure you have an active Elite subscription.",
        "Try logging out and logging back in to refresh your session.",
        "Visit the Manage Subscription page to check your plan status.",
        "Contact support if your plan is active but features are still locked."
      ]
    },
    { 
      issue: "Offline mode not working", 
      solutions: [
        "Offline mode is an Elite feature. Ensure you have the correct plan.",
        "You must install the PWA to use offline mode effectively.",
        "The first time you use it, you need to be online to cache conversations.",
        "Offline responses are limited and will sync when you reconnect."
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4 border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20">Documentation</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              ShadowTalk AI Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comprehensive guides, tutorials, and reference documentation to help you get the most out of ShadowTalk AI.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="pl-10 rounded-xl"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/chatbot')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Try Chatbot
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/changelog')}>
                <History className="h-4 w-4 mr-2" />
                Changelog
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/pricing')}>
                <Crown className="h-4 w-4 mr-2" />
                Pricing
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Tabs defaultValue="getting-started" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 max-w-4xl mx-auto gap-1">
              <TabsTrigger value="getting-started">Get Started</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="personalities">Personalities</TabsTrigger>
              <TabsTrigger value="modes">Chat Modes</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-8">
              <DocSection title="Quick Start Guide">
                <p className="text-muted-foreground mb-6">
                  Get up and running with ShadowTalk AI in just a few minutes. Follow these simple steps to start your AI-powered journey.
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  {quickStartSteps.map(item => (
                    <Card key={item.step} className="card-hover relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <item.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-1">Step {item.step}</Badge>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="mt-2">{item.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </DocSection>

              <DocSection title="Installation (PWA)">
                 <p className="text-muted-foreground mb-6">
                  ShadowTalk AI is a Progressive Web App (PWA) that can be installed on any device for a native app-like experience, enabling features like offline access.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Installation cards here */}
                </div>
              </DocSection>

              <DocSection title="Plan Comparison">
                <p className="text-muted-foreground mb-6">
                  Choose the plan that best fits your needs. All plans include core AI chat functionality.
                </p>
                <Card>
                  <CardContent className="pt-6">
                    <FeatureComparison />
                  </CardContent>
                </Card>
              </DocSection>
            </TabsContent>

            {/* Features */}
            <TabsContent value="features" className="space-y-8">
              <DocSection title="Core & Pro Features">
                <p className="text-muted-foreground mb-6">
                  ShadowTalk AI comes packed with powerful features designed to enhance your productivity and creativity, from free core tools to advanced Pro capabilities.
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {features.filter(f => f.badge !== "Elite").map((feature, i) => (
                    <DocCard key={i} {...feature} />
                  ))}
                </div>
              </DocSection>
              
              <DocSection title="Elite Plan Features">
                <p className="text-muted-foreground mb-6">
                  The Elite plan unlocks the full potential of ShadowTalk AI with exclusive features for power users, developers, and businesses.
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {features.filter(f => f.badge === "Elite").map((feature, i) => (
                    <DocCard key={i} {...feature} />
                  ))}
                </div>
              </DocSection>

              <DocSection title="Specialized AI Panels (Elite)">
                <p className="text-muted-foreground mb-6">
                  Engage with highly specialized AI tools designed for complex, domain-specific tasks. Each panel provides a unique interface to interact with a focused AI model.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    {specialPanels.map((panel, i) => (
                        <DocCard key={i} icon={panel.icon} title={panel.name} description={panel.description} badge={panel.badge}/>
                    ))}
                </div>
              </DocSection>

            </TabsContent>
            
            {/* Personalities */}
            <TabsContent value="personalities" className="space-y-8">
                <DocSection title="AI Personalities">
                    <p className="text-muted-foreground mb-6">
                    Customize your interaction by choosing from 10 distinct AI personalities. Switch anytime to match your mood or task.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {personalities.map((p, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="text-lg">{p.name} {p.emoji}</CardTitle>
                                <CardDescription>{p.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                    </div>
                </DocSection>
            </TabsContent>

            {/* Chat Modes */}
            <TabsContent value="modes" className="space-y-8">
              <DocSection title="Specialized Chat Modes">
                <p className="text-muted-foreground mb-6">
                  ShadowTalk AI offers 10 specialized chat modes, each optimized for specific tasks. Select the right mode to get the best results.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {chatModes.map((mode, i) => (
                    <Card key={i} className="card-hover overflow-hidden">
                      <div className={`h-1 bg-gradient-to-r ${mode.color}`} />
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                            <mode.icon className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-lg">{mode.name}</CardTitle>
                        </div>
                        <CardDescription className="mt-2">{mode.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </DocSection>
            </TabsContent>

            {/* API Reference */}
            <TabsContent value="api" className="space-y-8">
              {/* API content here */}
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" className="space-y-8">
              <DocSection title="Frequently Asked Questions">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {/* FAQ items here */}
                </Accordion>
              </DocSection>

              <DocSection title="Troubleshooting Guide">
                <p className="text-muted-foreground mb-6">
                  Having issues? Find solutions to common problems below.
                </p>
                <Accordion type="single" collapsible className="space-y-2">
                  {troubleshooting.map((item, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border rounded-xl px-4">
                      <AccordionTrigger className="text-left">{item.issue}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {item.solutions.map((solution, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span>{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </DocSection>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DocsPage;
