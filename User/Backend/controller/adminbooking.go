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
    if err := db.Preload("Users").Preload("Time").Preload("ServiceType").Preload("Branch").Find(&bookings).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // Convert the data for Frontend
    var result []gin.H
    for _, b := range bookings {
        result = append(result, gin.H{
            "id":            b.ID,
            "date_booking":  b.DateBooking,
            "user_name":     b.Users.Firstname,
            "time_slot":     b.Time.Timework,
            "service_type":  b.ServiceType.Service,  // Add service type name
            "branch_name":   b.Branch.Branch,        // Add branch name
            "typeofservice": b.ServiceType,
        })
    }

    c.JSON(http.StatusOK, gin.H{"data": result})
}
