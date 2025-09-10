export interface SubdistrictInterface {
  id?: number;
  nameTH: string;  // Name in Thai
  nameEN: string;  // Name in English
  districtID: number;  // Foreign Key to District
}
