import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId, status } = await req.json();

  if (!agentId || !status) {
    return NextResponse.json({ error: "agentId and status are required" }, { status: 400 });
  }

  const agent = await prisma.agentProfile.update({
    where: { id: agentId },
    data: { status },
  });

  return NextResponse.json({ success: true, agentId: agent.id, status: agent.status });
}
