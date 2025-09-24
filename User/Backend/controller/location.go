package controller

import(
	"net/http"
	"fmt"
	"strconv"

	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
)

// GetLocations - ดึงข้อมูล location ทั้งหมด
func GetLocations(c *gin.Context) {
	var locations []entity.Location
	if err := config.DB().Find(&locations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve locations"})
		return
	}
	c.JSON(http.StatusOK, locations)
}

// GetLocationsByLandSalePostId - ดึงข้อมูล location ตาม landsalepost_id และเรียงตาม sequence
func GetLocationsByLandSalePostId(c *gin.Context) {
	// รับค่า landsalepost_id จาก URL parameter
	landsalepostIDStr := c.Param("landsalepost_id")
	landsalepostID, err := strconv.ParseUint(landsalepostIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid landsalepost_id format"})
		return
	}

	// ตรวจสอบว่า landsalepost_id มีจริงหรือไม่
	var post entity.Landsalepost
	if err := config.DB().First(&post, uint(landsalepostID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Landsalepost %d not found", landsalepostID)})
		return
	}

	// ดึงข้อมูล locations ที่เชื่อมโยงกับ landsalepost_id และเรียงตาม sequence
	var locations []entity.Location
	if err := config.DB().Where("landsalepost_id = ?", uint(landsalepostID)).Order("sequence ASC").Find(&locations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve locations"})
		return
	}

	// ถ้าไม่พบข้อมูล ส่งกลับ array ว่าง
	if len(locations) == 0 {
		c.JSON(http.StatusOK, []entity.Location{})
		return
	}

	c.JSON(http.StatusOK, locations)
}

// CreateLocation - สร้าง location ใหม่ (รองรับการสร้างหลายจุดพร้อมกัน)
func CreateLocation(c *gin.Context) {
    var inputs []struct {
        Sequence       int     `json:"sequence"`
        Latitude       float64 `json:"latitude"`
        Longitude      float64 `json:"longitude"`
        LandsalepostID uint    `json:"landsalepost_id"`
    }
    
    if err := c.ShouldBindJSON(&inputs); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
        return
    }

    if len(inputs) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No location data provided"})
        return
    }

    // ตรวจสอบว่า landsalepost_id ของทุกจุดเหมือนกัน
    landsalepostID := inputs[0].LandsalepostID
    for _, input := range inputs {
        if input.LandsalepostID != landsalepostID {
            c.JSON(http.StatusBadRequest, gin.H{"error": "All locations must have the same landsalepost_id"})
            return
        }
    }

    // ตรวจสอบ landsalepost_id ที่ส่งมาว่ามีจริงหรือไม่
    var post entity.Landsalepost
    if err := config.DB().First(&post, landsalepostID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Landsalepost %d not found", landsalepostID)})
        return
    }

    // ลบ locations เก่าของ landsalepost_id นี้ก่อน (ถ้าต้องการ replace)
    if err := config.DB().Where("landsalepost_id = ?", landsalepostID).Delete(&entity.Location{}).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear old locations"})
        return
    }

    // สร้าง locations ใหม่
    var createdCount int
    for _, input := range inputs {
        // ตรวจสอบค่าที่จำเป็น
        if input.Latitude == 0 || input.Longitude == 0 {
            c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid coordinates at sequence %d", input.Sequence)})
            return
        }

        loc := entity.Location{
            Sequence:       input.Sequence,
            Latitude:       input.Latitude,
            Longitude:      input.Longitude,
            LandsalepostID: input.LandsalepostID,
        }
        
        if err := config.DB().Create(&loc).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create location at sequence %d", input.Sequence)})
            return
        }
        createdCount++
    }

    c.JSON(http.StatusCreated, gin.H{
        "status": "success",
        "message": fmt.Sprintf("Created %d locations for landsalepost %d", createdCount, landsalepostID),
        "created_count": createdCount,
        "landsalepost_id": landsalepostID,
    })
}

// UpdateLocation - อัพเดท location เฉพาะจุด (เพิ่มเติม)


// DeleteLocationsByLandSalePostId - ลบ locations ทั้งหมดของ landsalepost_id
func DeleteLocationsByLandSalePostId(c *gin.Context) {
    // รับค่า landsalepost_id จาก URL parameter
    landsalepostIDStr := c.Param("landsalepost_id")
    landsalepostID, err := strconv.ParseUint(landsalepostIDStr, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid landsalepost_id format"})
        return
    }

    // ตรวจสอบว่ามี locations อยู่หรือไม่
    var count int64
    if err := config.DB().Model(&entity.Location{}).Where("landsalepost_id = ?", uint(landsalepostID)).Count(&count).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count locations"})
        return
    }

    if count == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "No locations found for this landsalepost_id"})
        return
    }

    // ลบ locations
    if err := config.DB().Where("landsalepost_id = ?", uint(landsalepostID)).Delete(&entity.Location{}).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete locations"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "message": fmt.Sprintf("Deleted %d locations for landsalepost %d", count, landsalepostID),
        "deleted_count": count,
        "landsalepost_id": landsalepostID,
    })
}