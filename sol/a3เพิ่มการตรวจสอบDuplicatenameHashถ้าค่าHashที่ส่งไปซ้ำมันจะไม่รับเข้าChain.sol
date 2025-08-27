// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract DigitalLandTitle {
    using ECDSA for bytes32;

    // Address ของระบบที่ใช้เซ็นข้อมูล (Public Address)
    address public trustedSigner = 0x41BCeA94aa1FeE61cC57B2C366D0eAee67A5584a;

    struct Owner {
        address wallet;
        bytes32 nameHash;
    }
    mapping(address => Owner) public owners;

    // mapping สำหรับป้องกัน nameHash ซ้ำ
    mapping(bytes32 => bool) public usedNameHash;

    // ฟังก์ชันสำหรับลงทะเบียนเจ้าของใหม่และยืนยันลายเซ็น
    function registerOwner(address wallet, bytes32 nameHash, bytes memory signature) external {
        bytes32 messageHash = keccak256(abi.encodePacked(wallet, nameHash));
        address signerAddress = ECDSA.recover(messageHash, signature);
        require(signerAddress == trustedSigner, "Invalid signature");
        require(msg.sender == wallet, "Sender mismatch");
        require(!usedNameHash[nameHash], "Duplicate nameHash");
        owners[wallet] = Owner({wallet: wallet, nameHash: nameHash});
        usedNameHash[nameHash] = true;
    }

    // ดูข้อมูลเจ้าของที่ลงทะเบียน
    function getOwnerInfo(address wallet) public view returns (bytes32) {
        return owners[wallet].nameHash;
    }
}