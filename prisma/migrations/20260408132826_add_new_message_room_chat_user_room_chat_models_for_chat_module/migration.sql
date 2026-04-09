-- CreateTable
CREATE TABLE "public"."RoomChat" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRoomChat" (
    "userId" BIGINT NOT NULL,
    "roomChatId" BIGINT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoomChat_pkey" PRIMARY KEY ("userId","roomChatId")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" BIGINT NOT NULL,
    "roomChatId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_userRoomChat_user_id" ON "public"."UserRoomChat"("userId");

-- CreateIndex
CREATE INDEX "idx_userRoomChat_room_chat_id" ON "public"."UserRoomChat"("roomChatId");

-- CreateIndex
CREATE INDEX "idx_message_sender_id" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "idx_message_room_chat_id" ON "public"."Message"("roomChatId");

-- AddForeignKey
ALTER TABLE "public"."UserRoomChat" ADD CONSTRAINT "UserRoomChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRoomChat" ADD CONSTRAINT "UserRoomChat_roomChatId_fkey" FOREIGN KEY ("roomChatId") REFERENCES "public"."RoomChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_roomChatId_fkey" FOREIGN KEY ("roomChatId") REFERENCES "public"."RoomChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
