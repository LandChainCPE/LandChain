// ===== INTERFACE DEFINITIONS =====

export interface PhotoItem {
  id?: number;
  path: string;
  isNew: boolean;
  file?: File;
}

export interface LocationItem {
  id?: number;
  sequence: number;
  latitude: number;
  longitude: number;
  landsalepost_id?: number;
}

export interface Province {
  id: number;
  name_th: string;
}

export interface District {
  id: number;
  name_th: string;
}

export interface Subdistrict {
  id: number;
  name_th: string;
}

export interface Landtitle {
  id: number;
  name: string;
  rai?: number;
  ngan?: number;
  square_wa?: number;
  title_deed_number?: string;
}

export interface Users {
  id: number;
  username: string;
}

export interface Photoland {
  id: number;
  path: string;
  landsalepost_id: number;
  ID?: number;
  Path?: string;
  LandsalepostID?: number;
}

export interface TagEntity {
  [x: string]: string;
  name: any;
  tag: string;
}

export interface LandSalePost {
  [x: string]: any;
  ID?: number;
  id?: number;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  name?: string;
  price?: number | null;
  province_id?: number;
  province?: Province;
  district_id?: number;
  district?: District;
  subdistrict_id?: number;
  subdistrict?: Subdistrict;
  land_id?: number;
  landtitle?: Landtitle;
  user_id?: number;
  users?: Users;
  photoland?: Photoland[];
  Photoland?: Photoland[];
  tags?: TagEntity[];
  location?: LocationItem[];
}

// ===== CONSTANTS =====
export const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9oYXJ0MjU0NiIsImEiOiJjbWVmZ3YzMGcwcTByMm1zOWRkdjJkNTd0In0.DBDjy1rBDmc8A4PN3haQ4A';
export const DEFAULT_CENTER: [number, number] = [100.5018, 13.7563];
export const DEFAULT_ZOOM = 12;

// ===== COORDINATE MAPPINGS =====
export const DETAILED_COORDINATES: Record<string, Record<string, Record<string, [number, number]>>> = {
  "กรุงเทพมหานคร": {
    "เขตบางรัก": {
      "แขวงสี่พระยา": [100.5141, 13.7221],
      "แขวงมหาพฤฒาราม": [100.5089, 13.7185],
      "แขวงบางรัก": [100.5167, 13.7251]
    },
    "เขตสาทร": {
      "แขวงสีลม": [100.5330, 13.7278],
      "แขวงสุริยวงศ์": [100.5289, 13.7245]
    }
  },
  "เชียงใหม่": {
    "อำเภอเมืองเชียงใหม่": {
      "ตำบลศรีภูมิ": [98.9817, 18.7875],
      "ตำบลพระสิงห์": [98.9853, 18.7874],
      "ตำบลช่างคลาน": [98.9956, 18.7789]
    },
    "อำเภอแม่ริม": {
      "ตำบลแม่ริม": [98.9289, 18.8756],
      "ตำบลสันโป่ง": [98.9156, 18.8634]
    }
  },
  "ขอนแก่น": {
    "อำเภอเมืองขอนแก่น": {
      "ตำบลในเมือง": [102.8431, 16.4322],
      "ตำบลศิลา": [102.8567, 16.4289]
    }
  },
  "ชลบุรี": {
    "อำเภอเมืองชลบุรี": {
      "ตำบลเสม็ด": [100.9847, 13.3611],
      "ตำบลบ้านสวน": [100.9734, 13.3756]
    },
    "อำเภอพัทยา": {
      "ตำบลหนองปรือ": [100.8767, 12.9234]
    }
  },
  "ภูเก็ต": {
    "อำเภอเมืองภูเก็ต": {
      "ตำบลตลาดใหญ่": [98.3923, 7.8804],
      "ตำบลรัษฎา": [98.3756, 7.8934]
    }
  }
};

export const PROVINCE_COORDINATES: Record<string, [number, number]> = {
  "กรุงเทพมหานคร": [100.5018, 13.7563],
  "นครราชสีมา": [102.0977, 14.9799],
  "เชียงใหม่": [98.9853, 18.7061],
  "ภูเก็ต": [98.3923, 7.8804],
  "ขอนแก่น": [102.8431, 16.4322],
  "ชลบุรี": [100.9847, 13.3611],
  "อุบลราชธานี": [104.8472, 15.2286],
  "ปราจีนบุรี": [101.3687, 14.0508],
  "สุราษฎร์ธานี": [99.3210, 9.1382],
  "สงขลา": [100.6087, 7.2056],
};