import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskName, maskEmail } from "@/lib/masking";
import { analyseSentiment, generateReplySuggestion } from "@/lib/ai";

// GET /api/tickets — fetch tickets based on role
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const where: Record<string, unknown> = {};

    if (session.user.role === "CLIENT") {
      const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
      if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
      where.clientId = client.id;
    } else if (session.user.role === "AGENT") {
      const agent = await prisma.agentProfile.findUnique({ where: { userId: session.user.id } });
      if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      where.agentId = agent.id;
    }

    if (status) where.status = status;

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        agent: { include: { user: { select: { name: true, email: true } } } },
        client: { select: { companyName: true, brandColor: true } },
        messages: { orderBy: { createdAt: "asc" }, take: 1 },
      },
    });

    // Strip real customer data for agents
    if (session.user.role === "AGENT") {
      const masked = tickets.map((t) => ({
        ...t,
        customerName: t.maskedName,
        customerEmail: t.maskedEmail,
        customerPhone: t.customerPhone ? "+44****" + t.customerPhone.slice(-4) : null,
      }));
      return NextResponse.json(masked);
    }

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("[GET /api/tickets]", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// POST /api/tickets — create a new ticket (from widget or internally)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      widgetKey,
      customerName: _customerName, name,
      customerEmail: _customerEmail, email,
      customerPhone, subject, message, channel
    } = body;
    const customerName = _customerName || name;
    const customerEmail = _customerEmail || email;

    if (!widgetKey || !customerName || !customerEmail || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await prisma.clientProfile.findUnique({ where: { widgetKey } });
    if (!client) return NextResponse.json({ error: "Invalid widget key" }, { status: 404 });

    // Run AI analysis in parallel
    const [sentiment, aiSuggestion] = await Promise.all([
      analyseSentiment(message).catch(() => "neutral"),
      generateReplySuggestion({
        ticketSubject: subject,
        customerMessage: message,
        companyName: client.companyName,
        brandTone: client.brandTone || undefined,
      }).catch(() => ""),
    ]);

    const ticket = await prisma.ticket.create({
      data: {
        clientId: client.id,
        channel: channel || "LIVE_CHAT",
        subject,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        maskedName: maskName(customerName),
        maskedEmail: maskEmail(customerEmail),
        sentiment,
        aiSuggestion,
        priority: sentiment === "angry" ? "URGENT" : sentiment === "negative" ? "HIGH" : "MEDIUM",
        messages: {
          create: {
            content: message,
            isFromCustomer: true,
          },
        },
      },
    });

    // Immediately post AI reply as a message so widget shows it instantly
    if (aiSuggestion) {
      await prisma.message.create({
        data: {
          ticketId: ticket.id,
          content: aiSuggestion,
          isFromCustomer: false,
          isAiSuggestion: true,
        },
      });
    }

    return NextResponse.json({ ticketId: ticket.id, success: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tickets]", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
