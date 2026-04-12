import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (optional, be careful in production)
  // await prisma.auditLog.deleteMany({});
  // await prisma.dailyPlan.deleteMany({});
  // await prisma.dailyCheckIn.deleteMany({});
  // ... etc

  // Seed meal templates
  console.log("📋 Creating meal templates...");

  const meals = [
    {
      name: "Grilled Chicken Avocado Bowl",
      calorieContent: 450,
      proteinG: 35,
      carbsG: 45,
      fatsG: 15,
      ingredients: JSON.stringify([
        { name: "Chicken breast", quantity: "150", unit: "g" },
        { name: "Brown rice", quantity: "100", unit: "g" },
        { name: "Avocado", quantity: "50", unit: "g" },
      ]),
      instructions: "Grill chicken, cook rice, assemble bowl",
      mealType: "lunch",
      dietaryCompatibility: JSON.stringify({
        omnivore: true,
        vegetarian: false,
        pescatarian: false,
      }),
      prepTimeMinutes: 30,
      difficulty: "easy",
    },
    {
      name: "Vegetable Stir-Fry",
      calorieContent: 320,
      proteinG: 12,
      carbsG: 42,
      fatsG: 10,
      ingredients: JSON.stringify([
        { name: "Mixed vegetables", quantity: "300", unit: "g" },
        { name: "Tofu", quantity: "150", unit: "g" },
        { name: "Soy sauce", quantity: "1", unit: "tbsp" },
      ]),
      instructions: "Stir-fry vegetables and tofu in wok",
      mealType: "dinner",
      dietaryCompatibility: JSON.stringify({
        omnivore: true,
        vegetarian: true,
        pescatarian: true,
      }),
      prepTimeMinutes: 25,
      difficulty: "easy",
    },
    {
      name: "Protein Smoothie",
      calorieContent: 280,
      proteinG: 25,
      carbsG: 35,
      fatsG: 5,
      ingredients: JSON.stringify([
        { name: "Protein powder", quantity: "30", unit: "g" },
        { name: "Banana", quantity: "1", unit: "medium" },
        { name: "Almond milk", quantity: "250", unit: "ml" },
      ]),
      instructions: "Blend all ingredients",
      mealType: "snack",
      dietaryCompatibility: JSON.stringify({
        omnivore: true,
        vegetarian: true,
        pescatarian: true,
      }),
      prepTimeMinutes: 5,
      difficulty: "easy",
    },
  ];

  for (const meal of meals) {
    // Check if meal exists before creating
    const existing = await prisma.mealTemplate.findFirst({
      where: { name: meal.name },
    });
    if (!existing) {
      await prisma.mealTemplate.create({
        data: meal,
      });
    }
  }

  console.log("✅ Meal templates created");

  // Seed workout templates
  console.log("💪 Creating workout templates...");

  const workouts = [
    {
      name: "Full Body Strength",
      description: "Complete full body strength training session",
      durationMinutes: 45,
      exerciseList: JSON.stringify([
        { name: "Squats", sets: 3, reps: 10, rest: 90 },
        { name: "Bench Press", sets: 3, reps: 10, rest: 90 },
        { name: "Deadlifts", sets: 3, reps: 5, rest: 120 },
      ]),
      workoutType: "strength",
      fitnessLevel: "beginner",
      location: "gym",
    },
    {
      name: "Home Bodyweight Circuit",
      description: "No equipment needed bodyweight workout",
      durationMinutes: 30,
      exerciseList: JSON.stringify([
        { name: "Push-ups", sets: 3, reps: 15, rest: 60 },
        { name: "Squats", sets: 3, reps: 20, rest: 60 },
        { name: "Plank", sets: 3, duration: 30, rest: 60 },
      ]),
      workoutType: "mixed",
      fitnessLevel: "beginner",
      location: "home",
    },
    {
      name: "20 Min Steady State Walk",
      description: "Low impact cardiovascular activity",
      durationMinutes: 20,
      exerciseList: JSON.stringify([{ name: "Brisk walking", duration: 20, intensity: "steady" }]),
      workoutType: "cardio",
      fitnessLevel: "beginner",
      location: "both",
    },
  ];

  for (const workout of workouts) {
    // Check if workout exists before creating
    const existing = await prisma.workoutTemplate.findFirst({
      where: { name: workout.name },
    });
    if (!existing) {
      await prisma.workoutTemplate.create({
        data: workout,
      });
    }
  }

  console.log("✅ Workout templates created");

  // Seed feature flags
  console.log("🚩 Creating feature flags...");

  const flags = [
    { name: "ai_meal_generation", enabled: false, rolloutPercentage: 0 },
    { name: "ai_coaching_chat", enabled: false, rolloutPercentage: 0 },
    { name: "social_challenges", enabled: false, rolloutPercentage: 0 },
    { name: "fitness_tracker_sync", enabled: false, rolloutPercentage: 0 },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: {},
      create: flag,
    });
  }

  console.log("✅ Feature flags created");

  // Seed admin user (if ADMIN_EMAIL env var is set)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    console.log("👤 Creating admin user...");

    const hashedPassword = await bcryptjs.hash(process.env.ADMIN_PASSWORD, 10);

    await prisma.adminUser.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {},
      create: {
        email: process.env.ADMIN_EMAIL,
        passwordHash: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Admin user created");
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
