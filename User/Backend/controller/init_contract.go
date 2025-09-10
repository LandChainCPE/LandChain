package controller

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"strconv"

	"landchain/config"
	"landchain/entity"

	"landchain/smartcontract"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"

	"github.com/ethereum/go-ethereum/crypto"
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
	log.Println("address", address)
	contract, err := smartcontract.NewSmartcontract(address, client)
	if err != nil {
		log.Fatalf("เชื่อมต่อ contract ไม่สำเร็จ: %v", err)
	}

	privateKey := os.Getenv("PRIVATE_KEY")
	key, err := crypto.HexToECDSA(privateKey[2:])
	if err != nil {
		log.Fatalf("Invalid private key: %v", err)
	}

	chainID, err := client.ChainID(context.Background())
	if err != nil {
		log.Fatalf("ดึง chain ID ไม่สำเร็จ: %v", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(key, chainID)
	if err != nil {
		log.Fatalf("สร้าง auth ไม่สำเร็จ: %v", err)
	}

	// ✅ ตั้ง gas limit และ gas price
	auth.GasLimit = uint64(300_000)
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatalf("ดึง gas price ไม่สำเร็จ: %v", err)
	}
	auth.GasPrice = gasPrice

	session := &smartcontract.SmartcontractSession{
		Contract: contract,
		CallOpts: bind.CallOpts{
			Pending: true,
			Context: context.Background(), // เพิ่ม context
		},
		TransactOpts: *auth,
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

	// 1️⃣ ดึง token IDs ของ user จาก contract
	tokenIDs, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Cannot fetch token IDs",
			"detail": err.Error(),
		})
		return
	}

	// 2️⃣ ดึง landtitle จาก database
	db := config.DB()
	var lands []entity.Landtitle
	if err := db.Where("token_id IN ?", tokenIDs).Find(&lands).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch landtitle", "detail": err.Error()})
		return
	}

	// map LandID -> IsLocked
	lockedMap := make(map[string]bool)
	for _, l := range lands {
		lockedMap[strconv.FormatUint(uint64(l.TokenID), 10)] = l.IsLocked
	}

	// 3️⃣ ดึง metadata จาก contract และ merge IsLocked
	metadataList := []map[string]interface{}{}
	for _, t := range tokenIDs {
		meta, err := ContractInstance.GetLandMetadata(t)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":  "Cannot fetch metadata",
				"detail": err.Error(),
			})
			return
		}

		tokenIDStr := t.String()
		isLocked := lockedMap[tokenIDStr] // เอา IsLocked จาก landtitle จริง

		metadataList = append(metadataList, map[string]interface{}{
			"tokenID":    tokenIDStr,
			"metaFields": meta.MetaFields,
			"price":      meta.Price.String(),
			"buyer":      meta.Buyer.Hex(),
			"walletID":   meta.WalletID.Hex(),
			"isLocked":   isLocked, // 🔹 จาก landtitle
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"wallet":   wallet.Hex(),
		"metadata": metadataList,
	})
}

type MetadataStruct struct {
	TokenID    *big.Int
	MetaFields string
	Price      *big.Float
	Buyer      string
	WalletID   string
}

// GetMultipleLandMetadata ดึงข้อมูลหลาย token
func GetMultipleLandMetadata(contract *smartcontract.Smartcontract, tokenIDs []*big.Int) ([]MetadataStruct, error) {
	var result []MetadataStruct

	for _, tokenID := range tokenIDs {
		meta, err := contract.GetLandMetadata(&bind.CallOpts{}, tokenID) // ใช้ CallOpts
		if err != nil {
			fmt.Println("Error getting metadata for token", tokenID, ":", err)
			continue
		}

		priceETH := new(big.Float).Quo(new(big.Float).SetInt(meta.Price), big.NewFloat(1e18))

		data := MetadataStruct{
			TokenID:    tokenID,
			MetaFields: meta.MetaFields,
			Price:      priceETH,
			Buyer:      meta.Buyer.Hex(),
			WalletID:   meta.WalletID.Hex(),
		}

		result = append(result, data)
	}

	return result, nil
}

type TokenRequest struct {
	TokenIDs []int64 `json:"tokenIDs"`
}

func GetMultipleLandMetadataHandler(c *gin.Context) {
	var req TokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// แปลง []int64 เป็น []*big.Int
	var tokenIDs []*big.Int
	for _, id := range req.TokenIDs {
		tokenIDs = append(tokenIDs, big.NewInt(id))
	}

	// ✅ ใช้ ContractInstance แทน contract
	data, err := GetMultipleLandMetadata(ContractInstance.Contract, tokenIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}

func GetLandMetadataByToken(c *gin.Context) {
	if ContractInstance == nil {
		c.JSON(503, gin.H{"error": "contract not initialized"})
		return
	}

	var req struct {
		TokenID string `json:"tokenID"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request", "detail": err.Error()})
		return
	}

	if req.TokenID == "" {
		c.JSON(400, gin.H{"error": "tokenID is required"})
		return
	}

	tokenID := new(big.Int)
	if _, ok := tokenID.SetString(req.TokenID, 10); !ok {
		c.JSON(400, gin.H{"error": "invalid tokenID format"})
		return
	}

	meta, err := ContractInstance.GetLandMetadata(tokenID)
	if err != nil {
		c.JSON(500, gin.H{"error": "cannot fetch metadata", "detail": err.Error()})
		return
	}

	// รวม meta.MetaFields เป็น string เดียว (คั่นด้วย comma)

	log.Printf("metaFields: %s", meta.MetaFields)
	log.Printf("price: %s", meta.Price.String())
	log.Printf("buyer: %s", meta.Buyer.Hex())
	log.Printf("walletID: %s", meta.WalletID.Hex())

	c.JSON(200, gin.H{
		"metaFields": meta.MetaFields,
		"price":      meta.Price.String(),
		"buyer":      meta.Buyer.Hex(),
		"walletID":   meta.WalletID.Hex(),
	})

}

// package controller

// import (
// import "math/big"
// 	"bytes"
// 	"context"
// 	"encoding/hex"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"os"
// 	"time"

// 	"landchain/smartcontract"

// 	"github.com/ethereum/go-ethereum"
// 	"github.com/ethereum/go-ethereum/accounts/abi"
// 	"github.com/ethereum/go-ethereum/accounts/abi/bind"
// 	"github.com/ethereum/go-ethereum/common"
// 	"github.com/ethereum/go-ethereum/ethclient"
// 	"github.com/gin-gonic/gin"
// )

// var (
// 	ContractInstance *smartcontract.SmartcontractSession
// 	ethClient        *ethclient.Client
// 	contractAddr     common.Address
// )

// // ===== Helpers =====

// func VerifyContract(client *ethclient.Client, addr common.Address) error {
// 	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
// 	defer cancel()

// 	chainID, err := client.ChainID(ctx)
// 	if err != nil {
// 		return fmt.Errorf("get chain id: %w", err)
// 	}
// 	log.Println("ℹ️ ChainID:", chainID.String())

// 	code, err := client.CodeAt(ctx, addr, nil)
// 	if err != nil {
// 		return fmt.Errorf("eth_getCode failed: %w", err)
// 	}
// 	if len(code) == 0 {
// 		return fmt.Errorf("no contract code at %s (wrong network/address)", addr.Hex())
// 	}
// 	log.Printf("✅ Contract code len=%d at %s\n", len(code), addr.Hex())
// 	return nil
// }

// // debug: เรียก eth_call แบบดิบ ๆ เพื่อดู raw return และตรวจ revert
// func callRaw(ctx context.Context, client *ethclient.Client, to common.Address, data []byte) ([]byte, error) {
// 	msg := ethereum.CallMsg{To: &to, Data: data}
// 	out, err := client.CallContract(ctx, msg, nil)
// 	if err != nil {
// 		return nil, err
// 	}
// 	log.Printf("RAW RETURN: 0x%s\n", hex.EncodeToString(out))

// 	// detect revert (Error(string) selector = 0x08c379a0)
// 	if len(out) >= 4 && bytes.Equal(out[:4], []byte{0x08, 0xc3, 0x79, 0xa0}) {
// 		if reason, err := abi.UnpackRevert(out); err == nil {
// 			return nil, fmt.Errorf("EVM revert: %s", reason)
// 		}
// 		return nil, fmt.Errorf("EVM revert (unknown reason)")
// 	}
// 	return out, nil
// }

// func ctxTimeout() context.Context {
// 	ctx, _ := context.WithTimeout(context.Background(), 12*time.Second)
// 	return ctx
// }

// // ===== Init =====

// func InitContract() {
// 	rpcURL := os.Getenv("HOLESKY_RPC")
// 	addr := os.Getenv("CONTRACT_ADDRESS")

// 	var err error
// 	ethClient, err = ethclient.Dial(rpcURL)
// 	if err != nil {
// 		log.Fatalf("เชื่อมต่อ Holesky RPC ไม่สำเร็จ: %v", err)
// 	}

// 	contractAddr = common.HexToAddress(addr)
// 	if err := VerifyContract(ethClient, contractAddr); err != nil {
// 		log.Fatal("❌ Verify contract failed:", err)
// 	}

// 	contract, err := smartcontract.NewSmartcontract(contractAddr, ethClient)
// 	if err != nil {
// 		log.Fatalf("เชื่อมต่อ contract ไม่สำเร็จ: %v", err)
// 	}

// 	ContractInstance = &smartcontract.SmartcontractSession{
// 		Contract: contract,
// 		CallOpts: bind.CallOpts{
// 			Context: ctxTimeout(),
// 			Pending: false, // view call แนะนำ false
// 		},
// 	}

// 	log.Println("✅ สร้าง session contract สำเร็จ")
// }

// // ===== Controllers =====

// func GetLandTitleInfoByWallet(c *gin.Context) {
// 	if ContractInstance == nil {
// 		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "contract not initialized"})
// 		return
// 	}

// 	walletAddr, exists := c.Get("wallet")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
// 		return
// 	}

// 	wallet := common.HexToAddress(walletAddr.(string))

// 	tokenData, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
// 	if err != nil {
// 		log.Printf("❌ GetLandTitleInfoByWallet error: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch data", "detail": err.Error()})
// 		return
// 	}

// 	result := make([]string, len(tokenData))
// 	for i, v := range tokenData {
// 		result[i] = v.String()
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"wallet": wallet.Hex(),
// 		"tokens": result,
// 	})
// }

// func GetLandMetadataByWallet(c *gin.Context) {
// 	if ContractInstance == nil {
// 		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "contract not initialized"})
// 		return
// 	}

// 	walletAddr, exists := c.Get("wallet")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
// 		return
// 	}

// 	wallet := common.HexToAddress(walletAddr.(string))

// 	// 1) ดึง token IDs ของ user
// 	tokenIDs, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
// 	if err != nil {
// 		log.Printf("❌ GetLandTitleInfoByWallet error: %v", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch token IDs", "detail": err.Error()})
// 		return
// 	}

// 	// 2) อ่าน metadata ต่อ token — ถ้าตัวไหนพลาด เก็บ error ในรายการแทนที่จะล้มทั้งหมด
// 	metadataList := make([]map[string]interface{}, 0, len(tokenIDs))

// 	for _, t := range tokenIDs {
// 		meta, err := ContractInstance.GetLandMetadata(t)
// 		if err != nil {
// 			// เก็บรายละเอียดความผิดพลาดต่อ token
// 			log.Printf("❌ GetLandMetadata token=%s error: %v", t.String(), err)
// 			metadataList = append(metadataList, map[string]interface{}{
// 				"tokenID": t.String(),
// 				"error":   err.Error(),
// 			})
// 			continue
// 		}

// 		metadataList = append(metadataList, map[string]interface{}{
// 			"tokenID":    t.String(),
// 			"metaFields": meta.MetaFields, // ตรวจชนิดให้ตรง ABI ของที่ deploy
// 			"price":      meta.Price.String(),
// 			"buyer":      meta.Buyer.Hex(),
// 		})
// 	}

// 	// 3) ตอบกลับทั้งหมด (รวมตัวที่ error ต่อ token)
// 	c.JSON(http.StatusOK, gin.H{
// 		"wallet":   wallet.Hex(),
// 		"metadata": metadataList,
// 	})
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
