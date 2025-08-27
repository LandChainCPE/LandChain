// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract DigitalLandTitle {
    using ECDSA for bytes32;

    address public trustedSigner = 0x41BCeA94aa1FeE61cC57B2C366D0eAee67A5584a;

    struct Owner {
        address wallet;
        bytes32 nameHash;
    }
    mapping(address => Owner) public owners;

    function registerOwner(address wallet, bytes32 nameHash, bytes memory signature) external {
        bytes32 messageHash = keccak256(abi.encodePacked(wallet, nameHash));
        address signerAddress = ECDSA.recover(messageHash, signature);
        require(signerAddress == trustedSigner, "Invalid signature");
        require(msg.sender == wallet, "Sender mismatch");
        owners[wallet] = Owner({wallet: wallet, nameHash: nameHash});
    }

    function getOwnerInfo(address wallet) public view returns (bytes32) {
        return owners[wallet].nameHash;
    }
}