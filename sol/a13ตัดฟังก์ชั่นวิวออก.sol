// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract LandTitleNFT is ERC721, Ownable, Pausable {
    using ECDSA for bytes32;

    struct OwnerInfo { address wallet; bytes32 nameHash; }
    struct SaleInfo { uint256 price; address buyer; }

    mapping(bytes32 => bool) private usedLandHash;
    mapping(address => OwnerInfo) public owners;
    mapping(bytes32 => bool) public usedNameHash;
    address private trustedSigner;
    uint256 private _tokenIdTracker;
    mapping(uint256 => SaleInfo) public saleInfos;

    constructor(address signer) ERC721("LandTitleNFT", "LTNFT") Ownable(msg.sender) {
        trustedSigner = signer;
    }
    function setTrustedSigner(address signer) external onlyOwner { trustedSigner = signer; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function _toEthSignedMessageHash(bytes32 hash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
    function registerOwner(address wallet, bytes32 nameHash, bytes calldata signature) external {
        bytes32 messageHash = keccak256(abi.encodePacked(wallet, nameHash));
        bytes32 ethHash = _toEthSignedMessageHash(messageHash);
        address signerAddress = ECDSA.recover(ethHash, signature);
        require(signerAddress == trustedSigner, "");
        require(msg.sender == wallet, "");
        require(!usedNameHash[nameHash], "");
        owners[wallet] = OwnerInfo({wallet: wallet, nameHash: nameHash});
        usedNameHash[nameHash] = true;
    }
    // ให้ backend สร้าง landHash เองและส่งมา
    function mintLandTitleNFT(
        address wallet,
        bytes32 landHash,
        bytes calldata signature
    ) external whenNotPaused returns (uint256) {
        require(msg.sender == wallet, "");
        require(!usedLandHash[landHash], "");
        bytes32 ethHash = _toEthSignedMessageHash(landHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "");
        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;
        usedLandHash[landHash] = true;
        _safeMint(wallet, tokenId);
        return tokenId;
    }
    function transferOwnership(address to, uint256 tokenId) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "");
        _transfer(msg.sender, to, tokenId);
    }
    function setSaleInfo(
        uint256 tokenId,
        uint256 price,
        address buyer,
        bytes calldata signature
    ) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "");
        require(owners[buyer].wallet == buyer, "");
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, price, buyer));
        bytes32 ethHash = _toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "");
        saleInfos[tokenId] = SaleInfo({price: price, buyer: buyer});
    }
    function buyLandTitle(uint256 tokenId) external payable whenNotPaused {
        SaleInfo memory info = saleInfos[tokenId];
        require(info.price > 0, "");
        require(info.buyer == msg.sender, "");
        require(msg.value == info.price, "");
        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        (bool sent, ) = seller.call{value: msg.value}("");
        require(sent, "");
        delete saleInfos[tokenId];
    }
}