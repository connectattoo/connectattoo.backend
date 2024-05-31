import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/adapters/prisma/prisma.service';

@Injectable()
export class HistoryRepository {
  constructor(private prismaService: PrismaService) {}

  async findConversationByIdAndProfileId(
    conversationId: string,
    profileId: string,
  ) {
    return await this.prismaService.historyConversation.findFirst({
      where: {
        profileId,
        conversationId,
      },
      select: {
        id: true,
        conversationId: true,
      },
    });
  }

  async findUnblockedConversationByIdAndProfileId(
    conversationId: string,
    profileId: string,
  ) {
    return await this.prismaService.historyConversation.findFirst({
      where: {
        profileId,
        conversation: {
          id: conversationId,
          blockedBy: { none: { id: profileId } },
        },
      },
      select: {
        id: true,
      },
    });
  }

  async findConversationsByProfileIdToChats(profileId: string) {
    return await this.prismaService.historyConversation.findMany({
      where: { profileId },
      select: {
        conversationId: true,
        conversation: {
          select: {
            blockedBy: { where: { id: profileId }, select: { id: true } },
            participants: {
              where: { NOT: { id: profileId } },
              select: { id: true, name: true, imageProfileUrl: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
    });
  }

  async createManyByProfileIds(conversationId: string, profileIds: string[]) {
    await this.prismaService.historyConversation.createMany({
      data: profileIds.map((profileId) => ({ conversationId, profileId })),
    });

    const findMany = await this.prismaService.historyConversation.findMany({
      where: { conversationId, profileId: { in: profileIds } },
      select: { id: true },
    });

    return findMany.map(({ id }) => id);
  }

  async updateViewedById(historyId: string, viewed: boolean) {
    await this.prismaService.historyConversation.update({
      where: { id: historyId },
      data: { viewed },
    });
  }

  async deleteHistory(historyId: string) {
    await this.prismaService.historyConversation.delete({
      where: { id: historyId },
    });
  }
}
