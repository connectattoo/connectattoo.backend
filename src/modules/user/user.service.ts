import { Injectable } from '@nestjs/common';
import { IUser } from './interfaces/user.interface';
import { User } from '@prisma/client';
import { AuthBusinessExceptions } from '../auth/exceptions/auth-business.exceptions';
import { UserRepository } from './user.repository';
import { IAddress } from './interfaces/address.interface';
import { IGetConfirmed } from './interfaces/get-confirmed.interface';
import { IGetUserAndProfileByEmail } from './interfaces/get-user-profile-by-email.interface';
import { IAddressCoordinates } from './interfaces/address-coordinates.interface';
import { MapsService } from '../../shared/adapters/maps/maps.service';
import { IGeocode } from '../../shared/adapters/maps/interface/geocode.interface';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private mapsService: MapsService,
  ) {}

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) throw AuthBusinessExceptions.userNotFoundException();

    return user;
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) throw AuthBusinessExceptions.userNotFoundException();

    return user;
  }

  async getUserAndProfileByEmail(
    email: string,
  ): Promise<IGetUserAndProfileByEmail> {
    const userAndProfile =
      await this.userRepository.getUserAndProfileByEmail(email);

    if (!userAndProfile?.profile)
      throw AuthBusinessExceptions.userNotFoundException();

    return userAndProfile;
  }

  async createUser(userData: IUser): Promise<User> {
    const user = await this.userRepository.getUserByEmail(userData.email);

    if (user) throw AuthBusinessExceptions.emailAlreadyRegisteredException();

    return await this.userRepository.create(userData);
  }

  async createArtist(userId: string, address: IAddress): Promise<void> {
    let geocode: IGeocode | null = {
      address: null,
      geometry: { lat: null, lng: null },
    };

    if (process.env.GOOGLE_MAPS_API_KEY) {
      geocode = await this.mapsService.geocode(address);
    }

    const addressCoordinates: IAddressCoordinates = {
      ...address,
      latitude: geocode?.geometry?.lat,
      longitude: geocode?.geometry?.lng,
    };

    await this.userRepository.createArtist(userId, addressCoordinates);
  }

  async confirmUser(email: string): Promise<void> {
    await this.userRepository.update({ email }, { isEmailConfirmed: true });
  }

  async getConfirmedUser(userId: string): Promise<IGetConfirmed> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) throw AuthBusinessExceptions.userNotFoundException();

    return { emailConfirmed: !!user.isEmailConfirmed };
  }
}
