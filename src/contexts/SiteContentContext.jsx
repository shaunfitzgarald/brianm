import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const SiteContentContext = createContext();

export function useSiteContent() {
  return useContext(SiteContentContext);
}

const defaultContent = {
  hero: {
    heading1: "We believe homes",
    heading2: "should feel inhabited.",
    imageText: "Lived-in Beauty",
    paragraph1: "That asymmetry can be beautiful.\nThat wear tells a story.\nThat character matters more than polish.",
    paragraph2: "We believe design should support life — not compete with it.",
    paragraph3: "Crooked Credenza is about working with what exists, honoring flaws, and creating spaces that feel personal, collected, and quietly confident."
  },
  about: {
    heading: "I'm Brian, founder\nand lead designer.",
    textPart1: "I believe the most compelling spaces aren't perfect — ",
    textPart2: "they're personal.",
    imageUrl: "/brian.jpg"
  },
  philosophy: {
    section1Heading: "Materials that\nage well,",
    section1Text: "We look for organic textures, honest stone, and fabrics that gather stories over time.",
    section1Image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000",
    section2Heading: "...and designs that\ndon't try too hard.",
    section2Text: "A room should look like it evolved organically, not installed in a single afternoon.",
    section2Image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1000",
    welcomeHeading: "Welcome to\nCrooked Credenza.",
    welcomeImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000"
  },
  settings: {
    chatbotEnabled: true
  }
};

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We will listen to a single document 'content' in 'siteSettings' collection
    const unsubs = [];
    
    const fetchAndListen = async () => {
      try {
        const sections = ['hero', 'about', 'philosophy', 'settings'];
        
        sections.forEach(section => {
          const docRef = doc(db, "siteContent", section);
          
          // Seed initial data if it doesn't exist (development convenience)
          getDoc(docRef).then(snap => {
            if (!snap.exists()) {
              setDoc(docRef, defaultContent[section]);
            }
          });

          // Listen for real-time updates
          const unsub = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setContent(prev => ({
                ...prev,
                [section]: docSnap.data()
              }));
            }
          });
          unsubs.push(unsub);
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading site content:", err);
        setLoading(false);
      }
    };

    fetchAndListen();

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading }}>
      {children}
    </SiteContentContext.Provider>
  );
}
