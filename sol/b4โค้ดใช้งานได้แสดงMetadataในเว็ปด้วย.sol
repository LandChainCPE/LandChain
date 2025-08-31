// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract LandTitleNFT is ERC721, Ownable, Pausable {
    using ECDSA for bytes32;
    using Strings for uint256;

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
        require(signerAddress == trustedSigner);
        require(msg.sender == wallet);
        require(!usedNameHash[nameHash]);
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
        require(msg.sender == wallet);
        require(!usedDataHash[dataHash]);

        // รวม metadata เป็น string เดียว
        string memory metaConcat = _concatMeta(metaFields);

        // ตรวจสอบ hashMetadata ว่าตรงกับ metaFields จริง
        bytes32 calcHashMetadata = keccak256(abi.encodePacked(metaConcat));
        require(calcHashMetadata == hashMetadata);

        // ตรวจสอบ dataHash ว่าตรงกับ wallet, metaFields, hashMetadata จริง
        bytes32 calcDataHash = keccak256(abi.encodePacked(wallet, metaConcat, hashMetadata));
        require(calcDataHash == dataHash);

        // ตรวจสอบลายเซ็น
        bytes32 ethHash = _toEthSignedMessageHash(dataHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner);

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
        require(ownerOf(tokenId) == msg.sender);
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
        require(ownerOf(tokenId) == msg.sender);
        require(owners[buyer].wallet == buyer);
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, price, buyer));
        bytes32 ethHash = _toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner);
        saleInfos[tokenId] = SaleInfo({price: price, buyer: buyer});
    }
    function buyLandTitle(uint256 tokenId) external payable whenNotPaused {
        SaleInfo memory info = saleInfos[tokenId];
        require(info.price > 0);
        require(info.buyer == msg.sender);
        require(msg.value == info.price);
        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        _ownershipHistory[tokenId].push(msg.sender);
        (bool sent, ) = seller.call{value: msg.value}("");
        require(sent);
        delete saleInfos[tokenId];
    }

    // ERC721 Metadata: tokenURI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0));
        string[9] memory meta = _landMetadata[tokenId];

        string memory json = string(abi.encodePacked(
            '{',
                '"name":"Land Title #', tokenId.toString(), '",',
                '"description":"Land title NFT",',
                '"attributes":[',
                    '{"trait_type":"Land Position","value":"', meta[0], '"},',
                    '{"trait_type":"Land Number","value":"', meta[1], '"},',
                    '{"trait_type":"Survey Page","value":"', meta[2], '"},',
                    '{"trait_type":"Tambon","value":"', meta[3], '"},',
                    '{"trait_type":"Deed Number","value":"', meta[4], '"},',
                    '{"trait_type":"Book","value":"', meta[5], '"},',
                    '{"trait_type":"Page","value":"', meta[6], '"},',
                    '{"trait_type":"Amphoe","value":"', meta[7], '"},',
                    '{"trait_type":"Province","value":"', meta[8], '"}',
                ']',
            '}'
        ));

        string memory base64Json = Base64.encode(bytes(json));
        return string(abi.encodePacked("data:application/json;base64,", base64Json));
    }
}