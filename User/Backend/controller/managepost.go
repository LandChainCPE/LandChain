package controller

import (
	"landchain/config"
	"landchain/entity"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UpdatePostRequest - โครงสร้างสำหรับรับข้อมูลการอัปเดตโพสต์
type UpdatePostRequest struct {
	ID            uint     `json:"id,omitempty"`
	PostID        uint     `json:"post_id,omitempty"`
	Name          string   `json:"name,omitempty"`
	Price         int      `json:"price,omitempty"`
	FirstName     string   `json:"first_name,omitempty"`
	LastName      string   `json:"last_name,omitempty"`
	PhoneNumber   string   `json:"phone_number,omitempty"`
	ProvinceID    uint     `json:"province_id,omitempty"`
	DistrictID    uint     `json:"district_id,omitempty"`
	SubdistrictID uint     `json:"subdistrict_id,omitempty"`
	LandID        uint     `json:"land_id,omitempty"`
	UserID        uint     `json:"user_id,omitempty"`
	Images        []string `json:"images,omitempty"`    // รูปภาพ (ถ้ามี)
	TagID         []uint   `json:"tag_id,omitempty"`    // แท็ก (ถ้ามี)
	Locations     []entity.Location `json:"locations,omitempty"` // ตำแหน่ง (ถ้ามี)
}

// UpdatePost - อัปเดตข้อมูลโพสต์ขายที่ดินแบบครบถ้วน
func UpdatePost(c *gin.Context) {
	// รับ post_id จาก URL parameter ถ้ามี
	postIDParam := c.Param("post_id")
	var postIDFromURL uint = 0

	if postIDParam != "" {
		if id, err := strconv.ParseUint(postIDParam, 10, 32); err == nil {
			postIDFromURL = uint(id)
		}
	}

	// รับข้อมูลจาก request body
	var req UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("UpdatePost: JSON binding error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "detail": err.Error()})
		return
	}

	// ใช้ post_id จาก URL parameter, body id, หรือ post_id ตามลำดับ
	var finalPostID uint
	if postIDFromURL > 0 {
		finalPostID = postIDFromURL
	} else if req.ID > 0 {
		finalPostID = req.ID
	} else if req.PostID > 0 {
		finalPostID = req.PostID
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Post ID is required"})
		return
	}

	log.Printf("UpdatePost: Processing post ID: %d", finalPostID)

	db := config.DB()

	// ตรวจสอบว่าโพสต์มีอยู่จริง
	var post entity.Landsalepost
	if err := db.First(&post, finalPostID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found", "post_id": finalPostID})
		} else {
			log.Printf("UpdatePost: Database error finding post: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "detail": err.Error()})
		}
		return
	}

	// เริ่ม transaction เพื่อความสมบูรณ์ของข้อมูล
	tx := db.Begin()
	if tx.Error != nil {
		log.Printf("UpdatePost: Failed to start transaction: %v", tx.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// อัปเดตข้อมูลโพสต์พื้นฐาน
	updateFields := make(map[string]interface{})
	if req.Name != "" {
		updateFields["name"] = req.Name
	}
	if req.Price > 0 {
		updateFields["price"] = req.Price
	}
	if req.FirstName != "" {
		updateFields["first_name"] = req.FirstName
	}
	if req.LastName != "" {
		updateFields["last_name"] = req.LastName
	}
	if req.PhoneNumber != "" {
		updateFields["phone_number"] = req.PhoneNumber
	}
	if req.ProvinceID > 0 {
		updateFields["province_id"] = req.ProvinceID
	}
	if req.DistrictID > 0 {
		updateFields["district_id"] = req.DistrictID
	}
	if req.SubdistrictID > 0 {
		updateFields["subdistrict_id"] = req.SubdistrictID
	}
	if req.LandID > 0 {
		updateFields["land_id"] = req.LandID
	}
	if req.UserID > 0 {
		updateFields["user_id"] = req.UserID
	}

	// บันทึกการเปลี่ยนแปลงโพสต์หลัก
	if len(updateFields) > 0 {
		if err := tx.Model(&post).Updates(updateFields).Error; err != nil {
			tx.Rollback()
			log.Printf("UpdatePost: Failed to update post: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to update post",
				"detail":  err.Error(),
				"post_id": finalPostID,
			})
			return
		}
		log.Printf("UpdatePost: Updated post fields: %+v", updateFields)
	}

	// อัปเดตรูปภาพถ้ามีการส่งมา
	if len(req.Images) > 0 {
		log.Printf("UpdatePost: Updating images, count: %d", len(req.Images))

		// ลบรูปภาพเก่าทั้งหมดก่อน
		if err := tx.Where("landsalepost_id = ?", finalPostID).Delete(&entity.Photoland{}).Error; err != nil {
			tx.Rollback()
			log.Printf("UpdatePost: Failed to delete old images: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete old images"})
			return
		}

		// เพิ่มรูปภาพใหม่
		for i, imgPath := range req.Images {
			if imgPath != "" {
				photo := entity.Photoland{
					LandsalepostID: finalPostID,
					Path:           imgPath,
				}
				if err := tx.Create(&photo).Error; err != nil {
					tx.Rollback()
					log.Printf("UpdatePost: Failed to save image %d: %v", i, err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new images"})
					return
				}
			}
		}
		log.Printf("UpdatePost: Successfully updated %d images", len(req.Images))
	}

	// อัปเดต tags ถ้ามีการส่งมา
	if len(req.TagID) > 0 {
		log.Printf("UpdatePost: Updating tags, count: %d", len(req.TagID))

		var tags []entity.Tag
		if err := tx.Where("id IN ?", req.TagID).Find(&tags).Error; err != nil {
			tx.Rollback()
			log.Printf("UpdatePost: Failed to find tags: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find tags"})
			return
		}
		if err := tx.Model(&post).Association("Tags").Replace(&tags); err != nil {
			tx.Rollback()
			log.Printf("UpdatePost: Failed to update tags: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tags"})
			return
		}
		log.Printf("UpdatePost: Successfully updated %d tags", len(tags))
	}

	// อัปเดต locations ถ้ามีการส่งมา
	if len(req.Locations) > 0 {
		log.Printf("UpdatePost: Updating locations, count: %d", len(req.Locations))

		// ลบ locations เก่าทั้งหมดก่อน
		if err := tx.Where("landsalepost_id = ?", finalPostID).Delete(&entity.Location{}).Error; err != nil {
			tx.Rollback()
			log.Printf("UpdatePost: Failed to delete old locations: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete old locations"})
			return
		}

		// เพิ่ม locations ใหม่
		for i, loc := range req.Locations {
			loc.LandsalepostID = finalPostID
			if err := tx.Create(&loc).Error; err != nil {
				tx.Rollback()
				log.Printf("UpdatePost: Failed to save location %d: %v", i, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new locations"})
				return
			}
		}
		log.Printf("UpdatePost: Successfully updated %d locations", len(req.Locations))
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		log.Printf("UpdatePost: Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// โหลดข้อมูลที่อัปเดตแล้วพร้อม preload แบบเดียวกับ GetAllPostLandData
	var result entity.Landsalepost
	if err := db.
		Preload("Province", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th")
		}).
		Preload("District", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th", "province_id")
		}).
		Preload("Subdistrict", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th", "district_id")
		}).
		Preload("Tags").
		Preload("Landtitle").
		Preload("Photoland").
		Preload("Location").
		Preload("Users").
		First(&result, finalPostID).Error; err != nil {
		log.Printf("UpdatePost: Failed to preload relations: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"message": "Post updated successfully (without relations)",
			"post":    post,
			"post_id": finalPostID,
		})
		return
	}

	log.Printf("UpdatePost: Successfully updated post %d", finalPostID)
	c.JSON(http.StatusOK, gin.H{
		"message": "Post updated successfully",
		"post":    result,
		"post_id": finalPostID,
	})
}



// GetUserPostLandData - ดึงข้อมูลโพสต์ขายที่ดินของผู้ใช้ (ปรับให้เหมือนกับ GetAllPostLandData)
func GetUserPostLandData(c *gin.Context) {
	db := config.DB()

	// รับ user_id จาก path param หรือ query param
	userIDParam := c.Param("user_id")
	if userIDParam == "" {
		userIDParam = c.Query("user_id")
	}

	var userID uint
	if userIDParam != "" {
		// แปลง user_id เป็น uint
		if id, err := strconv.ParseUint(userIDParam, 10, 32); err == nil {
			userID = uint(id)
			log.Printf("GetUserPostLandData: Using user ID from param/query: %d", userID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id format"})
			return
		}
	} else {
		// fallback: ดึง user_id จาก JWT/context
		uid, ok := c.Get("user_id")
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id not found in context and no user_id provided"})
			return
		}
		userID, _ = uid.(uint)
		log.Printf("GetUserPostLandData: Using user ID from context: %d", userID)
	}

	var postlands []entity.Landsalepost
	// ใช้ preload แบบเดียวกับ GetAllPostLandData ใน postland.go
	err := db.
		Where("user_id = ?", userID).
		Preload("Province", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th")
		}).
		Preload("District", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th", "province_id")
		}).
		Preload("Subdistrict", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th", "district_id")
		}).
		Preload("Tags").      // ดึงข้อมูล Tags ด้วย (many-to-many)
		Preload("Landtitle"). // ดึงข้อมูล Landtitle ด้วย
		Preload("Photoland"). // ดึงข้อมูล Photoland ด้วย (one-to-many) - สำคัญมาก!
		Preload("Location").  // ดึงข้อมูล Location ด้วย (one-to-many)
		Preload("Users").     // ดึงข้อมูล Users ด้วย
		Order("id DESC").     // เรียงใหม่ไปเก่า
		Find(&postlands).Error

	if err != nil {
		log.Printf("GetUserPostLandData: Failed to fetch posts: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโพสต์ขายที่ดินของผู้ใช้ได้"})
		return
	}

	log.Printf("GetUserPostLandData: Found %d posts for user %d", len(postlands), userID)
	c.JSON(http.StatusOK, postlands)
}




// ReplaceAllLocations - แทนที่ตำแหน่งทั้งหมดในโพสต์


// UpdatePostTags - อัปเดต Tags เฉพาะโพสต์


// GetPostDetail - ดึงข้อมูลโพสต์เฉพาะรายการ
func GetPostDetail(c *gin.Context) {
	postIDParam := c.Param("post_id")
	postID, err := strconv.ParseUint(postIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id format"})
		return
	}

	db := config.DB()
	var post entity.Landsalepost

	// ดึงข้อมูลโพสต์พร้อม preload ทุกอย่าง
	err = db.
		Preload("Province", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th")
		}).
		Preload("District", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th", "province_id")
		}).
		Preload("Subdistrict", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name_th", "district_id")
		}).
		Preload("Tags").
		Preload("Landtitle").
		Preload("Photoland").
		Preload("Location").
		Preload("Users").
		First(&post, uint(postID)).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			log.Printf("GetPostDetail: Database error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	log.Printf("GetPostDetail: Successfully retrieved post %d", postID)
	c.JSON(http.StatusOK, post)
}

// DeletePost - ลบโพสต์และข้อมูลที่เกี่ยวข้องทั้งหมด
func DeletePost(c *gin.Context) {
	postIDParam := c.Param("post_id")
	postID, err := strconv.ParseUint(postIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id format"})
		return
	}

	// ตรวจสอบว่าโพสต์มีอยู่จริง
	var post entity.Landsalepost
	if err := config.DB().First(&post, uint(postID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	db := config.DB()
	tx := db.Begin()

	// ลบข้อมูลที่เกี่ยวข้องทั้งหมดก่อน
	// 1. ลบรูปภาพ
	if err := tx.Where("landsalepost_id = ?", postID).Delete(&entity.Photoland{}).Error; err != nil {
		tx.Rollback()
		log.Printf("DeletePost: Failed to delete photos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete photos"})
		return
	}

	// 2. ลบตำแหน่ง
	if err := tx.Where("landsalepost_id = ?", postID).Delete(&entity.Location{}).Error; err != nil {
		tx.Rollback()
		log.Printf("DeletePost: Failed to delete locations: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete locations"})
		return
	}

	// 3. ลบ association กับ tags (many-to-many)
	if err := tx.Model(&post).Association("Tags").Clear(); err != nil {
		tx.Rollback()
		log.Printf("DeletePost: Failed to clear tags: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear tags"})
		return
	}

	// 4. ลบโพสต์หลัก
	if err := tx.Delete(&post).Error; err != nil {
		tx.Rollback()
		log.Printf("DeletePost: Failed to delete post: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("DeletePost: Failed to commit: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	log.Printf("DeletePost: Successfully deleted post %d", postID)
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Post deleted successfully",
		"post_id": postID,
	})
}