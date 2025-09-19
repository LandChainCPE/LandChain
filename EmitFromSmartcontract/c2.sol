// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LandTitleNFT is ERC721 {
    using ECDSA for bytes32;
    using Strings for uint256;

    struct OwnerInfo { address wallet; bytes32 nameHash; }
    struct SaleInfo { uint256 price; address buyer; }

    mapping(address => OwnerInfo) public owners;
    mapping(bytes32 => bool) public usedNameHash;
    address private trustedSigner;
    uint256 private _tokenIdTracker;
    mapping(uint256 => SaleInfo) public saleInfos;
    mapping(uint256 => string) private _landMetadata;
    mapping(uint256 => address[]) private _ownershipHistory;

    // เพิ่ม Event สำหรับการ Mint
    event LandMinted(uint256 indexed tokenId, address indexed owner, string metaFields);
    // เพิ่ม Event สำหรับการ Register Owner
    event OwnerRegistered(address indexed wallet, bytes32 indexed nameHash);
    // Event สำหรับการตั้งขาย
    event SaleInfoSet(uint256 indexed tokenId, uint256 price, address indexed buyer, address indexed owner);
    // Event สำหรับการซื้อ
    event LandTitleBought(uint256 indexed tokenId, address indexed seller, address indexed buyer);

    constructor(address signer) ERC721("LandTitleNFT", "LTNFT") {
        trustedSigner = signer;
    }

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
        // Emit Event หลัง Register Owner
        emit OwnerRegistered(wallet, nameHash);
    }

    function getOwnerInfo(address wallet) external view returns (bytes32) {
        return owners[wallet].nameHash;
    }

    function mintLandTitleNFT(
        address wallet,
        string calldata metaFields,
        bytes calldata signature
    ) external returns (uint256) {
        require(msg.sender == wallet, "not wallet");
        bytes32 metaHash = keccak256(abi.encodePacked(metaFields));
        require(!usedNameHash[metaHash], "metadata used");

        bytes32 messageHash = keccak256(abi.encodePacked(wallet, metaFields));
        bytes32 ethHash = _toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "invalid signer");

        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;
        usedNameHash[metaHash] = true;
        _safeMint(wallet, tokenId);
        _landMetadata[tokenId] = metaFields;
        _ownershipHistory[tokenId].push(wallet);

        // Emit Event หลัง Mint
        emit LandMinted(tokenId, wallet, metaFields);

        return tokenId;
    }

    function getLandMetadata(uint256 tokenId) external view returns (
        string memory metaFields,
        uint256 price,
        address buyer,
        address walletID
    ) {
        metaFields = _landMetadata[tokenId];
        SaleInfo memory info = saleInfos[tokenId];
        price = info.price;
        buyer = info.buyer;
        walletID = ownerOf(tokenId);
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
    ) external {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(owners[buyer].wallet == buyer, "buyer not registered");
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, price, buyer));
        bytes32 ethHash = _toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethHash, signature);
        require(signer == trustedSigner, "invalid signature");
    saleInfos[tokenId] = SaleInfo({price: price, buyer: buyer});
    // Emit Event หลังตั้งขาย
    emit SaleInfoSet(tokenId, price, buyer, msg.sender);
    }

    function buyLandTitle(uint256 tokenId) external payable {
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
    // Emit Event หลังซื้อ
    emit LandTitleBought(tokenId, seller, msg.sender);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0));
        string memory summary = _landMetadata[tokenId];
        string memory imageUrl = "https://amethyst-giant-warbler-920.mypinata.cloud/ipfs/bafybeigoemqyh7dvkhlxt6zwy4jnpkcfvmoci6ymwkliblvcovvnuxnbyy";
        string memory json = string(abi.encodePacked(
            '{',
                '"name":"Land Title #', tokenId.toString(), '",',
                '"description":"', summary, '",',
                '"image":"', imageUrl, '"',
            '}'
        ));
        return string(abi.encodePacked("data:application/json;utf8,", json));
    }
}
