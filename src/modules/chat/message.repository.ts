import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/adapters/prisma/prisma.service';
import { IPagination } from '../../shared/interface/pagination.interface';

@Injectable()
export class MessageRepository {
  constructor(private prismaService: PrismaService) {}

  async findManyByConversationId(
    conversationId: string,
    pagination: IPagination,
  ) {
    return await this.prismaService.message.findMany({
      where: { historyConversations: { every: { conversationId } } },
      skip: pagination.offset,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      select: { fromId: true, content: true, createdAt: true },
    });
  }

  async create(
    fromId: string,
    content: string,
    historyConversationIds: string[],
  ) {
    return await this.prismaService.message.create({
      data: {
        content,
        fromId,
        historyConversations: {
          connect: historyConversationIds.map((id) => ({ id })),
        },
      },
    });
  }
}
