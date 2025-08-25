/*
  Warnings:

  - A unique constraint covering the columns `[defaultListId]` on the table `Household` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Household" ADD COLUMN     "defaultListId" TEXT;

-- AlterTable
ALTER TABLE "public"."List" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."ListItem" ADD COLUMN     "addedById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Household_defaultListId_key" ON "public"."Household"("defaultListId");

-- CreateIndex
CREATE INDEX "List_householdId_idx" ON "public"."List"("householdId");

-- CreateIndex
CREATE INDEX "ListItem_listId_idx" ON "public"."ListItem"("listId");

-- CreateIndex
CREATE INDEX "ListItem_propertyId_idx" ON "public"."ListItem"("propertyId");

-- AddForeignKey
ALTER TABLE "public"."Household" ADD CONSTRAINT "Household_defaultListId_fkey" FOREIGN KEY ("defaultListId") REFERENCES "public"."List"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListItem" ADD CONSTRAINT "ListItem_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
