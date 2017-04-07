export type TShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface TShirt {
  id: number;
  name: string;
  design?: string;
  size: TShirtSize;
}

export type SortType = 'asc' | 'desc';
