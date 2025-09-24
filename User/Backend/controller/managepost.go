// GetUserPostLandData - ดึงข้อมูลโพสต์ขายที่ดินทั้งหมดของ user ที่ login
package controller

import (
	"landchain/config"
	"landchain/entity"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ManagePostHandler handles th

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
		PostID        uint   `json:"post_id"`
		Name          string `json:"name"`
		Price         int    `json:"price"`
		FirstName     string `json:"first_name"`
		LastName      string `json:"last_name"`
		PhoneNumber   string `json:"phone_number"`
		ProvinceID    uint   `json:"province_id"`
		DistrictID    uint   `json:"district_id"`
		SubdistrictID uint   `json:"subdistrict_id"`
		LandID        uint   `json:"land_id"`
		UserID        uint   `json:"user_id"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "detail": err.Error()})
		return
	}

	// ใช้ post_id จาก URL parameter ถ้ามี หรือจาก body
	var finalPostID uint
	if postIDFromURL > 0 {
		finalPostID = postIDFromURL
	} else if req.PostID > 0 {
		finalPostID = req.PostID
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Post ID is required"})
		return
	}

	db := config.DB()

	// ตรวจสอบว่าโพสต์มีอยู่จริง
	var post entity.Landsalepost
	if err := db.First(&post, finalPostID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found", "post_id": finalPostID})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "detail": err.Error()})
		}
		return
	}

	// ตรวจสอบสิทธิ์ของผู้ใช้ (optional - ถ้าต้องการ)
	// เช่น ตรวจสอบว่าผู้ใช้ที่ login เป็นเจ้าของโพสต์หรือไม่

	// อัปเดตข้อมูลโพสต์
	if req.Name != "" {
		post.Name = req.Name
	}
	if req.Price > 0 {
		post.Price = req.Price
	}
	if req.FirstName != "" {
		post.FirstName = req.FirstName
	}
	if req.LastName != "" {
		post.LastName = req.LastName
	}
	if req.PhoneNumber != "" {
		post.PhoneNumber = req.PhoneNumber
	}
	if req.ProvinceID > 0 {
		post.ProvinceID = req.ProvinceID
	}
	if req.DistrictID > 0 {
		post.DistrictID = req.DistrictID
	}
	if req.SubdistrictID > 0 {
		post.SubdistrictID = req.SubdistrictID
	}
	if req.LandID > 0 {
		post.LandID = req.LandID
	}
	if req.UserID > 0 {
		post.UserID = req.UserID
	}

	// บันทึกการเปลี่ยนแปลง
	if err := db.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update post", 
			"detail": err.Error(),
			"post_id": finalPostID,
		})
		return
	}

	// โหลดข้อมูลที่อัปเดตแล้วพร้อม preload
	if err := db.Preload("Province").Preload("District").Preload("Subdistrict").
		Preload("Landtitle").Preload("Users").Preload("Photoland").
		Preload("Location").Preload("Tags").First(&post, finalPostID).Error; err != nil {
		// ถ้าโหลดไม่ได้ ก็ส่งกลับข้อมูลพื้นฐาน
		c.JSON(http.StatusOK, gin.H{
			"message": "Post updated successfully (without relations)", 
			"post": post,
			"post_id": finalPostID,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Post updated successfully", 
		"post": post,
		"post_id": finalPostID,
	})
}

// UpdatePhotoland - อัพเดทข้อมูล Photoland เฉพาะจุด
func UpdatePhotoland(c *gin.Context) {
	// รับค่า photoland_id จาก URL parameter
	photolandIDStr := c.Param("photoland_id")
	photolandID, err := strconv.ParseUint(photolandIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photoland_id format"})
		return
	}

	var input struct {
		Path *string `json:"path,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	// ค้นหา photoland ที่ต้องการอัพเดท
	var photoland entity.Photoland
	if err := config.DB().First(&photoland, uint(photolandID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Photoland not found"})
		return
	}

	// อัพเดทเฉพาะฟิลด์ที่ส่งมา
	updateData := make(map[string]interface{})
	if input.Path != nil {
		updateData["path"] = *input.Path
	}
	if len(updateData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	if err := config.DB().Model(&photoland).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update photoland"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"message":      "Photoland updated successfully",
		"photoland_id": photolandID,
	})
}

// UpdateLocation - อัพเดทข้อมูล Location เฉพาะจุด
func UpdateLocation(c *gin.Context) {
	// รับค่า location_id จาก URL parameter
	locationIDStr := c.Param("location_id")
	locationID, err := strconv.ParseUint(locationIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location_id format"})
		return
	}

	var input struct {
		Sequence  *int     `json:"sequence,omitempty"`
		Latitude  *float64 `json:"latitude,omitempty"`
		Longitude *float64 `json:"longitude,omitempty"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	// ค้นหา location ที่ต้องการอัพเดท
	var location entity.Location
	if err := config.DB().First(&location, uint(locationID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	// อัพเดทเฉพาะฟิลด์ที่ส่งมา
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

	if len(updateData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	if err := config.DB().Model(&location).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update location"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      "success",
		"message":     "Location updated successfully",
		"location_id": locationID,
	})
}

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
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้ที่มี wallet นี้"})
			return
		}
		userID = user.ID
	} else {
		// fallback: ดึง user_id จาก JWT/context
		uid, ok := c.Get("user_id")
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id not found in context"})
			return
		}
		userID, _ = uid.(uint)
	}

	var postlands []entity.Landsalepost
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
		Preload("Tags").
		Preload("Landtitle").
		Preload("Photoland").
		Preload("Location").
		Find(&postlands).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโพสต์ขายที่ดินของผู้ใช้ได้"})
		return
	}

	c.JSON(http.StatusOK, postlands)
}
