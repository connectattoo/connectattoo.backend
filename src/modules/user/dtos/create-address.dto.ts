import { IsAlpha, IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';
import { IAddress } from '../interfaces/address.interface';

export class CreateAddressDto implements IAddress {
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  street: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  city: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  state: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  zipCode: string;
}
