import { ethers } from "ethers";

// ข้อมูล
const tokenId = 2;
const price = ethers.parseEther("0.03"); // 1.5 ETH
const buyer = "0xD53668db2e273872C9E2A6866d72cd0283d2E994";  //walletID 2

// hash ตาม smart contract
const messageHash = ethers.keccak256(
  ethers.solidityPacked(
    ["uint256", "uint256", "address"],
    [tokenId, price, buyer]
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
const ethHash = toEthSignedMessageHash(messageHash);

// private key ของระบบ
const privateKey = "0x11c1f346bfe76f45058d04a7d42ad9a70d51f597b5880bc41ae7af819ab8531d";
const wallet = new ethers.Wallet(privateKey);

async function main() {
  const sig = wallet.signingKey.sign(ethHash);
  const signature = ethers.Signature.from(sig).serialized;
  console.log("tokenId:", tokenId);
  console.log("price:", price.toString());
  console.log("buyer:", buyer);
  console.log("signature:", signature);
}

main();