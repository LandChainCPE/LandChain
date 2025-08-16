package main

import (
	"fmt"
	"strings"
)

// Struct สำหรับเก็บข้อมูล NFT
type LandTitleInfo struct {
	TokenID      uint64
	LandTitleHash string
}

func main() {
	// ข้อมูลที่ได้รับจากฟังก์ชัน getLandTitleInfoByWallet
	data := `"0": "tuple(uint256,string)[]: 0,AutLandHash,1,AutLandHash2"`

	// ลบคีย์ที่ไม่จำเป็นออกจากข้อความ
	processedData := strings.Split(data, ": ")[1] // เอาส่วนหลังของ ": " ออกมา

	// ลบ "tuple(uint256,string)[]" และแยกข้อมูล
	processedData = strings.TrimPrefix(processedData, "tuple(uint256,string)[]: ")
	entries := strings.Split(processedData, ",") // แยกโดยใช้ , 

	// แปลงข้อมูลเป็น struct
	var landTitles []LandTitleInfo

	for i := 0; i < len(entries); i += 2 { // ข้ามทีละ 2 เพราะข้อมูลคือ tokenId, landTitleHash
		tokenID := entries[i]
		landTitleHash := entries[i+1]

		// แปลง tokenId เป็น uint64
		var tokenIDInt uint64
		fmt.Sscanf(tokenID, "%d", &tokenIDInt)

		// เก็บข้อมูลใน struct
		landTitles = append(landTitles, LandTitleInfo{
			TokenID:      tokenIDInt,
			LandTitleHash: landTitleHash,
		})
	}

	// แสดงข้อมูลที่แยกออกมา
	for _, title := range landTitles {
		fmt.Printf("{ %d, %s }\n", title.TokenID, title.LandTitleHash)
	}
}
