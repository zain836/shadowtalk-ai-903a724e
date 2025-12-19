import { useState } from 'react';
import { Check, Clipboard, ExternalLink } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  code: string;
  onOpenCanvas: (code: string, language: string) => void;
}

export const CodeBlock = ({ language, code, onOpenCanvas }: CodeBlockProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative text-sm bg-[#2d2d2d] rounded-lg my-4 overflow-hidden border border-border/50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-1.5 bg-card/50">
            <span className="text-muted-foreground font-sans text-xs capitalize tracking-wide">{language}</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onOpenCanvas(code, language)} 
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink size={12} />
                Open in Canvas
              </button>
              <button 
                onClick={handleCopy} 
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                  {isCopied ? <Check size={14} /> : <Clipboard size={14} />}
                  {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
        </div>
      <SyntaxHighlighter 
        language={language} 
        style={vscDarkPlus} 
        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem' }}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
