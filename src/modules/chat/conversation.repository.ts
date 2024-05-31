import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/adapters/prisma/prisma.service';

@Injectable()
export class ConversationRepository {
  constructor(private prismaService: PrismaService) {}

  // async findConversationsByProfileId(profileId: string) {
  //   return await this.prismaService.conversation.findMany({
  //     where: { historysConversation: { some: { profileId, blocked: false } } },
  //     select: {
  //       id: true,
  //       historysConversation: {
  //         where: { blocked: false },
  //         select: {
  //           messages: {
  //             orderBy: { createdAt: 'desc' },
  //             take: 1,
  //             select: { content: true, createdAt: true },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

  async isBlocked(conversationId: string, profileId: string) {
    return await this.prismaService.conversation.findFirst({
      where: { id: conversationId, blockedBy: { some: { id: profileId } } },
    });
  }

  async findConversationByProfiles(profileId1: string, profileId2: string) {
    return await this.prismaService.conversation.findFirst({
      where: {
        participants: { every: { id: { in: [profileId1, profileId2] } } },
      },
      select: { id: true },
    });
  }

  // async findConversationById(conversationId: string) {
  //   return await this.prismaService.conversation.findFirst({
  //     where: { id: conversationId },
  //     include: {
  //       profiles: { select: { id: true } },
  //       historysConversation: {
  //         where: { blocked: false },
  //         select: { id: true, blocked: true, profileId: true },
  //       },
  //     },
  //   });
  // }

  async findConversationByIdAndProfileId(
    conversationId: string,
    profileId: string,
  ) {
    return await this.prismaService.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: profileId } },
        blockedBy: { none: { id: profileId } },
      },
      include: {
        participants: { select: { id: true } },
        historysConversation: { select: { id: true, profileId: true } },
      },
    });
  }

  async create(profileId1: string, profileId2: string) {
    return await this.prismaService.conversation.create({
      data: {
        participants: { connect: [{ id: profileId1 }, { id: profileId2 }] },
        historysConversation: {
          createMany: {
            data: [{ profileId: profileId1 }, { profileId: profileId2 }],
          },
        },
      },
      select: { id: true },
    });
  }

  async updateBlockedById(
    conversationId: string,
    profileId: string,
    blocked: boolean,
  ) {
    return await this.prismaService.conversation.update({
      where: { id: conversationId },
      data: {
        blockedBy: blocked
          ? { connect: { id: profileId } }
          : { disconnect: { id: profileId } },
      },
    });
  }
}
