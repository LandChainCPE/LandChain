package controller

import (
	"log"
	"net/http"
	"strconv"

	"landchain/config"
	"landchain/entity"

	"github.com/gin-gonic/gin"
)

// POST /user/userregisland
// multipart/form-data fields must match the `form:"..."` tags below
func UserRegisLand(c *gin.Context) {
	// Define input as strings for all fields
	var input struct {
		SurveyNumber    string `json:"survey_number"`
		LandNumber      string `json:"land_number"`
		SurveyPage      string `json:"survey_page"`
		TitleDeedNumber string `json:"title_deed_number"`
		Volume          string `json:"volume"`
		Page            string `json:"page"`
		Rai             string `json:"rai"`
		Ngan            string `json:"ngan"`
		SquareWa        string `json:"square_wa"`
		ProvinceID      string `json:"province_id"`
		DistrictID      string `json:"district_id"`
		SubdistrictID   string `json:"subdistrict_id"`
		UserID          string `json:"userid"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Debug: Print the raw input data
	log.Printf("Raw input received: %+v", input)

	// Convert numeric fields from strings to integers
	provinceID, _ := strconv.Atoi(input.ProvinceID)
	districtID, _ := strconv.Atoi(input.DistrictID)
	subdistrictID, _ := strconv.Atoi(input.SubdistrictID)
	userID, _ := strconv.Atoi(input.UserID)
	rai, _ := strconv.Atoi(input.Rai)
	ngan, _ := strconv.Atoi(input.Ngan)
	squareWa, _ := strconv.Atoi(input.SquareWa)

	// Debug: Print the converted values
	log.Printf("Converted values: ProvinceID=%d, DistrictID=%d, SubdistrictID=%d, UserID=%d, Rai=%d, Ngan=%d, SquareWa=%d", provinceID, districtID, subdistrictID, userID, rai, ngan, squareWa)

	// Validate input data before creating the land title
	if input.ProvinceID == "0" || input.DistrictID == "0" || input.SubdistrictID == "0" || input.UserID == "0" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: ProvinceID, DistrictID, SubdistrictID, and UserID must be provided and greater than 0"})
		return
	}

	// Check if the provided ProvinceID, DistrictID, SubdistrictID, and UserID exist in the database
	var province entity.Province
	if err := config.DB().First(&province, input.ProvinceID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ProvinceID"})
		return
	}

	var district entity.District
	if err := config.DB().First(&district, "id = ? AND province_id = ?", input.DistrictID, input.ProvinceID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid DistrictID or it does not belong to the specified ProvinceID"})
		return
	}

	var subdistrict entity.Subdistrict
	if err := config.DB().First(&subdistrict, "id = ? AND district_id = ?", input.SubdistrictID, input.DistrictID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid SubdistrictID or it does not belong to the specified DistrictID"})
		return
	}

	var user entity.Users
	if err := config.DB().First(&user, input.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UserID"})
		return
	}

	// Create the land title entity
	landtitle := entity.Landtitle{
		SurveyNumber:       input.SurveyNumber,
		LandNumber:         input.LandNumber,
		SurveyPage:         input.SurveyPage,
		TitleDeedNumber:    input.TitleDeedNumber,
		Volume:             input.Volume,
		Page:               input.Page,
		Rai:                rai,
		Ngan:               ngan,
		SquareWa:           squareWa,
		Status_verify:		false,  ///// 
		ProvinceID:         uint(provinceID),
		DistrictID:         uint(districtID),
		SubdistrictID:      uint(subdistrictID),
		UserID:             uint(userID),
		GeographyID:        nil, // Explicitly setting GeographyID to nil
		LandVerificationID: nil, // Explicitly setting LandVerificationID to nil
	}

	if err := config.DB().Create(&landtitle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save land title"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Land title registered successfully", "landtitle_id": landtitle.ID})
}

// GET /landtitle/by-token/:token_id
func GetLandtitleIdByTokenId(c *gin.Context) {
    tokenID := c.Param("token_id")
    var landtitle entity.Landtitle

    // ตรวจสอบว่า field ชื่อว่า ID หรือที่ใช้ใน struct ของคุณ
	if err := config.DB().Where("token_id = ?", tokenID).First(&landtitle).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Landtitle not found"})
		return
	}

    c.JSON(http.StatusOK, gin.H{
        "land_id": landtitle.ID, // แก้ให้ตรงกับชื่อที่มีใน struct
        "token_id":     landtitle.TokenID,
    })
}

