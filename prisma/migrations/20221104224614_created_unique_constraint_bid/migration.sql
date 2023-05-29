/*
  Warnings:

  - A unique constraint covering the columns `[participantId,matchId]` on the table `Bid` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bid_participantId_matchId_key" ON "Bid"("participantId", "matchId");
