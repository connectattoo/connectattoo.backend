import { BadRequestException, Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent, switchMap } from 'rxjs';
import { IPagination } from '../../shared/interface/pagination.interface';
import { ConversationRepository } from './conversation.repository';
import { IMessagePayload } from './interface/message-payload.interface';
import { IMessageEvent } from '../../shared/interface/message-event.interface';
import { IRetrieveMessage } from './interface/retrieve-message.interface';
import { IConversation } from './interface/conversation.interface';
import { IPostMessage } from './interface/post-message.interface';
import { HistoryRepository } from './history.repository';

@Injectable()
export class ChatService {
  constructor(
    private messageRepository: MessageRepository,
    private conversationRepository: ConversationRepository,
    private historyRepository: HistoryRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async chats(profileId: string): Promise<IConversation[]> {
    const historys =
      await this.historyRepository.findConversationsByProfileIdToChats(
        profileId,
      );

    return historys.map((history) => ({
      id: history.conversationId,
      lastMessage: history.messages[0] ?? null,
      participants: history.conversation.participants,
      blocked: !!history.conversation.blockedBy.length,
    }));
  }

  async postMessage(
    fromId: string,
    conversationId: string,
    content: string,
  ): Promise<IPostMessage> {
    //encontra a conversa
    const conversation =
      await this.conversationRepository.findConversationByIdAndProfileId(
        conversationId,
        fromId,
      );

    //verificação se a conversa existe
    if (!conversation) {
      throw new BadRequestException('Conversation not found'); //static
    }

    // verifica se o historico de todos existem (caso ele tenha sido deletado)
    const participantsWithoutHistory: string[] = [];
    const sendEventToProfiles: string[] = conversation.historysConversation.map(
      (history) => history.profileId,
    );
    const historyIdsToSaveMessage: string[] =
      conversation.historysConversation.map(({ id }) => id);
    // verifica se a lista de participantes é diferente de historicos de conversação
    if (
      conversation.historysConversation.length !==
      conversation.participants.length
    ) {
      for (const participant of conversation.participants) {
        //1. descobre qual é o historico faltando
        const historyExists = conversation.historysConversation.some(
          (history) => history.profileId === participant.id,
        );

        //2.
        if (!historyExists) {
          //verifica se a conversa é bloqueada para o perfil com historico faltante
          const verifyIfBlocked = await this.conversationRepository.isBlocked(
            conversationId,
            participant.id,
          );

          //se não estiver bloqueado, adiciona o historico faltante
          if (!verifyIfBlocked) {
            participantsWithoutHistory.push(participant.id);
          }
        }
      }

      //cria todos os historicos faltantes
      if (participantsWithoutHistory.length) {
        const historyIds = await this.historyRepository.createManyByProfileIds(
          conversation.id,
          participantsWithoutHistory,
        );

        //salva para enviar evento
        sendEventToProfiles.push(...participantsWithoutHistory);
        historyIdsToSaveMessage.push(...historyIds);
      }
    }

    //cria a mensagem e vincular a mensagem a todos historicos
    const message = await this.messageRepository.create(
      fromId,
      content,
      historyIdsToSaveMessage,
    );

    //emitir para todos listeners
    return {
      conversationId,
      listeners: sendEventToProfiles.map((toId) => ({
        [toId]: this.eventEmitter.emit(toId, {
          fromId,
          conversationId,
          content,
          createdAt: message.createdAt.toISOString(),
        } as IMessagePayload),
      })),
    };
  }

  async createConversation(
    profileId: string,
    toId: string,
  ): Promise<IConversation> {
    if (profileId === toId) {
      throw new BadRequestException(
        'Cannot start a conversation with yourself',
      );
    }
    console.log(profileId, toId);

    //TODO: validar se profile existe
    const conversation =
      await this.conversationRepository.findConversationByProfiles(
        profileId,
        toId,
      );

    if (conversation) return conversation;

    return await this.conversationRepository.create(profileId, toId);
  }

  async receive(profileId: string) {
    return fromEvent(this.eventEmitter, profileId).pipe(
      switchMap(
        async (
          payload: IMessagePayload,
        ): Promise<IMessageEvent<IMessagePayload>> => {
          //TODO: notification
          return { data: payload };
        },
      ),
    );
  }

  async retrieve(
    profileId: string,
    conversationId: string,
    pagination: IPagination,
  ): Promise<IRetrieveMessage[]> {
    const conversation =
      await this.conversationRepository.findConversationByIdAndProfileId(
        conversationId,
        profileId,
      );

    if (!conversation) {
      throw new BadRequestException('Conversation not found'); //static
    }

    const history =
      await this.historyRepository.findUnblockedConversationByIdAndProfileId(
        conversationId,
        profileId,
      );

    if (!history) {
      throw new BadRequestException('History not found');
    }

    await this.historyRepository.updateViewedById(history.id, true);

    return await this.messageRepository.findManyByConversationId(
      conversationId,
      pagination,
    );
  }

  //se estiver com o chat aberto, precisa chamar essa rota para atualizar o visualizado
  async forceUpdateViewed(profileId: string, conversationId: string) {
    const history =
      await this.historyRepository.findUnblockedConversationByIdAndProfileId(
        conversationId,
        profileId,
      );

    if (!history) {
      throw new BadRequestException('History not found');
    }

    await this.historyRepository.updateViewedById(history.id, true);
  }

  async deleteConversation(profileId: string, conversationId: string) {
    const history =
      await this.historyRepository.findUnblockedConversationByIdAndProfileId(
        conversationId,
        profileId,
      );

    if (!history) {
      throw new BadRequestException('History not found');
    }

    await this.historyRepository.deleteHistory(history.id);

    return { deleted: true };
  }

  async blockConversation(
    profileId: string,
    conversationId: string,
    block: boolean,
  ) {
    const history =
      await this.historyRepository.findConversationByIdAndProfileId(
        conversationId,
        profileId,
      );

    if (!history) {
      throw new BadRequestException('History not found');
    }

    await this.conversationRepository.updateBlockedById(
      history.conversationId,
      profileId,
      block,
    );

    return { blocked: true };
  }

  disableNotifications(profileId: string, conversationId: string) {
    throw new Error('Method not implemented.');
  }
}
