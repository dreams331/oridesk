import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — customer sends a follow-up message from the widget
export async function POST(req: NextRequest) {
  const { ticketId, content } = await req.json();
  if (!ticketId || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const message = await prisma.message.create({
    data: { ticketId, content, isFromCustomer: true },
  });

  return NextResponse.json(message, { status: 201 });
}
