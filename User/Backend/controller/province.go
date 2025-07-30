package controller

import (
	"net/http"

	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
)
func GetProvince(c *gin.Context) {
	var province []entity.Province
	if err := config.DB().Find(&province).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve bookings"})
		return
	}
	c.JSON(http.StatusOK, province)
}

