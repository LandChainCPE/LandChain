package controller

import (
	"net/http"

	"landchain/config"
	"landchain/entity"
	"log"

	"github.com/gin-gonic/gin"
)

// r.GET("/petitions", controller.GetAllPetition)
func GetAllPetition(c *gin.Context) {
	var petitions []entity.Petition

	// Preload State (left join) เพื่อให้ State ไม่เป็น null ถ้ามี state_id
	if err := config.DB().Preload("State").Find(&petitions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// กรณี State เป็น null (state_id ไม่ตรงกับ states.id) ให้เติม State = nil
	for i := range petitions {
		if petitions[i].State == nil {
			petitions[i].State = nil
		}
	}

	c.JSON(http.StatusOK, petitions)
}

// r.POST("/petitions", controller.CreatePetition)
func CreatePetition(c *gin.Context) {
	var input entity.Petition

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Println("Bind JSON Error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ถ้าไม่ได้ส่ง state_id หรือเป็น 0 ให้ default เป็น 1
	if input.StateID == 0 {
		input.StateID = 1
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

// r.PUT("/petitions/:id/status", controller.UpdatePetitionStatus)
func UpdatePetitionStatus(c *gin.Context) {
    var input struct {
        StateID uint `json:"state_id"` // <-- ต้องใช้ state_id
    }
    id := c.Param("id")

    if err := c.ShouldBindJSON(&input); err != nil {
        log.Println("Bind JSON Error:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ตรวจสอบ state_id ว่ามีจริงไหม
    var state entity.State
    if err := config.DB().First(&state, input.StateID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state_id"})
        return
    }

    // อัปเดตสถานะของคำร้อง
    var petition entity.Petition
    if err := config.DB().First(&petition, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Petition not found"})
        return
    }

    petition.StateID = input.StateID
    if err := config.DB().Save(&petition).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // preload State กลับไปด้วย (optional)
    config.DB().Preload("State").First(&petition, id)

    c.JSON(http.StatusOK, petition)
}