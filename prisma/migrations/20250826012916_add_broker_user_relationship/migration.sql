-- CreateEnum
CREATE TYPE "public"."ContactStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "public"."BrokerContact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brokerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."ContactStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "BrokerContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrokerContact_brokerId_idx" ON "public"."BrokerContact"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerContact_userId_idx" ON "public"."BrokerContact"("userId");

-- CreateIndex
CREATE INDEX "BrokerContact_status_idx" ON "public"."BrokerContact"("status");

-- CreateIndex
CREATE INDEX "BrokerContact_invitedAt_idx" ON "public"."BrokerContact"("invitedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerContact_brokerId_userId_key" ON "public"."BrokerContact"("brokerId", "userId");

-- AddForeignKey
ALTER TABLE "public"."BrokerContact" ADD CONSTRAINT "BrokerContact_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrokerContact" ADD CONSTRAINT "BrokerContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
