-- Migration: Add nutritionLog table

CREATE TABLE "nutritionLog" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "proteinG" INTEGER NOT NULL DEFAULT 0,
  "carbG" INTEGER NOT NULL DEFAULT 0,
  "fatG" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "nutritionLog_user_date_unique" UNIQUE ("userId", "date"),
  CONSTRAINT "nutritionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
