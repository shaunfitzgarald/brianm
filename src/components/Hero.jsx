import React from "react";
import { useSiteContent } from "../contexts/SiteContentContext";

export function Hero() {
  const { content } = useSiteContent();
  const heroContent = content.hero;

  return (
    <section className="relative w-full min-h-screen bg-paper text-foreground overflow-hidden flex flex-col justify-center py-20 px-6 md:px-12 lg:px-24">
      
      {/* Background abstract shape to break symmetry */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-dust rounded-full blur-[120px] opacity-70 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-y-16 gap-x-8 items-center">
        
        {/* Left Column - The Image (Overlapping the center) */}
        <div className="md:col-span-6 lg:col-span-5 relative z-10">
          <div className="relative aspect-[3/4] w-full max-w-md mx-auto md:ml-0 md:-mt-12">
            {/* Image Placeholder */}
            <div className="absolute inset-0 bg-stone-300 rounded-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="w-full h-full bg-stone flex items-center justify-center text-paper font-serif italic text-lg opacity-80 whitespace-pre-line text-center">
                {heroContent.imageText}
              </div>
            </div>
            
            {/* Decorative overlapping element */}
            <div className="absolute -bottom-8 -right-8 w-1/2 h-1/2 bg-olive opacity-20 blur-2xl z-[-1]" />
          </div>
        </div>

        {/* Right Column - The Manifesto (Offset text) */}
        <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-center space-y-12 md:pl-8 lg:pl-16 z-20">
          <div className="space-y-6">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-primary">
              <span className="block opacity-90">{heroContent.heading1}</span>
              <span className="block italic mt-2 ml-4 whitespace-pre-line">{heroContent.heading2}</span>
            </h1>
          </div>

          <div className="font-sans text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg space-y-4">
            <p className="ml-0 md:ml-12 border-l border-stone-300 pl-6 whitespace-pre-line">
              {heroContent.paragraph1}
            </p>
          </div>

          <div className="font-sans text-base md:text-lg max-w-xl space-y-6 ml-0 md:ml-24">
            <p className="text-secondary-foreground font-medium whitespace-pre-line">
              {heroContent.paragraph2}
            </p>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {heroContent.paragraph3}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
