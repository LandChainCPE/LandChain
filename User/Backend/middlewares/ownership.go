package middlewares

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"landchain/config"
	"landchain/entity"

	"github.com/gin-gonic/gin"
)

// CheckOwnership ตรวจสอบว่า user ที่ login เป็นเจ้าของข้อมูลที่ขอหรือไม่
func CheckOwnership() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง wallet จาก JWT token (จาก Authorizes middleware)
		currentWallet, exists := c.Get("wallet")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
			return
		}

		db := config.DB()

		// หา User ID ของคนที่ login อยู่
		var currentUser entity.Users
		if err := db.Where("metamaskaddress = ?", currentWallet).First(&currentUser).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		// ดึง ID ที่ขอจากหลายแหล่ง
		var requestedUserID string

		// 1. ลองดึงจาก URL parameters
		if id := c.Param("id"); id != "" {
			requestedUserID = id
		} else if userID := c.Param("userID"); userID != "" {
			requestedUserID = userID
		} else if userid := c.Param("userid"); userid != "" {
			requestedUserID = userid
		} else {
			// 2. ลองดึงจาก Query parameters
			if id := c.Query("id"); id != "" {
				requestedUserID = id
			} else if userID := c.Query("userID"); userID != "" {
				requestedUserID = userID
			} else if userid := c.Query("userid"); userid != "" {
				requestedUserID = userid
			} else if userID := c.Query("user_id"); userID != "" {
				requestedUserID = userID
			} else {
				// 3. ลองดึงจาก Request Body (สำหรับ POST/PUT requests)
				if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
					// อ่าน body
					bodyBytes, err := io.ReadAll(c.Request.Body)
					if err == nil && len(bodyBytes) > 0 {
						// กู้คืน body เพื่อให้ controller ใช้ได้
						c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

						// Parse JSON
						var requestBody map[string]interface{}
						if err := json.Unmarshal(bodyBytes, &requestBody); err == nil {
							// ลองหาจาก field ต่างๆ ใน JSON
							if userID, ok := requestBody["user_id"]; ok {
								if userIDStr, ok := userID.(string); ok {
									requestedUserID = userIDStr
								} else if userIDFloat, ok := userID.(float64); ok {
									requestedUserID = strconv.Itoa(int(userIDFloat))
								}
							} else if userID, ok := requestBody["userID"]; ok {
								if userIDStr, ok := userID.(string); ok {
									requestedUserID = userIDStr
								} else if userIDFloat, ok := userID.(float64); ok {
									requestedUserID = strconv.Itoa(int(userIDFloat))
								}
							} else if userID, ok := requestBody["userId"]; ok {
								if userIDStr, ok := userID.(string); ok {
									requestedUserID = userIDStr
								} else if userIDFloat, ok := userID.(float64); ok {
									requestedUserID = strconv.Itoa(int(userIDFloat))
								}
							} else if id, ok := requestBody["id"]; ok {
								if idStr, ok := id.(string); ok {
									requestedUserID = idStr
								} else if idFloat, ok := id.(float64); ok {
									requestedUserID = strconv.Itoa(int(idFloat))
								}
							}
						}
					}
				}
			}
		}

		// ถ้าไม่มี user ID = เป็น endpoint ที่ไม่ต้องเช็ค ownership
		if requestedUserID == "" {
			c.Next()
			return
		}

		// แปลง string เป็น int เพื่อเปรียบเทียบ
		requestedID, err := strconv.Atoi(requestedUserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		// เช็คว่า ID ที่ขอ = ID ของตัวเอง หรือไม่
		if int(currentUser.ID) != requestedID {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied: You can only access your own data"})
			return
		}

		// เก็บ current user ไว้ใน context สำหรับใช้ใน controller
		c.Set("currentUser", currentUser)

		// ✅ ผ่านการตรวจสอบแล้ว ให้ดำเนินการต่อ
		c.Next()
	}
}








// CheckTokenOwnership ตรวจสอบข้อมูลของตัวเอง โดยใช้ JWT token โดยตรง
// ใช้สำหรับ endpoint ที่ดึงข้อมูลจาก wallet ใน JWT token
func CheckTokenOwnership() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง wallet จาก JWT token (จาก Authorizes middleware)
		currentWallet, exists := c.Get("wallet")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
			return
		}

		db := config.DB()

		// หา User ID ของคนที่ login อยู่
		var currentUser entity.Users
		if err := db.Where("metamaskaddress = ?", currentWallet).First(&currentUser).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		// เก็บ current user ไว้ใน context สำหรับใช้ใน controller
		c.Set("currentUser", currentUser)
		c.Set("currentUserID", int(currentUser.ID))

		// ✅ ผ่านการตรวจสอบแล้ว ให้ดำเนินการต่อ
		c.Next()
	}
}




// CheckAdminRole ตรวจสอบว่า user เป็น admin หรือไม่
func CheckAdminRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Printf("🚀 CheckAdminRole: Middleware called for path: %s\n", c.FullPath())

		// ดึง wallet จาก JWT token
		currentWallet, exists := c.Get("wallet")
		if !exists {
			fmt.Println("❌ CheckAdminRole: Wallet not found in token")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
			return
		}

		fmt.Printf("🔍 CheckAdminRole: Checking admin role for wallet: %v\n", currentWallet)

		db := config.DB()

		// หา User และ Role ของคนที่ login อยู่
		var currentUser entity.Users
		if err := db.Preload("Role").Where("metamaskaddress = ?", currentWallet).First(&currentUser).Error; err != nil {
			fmt.Printf("❌ CheckAdminRole: User not found for wallet: %v, error: %v\n", currentWallet, err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		fmt.Printf("👤 CheckAdminRole: Found user ID: %d, RoleID: %d\n", currentUser.ID, currentUser.RoleID)

		// 🎯 เช็ค RoleID โดยตรง (Admin = 2)
		if currentUser.RoleID != 2 {
			fmt.Printf("❌ CheckAdminRole: Access denied. User RoleID is %d, required 2 (Admin)\n", currentUser.RoleID)
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":            "Access denied: Admin role required",
				"current_role_id":  currentUser.RoleID,
				"required_role_id": 2,
			})
			return
		}

		// เช็คเพิ่มเติมว่า Role ถูก preload หรือไม่ (สำหรับ debug)
		if currentUser.Role.ID == 0 {
			fmt.Printf("⚠️ CheckAdminRole: Role not preloaded, but RoleID %d is valid Admin\n", currentUser.RoleID)
		} else {
			fmt.Printf("🔑 CheckAdminRole: User role: '%s' (Role ID: %d)\n", currentUser.Role.Role, currentUser.Role.ID)
		}

		fmt.Printf("✅ CheckAdminRole: Admin access granted for user ID: %d (RoleID: %d)\n", currentUser.ID, currentUser.RoleID) // เก็บ current user ไว้ใน context
		c.Set("currentUser", currentUser)
		c.Set("isAdmin", true)

		// ✅ ผ่านการตรวจสอบแล้ว
		c.Next()
	}
}

// CheckOwnershipOrAdmin ตรวจสอบว่า user เป็นเจ้าของข้อมูลหรือเป็น admin
func CheckOwnershipOrAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง wallet จาก JWT token
		currentWallet, exists := c.Get("wallet")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
			return
		}

		db := config.DB()

		// หา User และ Role ของคนที่ login อยู่
		var currentUser entity.Users
		if err := db.Preload("Role").Where("metamaskaddress = ?", currentWallet).First(&currentUser).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		// ถ้าเป็น admin ให้ผ่านเลย (เช็ค RoleID โดยตรง)
		if currentUser.RoleID == 2 {
			fmt.Printf("✅ CheckOwnershipOrAdmin: Admin access granted for user ID: %d (RoleID: %d)\n", currentUser.ID, currentUser.RoleID)
			c.Set("currentUser", currentUser)
			c.Set("isAdmin", true)
			c.Next()
			return
		}

		// ถ้าไม่ใช่ admin ให้ใช้ logic เดิมของ CheckOwnership
		// ดึง ID ที่ขอจากหลายแหล่ง
		var requestedUserID string

		// 1. ลองดึงจาก URL parameters
		if id := c.Param("id"); id != "" {
			requestedUserID = id
		} else if userID := c.Param("userID"); userID != "" {
			requestedUserID = userID
		} else if userid := c.Param("userid"); userid != "" {
			requestedUserID = userid
		} else {
			// 2. ลองดึงจาก Query parameters
			if id := c.Query("id"); id != "" {
				requestedUserID = id
			} else if userID := c.Query("userID"); userID != "" {
				requestedUserID = userID
			} else if userid := c.Query("userid"); userid != "" {
				requestedUserID = userid
			} else if userID := c.Query("user_id"); userID != "" {
				requestedUserID = userID
			} else {
				// 3. ลองดึงจาก Request Body (สำหรับ POST/PUT requests)
				if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
					// อ่าน body
					bodyBytes, err := io.ReadAll(c.Request.Body)
					if err == nil && len(bodyBytes) > 0 {
						// กู้คืน body เพื่อให้ controller ใช้ได้
						c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

						// Parse JSON
						var requestBody map[string]interface{}
						if err := json.Unmarshal(bodyBytes, &requestBody); err == nil {
							// ลองหาจาก field ต่างๆ ใน JSON
							if userID, ok := requestBody["user_id"]; ok {
								if userIDStr, ok := userID.(string); ok {
									requestedUserID = userIDStr
								} else if userIDFloat, ok := userID.(float64); ok {
									requestedUserID = strconv.Itoa(int(userIDFloat))
								}
							} else if userID, ok := requestBody["userID"]; ok {
								if userIDStr, ok := userID.(string); ok {
									requestedUserID = userIDStr
								} else if userIDFloat, ok := userID.(float64); ok {
									requestedUserID = strconv.Itoa(int(userIDFloat))
								}
							} else if userID, ok := requestBody["userId"]; ok {
								if userIDStr, ok := userID.(string); ok {
									requestedUserID = userIDStr
								} else if userIDFloat, ok := userID.(float64); ok {
									requestedUserID = strconv.Itoa(int(userIDFloat))
								}
							} else if id, ok := requestBody["id"]; ok {
								if idStr, ok := id.(string); ok {
									requestedUserID = idStr
								} else if idFloat, ok := id.(float64); ok {
									requestedUserID = strconv.Itoa(int(idFloat))
								}
							}
						}
					}
				}
			}
		}

		// ถ้าไม่มี user ID = เป็น endpoint ที่ไม่ต้องเช็ค ownership
		if requestedUserID == "" {
			c.Set("currentUser", currentUser)
			c.Set("isAdmin", false)
			c.Next()
			return
		}

		// แปลง string เป็น int เพื่อเปรียบเทียบ
		requestedID, err := strconv.Atoi(requestedUserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		// เช็คว่า ID ที่ขอ = ID ของตัวเอง หรือไม่
		if int(currentUser.ID) != requestedID {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied: You can only access your own data"})
			return
		}

		// เก็บ current user ไว้ใน context
		c.Set("currentUser", currentUser)
		c.Set("isAdmin", false)

		// ✅ ผ่านการตรวจสอบแล้ว
		c.Next()
	}
}
