import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageRepository } from './message.repository';
import { PrismaModule } from '../../shared/adapters/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConversationRepository } from './conversation.repository';
import { HistoryRepository } from './history.repository';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot({})],
  controllers: [ChatController],
  providers: [
    ChatService,
    MessageRepository,
    ConversationRepository,
    HistoryRepository,
  ],
})
export class ChatModule {}
