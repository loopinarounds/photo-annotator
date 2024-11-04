/*
  Warnings:

  - You are about to drop the column `annotations` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `liveblocksId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_RoomToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[liveblocksRoomId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[liveblocksUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `liveblocksUserId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_RoomToUser" DROP CONSTRAINT "_RoomToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToUser" DROP CONSTRAINT "_RoomToUser_B_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "annotations",
ALTER COLUMN "imageFileName" DROP NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "liveblocksId",
ADD COLUMN     "liveblocksUserId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_RoomToUser";

-- CreateTable
CREATE TABLE "Annotation" (
    "id" SERIAL NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomParticipants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Annotation_roomId_idx" ON "Annotation"("roomId");

-- CreateIndex
CREATE INDEX "Annotation_authorId_idx" ON "Annotation"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomParticipants_AB_unique" ON "_RoomParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomParticipants_B_index" ON "_RoomParticipants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Room_liveblocksRoomId_key" ON "Room"("liveblocksRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "User_liveblocksUserId_key" ON "User"("liveblocksUserId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipants" ADD CONSTRAINT "_RoomParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipants" ADD CONSTRAINT "_RoomParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
