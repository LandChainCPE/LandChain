package controller

import (
	"net/http"
	"landchain/entity"
	"github.com/gin-gonic/gin"
	"landchain/config"
)
//r.GET("/tags", controller.GetTags)

// ฟังก์ชันดึงข้อมูลทั้งหมดของ Tag
func GetTags(c *gin.Context) {
    var tags []entity.Tag

    db := config.DB()
    results := db.Order("id").Find(&tags)

    if results.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
        return
    }

    c.JSON(http.StatusOK, tags)
}
