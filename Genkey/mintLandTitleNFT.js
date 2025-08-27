const { ethers } = require("ethers");

// ข้อมูลแต่ละช่อง
const walletID = "0x81C7a15aE0b72CADE82D428844cff477f6E364b5";
const metaFields = [
  "55536 IV 35XX", // landPosition
  "171",           // landNumber
  "7541",          // surveyPage
  "สุรนารี",        // tambon
  "4842",          // deedNumber
  "27",            // book
  "41",            // page
  "เมือง",         // amphoe
  "นครราชสีมา"     // province
];

// hash ตาม smart contract
const landHash = ethers.keccak256(
  ethers.solidityPacked(
    ["address", "string", "string", "string", "string", "string", "string", "string", "string", "string"],
    [walletID, ...metaFields]
  )
);

// prefix แบบเดียวกับ smart contract
function toEthSignedMessageHash(hash) {
  return ethers.keccak256(
    ethers.concat([
      ethers.toUtf8Bytes("\x19Ethereum Signed Message:\n32"),
      ethers.getBytes(hash)
    ])
  );
}
const ethHash = toEthSignedMessageHash(landHash);

// private key ของระบบ
const privateKey = "0x11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d";
const wallet = new ethers.Wallet(privateKey);

async function main() {
  const sig = wallet.signingKey.sign(ethHash);
  const signature = ethers.Signature.from(sig).serialized;
  console.log("wallet:", walletID);
  console.log("metaFields:", JSON.stringify(metaFields));
  console.log("signature:", signature);
}

main();