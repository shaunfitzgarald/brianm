import React from "react";
import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { Philosophy } from "../components/Philosophy";
import { Contact } from "../components/Contact";
import { Chatbot } from "../components/Chatbot";
import { useSiteContent } from "../contexts/SiteContentContext";

export function Home() {
  const { loading } = useSiteContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse font-serif italic text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Hero />
      <About />
      <Philosophy />
      <Contact />
      <Chatbot />
    </div>
  );
}
