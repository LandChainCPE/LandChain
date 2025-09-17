import type { LandtitleInterface } from "./Landtitle";

export interface PostlandInterface {
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Name: string;
  Image: string;
  Price: number;
  LandtitleID: number; 
  ProvinceID: number;
  DistrictID: number;
  SubdistrictID: number;
  TagID: number;
  UserID: number;

  // เพิ่มข้อมูลโฉนดที่ดินที่ดึงมาจาก backend
  Landtitle?: LandtitleInterface;
}