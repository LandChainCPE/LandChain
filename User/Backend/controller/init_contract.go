package controller

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"strconv"
	"strings"

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

// ปรับ InitContract ให้รองรับ Hoodi
func InitContract() {
	rpcURL := os.Getenv("HOODI_RPC")
	contractAddr := os.Getenv("CONTRACT_ADDRESS")

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("เชื่อมต่อ Hoodi RPC ไม่สำเร็จ: %v", err)
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

	// Hoodi RPC ไม่รองรับ eth_chainId ให้ hardcode chainId แทน
	chainID := big.NewInt(560048) // ใส่ chainId ของ Hoodi ที่ถูกต้อง

	auth, err := bind.NewKeyedTransactorWithChainID(key, chainID)
	if err != nil {
		log.Fatalf("สร้าง auth ไม่สำเร็จ: %v", err)
	}

	// ✅ ตั้ง gas limit และ gas price
	auth.GasLimit = uint64(300_000)
	// gasPrice, err := client.SuggestGasPrice(context.Background())
	// if err != nil {
	//     log.Fatalf("ดึง gas price ไม่สำเร็จ: %v", err)
	// }
	// auth.GasPrice = gasPrice
	auth.GasPrice = big.NewInt(20000000000) // 20 Gwei

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
	// 1️⃣ ดึง wallet จาก context
	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
		return
	}
	fmt.Println("Wallet from context:", walletAddr)

	wallet := common.HexToAddress(walletAddr.(string))

	// 2️⃣ ดึง token IDs ของ user จาก contract
	tokenIDs, err := ContractInstance.GetLandTitleInfoByWallet(wallet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Cannot fetch token IDs",
			"detail": err.Error(),
		})
		return
	}
	fmt.Println("Token IDs from contract:", tokenIDs)

	if len(tokenIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"wallet":   wallet.Hex(),
			"metadata": []map[string]interface{}{},
			"note":     "No token IDs found for this wallet",
		})
		return
	}

	// 3️⃣ แปลง tokenIDs เป็น string สำหรับ query DB
	var tokenStrs []string
	for _, t := range tokenIDs {
		tokenStrs = append(tokenStrs, t.String())
	}
	fmt.Println("Token IDs as strings for DB query:", tokenStrs)

	// 4️⃣ ดึง landtitle จาก database
	db := config.DB()
	var lands []entity.Landtitle
	if err := db.Where("token_id IN ?", tokenStrs).Find(&lands).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Cannot fetch landtitle",
			"detail": err.Error(),
		})
		return
	}
	fmt.Println("Lands from DB:", lands)

	// 5️⃣ สร้าง map tokenID -> IsLocked
	lockedMap := make(map[string]bool)
	for _, l := range lands {
		if l.TokenID != nil {
			tokenIDStr := strconv.FormatUint(uint64(*l.TokenID), 10)
			lockedMap[tokenIDStr] = l.IsLocked
			fmt.Println("DB tokenID:", tokenIDStr, "IsLocked:", l.IsLocked)
		}
	}
	fmt.Println("Locked map:", lockedMap)

	// 6️⃣ ดึง metadata จาก contract และ merge IsLocked
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
		fmt.Println("Metadata for token", t.String(), ":", meta)

		tokenIDStr := t.String()
		isLocked := lockedMap[tokenIDStr] // default false ถ้า key ไม่มี
		fmt.Println("IsLocked from DB map for token", tokenIDStr, ":", isLocked)

		metadataList = append(metadataList, map[string]interface{}{
			"tokenID":    tokenIDStr,
			"metaFields": meta.MetaFields,
			"price":      meta.Price.String(),
			"buyer":      meta.Buyer.Hex(),
			"walletID":   meta.WalletID.Hex(),
			"isLocked":   isLocked,
		})
	}

	// 7️⃣ ส่ง response
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

// GET /api/land/:tokenId/history
func GetLandHistory(c *gin.Context) {
	tokenIDStr := c.Param("id")
	if tokenIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tokenId is required"})
		return
	}

	// แปลงเป็น big.Int
	tokenIDInt, ok := new(big.Int).SetString(tokenIDStr, 10)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tokenId"})
		return
	}

	// ดึงเจ้าของปัจจุบัน
	currentOwner, err := ContractInstance.OwnerOf(tokenIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ดึงประวัติ
	addresses, err := ContractInstance.GetOwnershipHistory(tokenIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// รวมเจ้าของปัจจุบันกับประวัติ
	owners := []string{currentOwner.Hex()}
	for _, addr := range addresses {
		owners = append(owners, addr.Hex())
	}

	c.JSON(http.StatusOK, gin.H{
		"tokenId": tokenIDStr,
		"owners":  owners,
	})
}

func GetSaleInfoHandler(c *gin.Context) {
	if ContractInstance == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "contract not initialized"})
		return
	}

	// 1️⃣ ดึง tokenID จาก path
	tokenIDStr := c.Param("id")
	if tokenIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tokenID is required"})
		return
	}

	tokenID := new(big.Int)
	if _, ok := tokenID.SetString(tokenIDStr, 10); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tokenID format"})
		return
	}

	// 2️⃣ ใช้ CallOpts จาก session
	callOpts := &ContractInstance.CallOpts
	callOpts.Pending = false // read-only

	// 3️⃣ เรียก SaleInfos ผ่าน ContractInstance
	saleInfo, err := ContractInstance.Contract.SaleInfos(callOpts, tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sale info", "detail": err.Error()})
		return
	}

	// 4️⃣ Return JSON
	c.JSON(http.StatusOK, gin.H{
		"tokenId": tokenID.String(),
		"price":   saleInfo.Price.String(),
		"buyer":   saleInfo.Buyer.Hex(),
	})
}

func GetUserAddressLand(c *gin.Context) {
	if ContractInstance == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "contract not initialized"})
		return
	}

	// ดึง tokenID จาก path param
	tokenIDStr := c.Param("id")
	if tokenIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tokenID is required"})
		return
	}

	// แปลง tokenID เป็น big.Int
	tokenID := new(big.Int)
	if _, ok := tokenID.SetString(tokenIDStr, 10); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tokenID"})
		return
	}

	// 1️⃣ ดึง seller address
	seller, err := ContractInstance.OwnerOf(tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot get owner", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tokenID": tokenIDStr,
		"seller":  seller.Hex(),
	})
}

type BuyLandRequest struct {
	TokenID string `json:"tokenId" binding:"required"`
	TxHash  string `json:"txHash" binding:"required"` // รับ tx hash จาก frontend
}

func BuyLandHandler(c *gin.Context) {
	var req BuyLandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	tokenID := new(big.Int)
	if _, ok := tokenID.SetString(req.TokenID, 10); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tokenId"})
		return
	}

	walletAddr, exists := c.Get("wallet")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet not found in token"})
		return
	}
	wallet := walletAddr.(string)

	if ContractInstance != nil {
		owner, err := ContractInstance.OwnerOf(tokenID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if strings.EqualFold(owner.Hex(), wallet) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You already own this token"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"txHash": req.TxHash})
}

func CheckOwnerHandler(c *gin.Context) {
	walletParam := c.Query("wallet")
	tokenIdParam := c.Query("tokenId")

	if walletParam == "" || tokenIdParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet and tokenId are required"})
		return
	}

	tokenId := new(big.Int)
	if _, ok := tokenId.SetString(tokenIdParam, 10); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tokenId"})
		return
	}

	walletAddress := common.HexToAddress(walletParam)

	if ContractInstance == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "contract not initialized"})
		return
	}

	// ใช้ Contract + CallOpts
	owner, err := ContractInstance.Contract.OwnerOf(&ContractInstance.CallOpts, tokenId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	isOwner := owner == walletAddress

	c.JSON(http.StatusOK, gin.H{
		"message": map[bool]string{
			true:  "เป็นเจ้าของที่ดินนี้",
			false: "ไม่ใช่เจ้าของที่ดินนี้",
		}[isOwner],
		"isOwner": isOwner,
	})
}

func CheckVerifyWallet(c *gin.Context) {
	if ContractInstance == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "contract not initialized"})
		return
	}

	var req struct {
		Wallet string `json:"wallet"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "detail": err.Error()})
		return
	}

	if req.Wallet == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address is required"})
		return
	}

	wallet := common.HexToAddress(strings.ToLower(req.Wallet))

	// Call GetOwnerInfo from contract
	ownerInfo, err := ContractInstance.Contract.GetOwnerInfo(&ContractInstance.CallOpts, wallet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot fetch owner info", "detail": err.Error()})
		return
	}

	// Convert [32]byte to hex string for readability
	ownerInfoHex := fmt.Sprintf("0x%x", ownerInfo)
	fmt.Println("Owner Info (hex):", ownerInfoHex)

	// Compare with user_verification table (force lowercase for DB query)
	db := config.DB()
	var userVerif entity.UserVerification
	walletLower := strings.ToLower(wallet.Hex())
	result := db.Where("LOWER(wallet) = ?", walletLower).First(&userVerif)
	if result.Error != nil {
		log.Printf("[CheckVerifyWallet] DB error: %v", result.Error)
	} else {
		log.Printf("[CheckVerifyWallet] DB found: wallet=%s, namehash_salt=%s", walletLower, userVerif.NameHashSalt)
	}
	match := false
	if result.Error == nil {
		// Compare ownerInfoHex with namehash_salt
		match = strings.EqualFold(ownerInfoHex, userVerif.NameHashSalt)
		log.Printf("[CheckVerifyWallet] Compare: ownerInfoHex=%s, namehash_salt=%s, match=%v", ownerInfoHex, userVerif.NameHashSalt, match)
	}

	c.JSON(http.StatusOK, gin.H{
		"wallet":        wallet.Hex(),
		"ownerInfo":     ownerInfoHex,
		"namehash_salt": userVerif.NameHashSalt,
		"match":         match,
		"db_found":      result.Error == nil,
	})
}
