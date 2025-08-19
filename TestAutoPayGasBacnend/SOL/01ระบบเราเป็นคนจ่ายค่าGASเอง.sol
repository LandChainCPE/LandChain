// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OwnerRegistry {
    address public owner;
    
    struct Owner {
        address wallet;
        string nameHash;
    }

    mapping(address => Owner) public owners;

    event OwnerRegistered(address wallet, string nameHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ฟังก์ชันที่ใช้ในการลงทะเบียนเจ้าของ
    function registerOwner(address wallet, string memory nameHash) public onlyOwner {
        owners[wallet] = Owner(wallet, nameHash);
        emit OwnerRegistered(wallet, nameHash);
    }

    // ฟังก์ชันที่ใช้ในการดึงข้อมูลเจ้าของ
    function getOwnerInfo(address wallet) external view returns (string memory nameHash) {
        return owners[wallet].nameHash;
    }
}
