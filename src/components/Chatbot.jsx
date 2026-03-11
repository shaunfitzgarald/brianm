import React, { useState, useEffect, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "I am here. How can I help you curate your space?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const threadId = useRef(Math.random().toString(36).substring(2, 15));

  // Typewriter effect state for the last assistant message
  const [displayedText, setDisplayedText] = useState("");
  
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (lastMessage?.role === "assistant") {
      let i = 0;
      setDisplayedText("");
      const interval = setInterval(() => {
        setDisplayedText(lastMessage.content.slice(0, i + 1));
        i++;
        if (i >= lastMessage.content.length) clearInterval(interval);
      }, 30); // Typewriter speed
      return () => clearInterval(interval);
    }
  }, [lastMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Call the Genkit Firebase Function
      const chatWithCrooked = httpsCallable(functions, 'chatWithCrooked');
      
      // Gemini requires the history to start with a "user" message, so we omit the initial greeting
      const historyToSend = newMessages[0].role === "assistant" ? newMessages.slice(1) : newMessages;

      // Genkit expects the role "model" instead of "assistant"
      const genkitMessages = historyToSend.map(m => ({
        role: m.role === "assistant" ? "model" : m.role,
        content: [{ text: m.content }]
      }));

      const result = await chatWithCrooked({ 
        messages: genkitMessages,
        threadId: threadId.current 
      });
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.data.text }
      ]);
    } catch (error) {
      console.error("AI Consultation Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I am currently taking a moment. Please reach out again soon." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-paper/90 backdrop-blur-md border border-stone-300 p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-stone-300 pb-2">
            <span className="font-serif italic text-sm text-primary">Crooked AI</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors font-sans text-xs uppercase tracking-widest"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 mb-6 max-h-[40vh] scrollbar-hide">
            {messages.map((msg, idx) => {
              const isLastAssistant = idx === messages.length - 1 && msg.role === "assistant";
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    {msg.role === "user" ? "You" : "Guide"}
                  </span>
                  <p className={`font-serif text-sm leading-relaxed ${msg.role === "user" ? "text-primary text-right" : "text-foreground"}`}>
                    {isLastAssistant ? displayedText : msg.content}
                    {isLastAssistant && displayedText.length < msg.content.length && (
                      <span className="inline-block w-1.5 h-3 bg-stone-400 ml-1 animate-pulse" />
                    )}
                  </p>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex flex-col items-start">
                <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Guide</span>
                <span className="inline-block w-1.5 h-3 bg-stone-400 animate-pulse mt-1" />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="relative mt-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your inquiry..."
              className="w-full bg-transparent border-b border-stone-300 pb-2 text-sm font-sans focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50 rounded-none"
            />
          </form>
        </div>
      )}

      {/* Floating Action Button - Text Only / Minimalist */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="font-sans text-xs uppercase tracking-widest text-primary hover:text-foreground transition-all duration-300 flex items-center space-x-2 bg-paper/80 backdrop-blur-sm py-2 px-4 rounded-full border border-stone-200 shadow-sm"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
          <span>Consult</span>
        </button>
      )}
    </div>
  );
}
