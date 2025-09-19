package controller

import (
	"net/http"
	"time"
	"strconv"
	"landchain/config"
	"landchain/entity"
	"github.com/gin-gonic/gin"
	"log"
	"strings"
	
	"fmt"
	//"strings"
	//"gorm.io/gorm"

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

	// ปรับปรุงการแปลงวันที่ให้ใช้ timezone ที่ถูกต้อง
	parsedDate, err := parseDateFromDB(booking.DateBooking)
	if err != nil {
		return false, "", err
	}

	// ใช้ timezone Asia/Bangkok
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		loc = time.Local
	}

	fullTimeStr := fmt.Sprintf("%s %s", parsedDate.Format("2006-01-02"), timeSlot.Timework)
	fullTime, err := time.ParseInLocation("2006-01-02 15:04", fullTimeStr, loc)
	if err != nil {
		return false, "", err
	}

	now := time.Now().In(loc)
	if now.Before(fullTime) {
		return true, "คุณมีการจองไว้อยู่แล้ว จะจองได้อีกก็ต่อเมื่อถึงวันนัด หรือติดต่อเจ้าหน้าที่หากต้องการเลื่อนนัด", nil
	}

	// ถ้าเลยเวลาแล้ว
	return false, "", nil
}

func CheckBookingStatus(c *gin.Context) {
    userIDStr := c.DefaultQuery("userID", "") // รับ userID จาก query parameter
    branchIDStr := c.DefaultQuery("branchID", "") // รับ branchID จาก query parameter
    date := c.DefaultQuery("date", "") // รับ date จาก query parameter

    // แปลง userID และ branchID เป็นตัวเลข (uint)
    userID, err := strconv.ParseUint(userIDStr, 10, 64)
    if err != nil || userID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID"})
        return
    }

    branchID, err := strconv.ParseUint(branchIDStr, 10, 64)
    if err != nil || branchID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid branchID"})
        return
    }

    // ค้นหาการจองที่ตรงกับข้อมูลที่ผู้ใช้เลือก
    var bookings []entity.Booking
    err = config.DB().Where("user_id = ? AND branch_id = ? AND date_booking = ?",
        userID, branchID, date).Find(&bookings).Error

    if err != nil {
        if err.Error() == "record not found" {
            // ส่งคืนเป็น array เปล่าเมื่อไม่พบการจอง
            c.JSON(http.StatusOK, []gin.H{})  // ส่ง array เปล่า
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการจองได้"})
        }
        return
    }

    // สร้าง map สำหรับสถานะของการจองในแต่ละ time_id
    statusMap := make(map[int]string) // ใช้ time_id เป็น key
    for _, booking := range bookings {
        statusMap[int(booking.TimeID)] = booking.Status // mapping time_id กับสถานะการจอง
    }

    // สร้าง response ที่ประกอบไปด้วยเวลา (time_slot) และสถานะการจอง
    var timeSlots []entity.Time
    err = config.DB().Find(&timeSlots).Error // ดึงข้อมูลช่วงเวลา (time slots)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลช่วงเวลาได้"})
        return
    }

    // สร้าง response ให้ส่งกลับ
    response := make([]gin.H, len(timeSlots))
    for i, timeSlot := range timeSlots {
        status := "available" // กำหนดสถานะเริ่มต้นเป็น "available"
        if bookingStatus, exists := statusMap[int(timeSlot.ID)]; exists {
            status = bookingStatus // เปลี่ยนสถานะตามที่มีการจอง
        }
        response[i] = gin.H{
            "time_slot": timeSlot.Timework,
            "status":    status, // สถานะที่ได้ ("pending", "confirmed", "cancelled", "available")
            "time_id":   timeSlot.ID,
        }
    }

    c.JSON(http.StatusOK, response)  // ส่งข้อมูลที่ได้กลับไปในรูปแบบ array
}

func extractStartTime(timework string) string {
	// แยกด้วย " - " และเอาส่วนแรก
	parts := strings.Split(timework, " - ")
	if len(parts) > 0 {
		return strings.TrimSpace(parts[0])
	}
	return timework // ถ้าแยกไม่ได้ ให้คืนค่าเดิม
}

// ฟังก์ชันช่วยในการแปลงวันที่จากฐานข้อมูล
func parseDateFromDB(dateStr string) (time.Time, error) {
	// ลองแปลงในหลายรูปแบบที่เป็นไปได้ (เรียงลำดับตามความนิยม)
	formats := []string{
		"2006-01-02T15:04:05Z",         // ISO 8601 with UTC timezone (มักใช้ใน PostgreSQL)
		"2006-01-02T15:04:05.000Z",     // ISO 8601 with milliseconds and UTC
		"2006-01-02T15:04:05+07:00",    // ISO 8601 with Asia/Bangkok timezone
		"2006-01-02T15:04:05",          // ISO 8601 without timezone
		"2006-01-02 15:04:05",          // SQL timestamp format
		"2006-01-02",                   // Simple date format
		time.RFC3339,                   // RFC3339 format
		time.RFC3339Nano,               // RFC3339 with nanoseconds
	}
	
	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			// แปลงเป็น local timezone (Asia/Bangkok) ถ้าจำเป็น
			loc, _ := time.LoadLocation("Asia/Bangkok")
			return t.In(loc), nil
		}
	}
	
	return time.Time{}, fmt.Errorf("unable to parse date format: %s", dateStr)
}

// ฟังก์ชันหลักสำหรับลบการจองที่หมดอายุ (ปรับปรุงใหม่)
func DeleteExpiredBookingsInternal() (int64, error) {
	// ใช้ timezone ที่ตรงกับฐานข้อมูล (Asia/Bangkok)
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		loc = time.Local // fallback to local time
	}
	now := time.Now().In(loc)
	
	log.Printf("Current time (Bangkok): %s", now.Format("2006-01-02 15:04:05"))
	
	// Query เพื่อหาการจองที่หมดอายุ
	var expiredBookings []struct {
		ID uint
		DateBooking string
		Timework string
		UserID uint
		BranchID uint
		Status string
	}
	
	err = config.DB().
		Table("bookings").
		Select("bookings.id, bookings.date_booking, times.timework, bookings.user_id, bookings.branch_id, bookings.status").
		Joins("JOIN times ON bookings.time_id = times.id").
		Where("bookings.status IN (?)", []string{"pending", "success"}). // เฉพาะการจองที่ active
		Find(&expiredBookings).Error
	
	if err != nil {
		log.Printf("Error finding bookings: %v", err)
		return 0, err
	}

	var expiredIDs []uint
	
	// ตรวจสอบแต่ละการจองว่าหมดอายุหรือไม่
	for _, booking := range expiredBookings {
		// ใช้ฟังก์ชันช่วยในการแปลงวันที่
		parsedDate, err := parseDateFromDB(booking.DateBooking)
		if err != nil {
			log.Printf("Error parsing date for booking %d (%s): %v", booking.ID, booking.DateBooking, err)
			continue
		}
		
		// แยกเวลาเริ่มต้นจาก timework
		startTime := extractStartTime(booking.Timework)
		
		// รวมวันที่และเวลา
		fullTimeStr := fmt.Sprintf("%s %s", parsedDate.Format("2006-01-02"), startTime)
		
		// แปลงเป็น time.Time ในเขต Asia/Bangkok
		fullTime, err := time.ParseInLocation("2006-01-02 15:04", fullTimeStr, loc)
		if err != nil {
			log.Printf("Error parsing time for booking %d: %v", booking.ID, err)
			continue
		}
		
		// ตรวจสอบว่าเวลาผ่านมาแล้วหรือไม่
		if now.After(fullTime) {
			expiredIDs = append(expiredIDs, booking.ID)
			log.Printf("Found expired booking: ID=%d, DateTime=%s, Status=%s", booking.ID, fullTimeStr, booking.Status)
		}
	}

	if len(expiredIDs) == 0 {
		log.Println("No expired bookings found")
		return 0, nil
	}

	// ลบการจองที่หมดอายุ
	result := config.DB().Where("id IN ?", expiredIDs).Delete(&entity.Booking{})
	
	if result.Error != nil {
		log.Printf("Error deleting expired bookings: %v", result.Error)
		return 0, result.Error
	}

	log.Printf("Successfully deleted %d expired bookings (IDs: %v)", result.RowsAffected, expiredIDs)
	return result.RowsAffected, nil
}

// ฟังก์ชันสำหรับลบการจองที่หมดอายุ (เรียกใช้ผ่าน API)
func DeleteExpiredBookingsManual(c *gin.Context) {
	deletedCount, err := DeleteExpiredBookingsInternal()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถลบการจองที่หมดอายุได้",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบการจองที่หมดอายุสำเร็จ",
		"deleted_count": deletedCount,
	})
}

// ฟังก์ชัน Scheduler (รันทุกนาที)
func StartBookingCleanupScheduler() {
	go func() {
		ticker := time.NewTicker(1 * time.Minute) // รันทุกนาที
		defer ticker.Stop()

		for range ticker.C {
			log.Println("⏰ Running automatic booking cleanup...")
			deletedCount, err := DeleteExpiredBookingsInternal()
			if err != nil {
				log.Printf("❌ Automatic cleanup failed: %v", err)
			} else if deletedCount > 0 {
				log.Printf("✅ Automatic cleanup: deleted %d expired bookings", deletedCount)
			} else {
				log.Println("✅ Automatic cleanup: no expired bookings found")
			}
		}
	}()
}

// ฟังก์ชันสำหรับลบการจองที่หมดอายุในวันที่กำหนด
func DeleteExpiredBookingsByDate(c *gin.Context) {
	date := c.Query("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date parameter is required (format: YYYY-MM-DD)"})
		return
	}

	// ตรวจสอบรูปแบบวันที่
	_, err := time.Parse("2006-01-02", date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	now := time.Now()
	
	// ค้นหาการจองในวันที่กำหนด
	var bookingsInDate []struct {
		ID uint
		DateBooking string
		Timework string
		UserID uint
		BranchID uint
	}
	
	err = config.DB().
		Table("bookings").
		Select("bookings.id, bookings.date_booking, times.timework, bookings.user_id, bookings.branch_id").
		Joins("JOIN times ON bookings.time_id = times.id").
		Where("bookings.date_booking = ?", date).
		Find(&bookingsInDate).Error
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถดึงข้อมูลการจองได้",
			"details": err.Error(),
		})
		return
	}

	var expiredIDs []uint
	
	// ตรวจสอบว่าการจองไหนหมดอายุ
	for _, booking := range bookingsInDate {
		// ใช้ฟังก์ชันช่วยในการแปลงวันที่
		parsedDate, err := parseDateFromDB(booking.DateBooking)
		if err != nil {
			log.Printf("Error parsing date for booking %d: %v", booking.ID, err)
			continue
		}
		
		startTime := extractStartTime(booking.Timework)
		fullTimeStr := fmt.Sprintf("%s %s", parsedDate.Format("2006-01-02"), startTime)
		fullTime, err := time.Parse("2006-01-02 15:04", fullTimeStr)
		if err != nil {
			log.Printf("Error parsing time: %v", err)
			continue
		}
		
		if now.After(fullTime) {
			expiredIDs = append(expiredIDs, booking.ID)
		}
	}

	if len(expiredIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": "ไม่พบการจองที่หมดอายุในวันที่กำหนด",
			"date": date,
			"deleted_count": 0,
		})
		return
	}

	// ลบการจองที่หมดอายุ
	result := config.DB().Where("id IN ?", expiredIDs).Delete(&entity.Booking{})
	
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถลบการจองได้",
			"details": result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบการจองที่หมดอายุสำเร็จ",
		"date": date,
		"deleted_count": result.RowsAffected,
		"deleted_ids": expiredIDs,
	})
}

// ฟังก์ชันตรวจสอบการจองที่กำลังจะหมดอายุ
func GetUpcomingExpiredBookings(c *gin.Context) {
	minutesAhead := 30 // ตรวจสอบ 30 นาทีข้างหน้า
	
	now := time.Now()
	futureTime := now.Add(time.Duration(minutesAhead) * time.Minute)
	
	var allBookings []struct {
		ID uint `json:"id"`
		DateBooking string `json:"date_booking"`
		Status string `json:"status"`
		Timework string `json:"timework"`
		UserID uint `json:"user_id"`
		BranchID uint `json:"branch_id"`
	}
	
	err := config.DB().
		Table("bookings").
		Select("bookings.id, bookings.date_booking, bookings.status, times.timework, bookings.user_id, bookings.branch_id").
		Joins("JOIN times ON bookings.time_id = times.id").
		Find(&allBookings).Error
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}

	var upcomingExpired []interface{}
	
	// ตรวจสอบการจองที่จะหมดอายุ
	for _, booking := range allBookings {
		// ใช้ฟังก์ชันช่วยในการแปลงวันที่
		parsedDate, err := parseDateFromDB(booking.DateBooking)
		if err != nil {
			log.Printf("Error parsing date for booking %d: %v", booking.ID, err)
			continue
		}
		
		startTime := extractStartTime(booking.Timework)
		fullTimeStr := fmt.Sprintf("%s %s", parsedDate.Format("2006-01-02"), startTime)
		fullTime, err := time.Parse("2006-01-02 15:04", fullTimeStr)
		if err != nil {
			continue
		}
		
		// ตรวจสอบว่าอยู่ในช่วงที่กำหนด
		if fullTime.After(now) && fullTime.Before(futureTime) {
			upcomingExpired = append(upcomingExpired, map[string]interface{}{
				"id": booking.ID,
				"date_booking": booking.DateBooking,
				"status": booking.Status,
				"timework": booking.Timework,
				"start_time": startTime,
				"full_datetime": fullTimeStr,
				"user_id": booking.UserID,
				"branch_id": booking.BranchID,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("การจองที่จะหมดอายุใน %d นาทีข้างหน้า", minutesAhead),
		"current_time": now.Format("2006-01-02 15:04:05"),
		"check_until": futureTime.Format("2006-01-02 15:04:05"),
		"bookings": upcomingExpired,
		"count": len(upcomingExpired),
	})
}


func GetUserBookings(c *gin.Context) {
    // รับ userID จาก URL parameter
    userIDStr := c.Param("userID")

    // แปลง userID เป็นตัวเลข (uint)
    userID, err := strconv.ParseUint(userIDStr, 10, 64)
    if err != nil || userID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID"})
        return
    }

    // ใช้ Raw SQL Query ที่คุณทดสอบแล้วใน database
    var bookings []struct {
        ID          uint      `json:"id"`
        UserID      uint      `json:"user_id"`
        DateBooking string    `json:"date_booking"`
        Status      string    `json:"status"`
        CreatedAt   time.Time `json:"created_at"`
        UpdatedAt   time.Time `json:"updated_at"`
        Branch      string    `json:"branch"`
        Timework    string    `json:"timework"`
        Province    string    `json:"province"`
    }

    // ใช้ Raw SQL ที่ทดสอบแล้ว
    err = config.DB().Raw(`
        SELECT 
            b.id, 
            b.user_id, 
            b.date_booking, 
            b.status, 
            b.created_at, 
            b.updated_at, 
            br.branch, 
            t.timework, 
            p.province
        FROM 
            bookings b
        JOIN 
            branches br ON b.branch_id = br.id
        JOIN 
            times t ON b.time_id = t.id
        JOIN 
            provinces p ON br.province_id = p.id
        WHERE 
            b.user_id = ? AND b.deleted_at IS NULL
        ORDER BY b.created_at DESC
    `, userID).Scan(&bookings).Error

    if err != nil {
        log.Printf("Error fetching user bookings: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการจองได้"})
        return
    }

    // ส่งข้อมูลการจองที่ยังไม่ถูกลบกลับไป
    c.JSON(http.StatusOK, bookings)
}

// วิธีที่ 2: ใช้ GORM Preload (Alternative approach)
func GetUserBookingsPreload(c *gin.Context) {
    userIDStr := c.Param("userID")
    userID, err := strconv.ParseUint(userIDStr, 10, 64)
    if err != nil || userID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID"})
        return
    }

    var bookings []entity.Booking
    
    err = config.DB().
        Preload("Branch.Province").
        Preload("Time").
        Where("user_id = ?", userID).
        Find(&bookings).Error

    if err != nil {
        log.Printf("Error fetching user bookings with preload: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการจองได้"})
        return
    }

    // Transform ข้อมูลให้อยู่ในรูปแบบที่ต้องการ
    var result []map[string]interface{}
    for _, booking := range bookings {
        result = append(result, map[string]interface{}{
            "id":           booking.ID,
            "user_id":      booking.UserID,
            "date_booking": booking.DateBooking,
            "status":       booking.Status,
            "created_at":   booking.CreatedAt,
            "updated_at":   booking.UpdatedAt,
            "branch":       booking.Branch.Branch,
            "timework":     booking.Time.Timework,
            "province":     booking.Branch.Province.Province,
        })
    }

    c.JSON(http.StatusOK, result)
}

// วิธีที่ 3: Debug version - เพื่อตรวจสอบว่าข้อมูลมีครบหรือไม่
func GetUserBookingsDebug(c *gin.Context) {
    userIDStr := c.Param("userID")
    userID, err := strconv.ParseUint(userIDStr, 10, 64)
    if err != nil || userID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID"})
        return
    }

    // ตรวจสอบข้อมูลทีละขั้น
    
    // 1. ตรวจสอบ bookings ของ user
    var bookings []entity.Booking
    err = config.DB().Where("user_id = ?", userID).Find(&bookings).Error
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching bookings"})
        return
    }

    // 2. ดึงข้อมูลแต่ละ booking พร้อม relations
    var result []map[string]interface{}
    for _, booking := range bookings {
        var branch entity.Branch
        var province entity.Province
        var timeSlot entity.Time

        // ดึงข้อมูล branch
        config.DB().First(&branch, booking.BranchID)
        
        // ดึงข้อมูล province
        config.DB().First(&province, branch.ProvinceID)
        
        // ดึงข้อมูล time
        config.DB().First(&timeSlot, booking.TimeID)

        result = append(result, map[string]interface{}{
            "id":           booking.ID,
            "user_id":      booking.UserID,
            "date_booking": booking.DateBooking,
            "status":       booking.Status,
            "created_at":   booking.CreatedAt,
            "updated_at":   booking.UpdatedAt,
            "branch":       branch.Branch,
            "branch_id":    branch.ID,
            "province_id":  branch.ProvinceID,
            "province":     province.Province,
            "timework":     timeSlot.Timework,
            "time_id":      timeSlot.ID,
        })
    }

    c.JSON(http.StatusOK, map[string]interface{}{
        "bookings": result,
        "count":    len(result),
    })
}





















