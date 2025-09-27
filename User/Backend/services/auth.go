package services

import (
	"errors"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

type JwtWrapper struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

type JwtClaim struct {
	Wallet string `json:"wallet"`
	jwt.StandardClaims
}

func (j *JwtWrapper) GenerateToken(wallet string) (signedToken string, err error) {
	// สร้าง claims (ข้อมูลที่จะฝังใน token) โดยใส่ wallet, วันหมดอายุ, issuer
	claims := &JwtClaim{
		Wallet: wallet,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(j.ExpirationHours)).Unix(), // วันหมดอายุ
			Issuer:    j.Issuer,                                                                    // ผู้สร้าง token
		},
	}

	// สร้าง JWT token โดยใช้ HS256 และฝัง claims ที่สร้างไว้
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// เซ็น token ด้วย SecretKey เพื่อป้องกันการปลอมแปลง
	signedToken, err = token.SignedString([]byte(j.SecretKey))
	if err != nil {
		return // ถ้าเซ็นไม่สำเร็จ ส่ง error กลับ
	}

	return // คืนค่า signedToken (JWT ที่เซ็นแล้ว) และ nil error
}

func (j *JwtWrapper) ValidateToken(signedToken string) (claims *JwtClaim, err error) {
	// เรียก jwt.ParseWithClaims เพื่อถอดรหัส token และ map claims
	token, err := jwt.ParseWithClaims(
		signedToken, // JWT ที่รับเข้ามา
		&JwtClaim{}, // struct ที่จะ map ข้อมูล claims
		func(token *jwt.Token) (interface{}, error) {
			// ตรวจสอบว่าใช้ HMAC (HS256) ในการ sign หรือไม่
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("Unexpected signing method")
			}
			// คืนค่า secret key สำหรับตรวจสอบลายเซ็น
			return []byte(j.SecretKey), nil // ถ้า token ถูก "เซ็น" (sign) มาจากระบบที่ใช้ SecretKey เดียวกันนี้จริง การตรวจสอบจะผ่าน (token ถูกต้อง)
		},
	)

	if err != nil {
		// ถ้า decode หรือ verify ไม่ผ่าน ส่ง error กลับ
		return
	}

	// แปลง claims ที่ได้จาก token เป็น *JwtClaim
	claims, ok := token.Claims.(*JwtClaim) // มันได้ได้ออกมาเป็นตัวโครงสร้าง struct *JwtClaim ที่เรากำหนดเอง
	if !ok {
		// ถ้าแปลงไม่ได้ ส่ง error กลับ
		err = errors.New("Couldn't parse claims")
		return
	}

	// ตรวจสอบวันหมดอายุ (exp) ของ token
	if claims.ExpiresAt < time.Now().Local().Unix() {
		err = errors.New("JWT is expired")
		return
	}

	// คืนค่า claims และ nil error ถ้าทุกอย่างถูกต้อง
	return
}
