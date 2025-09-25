package controller

import (
	"fmt"
	"time"

	"landchain/config"
	"landchain/entity"

	"github.com/robfig/cron/v3"
)

// ฟังก์ชันตรวจสอบ Transaction หมดอายุ
func CheckExpiredTransactions() {
	db := config.DB()
	var expiredTxs []entity.Transaction

	// หา Transaction หมดอายุและยังไม่เสร็จ
	db.Where("expire < ? AND typetransaction_id = ?", time.Now(), 1).Find(&expiredTxs)

	for _, tx := range expiredTxs {
		// ปลดล็อกที่ดิน
		if tx.LandID != 0 {
			db.Model(&entity.Landtitle{}).
				Where("id = ?", tx.LandID).
				Update("is_locked", false)
		}

		// อัปเดต Transaction เป็นยกเลิก
		db.Model(&entity.Transaction{}).
			Where("id = ?", tx.ID).
			Update("typetransaction_id", 2)

		// soft delete Transaction
		if err := db.Delete(&tx).Error; err != nil {
			fmt.Printf("ไม่สามารถ soft delete Transaction ID %d: %v\n", tx.ID, err)
		} else {
			fmt.Printf("Transaction ID %d หมดอายุ ถูกยกเลิก และ soft deleted\n", tx.ID)
		}
	}
}

// StartCron เริ่ม Cron Job
func StartCron() *cron.Cron {
	c := cron.New()
	// ทุก 10 นาที
	c.AddFunc("@every 10m", func() {
		fmt.Println("Checking expired transactions at", time.Now())
		CheckExpiredTransactions()
	})
	c.Start()
	return c
}
