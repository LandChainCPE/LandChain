package controller

import (
	"landchain/config"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Struct สำหรับ response ที่มีข้อมูลครบถ้วน
type BookingDetail struct {
	ID          uint   `json:"id"`
	DateBooking string `json:"date_booking"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`

	// ข้อมูลผู้จอง
	UserID    uint   `json:"user_id"`
	UserName  string `json:"user_name"`
	UserEmail string `json:"user_email"`
	UserPhone string `json:"user_phone"`

	// ข้อมูลสาขา
	BranchID   uint   `json:"branch_id"`
	BranchName string `json:"branch"`

	// ข้อมูลจังหวัด
	ProvinceID   uint   `json:"province_id"`
	ProvinceName string `json:"province"`

	// ข้อมูลเวลา
	TimeID    uint   `json:"time_id"`
	TimeSlot  string `json:"timework"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`

	// ข้อมูลประเภทบริการ
	ServiceTypeID   uint   `json:"service_type_id"`
	ServiceTypeName string `json:"service_type_name"`
	ServiceTypeDesc string `json:"service_type_description"`
}

// ดึงข้อมูลการจองของผู้ใช้แบบครบถ้วน
func GetUserBookingsDetail(c *gin.Context) {
	userIDStr := c.Param("userID")

	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil || userID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID"})
		return
	}

	var bookings []BookingDetail

	// ใช้ Raw SQL เพื่อดึงข้อมูลครบถ้วนในครั้งเดียว
	err = config.DB().Raw(`
		SELECT 
			b.id,
			b.date_booking,
			b.status,
			b.created_at,
			b.updated_at,
			
			-- ข้อมูลผู้ใช้
			b.user_id,
			CONCAT(u.first_name, ' ', u.last_name) as user_name,
			u.email as user_email,
			u.phone_number as user_phone,
			
			-- ข้อมูลสาขา
			b.branch_id,
			br.branch as branch_name,
			
			-- ข้อมูลจังหวัด
			br.province_id,
			p.province as province_name,
			
			-- ข้อมูลเวลา
			b.time_id,
			t.timework as time_slot,
			t.start_time,
			t.end_time,
			
			-- ข้อมูลประเภทบริการ
			b.service_type_id,
			st.name as service_type_name,
			st.description as service_type_desc
			
		FROM bookings b
		LEFT JOIN users u ON b.user_id = u.id
		LEFT JOIN branches br ON b.branch_id = br.id
		LEFT JOIN provinces p ON br.province_id = p.id
		LEFT JOIN times t ON b.time_id = t.id
		LEFT JOIN service_types st ON b.service_type_id = st.id
		WHERE b.user_id = ? AND b.deleted_at IS NULL
		ORDER BY b.created_at DESC
	`, userID).Scan(&bookings).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "ไม่สามารถดึงข้อมูลการจองได้",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

