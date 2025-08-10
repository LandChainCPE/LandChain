// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * ใช้กับ OpenZeppelin v4.9.5
 * - ERC721URIStorage: เก็บ tokenURI รายโทเคน
 * - ERC721Pausable: pause แล้วหยุด transfer/mint/burn ได้
 * - Ownable: จำกัดสิทธิ์เฉพาะ owner
 */

import "@openzeppelin/contracts@4.9.5/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.5/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts@4.9.5/access/Ownable.sol";

contract DigitalLandTitle is ERC721URIStorage, ERC721Pausable, Ownable {
    uint256 private _tokenIdTracker;
    string private _baseTokenURI;
    string public contractURI;
    bool public metadataFrozen;

    event LandMinted(address indexed to, uint256 indexed tokenId, string tokenURI_);
    event BaseURISet(string newBaseURI);
    event ContractURISet(string newContractURI);
    event MetadataFrozen();

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_,
        string memory contractURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseTokenURI_;
        contractURI = contractURI_;
    }

    // ----------------- Admin -----------------

    function pause() external onlyOwner { _pause(); }

    function unpause() external onlyOwner { _unpause(); }

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

    function mintLand(address to, string calldata tokenURI_)
        external
        onlyOwner
        whenNotPaused
        returns (uint256)
    {
        uint256 tokenId = _tokenIdTracker;
        _tokenIdTracker += 1;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit LandMinted(to, tokenId, tokenURI_);
        return tokenId;
    }

    function batchMintLand(address[] calldata toList, string[] calldata uriList)
        external
        onlyOwner
        whenNotPaused
    {
        require(toList.length == uriList.length, "Length mismatch");
        for (uint256 i = 0; i < toList.length; i++) {
            uint256 tokenId = _tokenIdTracker;
            _tokenIdTracker += 1;

            _safeMint(toList[i], tokenId);
            _setTokenURI(tokenId, uriList[i]);

            emit LandMinted(toList[i], tokenId, uriList[i]);
        }
    }

    function burn(uint256 tokenId) external whenNotPaused {
        require(_isApprovedOrOwnerCustom(msg.sender, tokenId), "Not owner or approved");
        _burn(tokenId);
    }

    // ----------------- Internal / Overrides -----------------

    function _isApprovedOrOwnerCustom(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (
            spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender)
        );
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
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
