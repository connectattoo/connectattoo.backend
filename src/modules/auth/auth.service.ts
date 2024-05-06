import { Injectable } from '@nestjs/common';
import { HashUtil } from 'src/shared/utils/hash.util';
import { MailService } from '~/shared/adapters/mail/mail.service';
import { IUser } from '../user/interfaces/user.interface';
import { UserService } from '../user/user.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { AuthBusinessExceptions } from './exceptions/auth-business.exceptions';
import { JwtAuthPayload } from './interfaces/jwt-auth-payload.interface';
import { JwtSignature } from './interfaces/jwt-signature.interface';
import { IRegisterArtist } from './interfaces/register-artist.interface';
import { IRegisterUser } from './interfaces/register-user.interface';
import { JwtStrategies } from './jwt.strategies';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtStrategies: JwtStrategies,
    private mailService: MailService,
    private userService: UserService,
    private profileService: ProfileService,
  ) {}

  async registerUser(userData: IRegisterUser): Promise<JwtSignature> {
    const createdUser = await this.createUser(userData);

    return { accessToken: createdUser.accessToken };
  }

  async registerArtist(artistData: IRegisterArtist) {
    const createdUser = await this.createUser(artistData);

    await this.userService.createArtist(createdUser.id, artistData.address);

    return { accessToken: createdUser.accessToken };
  }

  async login(userLoginDto: UserLoginDto): Promise<JwtSignature> {
    const userAndProfile = await this.userService.getUserAndProfileByEmail(
      userLoginDto.email,
    );

    if (!userAndProfile)
      throw AuthBusinessExceptions.invalidCredentialsException();

    const isValidPassword = HashUtil.verify(
      userLoginDto.password,
      userAndProfile.password,
    );

    if (!isValidPassword)
      throw AuthBusinessExceptions.invalidCredentialsException();

    if (!userAndProfile.isEmailConfirmed) {
      throw AuthBusinessExceptions.emailNotVerifiedException();
    }

    const payload: JwtAuthPayload = {
      userId: userAndProfile.id,
      profileId: userAndProfile.profile!.id,
      email: userAndProfile.email,
      isEmailConfirmed: userAndProfile.isEmailConfirmed,
      isArtist: !!userAndProfile.tattooArtistId,
    };

    return await this.jwtStrategies.auth.sign(payload);
  }

  async confirmUser(mailToken: string): Promise<void> {
    const { email } = await this.jwtStrategies.mail.verify(mailToken);

    const user = await this.userService.getUserByEmail(email);

    if (!user) throw AuthBusinessExceptions.emailNotFoundException();

    if (user.isEmailConfirmed)
      throw AuthBusinessExceptions.emailAlreadyVerifiedException();

    await this.userService.confirmUser(email);
  }

  private async createUser(
    userData: IRegisterUser,
  ): Promise<JwtSignature & Required<IUser>> {
    const password = HashUtil.hash(userData.password);

    const { accessToken: confirmationToken } =
      await this.jwtStrategies.mail.sign({
        email: userData.email,
      });

    const createdUser = await this.userService.createUser({
      email: userData.email,
      password,
      termsAccepted: userData.termsAccepted,
    });

    const createdProfile = await this.profileService.create(
      {
        name: userData.name,
        username: userData.email.split('@')[0],
        birthDate: userData.birthDate,
      },
      createdUser.id,
    );

    await this.profileService.vinculateRandomTags(createdProfile.id);

    await this.mailService.sendConfirmationEmail(
      createdUser.email,
      createdProfile.name.split(' ')[0],
      confirmationToken,
    );

    const payload: JwtAuthPayload = {
      userId: createdUser.id,
      profileId: createdProfile.id,
      email: createdUser.email,
      isEmailConfirmed: createdUser.isEmailConfirmed,
      isArtist: !!createdUser.tattooArtistId,
    };

    const { accessToken } = await this.jwtStrategies.auth.sign(payload);

    return { ...createdUser, accessToken }; //retorna token de email
  }
}
