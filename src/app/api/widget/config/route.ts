import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const client = await prisma.clientProfile.findUnique({
    where: { widgetKey: key },
    select: { companyName: true, brandColor: true, widgetKey: true },
  });

  if (!client) return NextResponse.json({ error: "Invalid key" }, { status: 404 });

  return NextResponse.json(client);
}
