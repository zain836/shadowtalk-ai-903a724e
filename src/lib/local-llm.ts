'''// This is a mock local LLM for offline use.
// In a real application, this would be replaced with a proper local LLM library
// like transformers.js, web-llm, or another model running in-browser.

const localModelResponses: Record<string, string> = {
  "what is the capital of france?": "As a local LLM, I can tell you that the capital of France is Paris.",
  "who wrote romeo and juliet?": "That would be William Shakespeare. I know that one!",
  "explain quantum computing": "Quantum computing is a complex topic. In offline mode, I can give you a very basic explanation: it's a type of computing that uses the principles of quantum mechanics to perform calculations. For a more detailed explanation, please connect to the internet.",
};

const genericResponse = "I'm a lightweight local model running in your browser. My knowledge is limited in offline mode, but I will do my best to answer your question. For more complex queries, please reconnect to the internet to use the full power of Gemini.";

const generate = async (prompt: string): Promise<string> => {
  const normalizedPrompt = prompt.trim().toLowerCase();
  
  for (const key in localModelResponses) {
    if (normalizedPrompt.includes(key)) {
      return localModelResponses[key];
    }
  }

  // Find a keyword to give a more specific generic response
  if (normalizedPrompt.includes('code') || normalizedPrompt.includes('javascript')) {
    return "I can't generate or analyze code in offline mode. Please reconnect to use the advanced coding features with Gemini."
  }

  return genericResponse;
};

export const generateLocalResponse = async (prompt: string): Promise<string> => {
  // Simulate model loading and processing time
  return new Promise(resolve => {
    setTimeout(() => {
      generate(prompt).then(resolve);
    }, 1500); // 1.5 second delay
  });
};
''