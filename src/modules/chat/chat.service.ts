import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent, map } from 'rxjs';
import { IPagination } from '../../shared/interface/pagination.interface';
import { ConversationRepository } from './conversation.repository';
import { IMessagePayload } from './interface/message-payload.interface';
import { IMessageEvent } from '../../shared/interface/message-event.interface';
import { IRetrieveMessage } from './interface/retrieve-message.interface';
import { IConversation } from './interface/conversation.interface';
import { ISendMessage } from './interface/send-message.interface';

@Injectable()
export class ChatService {
  constructor(
    private messageRepository: MessageRepository,
    private conversationRepository: ConversationRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async chats(profileId: string): Promise<IConversation[]> {
    const conversations =
      await this.conversationRepository.findConversationsByProfileId(profileId);

    return conversations.map((data) => ({
      id: data.id,
      createdAt: data.createdAt,
      lastMessage: data.messages[0],
      profile: {
        id: data.profiles[0].profile.id,
        name: data.profiles[0].profile.name,
        imageProfileUrl: data.profiles[0].profile.imageProfileUrl,
      },
    }));
  }

  async sendMessage(
    fromId: string,
    conversationId: string,
    content: string,
  ): Promise<ISendMessage[]> {
    const conversation =
      await this.conversationRepository.findConversationById(conversationId);

    if (!conversation) {
      throw new BadRequestException('Conversation not found'); //static
    }

    const toIds = conversation.profiles.map(({ profileId }) => profileId);

    console.log(toIds);

    const message = await this.messageRepository.create(
      fromId,
      conversationId,
      content,
    );

    return toIds.map((toId) => ({
      [toId]: this.eventEmitter.emit(toId, {
        fromId,
        conversationId,
        content,
        createdAt: message.createdAt.toISOString(),
      } as IMessagePayload),
    }));
  }

  async createConversation(
    profileId1: string,
    profileId2: string,
  ): Promise<IConversation> {
    const conversation =
      await this.conversationRepository.findConversationByProfiles(
        profileId1,
        profileId2,
      );

    if (conversation) return conversation;

    return await this.conversationRepository.create(profileId1, profileId2);
  }

  async receive(profileId: string) {
    return fromEvent(this.eventEmitter, profileId).pipe(
      map(
        (payload: IMessagePayload): IMessageEvent<IMessagePayload> => ({
          data: payload,
        }),
      ),
    );
  }

  async retrieve(
    fromId: string,
    conversationId: string,
    pagination: IPagination,
  ): Promise<IRetrieveMessage[]> {
    const conversation =
      await this.conversationRepository.findConversationById(conversationId);

    if (!conversation) {
      throw new BadRequestException('Conversation not found'); //static
    }

    const findConversationPromise = this.messageRepository.findByConversationId(
      conversationId,
      pagination,
    );

    const updateUnviewedPromise = this.messageRepository.updateUnviewed(
      conversationId,
      fromId,
    );

    const [messages] = await Promise.all([
      findConversationPromise,
      updateUnviewedPromise,
    ]);

    return messages;
  }

  deleteConversation(profileId: string, conversationId: string) {
    throw new Error('Method not implemented.');
  }

  blockConversation(profileId: string, conversationId: string) {
    throw new Error('Method not implemented.');
  }

  unblockConversation(profileId: string, conversationId: string) {
    throw new Error('Method not implemented.');
  }

  disableNotifications(profileId: string, conversationId: string) {
    throw new Error('Method not implemented.');
  }
}
