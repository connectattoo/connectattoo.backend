import { Injectable } from '@nestjs/common';
import { IUser } from './interfaces/user.interface';
import { User } from '@prisma/client';
import { AuthBusinessExceptions } from '../auth/exceptions/auth-business.exceptions';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.getUserByEmail(email);
  }

  async createUser(userData: IUser): Promise<User> {
    const user = await this.userRepository.getUserByEmail(userData.email);

    if (user) throw AuthBusinessExceptions.emailAlreadyRegisteredException();

    return await this.userRepository.create(userData);
  }

  async confirmUser(email: string): Promise<void> {
    await this.userRepository.update({ email }, { isEmailConfirmed: true });
  }
}
