import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Book, Code, Zap, MessageSquare, Image, Mic, Shield, Brain,
  Palette, Users, Download, Search, ChevronRight, ExternalLink, Sparkles
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

const CodeExample = ({ title, code }: { title: string; code: string }) => (
  <div className="rounded-xl border border-border overflow-hidden mb-4">
    <div className="bg-muted px-4 py-2 text-sm font-medium border-b border-border">{title}</div>
    <pre className="p-4 overflow-x-auto text-sm">
      <code>{code}</code>
    </pre>
  </div>
);

const DocsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    { icon: MessageSquare, title: "AI Chat", description: "Engage in natural conversations with advanced AI models", badge: "Free" },
    { icon: Image, title: "Image Generation", description: "Create stunning images from text descriptions", badge: "Pro" },
    { icon: Mic, title: "Voice Input", description: "Speak to the AI using voice recognition", badge: "Free" },
    { icon: Code, title: "Code Generation", description: "Generate and debug code in multiple languages", badge: "Pro" },
    { icon: Brain, title: "Model Fine-Tuning", description: "Train personalized AI responses", badge: "Elite" },
    { icon: Palette, title: "White-Label", description: "Customize branding and appearance", badge: "Elite" },
    { icon: Users, title: "Collaborative Rooms", description: "Chat with AI together in real-time", badge: "Pro" },
    { icon: Shield, title: "Stealth Mode", description: "Encrypted vault for sensitive data", badge: "Elite" },
  ];

  const quickStartSteps = [
    { step: 1, title: "Create an Account", description: "Sign up with your email or social login to get started." },
    { step: 2, title: "Start Chatting", description: "Open the chatbot and start typing your questions or prompts." },
    { step: 3, title: "Explore Features", description: "Try different modes, voice input, and file uploads for enhanced interactions." },
    { step: 4, title: "Upgrade for More", description: "Unlock advanced features with Pro or Elite plans." },
  ];

  const apiEndpoints = [
    { method: "POST", endpoint: "/v1/chat", description: "Send a message and receive AI response" },
    { method: "POST", endpoint: "/v1/images/generate", description: "Generate an image from text prompt" },
    { method: "GET", endpoint: "/v1/conversations", description: "List user conversations" },
    { method: "POST", endpoint: "/v1/rooms", description: "Create a collaborative room" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4 border-b border-border">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4">Documentation</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              ShadowTalk AI Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to know to get started and make the most of ShadowTalk AI
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
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Tabs defaultValue="getting-started" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto">
              <TabsTrigger value="getting-started">Get Started</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-8">
              <DocSection title="Quick Start Guide">
                <div className="grid gap-4 md:grid-cols-2">
                  {quickStartSteps.map(item => (
                    <Card key={item.step} className="card-hover">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            {item.step}
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </DocSection>

              <DocSection title="System Requirements">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-primary" />
                        <span>Modern web browser (Chrome, Firefox, Safari, Edge)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-primary" />
                        <span>Stable internet connection for real-time features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-primary" />
                        <span>Microphone access for voice input (optional)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-primary" />
                        <span>PWA installation supported on mobile devices</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </DocSection>

              <DocSection title="Installation">
                <p className="text-muted-foreground mb-4">
                  ShadowTalk AI is a Progressive Web App (PWA) that can be installed on any device.
                </p>
                <CodeExample
                  title="Install on Desktop (Chrome)"
                  code={`1. Visit shadowtalk.ai
2. Click the install icon in the address bar
3. Click "Install" in the prompt`}
                />
                <CodeExample
                  title="Install on Mobile (iOS)"
                  code={`1. Visit shadowtalk.ai in Safari
2. Tap the Share button
3. Select "Add to Home Screen"`}
                />
              </DocSection>
            </TabsContent>

            {/* Features */}
            <TabsContent value="features" className="space-y-8">
              <DocSection title="Core Features">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {features.map((feature, i) => (
                    <DocCard key={i} {...feature} />
                  ))}
                </div>
              </DocSection>

              <DocSection title="Chat Modes">
                <p className="text-muted-foreground mb-4">
                  ShadowTalk AI offers multiple specialized chat modes to optimize responses for different use cases.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">General</CardTitle>
                      <CardDescription>All-purpose assistant for any topic</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Code</CardTitle>
                      <CardDescription>Programming and debugging assistance</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Creative</CardTitle>
                      <CardDescription>Writing, storytelling, and content creation</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Translate</CardTitle>
                      <CardDescription>Multi-language translation support</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Summarize</CardTitle>
                      <CardDescription>Condense long texts into key points</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Image</CardTitle>
                      <CardDescription>Generate images from descriptions</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </DocSection>

              <DocSection title="Keyboard Shortcuts">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <span>Send message</span>
                        <Badge variant="outline">Enter</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <span>New line</span>
                        <Badge variant="outline">Shift + Enter</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <span>Voice input</span>
                        <Badge variant="outline">Ctrl + M</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <span>Toggle sidebar</span>
                        <Badge variant="outline">Ctrl + B</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DocSection>
            </TabsContent>

            {/* API Reference */}
            <TabsContent value="api" className="space-y-8">
              <DocSection title="API Reference">
                <p className="text-muted-foreground mb-6">
                  Access ShadowTalk AI programmatically through our REST API. Elite plan required.
                </p>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>All API requests require a Bearer token</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeExample
                      title="Request Header"
                      code={`Authorization: Bearer YOUR_API_KEY`}
                    />
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {apiEndpoints.map((endpoint, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono">{endpoint.endpoint}</code>
                        </div>
                        <p className="text-muted-foreground text-sm">{endpoint.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <CodeExample
                  title="Example: Send a Chat Message"
                  code={`curl -X POST https://api.shadowtalk.ai/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      { "role": "user", "content": "Hello!" }
    ],
    "model": "gemini-2.5-flash"
  }'`}
                />
              </DocSection>
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" className="space-y-8">
              <DocSection title="Frequently Asked Questions">
                <div className="space-y-4">
                  {[
                    { q: "How do I get started?", a: "Sign up for a free account and start chatting immediately. No credit card required for the free tier." },
                    { q: "What AI models does ShadowTalk use?", a: "We use Google's Gemini models for text and multimodal capabilities, offering state-of-the-art performance." },
                    { q: "Is my data secure?", a: "Yes! We use end-to-end encryption for all conversations. Elite users get additional security with the Stealth Vault feature." },
                    { q: "Can I use ShadowTalk offline?", a: "Elite plan users can access offline mode, which caches conversations and provides limited AI responses when offline." },
                    { q: "How do collaborative rooms work?", a: "Create a room, share the link, and multiple users can chat with the AI together in real-time. All messages are synced instantly." },
                    { q: "What's the difference between plans?", a: "Free: 50 messages/day. Pro: Unlimited messages, image generation, code canvas. Elite: All features including offline mode, stealth vault, and model fine-tuning." },
                    { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel your subscription at any time from the subscription management portal." },
                    { q: "How do I contact support?", a: "Free users get community support. Pro users get priority email support. Elite users get 24/7 phone support." },
                  ].map((item, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.q}</CardTitle>
                        <CardDescription>{item.a}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </DocSection>

              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Need More Help?</h3>
                  <p className="text-muted-foreground mb-4">
                    Our support team is here to help you get the most out of ShadowTalk AI
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="rounded-xl" onClick={() => navigate('/chatbot')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask AI
                    </Button>
                    <Button className="btn-glow rounded-xl">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DocsPage;
