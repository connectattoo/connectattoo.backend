import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';

const MODULES = [
  AuthModule,
  UserModule,
  ProfileModule,
  TagModule,
  LocationModule,
  ChatModule,
];

@Module({
  imports: MODULES,
  exports: MODULES,
})
export class ModulesModule {}
