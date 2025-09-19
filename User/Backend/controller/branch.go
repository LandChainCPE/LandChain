package controller

import (
	"net/http"
	"strconv"

	"landchain/config"
	"landchain/entity"

	"github.com/gin-gonic/gin"
)

// ดึงสาขาทั้งหมด
func GetBranch(c *gin.Context) {
	var branches []entity.Branch
	if err := config.DB().Preload("Province").Find(&branches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve branches"})
		return
	}
	c.JSON(http.StatusOK, branches)
}

// ดึงสาขาทั้งหมดสำหรับ Appointment Status (เฉพาะข้อมูลที่จำเป็น)
func GetBranchesForFilter(c *gin.Context) {
	var branches []entity.Branch
	if err := config.DB().Preload("Province").Find(&branches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve branches"})
		return
	}

	// Transform data เพื่อให้ตรงกับ Frontend interface
	var result []map[string]interface{}
	for _, branch := range branches {
		result = append(result, map[string]interface{}{
			"ID":          branch.ID,
			"branch":      branch.Branch,
			"province_id": branch.ProvinceID,
			"Province": map[string]interface{}{
				"ID":       branch.Province.ID,
				"province": branch.Province.Province,
			},
		})
	}

	c.JSON(http.StatusOK, result)
}

// ดึงสาขาตามจังหวัด
func GetBranchesByProvince(c *gin.Context) {
	provinceIDStr := c.Param("provinceID")

	// แปลง provinceID เป็นตัวเลข
	provinceID, err := strconv.ParseUint(provinceIDStr, 10, 64)
	if err != nil || provinceID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid provinceID"})
		return
	}

	var branches []entity.Branch
	if err := config.DB().Where("province_id = ?", provinceID).Preload("Province").Find(&branches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve branches for province"})
		return
	}

	c.JSON(http.StatusOK, branches)
}

// ดึงสาขาตาม ID
func GetBranchByID(c *gin.Context) {
	branchIDStr := c.Param("branchID")

	branchID, err := strconv.ParseUint(branchIDStr, 10, 64)
	if err != nil || branchID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid branchID"})
		return
	}

	var branch entity.Branch
	if err := config.DB().Preload("Province").First(&branch, branchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Branch not found"})
		return
	}

	c.JSON(http.StatusOK, branch)
}
