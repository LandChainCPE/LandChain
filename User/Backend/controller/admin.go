package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"

	"github.com/gin-gonic/gin"
	// ถ้ายังไม่ได้ใช้ godotenv ให้ import ด้วย
	// "github.com/joho/godotenv"
)

func GetCountDataDashboardOnchain(c *gin.Context) {
	db := config.DB()

	// นับจำนวน Users ที่มี Status_verify = true
	var verifiedUsersCount int64
	if err := db.Model(&entity.Users{}).Where("status_verify = ?", true).Count(&verifiedUsersCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to count verified users",
		})
		return
	}

	// นับจำนวน Landtitle ที่มี Status_verify = true
	var verifiedLandtitlesCount int64
	if err := db.Model(&entity.Landtitle{}).Where("status_verify = ?", true).Count(&verifiedLandtitlesCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to count verified landtitles",
		})
		return
	}

	// นับจำนวน UserVerification ที่มี Status_onchain = true
	var userVerificationOnchainCount int64
	if err := db.Model(&entity.UserVerification{}).Where("status_onchain = ?", true).Count(&userVerificationOnchainCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to count user verifications on chain",
		})
		return
	}

	// นับจำนวน LandVerification ที่มี Status_onchain = true
	var landVerificationOnchainCount int64
	if err := db.Model(&entity.LandVerification{}).Where("status_onchain = ?", true).Count(&landVerificationOnchainCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to count land verifications on chain",
		})
		return
	}

	// สร้าง result สำหรับส่งออก
	result := gin.H{
		"verified_users_count":            verifiedUsersCount,
		"verified_landtitles_count":       verifiedLandtitlesCount,
		"user_verification_onchain_count": userVerificationOnchainCount,
		"land_verification_onchain_count": landVerificationOnchainCount,
	}

	c.JSON(http.StatusOK, result)
}
