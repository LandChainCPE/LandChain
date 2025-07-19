package controller

import (
	"net/http"
	"time"
	"strconv"
	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
)



func GetBooking(c *gin.Context) {
	var bookings []entity.Booking
	if err := config.DB().Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve bookings"})
		return
	}
	c.JSON(http.StatusOK, bookings)
}

func CreateBooking(c *gin.Context) {
	var booking entity.Booking
	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := config.DB().Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}
	c.JSON(http.StatusCreated, booking)
}

func UpdateBooking(c *gin.Context) {
	var booking entity.Booking
	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	id := c.Param("id")
	if err := config.DB().Model(&booking).Where("id = ?", id).Updates(booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update booking"})
		return
	}
	c.JSON(http.StatusOK, booking)
}

func DeleteBooking(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB().Delete(&entity.Booking{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete booking"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Booking deleted successfully"})
}

// GET /bookings?date=2025-08-01&branchID=1
func GetBookingsByDateAndBranch(c *gin.Context) {
    var bookings []entity.Booking

    // รับค่า date และ branchID จาก query params
    date := c.Query("date")
    branchIDStr := c.Query("branchID")

    // ตรวจสอบว่ามีการส่งค่ามาหรือไม่
    if date == "" || branchIDStr == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing date or branchID"})
        return
    }

    // แปลง branchID เป็น int
    branchID, err := strconv.Atoi(branchIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid branchID"})
        return
    }

    // ตรวจสอบและแปลงรูปแบบวันที่ให้ตรงกับฐานข้อมูล
    // เช่น date ต้องเป็น "YYYY-MM-DD"
    parsedDate, err := time.Parse("2006-01-02", date)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
        return
    }

    // ค้นหาการจองในวันที่และสาขาที่กำหนดที่สถานะเป็น success
    err = config.DB().
        Where("date_booking = ? AND branch_id = ? AND status = ?", parsedDate, branchID, "success").
        Preload("Time").
        Find(&bookings).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // ส่งข้อมูลการจองที่ค้นพบกลับไป
    c.JSON(http.StatusOK, bookings)
}



