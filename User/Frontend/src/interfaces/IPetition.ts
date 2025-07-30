export interface PetitionInterface {
  ID?: number;              // Primary Key
  FirstName: string;
  LastName: string;
  Tel: string;
  Email: string;
  Description: string;
  Date: string;             // YYYY-MM-DD
  Topic: string;

  StateID: number;          // FK
  UserID: number;           // FK
}
