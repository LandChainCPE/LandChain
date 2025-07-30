package controller

import (
	"net/http"
	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
)
func GetServiceType(c *gin.Context) {
	var serviceTypes []entity.ServiceType
	if err := config.DB().Find(&serviceTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve service types"})
		return
	}
	c.JSON(http.StatusOK, serviceTypes)
}
