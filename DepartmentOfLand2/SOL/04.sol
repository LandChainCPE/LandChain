// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.5/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.5/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts@4.9.5/access/Ownable.sol";

contract DigitalLandTitle is ERC721URIStorage, ERC721Pausable, Ownable {
    uint256 private _tokenIdTracker;
    string private _baseTokenURI;
    string public contractURI;
    bool public metadataFrozen;

    // Mapping to store ownership history
    mapping(uint256 => address[]) public ownershipHistory;

    // Struct to store owner information
    struct Owner {
        address wallet;
        string nameHash;
    }

    // Mapping to store registered owners
    mapping(address => Owner) public owners;

    event LandMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI_
    );
    event BaseURISet(string newBaseURI);
    event ContractURISet(string newContractURI);
    event MetadataFrozen();
    event OwnerRegistered(address indexed wallet, string nameHash);
    event OwnershipTransferred(
        address indexed from,
        address indexed to,
        uint256 tokenId
    );

    constructor() ERC721("DigitalLandTitle", "DLT") {
        _baseTokenURI = "https://example.com/api/token/"; // กำหนด base URL ของ TokenURI
        contractURI = "https://example.com/contract"; // กำหนด URL ของ Smart Contract
    }

    // ----------------- Admin -----------------

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        require(!metadataFrozen, "Metadata frozen");
        _baseTokenURI = newBaseURI;
        emit BaseURISet(newBaseURI);
    }

    function setContractURI(string calldata newContractURI) external onlyOwner {
        require(!metadataFrozen, "Metadata frozen");
        contractURI = newContractURI;
        emit ContractURISet(newContractURI);
    }

    function freezeMetadata() external onlyOwner {
        metadataFrozen = true;
        emit MetadataFrozen();
    }

    // ----------------- Core -----------------

    // ฟังก์ชันลงทะเบียนเจ้าของ
    function registerOwner(
        address wallet,
        string memory nameHash
    ) public onlyOwner {
        owners[wallet] = Owner(wallet, nameHash); // เก็บข้อมูลเจ้าของในระบบ
        emit OwnerRegistered(wallet, nameHash);
    }

    // ฟังก์ชัน mint NFT
    function mintLandTitleNFT(
        address to,
        string calldata landTitleHash
    ) external onlyOwner whenNotPaused returns (uint256) {
        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;

        _safeMint(to, tokenId);

        string memory tokenURI_ = string(
            abi.encodePacked(_baseTokenURI, landTitleHash)
        );
        _setTokenURI(tokenId, tokenURI_);

        recordOwnership(tokenId, to);

        emit LandMinted(to, tokenId, tokenURI_);
        return tokenId; // ส่งกลับ TokenID หลัง mint สำเร็จ
    }

    // ฟังก์ชันเช็คข้อมูลเจ้าของ
    function getOwnerInfo(
        address wallet
    ) external view returns (string memory nameHash) {
        return owners[wallet].nameHash; // ดึง nameHash ของเจ้าของจาก mapping
    }

    // ฟังก์ชันเช็คข้อมูลโฉนดที่ดิน
    function getLandTitleInfoByWallet(
        address wallet
    ) external view returns (uint256[] memory, string[] memory) {
        uint256[] memory ownedTokens = new uint256[](balanceOf(wallet)); // หา TokenID ของ wallet
        string[] memory tokenURIs = new string[](ownedTokens.length);

        uint256 index = 0;
        for (uint256 i = 0; i < _tokenIdTracker; i++) {
            if (ownerOf(i) == wallet) {
                ownedTokens[index] = i;
                tokenURIs[index] = tokenURI(i); // เพิ่ม tokenURI
                index++;
            }
        }

        return (ownedTokens, tokenURIs); // ส่งกลับข้อมูล NFT ทั้งหมดของ WalletID
    }

    // ฟังก์ชันโอนการเป็นเจ้าของ NFT
    function transferOwnership(
        address to,
        uint256 tokenId
    ) external whenNotPaused {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this token."
        );

        _transfer(msg.sender, to, tokenId); // โอน NFT ไปยังเจ้าของใหม่
        recordOwnership(tokenId, to); // บันทึกประวัติการโอนเจ้าของ

        emit OwnershipTransferred(msg.sender, to, tokenId);
    }

    // ฟังก์ชันบันทึกประวัติการโอนเจ้าของ
    function recordOwnership(uint256 tokenId, address newOwner) internal {
        ownershipHistory[tokenId].push(newOwner); // บันทึกเจ้าของใหม่ในประวัติ
    }

    // ฟังก์ชันเช็คประวัติการเป็นเจ้าของ
    function getOwnershipHistory(
        uint256 tokenId
    ) public view returns (address[] memory) {
        uint256 historyLength = ownershipHistory[tokenId].length;
        if (
            historyLength > 0 &&
            ownershipHistory[tokenId][historyLength - 1] == ownerOf(tokenId)
        ) {
            address[] memory filteredHistory = new address[](historyLength - 1);
            for (uint256 i = 0; i < historyLength - 1; i++) {
                filteredHistory[i] = ownershipHistory[tokenId][i];
            }
            return filteredHistory; // กรองเจ้าของซ้ำ
        }
        return ownershipHistory[tokenId]; // ถ้าไม่ซ้ำกลับข้อมูลทั้งหมด
    }

    // ----------------- Internal / Overrides -----------------

    function _isApprovedOrOwnerCustom(
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // Record ownership when the token is transferred
        if (from != address(0)) {
            // Don't record if it's a mint (from is the zero address)
            recordOwnership(tokenId, to); // Record new owner when transferred
        }
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
