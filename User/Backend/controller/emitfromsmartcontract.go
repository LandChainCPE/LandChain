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

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

// Minimal ABI for events
const contractABI = `[
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"metaFields","type":"string"}],"name":"LandMinted","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"wallet","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nameHash","type":"bytes32"}],"name":"OwnerRegistered","type":"event"}
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
				// tokenId (indexed) = vLog.Topics[1]
				// owner (indexed) = vLog.Topics[2]
				// metaFields (not indexed) = vLog.Data
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
				// TODO: update database here

			case "OwnerRegistered":
				// wallet (indexed) = vLog.Topics[1]
				// nameHash (indexed) = vLog.Topics[2]
				wallet := common.HexToAddress(vLog.Topics[1].Hex())
				nameHash := vLog.Topics[2].Hex()
				fmt.Println("--- OwnerRegistered Event ---")
				fmt.Println("wallet:", wallet.Hex())
				fmt.Println("nameHash:", nameHash)

				// อัพเดต Status ใน user_verification เป็น on-chain
				// ต้อง import "landchain/config" และ "landchain/entity"
				db := config.DB()
				var userVerif entity.UserVerification
				walletLower := strings.ToLower(wallet.Hex())
				if err := db.Where("wallet = ?", walletLower).First(&userVerif).Error; err != nil {
					log.Println("user_verification not found for wallet:", walletLower)
					break
				}
				userVerif.Status = "on-chain"
				if err := db.Save(&userVerif).Error; err != nil {
					log.Println("failed to update user_verification status:", err)
				} else {
					log.Println("user_verification status updated to on-chain for wallet:", walletLower)
				}
			}
		}
	}
}
