import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, User, Send, ArrowLeft, LogOut, Settings, Plus, MessageSquare, Trash2, Sparkles, Briefcase, Laugh, Heart, Copy, Check, RefreshCw, Mic, MicOff, Volume2, VolumeX, Download, Lock, Square, Edit2, Image as ImageIcon } from "lucide-react";

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
import { FileUpload } from "@/components/chat/FileUpload";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { CodeCanvas } from "@/components/chat/CodeCanvas";
import { ImageGenerator } from "@/components/chat/ImageGenerator";
import { EditMessageDialog } from "@/components/chat/EditMessageDialog";
import { ModeSelector, ChatMode, getModePrompt } from "@/components/chat/ModeSelector";
import { CodeBlock } from "@/components/chat/CodeBlock";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type MessageContent = string | { type: string; text?: string; image_url?: { url: string } }[];
type Message = { 
  id: string; 
  type: "user" | "ai"; 
  content: string; 
  timestamp: Date;
  attachment?: { type: 'image' | 'file'; data: string; name: string; mimeType: string };
};
type Conversation = { id: string; title: string; created_at: string };
type Personality = "friendly" | "sarcastic" | "professional" | "creative";

const personalities: { value: Personality; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "friendly", label: "Friendly", icon: <Heart className="h-4 w-4" />, description: "Warm and helpful" },
  { value: "sarcastic", label: "Sarcastic", icon: <Laugh className="h-4 w-4" />, description: "Witty and playful" },
  { value: "professional", label: "Professional", icon: <Briefcase className="h-4 w-4" />, description: "Formal and precise" },
  { value: "creative", label: "Creative", icon: <Sparkles className="h-4 w-4" />, description: "Imaginative and bold" },
];

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
  const [chatMode, setChatMode] = useState<ChatMode>("general");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ type: 'image' | 'file'; data: string; name: string; mimeType: string } | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [codeCanvas, setCodeCanvas] = useState<{ code: string; language: string } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ index: number; content: string } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
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
      friendly: "🔥 Welcome to ShadowTalk AI! I can understand images, generate creative content, and help you with code. Try uploading an image or use /imagine to create one! What would you like to explore?",
      sarcastic: "Oh great, another human who needs my help. 🙄 Just kidding! I can analyze images, generate art, and write code. What earth-shattering problem can I solve?",
      professional: "Good day. I am your AI assistant with multimodal capabilities including image analysis, code assistance, and creative generation. How may I assist you?",
      creative: "✨ Greetings, fellow dreamer! I can see images, create art with /imagine, and bring code to life. What magical creation shall we craft together?"
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

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast({ title: "Generation stopped" });
    }
  };

  const handleSendMessage = async (customMessage?: string, customAttachment?: typeof selectedFile) => {
    const messageToSend = customMessage || message;
    const attachmentToSend = customAttachment || selectedFile;
    
    if ((!messageToSend.trim() && !attachmentToSend) || isLoading || !currentConversationId) return;
    
    // Check for /imagine command
    if (messageToSend.trim().toLowerCase().startsWith('/imagine ')) {
      setShowImageGenerator(true);
      setMessage(messageToSend.replace(/^\/imagine\s+/i, ''));
      return;
    }

    const userMessageContent = messageToSend;
    const userMessage: Message = { 
      id: crypto.randomUUID(), 
      type: "user", 
      content: userMessageContent, 
      timestamp: new Date(),
      attachment: attachmentToSend || undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setSelectedFile(null);
    setDailyChats(prev => prev + 1);
    setIsLoading(true);

    // Create abort controller for stop functionality
    abortControllerRef.current = new AbortController();

    // Save user message
    await saveMessage(userMessageContent, 'user');

    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Build message content for API
      const buildMessageContent = (msg: Message): MessageContent => {
        if (msg.attachment?.type === 'image') {
          return [
            { type: "text", text: msg.content || "What's in this image?" },
            { type: "image_url", image_url: { url: msg.attachment.data } }
          ];
        }
        return msg.content;
      };

      const chatMessages = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ 
          role: m.type === "user" ? "user" : "assistant", 
          content: buildMessageContent(m)
        }));
      
      chatMessages.push({ 
        role: "user", 
        content: buildMessageContent(userMessage)
      });

      // Get mode-specific system prompt
      const modePrompt = getModePrompt(chatMode);

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages, personality, mode: chatMode, modePrompt }),
        signal: abortControllerRef.current.signal,
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
      if (error instanceof Error && error.name === 'AbortError') {
        // User stopped generation
        if (assistantContent) {
          await saveMessage(assistantContent + "\n\n*[Generation stopped]*", 'assistant');
        }
        return;
      }
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
      abortControllerRef.current = null;
    }
  };

  const handleEditMessage = async (index: number, newContent: string) => {
    if (isLoading) return;

    // Remove all messages after this one and resend
    const messagesBeforeEdit = messages.slice(0, index);
    const editedMessage = messages[index];
    
    setMessages(messagesBeforeEdit);
    setEditingMessage(null);
    
    // Resend with edited content
    handleSendMessage(newContent, editedMessage.attachment);
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
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({ title: "Listening...", description: "Speak now. Click stop when done." });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setMessage(transcript);
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

  // Text-to-Speech function (Pro feature)
  const handleTextToSpeech = (text: string, messageId: string) => {
    if (userPlan !== 'pro') {
      toast({
        title: "Pro Feature",
        description: "Text-to-speech is available for Pro subscribers only.",
        variant: "destructive",
      });
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    // Stop if already speaking this message
    if (speakingMessageId === messageId && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    // Strip markdown for cleaner speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`[^`]+`/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Export chat function (Pro feature)
  const handleExportChat = () => {
    if (userPlan !== 'pro') {
      toast({
        title: "Pro Feature",
        description: "Chat export is available for Pro subscribers only.",
        variant: "destructive",
      });
      return;
    }

    const chatContent = messages
      .filter(m => m.id !== 'welcome')
      .map(m => `[${m.type.toUpperCase()}] ${m.content}`)
      .join('\n\n---\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowtalk-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Chat exported successfully" });
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
    
    const userMessage = messages[userMessageIndex];
    
    // Remove the AI response we're regenerating
    const messagesBeforeAi = messages.slice(0, aiMessageIndex);
    setMessages(messagesBeforeAi);
    
    // Resend the user message
    handleSendMessage(userMessage.content, userMessage.attachment);
  };

  const handleOpenCodeCanvas = (code: string, language: string) => {
    setCodeCanvas({ code, language });
  };

  const maxChats = userPlan === "pro" ? "∞" : "15";
  const showSuggestions = messages.length <= 1;

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
            <div className="flex items-center space-x-3">
              {/* Mode Selector */}
              <ModeSelector 
                mode={chatMode} 
                onModeChange={(mode) => {
                  setChatMode(mode);
                  if (mode === 'image') {
                    setShowImageGenerator(true);
                  }
                }}
                disabled={isLoading}
              />
              
              {/* Personality Selector */}
              <Select value={personality} onValueChange={(v) => setPersonality(v as Personality)}>
                <SelectTrigger className="w-36">
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExportChat}
                title={userPlan !== 'pro' ? 'Pro feature' : 'Export chat'}
                className={userPlan !== 'pro' ? 'opacity-50' : ''}
              >
                <Download className="h-4 w-4" />
                {userPlan !== 'pro' && <Lock className="h-3 w-3 ml-1" />}
              </Button>
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
            {/* Suggested Prompts */}
            {showSuggestions && (
              <SuggestedPrompts 
                onSelect={(prompt) => setMessage(prompt)} 
                personality={personality}
              />
            )}

            {messages.map((msg, index) => (
              <div key={msg.id} className={`group flex items-start space-x-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'bg-primary' : 'bg-gradient-primary'}`}>
                  {msg.type === 'user' ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  {/* Attachment preview for user messages */}
                  {msg.attachment?.type === 'image' && (
                    <img 
                      src={msg.attachment.data} 
                      alt={msg.attachment.name}
                      className="max-w-xs rounded-lg border border-border mb-2"
                    />
                  )}
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
                                  <CodeBlock
                                    code={codeString}
                                    language={match[1]}
                                    onOpenCanvas={handleOpenCodeCanvas}
                                  />
                                );
                              }
                              return inline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                              ) : (
                                <CodeBlock
                                  code={codeString}
                                  language="text"
                                  onOpenCanvas={handleOpenCodeCanvas}
                                />
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
                  {/* Action buttons */}
                  {msg.id !== 'welcome' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.type === 'user' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMessage({ index, content: msg.content })}
                          disabled={isLoading}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      {msg.type === 'ai' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTextToSpeech(msg.content, msg.id)}
                            disabled={isLoading}
                            className={`h-7 px-2 text-xs text-muted-foreground hover:text-foreground ${
                              userPlan !== 'pro' ? 'opacity-50' : ''
                            }`}
                            title={userPlan !== 'pro' ? 'Pro feature' : speakingMessageId === msg.id ? 'Stop speaking' : 'Read aloud'}
                          >
                            {speakingMessageId === msg.id && isSpeaking ? (
                              <VolumeX className="h-3 w-3 mr-1" />
                            ) : (
                              <Volume2 className="h-3 w-3 mr-1" />
                            )}
                            {userPlan !== 'pro' && <Lock className="h-2 w-2 mr-0.5" />}
                            {speakingMessageId === msg.id && isSpeaking ? 'Stop' : 'Listen'}
                          </Button>
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
                        </>
                      )}
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
            <div className="flex items-center space-x-2">
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                onClear={() => setSelectedFile(null)}
                disabled={isLoading}
              />
              <Input 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                onKeyPress={handleKeyPress} 
                placeholder={isListening ? "Listening... (click to stop)" : `Message ShadowTalk AI (${personality} mode)... Use /imagine for images`}
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
              <Button
                onClick={() => setShowImageGenerator(true)}
                variant="outline"
                disabled={isLoading}
                title="Generate image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              {isLoading ? (
                <Button onClick={stopGeneration} variant="destructive">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => handleSendMessage()} className="btn-glow" disabled={!message.trim() && !selectedFile}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Generator Modal */}
      {showImageGenerator && (
        <ImageGenerator
          onClose={() => setShowImageGenerator(false)}
          onImageGenerated={(content, prompt) => {
            setShowImageGenerator(false);
            // Add the image generation request and response to chat
            const userMsg: Message = {
              id: crypto.randomUUID(),
              type: 'user',
              content: `/imagine ${prompt}`,
              timestamp: new Date()
            };
            const aiMsg: Message = {
              id: crypto.randomUUID(),
              type: 'ai',
              content: `🎨 **Image Generation Result**\n\n${content}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, userMsg, aiMsg]);
          }}
        />
      )}

      {/* Code Canvas */}
      {codeCanvas && (
        <CodeCanvas
          code={codeCanvas.code}
          language={codeCanvas.language}
          onClose={() => setCodeCanvas(null)}
        />
      )}

      {/* Edit Message Dialog */}
      {editingMessage && (
        <EditMessageDialog
          message={editingMessage.content}
          onSave={(newContent) => handleEditMessage(editingMessage.index, newContent)}
          onCancel={() => setEditingMessage(null)}
        />
      )}
    </div>
  );
};

export default ChatbotPage;
