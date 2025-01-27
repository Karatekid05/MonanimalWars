// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MonavaraNFT is ERC721, Ownable(msg.sender) {
    uint256 private _tokenIds;
    address public monWarsContract;
    string public baseTokenURI;

    // Mapping to track if a player has already minted
    mapping(address => bool) public hasMinted;

    constructor(
        string memory _baseTokenURI
    ) ERC721("Legendary Monavara", "MVARA") {
        baseTokenURI = _baseTokenURI;
    }

    function setMonWarsContract(address _monWarsContract) external onlyOwner {
        monWarsContract = _monWarsContract;
    }

    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function mint(address player) external returns (uint256) {
        require(
            msg.sender == monWarsContract,
            "Only MonWars contract can mint"
        );
        require(!hasMinted[player], "Player already has a Monavara NFT");

        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;
        _safeMint(player, newTokenId);
        hasMinted[player] = true;

        return newTokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert("URI query for nonexistent token");
        }
        // Always return the same metadata URL for all tokens
        return string.concat(baseTokenURI, "1.json");
    }
}
