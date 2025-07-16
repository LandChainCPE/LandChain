export interface BookingInterface {
  id?: number; // รหัสการจอง
  date_booking: string; // วันที่จอง (YYYY-MM-DD)
  time_id: number; // รหัสช่วงเวลา
  user_id: number; // รหัสผู้จอง
  branch_id: number; // รหัสสาขา
}
