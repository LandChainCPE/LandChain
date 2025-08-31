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

    mapping(bytes32 => bool) private usedDataHash;
    mapping(address => OwnerInfo) public owners;
    mapping(bytes32 => bool) public usedNameHash;
    address private trustedSigner;
    uint256 private _tokenIdTracker;
    mapping(uint256 => SaleInfo) public saleInfos;

    mapping(uint256 => string[9]) private _landMetadata;
    mapping(uint256 => address[]) private _ownershipHistory;
    mapping(uint256 => bytes32) public dataHashes;
    mapping(uint256 => bytes32) public hashMetadatas;

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
        require(signerAddress == trustedSigner, "invalid signer");
        require(msg.sender == wallet, "not wallet");
        require(!usedNameHash[nameHash], "nameHash used");
        owners[wallet] = OwnerInfo({wallet: wallet, nameHash: nameHash});
        usedNameHash[nameHash] = true;
    }
    function getOwnerInfo(address wallet) external view returns (bytes32) {
        return owners[wallet].nameHash;
    }

    // Helper: รวม metadata เป็น string เดียว
    function _concatMeta(string[9] memory metaFields) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                metaFields[0], metaFields[1], metaFields[2], metaFields[3], metaFields[4],
                metaFields[5], metaFields[6], metaFields[7], metaFields[8]
            )
        );
    }

    // mintLandTitleNFT ฟังก์ชันสำหรับ mint NFT
    function mintLandTitleNFT(
        address wallet,
        bytes32 hashMetadata,
        bytes32 dataHash,
        string[9] calldata metaFields,
        bytes calldata signature
    ) external whenNotPaused returns (uint256) {
        require(msg.sender == wallet, "not wallet");
        require(!usedDataHash[dataHash], "dataHash used");

        // รวม metadata เป็น string เดียว
        string memory metaConcat = _concatMeta(metaFields);

        // ตรวจสอบ hashMetadata ว่าตรงกับ metaFields จริง
        bytes32 calcHashMetadata = keccak256(abi.encodePacked(metaConcat));
        require(calcHashMetadata == hashMetadata, "hashMetadata mismatch");

        // ตรวจสอบ dataHash ว่าตรงกับ wallet, metaFields, hashMetadata จริง
        bytes32 calcDataHash = keccak256(abi.encodePacked(wallet, metaConcat, hashMetadata));
        require(calcDataHash == dataHash, "dataHash mismatch");

        // ตรวจสอบลายเซ็น
        bytes32 ethHash = _toEthSignedMessageHash(dataHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "invalid signer");

        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;
        usedDataHash[dataHash] = true;
        dataHashes[tokenId] = dataHash;
        hashMetadatas[tokenId] = hashMetadata;
        _safeMint(wallet, tokenId);
        for (uint256 i = 0; i < 9; i++) {
            _landMetadata[tokenId][i] = metaFields[i];
        }
        _ownershipHistory[tokenId].push(wallet);
        return tokenId;
    }

    // คืน metadata, price, buyer
    function getLandMetadata(uint256 tokenId) external view returns (
        string[9] memory metaFields,
        uint256 price,
        address buyer
    ) {
        metaFields = _landMetadata[tokenId];
        SaleInfo memory info = saleInfos[tokenId];
        price = info.price;
        buyer = info.buyer;
    }

    function getDataHash(uint256 tokenId) external view returns (bytes32) {
        return dataHashes[tokenId];
    }
    function getHashMetadata(uint256 tokenId) external view returns (bytes32) {
        return hashMetadatas[tokenId];
    }
    function transferOwnership(address to, uint256 tokenId) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        _transfer(msg.sender, to, tokenId);
        _ownershipHistory[tokenId].push(to);
    }
    function getOwnershipHistory(uint256 tokenId) external view returns (address[] memory) {
        return _ownershipHistory[tokenId];
    }
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
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(owners[buyer].wallet == buyer, "buyer not registered");
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, price, buyer));
        bytes32 ethHash = _toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "invalid signature");
        saleInfos[tokenId] = SaleInfo({price: price, buyer: buyer});
    }
    function buyLandTitle(uint256 tokenId) external payable whenNotPaused {
        SaleInfo memory info = saleInfos[tokenId];
        require(info.price > 0, "not for sale");
        require(info.buyer == msg.sender, "not authorized buyer");
        require(msg.value == info.price, "incorrect ETH amount");
        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        _ownershipHistory[tokenId].push(msg.sender);
        (bool sent, ) = seller.call{value: msg.value}("");
        require(sent, "ETH transfer failed");
        delete saleInfos[tokenId];
    }
}