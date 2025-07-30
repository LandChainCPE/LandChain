package controller

import (
	"net/http"
	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
)

// ✅ ดึงรายการ State ทั้งหมด  r.GET("/states", controller.GetAllStates)
func GetAllStates(c *gin.Context) {
	var states []entity.State
	if err := config.DB().Find(&states).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, states)
}

// ✅ สร้าง State ใหม่  r.POST("/states", controller.CreateState)
func CreateState(c *gin.Context) {
	var input entity.State
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB().Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}
