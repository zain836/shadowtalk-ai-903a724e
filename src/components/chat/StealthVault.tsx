import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Trash2, Plus, X, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VaultEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  encrypted: boolean;
}

interface StealthVaultProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple encryption/decryption for demonstration (in production, use proper crypto)
const encrypt = (text: string, key: string): string => {
  const encoded = btoa(unescape(encodeURIComponent(text)));
  return encoded.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
};

const decrypt = (text: string, key: string): string => {
  const decrypted = text.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
  return decodeURIComponent(escape(atob(decrypted)));
};

export const StealthVault: React.FC<StealthVaultProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [vaultKey, setVaultKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showContent, setShowContent] = useState<Record<string, boolean>>({});
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [stealthModeActive, setStealthModeActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('shadowtalk_vault_entries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed.map((e: any) => ({ ...e, createdAt: new Date(e.createdAt) })));
      } catch (e) {
        console.error('Failed to parse vault entries');
      }
    }
  }, []);

  const saveEntries = (newEntries: VaultEntry[]) => {
    localStorage.setItem('shadowtalk_vault_entries', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleUnlock = () => {
    if (vaultKey.length < 4) {
      toast({ title: "Key too short", description: "Vault key must be at least 4 characters", variant: "destructive" });
      return;
    }
    setIsUnlocked(true);
    toast({ title: "Vault Unlocked", description: "Your encrypted vault is now accessible" });
  };

  const handleAddEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast({ title: "Missing fields", description: "Title and content are required", variant: "destructive" });
      return;
    }

    const encryptedContent = encrypt(newEntry.content, vaultKey);
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      title: newEntry.title,
      content: encryptedContent,
      createdAt: new Date(),
      encrypted: true,
    };

    saveEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '' });
    setShowAddForm(false);
    toast({ title: "Entry saved", description: "Your data has been encrypted and stored" });
  };

  const handleDeleteEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
    toast({ title: "Entry deleted" });
  };

  const toggleShowContent = (id: string) => {
    setShowContent(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDecryptedContent = (entry: VaultEntry): string => {
    try {
      return decrypt(entry.content, vaultKey);
    } catch {
      return "Failed to decrypt - wrong key?";
    }
  };

  const toggleStealthMode = () => {
    setStealthModeActive(!stealthModeActive);
    if (!stealthModeActive) {
      document.body.classList.add('stealth-mode');
      toast({ 
        title: "Stealth Mode Activated", 
        description: "Chat UI disguised. Sensitive content hidden." 
      });
    } else {
      document.body.classList.remove('stealth-mode');
      toast({ title: "Stealth Mode Deactivated" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Stealth Mode & Encrypted Vault
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-1">
          {/* Stealth Mode Toggle */}
          <div className="bg-gradient-to-r from-muted to-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <EyeOff className="h-4 w-4" />
                  Stealth Mode
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Disguise the chat interface to look like a productivity app
                </p>
              </div>
              <Button
                variant={stealthModeActive ? "destructive" : "default"}
                onClick={toggleStealthMode}
              >
                {stealthModeActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>

          {/* Vault Section */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4" />
              Encrypted Vault
            </h3>

            {!isUnlocked ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter your vault key to access encrypted conversations and notes.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter vault key..."
                    value={vaultKey}
                    onChange={(e) => setVaultKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  />
                  <Button onClick={handleUnlock}>
                    <Key className="h-4 w-4 mr-2" />
                    Unlock
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Remember this key! It cannot be recovered if lost.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-500 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Vault Unlocked
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Entry
                  </Button>
                </div>

                {showAddForm && (
                  <div className="bg-background rounded-lg p-4 border border-border space-y-3">
                    <Input
                      placeholder="Entry title..."
                      value={newEntry.title}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Sensitive content to encrypt..."
                      value={newEntry.content}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddEntry} className="flex-1">
                        <Shield className="h-4 w-4 mr-2" />
                        Encrypt & Save
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No encrypted entries yet. Add one to get started.
                    </p>
                  ) : (
                    entries.map((entry) => (
                      <div key={entry.id} className="bg-background rounded-lg p-3 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{entry.title}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleShowContent(entry.id)}
                            >
                              {showContent[entry.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {showContent[entry.id] && (
                          <p className="text-sm bg-muted/50 rounded p-2 font-mono">
                            {getDecryptedContent(entry)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {entry.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
