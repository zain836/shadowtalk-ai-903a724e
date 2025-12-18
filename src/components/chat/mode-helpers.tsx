import React from "react";
import { Code, Languages, FileText, Bug, Lightbulb, MessageSquare, Pen, Music, Brain, Leaf, Shield, HeartPulse } from "lucide-react";

export type ChatMode =
  | "general"
  | "code"
  | "translate"
  | "summarize"
  | "debug"
  | "brainstorm"
  | "explain"
  | "creative"
  | "music"
  | "cpf"
  | "ppag"
  | "hsca";

export const modes: { value: ChatMode; label: string; icon: React.ReactNode; prompt: string; color: string }[] = [
  {
    value: "general",
    label: "General Chat",
    icon: <MessageSquare className="h-4 w-4" />,
    prompt: "",
    color: "text-foreground"
  },
  {
    value: "code",
    label: "Write Code",
    icon: <Code className="h-4 w-4" />,
    prompt: "You are in code writing mode. Write clean, well-commented, production-ready code. Always include explanations and best practices.",
    color: "text-blue-500"
  },
  {
    value: "translate",
    label: "Translate",
    icon: <Languages className="h-4 w-4" />,
    prompt: "You are in translation mode. Translate text accurately while preserving meaning and tone. Auto-detect the source language if not specified.",
    color: "text-cyan-500"
  },
  {
    value: "summarize",
    label: "Summarize",
    icon: <FileText className="h-4 w-4" />,
    prompt: "You are in summarization mode. Provide concise, clear summaries that capture the key points and main ideas.",
    color: "text-green-500"
  },
  {
    value: "debug",
    label: "Debug Code",
    icon: <Bug className="h-4 w-4" />,
    prompt: "You are in debugging mode. Analyze code for bugs, suggest fixes, and explain the issues clearly. Provide corrected code.",
    color: "text-red-500"
  },
  {
    value: "brainstorm",
    label: "Brainstorm",
    icon: <Lightbulb className="h-4 w-4" />,
    prompt: "You are in brainstorming mode. Generate creative ideas, explore possibilities, and think outside the box.",
    color: "text-yellow-500"
  },
  {
    value: "explain",
    label: "Explain",
    icon: <MessageSquare className="h-4 w-4" />,
    prompt: "You are in explanation mode. Explain concepts clearly and simply, using analogies and examples when helpful.",
    color: "text-pink-500"
  },
  {
    value: "creative",
    label: "Creative Writing",
    icon: <Pen className="h-4 w-4" />,
    prompt: "You are in creative writing mode. Write engaging, imaginative content with vivid language and compelling narratives.",
    color: "text-orange-500"
  },
  {
    value: "music",
    label: "Recommend Music",
    icon: <Music className="h-4 w-4" />,
    prompt: "You are in music recommendation mode. Suggest songs, artists, and playlists based on user preferences. Include YouTube or Spotify links when possible.",
    color: "text-rose-500"
  },
  {
    value: "cpf",
    label: "🌊 Cognitive Filter",
    icon: <Brain className="h-4 w-4" />,
    prompt: "You are in Cognitive Pollution Filter (CPF) mode. Help users manage digital overload by analyzing tasks, prioritizing them by cognitive load, and summarizing complex information into actionable items.",
    color: "text-cyan-400"
  },
  {
    value: "ppag",
    label: "🌍 Eco Actions",
    icon: <Leaf className="h-4 w-4" />,
    prompt: "You are in Planetary Action Guide (PPAG) mode. Provide hyper-personalized, location-specific environmental actions with high impact. Calculate environmental return on investment for each action.",
    color: "text-emerald-500"
  },
  {
    value: "hsca",
    label: "🔒 Security Audit",
    icon: <Shield className="h-4 w-4" />,
    prompt: "You are the Hyper-Security Contextual Auditor (HSCA). Analyze code for security vulnerabilities, trace data flows across stacks, generate proof-of-concept exploits, and provide secure code remediation.",
    color: "text-red-500"
  }
];

export const getModePrompt = (mode: ChatMode): string => {
  return modes.find(m => m.value === mode)?.prompt || "";
};
