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

