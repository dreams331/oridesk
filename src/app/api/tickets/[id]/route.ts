import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateReplySuggestion, calculateCareScore } from "@/lib/ai";

// GET /api/tickets/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      agent: { include: { user: { select: { name: true } } } },
      client: { select: { companyName: true, brandColor: true, brandTone: true, knowledgeBase: true } },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  // Mask customer data for agents
  if (session.user.role === "AGENT") {
    return NextResponse.json({
      ...ticket,
      customerName: ticket.maskedName,
      customerEmail: ticket.maskedEmail,
      customerPhone: null,
    });
  }

  return NextResponse.json(ticket);
}

// PATCH /api/tickets/[id] — update status, assign agent, add message
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        client: { select: { companyName: true, brandTone: true, knowledgeBase: true } },
      },
    });

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    // Add a message reply
    if (body.action === "reply") {
      const { content } = body;
      const agent = await prisma.agentProfile.findUnique({ where: { userId: session.user.id } });

      const message = await prisma.message.create({
        data: {
          ticketId: id,
          agentId: agent?.id || null,
          content,
          isFromCustomer: false,
        },
      });

      // Move to in-progress if still open
      if (ticket.status === "OPEN") {
        await prisma.ticket.update({ where: { id }, data: { status: "IN_PROGRESS" } });
      }

      return NextResponse.json(message);
    }

    // Get fresh AI suggestion
    if (body.action === "ai_suggest") {
      const { customerMessage } = body;
      const kb = ticket.client.knowledgeBase
        .filter((k: { isActive: boolean }) => k.isActive)
        .map((k: { title: string; content: string }) => `${k.title}: ${k.content}`)
        .join("\n\n");

      const history = ticket.messages
        .slice(-6)
        .map((m: { isFromCustomer: boolean; content: string }) => ({
          role: m.isFromCustomer ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }));

      const suggestion = await generateReplySuggestion({
        ticketSubject: ticket.subject,
        customerMessage,
        knowledgeBase: kb,
        brandTone: ticket.client.brandTone || undefined,
        companyName: ticket.client.companyName,
        conversationHistory: history,
      });

      await prisma.ticket.update({ where: { id }, data: { aiSuggestion: suggestion } });
      return NextResponse.json({ suggestion });
    }

    // Resolve ticket + calculate CareScore
    if (body.action === "resolve") {
      const conversation = ticket.messages
        .map((m: { isFromCustomer: boolean; content: string }) => `${m.isFromCustomer ? "Customer" : "Agent"}: ${m.content}`)
        .join("\n");

      const resolutionMinutes = Math.round((Date.now() - ticket.createdAt.getTime()) / 60000);
      const careScore = await calculateCareScore(conversation, resolutionMinutes).catch(() => 75);

      const updated = await prisma.ticket.update({
        where: { id },
        data: { status: "RESOLVED", resolvedAt: new Date(), careScore },
      });

      // Update agent's running CareScore average
      if (ticket.agentId) {
        const agentTickets = await prisma.ticket.findMany({
          where: { agentId: ticket.agentId, careScore: { not: null } },
          select: { careScore: true },
        });
        const avgScore =
          agentTickets.reduce((sum: number, t: { careScore: number | null }) => sum + (t.careScore || 0), 0) /
          (agentTickets.length || 1);

        await prisma.agentProfile.update({
          where: { id: ticket.agentId },
          data: {
            careScore: avgScore,
            resolvedTickets: { increment: 1 },
          },
        });
      }

      return NextResponse.json(updated);
    }

    // Generic field update (status, priority, agentId)
    const updated = await prisma.ticket.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/tickets/[id]]", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
