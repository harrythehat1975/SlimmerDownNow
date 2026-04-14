import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyPlan = await prisma.dailyPlan.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!dailyPlan) {
      return NextResponse.json(
        { error: "Daily plan not found for today" },
        { status: 404 }
      );
    }

    return NextResponse.json(dailyPlan);
  } catch (error) {
    console.error("Error fetching daily plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily plan" },
      { status: 500 }
    );
  }
}
