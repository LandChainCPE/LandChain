package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"landchain/services"

	"github.com/gin-gonic/gin"
)

func Authorizes() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Printf("🚀 Authorizes: Middleware called for path: %s\n", c.FullPath())

		clientToken := c.Request.Header.Get("Authorization")
		if clientToken == "" {
			fmt.Println("❌ Authorizes: No Authorization header provided")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
			return
		}

		// ✅ ดึง Bearer token ออกมา
		extractedToken := strings.Split(clientToken, "Bearer ")
		if len(extractedToken) != 2 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
			return
		}
		clientToken = strings.TrimSpace(extractedToken[1])

		// ✅ ใช้ JwtWrapper validate
		jwtWrapper := services.JwtWrapper{
			SecretKey:       os.Getenv("JWT_SECRET"),
			Issuer:          os.Getenv("JWT_ISSUER"),
			ExpirationHours: 1,
		}

		claims, err := jwtWrapper.ValidateToken(clientToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		if claims == nil || claims.Wallet == "" {  // บรรทัดนนี้นั้น claims คือ object ที่ได้จากการถอด JWT (decode/validate) ซึ่งจะมีโครงสร้างเป็น JwtWrapper ประกอบด้วย SecretKey Issuer ExpirationHours สามาถใช้ . อ่านค่าได้เลย
			fmt.Printf("❌ Authorizes: Invalid token claims - claims: %+v\n", claims)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}
		fmt.Printf("🔑 JWT Claims Wallet: %s\n", claims.Wallet)
		// ✅ เก็บ wallet ลง context
		c.Set("wallet", claims.Wallet)

		fmt.Println("✅ Token validated for wallet:", claims.Wallet)
		c.Next()
	}
}




// ประมาณว่า ผู้ใช้ส่ง Request มาแล้ว ที่ Authorizes จะถูก c.Set   wallet
// แล้ว Controller นะัั้เนจะ ใช้ c.Get อีกที เพื่อดึงค่า walletid ของRequest นั้น  แสดงว่า ค่าที่ c.Set("wallet", claims.Wallet) มันก็ตะถูกเปลี่ยนไปเรื่อยๆ ตามที่ User ส่งมาสิ


// ค่าที่ c.Set("wallet", claims.Wallet) จะถูกเปลี่ยนไปตามแต่ละ request ของผู้ใช้แต่ละคน

// ทุก request ใหม่ (แต่ละรอบที่ user ส่งมา) จะมี context ใหม่ของตัวเอง
// middleware Authorizes จะ decode JWT ของ request นั้น แล้ว set wallet address เฉพาะของ request นั้นลง context
// controller ใช้ c.Get("wallet") เพื่อดึง wallet address ของ request นั้นๆ



