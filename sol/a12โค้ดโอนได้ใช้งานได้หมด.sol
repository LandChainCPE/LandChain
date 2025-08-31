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

    struct LandMetadata {
        string landPosition;
        string landNumber;
        string surveyPage;
        string tambon;
        string deedNumber;
        string book;
        string page;
        string amphoe;
        string province;
    }

    struct OwnerInfo {
        address wallet;
        bytes32 nameHash;
    }

    mapping(uint256 => LandMetadata) private _landTitleMetadata;
    mapping(bytes32 => bool) private usedLandHash;
    mapping(address => OwnerInfo) public owners;
    mapping(bytes32 => bool) public usedNameHash;
    address private trustedSigner;
    uint256 private _tokenIdTracker;

    // สำหรับประวัติการถือครอง
    mapping(uint256 => address[]) private _ownershipHistory;

    constructor(address signer) ERC721("LandTitleNFT", "LTNFT") Ownable(msg.sender) {
        trustedSigner = signer;
    }

    function setTrustedSigner(address signer) external onlyOwner {
        trustedSigner = signer;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _toEthSignedMessageHash(bytes32 hash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    // ฟังก์ชัน registerOwner
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

    function mintLandTitleNFT(
        address wallet,
        string[] calldata metaFields,
        bytes calldata signature
    ) external whenNotPaused returns (uint256) {
        require(msg.sender == wallet, "");
        require(metaFields.length == 9, "");

        LandMetadata memory meta = LandMetadata(
            metaFields[0], metaFields[1], metaFields[2], metaFields[3], metaFields[4],
            metaFields[5], metaFields[6], metaFields[7], metaFields[8]
        );

        bytes32 landHash = keccak256(abi.encodePacked(
            wallet,
            meta.landPosition,
            meta.landNumber,
            meta.surveyPage,
            meta.tambon,
            meta.deedNumber,
            meta.book,
            meta.page,
            meta.amphoe,
            meta.province
        ));
        require(!usedLandHash[landHash], "");

        bytes32 ethHash = _toEthSignedMessageHash(landHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "");

        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;
        _landTitleMetadata[tokenId] = meta;
        usedLandHash[landHash] = true;

        _safeMint(wallet, tokenId);
        _ownershipHistory[tokenId].push(wallet);
        return tokenId;
    }

    function getLandMetadata(uint256 tokenId) public view returns (LandMetadata memory) {
        return _landTitleMetadata[tokenId];
    }

    // ใช้ try/catch ownerOf แทน _exists
    function getLandTitleInfoByWallet(address wallet) external view returns (string memory) {
        string memory result = "[";
        bool first = true;
        for (uint256 i = 0; i < _tokenIdTracker; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == wallet) {
                    if (!first) {
                        result = string(abi.encodePacked(result, ","));
                    }
                    result = string(
                        abi.encodePacked(
                            result,
                            '{"tokenId":', i.toString(), '}'
                        )
                    );
                    first = false;
                }
            } catch {
                // tokenId นี้ไม่มีอยู่ ข้ามไป
            }
        }
        result = string(abi.encodePacked(result, "]"));
        return result;
    }

    function transferOwnership(address to, uint256 tokenId) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "");
        _transfer(msg.sender, to, tokenId);
        _ownershipHistory[tokenId].push(to);
    }

    function getOwnershipHistory(uint256 tokenId) external view returns (address[] memory) {
        return _ownershipHistory[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "");
        LandMetadata memory meta = _landTitleMetadata[tokenId];

        string memory json = string(abi.encodePacked(
            '{',
                '"name":"Land Title #', tokenId.toString(), '",',
                '"description":"Land title NFT",',
                '"attributes":[',
                    '{"trait_type":"landPosition","value":"', meta.landPosition, '"},',
                    '{"trait_type":"landNumber","value":"', meta.landNumber, '"},',
                    '{"trait_type":"surveyPage","value":"', meta.surveyPage, '"},',
                    '{"trait_type":"tambon","value":"', meta.tambon, '"},',
                    '{"trait_type":"deedNumber","value":"', meta.deedNumber, '"},',
                    '{"trait_type":"book","value":"', meta.book, '"},',
                    '{"trait_type":"page","value":"', meta.page, '"},',
                    '{"trait_type":"amphoe","value":"', meta.amphoe, '"},',
                    '{"trait_type":"province","value":"', meta.province, '"}',
                ']',
            '}'
        ));

        string memory encodedJson = Base64.encode(bytes(json));
        return string(abi.encodePacked("data:application/json;base64,", encodedJson));
    }
}