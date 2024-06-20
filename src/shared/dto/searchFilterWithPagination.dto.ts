import { IsOptional } from 'class-validator';
import { ISearchFilterWithPagination } from '../interface/filters.interface';
import { PaginationDTO } from './pagination.dto';

export class SearchFilterWithPaginationDTO
  extends PaginationDTO
  implements ISearchFilterWithPagination
{
  @IsOptional()
  search: string;
}
