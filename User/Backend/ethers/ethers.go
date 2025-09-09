package ethers

import (
	"encoding/hex"

	"golang.org/x/crypto/sha3"
)

// Keccak256 returns the keccak256 hash of the input bytes
func Keccak256(data []byte) string {
	h := sha3.NewLegacyKeccak256()
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}

// ToUtf8Bytes converts a string to a byte slice
func ToUtf8Bytes(s string) []byte {
	return []byte(s)
}

// SolidityPacked is a placeholder for solidity packed encoding
func SolidityPacked(types []string, values []interface{}) []byte {
	// This is a simplified version. In production, use a proper encoder.
	var packed []byte
	for _, v := range values {
		switch val := v.(type) {
		case string:
			packed = append(packed, []byte(val)...) // for address
		case []byte:
			packed = append(packed, val...)
		}
	}
	return packed
}

// GetBytes returns the byte slice from a hex string
func GetBytes(hexStr string) []byte {
	b, _ := hex.DecodeString(hexStr)
	return b
}

// NewWallet is a placeholder for wallet creation
// In production, use a secure wallet implementation
func NewWallet(privateKey string) *Wallet {
	return &Wallet{PrivateKey: privateKey}
}

type Wallet struct {
	PrivateKey string
}

// SignMessage is a placeholder for signing a message
func (w *Wallet) SignMessage(msg []byte) (string, error) {
	// In production, use a real signing method
	return hex.EncodeToString(msg), nil
}
