import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await prisma.knowledgeBase.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, content, category } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

  const item = await prisma.knowledgeBase.create({
    data: { clientId: client.id, title, content, category },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.knowledgeBase.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
