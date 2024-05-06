/*
  Warnings:

  - You are about to drop the `_ConversationToProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ConversationToProfile" DROP CONSTRAINT "_ConversationToProfile_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationToProfile" DROP CONSTRAINT "_ConversationToProfile_B_fkey";

-- DropTable
DROP TABLE "_ConversationToProfile";

-- CreateTable
CREATE TABLE "ConversationOnProfile" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "ConversationOnProfile_pkey" PRIMARY KEY ("profileId","conversationId")
);

-- AddForeignKey
ALTER TABLE "ConversationOnProfile" ADD CONSTRAINT "ConversationOnProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationOnProfile" ADD CONSTRAINT "ConversationOnProfile_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
