package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetDataUserVerification ดึงข้อมูล user_verification ของผู้ใช้จาก JWT
func GetDataUserVerification(c *gin.Context) {
	userid := c.Param("userid")
	if userid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userid is required"})
		return
	}

	db := config.DB()

	var user entity.Users
	if err := db.Where("id = ?", userid).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	if user.UserVerificationID == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user_verification not linked to user"})
		return
	}

	var userVerification entity.UserVerification
	if err := db.Where("id = ?", user.UserVerificationID).First(&userVerification).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user_verification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"wallet":    userVerification.Wallet,
		"signature": userVerification.Signature,
		"nameHash":  userVerification.NameHashSalt,
	})
}
