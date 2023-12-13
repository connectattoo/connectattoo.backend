import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '~/shared/adapters/mail/mail.module';
import { JwtStrategies } from './jwt.strategies';

@Module({
  imports: [UserModule, JwtModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategies],
  exports: [JwtStrategies],
})
export class AuthModule {}
