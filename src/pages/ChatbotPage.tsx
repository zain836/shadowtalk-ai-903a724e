import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, User, Send, ArrowLeft, LogOut, Settings, Plus, MessageSquare, Trash2, Sparkles, Briefcase, Laugh, Heart, Copy, Check, RefreshCw, Mic, MicOff } from "lucide-react";

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type Message = { id: string; type: "user" | "ai"; content: string; timestamp: Date };
type Conversation = { id: string; title: string; created_at: string };
type Personality = "friendly" | "sarcastic" | "professional" | "creative";

const personalities: { value: Personality; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "friendly", label: "Friendly", icon: <Heart className="h-4 w-4" />, description: "Warm and helpful" },
  { value: "sarcastic", label: "Sarcastic", icon: <Laugh className="h-4 w-4" />, description: "Witty and playful" },
  { value: "professional", label: "Professional", icon: <Briefcase className="h-4 w-4" />, description: "Formal and precise" },
  { value: "creative", label: "Creative", icon: <Sparkles className="h-4 w-4" />, description: "Imaginative and bold" },
];

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
};

const ChatbotPage = () => {
  const navigate = useNavigate();
  const { user, userPlan, signOut, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyChats, setDailyChats] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [personality, setPersonality] = useState<Personality>("friendly");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) navigate('/auth');
    else {
      loadConversations();
      checkSubscription();
    }
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (data && !error) {
      setConversations(data);
      if (data.length > 0 && !currentConversationId) {
        loadConversation(data[0].id);
      } else if (data.length === 0) {
        createNewConversation();
      }
    }
  };

  const loadConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (data && !error) {
      const loadedMessages: Message[] = data.map(m => ({
        id: m.id,
        type: m.role === 'user' ? 'user' : 'ai',
        content: m.content,
        timestamp: new Date(m.created_at)
      }));
      
      if (loadedMessages.length === 0) {
        setMessages([{
          id: 'welcome',
          type: 'ai',
          content: getWelcomeMessage(),
          timestamp: new Date()
        }]);
      } else {
        setMessages(loadedMessages);
      }
    }
  };

  const getWelcomeMessage = () => {
    const welcomeMessages: Record<Personality, string> = {
      friendly: "🔥 Welcome to ShadowTalk AI! I'm powered by advanced AI and ready to help you with anything. What would you like to explore today?",
      sarcastic: "Oh great, another human who needs my help. 🙄 Just kidding! What earth-shattering problem can I solve for you today?",
      professional: "Good day. I am your AI assistant, ready to provide accurate and efficient assistance. How may I help you today?",
      creative: "✨ Greetings, fellow dreamer! I'm here to help turn your wildest ideas into reality. What adventure shall we embark on?"
    };
    return welcomeMessages[personality];
  };

  const createNewConversation = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .single();
    
    if (data && !error) {
      setConversations(prev => [data, ...prev]);
      setCurrentConversationId(data.id);
      setMessages([{
        id: 'welcome',
        type: 'ai',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }]);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (!error) {
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          loadConversation(remaining[0].id);
        } else {
          createNewConversation();
        }
      }
      toast({ title: "Conversation deleted" });
    }
  };

  const saveMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!user || !currentConversationId) return null;
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        content,
        role,
        personality
      })
      .select()
      .single();
    
    // Update conversation title based on first user message
    if (role === 'user' && messages.length <= 1) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', currentConversationId);
      
      setConversations(prev => prev.map(c => 
        c.id === currentConversationId ? { ...c, title } : c
      ));
    } else {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversationId);
    }
    
    return data;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !currentConversationId) return;
    
    const userMessageContent = message;
    const userMessage: Message = { 
      id: crypto.randomUUID(), 
      type: "user", 
      content: userMessageContent, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setDailyChats(prev => prev + 1);
    setIsLoading(true);

    // Save user message
    await saveMessage(userMessageContent, 'user');

    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const chatMessages = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.type === "user" ? "user" : "assistant", content: m.content }));
      chatMessages.push({ role: "user", content: userMessageContent });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages, personality }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      const aiMessageId = crypto.randomUUID();

      const upsertAssistant = (nextChunk: string) => {
        assistantContent += nextChunk;
        setMessages(prev => {
          const existingAiIndex = prev.findIndex(m => m.id === aiMessageId);
          if (existingAiIndex !== -1) {
            return prev.map((m, i) => i === existingAiIndex ? { ...m, content: assistantContent } : m);
          }
          return [...prev, { id: aiMessageId, type: "ai", content: assistantContent, timestamp: new Date() }];
        });
      };

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save AI response
      if (assistantContent) {
        await saveMessage(assistantContent, 'assistant');
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
      const errorMessage: Message = { 
        id: crypto.randomUUID(), 
        type: "ai", 
        content: "Sorry, I encountered an error. Please try again.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({ title: "Listening...", description: "Speak now" });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setMessage(transcript);
      
      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error !== 'aborted') {
        toast({
          title: "Voice input error",
          description: event.error === 'not-allowed' 
            ? "Microphone access denied. Please enable it in your browser settings."
            : `Error: ${event.error}`,
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not open subscription portal",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async (aiMessageIndex: number) => {
    if (isLoading || !currentConversationId) return;
    
    // Find the user message before this AI message
    const userMessageIndex = aiMessageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex]?.type !== 'user') {
      toast({ title: "Cannot regenerate", description: "No user message found to regenerate from", variant: "destructive" });
      return;
    }
    
    const userMessageContent = messages[userMessageIndex].content;
    
    // Remove the AI response we're regenerating
    const messagesBeforeAi = messages.slice(0, aiMessageIndex);
    setMessages(messagesBeforeAi);
    setIsLoading(true);

    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const chatMessages = messagesBeforeAi
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.type === "user" ? "user" : "assistant", content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages, personality }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      const aiMessageId = crypto.randomUUID();

      const upsertAssistant = (nextChunk: string) => {
        assistantContent += nextChunk;
        setMessages(prev => {
          const existingAiIndex = prev.findIndex(m => m.id === aiMessageId);
          if (existingAiIndex !== -1) {
            return prev.map((m, i) => i === existingAiIndex ? { ...m, content: assistantContent } : m);
          }
          return [...prev, { id: aiMessageId, type: "ai", content: assistantContent, timestamp: new Date() }];
        });
      };

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save regenerated AI response
      if (assistantContent) {
        await saveMessage(assistantContent, 'assistant');
      }
      
      toast({ title: "Response regenerated" });
    } catch (error) {
      console.error("Regenerate error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to regenerate response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maxChats = userPlan === "pro" ? "∞" : "15";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-card/50 backdrop-blur-sm border-r border-border p-4 flex flex-col">
            <Button onClick={createNewConversation} className="w-full mb-4 btn-glow">
              <Plus className="h-4 w-4 mr-2" /> New Chat
            </Button>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conv.id 
                      ? 'bg-primary/20 border border-primary/50' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{conv.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/30 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)} className="text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold gradient-text">ShadowTalk AI</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Personality Selector */}
              <Select value={personality} onValueChange={(v) => setPersonality(v as Personality)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {personalities.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center space-x-2">
                        {p.icon}
                        <span>{p.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Badge className={`${userPlan === "pro" ? "bg-primary text-primary-foreground" : "bg-card border-border"}`}>
                {userPlan === "pro" ? "⚡ Pro" : "Free"} • {dailyChats}/{maxChats}
              </Badge>
              {userPlan === "pro" && (
                <Button variant="ghost" size="sm" onClick={handleManageSubscription}>
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
            {messages.map((msg, index) => (
              <div key={msg.id} className={`group flex items-start space-x-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'bg-primary' : 'bg-gradient-primary'}`}>
                  {msg.type === 'user' ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className={`rounded-lg p-4 ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/80 text-foreground border border-border'}`}>
                    {msg.type === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:bg-background/50 prose-pre:border prose-pre:border-border prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeString = String(children).replace(/\n$/, '');
                              
                              if (!inline && match) {
                                return (
                                  <div className="relative group/code">
                                    <div className="flex items-center justify-between bg-muted/50 px-3 py-1 rounded-t-md border-b border-border">
                                      <span className="text-xs text-muted-foreground">{match[1]}</span>
                                      <CopyButton text={codeString} />
                                    </div>
                                    <pre className="!mt-0 !rounded-t-none">
                                      <code className={className} {...props}>{children}</code>
                                    </pre>
                                  </div>
                                );
                              }
                              return inline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                              ) : (
                                <div className="relative group/code">
                                  <CopyButton text={codeString} />
                                  <pre><code className={className} {...props}>{children}</code></pre>
                                </div>
                              );
                            },
                            ul({ children }) {
                              return <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>;
                            },
                            ol({ children }) {
                              return <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>;
                            },
                            li({ children }) {
                              return <li className="text-sm">{children}</li>;
                            },
                            h1({ children }) {
                              return <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>;
                            },
                            h2({ children }) {
                              return <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>;
                            },
                            h3({ children }) {
                              return <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>;
                            },
                            p({ children }) {
                              return <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>;
                            },
                            a({ children, href }) {
                              return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">{children}</a>;
                            },
                            blockquote({ children }) {
                              return <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2">{children}</blockquote>;
                            },
                            table({ children }) {
                              return <div className="overflow-x-auto my-2"><table className="min-w-full border border-border rounded">{children}</table></div>;
                            },
                            th({ children }) {
                              return <th className="border border-border px-3 py-1 bg-muted/50 text-left text-sm font-semibold">{children}</th>;
                            },
                            td({ children }) {
                              return <td className="border border-border px-3 py-1 text-sm">{children}</td>;
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {/* Action buttons for AI messages */}
                  {msg.type === 'ai' && msg.id !== 'welcome' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerate(index)}
                        disabled={isLoading}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        Regenerate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await navigator.clipboard.writeText(msg.content);
                          toast({ title: "Copied to clipboard" });
                        }}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted/80 rounded-lg p-4 border border-border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
            <div className="flex space-x-2">
              <Input 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                onKeyPress={handleKeyPress} 
                placeholder={isListening ? "Listening..." : `Message ShadowTalk AI (${personality} mode)...`}
                className={`flex-1 ${isListening ? 'border-primary ring-2 ring-primary/30' : ''}`}
                disabled={isLoading}
              />
              <Button 
                onClick={toggleVoiceInput} 
                variant={isListening ? "destructive" : "outline"}
                className={isListening ? "animate-pulse" : ""}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSendMessage} className="btn-glow" disabled={isLoading || !message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
