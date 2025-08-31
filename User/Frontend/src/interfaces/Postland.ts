export interface PostlandInterface {
  id?: number; 
  firstName: string;  
  lastName: string;   
  phoneNumber: string; 
  name: string;
  image: string;       
  price: number;       
  map: string;     
  
  LandtitleID: number;
  Landtitle: string;
  
  provinceId: number;  
  province: string;   
  
  districtId: number; 
  district: string;    
  
  subdistrictId: number; 
  subdistrict: string;  
  
  tagId: number;       
  tag: string;        
  
  roomchatCount: number;  
  transactionCount: number;  
}
