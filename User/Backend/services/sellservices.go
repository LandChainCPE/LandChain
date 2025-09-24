package services

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"net/http"
	"os"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// --------------------
// THB -> ETH
// --------------------

// --------------------
// Sign token sale แบบ Node.js style
// --------------------

func ThbToEth(thb float64) (float64, error) {
	// ดึงราคา ETH/THB จาก CoinGecko API
	resp, err := http.Get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=thb")
	if err != nil {
		return 0, fmt.Errorf("fetch ETH price error: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("read ETH price error: %w", err)
	}

	var result map[string]map[string]float64
	if err := json.Unmarshal(body, &result); err != nil {
		return 0, fmt.Errorf("unmarshal ETH price error: %w", err)
	}

	ethPrice, ok := result["ethereum"]["thb"]
	if !ok || ethPrice == 0 {
		return 0, fmt.Errorf("ETH price not found")
	}

	eth := thb / ethPrice
	return eth, nil
}

func SignLandSalePacked(tokenID int, priceTHB float64, buyer string) (string, string, error) {
	// 1. THB -> ETH (ใช้ float64)
	priceETH, err := ThbToEth(priceTHB)
	if err != nil {
		return "", "", err
	}

	// 2. ETH -> Wei (ใช้ big.Float เพื่อความแม่นยำ)
	ethBig := big.NewFloat(priceETH)
	weiBig := new(big.Float).Mul(ethBig, big.NewFloat(1e18))
	priceWei := new(big.Int)
	weiBig.Int(priceWei)

	// log ราคาทั้งหมด
	log.Printf("LandSale: tokenID=%d, priceTHB=%.2f, priceETH=%.8f, priceWei=%s, buyer=%s",
		tokenID, priceTHB, priceETH, priceWei.String(), buyer)

	// 3. สร้าง bytes ตรงตาม abi.encodePacked(uint256,uint256,address)
	tokenIDBig := big.NewInt(int64(tokenID))
	tokenIDBytes := common.LeftPadBytes(tokenIDBig.Bytes(), 32) // uint256 32 bytes
	priceBytes := common.LeftPadBytes(priceWei.Bytes(), 32)     // uint256 32 bytes
	buyerBytes := common.HexToAddress(buyer).Bytes()            // address 20 bytes

	var packed []byte
	packed = append(packed, tokenIDBytes...)
	packed = append(packed, priceBytes...)
	packed = append(packed, buyerBytes...)

	// 4. hash ด้วย Keccak256
	hash := crypto.Keccak256Hash(packed)

	// 5. Ethereum prefix
	prefixedHash := accounts.TextHash(hash.Bytes())

	// 6. Load private key
	privateKeyHex := os.Getenv("PRIVATE_KEY")
	if len(privateKeyHex) < 2 {
		return "", "", fmt.Errorf("PRIVATE_KEY not set")
	}
	privateKey, err := crypto.HexToECDSA(privateKeyHex[2:])
	if err != nil {
		return "", "", fmt.Errorf("invalid private key: %w", err)
	}

	// 7. Sign
	sigBytes, err := crypto.Sign(prefixedHash, privateKey)
	if err != nil {
		return "", "", fmt.Errorf("sign error: %w", err)
	}

	// 8. ปรับค่า v ให้อยู่ในช่วง 27/28
	if sigBytes[64] < 27 {
		sigBytes[64] += 27
	}

	if len(sigBytes) != 65 {
		return "", "", fmt.Errorf("signature length invalid: %d", len(sigBytes))
	}

	signatureHex := "0x" + hex.EncodeToString(sigBytes)

	log.Printf("✅ Signed Land Sale Packed: tokenID=%d, wei=%s, buyer=%s, signature length=%d",
		tokenID, priceWei.String(), buyer, len(sigBytes))

	return signatureHex, priceWei.String(), nil
}

// CheckBackendWallet ตรวจสอบว่า private key ที่ backend ใช้ตรงกับ wallet ที่มี ETH
func CheckBackendWallet() error {
	privateKey := os.Getenv("PRIVATE_KEY")
	if privateKey == "" {
		return fmt.Errorf("PRIVATE_KEY ยังไม่ถูกตั้งค่า")
	}

	key, err := crypto.HexToECDSA(privateKey[2:])
	if err != nil {
		return fmt.Errorf("Invalid private key: %v", err)
	}

	address := crypto.PubkeyToAddress(key.PublicKey)
	fmt.Println("🔹 Backend wallet address:", address.Hex())

	rpcURL := os.Getenv("HOODI_RPC")
	if rpcURL == "" {
		return fmt.Errorf("HOODI_RPC ยังไม่ถูกตั้งค่า")
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return fmt.Errorf("เชื่อมต่อ Holesky RPC ไม่สำเร็จ: %v", err)
	}

	balance, err := client.BalanceAt(context.Background(), address, nil)
	if err != nil {
		return fmt.Errorf("ไม่สามารถดึง balance ได้: %v", err)
	}

	ethBalance := new(big.Float).Quo(new(big.Float).SetInt(balance), big.NewFloat(1e18))
	fmt.Println("🔹 Backend wallet balance (Wei):", balance)
	fmt.Println("🔹 Backend wallet balance (ETH):", ethBalance)

	minGas := new(big.Int).Mul(big.NewInt(1e15), big.NewInt(1)) // 0.001 ETH
	if balance.Cmp(minGas) < 0 {
		return fmt.Errorf("wallet balance น้อยเกินไปสำหรับ gas, ต้องมีอย่างน้อย 0.001 ETH")
	}

	fmt.Println("✅ Backend wallet พร้อมส่ง transaction")
	return nil
}
