import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const client = await prisma.clientProfile.update({
    where: { userId: session.user.id },
    data: {
      website: body.website,
      brandColor: body.brandColor,
      brandTone: body.brandTone,
    },
  });

  return NextResponse.json({ success: true, widgetKey: client.widgetKey });
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(client);
}
