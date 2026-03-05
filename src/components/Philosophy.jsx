import React from "react";
import { useSiteContent } from "../contexts/SiteContentContext";

export function Philosophy() {
  const { content } = useSiteContent();
  const phil = content.philosophy;

  return (
    <section className="relative w-full bg-paper text-foreground py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* Section 1: Materials that wear well */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight whitespace-pre-line">
              {phil.section1Heading}
            </h2>
            <p className="font-sans text-lg text-muted-foreground whitespace-pre-line">
              {phil.section1Text}
            </p>
          </div>
          <div className="order-1 md:order-2 aspect-[4/3] relative">
            <img 
              src={phil.section1Image} 
              alt="Materials and interior" 
              className="w-full h-full object-cover rounded-sm shadow-sm"
            />
          </div>
        </div>

        {/* Section 2: Don't try too hard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] relative">
            <img 
              src={phil.section2Image} 
              alt="Relaxed living room" 
              className="w-full h-full object-cover rounded-sm shadow-sm"
            />
          </div>
          <div className="space-y-6 md:pl-12">
            <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight whitespace-pre-line">
              {phil.section2Heading}
            </h2>
            <p className="font-sans text-lg text-muted-foreground whitespace-pre-line">
              {phil.section2Text}
            </p>
          </div>
        </div>

        {/* Section 3: Welcome */}
        <div className="text-center space-y-12">
          <h2 className="font-serif text-5xl md:text-7xl text-primary leading-tight whitespace-pre-line">
            {phil.welcomeHeading}
          </h2>
          <div className="aspect-[21/9] w-full relative">
             <img 
              src={phil.welcomeImage} 
              alt="Dining and living area" 
              className="w-full h-full object-cover rounded-sm shadow-sm"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
