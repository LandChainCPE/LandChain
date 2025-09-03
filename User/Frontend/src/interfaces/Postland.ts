export interface PostlandInterface {
  ID?: number; 
  FirstName: string;  
  LastName: string;   
  PhoneNumber: string; 
  Name: string;
  Image: string;        // backend รอ string (เช่น URL หรือ filename)
  Price: number;       
  
  LandtitleID: number;
  
  ProvinceID: number;  
  DistrictID: number; 
  SubdistrictID: number;  // 👈 เปลี่ยนชื่อให้ตรงกับ Go
  
  TagID: number;        // 👈 แก้เป็น number แทน string
  
  UserID: number;
}

// import type { ProvinceInterface } from "./Province";
// import type { DistrictInterface } from "./district";
// import type { SubdistrictInterface } from "./subdistrict";
// import type { TagInterface } from "./Tag";


// export interface PostlandInterface {
//   ID?: number; 
//   FirstName: string;  
//   LastName: string;   
//   PhoneNumber: string; 
//   Name: string;
//   Image: File;     
//   Price: number;       
//   //map: string;     
  
//   LandtitleID: number;
//   Landtitle: string;
  
//   ProvinceID: number;  
//   province: ProvinceInterface;   
  
//   DistrictID: number; 
//   district: DistrictInterface;    
  
//   SubdistrictId: number; 
//   subdistrict: SubdistrictInterface;  
  
//   TagId: number;       
//   tag: TagInterface;        
  

// }
