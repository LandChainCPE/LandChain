import { ethers } from "ethers";


const walletID = "0x81C7a15aE0b72CADE82D428844cff477f6E364b5";

const name = "Rattapon Phonthaisong11";
const salt = "uWUWYvo2kOrKa8t55E";
const nameHash = ethers.keccak256(ethers.toUtf8Bytes(name + salt));

const messageHash = ethers.keccak256(
  ethers.solidityPacked(["address", "bytes32"], [walletID, nameHash])
);

const privateKey = "0x11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d";
const wallet = new ethers.Wallet(privateKey);

async function main() {
  // signMessage จะเพิ่ม prefix ให้อัตโนมัติ
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));
  console.log("wallet:", walletID);
  console.log("nameHash:", nameHash);
  console.log("signature:", signature);
}

main();