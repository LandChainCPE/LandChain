from eth_keys import keys
from eth_utils import to_checksum_address
import os

# สร้าง Private Key แบบสุ่ม
private_key_bytes = os.urandom(32)
private_key = keys.PrivateKey(private_key_bytes)

# คำนวณหา Public Key และ Address
public_key = private_key.public_key
address = public_key.to_canonical_address()
checksum_address = to_checksum_address(address)

print("Private Key (hex):", private_key.to_hex())
print("Public Key (hex):", public_key.to_hex())
print("Ethereum Address:", checksum_address)