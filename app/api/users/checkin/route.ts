import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ============================================================================
// POST /api/users/checkin — Save a daily check-in
// GET  /api/users/checkin — Get today's check-in (if exists)
// ============================================================================

const checkinSchema = z.object({
  weight: z.number().min(30).max(300).optional(),
  waistCm: z.number().min(40).max(200).optional(),
  sleepHours: z.number().min(0).max(24),
  stressLevel: z.number().int().min(1).max(10),
  energyLevel: z.number().int().min(1).max(10),
  sorenessLevel: z.number().int().min(1).max(10),
  bloatingLevel: z.number().int().min(1).max(10),
  stepsCompleted: z.number().int().min(0).max(100000),
  dietAdherence: z.number().min(0).max(1),
  workoutAdherence: z.number().min(0).max(1),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert — allow updating today's check-in
    const checkin = await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      update: {
        ...parsed.data,
      },
      create: {
        userId,
        date: today,
        ...parsed.data,
      },
    });

    // If weight or waist provided, also update body metrics
    if (parsed.data.weight || parsed.data.waistCm) {
      const latestMetrics = await prisma.bodyMetrics.findFirst({
        where: { userId },
        orderBy: { measurementDate: "desc" },
      });

      if (latestMetrics) {
        await prisma.bodyMetrics.create({
          data: {
            userId,
            currentWeightKg: parsed.data.weight || latestMetrics.currentWeightKg,
            currentWaistCm: parsed.data.waistCm || latestMetrics.currentWaistCm,
            measurementDate: today,
          },
        });
      }
    }

    return NextResponse.json({ message: "Check-in saved", checkin }, { status: 201 });
  } catch (error) {
    console.error("[checkin] Error:", error);
    return NextResponse.json({ error: "Failed to save check-in" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkin = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: { userId, date: today },
      },
    });

    return NextResponse.json({ checkin, completed: !!checkin });
  } catch (error) {
    console.error("[checkin] Error:", error);
    return NextResponse.json({ error: "Failed to fetch check-in" }, { status: 500 });
  }
}
