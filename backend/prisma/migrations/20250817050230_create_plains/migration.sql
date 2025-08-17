/*
  Warnings:

  - You are about to drop the column `apiKey` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."status_plans" AS ENUM ('PENDING', 'Active', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "public"."ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserPlan" DROP CONSTRAINT "UserPlan_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserPlan" DROP CONSTRAINT "UserPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_planId_fkey";

-- DropIndex
DROP INDEX "public"."users_apiKey_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "apiKey",
DROP COLUMN "planId";

-- DropTable
DROP TABLE "public"."ApiKey";

-- DropTable
DROP TABLE "public"."UserPlan";

-- CreateTable
CREATE TABLE "public"."users_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "apiKey" TEXT NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "public"."status_plans" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_plans_apiKey_key" ON "public"."users_plans"("apiKey");

-- CreateIndex
CREATE INDEX "users_plans_user_id_idx" ON "public"."users_plans"("user_id");

-- CreateIndex
CREATE INDEX "users_plans_plan_id_idx" ON "public"."users_plans"("plan_id");

-- AddForeignKey
ALTER TABLE "public"."users_plans" ADD CONSTRAINT "users_plans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_plans" ADD CONSTRAINT "users_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
