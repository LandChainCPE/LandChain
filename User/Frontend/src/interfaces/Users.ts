export interface UsersInterface {
  id?: number;
  name: string; // ชื่อผู้ใช้
  email?: string; // อีเมล (option)
  phone?: string; // เบอร์โทร
  password: string; // รหัสผ่าน
  land?: string; // ข้อมูลที่ดิน
  role_id: number; // FK -> Role
  wallet_address?: string; // สำหรับ Blockchain
  public_key?: string;
  status?: string; // active/inactive
}
