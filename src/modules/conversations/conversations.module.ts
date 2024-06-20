import { Module } from '@nestjs/common';
import { ConversationController } from './conversations.controller';
import { ConversationService } from './conversations.service';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationsModule {}
