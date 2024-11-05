/*
  Warnings:

  - A unique constraint covering the columns `[roomId,x,y,authorId]` on the table `Annotation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Annotation_roomId_x_y_authorId_key" ON "Annotation"("roomId", "x", "y", "authorId");
