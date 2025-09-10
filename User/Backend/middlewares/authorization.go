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
		clientToken := c.Request.Header.Get("Authorization")
		if clientToken == "" {
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

		if claims == nil || claims.Wallet == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}
		fmt.Println("🔑 JWT Claims Wallet:", claims.Wallet)
		// ✅ เก็บ wallet ลง context
		c.Set("wallet", claims.Wallet)

		fmt.Println("✅ Token validated for wallet:", claims.Wallet)
		c.Next()
	}
}
