package controller

import (
	"net/http"

	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
)
func GetBranch(c *gin.Context) {
	var branch []entity.Branch
	if err := config.DB().Find(&branch).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve bookings"})
		return
	}
	c.JSON(http.StatusOK, branch)
}

