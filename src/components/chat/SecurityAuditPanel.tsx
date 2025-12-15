import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Shield, 
  AlertTriangle,
  Bug,
  Code,
  FileCode,
  Loader2,
  Copy,
  CheckCircle2,
  XCircle,
  Zap,
  Lock,
  Unlock,
  Eye,
  FileWarning,
  Terminal,
  RefreshCw,
  Upload,
  FolderUp,
  File,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  location: string;
  chain?: string[];
  exploit?: string;
  remediation: string;
  codefix?: string;
  category: string;
}

interface SecurityAuditPanelProps {
  onAnalyze: (code: string) => Promise<{
    vulnerabilities: Vulnerability[];
    summary: string;
    riskScore: number;
  }>;
  isAnalyzing: boolean;
}

const SecurityAuditPanel: React.FC<SecurityAuditPanelProps> = ({
  onAnalyze,
  isAnalyzing
}) => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string; content: string; size: number}[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [summary, setSummary] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleAcceptDisclaimer = () => {
    setHasAccepted(true);
    setShowDisclaimer(false);
  };

  const handleFileUpload = async (files: FileList) => {
    const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php', '.sql', '.html', '.css', '.json', '.yaml', '.yml', '.xml', '.sh', '.bash', '.c', '.cpp', '.h', '.cs', '.rs', '.swift', '.kt', '.vue', '.svelte'];
    const newFiles: {name: string; content: string; size: number}[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(ext)) {
        toast.warning(`Skipped ${file.name}: unsupported file type`);
        continue;
      }

      if (file.size > 500000) {
        toast.warning(`Skipped ${file.name}: file too large (max 500KB)`);
        continue;
      }

      try {
        const content = await file.text();
        newFiles.push({ name: file.name, content, size: file.size });
      } catch (error) {
        toast.error(`Failed to read ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} file(s) for analysis`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    const combinedCode = uploadedFiles.length > 0 
      ? uploadedFiles.map(f => `// === File: ${f.name} ===\n${f.content}`).join('\n\n')
      : codeInput;

    if (!combinedCode.trim()) {
      toast.error('Please paste code or upload files to analyze');
      return;
    }

    try {
      const result = await onAnalyze(combinedCode);
      setVulnerabilities(result.vulnerabilities);
      setSummary(result.summary);
      setRiskScore(result.riskScore);
      
      if (result.vulnerabilities.length > 0) {
        setSelectedVuln(result.vulnerabilities[0]);
      }
    } catch (error) {
      toast.error('Failed to analyze code');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <FileWarning className="h-4 w-4" />;
      case 'low': return <Bug className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-blue-500';
    return 'text-green-500';
  };

  const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;

  return (
    <>
      {/* Disclaimer Dialog */}
      <AlertDialog open={showDisclaimer && !hasAccepted} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Security Audit Disclaimer
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p className="font-semibold text-foreground">
                ⚠️ IMPORTANT: Read Before Proceeding
              </p>
              <p>
                The Hyper-Security Contextual Auditor (HSCA) is designed for <strong>authorized security testing only</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Only analyze code you own or have explicit permission to test</li>
                <li>Never use generated exploits against systems without authorization</li>
                <li>This tool is for educational and defensive purposes only</li>
                <li>Misuse may violate computer fraud and abuse laws</li>
              </ul>
              <p className="text-sm text-destructive font-medium">
                By proceeding, you acknowledge that you have legal authorization to perform security testing on the code you submit, and that you bear full responsibility for any actions taken with this tool.
              </p>
              <p className="text-xs text-muted-foreground">
                We are not responsible for any illegal or unauthorized use of this feature.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Decline & Exit</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptDisclaimer} className="bg-destructive hover:bg-destructive/90">
              I Accept & Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4 p-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-destructive/10 to-primary/10 border-destructive/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">HSCA Security Auditor</h2>
                  <p className="text-xs text-muted-foreground">
                    Hyper-Security Contextual Auditor • Cross-Stack Vulnerability Analysis
                  </p>
                </div>
              </div>
              {vulnerabilities.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className={`text-2xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}/100</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vulnerability Summary */}
        {vulnerabilities.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="py-2 text-center">
                <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/10 border-orange-500/30">
              <CardContent className="py-2 text-center">
                <p className="text-2xl font-bold text-orange-500">{highCount}</p>
                <p className="text-xs text-muted-foreground">High</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="py-2 text-center">
                <p className="text-2xl font-bold text-yellow-500">{mediumCount}</p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="py-2 text-center">
                <p className="text-2xl font-bold text-blue-500">{lowCount}</p>
                <p className="text-xs text-muted-foreground">Low</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* File Upload & Code Input */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Upload Codebase or Paste Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Drag and Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.rb,.php,.sql,.html,.css,.json,.yaml,.yml,.xml,.sh,.c,.cpp,.h,.cs,.rs,.swift,.kt,.vue,.svelte"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <FolderUp className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JS, TS, Python, Java, Go, SQL, and more
                  </p>
                </div>
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Uploaded Files ({uploadedFiles.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <File className="h-3 w-3" />
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)}KB)
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Or Separator */}
            {uploadedFiles.length === 0 && (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Textarea
                  placeholder="Paste your code here... (supports JavaScript, TypeScript, Python, SQL, and more)"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
              </>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || (!codeInput.trim() && uploadedFiles.length === 0)}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s)` : 'code'}...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Security Audit
                  </>
                )}
              </Button>
              {(vulnerabilities.length > 0 || uploadedFiles.length > 0) && (
                <Button variant="outline" onClick={() => {
                  setVulnerabilities([]);
                  setSummary('');
                  setRiskScore(0);
                  setSelectedVuln(null);
                  setUploadedFiles([]);
                  setCodeInput('');
                }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {vulnerabilities.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Vulnerability List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Vulnerabilities Found ({vulnerabilities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {vulnerabilities.map(vuln => (
                      <div
                        key={vuln.id}
                        onClick={() => setSelectedVuln(vuln)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedVuln?.id === vuln.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Badge className={`${getSeverityColor(vuln.severity)} shrink-0`}>
                            {getSeverityIcon(vuln.severity)}
                            <span className="ml-1 uppercase text-xs">{vuln.severity}</span>
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{vuln.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{vuln.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Vulnerability Details */}
            {selectedVuln && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bug className="h-4 w-4" />
                      Vulnerability Details
                    </CardTitle>
                    <Badge className={getSeverityColor(selectedVuln.severity)}>
                      {selectedVuln.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-8">
                      <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                      <TabsTrigger value="exploit" className="text-xs">Exploit</TabsTrigger>
                      <TabsTrigger value="fix" className="text-xs">Fix</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-3">
                      <ScrollArea className="h-[220px]">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">{selectedVuln.title}</h4>
                            <Badge variant="outline" className="mt-1 text-xs">{selectedVuln.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{selectedVuln.description}</p>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Location:</p>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{selectedVuln.location}</code>
                          </div>
                          {selectedVuln.chain && selectedVuln.chain.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Attack Chain:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedVuln.chain.map((step, i) => (
                                  <React.Fragment key={i}>
                                    <Badge variant="secondary" className="text-xs">{step}</Badge>
                                    {i < selectedVuln.chain!.length - 1 && <span className="text-muted-foreground">→</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="exploit" className="mt-3">
                      <ScrollArea className="h-[220px]">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-destructive flex items-center gap-1">
                              <Terminal className="h-3 w-3" />
                              Proof of Concept
                            </p>
                            {selectedVuln.exploit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => copyToClipboard(selectedVuln.exploit!, `exploit-${selectedVuln.id}`)}
                              >
                                {copiedId === `exploit-${selectedVuln.id}` ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto font-mono">
                            {selectedVuln.exploit || 'No exploit generated for this vulnerability type.'}
                          </pre>
                          <p className="text-xs text-muted-foreground italic">
                            ⚠️ Use only for authorized testing purposes
                          </p>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="fix" className="mt-3">
                      <ScrollArea className="h-[220px]">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-success flex items-center gap-1 mb-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Remediation
                            </p>
                            <p className="text-sm text-muted-foreground">{selectedVuln.remediation}</p>
                          </div>
                          {selectedVuln.codefix && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium flex items-center gap-1">
                                  <Code className="h-3 w-3" />
                                  Secure Code
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => copyToClipboard(selectedVuln.codefix!, `fix-${selectedVuln.id}`)}
                                >
                                  {copiedId === `fix-${selectedVuln.id}` ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              <pre className="text-xs bg-success/10 border border-success/30 p-3 rounded overflow-x-auto font-mono">
                                {selectedVuln.codefix}
                              </pre>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <Card className="bg-muted/30">
            <CardContent className="py-3">
              <p className="text-sm text-muted-foreground">{summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {vulnerabilities.length === 0 && !isAnalyzing && (
          <Card className="bg-card/30">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Ready to Analyze</p>
              <p className="text-sm">Paste your code above to begin security analysis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default SecurityAuditPanel;
