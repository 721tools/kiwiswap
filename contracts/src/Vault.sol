// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


contract Kiwiswap is Ownable {


    function withdraw() public {

    }

    function onERC721Received(
        address,
        address,
        uint,
        bytes memory
    ) public virtual returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

}