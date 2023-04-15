// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "seaport/contracts/interfaces/SeaportInterface.sol";
import "./interfaces/IERC721.sol";
import "./lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


contract L2Receiver is NonblockingLzApp {
    address public constant SENDER = 0xDeB7540Ae5d0F724a8f0ab6cac49F73a3DebA2f3;
    address public constant L2BAYC = 0xDeB7540Ae5d0F724a8f0ab6cac49F73a3DebA2f3;
    uint256 dstChainId;

    // constructor requires the LayerZero endpoint for this chain
    constructor(
        address _endpoint,
        uint16 _dstChainId
    ) NonblockingLzApp(_endpoint) {
        dstChainId = _dstChainId;
    }

    function receiver(
        address fromAddress,
        address l1ContractAddress,
        uint256 l1TokenId,
        address destAddress
    ) public {
        //TODO
        //only support bayc for now
    }

    // reciv
    function _nonblockingLzReceive(
        uint16,
        bytes memory,
        uint64 /*_nonce*/,
        bytes memory _payload
    ) internal override {
        (address contract_address, uint256 token_id, address owner) = abi
            .decode(_payload, (address, uint256, address));
        // logging
        emit Trans(contract_address, token_id, owner);
        IERC721Mintable(L2BAYC).mint(owner, token_id);
    }

    // ----  Help funcitons start -----
    receive() external payable {}

    function onERC721Received(
        address,
        address,
        uint,
        bytes memory
    ) public virtual returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // function sender(uint256 l1TokenId) public {

    //     IERC721Mintable(L2BAYC).safeTransferFrom(msg.sender, balance(this), l1TokenId);
    //     IERC721Mintable(L2BAYC).burn(l1TokenId);

    //     //send
    // }
}
