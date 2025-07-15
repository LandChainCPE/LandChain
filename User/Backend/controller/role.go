package controller

import (
	// "errors" // เพิ่ม import สำหรับ package errors
	// "fmt"
	"net/http"
	// "os"


	"backend/config"
	"backend/entity"
	"github.com/gin-gonic/gin"
	// "gorm.io/gorm" // เพิ่ม import สำหรับ gorm
)

func CreateRole(c *gin.Context) {
	var input entity.Role
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Role == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "role name is required"})
		return
	}

	if err := config.DB().Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}