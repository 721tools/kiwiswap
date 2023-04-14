
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract BAYC is ERC721, ERC721Burnable {
    string baseUri = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";

    constructor() ERC721("BoredApeYachtClub", "BAYC") {}

    function mint(address recipient, uint id) public {
        _safeMint(recipient, id);
    }

    function l1Address() public pure returns(address) {
        return 0xA3A8e3d3ea74E92dCA6Cdd8210caBc3c3bEDd3D5;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    function setBaseUri(string memory url) public {
        baseUri = url;
    }
}
