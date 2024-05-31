import {
  Body,
  Controller,
  Param,
  Get,
  Post,
  Req,
  Sse,
  Query,
  Patch,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { IMessageEvent } from '../../shared/interface/message-event.interface';
import { ISignedRequest } from '../auth/interfaces/signed-request.interface';
import { ChatService } from './chat.service';
import { PaginationDTO } from '../../shared/dto/pagination.dto';
import { IMessagePayload } from './interface/message-payload.interface';
import { IRetrieveMessage } from './interface/retrieve-message.interface';
import { IConversation } from './interface/conversation.interface';
import { IPostMessage } from './interface/post-message.interface';
import { ISuccessBoolean } from './interface/sucess.interface';

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
  async postMessage(
    @Req() req: ISignedRequest,
    @Param('conversationId') conversationId: string,
    @Body('message') message: string,
  ): Promise<IPostMessage> {
    return await this.chatService.postMessage(
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

  @Patch('conversation/:conversationId/delete')
  async delete(
    @Req() req: ISignedRequest,
    @Param('conversationId') conversationId: string,
  ): Promise<ISuccessBoolean> {
    return await this.chatService.deleteConversation(
      req.user.profileId,
      conversationId,
    );
  }

  @Patch('conversation/:conversationId/block')
  async block(
    @Req() req: ISignedRequest,
    @Param('conversationId') conversationId: string,
    @Body('block') block: boolean,
  ): Promise<ISuccessBoolean> {
    return await this.chatService.blockConversation(
      req.user.profileId,
      conversationId,
      block,
    );
  }
}
