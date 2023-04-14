
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BAYC is ERC721 {
    string baseUri = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";

    constructor() ERC721("BoredApeYachtClub", "BAYC") {}

    function mint(address recipient, uint id) public {
        _safeMint(recipient, id);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    function setBaseUri(string memory url) public {
        baseUri = url;
    }
}
