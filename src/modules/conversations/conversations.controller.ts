import { Controller, Get, Query } from '@nestjs/common';
import { IGetConversations } from './interface/getConversations.interface';
import { ConversationService } from './conversations.service';
import { SearchFilterWithPaginationDTO } from '~/shared/dto/searchFilterWithPagination.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Get('/')
  getConversations(
    @Query() filters: SearchFilterWithPaginationDTO,
  ): IGetConversations[] {
    return this.conversationService.getConversations(filters);
  }
}
