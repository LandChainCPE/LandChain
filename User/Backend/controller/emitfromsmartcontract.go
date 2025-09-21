// emitfromsmartcontract.go
// Listen to LandMinted and OwnerRegistered events from smart contract
// Requires: go-ethereum (geth) package

package controller

import (
	"context"
	"fmt"
	"landchain/config"
	"landchain/entity"
	"log"
	"math/big"
	"os"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

// Minimal ABI for events
const contractABI = `[
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"metaFields","type":"string"}],"name":"LandMinted","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"wallet","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nameHash","type":"bytes32"}],"name":"OwnerRegistered","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"SaleInfoSet","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"}],"name":"LandTitleBought","type":"event"}
]`

func ListenSmartContractEvents() {
	rpcUrl := os.Getenv("HOLESKY_RPC_WWS")
	contractAddress := os.Getenv("CONTRACT_ADDRESS")
	if rpcUrl == "" || contractAddress == "" {
		log.Fatal("Please set RPC_URL and CONTRACT_ADDRESS in environment variables")
	}

	client, err := ethclient.Dial(rpcUrl)
	if err != nil {
		log.Fatalf("Failed to connect to Ethereum node: %v", err)
	}
	parsedABI, err := abi.JSON(strings.NewReader(contractABI))
	if err != nil {
		log.Fatalf("Failed to parse ABI: %v", err)
	}
	contractAddr := common.HexToAddress(contractAddress)

	query := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddr},
	}

	logsCh := make(chan types.Log)
	sub, err := client.SubscribeFilterLogs(context.Background(), query, logsCh)
	if err != nil {
		log.Fatalf("Failed to subscribe to logs: %v", err)
	}

	fmt.Println("Listening for LandMinted and OwnerRegistered events...")
	for {
		select {
		case err := <-sub.Err():
			log.Println("Subscription error:", err)
		case vLog := <-logsCh:
			event, err := parsedABI.EventByID(vLog.Topics[0])
			if err != nil {
				log.Println("Unknown event:", err)
				continue
			}
			switch event.Name {
			case "LandMinted":
				tokenId := new(big.Int).SetBytes(vLog.Topics[1].Bytes())
				owner := common.HexToAddress(vLog.Topics[2].Hex())
				var metaFields string
				err := parsedABI.UnpackIntoInterface(&[]interface{}{&metaFields}, "LandMinted", vLog.Data)
				if err != nil {
					log.Println("Failed to unpack LandMinted metaFields:", err)
					continue
				}
				fmt.Println("--- LandMinted Event ---")
				fmt.Println("tokenId:", tokenId.String())
				fmt.Println("owner:", owner.Hex())
				fmt.Println("metaFields:", metaFields)
				fmt.Println("TxHash:", vLog.TxHash.Hex())

				// Extract UUID from metaFields
				uuid := ""
				fields := strings.Split(metaFields, ",")
				for _, field := range fields {
					kv := strings.SplitN(strings.TrimSpace(field), ":", 2)
					if len(kv) == 2 && strings.TrimSpace(kv[0]) == "UUID" {
						uuid = strings.TrimSpace(kv[1])
						break
					}
				}
				fmt.Println("UUID:", uuid)
				if uuid == "" {
					log.Println("UUID not found in metaFields")
					break
				}   //แค่ปริ้น ข้อมูลที่รับมาออก

				db := config.DB()    //หาว่า uuid ตรงกับ Landtitle ไหน 
				var landtitle entity.Landtitle
				if err := db.Where("uuid = ?", uuid).First(&landtitle).Error; err != nil {
					log.Println("Landtitle not found for UUID:", uuid)
					break
				}
				//เอา tokenId ไปใส่ใน Landtitle นั้น
				tokenIDUint := uint(tokenId.Uint64())
				landtitle.TokenID = &tokenIDUint
				if err := db.Save(&landtitle).Error; err != nil {
					log.Println("Failed to update Landtitle TokenID:", err)
				} else {
					log.Println("Landtitle TokenID updated for UUID:", uuid)
				}

				// Entity landtitle ทำการ Update Status_onchain เป็น true
				if landtitle.LandVerificationID != nil {
					var landVerif entity.LandVerification
					if err := db.First(&landVerif, *landtitle.LandVerificationID).Error; err != nil {
						log.Println("LandVerification not found for ID:", *landtitle.LandVerificationID)
					} else {
						landVerif.Status_onchain = true
						if err := db.Save(&landVerif).Error; err != nil {
							log.Println("Failed to update LandVerification Status_onchain:", err)
						} else {
							log.Println("LandVerification Status_onchain updated for UUID:", uuid)
						}
					}
				} else {
					log.Println("Landtitle.LandVerificationID is nil for UUID:", uuid)
				}

				//หาว่า metamaskaddress ตรงกับ Userคนไหน
				var user entity.Users
				ownerLower := strings.ToLower(owner.Hex())
				if err := db.Where("metamaskaddress = ?", ownerLower).First(&user).Error; err != nil {
					log.Println("User not found for wallet:", ownerLower)
					break
				}
				
				landID := landtitle.ID
				// นำ UserID  LandID มาใส่ใน landOwnership
				landOwnership := entity.LandOwnership{
					UserID:   user.ID,
					LandID:   landID,
					TxHash:   vLog.TxHash.Hex(),   //รวมถึง Transaction Hash ด้วย 
					FromDate: time.Now(),
					ToDate:   nil, 
				}
				if err := db.Create(&landOwnership).Error; err != nil {
					log.Println("Failed to create LandOwnership:", err)
				} else {
					log.Println("LandOwnership created for UserID:", user.ID, "LandID:", landID)
				}
				/// จบ LandMinted

			case "OwnerRegistered":

				wallet := common.HexToAddress(vLog.Topics[1].Hex())
				nameHash := vLog.Topics[2].Hex()
				fmt.Println("--- OwnerRegistered Event ---")
				fmt.Println("wallet:", wallet.Hex())
				fmt.Println("nameHash:", nameHash)
				fmt.Println("TxHash:", vLog.TxHash.Hex())
				// แค่ปริ้นออก

				//หาว่า wallet ตรงกับ UserVerification ไหน
				db := config.DB()
				var userVerif entity.UserVerification
				walletLower := strings.ToLower(wallet.Hex())
				if err := db.Where("wallet = ?", walletLower).First(&userVerif).Error; err != nil {
					log.Println("user_verification not found for wallet:", walletLower)
					break
				}
				//userVerif.Status_onchain = true
				// Update UserVerification Status_onchain  เป็น true
				userVerif.Status_onchain = true
				txHash := vLog.TxHash.Hex()
				userVerif.TxHash = &txHash
				if err := db.Save(&userVerif).Error; err != nil {
					log.Println("failed to update user_verification status or TxHash:", err)
				} else {
					log.Println("user_verification status updated to on-chain and TxHash saved for wallet:", walletLower)
				}

			case "SaleInfoSet":
				// tokenId (indexed) = vLog.Topics[1]
				// price (not indexed) = vLog.Data (first 32 bytes)
				// buyer (indexed) = vLog.Topics[2]
				// owner (indexed) = vLog.Topics[3]
				tokenId := new(big.Int).SetBytes(vLog.Topics[1].Bytes())
				price := new(big.Int).SetBytes(vLog.Data[:32])
				buyer := common.HexToAddress(vLog.Topics[2].Hex())
				owner := common.HexToAddress(vLog.Topics[3].Hex())
				fmt.Println("--- SaleInfoSet Event ---")
				fmt.Println("tokenId:", tokenId.String())
				fmt.Println("price:", price.String())
				fmt.Println("buyer:", buyer.Hex())
				fmt.Println("owner:", owner.Hex())
				fmt.Println("TxHash:", vLog.TxHash.Hex())

			case "LandTitleBought":
				// tokenId (indexed) = vLog.Topics[1]
				// seller (indexed) = vLog.Topics[2]
				// buyer (indexed) = vLog.Topics[3]
				tokenId := new(big.Int).SetBytes(vLog.Topics[1].Bytes())
				seller := common.HexToAddress(vLog.Topics[2].Hex())
				buyer := common.HexToAddress(vLog.Topics[3].Hex())
				fmt.Println("--- LandTitleBought Event ---")
				fmt.Println("tokenId:", tokenId.String())
				fmt.Println("seller:", seller.Hex())
				fmt.Println("buyer:", buyer.Hex())
				fmt.Println("TxHash:", vLog.TxHash.Hex())
				//หากเกิดการซื้อ ให้ทำการ 
				//เอา tokenId ไปหาว่าเป็นของ landtitleid ไหน
				//เอา buyer ไปหาว่าตรงกับ userid ไหน 
				//ทำการหาว่า ใน LandOwnerShip   มี landtitleid and  userid  and Todate=NULL
				//ทำการ เซต Todate เป็นเวลาปัจจุบัน 
				//ทำการสร้างข้อมูลใหม่ โดยใส่ข้อมูลเข้าไปใน LandOwnerShip ให้เป็นข้อมูลคนปัจจุบัน
			}
		}
	}
}
