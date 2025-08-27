// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.5/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.9.5/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts@4.9.5/access/Ownable.sol";
import "@openzeppelin/contracts@4.9.5/utils/cryptography/ECDSA.sol";

contract DigitalLandTitle is ERC721, ERC721Pausable, Ownable {
    using ECDSA for bytes32;

    // Public Key ของระบบที่ใช้เซ็นข้อมูล
    address public trustedSigner;

    uint256 private _tokenIdTracker;

    // เก็บ hash ของโฉนดแบบสตริงล้วน ๆ (ไม่ใช่ URL)
    mapping(uint256 => string) private _landTitleHash;

    // ประวัติการถือครอง (ลำดับที่โอนไป)
    mapping(uint256 => address[]) public ownershipHistory;

    // ข้อมูลเจ้าของที่ลงทะเบียน
    struct Owner {
        address wallet;
        string nameHash;
    }
    mapping(address => Owner) public owners;

    // ใช้ตอบกลับใน getLandTitleInfoByWallet
    struct LandTitleInfo {
        uint256 tokenId;
        string landTitleHash;
    }

    // ---------- Events ----------
    event LandMinted(
        address indexed to,
        uint256 indexed tokenId,
        string landTitleHash
    );
    event OwnerRegistered(address indexed wallet, string nameHash);
    event OwnershipTransferred(
        address indexed from,
        address indexed to,
        uint256 tokenId
    );

    // ---------- Init ----------
    // แก้ไข Constructor เพื่อรับ trustedSigner address
    constructor(address _trustedSigner) ERC721("DigitalLandTitle", "DLT") {
        trustedSigner = _trustedSigner;
    }

    // ---------- Admin ----------
    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }

    // --- ฟังก์ชันที่ปรับแก้แล้วสำหรับแบบที่ 1 (WalletID + Hash(ชื่อผู้ใช้)) ---
    function registerOwner(
        address wallet,
        string memory nameHash,
        bytes memory signature
    ) external whenNotPaused {
        // 1. สร้าง Hash ที่ต้องการเซ็น (message hash)
        bytes32 messageHash = keccak256(abi.encodePacked(wallet, nameHash));
        
        // 2. กู้คืน Public Key จากลายเซ็น
        address signerAddress = messageHash.toEthSignedMessageHash().recover(signature);

        // 3. ตรวจสอบว่าผู้เซ็นคือระบบที่เชื่อถือได้
        require(signerAddress == trustedSigner, "Invalid signer");
        
        // 4. ตรวจสอบว่าผู้ทำธุรกรรมคือ Wallet ที่ต้องการลงทะเบียนจริง ๆ
        require(msg.sender == wallet, "Sender must be the owner of the wallet");
        
        owners[wallet] = Owner(wallet, nameHash);
        emit OwnerRegistered(wallet, nameHash);
    }

    // --- ฟังก์ชันที่ปรับแก้แล้วสำหรับแบบที่ 2 (NFT โฉนดที่ดิน) ---
    /// @notice สร้าง NFT โฉนดที่ดิน โดยเก็บ landTitleHash เป็นสตริงล้วน และคืน tokenId
    /// @dev เพิ่มการตรวจสอบลายเซ็น
    function mintLandTitleNFT(
        address to,
        string calldata landTitleHash,
        bytes memory signature
    ) external whenNotPaused returns (uint256) {
        // 1. สร้าง Hash ที่ต้องการเซ็น
        bytes32 messageHash = keccak256(abi.encodePacked(to, landTitleHash));
        
        // 2. กู้คืน Public Key จากลายเซ็น
        address signerAddress = messageHash.toEthSignedMessageHash().recover(signature);

        // 3. ตรวจสอบว่าผู้เซ็นคือระบบที่เชื่อถือได้
        require(signerAddress == trustedSigner, "Invalid signer");
        
        // 4. ตรวจสอบว่าผู้ทำธุรกรรมคือ Wallet ที่จะได้รับ NFT
        require(msg.sender == to, "Sender must be the recipient");

        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;

        _safeMint(to, tokenId);

        // เก็บ hash (ไม่ใช่ URL)
        _landTitleHash[tokenId] = landTitleHash;

        // บันทึกประวัติเจ้าของเริ่มต้น (mint จาก address(0))
        ownershipHistory[tokenId].push(to);

        emit LandMinted(to, tokenId, landTitleHash);
        return tokenId;
    }

    // ---------- Core Functions (No changes needed) ----------
    /// @notice ดู nameHash ที่ลงทะเบียนของกระเป๋า
    function getOwnerInfo(
        address wallet
    ) external view returns (string memory nameHash) {
        return owners[wallet].nameHash;
    }

    /// @notice ดู landTitleHash รายโทเคน
    function getLandTitleHash(
        uint256 tokenId
    ) external view returns (string memory) {
        require(_exists(tokenId), "Invalid tokenId");
        return _landTitleHash[tokenId];
    }

    /// @notice ดึงรายการ NFT ทั้งหมดที่ wallet ถือครอง พร้อม hash แบบล้วน ๆ
    /// @return รายการในรูป LandTitleInfo[] = { tokenId, landTitleHash }
    function getLandTitleInfoByWallet(
        address wallet
    ) external view returns (string memory) {
        string memory result = "[";
        bool first = true;
        // ไล่ดูทุก token ที่เคยออก (O(totalSupply)) — เหมาะกับการเรียกแบบ off-chain
        for (uint256 i = 0; i < _tokenIdTracker; i++) {
            if (!_exists(i)) continue;
            // เผื่ออนาคตมี burn
            if (ownerOf(i) == wallet) {
                if (!first) {
                    result = string(abi.encodePacked(result, ","));
                }
                result = string(
                    abi.encodePacked(
                        result,
                        "{\"tokenId\":",
                        uint2str(i),
                        ",\"landTitleHash\":\"" ,
                        _landTitleHash[i],
                        "\"}"
                    )
                );
                first = false;
            }
        }
        result = string(abi.encodePacked(result, "]"));
        return result;
    }

    /// @notice โอน NFT (ตั้งชื่อฟังก์ชันตามเดิมเพื่อความคุ้นเคย)
    /// @dev ไม่บันทึกประวัติซ้ำที่นี่ เพราะจะบันทึกใน _beforeTokenTransfer อยู่แล้ว
    function transferOwnership(
        address to,
        uint256 tokenId
    ) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _transfer(msg.sender, to, tokenId);
        emit OwnershipTransferred(msg.sender, to, tokenId);
    }

    /// @notice ดูประวัติการถือครองตามลำดับเวลา
    function getOwnershipHistory(
        uint256 tokenId
    ) public view returns (address[] memory) {
        return ownershipHistory[tokenId];
    }

    // ---------- Internal / Overrides ----------
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        // บันทึกเฉพาะเหตุการณ์ "โอน" (ไม่ใช่ mint จาก address(0))
        if (from != address(0)) {
            ownershipHistory[tokenId].push(to);
        }
    }

    // Helper function to convert uint256 to string
    function uint2str(
        uint256 _i
    ) internal pure returns (string memory _uintAsString) {
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
}