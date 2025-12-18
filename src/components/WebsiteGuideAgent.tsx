import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare } from 'lucide-react';

const WebsiteGuideAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ user: string; bot: string }[]>([]);

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

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const botResponse = faqs.find(faq => message.toLowerCase().includes(faq.q.toLowerCase()))?.a || "I'm sorry, I don't have an answer for that. Please try rephrasing your question or contact support for more information.";

    setChatHistory([...chatHistory, { user: message, bot: botResponse }]);
    setMessage('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Website Guide</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((chat, index) => (
              <div key={index}>
                <div className="flex justify-end">
                  <p className="bg-primary text-primary-foreground p-2 rounded-lg max-w-xs">{chat.user}</p>
                </div>
                <div className="flex justify-start">
                  <p className="bg-muted p-2 rounded-lg max-w-xs">{chat.bot}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question..."
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WebsiteGuideAgent;