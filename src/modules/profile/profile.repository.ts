import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from '~/shared/adapters/prisma/prisma.service';
import { Nullable } from '~/shared/interface/nullable.type';
import { ICreateProfile } from './interface/create-profile.interface';
import { getProfileWithTagsAndImageProfileType } from './interface/get-profile-with-tags-and-image-profile.interface.';

@Injectable()
export class ProfileRepository {
  constructor(private prismaService: PrismaService) {}

  async getProfileById(id: string): Promise<Nullable<Profile>> {
    return await this.prismaService.profile.findFirst({ where: { id } });
  }

  async getProfileByUserId(userId: string): Promise<Nullable<Profile>> {
    return await this.prismaService.profile.findFirst({
      where: { user: { id: userId } },
    });
  }

  async create(data: ICreateProfile, userId: string): Promise<Profile> {
    return await this.prismaService.profile.create({
      data: {
        name: data.name,
        username: data.username,
        birthDate: new Date(data.birthDate),
        user: { connect: { id: userId } },
      },
    });
  }

  async getProfileWithTagsAndImageProfile(
    profileId: string,
  ): Promise<getProfileWithTagsAndImageProfileType> {
    return await this.prismaService.profile.findFirst({
      where: { id: profileId },
      include: { tags: true, imageProfile: true },
    });
  }
}
