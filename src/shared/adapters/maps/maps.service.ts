import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Client,
  DistanceMatrixRequest,
  GeocodeRequest,
  Status,
  TravelMode,
  UnitSystem,
} from '@googlemaps/google-maps-services-js';
import { IDistanceMatrix } from './interface/distance-matrix.interface';
import { IAddress } from '../../../modules/user/interfaces/address.interface';

@Injectable()
export class MapsService {
  constructor(private mapsClient: Client) {}

  async geocode(address: IAddress) {
    const parsedAddress = `${address.street}, ${address.number} - ${address.city} - ${address.state}, ${address.zipCode}, ${address.country}`;

    const geo = await this.mapsClient.geocode({
      params: {
        address: parsedAddress,
      },
    } as GeocodeRequest);

    const statusObject = {
      [Status.ZERO_RESULTS]: new BadRequestException('Invalid address'),

      [Status.NOT_FOUND]: new BadRequestException('Invalid address'),

      [Status.OK]: {
        address: geo.data.results[0].formatted_address,
        geometry: geo.data.results[0].geometry.location,
      },
    };

    const statusObjectValue = statusObject[geo.data.status];
    if (statusObjectValue) {
      if (statusObjectValue instanceof BadRequestException)
        throw statusObjectValue;

      return statusObjectValue;
    }

    return {
      address: null,
      geometry: { lat: null, lng: null },
    };
  }

  async distanceMatrix({ origin, destination }: IDistanceMatrix) {
    const distance = await this.mapsClient.distancematrix({
      params: {
        origins: [
          {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
        ],
        destinations: [
          {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        ],
        units: UnitSystem.metric,
        mode: TravelMode.driving,
      },
    } as DistanceMatrixRequest);

    return {
      distance: distance.data.rows[0].elements[0].distance,
      duration: distance.data.rows[0].elements[0].duration,
    };
  }
}
