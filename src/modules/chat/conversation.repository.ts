import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/adapters/prisma/prisma.service';

@Injectable()
export class ConversationRepository {
  constructor(private prismaService: PrismaService) {}

  async findConversationsByProfileId(profileId: string) {
    return await this.prismaService.conversation.findMany({
      where: { profiles: { some: { id: profileId } } },
      select: { id: true, createdAt: true },
    });
  }

  async findConversationByProfiles(profileId1: string, profileId2: string) {
    return await this.prismaService.conversation.findFirst({
      where: {
        profiles: {
          some: { id: { in: [profileId1, profileId2] } },
        },
      },
    });
  }

  async findConversationById(conversationId: string) {
    return await this.prismaService.conversation.findFirst({
      where: { id: conversationId },
      include: { profiles: true },
    });
  }

  async create(profileId1: string, profileId2: string) {
    return await this.prismaService.conversation.create({
      data: {
        profiles: { connect: [{ id: profileId1 }, { id: profileId2 }] },
      },
      select: { id: true, createdAt: true },
    });
  }
}
