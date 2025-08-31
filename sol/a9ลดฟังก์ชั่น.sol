// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract LandTitleNFT is ERC721Enumerable, Ownable {
    using ECDSA for bytes32;

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

    struct Owner {
        address wallet;
        bytes32 nameHash;
    }

    mapping(uint256 => LandMetadata) private _landTitleMetadata;
    mapping(bytes32 => bool) private usedLandHash;
    mapping(uint256 => address[]) public ownershipHistory;
    mapping(address => Owner) public owners;
    mapping(bytes32 => bool) public usedNameHash;
    address private trustedSigner;
    uint256 private _tokenIdTracker;
    mapping(uint256 => bytes32) private _landTitleHash;

    event LandMinted(address indexed wallet, uint256 indexed tokenId, LandMetadata metadata);
    event OwnerRegistered(address indexed wallet, bytes32 nameHash);
    event OwnershipTransferred(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor(address signer) ERC721("LandTitleNFT", "LTNFT") Ownable(msg.sender) {
        trustedSigner = signer;
    }

    function _toEthSignedMessageHash(bytes32 hash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function registerOwner(address wallet, bytes32 nameHash, bytes calldata signature) external {
        bytes32 messageHash = keccak256(abi.encodePacked(wallet, nameHash));
        bytes32 ethHash = _toEthSignedMessageHash(messageHash);
        address signerAddress = ECDSA.recover(ethHash, signature);
        require(signerAddress == trustedSigner, "Invalid signature");
        require(msg.sender == wallet, "Sender mismatch");
        require(!usedNameHash[nameHash], "Duplicate nameHash");
        owners[wallet] = Owner({wallet: wallet, nameHash: nameHash});
        usedNameHash[nameHash] = true;
        emit OwnerRegistered(wallet, nameHash);
    }

    function getOwnerInfo(address wallet) external view returns (bytes32) {
        return owners[wallet].nameHash;
    }

    function mintLandTitleNFT(
        address wallet,
        string[] calldata metaFields,
        bytes calldata signature
    ) external returns (uint256) {
        require(msg.sender == wallet, "Sender must be wallet owner");
        require(metaFields.length == 9, "Invalid metadata fields");

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
        require(!usedLandHash[landHash], "Duplicate land data");

        bytes32 ethHash = _toEthSignedMessageHash(landHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "Invalid signature");

        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;
        _landTitleMetadata[tokenId] = meta;
        usedLandHash[landHash] = true;
        ownershipHistory[tokenId].push(wallet);
        _landTitleHash[tokenId] = landHash;

        _safeMint(wallet, tokenId);
        emit LandMinted(wallet, tokenId, meta);
        return tokenId;
    }

    function getLandMetadata(uint256 tokenId) external view returns (LandMetadata memory) {
        return _landTitleMetadata[tokenId];
    }

    // ใช้ try/catch ownerOf เพื่อตรวจสอบ tokenExists
    function tokenExists(uint256 tokenId) public view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    // คืนข้อมูล tokenId และ landTitleHash ทั้งหมดที่ wallet นี้ถืออยู่ (JSON-like)
    function getLandTitleInfoByWallet(address wallet) external view returns (string memory) {
        string memory result = "";
        bool first = true;
        for (uint256 i = 0; i < _tokenIdTracker; i++) {
            if (!tokenExists(i)) continue;
            if (ownerOf(i) == wallet) {
                if (!first) {
                    result = string(abi.encodePacked(result, ", "));
                }
                result = string(
                    abi.encodePacked(
                        result,
                        "{",
                        "\"tokenId\":", uint2str(i), ",",
                        "\"landTitleHash\":\"", toHexString(_landTitleHash[i]), "\"",
                        "}"
                    )
                );
                first = false;
            }
        }
        return result;
    }

    function transferOwnership(address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _transfer(msg.sender, to, tokenId);
        ownershipHistory[tokenId].push(to);
        emit OwnershipTransferred(msg.sender, to, tokenId);
    }

    function getOwnershipHistory(uint256 tokenId) external view returns (address[] memory) {
        return ownershipHistory[tokenId];
    }

    // --------- Utilities ---------
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        return string(bstr);
    }

    function toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(data[i] >> 4)];
            str[1+i*2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}