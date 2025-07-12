package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"backend/config"
	"backend/entity"
)

func GetAllNames(c *gin.Context) {
	var names []entity.Name
	if err := config.DB().Find(&names).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, names)
}