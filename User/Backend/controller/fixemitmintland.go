package controller

import (
	"fmt"
	"strings"

	"encoding/json"
	"landchain/config"

	// "landchain/controller"
	"landchain/entity"
	"math/big"
)

// ฟังก์ชันนี้จะรันใน goroutine และวนเช็ค/อัปเดต Landtitle กับ LandVerification ทุก ๆ 5 วินาที
func CheckLandVerificationUpdate() {

	db := config.DB()

	// 1. หา TokenID ที่มากที่สุดจาก Landtitle ที่ LandVerification.Status_onchain = true (ถ้า NULL ให้ข้ามรอบนี้)
	var maxTokenIDPtr *uint
	db.Table("landtitles").
		Joins("JOIN land_verifications ON landtitles.land_verification_id = land_verifications.id").
		Where("land_verifications.status_onchain = ? AND landtitles.token_id IS NOT NULL", true).
		Select("MAX(landtitles.token_id)").
		Scan(&maxTokenIDPtr)

	// If MAX token is NULL set starting point to 0 (search from 0), else start from max+1
	var nextTokenID uint
	if maxTokenIDPtr == nil {
		fmt.Printf("[INFO] MAX TokenID = NULL -> เริ่มตรวจสอบจาก 0\n")
		nextTokenID = 0
	} else {
		fmt.Printf("[DEBUG] MAX TokenID ในฐานข้อมูล = %d\n", *maxTokenIDPtr)
		nextTokenID = *maxTokenIDPtr + 1
	}

	fmt.Printf("[DEBUG] เริ่มตรวจสอบที่ TokenID = %d\n", nextTokenID)

	for {
		// 3. ดึงข้อมูล Metadata จาก Smartcontract ด้วย TokenID ปัจจุบัน
		fmt.Printf("[DEBUG] ดึง Metadata จาก Smartcontract ด้วย TokenID = %d\n", nextTokenID)
		meta, err := ContractInstance.GetLandMetadata(big.NewInt(int64(nextTokenID)))
		if err != nil {
			fmt.Printf("[DEBUG] ไม่พบ TokenID %d ใน Smartcontract หรือเกิด error: %v\n", nextTokenID, err)
			break
		}

		// 4. แยก UUID ออกจาก meta.MetaFields
		uuid := ""
		metaMap := map[string]string{}
		// พยายามแปลงเป็น JSON ก่อน
		if err := json.Unmarshal([]byte(meta.MetaFields), &metaMap); err == nil {
			uuid = metaMap["UUID"]
			fmt.Printf("[DEBUG] UUID (JSON) = %s\n", uuid)
		} else {
			// ถ้าไม่ใช่ JSON ให้แยกด้วย comma แล้วหา UUID
			fields := strings.Split(meta.MetaFields, ",")
			for _, f := range fields {
				kv := strings.SplitN(f, ":", 2)
				if len(kv) == 2 && strings.TrimSpace(kv[0]) == "UUID" {
					uuid = strings.TrimSpace(kv[1])
					break
				}
			}
			fmt.Printf("[DEBUG] UUID (CSV) = %s\n", uuid)
		}
		if uuid == "" {
			fmt.Printf("[DEBUG] ไม่พบ UUID ใน MetaFields ของ TokenID %d\n", nextTokenID)
			nextTokenID++
			continue
		}

		// 5. หา Landtitle ที่ UUID ตรงกัน
		var land entity.Landtitle
		if err := db.Where("uuid = ?", uuid).First(&land).Error; err != nil {
			fmt.Printf("[DEBUG] ไม่พบ Landtitle ที่ UUID = %s\n", uuid)
			nextTokenID++
			continue
		}

		// 6. อัปเดต Landtitle.TokenID ถ้ายังไม่ได้ตั้ง
		if land.TokenID == nil || *land.TokenID != nextTokenID {
			land.TokenID = &nextTokenID
			db.Save(&land)
			// แสดงผล TokenID และ UUID ที่อัปเดต
			fmt.Printf("[UPDATE] Landtitle: TokenID = %d, UUID = %s\n", nextTokenID, uuid)
		}

		// 7. อัปเดต LandVerification.Status_onchain = true ถ้ายังไม่เป็น true
		if land.LandVerificationID != nil {
			var lv entity.LandVerification
			if err := db.First(&lv, *land.LandVerificationID).Error; err == nil {
				if !lv.Status_onchain {
					lv.Status_onchain = true
					db.Save(&lv)
					// แสดงผล TokenID และ UUID ที่อัปเดต LandVerification
					fmt.Printf("[UPDATE] LandVerification: TokenID = %d, UUID = %s\n", nextTokenID, uuid)
				}
			}
		}

		// 8. ไป TokenID ถัดไป
		nextTokenID++
	}

	// 9. ไม่มีการหน่วงเวลา
}