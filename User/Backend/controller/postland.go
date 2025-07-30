package controller

import (
	"fmt"
	"landchain/config"
	"landchain/entity" // แก้ชื่อ module ให้ตรงกับโปรเจกต์คุณ
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetBookings ดึงข้อมูลการจองทั้งหมดพร้อมชื่อผู้ใช้และเวลา
// GetAllPostLandData ดึงข้อมูลการขายที่ดินทั้งหมด พร้อมข้อมูลโฉนดที่ดิน (Landtitle)
func GetAllPostLandData(c *gin.Context) {
	db := config.DB()

	var postlands []entity.Landsalepost

	// ดึงเฉพาะข้อมูลจาก Landsalepost ไม่ preload อะไรเลย
	if err := db.Find(&postlands).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโพสต์ขายที่ดินได้"})
		return
	}

	for i, post := range postlands {
		fmt.Printf("Post %d: %+v\n", i+1, post)
	}

	c.JSON(http.StatusOK, postlands)
}
