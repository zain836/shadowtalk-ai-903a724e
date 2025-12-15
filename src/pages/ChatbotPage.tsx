import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, User, Copy, RefreshCw, Volume2, VolumeX, Lock, Edit2 } from "lucide-react";

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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { CodeCanvas } from "@/components/chat/CodeCanvas";
import { ImageGenerator } from "@/components/chat/ImageGenerator";
import { EditMessageDialog } from "@/components/chat/EditMessageDialog";
import { ChatMode, getModePrompt } from "@/components/chat/ModeSelector";
import { CodeBlock } from "@/components/chat/CodeBlock";
import { UserContextPanel, UserContext } from "@/components/chat/UserContextPanel";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import CognitiveLoadPanel from "@/components/chat/CognitiveLoadPanel";
import PlanetaryActionPanel from "@/components/chat/PlanetaryActionPanel";
import SecurityAuditPanel from "@/components/chat/SecurityAuditPanel";

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

const defaultUserContext: UserContext = {
  country: "",
  city: "",
  incomeRange: "",
  employmentStatus: "",
  familyStatus: "",
  interests: [],
  recentLifeEvents: [],
};

const ChatbotPage = () => {
  const navigate = useNavigate();
  const { user, userPlan, signOut, checkSubscription } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyChats, setDailyChats] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Settings
  const [personality, setPersonality] = useState<Personality>("friendly");
  const [chatMode, setChatMode] = useState<ChatMode>("general");
  const [showSidebar, setShowSidebar] = useState(true);
  
  // GCAA User Context
  const [userContext, setUserContext] = useState<UserContext>(() => {
    const saved = localStorage.getItem("shadowtalk_user_context");
    return saved ? JSON.parse(saved) : defaultUserContext;
  });
  
  // Voice & Media
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ type: 'image' | 'file'; data: string; name: string; mimeType: string } | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  
  // UI State
  const [codeCanvas, setCodeCanvas] = useState<{ code: string; language: string } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ index: number; content: string } | null>(null);
  const [isAnalyzingTask, setIsAnalyzingTask] = useState(false);
  const [isLoadingEcoActions, setIsLoadingEcoActions] = useState(false);
  const [isAnalyzingSecurity, setIsAnalyzingSecurity] = useState(false);
  
  // Refs
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

  const saveUserContext = () => {
    localStorage.setItem("shadowtalk_user_context", JSON.stringify(userContext));
    toast({ title: "Context saved", description: "Your profile has been updated for personalized assistance." });
  };

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
    const contextHint = userContext.country 
      ? `\n\nI see you're in **${userContext.country}**${userContext.city ? `, ${userContext.city}` : ''}. I'll tailor my advice to your location!` 
      : "\n\n💡 **Tip:** Set up your context profile above to get personalized recommendations for benefits, legal rights, and opportunities in your area.";
    
    const welcomeMessages: Record<Personality, string> = {
      friendly: `🔥 Welcome to ShadowTalk AI with **GCAA** (Global-Context Autonomous Agent)!\n\nI can help you:\n- Navigate **legal, financial, and regulatory** systems\n- Find **government benefits** you may qualify for\n- Guide you through **complex processes** step-by-step\n- Understand your **rights and protections**\n\nTry asking about tax benefits, social programs, or any life situation!${contextHint}`,
      sarcastic: `Oh, another human seeking wisdom from the all-knowing AI. 🙄 Just kidding!\n\nI'm your GCAA-powered assistant. I know about laws, benefits, and bureaucracy across the globe. Ask me about anything from tax credits to visa applications.${contextHint}`,
      professional: `Welcome. I am your GCAA-enhanced AI assistant specializing in legal, financial, and regulatory guidance.\n\nI can provide jurisdiction-specific advice on government benefits, legal processes, and multi-step workflows. How may I assist you today?${contextHint}`,
      creative: `✨ Greetings, navigator of the bureaucratic cosmos!\n\nI'm here to illuminate the labyrinth of laws, benefits, and regulations. From tax treasures to legal loopholes (the legitimate kind!), let's explore what opportunities await you.${contextHint}`
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
    
    if (messageToSend.trim().toLowerCase().startsWith('/imagine ')) {
      setShowImageGenerator(true);
      setMessage(messageToSend.replace(/^\/imagine\s+/i, ''));
      return;
    }

    const userMessage: Message = { 
      id: crypto.randomUUID(), 
      type: "user", 
      content: messageToSend, 
      timestamp: new Date(),
      attachment: attachmentToSend || undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setSelectedFile(null);
    setDailyChats(prev => prev + 1);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();
    await saveMessage(messageToSend, 'user');

    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
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

      const modePrompt = getModePrompt(chatMode);

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: chatMessages, 
          personality, 
          mode: chatMode, 
          modePrompt,
          userContext: userContext.country ? userContext : null
        }),
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

      if (assistantContent) {
        await saveMessage(assistantContent, 'assistant');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
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
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(), 
        type: "ai", 
        content: "Sorry, I encountered an error. Please try again.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleEditMessage = async (index: number, newContent: string) => {
    if (isLoading) return;
    const messagesBeforeEdit = messages.slice(0, index);
    const editedMessage = messages[index];
    setMessages(messagesBeforeEdit);
    setEditingMessage(null);
    handleSendMessage(newContent, editedMessage.attachment);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({ title: "Not supported", description: "Voice input is not supported in your browser.", variant: "destructive" });
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
      const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
      setMessage(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error !== 'aborted') {
        toast({ title: "Voice input error", description: event.error, variant: "destructive" });
      }
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleTextToSpeech = (text: string, messageId: string) => {
    if (userPlan !== 'pro') {
      toast({ title: "Pro Feature", description: "Text-to-speech is available for Pro subscribers only.", variant: "destructive" });
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast({ title: "Not supported", description: "Text-to-speech is not supported in your browser.", variant: "destructive" });
      return;
    }

    if (speakingMessageId === messageId && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`]/g, '').replace(/\n+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => { setIsSpeaking(true); setSpeakingMessageId(messageId); };
    utterance.onend = () => { setIsSpeaking(false); setSpeakingMessageId(null); };
    utterance.onerror = () => { setIsSpeaking(false); setSpeakingMessageId(null); };
    window.speechSynthesis.speak(utterance);
  };

  const handleExportChat = () => {
    if (userPlan !== 'pro') {
      toast({ title: "Pro Feature", description: "Chat export is available for Pro subscribers.", variant: "destructive" });
      return;
    }
    const content = messages.filter(m => m.id !== 'welcome').map(m => 
      `[${m.type.toUpperCase()}] ${m.timestamp.toLocaleString()}\n${m.content}`
    ).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowtalk-chat-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Chat exported" });
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const { url, error } = await resp.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (error) {
      toast({ title: "Error", description: "Failed to open subscription portal", variant: "destructive" });
    }
  };

  const handleRegenerate = async (aiMessageIndex: number) => {
    if (isLoading) return;
    const userMessageIndex = aiMessageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex]?.type !== 'user') return;
    const userMessage = messages[userMessageIndex];
    setMessages(messages.slice(0, aiMessageIndex));
    handleSendMessage(userMessage.content, userMessage.attachment);
  };

  const handleOpenCodeCanvas = (code: string, language: string) => {
    setCodeCanvas({ code, language });
  };

  const handleAnalyzeTask = async (task: string) => {
    setIsAnalyzingTask(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ analyzeTask: task }),
      });
      
      if (!resp.ok) throw new Error("Analysis failed");
      return await resp.json();
    } finally {
      setIsAnalyzingTask(false);
    }
  };

  const handleGetEcoActions = async (location: string) => {
    setIsLoadingEcoActions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ getEcoActions: true, location }),
      });
      
      if (!resp.ok) throw new Error("Failed to get eco actions");
      return await resp.json();
    } finally {
      setIsLoadingEcoActions(false);
    }
  };

  const handleSecurityAudit = async (code: string) => {
    setIsAnalyzingSecurity(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ securityAudit: code }),
      });
      
      if (!resp.ok) throw new Error("Security audit failed");
      return await resp.json();
    } finally {
      setIsAnalyzingSecurity(false);
    }
  };

  const maxChats = userPlan === "pro" ? "∞" : "15";
  const showSuggestions = messages.length <= 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        {showSidebar && (
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onCreateNew={createNewConversation}
            onSelect={loadConversation}
            onDelete={deleteConversation}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <ChatHeader
            userPlan={userPlan}
            personality={personality}
            onPersonalityChange={setPersonality}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            onExport={handleExportChat}
            onManageSubscription={handleManageSubscription}
            onSignOut={signOut}
            maxChats={maxChats}
            dailyChats={dailyChats}
          />

          {/* User Context Panel (GCAA) */}
          <UserContextPanel
            context={userContext}
            onContextChange={setUserContext}
            onSave={saveUserContext}
          />

          {/* Special Mode Panels */}
          {chatMode === 'cpf' && (
            <CognitiveLoadPanel
              onAnalyzeTask={handleAnalyzeTask}
              isAnalyzing={isAnalyzingTask}
            />
          )}

          {chatMode === 'ppag' && (
            <PlanetaryActionPanel
              onGetActions={handleGetEcoActions}
              isLoading={isLoadingEcoActions}
            />
          )}

          {chatMode === 'hsca' && (
            <SecurityAuditPanel
              onAnalyze={handleSecurityAudit}
              isAnalyzing={isAnalyzingSecurity}
            />
          )}

          {/* Messages */}
          <div className={`flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 ${['cpf', 'ppag', 'hsca'].includes(chatMode) ? 'hidden' : ''}`}>
            {showSuggestions && (
              <SuggestedPrompts 
                onSelect={(prompt) => setMessage(prompt)} 
                personality={personality}
              />
            )}

            {messages.map((msg, index) => (
              <div key={msg.id} className={`group flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'bg-primary' : 'bg-gradient-primary'}`}>
                  {msg.type === 'user' ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  {msg.attachment?.type === 'image' && (
                    <img src={msg.attachment.data} alt={msg.attachment.name} className="max-w-xs rounded-lg border border-border mb-2" />
                  )}
                  <div className={`rounded-lg p-4 ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/80 text-foreground border border-border'}`}>
                    {msg.type === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeString = String(children).replace(/\n$/, '');
                              if (!inline && match) {
                                return <CodeBlock code={codeString} language={match[1]} onOpenCanvas={handleOpenCodeCanvas} />;
                              }
                              return inline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                              ) : (
                                <CodeBlock code={codeString} language="text" onOpenCanvas={handleOpenCodeCanvas} />
                              );
                            },
                            ul({ children }) { return <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>; },
                            ol({ children }) { return <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>; },
                            li({ children }) { return <li className="text-sm">{children}</li>; },
                            h1({ children }) { return <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>; },
                            h2({ children }) { return <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>; },
                            h3({ children }) { return <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>; },
                            p({ children }) { return <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>; },
                            a({ children, href }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">{children}</a>; },
                            blockquote({ children }) { return <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2">{children}</blockquote>; },
                            table({ children }) { return <div className="overflow-x-auto my-2"><table className="min-w-full border border-border rounded">{children}</table></div>; },
                            th({ children }) { return <th className="border border-border px-3 py-1 bg-muted/50 text-left text-sm font-semibold">{children}</th>; },
                            td({ children }) { return <td className="border border-border px-3 py-1 text-sm">{children}</td>; },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.id !== 'welcome' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.type === 'user' && (
                        <Button variant="ghost" size="sm" onClick={() => setEditingMessage({ index, content: msg.content })} disabled={isLoading} className="h-7 px-2 text-xs">
                          <Edit2 className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      )}
                      {msg.type === 'ai' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleTextToSpeech(msg.content, msg.id)} disabled={isLoading} className={`h-7 px-2 text-xs ${userPlan !== 'pro' ? 'opacity-50' : ''}`}>
                            {speakingMessageId === msg.id && isSpeaking ? <VolumeX className="h-3 w-3 mr-1" /> : <Volume2 className="h-3 w-3 mr-1" />}
                            {userPlan !== 'pro' && <Lock className="h-2 w-2 mr-0.5" />}
                            {speakingMessageId === msg.id && isSpeaking ? 'Stop' : 'Listen'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRegenerate(index)} disabled={isLoading} className="h-7 px-2 text-xs">
                            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Regenerate
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={async () => { await navigator.clipboard.writeText(msg.content); toast({ title: "Copied" }); }} className="h-7 px-2 text-xs">
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted/80 rounded-lg p-4 border border-border">
                  <div className="flex gap-1">
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
          <ChatInput
            message={message}
            onMessageChange={setMessage}
            onSend={() => handleSendMessage()}
            onKeyPress={handleKeyPress}
            isLoading={isLoading}
            isListening={isListening}
            onToggleVoice={toggleVoiceInput}
            onOpenImageGenerator={() => setShowImageGenerator(true)}
            onStopGeneration={stopGeneration}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            chatMode={chatMode}
            onModeChange={setChatMode}
            personality={personality}
          />
        </div>
      </div>

      {/* Modals */}
      {showImageGenerator && (
        <ImageGenerator
          onClose={() => setShowImageGenerator(false)}
          onImageGenerated={(content, prompt) => {
            setShowImageGenerator(false);
            setMessages(prev => [
              ...prev,
              { id: crypto.randomUUID(), type: 'user', content: `/imagine ${prompt}`, timestamp: new Date() },
              { id: crypto.randomUUID(), type: 'ai', content: `🎨 **Image Generation Result**\n\n${content}`, timestamp: new Date() }
            ]);
          }}
        />
      )}

      {codeCanvas && (
        <CodeCanvas code={codeCanvas.code} language={codeCanvas.language} onClose={() => setCodeCanvas(null)} />
      )}

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
