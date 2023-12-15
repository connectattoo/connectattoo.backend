import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtMailPayload } from './interfaces/jwt-mail-payload.interface';
import { JwtSignature } from './interfaces/jwt-signature.interface';
import { JwtStrategiesImplementation } from './interfaces/jwt-strategies.interface';
import { JwtAuthPayload } from './interfaces/jwt-auth-payload.interface';

@Injectable()
export class JwtStrategies implements JwtStrategiesImplementation.Interface {
  constructor(private jwtService: JwtService) {}

  public auth = this.configureAuthStrategy();

  public mail = this.configureMailStrategy();

  private configureAuthStrategy() {
    return this.configureJwtStrategies<JwtAuthPayload>({
      secret: process.env.JWT_SECRET_KEY!,
      expiresIn: process.env.JWT_EXPIRES_IN!,
    });
  }

  private configureMailStrategy() {
    return this.configureJwtStrategies<JwtMailPayload>({
      secret: process.env.EMAIL_CONFIRMATION_SECRET_KEY!,
      expiresIn: process.env.EMAIL_CONFIRMATION_EXPIRES_IN!,
    });
  }

  private configureJwtStrategies<
    TPayload extends JwtStrategiesImplementation.Payload,
  >(options: JwtStrategiesImplementation.Configure) {
    return {
      sign: async (payload: TPayload): Promise<JwtSignature> => ({
        accessToken: await this.jwtService.signAsync(
          payload,
          options as JwtSignOptions,
        ),
      }),
      verify: async (token: string): Promise<TPayload> => {
        try {
          return await this.jwtService.verifyAsync(
            token,
            options as JwtVerifyOptions,
          );
        } catch (e) {
          throw new UnauthorizedException();
        }
      },
    };
  }
}
