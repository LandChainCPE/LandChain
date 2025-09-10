package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"landchain/config"  
	"landchain/entity"
	"log"
)

//r.GET("/petitions", controller.GetAllPetition)
func GetAllPetition(c *gin.Context) {
    var petitions []entity.Petition

    // Preload the State relationship when fetching petitions
    if err := config.DB().Preload("State").Find(&petitions).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, petitions)
}


//r.POST("/petitions", controller.CreatePetition)
func CreatePetition(c *gin.Context) {
    var input entity.Petition

    if err := c.ShouldBindJSON(&input); err != nil {
        log.Println("Bind JSON Error:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if the state_id exists
    var state entity.State
    if err := config.DB().First(&state, input.StateID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state_id"})
        return
    }

    if err := config.DB().Create(&input).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    log.Println("✅ Received:", input)
    c.JSON(http.StatusCreated, input)
}


//อัพเดทเฉพาะสถานะ
// PATCH /petitions/:id/state
func UpdatePetitionState(c *gin.Context) {
    id := c.Param("id")
    var input struct {
        StateID uint `json:"state_id"`
    }

    // Receive the StateID from Request
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if the state_id exists
    var state entity.State
    if err := config.DB().First(&state, input.StateID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state_id"})
        return
    }

    // Update the petition state
    if err := config.DB().Model(&entity.Petition{}).
        Where("id = ?", id).
        Update("state_id", input.StateID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "State updated successfully"})
}

//อัพเดทข้อมูลทั้งหมด
// PUT /petitions/:id
func UpdatePetition(c *gin.Context) {
	id := c.Param("id")
	var petition entity.Petition

	// ✅ ตรวจสอบว่ามีคำร้องนี้ไหม
	if err := config.DB().First(&petition, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำร้อง"})
		return
	}

	// ✅ รับข้อมูลใหม่จาก Body
	var input entity.Petition
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ อัปเดต
	if err := config.DB().Model(&petition).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, petition)
}

