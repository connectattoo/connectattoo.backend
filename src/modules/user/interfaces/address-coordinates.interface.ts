import { Nullable } from '../../../shared/interface/nullable.type';
import { IAddress } from './address.interface';

export interface IAddressCoordinates extends IAddress {
  latitude: Nullable<number>;
  longitude: Nullable<number>;
}
