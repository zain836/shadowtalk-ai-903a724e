import { useState } from "react";
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [onlineUsers] = useState(Math.floor(Math.random() * 1000) + 47000);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Welcome to ShadowTalk AI! I'm here to help you. You can ask me about our features, pricing, or anything else you need to know.",
      timestamp: new Date()
    }
  ]);

  const faqs = [
    {
      q: 'What is ShadowTalk AI?',
      a: 'ShadowTalk AI is an advanced AI chatbot with multimodal capabilities, including voice input and image generation. It\'s designed for creators, coders, and CEOs to enhance their productivity and creativity.'
    },
    {
      q: 'What are the subscription plans?',
      a: 'We offer a free plan with limited features, a Pro plan with more features and higher limits, and an Elite plan with access to our REST API and all features.'
    },
    {
      q: 'How does offline mode work?',
      a: 'Elite plan users can access offline mode, which caches your recent conversations and provides limited AI responses using on-device processing. Full functionality requires an internet connection. Install the PWA for the best offline experience.'
    },
    {
        q: "How do collaborative rooms work?",
        a: "Collaborative rooms allow multiple users to interact with the AI together in real-time. Create a room, share the invite link, and all participants can send messages and see AI responses instantly. Room creators have moderation tools to manage participants."
    },
    {
        q: "What's included in each subscription tier?",
        a: "Our pricing page has a detailed breakdown of each plan. Generally, higher tiers offer more daily chats, access to advanced features like image generation and API access, and priority support."
    }
  ];

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date()
    };

    const botResponseContent = faqs.find(faq => message.toLowerCase().includes(faq.q.toLowerCase()))?.a || "I'm sorry, I don't have an answer for that. Please try rephrasing your question or contact support for more information.";

    const botResponse = {
      id: messages.length + 2,
      type: "bot",
      content: botResponseContent,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage, botResponse]);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="btn-glow rounded-full w-16 h-16 shadow-glow"
        >
          <MessageCircle className="h-7 w-7" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full pulse-dot"></div>
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isMinimized
        ? 'bottom-6 right-6 w-80'
        : 'bottom-6 right-6 w-96 h-[600px] sm:w-[450px] sm:h-[700px]'
    }`}>
      <Card className="h-full bg-card/95 backdrop-blur-lg border-border shadow-glow">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="h-6 w-6 text-primary" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full pulse-dot"></div>
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant <span className="text-success">●</span></h3>
              <p className="text-xs text-muted-foreground counter-glow">{onlineUsers.toLocaleString()} users online • Real-time responses</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar h-[calc(100%-140px)]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === 'user' ? 'bg-primary' : 'bg-secondary'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-secondary-foreground" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm" className="btn-glow">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatWidget;
