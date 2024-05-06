import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { IPagination } from '../interface/pagination.interface';
import { Transform } from 'class-transformer';

export class PaginationDTO implements IPagination {
  @Transform(({ value }) => (value ? parseInt(value) : value), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsPositive()
  limit: number;

  @Transform(({ value }) => (value ? +value : 0), {
    toClassOnly: true,
  })
  @IsOptional()
  @Min(0)
  @IsNumber()
  offset: number;
}
