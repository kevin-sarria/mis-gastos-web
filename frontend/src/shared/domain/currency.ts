export interface Currency {
  code: string;
  name: string;
  symbol: string;
  minorUnits: number;
  isActive: boolean;
  isDefault: boolean;
}
