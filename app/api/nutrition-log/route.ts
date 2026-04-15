import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const log = await prisma.nutritionLog.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  return NextResponse.json(log || { proteinG: 0, carbG: 0, fatG: 0 });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { proteinG, carbG, fatG } = body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const log = await prisma.nutritionLog.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, proteinG, carbG, fatG },
    update: { proteinG, carbG, fatG },
  });
  return NextResponse.json(log);
}
