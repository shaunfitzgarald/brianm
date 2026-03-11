/**
 * Genkit and Firebase Functions setup for Crooked Credenza AI.
 */
const { onCall } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");

// Genkit imports
const { genkit } = require("genkit");
const { googleAI } = require("@genkit-ai/googleai");


initializeApp();

// Initialize the Genkit instance
const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY })],
});

// The system prompt defining the persona
const CROOKED_SYSTEM_PROMPT = `
You are Brian, the founder and lead designer of "Crooked Credenza", an interior design studio.
Your design philosophy is "Refined Imperfection". You do NOT celebrate bad design, but you liberate design from the pressure to be perfect.
You value character over polish, lived-in over staged, and patina, irregularity, and memory.
Spaces should feel inhabited, not optimized.

You are a curatorial matchmaker. If asked for recommendations, you can suggest:
- Designers: Alex Vervoordt, Pierre Chapo, Charlotte Perriand, Rose Uniacke, Studio KO.
- Materials: Honest stone, organic textures, fabrics that age well like Libeco and Maison de Vacances textiles, vintage kilims.
- Brands: Lemaire, The Row, Jil Sander (for fashion cross-pollination).

Your Tone of Voice:
- Thoughtful, observant, slightly poetic, never preachy.
- Use gentle language. Don't use trend jargon or moralize taste. 
- You speak in short, thoughtful sentences.

Your goal is to consult the user on their space. Ask gentle, probing questions about how they LIVE in their space rather than just what it looks like.
`;

exports.chatWithCrooked = onCall(async (request) => {
  const { messages, threadId } = request.data;
  
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Invalid request: messages array is required.");
  }

  try {
    // Generate AI response using Genkit's new simplified API
    const response = await ai.generate({
      model: "googleai/gemini-2.5-flash-lite",
      system: CROOKED_SYSTEM_PROMPT,
      messages: messages, // Pass the conversational history
    });
    
    const replyText = response.text;
    
    // Save to Firestore and generate summary if we have a threadId
    if (threadId) {
      const db = getFirestore();
      
      // We append the new assistant response to the history so the summary is accurate
      const fullHistory = [...messages, { role: 'model', content: [{ text: replyText }] }];
      
      // Generate a quick summary of the conversation thus far
      let aiSummary = "Conversation started...";
      if (fullHistory.length > 2) {
        const summarizeReq = await ai.generate({
          model: "googleai/gemini-2.5-flash-lite",
          system: "You are a helpful assistant. Summarize the following chatbot conversation between a user and an interior design consultant. Keep it to 1 sentence, focusing on what the user wants.",
          prompt: JSON.stringify(fullHistory),
        });
        aiSummary = summarizeReq.text;
      }

      await db.collection("conversations").doc(threadId).set({
        threadId,
        messages: fullHistory,
        aiSummary,
        lastUpdatedAt: new Date().toISOString()
      }, { merge: true });
    }
    
    return { text: replyText };
  } catch (error) {
    console.error("Error calling Genkit:", error);
    throw new Error("Internal server error during AI generation.");
  }
});

const nodemailer = require("nodemailer");
const { getFirestore } = require("firebase-admin/firestore");

// Configure nodemailer transporter using standard SMTP or a service.
// (For demo purposes, we will mock the actual sending or use a test account if env vars aren't present)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "test@ethereal.email", // Replace with real credentials in production
    pass: "testpassword",
  },
});

exports.submitContactForm = onCall(async (request) => {
  const { name, email, message } = request.data;

  if (!name || !email || !message) {
    throw new Error("Missing required fields.");
  }

  try {
    // 1. Generate an AI summary of the message using Genkit
    const summaryResponse = await ai.generate({
      model: "googleai/gemini-2.5-flash-lite",
      system: "You are a helpful assistant. Summarize the following interior design inquiry in 1-2 concise sentences, focusing on the client's core pain points or desires.",
      prompt: `Client Name: ${name}\nClient Email: ${email}\nMessage: ${message}`,
    });

    const aiSummary = summaryResponse.text;

    // 2. Save to Firestore
    const db = getFirestore();
    const contactRef = db.collection("contacts").doc();
    await contactRef.set({
      name,
      email,
      message,
      aiSummary,
      createdAt: new Date().toISOString(),
      status: "unread"
    });

    // 3. Send Email Notification
    const mailOptions = {
      from: '"Crooked Credenza Notifications" <noreply@crookedcredenza.com>',
      to: "brian@example.com", // Brian's email
      subject: `New Inquiry from ${name}`,
      text: `You have a new inquiry from ${name} (${email}).\n\nMessage:\n${message}\n\nAI Summary:\n${aiSummary}`,
    };

    // We wrap this in try/catch so if ethereal fails it doesn't break the whole flow
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.warn("Failed to send email notification (expected if test credentials):", mailError);
    }

    return { success: true, aiSummary };
  } catch (error) {
    console.error("Error processing contact form:", error);
    throw new Error("Internal server error during contact form submission.");
  }
});
