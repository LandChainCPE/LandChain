const { ethers } = require("ethers");

// ข้อมูลแต่ละช่อง
const walletID = "0xD53668db2e273872C9E2A6866d72cd0283d2E994";
const metaFields = [
  "55536 IV 35XX", // landPosition
  "171",           // landNumber
  "7541",          // surveyPage
  "สุรนารี",        // tambon
  "4842",          // deedNumber
  "27",            // book
  "40",            // page
  "เมือง",         // amphoe
  "โครา"     // province
];

// 1. รวม metadata เป็น string เดียว (ต้องตรงกับฝั่ง Solidity)
const metaConcat = metaFields.join('');

// 2. hash เฉพาะ metadata
const hashMetadata = ethers.keccak256(ethers.toUtf8Bytes(metaConcat));

// 3. hash รวม WalletID + metaConcat + hashMetadata
const dataHash = ethers.keccak256(
  ethers.solidityPacked(
    ["address", "string", "bytes32"],
    [walletID, metaConcat, hashMetadata]
  )
);

// 4. prefix แบบเดียวกับ smart contract
function toEthSignedMessageHash(hash) {
  return ethers.keccak256(
    ethers.concat([
      ethers.toUtf8Bytes("\x19Ethereum Signed Message:\n32"),
      ethers.getBytes(hash)
    ])
  );
}
const ethHash = toEthSignedMessageHash(dataHash);

// private key ของระบบ
const privateKey = "0x11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d";
const wallet = new ethers.Wallet(privateKey);

async function main() {
  const sig = wallet.signingKey.sign(ethHash);
  const signature = ethers.Signature.from(sig).serialized;
  console.log("walletID:", walletID);
  console.log("metaFields:", JSON.stringify(metaFields));
  console.log("metaConcat:", metaConcat);
  console.log("hashMetadata:", hashMetadata);
  console.log("dataHash:", dataHash);
  console.log("signature:", signature);
}

main();