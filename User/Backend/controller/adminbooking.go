package controller

import (
	"landchain/config"
	"landchain/entity" // แก้ชื่อ module ให้ตรงกับโปรเจกต์คุณ
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetBookings ดึงข้อมูลการจองทั้งหมดพร้อมชื่อผู้ใช้และเวลา
func GetBookingData(c *gin.Context) {
    db := config.DB()

    var bookings []entity.Booking
    if err := db.Preload("Users").Preload("Time").Preload("ServiceType").Find(&bookings).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // แปลงข้อมูลสำหรับ Frontend
    var result []gin.H
    for _, b := range bookings {
        result = append(result, gin.H{
            "id":             b.ID,
            "date_booking":   b.DateBooking,
            "firstname":      b.Users.Firstname,
            "lastname":      b.Users.Lastname,
            "time_slot":      b.Time.Timework,
            "service_type":   b.ServiceType.Service, // เพิ่มข้อมูล ServiceType
        })
    }

    c.JSON(http.StatusOK, gin.H{"data": result})
}


func GetDataUserForVerify(c *gin.Context) {
    // ดึง bookingID จากพารามิเตอร์
    bookingID := c.Param("bookingID")

    var booking entity.Booking
    // ใช้ Preload เพื่อดึงข้อมูลที่เชื่อมโยงมา
    if err := config.DB().
        Preload("Users").   // ดึงข้อมูลผู้ใช้
        Preload("ServiceType").   // ดึงข้อมูลประเภทบริการ
        First(&booking, bookingID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // ส่งข้อมูลการจองกลับไป
    c.JSON(http.StatusOK, gin.H{
        "firstname":    booking.Users.Firstname,
        "lastname":     booking.Users.Lastname,
        "wallet_id":    booking.Users.Metamaskaddress,
        "service_type": booking.ServiceType.Service,
    })
}



func VerifyWalletID(c *gin.Context) {
    // ดึง bookingID จากพารามิเตอร์
    bookingID := c.Param("bookingID")

    var booking entity.Booking

    // ค้นหาข้อมูลการจองตาม bookingID
    if err := config.DB().First(&booking, bookingID).Error; err != nil {
        // หากไม่พบข้อมูลการจอง
        c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
        return
    }

    // เปลี่ยนสถานะของ Booking เป็น 'verify'
    booking.Status = "verify"

    // บันทึกการอัปเดตสถานะ
    if err := config.DB().Save(&booking).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update booking status"})
        return
    }

    // ส่งคำตอบกลับว่าอัปเดตสำเร็จ
    c.JSON(http.StatusOK, gin.H{
        "message": "Booking status updated to verify",
        "booking_id": bookingID,
        "status": booking.Status,
    })
}


