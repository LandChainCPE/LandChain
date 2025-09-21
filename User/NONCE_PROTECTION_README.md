# Nonce Protection System - การป้องกัน Replay Attack

## ภาพรวมระบบ

ระบบนี้ใช้ nonce (number used once) เพื่อป้องกัน replay attack ในการ login ด้วย MetaMask

## Flow การทำงาน

### 1. **ฝั่ง Frontend (React/TypeScript)**

1. ผู้ใช้เชื่อมต่อ MetaMask
2. ขอ nonce จาก backend (`GET /nonce/:address`)
3. ให้ผู้ใช้ sign nonce ด้วย MetaMask (`personal_sign`)
4. ส่ง address, nonce, และ signature ไป backend (`POST /login`)

### 2. **ฝั่ง Backend (Go)**

1. สร้าง nonce สุ่มและเก็บไว้ใน memory (ผูกกับ address)
2. ตรวจสอบ nonce ว่าถูกต้องและยังไม่ถูกใช้
3. ตรวจสอบ signature ว่า address เป็นเจ้าของจริง
4. ถ้าถูกต้องทั้งหมด ให้ login และลบ nonce (consume)

## ไฟล์ที่เกี่ยวข้อง

### Backend
- `controller/nonce.go` - API สำหรับจัดการ nonce
- `controller/login.go` - ปรับปรุงให้ใช้ nonce verification
- `entity/nonce.go` - struct สำหรับเก็บ nonce ในฐานข้อมูล (สำหรับอนาคต)

### Frontend
- `service/https/nonceService.ts` - service สำหรับ API calls
- `pages/LoginRegister/LoginMetamask.tsx` - หน้า login ที่ใช้ nonce
- `vite-env.d.ts` - types สำหรับ MetaMask

## API Endpoints

### GET /nonce/:address
- **คำอธิบาย**: ขอ nonce สำหรับ address
- **Response**: `{ "nonce": "abc123..." }`

### POST /login
- **Body**: 
  ```json
  {
    "address": "0x123...",
    "nonce": "abc123...",
    "signature": "0x456..."
  }
  ```
- **Response**: JWT token และข้อมูลผู้ใช้

## ความปลอดภัย

1. **Nonce Uniqueness**: แต่ละ nonce ใช้ได้แค่ครั้งเดียว
2. **Signature Verification**: ตรวจสอบว่า signature มาจาก address ที่ถูกต้อง
3. **Time-based Expiry**: nonce หมดอายุหลังจากเวลาที่กำหนด (อนาคต)

## การทดสอบ

### Postman Testing
1. **ขอ nonce**: `GET http://10.1.63.218:8080/nonce/0x123...`
2. **Login**: `POST http://10.1.63.218:8080/login` พร้อม body ที่ต้องการ

### Browser Testing
1. เปิดหน้า login
2. เชื่อมต่อ MetaMask
3. ระบบจะขอ sign message อัตโนมัติ
4. ถ้าสำเร็จจะ redirect ไปหน้า user

## ข้อควรระวัง

1. **Nonce Storage**: ปัจจุบันใช้ in-memory storage ถ้า server restart nonce จะหายหมด
2. **Production**: ควรใช้ Redis หรือฐานข้อมูลสำหรับ production
3. **HTTPS**: ควรใช้ HTTPS ใน production เพื่อป้องกันการดักจับ
4. **Rate Limiting**: ควรจำกัดการขอ nonce เพื่อป้องกัน DoS

## การปรับปรุงในอนาคต

1. ใช้ entity/nonce.go เพื่อเก็บ nonce ในฐานข้อมูล
2. เพิ่ม expiry time สำหรับ nonce
3. เพิ่ม rate limiting
4. เพิ่ม logging และ monitoring
