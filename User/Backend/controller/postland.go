package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// เพิ่ม field สำหรับรับรูปภาพหลายรูป
type PostLandRequest struct {
    entity.Landsalepost
    Locations []entity.Location `json:"locations"`
    TagID     []uint            `json:"tag_id"`
    Images    []string          `json:"images"` 
}

func CreateLandPost(c *gin.Context) {
    var req PostLandRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถอ่านข้อมูลได้"})
        return
    }

    // 1) สร้างโพสต์หลักก่อน
    if err := config.DB().Create(&req.Landsalepost).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลโพสต์การขายที่ดิน"})
        return
    }

    // 2) ตำแหน่ง Location (one-to-many)
    for _, loc := range req.Locations {
        loc.LandsalepostID = req.Landsalepost.ID
        if err := config.DB().Create(&loc).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกพิกัดไม่สำเร็จ"})
            return
        }
    }

    // 3) แท็ก (many-to-many)
    if len(req.TagID) > 0 {
        var tags []entity.Tag
        if err := config.DB().Where("id IN ?", req.TagID).Find(&tags).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "ค้นหาแท็กไม่สำเร็จ"})
            return
        }
        if err := config.DB().
            Model(&req.Landsalepost).
            Association("Tags").
            Replace(&tags); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "เชื่อมแท็กกับโพสต์ไม่สำเร็จ"})
            return
        }
    }

    // 4) รูปภาพ (Photoland, one-to-many)
    for _, imgPath := range req.Images {
        photo := entity.Photoland{
            LandsalepostID: req.Landsalepost.ID,
            Path:           imgPath,
        }
        if err := config.DB().Create(&photo).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกรูปภาพไม่สำเร็จ"})
            return
        }
    }

    // 5) preload ข้อมูลกลับไป
    var result entity.Landsalepost
    if err := config.DB().
        Preload("Location").
        Preload("Tags").
        Preload("Photoland"). // preload รูปภาพด้วย
        First(&result, req.Landsalepost.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงข้อมูลโพสต์ไม่สำเร็จ"})
        return
    }

    c.JSON(http.StatusOK, result)
}

// GetAllPostLandData ดึงข้อมูลการขายที่ดินทั้งหมด พร้อมข้อมูลโฉนดที่ดิน (Landtitle)
func GetAllPostLandData(c *gin.Context) {
    db := config.DB()
    var postlands []entity.Landsalepost

    // ดึงข้อมูลโพสต์ขายที่ดิน และข้อมูลที่เกี่ยวข้อง (tags, locations, provinces, etc.)
    err := db.
        Preload("Province", func(db *gorm.DB) *gorm.DB {
            return db.Select("id", "name_th")
        }).
        Preload("District", func(db *gorm.DB) *gorm.DB {
            return db.Select("id", "name_th", "province_id")
        }).
        Preload("Subdistrict", func(db *gorm.DB) *gorm.DB {
            return db.Select("id", "name_th", "district_id")
        }).
        Preload("Tags").  // ✅ ดึงข้อมูล Tags ด้วย (many-to-many)
        Preload("Landtitle").
        Preload("Roomchat").
        Preload("Transaction").
        Preload("Photoland").
        Preload("Location").
        Find(&postlands).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโพสต์ขายที่ดินได้"})
        return
    }

    c.JSON(http.StatusOK, postlands)
}
