import { ethers } from "ethers";

// ข้อมูล metadata เป็น string เดียว (ตามรูปแบบที่ smart contract รับ)
const walletID = "0x81C7a15aE0b72CADE82D428844cff477f6E364b5";
const metaFields =
  "Map:5336 IV 8633555555, Land No:13100, Survey Page:7541, Subdistrict:ตะกรานพืชผล, Deed No:7543031, Book:754, Page:30, District:กบินทร์บุรี, Province:ปราจีนบุรี, Rai:20, Ngan:2, SqWa:50";

// 1. สร้าง hash สำหรับเซ็น (wallet + metaFields)
const messageHash = ethers.keccak256(
  ethers.solidityPacked(
    ["address", "string"],
    [walletID, metaFields]
  )
);

// 2. เติม prefix แบบเดียวกับ smart contract
function toEthSignedMessageHash(hash) {
  return ethers.keccak256(
    ethers.concat([
      ethers.toUtf8Bytes("\x19Ethereum Signed Message:\n32"),
      ethers.getBytes(hash)
    ])
  );
}
const ethHash = toEthSignedMessageHash(messageHash);

// 3. เซ็น hash ด้วย private key ของระบบ
const privateKey = "0x11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d";
const wallet = new ethers.Wallet(privateKey);

async function main() {
  const sig = wallet.signingKey.sign(ethHash);
  const signature = ethers.Signature.from(sig).serialized;
  // ส่งข้อมูลไป smart contract:
  // walletID, metaFields, signature
  console.log("walletID:", walletID);
  console.log("metaFields:", metaFields);
  console.log("signature:", signature);
}

main();