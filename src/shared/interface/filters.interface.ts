export interface ISearchFilterWithPagination {
  limit: number;
  offset: number;
  sort: 'asc' | 'desc';
  search: string;
}
