const { ethers } = require("ethers");

const walletID = "0x81C7a15aE0b72CADE82D428844cff477f6E364b5";
const name = "Alice";
const salt = "1234";
const nameHash = ethers.keccak256(ethers.toUtf8Bytes(name + salt));

const messageHash = ethers.keccak256(
  ethers.solidityPacked(["address", "bytes32"], [walletID, nameHash])
);

const privateKey = "0x11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d";
const wallet = new ethers.Wallet(privateKey);

async function main() {
  // ต้องใช้ signingKey.signDigest เพื่อเซ็น hash ตรง ๆ
  const sig = wallet.signingKey.sign(messageHash);
  const signature = ethers.Signature.from(sig).serialized;
  console.log("wallet:", walletID);
  console.log("nameHash:", nameHash);
  console.log("signature:", signature);
}

main();