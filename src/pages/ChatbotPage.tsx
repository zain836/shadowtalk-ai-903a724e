import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, User, Send, ArrowLeft, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ChatbotPage = () => {
  const navigate = useNavigate();
  const { user, userPlan, signOut } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, type: "ai", content: "🔥 Welcome to ShadowTalk AI! I'm powered by advanced AI and ready to help you with anything. What would you like to explore today?", timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyChats, setDailyChats] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    const newMessage = { id: messages.length + 1, type: "user", content: message, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    setDailyChats(prev => prev + 1);
    setIsLoading(true);

    setTimeout(() => {
      const responses = [
        "🔥 Great question! I can help you with that. Let me provide a comprehensive answer...",
        "⚡ Excellent! I'm analyzing your request and preparing the best solution for you.",
        "🚀 I love this kind of challenge! Here's my approach to solve this effectively...",
        "💡 That's a fascinating topic! Let me share some insights and best practices...",
      ];
      setMessages(prev => [...prev, { id: prev.length + 1, type: "ai", content: responses[Math.floor(Math.random() * responses.length)], timestamp: new Date() }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">ShadowTalk AI</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-card border-border">{userPlan} • {dailyChats}/15 chats</Badge>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-glow h-[calc(100vh-150px)]">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">ShadowTalk AI <span className="text-success">●</span></h3>
                <p className="text-xs text-muted-foreground">Powered by Advanced AI</p>
              </div>
            </div>
          </CardHeader>

          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 h-[calc(100%-180px)]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start space-x-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.type === 'user' ? 'bg-primary' : 'bg-gradient-primary'}`}>
                  {msg.type === 'user' ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                </div>
                <div className={`max-w-[80%] rounded-lg p-4 ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/80 text-foreground border border-border'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
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

          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Message ShadowTalk AI..." className="flex-1" />
              <Button onClick={handleSendMessage} className="btn-glow"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;
