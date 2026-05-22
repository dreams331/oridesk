import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agent = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "AGENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { country, phone, bio } = await req.json();

  const agent = await prisma.agentProfile.update({
    where: { userId: session.user.id },
    data: { country, phone, bio },
  });

  return NextResponse.json({ success: true, agentId: agent.id });
}
