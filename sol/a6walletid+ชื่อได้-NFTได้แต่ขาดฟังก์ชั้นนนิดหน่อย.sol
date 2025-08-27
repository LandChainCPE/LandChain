// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract LandTitleNFT is ERC721Enumerable, Ownable, Pausable {
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

    event LandMinted(address indexed wallet, uint256 indexed tokenId, LandMetadata metadata);
    event OwnerRegistered(address indexed wallet, bytes32 nameHash);

    constructor(address signer) ERC721("LandTitleNFT", "LTNFT") Ownable(msg.sender) {
        trustedSigner = signer;
    }

    function setTrustedSigner(address signer) external onlyOwner {
        trustedSigner = signer;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _toEthSignedMessageHash(bytes32 hash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    // registerOwner แบบเดียวกับ a5
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
        string[] calldata metaFields, // metaFields[0]=landPosition, [1]=landNumber, ...
        bytes calldata signature
    ) external whenNotPaused returns (uint256) {
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

        _safeMint(wallet, tokenId);
        emit LandMinted(wallet, tokenId, meta);
        return tokenId;
    }

    function getLandMetadata(uint256 tokenId) external view returns (LandMetadata memory) {
        return _landTitleMetadata[tokenId];
    }

    function isLandHashUsed(bytes32 landHash) external view returns (bool) {
        return usedLandHash[landHash];
    }

    function totalSupply() public view override returns (uint256) {
        return _tokenIdTracker;
    }
}