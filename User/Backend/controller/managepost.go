package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"
	"strconv"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UpdatePost - อัปเดตข้อมูลโพสต์ขายที่ดิน
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
	var req struct {
		ID            uint     `json:"id"`
		PostID        uint     `json:"post_id"`
		Name          string   `json:"name"`
		Price         int      `json:"price"`
		FirstName     string   `json:"first_name"`
		LastName      string   `json:"last_name"`
		PhoneNumber   string   `json:"phone_number"`
		ProvinceID    uint     `json:"province_id"`
		DistrictID    uint     `json:"district_id"`
		SubdistrictID uint     `json:"subdistrict_id"`
		LandID        uint     `json:"land_id"`
		UserID        uint     `json:"user_id"`
		Images        []string `json:"images,omitempty"` // รูปภาพ (ถ้ามี)
		TagID         []uint   `json:"tag_id,omitempty"` // แท็ก (ถ้ามี)
	}
	
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
				"error": "Failed to update post", 
				"detail": err.Error(),
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
			if imgPath != "" { // ตรวจสอบว่าไม่ใช่ string ว่าง
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
		Preload("Photoland"). // สำคัญ: ต้องมีเพื่อโหลดรูปภาพ
		Preload("Location").
		Preload("Users"). // เพิ่มเพื่อความสมบูรณ์
		First(&result, finalPostID).Error; err != nil {
		// ถ้าโหลดไม่ได้ ก็ส่งกลับข้อมูลพื้นฐาน
		log.Printf("UpdatePost: Failed to preload relations: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"message": "Post updated successfully (without relations)", 
			"post": post,
			"post_id": finalPostID,
		})
		return
	}

	log.Printf("UpdatePost: Successfully updated post %d", finalPostID)
	c.JSON(http.StatusOK, gin.H{
		"message": "Post updated successfully", 
		"post": result,
		"post_id": finalPostID,
	})
}

// UpdatePhotoland - อัปเดทข้อมูล Photoland เฉพาะจุด (เก็บไว้เพื่อความ backward compatible)
func UpdatePhotoland(c *gin.Context) {
	// รับค่า photoland_id จาก URL parameter
	photolandIDStr := c.Param("photoland_id")
	photolandID, err := strconv.ParseUint(photolandIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photoland_id format"})
		return
	}

	var input struct {
		Path            *string `json:"path,omitempty"`
		LandsalepostID  *uint   `json:"landsalepost_id,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	// ค้นหา photoland ที่ต้องการอัปเดท
	var photoland entity.Photoland
	if err := config.DB().First(&photoland, uint(photolandID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Photoland not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// อัปเดทเฉพาะฟิลด์ที่ส่งมา
	updateData := make(map[string]interface{})
	if input.Path != nil {
		updateData["path"] = *input.Path
	}
	if input.LandsalepostID != nil {
		updateData["landsalepost_id"] = *input.LandsalepostID
	}
	
	if len(updateData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	if err := config.DB().Model(&photoland).Updates(updateData).Error; err != nil {
		log.Printf("UpdatePhotoland: Failed to update: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update photoland"})
		return
	}

	// โหลดข้อมูล photoland ที่อัปเดตแล้ว
	var updatedPhoto entity.Photoland
	if err := config.DB().First(&updatedPhoto, uint(photolandID)).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":       "success",
			"message":      "Photoland updated successfully",
			"photoland_id": photolandID,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"message":      "Photoland updated successfully",
		"photoland_id": photolandID,
		"photoland":    updatedPhoto,
	})
}

// UpdateLocation - อัปเดทข้อมูล Location เฉพาะจุด (เก็บไว้เพื่อความ backward compatible)
func UpdateLocation(c *gin.Context) {
	// รับค่า location_id จาก URL parameter
	locationIDStr := c.Param("location_id")
	locationID, err := strconv.ParseUint(locationIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location_id format"})
		return
	}

	var input struct {
		Sequence       *int     `json:"sequence,omitempty"`
		Latitude       *float64 `json:"latitude,omitempty"`
		Longitude      *float64 `json:"longitude,omitempty"`
		LandsalepostID *uint    `json:"landsalepost_id,omitempty"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	// ค้นหา location ที่ต้องการอัปเดท
	var location entity.Location
	if err := config.DB().First(&location, uint(locationID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// อัปเดทเฉพาะฟิลด์ที่ส่งมา
	updateData := make(map[string]interface{})
	if input.Sequence != nil {
		updateData["sequence"] = *input.Sequence
	}
	if input.Latitude != nil {
		updateData["latitude"] = *input.Latitude
	}
	if input.Longitude != nil {
		updateData["longitude"] = *input.Longitude
	}
	if input.LandsalepostID != nil {
		updateData["landsalepost_id"] = *input.LandsalepostID
	}

	if len(updateData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	if err := config.DB().Model(&location).Updates(updateData).Error; err != nil {
		log.Printf("UpdateLocation: Failed to update: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update location"})
		return
	}

	// โหลดข้อมูล location ที่อัปเดตแล้ว
	var updatedLocation entity.Location
	if err := config.DB().First(&updatedLocation, uint(locationID)).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":      "success",
			"message":     "Location updated successfully",
			"location_id": locationID,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      "success",
		"message":     "Location updated successfully",
		"location_id": locationID,
		"location":    updatedLocation,
	})
}

// GetUserPostLandData - ดึงข้อมูลโพสต์ขายที่ดินของผู้ใช้ (ปรับให้เหมือนกับ GetAllPostLandData)
func GetUserPostLandData(c *gin.Context) {
	db := config.DB()

	// รับ wallet จาก path param หรือ query param
	wallet := c.Param("wallet")
	if wallet == "" {
		wallet = c.Query("wallet")
	}
	
	var userID uint
	if wallet != "" {
		// ค้นหา user_id จาก metamaskaddress
		var user entity.Users
		if err := db.Where("metamaskaddress = ?", wallet).First(&user).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้ที่มี wallet นี้"})
			} else {
				log.Printf("GetUserPostLandData: Failed to find user: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error while finding user"})
			}
			return
		}
		userID = user.ID
		log.Printf("GetUserPostLandData: Found user ID %d for wallet %s", userID, wallet)
	} else {
		// fallback: ดึง user_id จาก JWT/context
		uid, ok := c.Get("user_id")
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id not found in context and no wallet provided"})
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
		Preload("Tags").        // ดึงข้อมูล Tags ด้วย (many-to-many)
		Preload("Landtitle").   // ดึงข้อมูล Landtitle ด้วย 
		Preload("Photoland").   // ดึงข้อมูล Photoland ด้วย (one-to-many) - สำคัญมาก!
		Preload("Location").    // ดึงข้อมูล Location ด้วย (one-to-many)
		Preload("Users").       // ดึงข้อมูล Users ด้วย
		Order("id DESC").       // เรียงใหม่ไปเก่า
		Find(&postlands).Error

	if err != nil {
		log.Printf("GetUserPostLandData: Failed to fetch posts: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโพสต์ขายที่ดินของผู้ใช้ได้"})
		return
	}

	log.Printf("GetUserPostLandData: Found %d posts for user %d", len(postlands), userID)
	c.JSON(http.StatusOK, postlands)
}

// AddMultiplePhotos - เพิ่มรูปภาพหลายรูปในโพสต์เดียว
func AddMultiplePhotos(c *gin.Context) {
	postIDParam := c.Param("post_id")
	postID, err := strconv.ParseUint(postIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id format"})
		return
	}

	var req struct {
		Images []string `json:"images" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
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

	var createdPhotos []entity.Photoland

	// เพิ่มรูปภาพทีละรูป
	for _, imgPath := range req.Images {
		if imgPath != "" {
			photo := entity.Photoland{
				LandsalepostID: uint(postID),
				Path:           imgPath,
			}
			if err := tx.Create(&photo).Error; err != nil {
				tx.Rollback()
				log.Printf("AddMultiplePhotos: Failed to save image: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
				return
			}
			createdPhotos = append(createdPhotos, photo)
		}
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("AddMultiplePhotos: Failed to commit: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	log.Printf("AddMultiplePhotos: Successfully added %d photos to post %d", len(createdPhotos), postID)
	c.JSON(http.StatusOK, gin.H{
		"status":        "success",
		"message":       "Photos added successfully",
		"photos_count":  len(createdPhotos),
		"photos":        createdPhotos,
	})
}

// ReplaceAllPhotos - แทนที่รูปภาพทั้งหมดในโพสต์
func ReplaceAllPhotos(c *gin.Context) {
	postIDParam := c.Param("post_id")
	postID, err := strconv.ParseUint(postIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id format"})
		return
	}

	var req struct {
		Images []string `json:"images" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
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

	// ลบรูปภาพเก่าทั้งหมด
	if err := tx.Where("landsalepost_id = ?", postID).Delete(&entity.Photoland{}).Error; err != nil {
		tx.Rollback()
		log.Printf("ReplaceAllPhotos: Failed to delete old images: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete old images"})
		return
	}

	var createdPhotos []entity.Photoland

	// เพิ่มรูปภาพใหม่
	for _, imgPath := range req.Images {
		if imgPath != "" {
			photo := entity.Photoland{
				LandsalepostID: uint(postID),
				Path:           imgPath,
			}
			if err := tx.Create(&photo).Error; err != nil {
				tx.Rollback()
				log.Printf("ReplaceAllPhotos: Failed to save new image: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new image"})
				return
			}
			createdPhotos = append(createdPhotos, photo)
		}
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("ReplaceAllPhotos: Failed to commit: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	log.Printf("ReplaceAllPhotos: Successfully replaced %d photos for post %d", len(createdPhotos), postID)
	c.JSON(http.StatusOK, gin.H{
		"status":        "success",
		"message":       "All photos replaced successfully",
		"photos_count":  len(createdPhotos),
		"photos":        createdPhotos,
	})
}