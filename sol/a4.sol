
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract DigitalLandTitle is ERC721Pausable, Ownable {
    address public trustedSigner = 0x41BCeA94aa1FeE61cC57B2C366D0eAee67A5584a;
    uint256 private _tokenIdTracker;

    mapping(uint256 => string) private _landTitleMetadata;
    mapping(bytes32 => bool) public usedLandHash;
    mapping(uint256 => address[]) public ownershipHistory;

    struct Owner {
        address wallet;
        string nameHash;
    }
    mapping(address => Owner) public owners;

    event LandMinted(address indexed to, uint256 indexed tokenId, string metadata);
    event OwnerRegistered(address indexed wallet, string nameHash);
    event OwnershipTransferred(address indexed from, address indexed to, uint256 tokenId);

    constructor() ERC721("DigitalLandTitle", "DLT") Ownable(msg.sender) {}

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function registerOwner(address wallet, string memory nameHash) public onlyOwner {
        owners[wallet] = Owner(wallet, nameHash);
        emit OwnerRegistered(wallet, nameHash);
    }

    /// @dev helper: จำลองการทำงานของ ECDSA.toEthSignedMessageHash (สำหรับ OZ เวอร์ชันเก่า)
    function _toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function mintLandTitleNFT(
        address wallet,
        string calldata metadata,
        bytes calldata signature
    ) external whenNotPaused returns (uint256) {
        require(msg.sender == wallet, "Sender must be wallet owner");

        bytes32 metadataHash = keccak256(bytes(metadata));
        bytes32 landHash = keccak256(abi.encodePacked(wallet, metadataHash));
        require(!usedLandHash[landHash], "Duplicate land data");

        // ✅ ใช้ helper function ของเราแทน OZ.toEthSignedMessageHash
        bytes32 ethHash = _toEthSignedMessageHash(landHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "Invalid signature");

        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;
        _safeMint(wallet, tokenId);
        _landTitleMetadata[tokenId] = metadata;
        usedLandHash[landHash] = true;
        ownershipHistory[tokenId].push(wallet);

        emit LandMinted(wallet, tokenId, metadata);
        return tokenId;
    }

    function getOwnerInfo(address wallet) external view returns (string memory nameHash) {
        return owners[wallet].nameHash;
    }

    function getLandTitleMetadata(uint256 tokenId) external view returns (string memory) {
        require(exists(tokenId), "Invalid tokenId");
        return _landTitleMetadata[tokenId];
    }

    function getLandTitleInfoByWallet(address wallet) external view returns (uint256[] memory, string[] memory) {
        uint256 balance = balanceOf(wallet);
        uint256[] memory tokenIds = new uint256[](balance);
        string[] memory metadatas = new string[](balance);
        uint256 idx = 0;
        for (uint256 i = 0; i < _tokenIdTracker; i++) {
            if (exists(i) && ownerOf(i) == wallet) {
                tokenIds[idx] = i;
                metadatas[idx] = _landTitleMetadata[i];
                idx++;
            }
        }
        return (tokenIds, metadatas);
    }

    function transferOwnership(address to, uint256 tokenId) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _transfer(msg.sender, to, tokenId);
        emit OwnershipTransferred(msg.sender, to, tokenId);
    }

    function getOwnershipHistory(uint256 tokenId) public view returns (address[] memory) {
        return ownershipHistory[tokenId];
    }

    // ✅ exists() เขียนเองแทน _exists() (รองรับ OZ เวอร์ชันเก่า/ใหม่)
    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // ✅ override _update เพื่อบันทึกประวัติการถือครอง
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0)) {
            ownershipHistory[tokenId].push(to);
        }
        return from;
    }
}
