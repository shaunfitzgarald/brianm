import React from "react";
import { useSiteContent } from "../contexts/SiteContentContext";

export function About() {
  const { content } = useSiteContent();
  const aboutContent = content.about;

  return (
    <section className="relative w-full bg-dust text-foreground py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
        
        {/* Left Image - Portrait */}
        <div className="md:col-span-5 relative">
          <div className="aspect-[4/5] bg-stone-300 w-full rounded-sm overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative">
            <img 
              src={aboutContent.imageUrl}
              alt="Brian - Founder and Lead Designer"
              className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80"
            />
            <div className="absolute inset-0 bg-stone mix-blend-color opacity-20" />
          </div>
        </div>

        {/* Right Text */}
        <div className="md:col-span-7 space-y-8 flex flex-col justify-center">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-primary whitespace-pre-line">
            {aboutContent.heading}
          </h2>
          <p className="font-sans text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
            {aboutContent.textPart1} <span className="text-secondary-foreground italic">{aboutContent.textPart2}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
