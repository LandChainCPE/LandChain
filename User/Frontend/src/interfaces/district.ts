export interface DistrictInterface {
  id?: number;
  nameTH: string;  // Name in Thai
  nameEN: string;  // Name in English
  provinceID: number;  // Foreign Key to Province
}
