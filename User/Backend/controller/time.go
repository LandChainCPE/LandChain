package controller

import (
	"net/http"

	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
)
func GetTime(c *gin.Context) {
	var time []entity.Time
	if err := config.DB().Find(&time).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve time slots"})
		return
	}
	c.JSON(http.StatusOK, time)
}

