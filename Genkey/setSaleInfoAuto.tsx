// landSaleService.ts
import axios from "axios";
import { ethers } from "ethers";

interface EthPriceResponse {
  ethereum: {
    thb: number;
  };
}

export async function getEthPriceInTHB(): Promise<number> {
  const res = await axios.get<EthPriceResponse>(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=thb"
  );
  return res.data.ethereum.thb;
}

export async function thbToEth(thbAmount: number): Promise<string> {
  const ethPrice = await getEthPriceInTHB();
  const ethAmount = thbAmount / ethPrice;
  return ethAmount.toFixed(6); // ปัด 6 ตำแหน่งทศนิยม
}

// สร้าง signature อัตโนมัติจาก THB
export async function signTokenSaleAuto(
  tokenId: number,
  priceTHB: number,
  buyer: string,
  privateKey: string
) {
  const priceETH = await thbToEth(priceTHB);
  return signTokenSale(tokenId, priceETH, buyer, privateKey);
}

// ฟังก์ชันสร้าง signature โดยตรง (ETH)
export async function signTokenSale(
  tokenId: number,
  priceETH: string,
  buyer: string,
  privateKey: string
) {
  const price = ethers.parseEther(priceETH);

  const messageHash = ethers.keccak256(
    ethers.solidityPacked(["uint256", "uint256", "address"], [tokenId, price, buyer])
  );

  function toEthSignedMessageHash(hash: string) {
    return ethers.keccak256(
      ethers.concat([
        ethers.toUtf8Bytes("\x19Ethereum Signed Message:\n32"),
        ethers.getBytes(hash)
      ])
    );
  }

  const ethHash = toEthSignedMessageHash(messageHash);
  const wallet = new ethers.Wallet(privateKey);
  const sig = wallet.signingKey.sign(ethHash);
  const signature = ethers.Signature.from(sig).serialized;
  return signature;
}
