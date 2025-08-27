# Import necessary libraries
import os
from eth_account import Account
from eth_abi import abi
from eth_utils import keccak
from eth_account.messages import encode_defunct

# Trusted Signer's Public Key Address
TRUSTED_SIGNER_ADDRESS = "0xd0Ce2A84c5cD85e377A14Bb46C77a612be1572af"

# Data to be verified
WALLET_ADDRESS = "0x81C7a15aE0b72CADE82D428844cff477f6E364b5"
NAME_HASH = "0x7cfd515f483b8b17a1470cfdd9b1654378f85f1c4e95d676646536f947e908f9"
SIGNATURE = "0x68551c6c601f057863d08c5c7ce1a5118d6a89cf61858a75e3a890473a21394c502b6e15d86237ac3f572714c449c25e8a7195454b679b634354c25f48a1c3241b"

# 1. Re-create the message hash
# This must be the exact same hash that was used for signing.
message_hash = keccak(
    abi.encode(
        ['address', 'bytes32'],
        [WALLET_ADDRESS, bytes.fromhex(NAME_HASH[2:])]
    )
)

# 2. Recover the public address from the signature
# We need to use encode_defunct to handle the raw hash correctly
message_to_recover = encode_defunct(message_hash)
recovered_address = Account.recover_message(
    message_to_recover,
    signature=SIGNATURE
)

# 3. Verify the recovered address against the trusted signer address
if recovered_address.lower() == TRUSTED_SIGNER_ADDRESS.lower():
    print("Verification successful!")
    print(f"Recovered Address: {recovered_address}")
    print(f"Trusted Signer Address: {TRUSTED_SIGNER_ADDRESS}")
    print("The signature is valid and was created by the trusted signer.")
else:
    print("Verification failed.")
    print(f"Recovered Address: {recovered_address}")
    print(f"Trusted Signer Address: {TRUSTED_SIGNER_ADDRESS}")
    print("The signature is invalid or was not created by the trusted signer.")
