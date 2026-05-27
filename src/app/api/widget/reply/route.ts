import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReplySuggestion } from "@/lib/ai";

// POST — customer sends a follow-up message from the widget
export async function POST(req: NextRequest) {
  const { ticketId, content } = await req.json();
  if (!ticketId || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Save customer message
  const message = await prisma.message.create({
    data: { ticketId, content, isFromCustomer: true },
  });

  // Fetch ticket + KB context for AI reply (don't await — fire and save async)
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        client: { include: { knowledgeBase: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    // Only AI-reply if ticket is not yet assigned to a human agent
    if (ticket && !ticket.agentId) {
      const kb = ticket.client.knowledgeBase.map((k: { content: string }) => k.content).join("\n\n");
      const history = ticket.messages.map((m: { isFromCustomer: boolean; content: string }) => ({
        role: (m.isFromCustomer ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

      const aiReply = await generateReplySuggestion({
        ticketSubject: ticket.subject,
        customerMessage: content,
        knowledgeBase: kb || undefined,
        companyName: ticket.client.companyName,
        brandTone: ticket.client.brandTone || undefined,
        conversationHistory: history,
      });

      if (aiReply) {
        await prisma.message.create({
          data: {
            ticketId,
            content: aiReply,
            isFromCustomer: false,
            isAiSuggestion: true,
          },
        });
      }
    }
  } catch (err) {
    console.error("[widget/reply AI]", err);
    // Never fail the customer message save because of AI error
  }

  return NextResponse.json(message, { status: 201 });
}
