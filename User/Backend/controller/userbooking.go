package controller

import (
	"net/http"
	"time"
	"strconv"
	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
	"fmt"

)

// ฟังก์ชันตรวจสอบว่าในช่วงเวลา (time_id) นั้นๆ มีการจองครบ 5 คนหรือไม่
func isBookingFull(timeID uint, dateBooking string, branchID uint) bool {
    var bookingCount int64

    // ค้นหาจำนวนการจองในช่วงเวลานั้นๆ สำหรับสาขาที่เลือก โดยตรวจสอบสถานะว่าเป็น "success"
    err := config.DB().Model(&entity.Booking{}).Where("time_id = ? AND date_booking = ? AND branch_id = ? AND status = ?", timeID, dateBooking, branchID, "success").Count(&bookingCount).Error

    if err != nil {
        // ถ้ามีข้อผิดพลาดในการ query
        return false
    }

    // ถ้าจำนวนการจองที่มีสถานะ success ถึง 5 คนแล้ว, คืนค่า true
    return bookingCount >= 5
}



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

	// ❗️ 1. ตรวจสอบว่าผู้ใช้มีการจองที่ยังไม่หมดเวลาอยู่หรือไม่
	hasBooking, msg, err := HasActiveBooking(booking.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การจอง"})
		return
	}
	if hasBooking {
		// ถ้ามีการจองที่ยังไม่หมดเวลา
		c.JSON(http.StatusBadRequest, gin.H{"message": msg})
		return
	}

	// ❗️ 2. ตรวจสอบว่าช่วงเวลานี้มีคนจองครบ 5 คนแล้วหรือยัง
	if isBookingFull(booking.TimeID, booking.DateBooking, booking.BranchID) {
		c.JSON(http.StatusConflict, gin.H{"message": "ช่วงเวลานี้ถูกจองครบ 5 คนแล้ว"})
		return
	}

	// ✅ ถ้าผ่านทั้ง 2 เงื่อนไข → บันทึกการจอง
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

func CheckAvailableSlots(c *gin.Context) {
	// รับค่าจาก query string
	date := c.Query("date")
	branchIDStr := c.Query("branchID")
	timeIDStr := c.Query("timeID")

	// ตรวจสอบว่าครบทุกค่าหรือยัง
	if date == "" || branchIDStr == "" || timeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing date, branchID or timeID"})
		return
	}

	// แปลง string → int
	branchID, err1 := strconv.Atoi(branchIDStr)
	timeID, err2 := strconv.Atoi(timeIDStr)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid branchID or timeID"})
		return
	}

	// นับเฉพาะการจองที่ status = "success"
	var count int64
	err := config.DB().
		Model(&entity.Booking{}).
		Where("date_booking = ? AND branch_id = ? AND time_id = ? AND status = ?", date, branchID, timeID, "success").
		Count(&count).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// ลบจาก 5 เพื่อหาที่ว่าง
	remainingSlots := 5 - count
	if remainingSlots < 0 {
		remainingSlots = 0
	}

	// ตอบกลับ
	c.JSON(http.StatusOK, gin.H{
		"total_bookings":  count,
		"available_slots": remainingSlots,
	})
}


func HasActiveBooking(userID uint) (bool, string, error) {
	var booking entity.Booking

	// 1. ตรวจสอบการจองที่รออนุมัติ (pending)
	err := config.DB().
		Where("user_id = ? AND status = ?", userID, "pending").
		Order("date_booking DESC").
		First(&booking).Error

	if err == nil {
		return true, "คุณมีการจองที่รออนุมัติอยู่ กรุณารอการยืนยันก่อน", nil
	}

	// 2. ตรวจสอบการจองที่อนุมัติแล้ว (success)
	err = config.DB().
		Where("user_id = ? AND status = ?", userID, "success").
		Order("date_booking DESC").
		First(&booking).Error

	if err != nil {
		return false, "", nil // ไม่มีการจองใด ๆ
	}

	// 3. ตรวจสอบเวลาที่นัด
	var timeSlot entity.Time
	if err := config.DB().First(&timeSlot, booking.TimeID).Error; err != nil {
		return false, "", err
	}

	parsedDate, err := time.Parse("2006-01-02", booking.DateBooking)
	if err != nil {
		return false, "", err
	}

	fullTimeStr := fmt.Sprintf("%s %s", parsedDate.Format("2006-01-02"), timeSlot.Timework)
	fullTime, err := time.Parse("2006-01-02 15:04", fullTimeStr)
	if err != nil {
		return false, "", err
	}

	if time.Now().Before(fullTime) {
		return true, "คุณมีการจองไว้อยู่แล้ว จะจองได้อีกก็ต่อเมื่อถึงวันนัด หรือติดต่อเจ้าหน้าที่หากต้องการเลื่อนนัด", nil
	}

	// ถ้าเลยเวลาแล้ว
	return false, "", nil
}


func GetBookingStatus(c *gin.Context) {
    // รับ userID จาก URL parameter หรือ Query parameter
    userID := c.Param("id")
    if userID == "" {
        userID = c.Query("userID") // สำหรับกรณีที่ส่งมาเป็น query parameter
    }
    
    if userID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
        return
    }
    
    // ค้นหาการจองของ userID นี้
    var bookings []entity.Booking
    err := config.DB().Preload("TimeSlot").Preload("Branch").Preload("ServiceType").Where("user_id = ?", userID).Find(&bookings).Error
    
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการจองได้"})
        return
    }

    // ส่งข้อมูลการจองทั้งหมด (รวมทุกสถานะ)
    c.JSON(http.StatusOK, bookings)
}



















