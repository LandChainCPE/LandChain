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

    // เก็บ metadata แบบ raw array
    mapping(uint256 => string[9]) private _landMetadata;
    // เก็บประวัติการถือครอง
    mapping(uint256 => address[]) private _ownershipHistory;

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
    function getOwnerInfo(address wallet) external view returns (bytes32) {
        return owners[wallet].nameHash;
    }
    // mint พร้อมเก็บ metadata แบบ array 9 ช่อง
    function mintLandTitleNFT(
        address wallet,
        bytes32 landHash,
        string[9] calldata metaFields,
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
        // แก้ไขตรงนี้: copy ทีละตัว
        for (uint256 i = 0; i < 9; i++) {
            _landMetadata[tokenId][i] = metaFields[i];
        }
        _ownershipHistory[tokenId].push(wallet);
        return tokenId;
    }
    function getLandMetadata(uint256 tokenId) external view returns (string[9] memory) {
        return _landMetadata[tokenId];
    }
    function transferOwnership(address to, uint256 tokenId) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "");
        _transfer(msg.sender, to, tokenId);
        _ownershipHistory[tokenId].push(to);
    }
    function getOwnershipHistory(uint256 tokenId) external view returns (address[] memory) {
        return _ownershipHistory[tokenId];
    }
    // คืน tokenId ทั้งหมดที่ wallet นี้ถืออยู่ (ไม่เรียง)
    function getLandTitleInfoByWallet(address wallet) external view returns (uint256[] memory) {
        uint256 count;
        for (uint256 i = 0; i < _tokenIdTracker; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == wallet) { count++; }
            } catch {}
        }
        uint256[] memory result = new uint256[](count);
        uint256 idx;
        for (uint256 i = 0; i < _tokenIdTracker; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == wallet) {
                    result[idx] = i;
                    idx++;
                }
            } catch {}
        }
        return result;
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
        _ownershipHistory[tokenId].push(msg.sender);
        (bool sent, ) = seller.call{value: msg.value}("");
        require(sent, "");
        delete saleInfos[tokenId];
    }
}