export interface MonthlyAnalyticsDto {
  month: string;
  currency: string;
  outOfPocket: number;
  credit: number;
  income: number;
  internal: number;
  net: number;
  counts: AnalyticsCountsDto;
}

export interface AnalyticsCountsDto {
  outOfPocket: number;
  credit: number;
  income: number;
  internal: number;
}
