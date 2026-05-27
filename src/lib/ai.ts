import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface AISuggestionParams {
  ticketSubject: string;
  customerMessage: string;
  knowledgeBase?: string;
  brandTone?: string;
  companyName?: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

/**
 * Generate an AI reply suggestion for an agent
 */
export async function generateReplySuggestion({
  ticketSubject,
  customerMessage,
  knowledgeBase,
  brandTone,
  companyName,
  conversationHistory = [],
}: AISuggestionParams): Promise<string> {
  const systemPrompt = `You are a helpful customer service AI assistant for ${companyName || "a company"}.
Your job is to suggest a professional, empathetic reply for a customer service agent to send to a customer.
${brandTone ? `Brand tone: ${brandTone}` : "Keep the tone professional and friendly."}
${knowledgeBase ? `Company knowledge base:\n${knowledgeBase}` : ""}

Rules:
- Keep replies concise and helpful
- Always be empathetic and professional
- Do not make up information not in the knowledge base
- Sign off naturally without adding agent names
- Suggest the reply only, no explanation`;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    {
      role: "user",
      content: `Ticket subject: ${ticketSubject}\n\nCustomer message: ${customerMessage}`,
    },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
}

/**
 * Analyse the sentiment of a customer message
 * Returns: "positive" | "neutral" | "negative" | "angry"
 */
export async function analyseSentiment(message: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          'Analyse the sentiment of this customer message. Reply with ONLY one word: "positive", "neutral", "negative", or "angry".',
      },
      { role: "user", content: message },
    ],
    max_tokens: 10,
    temperature: 0,
  });

  const sentiment = completion.choices[0]?.message?.content?.trim().toLowerCase() || "neutral";
  const validSentiments = ["positive", "neutral", "negative", "angry"];
  return validSentiments.includes(sentiment) ? sentiment : "neutral";
}

/**
 * Calculate a CareScore (0-100) for a resolved conversation
 */
export async function calculateCareScore(
  conversation: string,
  resolutionTime: number
): Promise<number> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a quality assessor for customer service conversations. 
Score this conversation from 0-100 based on:
- Empathy and professionalism (30 points)
- Issue resolution (40 points)  
- Response clarity (20 points)
- Speed consideration: resolution in ${resolutionTime} minutes (10 points)
Reply with ONLY a number between 0 and 100.`,
      },
      { role: "user", content: conversation },
    ],
    max_tokens: 5,
    temperature: 0,
  });

  const score = parseInt(completion.choices[0]?.message?.content?.trim() || "70");
  return isNaN(score) ? 70 : Math.min(100, Math.max(0, score));
}
