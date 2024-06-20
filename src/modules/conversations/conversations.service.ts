import { Injectable } from '@nestjs/common';
import { IGetConversations } from './interface/getConversations.interface';
import { ISearchFilterWithPagination } from '../../shared/interface/filters.interface';
import { CONVERSATIONS_RANDOM_MOCK } from '~/shared/constants/conversations-random-mock.constant';

@Injectable()
export class ConversationService {
  getConversations(filters: ISearchFilterWithPagination): IGetConversations[] {
    const result = CONVERSATIONS_RANDOM_MOCK.slice(
      filters?.offset,
      filters?.limit || CONVERSATIONS_RANDOM_MOCK.length,
    ).sort(function (a, b) {
      const dateA = new Date(a.lastMessage.createdAt || 0);
      const dateB = new Date(b.lastMessage.createdAt || 0);

      return filters?.sort == 'asc'
        ? dateA.valueOf() - dateB.valueOf()
        : dateB.valueOf() - dateA.valueOf();
    });

    result.map((conversation, i) => {
      if (!conversation.lastMessage.createdAt) {
        result.splice(i, 1);
      }
    });

    if (filters.search) {
      return result.filter((conversation) =>
        conversation.profile.name.localeCompare(filters?.search, 'pt-br', {
          sensitivity: 'base',
        }) === 0
          ? conversation
          : null,
      );
    }

    return result;
  }
}
