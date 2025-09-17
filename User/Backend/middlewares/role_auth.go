package middlewares

import (
	"landchain/config"
	"landchain/entity"
	"landchain/services"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthorizeAdmin - ตรวจสอบว่าเป็น Admin (role_id = 2) หรือไม่
func AuthorizeAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientToken := c.Request.Header.Get("Authorization")
		if clientToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
			c.Abort()
			return
		}

		// ตัด "Bearer " ออก
		extractedToken := strings.Split(clientToken, "Bearer ")
		if len(extractedToken) != 2 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
			c.Abort()
			return
		}

		clientToken = strings.TrimSpace(extractedToken[1])

		// ตรวจสอบ Token
		jwtWrapper := services.JwtWrapper{
			SecretKey: os.Getenv("JWT_SECRET"),
			Issuer:    os.Getenv("JWT_ISSUER"),
		}

		claims, err := jwtWrapper.ValidateToken(clientToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// ดึงข้อมูล User จาก Database
		db := config.DB()
		var user entity.Users
		if err := db.Preload("Role").Where("metamaskaddress = ?", claims.Wallet).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// ตรวจสอบว่าเป็น Admin (role_id = 2) หรือไม่
		if user.RoleID != 2 {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Admin role required"})
			c.Abort()
			return
		}

		// ส่งข้อมูล User ไปยัง Context
		c.Set("user", user)
		c.Set("userID", user.ID)
		c.Set("walletAddress", user.Metamaskaddress)
		c.Set("roleID", user.RoleID)
		c.Next()
	}
}

// AuthorizeUser - ตรวจสอบว่าเป็น User (role_id = 1) หรือไม่
func AuthorizeUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientToken := c.Request.Header.Get("Authorization")
		if clientToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
			c.Abort()
			return
		}

		// ตัด "Bearer " ออก
		extractedToken := strings.Split(clientToken, "Bearer ")
		if len(extractedToken) != 2 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
			c.Abort()
			return
		}

		clientToken = strings.TrimSpace(extractedToken[1])

		// ตรวจสอบ Token
		jwtWrapper := services.JwtWrapper{
			SecretKey: os.Getenv("JWT_SECRET"),
			Issuer:    os.Getenv("JWT_ISSUER"),
		}

		claims, err := jwtWrapper.ValidateToken(clientToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// ดึงข้อมูล User จาก Database
		db := config.DB()
		var user entity.Users
		if err := db.Preload("Role").Where("metamaskaddress = ?", claims.Wallet).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// ตรวจสอบว่าเป็น User (role_id = 1) หรือไม่
		if user.RoleID != 1 {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: User role required"})
			c.Abort()
			return
		}

		// ส่งข้อมูล User ไปยัง Context
		c.Set("user", user)
		c.Set("userID", user.ID)
		c.Set("walletAddress", user.Metamaskaddress)
		c.Set("roleID", user.RoleID)
		c.Next()
	}
}
