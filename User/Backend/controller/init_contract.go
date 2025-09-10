package controller

import (
	"log"
	"net/http"
	"os"

	"landchain/smartcontract"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-gonic/gin"
)

var ContractInstance *smartcontract.SmartcontractSession

// type WalletRequest struct {
//     Wallet string `json:"wallet"`
// }

func InitContract() {
	rpcURL := os.Getenv("HOLESKY_RPC")
	contractAddr := os.Getenv("CONTRACT_ADDRESS")

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("เชื่อมต่อ Holesky RPC ไม่สำเร็จ: %v", err)
	}

	address := common.HexToAddress(contractAddr)
	contract, err := smartcontract.NewSmartcontract(address, client)
	if err != nil {
		log.Fatalf("เชื่อมต่อ contract ไม่สำเร็จ: %v", err)
	}

	session := &smartcontract.SmartcontractSession{
		Contract: contract,
		CallOpts: bind.CallOpts{
			Pending: true,
		},
	}

	ContractInstance = session
	log.Println("✅ สร้าง session contract สำเร็จ")
}

func GetLandTitleInfoByWallet(c *gin.Context) {
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
		return
	}

	wallet := common.HexToAddress(walletAddr.(string))

	tokenData, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch data", "detail": err.Error()})
		return
	}

	result := make([]string, len(tokenData))
	for i, v := range tokenData {
		result[i] = v.String()
	}

	c.JSON(http.StatusOK, gin.H{
		"wallet": wallet.Hex(),
		"tokens": result,
	})
}

func GetLandMetadataByWallet(c *gin.Context) {
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
		return
	}

	wallet := common.HexToAddress(walletAddr.(string))

	// 1️⃣ ดึง token IDs ของ user
	tokenIDs, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch token IDs", "detail": err.Error()})
		return
	}

	// 2️⃣ สำหรับแต่ละ token ID ดึง metadata
	metadataList := []map[string]interface{}{}
	for _, t := range tokenIDs {
		meta, err := ContractInstance.GetLandMetadata(t)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch metadata", "detail": err.Error()})
			return
		}

		metadataList = append(metadataList, map[string]interface{}{
			"tokenID":    t.String(),
			"metaFields": meta.MetaFields,
			"price":      meta.Price.String(),
			"buyer":      meta.Buyer.Hex(),
		})
	}

	// 3️⃣ Return ข้อมูลทั้งหมด
	c.JSON(http.StatusOK, gin.H{
		"wallet":   wallet.Hex(),
		"metadata": metadataList,
	})
}

// package controller

// import (
// 	"log"
// 	"net/http"
// 	"os"
// 	"landchain/smartcontract"
//     "strings" // 👈 เพิ่ม

// 	"github.com/ethereum/go-ethereum/accounts/abi/bind"
// 	"github.com/ethereum/go-ethereum/common"
// 	"github.com/ethereum/go-ethereum/ethclient"
// 	"github.com/gin-gonic/gin"
// )

// var ContractInstance *smartcontract.SmartcontractSession

// // ฟังก์ชันเชื่อมต่อกับ Smart Contract
// func InitContract() {
// 	rpcURL := os.Getenv("HOLESKY_RPC")
// 	contractAddr := os.Getenv("CONTRACT_ADDRESS")

// 	client, err := ethclient.Dial(rpcURL)
// 	if err != nil {
// 		log.Fatalf("เชื่อมต่อ Holesky RPC ไม่สำเร็จ: %v", err)
// 	}

// 	address := common.HexToAddress(contractAddr)
// 	contract, err := smartcontract.NewSmartcontract(address, client)
// 	if err != nil {
// 		log.Fatalf("เชื่อมต่อ contract ไม่สำเร็จ: %v", err)
// 	}

// 	session := &smartcontract.SmartcontractSession{
// 		Contract: contract,
// 		CallOpts: bind.CallOpts{
// 			Pending: true,
// 		},
// 	}

// 	ContractInstance = session
// 	log.Println("✅ สร้าง session contract สำเร็จ")
// }

// // ฟังก์ชันดึงข้อมูลที่ดินจาก wallet
// func GetLandTitleInfoByWallet(c *gin.Context) {
// 	walletAddr, exists := c.Get("wallet")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
// 		return
// 	}

// 	wallet := common.HexToAddress(walletAddr.(string))

// 	// ดึงข้อมูล token จาก smart contract
// 	tokenData, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch data", "detail": err.Error()})
// 		return
// 	}

// 	// แปลงข้อมูล token ให้เป็นรูปแบบที่เหมาะสม
// 	result := make([]string, len(tokenData))
// 	for i, v := range tokenData {
// 		result[i] = v.String()
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"wallet": wallet.Hex(),
// 		"tokens": result,
// 	})
// }

// // ✅ ตัวช่วย: แปลง [9]string ที่เป็น "Key:Value" แต่ละช่องเป็น map[string]string
// func parseMetaFieldsArray(arr [9]string) map[string]string {
//     m := make(map[string]string, len(arr))
//     for _, s := range arr {
//         s = strings.TrimSpace(s)
//         if s == "" {
//             continue
//         }
//         kv := strings.SplitN(s, ":", 2)
//         if len(kv) != 2 {
//             // ถ้าไม่มี ":" ก็เก็บทั้งสตริงไว้ที่ key "Raw" (กันข้อมูลตกหล่น)
//             // หรือจะข้ามก็ได้ตามต้องการ
//             if _, exists := m["Raw"]; exists {
//                 m["Raw"] = m["Raw"] + ", " + s
//             } else {
//                 m["Raw"] = s
//             }
//             continue
//         }
//         key := strings.TrimSpace(kv[0])
//         val := strings.TrimSpace(kv[1])
//         m[key] = val
//     }
//     return m
// }

// func GetLandMetadataByWallet(c *gin.Context) {
//     walletAddr, exists := c.Get("wallet")
//     if !exists {
//         c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
//         return
//     }

//     wallet := common.HexToAddress(walletAddr.(string))

//     // 1) ดึง token IDs
//     tokenIDs, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
//     if err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch token IDs", "detail": err.Error()})
//         return
//     }

//     // 2) ดึง metadata ของแต่ละ token (รวม tokenId = 0)
//     metadataList := make([]map[string]interface{}, 0, len(tokenIDs))
//     for _, t := range tokenIDs {
//         meta, err := ContractInstance.GetLandMetadata(t)
//         if err != nil {
//             log.Printf("Cannot fetch metadata for tokenID %s: %v", t.String(), err)
//             continue
//         }

//         metaObj := parseMetaFieldsArray(meta.MetaFields) // ✅ แปลงอาเรย์เป็น map

//         metadataList = append(metadataList, map[string]interface{}{
//             "tokenID": t.String(),
//             "price":   meta.Price.String(),
//             "buyer":   meta.Buyer.Hex(),
//             // "walletID": meta.WalletID.Hex(), // ❌ ลบออก: ไม่มีฟิลด์นี้ใน struct
//             "meta":    metaObj,               // ✅ ส่งเป็น object ใช้ง่ายบน FE
//         })
//     }

//     // 3) ส่งกลับ
//     c.JSON(http.StatusOK, gin.H{
//         "wallet":   wallet.Hex(),
//         "metadata": metadataList,
//     })
// }

// package controller

// import (
// 	"bytes"
// 	"compress/gzip"
// 	"encoding/base64"
// 	"fmt"
// 	"log"
// 	"math/big"
// 	"net/http"
// 	"os"
// 	"strings"

// 	"landchain/smartcontract"

// 	"github.com/ethereum/go-ethereum/accounts/abi/bind"
// 	"github.com/ethereum/go-ethereum/common"
// 	"github.com/ethereum/go-ethereum/ethclient"
// 	"github.com/gin-gonic/gin"
// )

// var ContractInstance *smartcontract.SmartcontractSession

// // ========================= InitContract =========================

// func InitContract() {
// 	rpcURL := os.Getenv("HOLESKY_RPC")
// 	contractAddr := os.Getenv("CONTRACT_ADDRESS")

// 	log.Printf("🔌 InitContract: HOLESKY_RPC=%s", rpcURL)
// 	log.Printf("🔗 InitContract: CONTRACT_ADDRESS=%s", contractAddr)

// 	client, err := ethclient.Dial(rpcURL)
// 	if err != nil {
// 		log.Fatalf("เชื่อมต่อ Holesky RPC ไม่สำเร็จ: %v", err)
// 	}

// 	address := common.HexToAddress(contractAddr)
// 	contract, err := smartcontract.NewSmartcontract(address, client)
// 	if err != nil {
// 		log.Fatalf("เชื่อมต่อ contract ไม่สำเร็จ: %v", err)
// 	}

// 	session := &smartcontract.SmartcontractSession{
// 		Contract: contract,
// 		CallOpts: bind.CallOpts{
// 			Pending: true,
// 		},
// 	}

// 	ContractInstance = session
// 	log.Println("✅ สร้าง session contract สำเร็จ")
// }

// // ========================= Helpers =========================

// func bigIntSliceToStrings(ids []*big.Int) []string {
// 	out := make([]string, 0, len(ids))
// 	for _, v := range ids {
// 		if v == nil {
// 			out = append(out, "<nil>")
// 			continue
// 		}
// 		out = append(out, v.String())
// 	}
// 	return out
// }

// // meta.MetaFields เป็น [9]string -> แปลงเป็น map ให้ FE ใช้ง่าย
// func parseMetaFieldsArray(arr [9]string) map[string]string {
// 	m := make(map[string]string, len(arr))
// 	for _, s := range arr {
// 		s = strings.TrimSpace(s)
// 		if s == "" {
// 			continue
// 		}
// 		kv := strings.SplitN(s, ":", 2)
// 		if len(kv) != 2 {
// 			// เก็บ raw ไว้กันตกหล่น
// 			if _, exists := m["Raw"]; exists {
// 				m["Raw"] = m["Raw"] + ", " + s
// 			} else {
// 				m["Raw"] = s
// 			}
// 			continue
// 		}
// 		key := strings.TrimSpace(kv[0])
// 		val := strings.TrimSpace(kv[1])
// 		m[key] = val
// 	}
// 	return m
// }

// // ========================= Handlers =========================

// // ดึง token IDs ของ user พร้อม log รายละเอียด
// func GetLandTitleInfoByWallet(c *gin.Context) {
// 	walletAddr, exists := c.Get("wallet")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
// 		return
// 	}

// 	wallet := common.HexToAddress(walletAddr.(string))
// 	log.Printf("➡️  GetLandTitleInfoByWallet: wallet=%s", wallet.Hex())

// 	tokenData, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
// 	if err != nil {
// 		log.Printf("❌ GetLandTitleInfoByWallet call error: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch data", "detail": err.Error()})
// 		return
// 	}

// 	tokenStrs := bigIntSliceToStrings(tokenData)
// 	log.Printf("🔎 TokenIDs length=%d, values=%v", len(tokenData), tokenStrs)

// 	// ส่งกลับแบบสตริงตรง ๆ (FE จะได้ map ได้ง่าย)
// 	c.JSON(http.StatusOK, gin.H{
// 		"wallet": wallet.Hex(),
// 		"tokens": tokenStrs,
// 		"debug": gin.H{
// 			"length": len(tokenData),
// 			"raw":    tokenStrs,
// 		},
// 	})
// }

// // ดึง metadata ของแต่ละ token ID พร้อม log ทีละตัว
// /* func GetLandMetadataByWallet(c *gin.Context) {
// 	walletAddr, exists := c.Get("wallet")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
// 		return
// 	}
// 	wallet := common.HexToAddress(walletAddr.(string))
// 	log.Printf("➡️  GetLandMetadataByWallet: wallet=%s", wallet.Hex())

// 	// 1) ดึง token IDs
// 	tokenIDs, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
// 	if err != nil {
// 		log.Printf("❌ Cannot fetch token IDs: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch token IDs", "detail": err.Error()})
// 		return
// 	}
// 	tokenStrs := bigIntSliceToStrings(tokenIDs)
// 	log.Printf("🔎 TokenIDs length=%d, values=%v", len(tokenIDs), tokenStrs)

// 	if len(tokenIDs) == 0 {
// 		// กรณีสำคัญ: len=0 ทำให้ metadata เป็น [] เสมอ
// 		log.Printf("⚠️  No token IDs returned for wallet %s", wallet.Hex())
// 		c.JSON(http.StatusOK, gin.H{
// 			"wallet":   wallet.Hex(),
// 			"metadata": []any{},
// 			"debug": gin.H{
// 				"tokenIDs_len": 0,
// 				"tokenIDs_raw": []string{},
// 				"note":         "getLandTitleInfoByWallet returned empty slice; contract may not include tokenId=0 or wallet owns none",
// 			},
// 		})
// 		return
// 	}

// 	// 2) ดึง metadata ของแต่ละ token
// 	metadataList := make([]map[string]interface{}, 0, len(tokenIDs))
// 	for _, t := range tokenIDs {
// 		tok := "<nil>"
// 		if t != nil {
// 			tok = t.String()
// 		}
// 		log.Printf("⏬ Fetching metadata for tokenId=%s ...", tok)
// 		fmt.Printf("metadataList", metadataList)
// 		meta, err := ContractInstance.GetLandMetadata(t)
// 		fmt.Printf("meta", meta)
// 		if err != nil {
// 			log.Printf("❌ Cannot fetch metadata for tokenID %s: %v", tok, err)
// 			// จะข้ามตัวนี้ไป แต่เก็บร่องรอยใน debug output
// 			metadataList = append(metadataList, map[string]interface{}{
// 				"tokenID": tok,
// 				"error":   fmt.Sprintf("Cannot fetch metadata: %v", err),
// 			})
// 			continue
// 		}

// 		metaObj := parseMetaFieldsArray(meta.MetaFields)

// 		// log ให้เห็นของจริงที่ได้จาก chain
// 		log.Printf("✅ tokenId=%s | price=%s | buyer=%s | meta=%v",
// 			tok, meta.Price.String(), meta.Buyer.Hex(), metaObj)

// 		metadataList = append(metadataList, map[string]interface{}{
// 			"tokenID": tok,
// 			"price":   meta.Price.String(),
// 			"buyer":   meta.Buyer.Hex(),
// 			"meta":    metaObj,
// 			"debug": gin.H{
// 				"rawMetaFields": meta.MetaFields, // [9]string ตรงจาก chain (ใช้ดูแยกบรรทัด)
// 			},
// 		})
// 	}

// 	// 3) ส่งกลับ
// 	c.JSON(http.StatusOK, gin.H{
// 		"wallet":   wallet.Hex(),
// 		"metadata": metadataList,
// 		"debug": gin.H{
// 			"tokenIDs": tokenStrs,
// 		},
// 	})
// } */

// // ฟังก์ชันบีบอัดข้อมูลด้วย GZIP
// func compressData(data string) (string, error) {
//     var buf bytes.Buffer
//     gzipWriter := gzip.NewWriter(&buf)
//     _, err := gzipWriter.Write([]byte(data))
//     if err != nil {
//         return "", err
//     }
//     gzipWriter.Close()

//     // เปลี่ยนข้อมูลที่บีบอัดเป็น Base64
//     return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
// }

// func GetLandMetadataByWallet(c *gin.Context) {
//     walletAddr, exists := c.Get("wallet")
//     if !exists {
//         c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
//         return
//     }

//     wallet := common.HexToAddress(walletAddr.(string))
//     log.Printf("➡️  GetLandMetadataByWallet: wallet=%s", wallet.Hex())

//     // 1) ดึง token IDs
//     tokenIDs, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
//     if err != nil {
//         log.Printf("❌ Cannot fetch token IDs: %v", err)
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch token IDs", "detail": err.Error()})
//         return
//     }
//     tokenStrs := bigIntSliceToStrings(tokenIDs)
//     log.Printf("🔎 TokenIDs length=%d, values=%v", len(tokenIDs), tokenStrs)

//     if len(tokenIDs) == 0 {
//         log.Printf("⚠️  No token IDs returned for wallet %s", wallet.Hex())
//         c.JSON(http.StatusOK, gin.H{
//             "wallet":   wallet.Hex(),
//             "metadata": []any{},
//             "debug": gin.H{
//                 "tokenIDs_len": 0,
//                 "tokenIDs_raw": []string{},
//                 "note":         "getLandTitleInfoByWallet returned empty slice; contract may not include tokenId=0 or wallet owns none",
//             },
//         })
//         return
//     }

//     // 2) ดึง metadata ของแต่ละ token
//     metadataList := make([]map[string]interface{}, 0, len(tokenIDs))
//     for _, t := range tokenIDs {
//         tok := "<nil>"
//         if t != nil {
//             tok = t.String()
//         }
//         log.Printf("⏬ Fetching metadata for tokenId=%s ...", tok)

//         meta, err := ContractInstance.GetLandMetadata(t)
//         if err != nil {
//             log.Printf("❌ Cannot fetch metadata for tokenID %s: %v", tok, err)
//             metadataList = append(metadataList, map[string]interface{}{
//                 "tokenID": tok,
//                 "error":   fmt.Sprintf("Cannot fetch metadata: %v", err),
//             })
//             continue
//         }

//         // บีบอัด meta.MetaFields ก่อนส่งกลับ
// 		metaFieldsString := fmt.Sprintf("%v", meta.MetaFields)
// 		log.Printf("Original meta fields size: %d bytes", len(metaFieldsString))

// 		compressedMeta, err := compressData(metaFieldsString)
// 		if err != nil {
// 			log.Printf("❌ Failed to compress metadata for tokenID %s: %v", tok, err)
// 			metadataList = append(metadataList, map[string]interface{}{
// 				"tokenID": tok,
// 				"error":   fmt.Sprintf("Failed to compress metadata: %v", err),
// 			})
// 			continue
// 		}

//         // log ให้เห็นข้อมูลที่บีบอัด
//         log.Printf("✅ tokenId=%s | price=%s | buyer=%s | compressed_meta=%v",
//             tok, meta.Price.String(), meta.Buyer.Hex(), compressedMeta)

//         metadataList = append(metadataList, map[string]interface{}{
//             "tokenID": tok,
//             "price":   meta.Price.String(),
//             "buyer":   meta.Buyer.Hex(),
//             "metadata": compressedMeta, // ส่งข้อมูลที่บีบอัดไปยัง Frontend
//             "debug": gin.H{
//                 "rawMetaFields": meta.MetaFields, // [9]string ตรงจาก chain
//             },
//         })
//     }

//     c.JSON(http.StatusOK, gin.H{
//         "wallet":   wallet.Hex(),
//         "metadata": metadataList,
//         "debug": gin.H{
//             "tokenIDs": tokenStrs,
//         },
//     })
// }