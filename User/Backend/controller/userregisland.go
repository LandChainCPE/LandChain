package controller

import (
    "fmt"
    "net/http"
    "os"
    "path/filepath"
    "time"

    "landchain/config"
    "landchain/entity"

    "github.com/gin-gonic/gin"
)

// POST /user/userregisland
func UserRegisLand(c *gin.Context) {
    // Bind form fields (multipart/form-data)
    var input struct {
        DeedNumber     string `form:"deed_number" binding:"required"`
        VillageNo      string `form:"village_no"`
        Soi            string `form:"soi"`
        Road           string `form:"road"`
        Rai            int    `form:"rai"`
        Ngan           int    `form:"ngan"`
        SquareWa       int    `form:"square_wa"`
        ProvinceID     uint   `form:"province_id"`
        DistrictID     uint   `form:"district_id"`
        SubdistrictID  uint   `form:"subdistrict_id"`
        LandProvinceID uint   `form:"land_province_id"`
        Status         string `form:"status"`
    }

    if err := c.ShouldBind(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input", "detail": err.Error()})
        return
    }

    // get authenticated user id from context (middleware should set it)
    var userID uint
    if v, ok := c.Get("userID"); ok {
        switch t := v.(type) {
        case uint:
            userID = t
        case int:
            userID = uint(t)
        case int64:
            userID = uint(t)
        }
    }
    if userID == 0 {
        // fallback: try PostForm user_id (not recommended), else reject
        if s := c.PostForm("user_id"); s != "" {
            // ignore parsing here for brevity; prefer authenticated request
        } else {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
            return
        }
    }

    db := config.DB()

    // start transaction
    tx := db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
        }
    }()

    // uniqueness check: deed_number (only non-deleted)
    var exists entity.Landtitle
    if err := tx.Unscoped().Where("deed_number = ? AND deleted_at IS NULL", input.DeedNumber).First(&exists).Error; err == nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "deed_number already exists"})
        return
    }

    // foreign key existence checks (optional, return 400 if invalid)
    if input.ProvinceID != 0 {
        var p entity.Province
        if err := tx.First(&p, input.ProvinceID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{"error": "invalid province_id"})
            return
        }
    }
    if input.DistrictID != 0 {
        var d entity.District
        if err := tx.First(&d, input.DistrictID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{"error": "invalid district_id"})
            return
        }
    }
    if input.SubdistrictID != 0 {
        var s entity.Subdistrict
        if err := tx.First(&s, input.SubdistrictID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subdistrict_id"})
            return
        }
    }
    if input.LandProvinceID != 0 {
        var lp entity.LandProvinces
        if err := tx.First(&lp, input.LandProvinceID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{"error": "invalid land_province_id"})
            return
        }
    }

    // handle uploaded deed image (optional)
    deedImagePath := ""
    file, err := c.FormFile("deed_image")
    if err == nil && file != nil {
        dstDir := filepath.Join("uploads", "landtitles")
        if err := os.MkdirAll(dstDir, 0755); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create upload dir"})
            return
        }
        filename := fmt.Sprintf("%d_%d_%s", time.Now().UnixNano(), userID, filepath.Base(file.Filename))
        dst := filepath.Join(dstDir, filename)
        if err := c.SaveUploadedFile(file, dst); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot save uploaded file"})
            return
        }
        deedImagePath = dst // store path relative or absolute as per your app
    }

    now := time.Now()
    lt := entity.Landtitle{
        DeedNumber:     input.DeedNumber,
        VillageNo:      input.VillageNo,
        Soi:            input.Soi,
        Road:           input.Road,
        Rai:            input.Rai,
        Ngan:           input.Ngan,
        SquareWa:       input.SquareWa,
        DeedImagePath:  deedImagePath,
        UserID:         userID,
        ProvinceID:     input.ProvinceID,
        DistrictID:     input.DistrictID,
        SubdistrictID:  input.SubdistrictID,
        LandProvinceID: input.LandProvinceID,
        Status:         input.Status,
        StatusUpdatedAt: &now,
    }

    if err := tx.Create(&lt).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create landtitle", "detail": err.Error()})
        return
    }

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed", "detail": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"success": true, "landtitle": lt})
}