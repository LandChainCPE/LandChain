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
	rpcUrl := os.Getenv("HOODI_RPC_WWS")
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
				} //แค่ปริ้น ข้อมูลที่รับมาออก

				db := config.DB() //หาว่า uuid ตรงกับ Landtitle ไหน
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
					TxHash:   vLog.TxHash.Hex(), //รวมถึง Transaction Hash ด้วย
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

				db := config.DB()
				// 1. Find Landtitle by tokenId
				var landtitle entity.Landtitle
				tokenIDUint := uint(tokenId.Uint64())
				if err := db.Where("token_id = ?", tokenIDUint).First(&landtitle).Error; err != nil {
					log.Println("Landtitle not found for tokenId:", tokenIDUint)
					break
				}

				// 2. Find Users by buyer and owner wallet
				buyerLower := strings.ToLower(buyer.Hex())
				ownerLower := strings.ToLower(owner.Hex())
				var buyerUser, ownerUser entity.Users
				if err := db.Where("metamaskaddress = ?", buyerLower).First(&buyerUser).Error; err != nil {
					log.Println("Buyer user not found for wallet:", buyerLower)
					break
				}
				if err := db.Where("metamaskaddress = ?", ownerLower).First(&ownerUser).Error; err != nil {
					log.Println("Owner user not found for wallet:", ownerLower)
					break
				}

				// 3. Find Transaction with LandID, buyer, seller, TypeTransactionID=3
				var transaction entity.Transaction
				if err := db.Where("land_id = ? AND buyer_id = ? AND seller_id = ? AND typetransaction_id = ?", landtitle.ID, buyerUser.ID, ownerUser.ID, 3).First(&transaction).Error; err != nil {
					log.Println("Transaction not found for LandID, buyer, seller, TypeTransactionID=3")
					break
				}

				// 4. Update TxHash and set TypeTransactionID=4
				txHash := vLog.TxHash.Hex()
				transaction.TxHash = &txHash      //ใส่ค่า TxHash
				transaction.TypetransactionID = 4 // TypetransactionID = 4
				if err := db.Save(&transaction).Error; err != nil {
					log.Println("Failed to update Transaction TxHash and TypeTransactionID:", err)
				} else {
					log.Println("Transaction updated: TxHash set and TypeTransactionID changed to 4 for LandID:", landtitle.ID)
				}

				// เขียน Emit ให้หน่อย SaleInfoSet
				// 1.ต้องการที่จะนำ tokenId ไปหาว่าตรงกับ LandtitleID ไหน
				// 2.นำ Walletid  ของทั้ง  buyer  และ  owner ไปหาว่าตรงกับ Userid ไหน
				// 2.ทำการค้นหา Transaction ที่ มีLandtitleID  buyer  owner(seller)  และ Transaction มี TypeTransaction ตรงกับ id = 3

				// ทำการ เอา TxHash ไปใส่ใน transactions และทำการอัพเดต TypeTransactionID เป็น 4

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
				db := config.DB()
				// 1. Find Landtitle by tokenId
				var landtitle entity.Landtitle
				tokenIDUint := uint(tokenId.Uint64())
				if err := db.Where("token_id = ?", tokenIDUint).First(&landtitle).Error; err != nil {
					log.Println("Landtitle not found for tokenId:", tokenIDUint)
					break
				}

				// 2. Find buyer user by wallet address
				buyerLower := strings.ToLower(buyer.Hex())
				var buyerUser entity.Users
				if err := db.Where("metamaskaddress = ?", buyerLower).First(&buyerUser).Error; err != nil {
					log.Println("Buyer user not found for wallet:", buyerLower)
					break
				}

				// 3. Find previous LandOwnership by seller (ToDate == NULL)
				//หา Row ที่เป็นของเจ้าของก่อน 
				sellerLower := strings.ToLower(seller.Hex())
				var sellerUser entity.Users
				if err := db.Where("metamaskaddress = ?", sellerLower).First(&sellerUser).Error; err != nil {
					log.Println("Seller user not found for wallet:", sellerLower)
				} else {
					var prevOwnership entity.LandOwnership
					if err := db.Where("land_id = ? AND user_id = ? AND to_date IS NULL", landtitle.ID, sellerUser.ID).First(&prevOwnership).Error; err != nil {
						log.Println("Previous LandOwnership not found for LandID and SellerID:", landtitle.ID, sellerUser.ID)
					} else {
						now := time.Now()
						prevOwnership.ToDate = &now
						if err := db.Save(&prevOwnership).Error; err != nil {
							log.Println("Failed to update previous LandOwnership ToDate:", err)
						} else {
							log.Println("Previous LandOwnership ToDate updated for LandID:", landtitle.ID, "SellerID:", sellerUser.ID)
						}
					}
				}

				// 4. Create new LandOwnership for buyer
				//สร้างข้อมูลใหม่ ให้ เป็นเจ้าของปัจจุบันเป้นผู้ซื้อ 
				newOwnership := entity.LandOwnership{
					UserID:   buyerUser.ID,
					LandID:   landtitle.ID,
					TxHash:   vLog.TxHash.Hex(),
					FromDate: time.Now(),
					ToDate:   nil,
				}
				if err := db.Create(&newOwnership).Error; err != nil {
					log.Println("Failed to create new LandOwnership for buyer:", err)
				} else {
					log.Println("New LandOwnership created for buyer UserID:", buyerUser.ID, "LandID:", landtitle.ID)
				}

				// 5. Update Transaction for this purchase (TypeTransactionID=4)
				var transaction entity.Transaction
				if err := db.Where("land_id = ? AND buyer_id = ? AND seller_id = ? AND typetransaction_id = ? AND deleted_at IS NULL", landtitle.ID, buyerUser.ID, sellerUser.ID, 4).First(&transaction).Error; err != nil {
					log.Println("Transaction not found for LandID, buyer, seller, TypeTransactionID=4")
				} else {
					// txHash := vLog.TxHash.Hex()
					// transaction.TxHash = &txHash
					transaction.TypetransactionID = 5 // เปลี่ยนเป็น 5
					if err := db.Save(&transaction).Error; err != nil {
						log.Println("Failed to update Transaction TxHash and TypeTransactionID for purchase:", err)
					} else {
						// Soft delete
						if err := db.Delete(&transaction).Error; err != nil {
							log.Println("Failed to soft delete Transaction:", err)
						} else {
							log.Println("Transaction updated: TxHash set, TypeTransactionID changed to 5 and soft deleted for LandID:", landtitle.ID, "buyer:", buyerUser.ID, "seller:", sellerUser.ID)
						}
					}
				}

				//หากเกิดการซื้อ ให้ทำการ
				//เอา tokenId ไปหาว่าเป็นของ landtitleid ไหน
				//เอา buyer ไปหาว่าตรงกับ userid ไหน
				//ทำการหาว่า ใน LandOwnerShip   มี landtitleid and  userid  and Todate=NULL
				//ทำการ เซต Todate Row นั้น เป็นเวลาปัจจุบัน
				//ทำการสร้างข้อมูลใหม่ โดยใส่ข้อมูลเข้าไปใน LandOwnerShip ให้เป็นข้อมูลคนปัจจุบัน
			}
		}
	}
}
