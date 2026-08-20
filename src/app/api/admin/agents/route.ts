import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAgentApprovedEmail } from "@/lib/email";

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
    include: { user: { select: { name: true, email: true } } },
  });

  // Notify agent when their account gets approved
  if (status === "ACTIVE" && agent.user.email) {
    sendAgentApprovedEmail(agent.user.email, agent.user.name || "there").catch(console.error);
  }

  return NextResponse.json({ success: true, agentId: agent.id, status: agent.status });
}
