import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET messages for a ticket (used by widget to poll for agent replies)
export async function GET(req: NextRequest) {
  const ticketId = new URL(req.url).searchParams.get("ticketId");
  if (!ticketId) return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    select: { id: true, content: true, isFromCustomer: true, createdAt: true },
  });

  return NextResponse.json(messages);
}
