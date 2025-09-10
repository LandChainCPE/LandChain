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
