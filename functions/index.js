/**
 * Genkit and Firebase Functions setup for Crooked Credenza AI.
 */
const { onCall } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");

// Genkit imports
const { genkit, z } = require("genkit");
const { googleAI } = require("@genkit-ai/googleai");
const { getFirestore } = require("firebase-admin/firestore");


initializeApp();

// Initialize the Genkit instance
const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY })],
});

// The system prompt defining the persona
const CROOKED_SYSTEM_PROMPT = `
You are Crooked AI, an assistant for Brian, the founder and lead designer of "Crooked Credenza", an interior design studio.
Your design philosophy values character over polish, lived-in over staged, and patina, irregularity, and memory.

CRITICAL RULES:
1. Do NOT replace Brian and his artistic vision. Keep your own design suggestions and ideas to an absolute minimum.
2. Focus entirely on what the client wants and their ideas. Ask gentle, probing questions about their space and how they live in it to help them articulate their own vision.
3. Do NOT suggest specific furniture, colors, or layouts unless the user explicitly asks for something very general, and even then, defer to Brian's expertise.
4. When the user has shared enough about their space or expresses interest in working with Brian, offer to submit an inquiry on their behalf.
5. Use the \`submitInquiry\` tool to collect their name, email, and project details and send it directly to Brian. Let the user know you have done so.

Your Tone of Voice:
- Thoughtful, observant, never preachy.
- Use gentle language in short, thoughtful sentences.
`;

// Define a tool for the AI to submit contact inquiries automatically
const submitInquiryTool = ai.defineTool(
  {
    name: "submitInquiry",
    description: "Submit a project inquiry or contact message to Brian on behalf of the user. Call this ONLY when the user explicitly wants to reach out to Brian or hire him. You'll need their name, email, and a summary of their project.",
    schema: z.object({
      name: z.string().describe("The user's full name"),
      email: z.string().describe("The user's email address"),
      message: z.string().describe("A custom summary of the user's project, space, and ideas based on the conversation"),
    }),
  },
  async ({ name, email, message }) => {
    const db = getFirestore();
    const contactRef = db.collection("contacts").doc();
    
    // Quick summary using AI on the message
    const summaryResponse = await ai.generate({
      model: "googleai/gemini-2.5-flash-lite",
      system: "Summarize the interior design inquiry in 1 sentence.",
      prompt: `Message: ${message}`,
    });
    const aiSummary = summaryResponse.text;

    await contactRef.set({
      name,
      email,
      message,
      aiSummary,
      createdAt: new Date().toISOString(),
      status: "unread"
    });

    return "Inquiry successfully sent. Please notify the user that you've sent it to Brian and he'll be in touch.";
  }
);

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
      tools: [submitInquiryTool], // Give the model access to the tool
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
