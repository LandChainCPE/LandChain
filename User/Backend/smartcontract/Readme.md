go install github.com/ethereum/go-ethereum/cmd/abigen@latest

รันคำสั่งนี้ในโฟลเดอร์ที่มีไฟล์ smartcontract.json
abigen --abi smartcontract.json --pkg smartcontract --out b9smartcontract.go



--abi smartcontract.json : ชื่อไฟล์ ABI
--pkg smartcontract : ชื่อ package Go ที่จะสร้าง
--out smartcontract.go : ชื่อไฟล์ Go ที่จะได้
จะได้ไฟล์ smartcontract.go นำไป import ใช้งานใน Go project ได้เลย