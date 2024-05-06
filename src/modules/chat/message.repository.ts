import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/adapters/prisma/prisma.service';
import { IPagination } from '../../shared/interface/pagination.interface';

@Injectable()
export class MessageRepository {
  constructor(private prismaService: PrismaService) {}

  async findByConversationId(conversationId: string, pagination: IPagination) {
    return await this.prismaService.message.findMany({
      where: { conversationId },
      skip: pagination.offset,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      select: { fromId: true, content: true, createdAt: true },
    });
  }

  async updateUnviewed(conversationId: string, fromId: string) {
    return await this.prismaService.message.updateMany({
      where: {
        conversationId,
        NOT: { fromId },
        viewed: false,
      },
      data: { viewed: true },
    });
  }

  async create(fromId: string, conversationId: string, content: string) {
    return await this.prismaService.message.create({
      data: { fromId, content, conversationId },
    });
  }
}
