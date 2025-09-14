export interface LandtitleInterface {
  ID?: number;
  TokenID?: number;
  IsLocked?: boolean;

  SurveyNumber?: string;
  LandNumber?: string;
  SurveyPage?: string;
  Number?: string;

  TitleDeedNumber?: string;
  Volume?: string;
  Page?: string;

  Rai?: number;
  Ngan?: number;
  SquareWa?: number;

  Status?: string;

  GeographyID?: number;
  ProvinceID?: number;
  DistrictID?: number;
  SubdistrictID?: number;
  LandVerificationID?: number;
  UserID?: number;

  // Optional nested objects (can be expanded as needed)
  Geography?: any;
  Province?: any;
  District?: any;
  Subdistrict?: any;
  LandVerification?: any;
  User?: any;

  Landsalepost?: any[];
  Transaction?: any[];
  RequestBuySell?: any[];
}