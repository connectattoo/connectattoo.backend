import {
  Body,
  Controller,
  Param,
  Get,
  Post,
  Req,
  Sse,
  Query,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { IMessageEvent } from '../../shared/interface/message-event.interface';
import { ISignedRequest } from '../auth/interfaces/signed-request.interface';
import { ChatService } from './chat.service';
import { PaginationDTO } from '../../shared/dto/pagination.dto';
import { IMessagePayload } from './interface/message-payload.interface';
import { IRetrieveMessage } from './interface/retrieve-message.interface';
import { IConversation } from './interface/conversation.interface';
import { ISendMessage } from './interface/send-message.interface';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async chats(@Req() req: ISignedRequest): Promise<IConversation[]> {
    return await this.chatService.chats(req.user.profileId);
  }

  @Sse('receive')
  async receive(
    @Req() req: ISignedRequest,
  ): Promise<Observable<IMessageEvent<IMessagePayload>>> {
    return await this.chatService.receive(req.user.profileId);
  }

  @Get('retrieve/conversation/:conversationId')
  async retrieve(
    @Req() req: ISignedRequest,
    @Param('conversationId') conversationId: string,
    @Query() pagination: PaginationDTO,
  ): Promise<IRetrieveMessage[]> {
    return await this.chatService.retrieve(
      req.user.profileId,
      conversationId,
      pagination,
    );
  }

  @Post('conversation/:conversationId')
  async sendMessage(
    @Req() req: ISignedRequest,
    @Param('conversationId') conversationId: string,
    @Body('message') message: string,
  ): Promise<ISendMessage[]> {
    return await this.chatService.sendMessage(
      req.user.profileId,
      conversationId,
      message,
    );
  }

  @Post('conversation')
  async createConversation(
    @Req() req: ISignedRequest,
    @Body('toId') toId: string,
  ): Promise<IConversation> {
    return await this.chatService.createConversation(req.user.profileId, toId);
  }
}
